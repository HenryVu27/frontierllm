/**
 * build-textbook.ts
 *
 * Extracts text content from MDX chapter files in web/content/textbook/ and
 * emits search records compatible with the existing search index. Runs from
 * the frontierllm-content Vite plugin alongside build-content.ts.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import grayMatter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_DIR = __dirname.replace(/[\\/]scripts$/, "");
const TEXTBOOK_DIR = path.join(WEB_DIR, "content", "textbook");
const OUT_FILE = path.join(
  WEB_DIR,
  "src",
  "generated",
  "textbook-search.json",
);

export interface TextbookSearchRecord {
  id: string;
  slug: string;
  title: string;
  heading: string;
  anchor: string;
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripMdx(body: string): string {
  return body
    .replace(/<[A-Z][^>]*\/>/g, " ")
    .replace(/<[A-Z][\s\S]*?>([\s\S]*?)<\/[A-Z][a-zA-Z]*>/g, " $1 ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$]*\$/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function buildTextbook(): Promise<void> {
  if (!fs.existsSync(TEXTBOOK_DIR)) {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, "[]\n");
    return;
  }

  const files = fs
    .readdirSync(TEXTBOOK_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(TEXTBOOK_DIR, f));

  const records: TextbookSearchRecord[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data: frontmatter, content } = grayMatter(raw);
    const slug = frontmatter.slug as string | undefined;
    const title = frontmatter.title as string | undefined;
    if (!slug || !title) continue;

    const lines = content.split(/\r?\n/);
    let currentHeading = title;
    let currentAnchor = slugify(title);
    let buffer: string[] = [];

    const flush = () => {
      const text = stripMdx(buffer.join("\n"));
      if (text.length < 20) return;
      records.push({
        id: `${slug}:${currentAnchor}`,
        slug,
        title,
        heading: currentHeading,
        anchor: currentAnchor,
        content: text,
      });
    };

    for (const line of lines) {
      // Match H2/H3 with optional {#anchor} syntax: "## Heading text {#anchor-id}"
      const h = /^(#{2,3})\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?\s*$/.exec(line);
      if (h && h[2] !== undefined) {
        flush();
        buffer = [];
        currentHeading = h[2].trim();
        currentAnchor = h[3] ?? slugify(currentHeading);
      } else {
        buffer.push(line);
      }
    }
    flush();
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(records, null, 2));
}
