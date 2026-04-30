/**
 * Manifest types and typed accessors for the build-time content pipeline.
 * The manifest itself is generated at build time by web/scripts/build-content.ts
 * and written to web/src/generated/manifest.json (gitignored).
 */

export type ItemStatus = "read" | "unread";

export interface ReadingListItem {
  id: string; // sha1(slug:normalizedTitle).slice(0, 12) — stable across re-orderings
  text: string; // full raw text of list item (preserved verbatim)
  title: string; // parsed bold leading text
  url?: string; // first markdown link href found in item
  gloss?: string; // text after em-dash separator
  meta?: string; // parenthesized content
  kind?: "paper" | "blog" | "talk" | "code" | "report"; // detected from meta text
  status: "unread"; // default; runtime state lives in localStorage keyed by id
}

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string; // rehype-slug-generated id
}

export interface ManifestEntry {
  slug: string;
  title: string;
  path: string; // absolute path to source .md file
  kind: "topic" | "project" | "orientation" | "root";
  headings: Heading[];
  readingList: ReadingListItem[];
  wordCount: number;
  lastModified: string; // ISO 8601
  synthesisStatus: "empty" | "started";
  crossLinks: string[]; // slugs of other docs referenced
  frontmatter?: Record<string, unknown>; // from gray-matter; undefined for most files
}

export interface Manifest {
  generatedAt: string; // ISO 8601
  entries: ManifestEntry[];
}

// ---------------------------------------------------------------------------
// Typed accessors — consumed by hooks and pages
// ---------------------------------------------------------------------------

// Import manifest data — generated at build time
// The `as unknown as Manifest` cast is necessary because TypeScript infers the
// literal JSON type rather than the broader Manifest interface.
let _manifest: Manifest | null = null;

function getManifest(): Manifest {
  if (_manifest) return _manifest;
  // Dynamic import of generated manifest — loaded at module init time via
  // top-level await in the consumer, or synchronously via the default export.
  // At runtime this is a static import resolved by Vite.
  throw new Error(
    "manifest not initialised — call initManifest(data) first (done in manifest-loader.ts)"
  );
}

/**
 * Initialise the manifest from the JSON import. Call once at app boot.
 * Accepts the raw JSON import (typed as the generated shape) and stores it.
 */
export function initManifest(data: Record<string, unknown>): void {
  _manifest = data as unknown as Manifest;
}

export function getEntry(slug: string): ManifestEntry | undefined {
  return getManifest().entries.find((e) => e.slug === slug);
}

export function getTopics(): ManifestEntry[] {
  return getManifest().entries.filter(
    (e) => e.kind === "topic" || e.kind === "orientation"
  );
}

export function getProjects(): ManifestEntry[] {
  return getManifest().entries.filter((e) => e.kind === "project");
}

export function getRootEntry(): ManifestEntry | undefined {
  return getManifest().entries.find((e) => e.kind === "root");
}

export function getAllEntries(): ManifestEntry[] {
  return getManifest().entries;
}

export function getGeneratedAt(): string {
  return getManifest().generatedAt;
}
