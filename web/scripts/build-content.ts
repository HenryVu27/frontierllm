/**
 * build-content.ts
 *
 * Build-time markdown → manifest.json + per-file HTML chunks.
 *
 * Walks ../notes/ and ../projects/ (relative to web/), parses each .md with
 * the unified pipeline, and writes:
 *   - web/src/generated/manifest.json
 *   - web/src/generated/content/<slug>.html
 *
 * Runs via the frontierllm-content Vite plugin on buildStart and on file
 * changes in dev mode (chokidar watcher).
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import grayMatter from "gray-matter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Element, Root as HastRoot } from "hast";

import type {
  Manifest,
  ManifestEntry,
  ReadingListItem,
  Heading,
} from "../src/lib/manifest.js";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_DIR = __dirname.replace(/[\\/]scripts$/, ""); // web/
const REPO_ROOT = path.resolve(WEB_DIR, ".."); // repo root
const OUT_DIR = path.join(WEB_DIR, "src", "generated");
const CONTENT_DIR = path.join(OUT_DIR, "content");

// ---------------------------------------------------------------------------
// Sanitize schema — allowlist for rehype-sanitize
// Extends the default schema to:
//   - Allow id/class/data-* on heading elements (for anchor links)
//   - Allow aria-hidden, aria-label on anchors
//   - Allow GFM elements: table, task list, strikethrough
//   - Allow data-* and class everywhere (needed for syntax highlighting)
//   - Block script / iframe unconditionally
// ---------------------------------------------------------------------------

const sanitizeSchema = {
  ...defaultSchema,
  // Allow id attributes without the "user-content-" prefix restriction.
  // We own the source content, so we trust heading IDs from rehype-slug.
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    // Allow id + class on all elements (needed for shiki highlighted code)
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "id",
      "className",
      "style", // shiki emits inline style for CSS variable theming
      ["data*"], // data-* attributes
    ],
    // Anchors: allow href + rel + target + aria attrs
    a: [
      ...(defaultSchema.attributes?.["a"] ?? []),
      "href",
      "rel",
      "target",
      "aria-hidden",
      "aria-label",
      "tabIndex",
    ],
    // Code blocks
    code: [...(defaultSchema.attributes?.["code"] ?? []), "className"],
    pre: [...(defaultSchema.attributes?.["pre"] ?? []), "className", "tabindex"],
    span: [...(defaultSchema.attributes?.["span"] ?? []), "className", "style"],
    // Task-list checkboxes
    input: ["type", "disabled", "checked"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    // GFM task lists
    "input",
    // shiki wraps
    "figure",
    "figcaption",
    // section dividers
    "section",
    // definition lists (not GFM but occasionally used)
    "dl",
    "dt",
    "dd",
    // mark (highlight)
    "mark",
  ],
  // Never allow script or iframe regardless of what the default says
  strip: ["script", "iframe", "object", "embed"],
};

// ---------------------------------------------------------------------------
// Custom rehype plugin: wrap <pre><code> blocks in .code-block / .code-header
// ---------------------------------------------------------------------------

function rehypeCodeWrapper() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName !== "pre" ||
        !parent ||
        index === undefined ||
        index === null
      )
        return;

      const codeChild = node.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "code"
      );

      if (!codeChild) return;

      // Extract language from class name, e.g. "language-python"
      const classes = (codeChild.properties?.className as string[] | undefined) ?? [];
      const langClass = classes.find((c) => c.startsWith("language-"));
      const lang = langClass ? langClass.replace("language-", "") : "";

      // Build the wrapper structure
      const codeHeaderChildren: Element["children"] = [
        {
          type: "element",
          tagName: "span",
          properties: { className: ["code-filename"] },
          children: [{ type: "text", value: lang || "code" }],
        },
      ];

      const codeHeader: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-header"] },
        children: codeHeaderChildren,
      };

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-block"] },
        children: [codeHeader, node],
      };

      // Replace the pre node with the wrapper
      (parent.children as Element["children"])[index] = wrapper;
    });
  };
}

// ---------------------------------------------------------------------------
// Custom rehype plugin: mark external links with rel/target + data-external
// and rewrite internal repo links to app routes
// ---------------------------------------------------------------------------

function rehypeLinkTransform() {
  return () => (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href as string | undefined;
      if (!href) return;

      // Internal relative link
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        // Rewrite relative markdown links to app routes
        // e.g. "../01-pretraining/README.md" → "/notes/01-pretraining"
        // e.g. "notes/07-frontier-labs/00-orientation.md" → "/notes/07-frontier-labs/orientation"
        const rewritten = rewriteInternalLink(href);
        if (rewritten) {
          node.properties = { ...node.properties, href: rewritten };
        }
        return;
      }

      // External link: add rel + target + data attribute for icon injection
      node.properties = {
        ...node.properties,
        rel: "noopener noreferrer",
        target: "_blank",
        "data-external": "true",
      };
    });
  };
}

function rewriteInternalLink(href: string): string | null {
  // Strip anchors for now
  const [filePart] = href.split("#");
  if (!filePart) return null;

  // Normalise separators
  const normalised = filePart.replace(/\\/g, "/");

  // Match notes/**
  const notesMatch = normalised.match(/(?:\.\.\/)*notes\/([^/]+)\/README\.md/i);
  if (notesMatch?.[1]) {
    return `/notes/${notesMatch[1]}`;
  }

  // Match orientation
  if (normalised.match(/00-orientation\.md/i)) {
    return `/notes/07-frontier-labs/orientation`;
  }

  // Match projects/**
  const projMatch = normalised.match(/(?:\.\.\/)*projects\/([^/]+)\/README\.md/i);
  if (projMatch?.[1]) {
    return `/projects/${projMatch[1]}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Slug derivation
// ---------------------------------------------------------------------------

function deriveSlug(
  filePath: string,
  kind: ManifestEntry["kind"]
): string {
  if (kind === "root") return "root";
  if (kind === "orientation") return "07-frontier-labs-orientation";

  // Normalise to forward slashes and relative to repo root
  const rel = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");

  if (kind === "topic") {
    // notes/00-foundations/README.md → 00-foundations
    const m = rel.match(/^notes\/([^/]+)\/README\.md$/i);
    return m?.[1] ?? rel;
  }

  if (kind === "project") {
    // projects/01-pretrain-end-to-end/README.md → 01-pretrain-end-to-end
    const m = rel.match(/^projects\/([^/]+)\/README\.md$/i);
    return m?.[1] ?? rel;
  }

  return rel;
}

// ---------------------------------------------------------------------------
// Stable reading-list item ID
// ---------------------------------------------------------------------------

function stableId(slug: string, rawTitle: string): string {
  const normalised = rawTitle.toLowerCase().replace(/\s+/g, " ").trim();
  return crypto
    .createHash("sha1")
    .update(`${slug}:${normalised}`)
    .digest("hex")
    .slice(0, 12);
}

// ---------------------------------------------------------------------------
// Reading-list parser
// ---------------------------------------------------------------------------

/**
 * Detect item kind from meta / gloss text.
 */
function detectKind(
  text: string
): ReadingListItem["kind"] | undefined {
  const lower = text.toLowerCase();
  if (lower.includes("blog") || lower.includes("post")) return "blog";
  if (lower.includes("talk") || lower.includes("video") || lower.includes("lecture")) return "talk";
  if (lower.includes("code") || lower.includes("repo") || lower.includes("github")) return "code";
  if (lower.includes("report") || lower.includes("technical report") || lower.includes("system card")) return "report";
  // Default: paper (the most common)
  if (lower.includes("paper") || lower.includes("arxiv") || lower.includes("et al") || /\d{4}/.test(lower)) return "paper";
  return undefined;
}

/**
 * Parse a single reading-list markdown line (raw text of the list item,
 * stripped of the leading "- [ ] " / "- [x] " checkbox marker).
 *
 * Expected format (lenient):
 *   **Title** (Author, Lab, Year) — gloss text [optional link](url)
 *   **Title** (Author, Lab, Year) — gloss text
 *   **Title** — gloss text
 *
 * Returns a partial ReadingListItem (without id and status).
 */
function parseReadingListLine(
  raw: string,
  slug: string,
  onWarn: (msg: string) => void
): ReadingListItem {
  // Strip the leading checkbox marker: "- [ ] " or "- [x] "
  const stripped = raw.replace(/^-\s+\[[ xX]\]\s*/, "").trim();

  // Extract the first URL from markdown links: [text](url)
  let url: string | undefined;
  let textWithoutLinks = stripped;

  const linkMatches = [...stripped.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)];
  if (linkMatches.length > 0 && linkMatches[0]) {
    url = linkMatches[0][2];
    // Remove all markdown link syntax to get clean text
    textWithoutLinks = stripped.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");
  }

  // Extract bold title: **Title text**
  const boldMatch = textWithoutLinks.match(/^\*\*([^*]+)\*\*/);
  if (!boldMatch) {
    // Lenient fallback: use the full stripped text as title
    onWarn(`[build-content] Could not parse bold title from: "${stripped.slice(0, 80)}"`);
    const fallbackTitle = textWithoutLinks.trim();
    const fallbackItem: ReadingListItem = {
      id: stableId(slug, fallbackTitle),
      text: stripped,
      title: fallbackTitle,
      status: "unread",
    };
    if (url !== undefined) fallbackItem.url = url;
    return fallbackItem;
  }

  const title = boldMatch[1]?.trim() ?? "";
  // Text after the bold title
  const afterBold = textWithoutLinks.slice(boldMatch[0].length).trim();

  // Extract parenthesized meta at the beginning of afterBold
  // e.g. "(Vaswani et al, 2017)"
  let meta: string | undefined;
  let afterMeta = afterBold;

  const parenMatch = afterBold.match(/^\(([^)]+)\)/);
  if (parenMatch) {
    meta = parenMatch[1]?.trim();
    afterMeta = afterBold.slice(parenMatch[0].length).trim();
  }

  // Extract gloss: text after em-dash or regular dash separator
  // Handles: " — gloss", " - gloss", "— gloss"
  let gloss: string | undefined;
  const dashMatch = afterMeta.match(/^(?:—|-{1,2})\s*(.+)/s);
  if (dashMatch) {
    gloss = dashMatch[1]?.trim();
  } else if (afterMeta && !parenMatch) {
    // No meta, no em-dash: treat everything after bold as gloss
    const simpleDash = afterMeta.match(/^[—–-]\s*(.+)/s);
    if (simpleDash) {
      gloss = simpleDash[1]?.trim();
    }
  }

  // Detect kind from meta + gloss combined
  const kindSource = [meta ?? "", gloss ?? "", title].join(" ");
  const kind = detectKind(kindSource);

  const item: ReadingListItem = {
    id: stableId(slug, title),
    text: stripped,
    title,
    status: "unread",
  };
  if (url !== undefined) item.url = url;
  if (gloss !== undefined) item.gloss = gloss;
  if (meta !== undefined) item.meta = meta;
  if (kind !== undefined) item.kind = kind;
  return item;
}

/**
 * Extract reading-list items from the markdown source.
 * Looks for a ## Reading list (case-insensitive) section and parses
 * all - [ ] / - [x] items within it.
 */
function extractReadingList(
  source: string,
  slug: string,
  onWarn: (msg: string) => void
): ReadingListItem[] {
  const lines = source.split("\n");
  const items: ReadingListItem[] = [];

  let inReadingList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    // Detect ## Reading list heading (case-insensitive)
    // Also match ## Targets (used in orientation file) as a reading-list section
    if (/^#{1,2}\s+(reading\s+list|targets)/i.test(trimmed)) {
      inReadingList = true;
      continue;
    }

    // Stop at the next ## heading (same or higher level)
    if (inReadingList && /^#{1,2}\s+\S/.test(trimmed)) {
      inReadingList = false;
      continue;
    }

    if (!inReadingList) continue;

    // Match checkbox items: - [ ] or - [x] (case-insensitive)
    if (/^-\s+\[[ xX]\]/.test(trimmed)) {
      // Accumulate continuation lines (indented)
      let full = line;
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j];
        if (next === undefined) break;
        if (/^\s{2,}/.test(next) || next.startsWith("  ")) {
          full += " " + next.trim();
          j++;
          i = j - 1;
        } else {
          break;
        }
      }
      items.push(parseReadingListLine(full.trim(), slug, onWarn));
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Synthesis status heuristic
// ---------------------------------------------------------------------------

function detectSynthesisStatus(source: string): "empty" | "started" {
  const lines = source.split("\n");
  let inSynthesis = false;
  const content: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect ## Synthesis heading (case-insensitive partial match)
    if (/^#{1,3}\s+synthesis/i.test(trimmed)) {
      inSynthesis = true;
      continue;
    }

    // Stop at the next heading of same or higher level
    if (inSynthesis && /^#{1,3}\s+\S/.test(trimmed)) {
      break;
    }

    if (inSynthesis && trimmed) {
      content.push(trimmed);
    }
  }

  if (content.length === 0) return "empty";

  // Check if only content is the placeholder
  const allPlaceholder = content.every(
    (c) => c === "*Fill in as you go.*" || c === "*Fill in as you go*"
  );
  return allPlaceholder ? "empty" : "started";
}

// ---------------------------------------------------------------------------
// Headings extraction (from AST before sanitization)
// ---------------------------------------------------------------------------

function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  // Simple regex extraction from generated HTML (reliable for our controlled output)
  const pattern = /<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const level = parseInt(m[1] ?? "2", 10) as 2 | 3;
    // rehype-sanitize prefixes user-controlled id attrs with "user-content-"
    // We store both the raw id (for TOC links) and strip the prefix for readability
    const rawId = m[2] ?? "";
    const id = rawId;
    // Strip HTML tags and the ¶ glyph from the heading text for clean manifest data
    const text = (m[3] ?? "")
      .replace(/<[^>]+>/g, "")
      .replace(/¶/g, "")
      .trim();
    if (!text) continue; // skip empty headings (shouldn't happen)
    headings.push({ level, id, text });
  }
  return headings;
}

// ---------------------------------------------------------------------------
// Cross-links extraction
// ---------------------------------------------------------------------------

function extractCrossLinks(source: string): string[] {
  const slugs: Set<string> = new Set();
  const linkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;

  while ((m = linkPattern.exec(source)) !== null) {
    const href = m[2] ?? "";
    if (href.startsWith("http://") || href.startsWith("https://")) continue;

    const notesMatch = href.match(/notes\/([^/]+)\/README\.md/i);
    if (notesMatch?.[1]) {
      slugs.add(notesMatch[1]);
      continue;
    }

    const projMatch = href.match(/projects\/([^/]+)\/README\.md/i);
    if (projMatch?.[1]) {
      slugs.add(projMatch[1]);
      continue;
    }

    if (/00-orientation\.md/i.test(href)) {
      slugs.add("07-frontier-labs-orientation");
    }
  }

  return Array.from(slugs);
}

// ---------------------------------------------------------------------------
// Word count
// ---------------------------------------------------------------------------

function countWords(source: string): number {
  // Strip markdown syntax and count whitespace-separated tokens
  const stripped = source
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ") // links
    .replace(/[*_~#>|]/g, " ") // markdown syntax
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return 0;
  return stripped.split(" ").filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Main processing function
// ---------------------------------------------------------------------------

interface ProcessedFile {
  entry: ManifestEntry;
  html: string;
  slug: string;
}

async function processFile(
  filePath: string,
  kind: ManifestEntry["kind"],
  warnings: string[]
): Promise<ProcessedFile> {
  const source = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content: mdContent } = grayMatter(source);

  const slug = deriveSlug(filePath, kind);

  const warn = (msg: string) => warnings.push(msg);

  // Run the unified pipeline
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeCodeWrapper)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: {
        className: ["heading-anchor"],
        ariaHidden: "true",
        tabIndex: -1,
      },
      content: {
        type: "element",
        tagName: "span",
        properties: { className: ["heading-anchor-icon"] },
        children: [{ type: "text", value: "¶" }],
      },
    })
    .use(rehypePrettyCode, {
      themes: {
        light: "one-light",
        dark: "vesper",
      },
      keepBackground: false,
      // Disable the default code wrapper since we add our own
      transformers: [],
    })
    .use(rehypeLinkTransform())
    .use(rehypeSanitize, sanitizeSchema as Parameters<typeof rehypeSanitize>[0])
    .use(rehypeStringify);

  const file = await processor.process(mdContent);
  const html = String(file);

  // Extract metadata
  const title = extractTitle(mdContent) ?? slug;
  const headings = extractHeadings(html);
  const readingList = extractReadingList(mdContent, slug, warn);
  const synthesisStatus = detectSynthesisStatus(mdContent);
  const crossLinks = extractCrossLinks(mdContent);
  const wordCount = countWords(mdContent);
  const lastModified = fs.statSync(filePath).mtime.toISOString();

  const entry: ManifestEntry = {
    slug,
    title,
    path: filePath,
    kind,
    headings,
    readingList,
    wordCount,
    lastModified,
    synthesisStatus,
    crossLinks,
  };
  if (Object.keys(frontmatter).length > 0) {
    entry.frontmatter = frontmatter as Record<string, unknown>;
  }

  return { entry, html, slug };
}

function extractTitle(source: string): string | undefined {
  const m = source.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim();
}

// ---------------------------------------------------------------------------
// File slug → html filename
// ---------------------------------------------------------------------------

function slugToFilename(slug: string): string {
  // Convert slug to flat filename:
  // "00-foundations" → "notes-00-foundations.html"
  // "01-pretrain-end-to-end" → "projects-01-pretrain-end-to-end.html"
  // "07-frontier-labs-orientation" → "notes-07-frontier-labs-orientation.html"
  // "root" → "root-readme.html"
  return `${slug}.html`;
}

// ---------------------------------------------------------------------------
// Main exported build function
// ---------------------------------------------------------------------------

export async function buildContent(): Promise<void> {
  const startMs = Date.now();
  const warnings: string[] = [];

  // Discover files
  const noteREADMEs = await fg("notes/*/README.md", {
    cwd: REPO_ROOT,
    absolute: true,
  });
  const orientationFile = path.join(
    REPO_ROOT,
    "notes",
    "07-frontier-labs",
    "00-orientation.md"
  );
  const projectREADMEs = await fg("projects/*/README.md", {
    cwd: REPO_ROOT,
    absolute: true,
  });
  const rootReadme = path.join(REPO_ROOT, "README.md");

  // Sort notes by folder name to ensure consistent ordering
  noteREADMEs.sort();
  projectREADMEs.sort();

  // Build file list with kinds
  const files: Array<{ path: string; kind: ManifestEntry["kind"] }> = [
    ...noteREADMEs.map((p) => ({
      path: p,
      kind: "topic" as const,
    })),
    ...(fs.existsSync(orientationFile)
      ? [{ path: orientationFile, kind: "orientation" as const }]
      : []),
    ...projectREADMEs.map((p) => ({
      path: p,
      kind: "project" as const,
    })),
    ...(fs.existsSync(rootReadme)
      ? [{ path: rootReadme, kind: "root" as const }]
      : []),
  ];

  // Process all files
  const results = await Promise.all(
    files.map(({ path: p, kind }) => processFile(p, kind, warnings))
  );

  // Write outputs
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  let totalReadingItems = 0;

  for (const { entry, html, slug } of results) {
    const filename = slugToFilename(slug);
    fs.writeFileSync(path.join(CONTENT_DIR, filename), html, "utf-8");
    totalReadingItems += entry.readingList.length;
  }

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    entries: results.map((r) => r.entry),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );

  const elapsedMs = Date.now() - startMs;
  process.stderr.write(
    `[build-content] processed ${files.length} files, ${totalReadingItems} reading-list items in ${elapsedMs}ms\n`
  );

  if (warnings.length > 0) {
    process.stderr.write(
      `[build-content] ${warnings.length} parse warning(s):\n`
    );
    for (const w of warnings) {
      process.stderr.write(`  ${w}\n`);
    }
  }
}
