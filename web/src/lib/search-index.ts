/**
 * search-index.ts — builds a MiniSearch index from the manifest at app boot.
 *
 * Per spec §10, indexes ONLY manifest fields (not body prose):
 *   - Pages: title, gloss (from headings[0] "What this is" section), breadcrumb (boost ×3)
 *   - Headings: every h2/h3 in headings[] (boost ×2)
 *   - Reading items: titles + glosses (boost ×1.5)
 *   - Reading-item meta: meta field (boost ×1)
 *
 * Exports:
 *   buildIndex()           — returns a MiniSearch instance
 *   searchAll(query, opts) — returns grouped results { pages, headings, readingItems }
 */

import MiniSearch from "minisearch";
import { getAllEntries } from "@/lib/manifest";
import type { ManifestEntry } from "@/lib/manifest";
import { getAllChapters } from "@/lib/textbook";
import textbookSectionsRaw from "@/generated/textbook-search.json";

interface TextbookSection {
  id: string;
  slug: string;
  title: string;
  heading: string;
  anchor: string;
  content: string;
}

const textbookSections = textbookSectionsRaw as TextbookSection[];

// ─── Document types ───────────────────────────────────────────────────────────

export interface SearchDoc {
  id: string;
  kind: "page" | "heading" | "reading-item";
  title: string;
  subtitle?: string; // gloss or heading text
  breadcrumb: string; // e.g. "Notes / 01 Pretraining"
  /** Path to navigate to when this result is selected */
  href: string;
  /** Slug of the parent entry (topic/project) */
  slug: string;
  /** Body text for content search (textbook sections only). Indexed but not stored. */
  body?: string;
}

export interface GroupedResults {
  pages: SearchDoc[];
  headings: SearchDoc[];
  readingItems: SearchDoc[];
}

// ─── Navigation helpers ───────────────────────────────────────────────────────

function hrefForEntry(entry: ManifestEntry): string {
  switch (entry.kind) {
    case "topic":
      return `/notes/${entry.slug}`;
    case "orientation":
      return `/notes/07-frontier-labs/orientation`;
    case "project":
      return `/projects/${entry.slug}`;
    case "root":
      return `/about`;
    default:
      return `/`;
  }
}

function breadcrumbForEntry(entry: ManifestEntry): string {
  switch (entry.kind) {
    case "topic":
      return `Notes / ${entry.title}`;
    case "orientation":
      return `Notes / 07 Frontier Labs / Orientation`;
    case "project":
      return `Projects / ${entry.title}`;
    case "root":
      return `About`;
    default:
      return entry.title;
  }
}

// ─── Index builder ────────────────────────────────────────────────────────────

let _index: MiniSearch<SearchDoc> | null = null;
let _docs: SearchDoc[] = [];

/**
 * Build the MiniSearch index from all manifest entries.
 * Called once at app boot; subsequent calls return the cached instance.
 */
export function buildIndex(): MiniSearch<SearchDoc> {
  if (_index) return _index;

  const entries = getAllEntries();
  const docs: SearchDoc[] = [];

  for (const entry of entries) {
    const baseBreadcrumb = breadcrumbForEntry(entry);
    const baseHref = hrefForEntry(entry);

    // ── Page document ────────────────────────────────────────────────────
    // Extract gloss from the first non-empty "What this is" heading content.
    // The manifest doesn't store gloss directly, so we use the entry title
    // and any heading text as subtitle.
    const pageDoc: SearchDoc = {
      id: `page:${entry.slug}`,
      kind: "page",
      title: entry.title,
      breadcrumb: baseBreadcrumb,
      href: baseHref,
      slug: entry.slug,
    };
    docs.push(pageDoc);

    // ── Heading documents ─────────────────────────────────────────────────
    for (const heading of entry.headings) {
      // Skip generic structural headings that aren't informative for search
      const skipHeadings = new Set([
        "reading-list",
        "synthesis-your-own-words",
        "open-questions",
        "code--experiments",
        "what-this-is",
      ]);
      if (skipHeadings.has(heading.id)) continue;

      const headingDoc: SearchDoc = {
        id: `heading:${entry.slug}:${heading.id}`,
        kind: "heading",
        title: heading.text,
        breadcrumb: baseBreadcrumb,
        href: `${baseHref}#${heading.id}`,
        slug: entry.slug,
      };
      docs.push(headingDoc);
    }

    // ── Reading-item documents ────────────────────────────────────────────
    for (const item of entry.readingList) {
      const readingHref =
        entry.kind === "topic"
          ? `/notes/${entry.slug}?tab=reading`
          : entry.kind === "orientation"
            ? `/notes/07-frontier-labs/orientation?tab=reading`
            : `/reading?topic=${entry.slug}`;

      const readingDoc: SearchDoc = {
        id: `reading:${item.id}`,
        kind: "reading-item",
        title: item.title,
        ...(item.gloss !== undefined ? { subtitle: item.gloss } : {}),
        breadcrumb: baseBreadcrumb,
        href: readingHref,
        slug: entry.slug,
      };
      docs.push(readingDoc);
    }
  }

  // ── Textbook chapters and sections ──────────────────────────────────────
  for (const chapter of getAllChapters()) {
    const chapterBreadcrumb =
      chapter.chapter !== undefined && chapter.chapter > 0
        ? `Textbook / Chapter ${chapter.chapter}`
        : `Textbook`;

    docs.push({
      id: `textbook-page:${chapter.slug}`,
      kind: "page",
      title: chapter.title,
      subtitle: chapter.description,
      breadcrumb: chapterBreadcrumb,
      href: `/textbook/${chapter.slug}`,
      slug: chapter.slug,
    });
  }

  for (const section of textbookSections) {
    docs.push({
      id: `textbook-section:${section.id}`,
      kind: "heading",
      title: section.heading,
      subtitle: section.title,
      breadcrumb: `Textbook / ${section.title}`,
      href: `/textbook/${section.slug}#${section.anchor}`,
      slug: section.slug,
      body: section.content,
    });
  }

  _docs = docs;

  _index = new MiniSearch<SearchDoc>({
    fields: ["title", "subtitle", "breadcrumb", "body"],
    storeFields: ["id", "kind", "title", "subtitle", "breadcrumb", "href", "slug"],
    searchOptions: {
      boost: { title: 3, breadcrumb: 3 },
      fuzzy: 0.2,
      prefix: true,
    },
    idField: "id",
  });

  _index.addAll(docs);
  return _index;
}

/**
 * Search the manifest index and return results grouped by kind.
 * Results are capped at 10 per group (spec §10).
 */
export function searchAll(
  query: string,
  opts?: { maxPerGroup?: number }
): GroupedResults {
  const cap = opts?.maxPerGroup ?? 10;

  if (!query.trim()) {
    return { pages: [], headings: [], readingItems: [] };
  }

  const index = buildIndex();

  const rawResults = index.search(query, {
    boost: {
      title: 3,
      breadcrumb: 3,
      subtitle: 1.5,
      body: 1,
    },
    fuzzy: 0.2,
    prefix: true,
    combineWith: "OR",
  });

  // Build an id→doc map for O(1) lookups
  const docById = new Map<string, SearchDoc>(
    _docs.map((d) => [d.id, d])
  );

  const pages: SearchDoc[] = [];
  const headings: SearchDoc[] = [];
  const readingItems: SearchDoc[] = [];

  for (const result of rawResults) {
    const doc = docById.get(result.id as string);
    if (!doc) continue;

    if (doc.kind === "page" && pages.length < cap) {
      pages.push(doc);
    } else if (doc.kind === "heading" && headings.length < cap) {
      headings.push(doc);
    } else if (doc.kind === "reading-item" && readingItems.length < cap) {
      readingItems.push(doc);
    }

    if (
      pages.length >= cap &&
      headings.length >= cap &&
      readingItems.length >= cap
    ) {
      break;
    }
  }

  return { pages, headings, readingItems };
}

/**
 * Get all docs (for CommandMenu recent-pages lookup).
 */
export function getDocById(id: string): SearchDoc | undefined {
  if (!_index) buildIndex();
  return _docs.find((d) => d.id === id);
}

/**
 * Get a page doc by slug (for recent pages display in CommandMenu).
 */
export function getPageDocBySlug(slug: string): SearchDoc | undefined {
  if (!_index) buildIndex();
  return _docs.find((d) => d.kind === "page" && d.slug === slug);
}
