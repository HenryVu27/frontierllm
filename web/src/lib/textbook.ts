/**
 * textbook.ts
 *
 * Loads MDX chapters from web/content/textbook/*.mdx at build time via
 * import.meta.glob. Each chapter exports a default React component (the MDX
 * body) and a named `frontmatter` object (parsed via remark-mdx-frontmatter).
 *
 * Provides a typed manifest keyed by slug, plus helpers for ordered
 * navigation (prev/next within the module).
 */

import type { ComponentType } from "react";

export interface ChapterFrontmatter {
  slug: string;
  title: string;
  description: string;
  order: number;
  chapter?: number;
  reading_minutes: number;
  depends_on?: string[];
  provides?: string[];
  last_reviewed: string; // ISO date
}

export interface ChapterModule {
  frontmatter: ChapterFrontmatter;
  default: ComponentType;
}

export interface ChapterEntry {
  slug: string;
  title: string;
  description: string;
  order: number;
  chapter?: number;
  reading_minutes: number;
  depends_on: string[];
  provides: string[];
  last_reviewed: string;
  Component: ComponentType;
  filePath: string;
}

// Eager glob: every chapter is loaded at module-eval time. This is fine
// because chapters are static and small enough that lazy-loading per-chapter
// is not worth the routing complexity for this delivery.
const modules = import.meta.glob<ChapterModule>(
  "/content/textbook/*.mdx",
  { eager: true },
);

function entriesFromModules(): ChapterEntry[] {
  const entries: ChapterEntry[] = [];
  for (const [filePath, mod] of Object.entries(modules)) {
    if (!mod.frontmatter) {
      // eslint-disable-next-line no-console
      console.warn(`[textbook] ${filePath} is missing frontmatter — skipped`);
      continue;
    }
    const fm = mod.frontmatter;
    entries.push({
      slug: fm.slug,
      title: fm.title,
      description: fm.description,
      order: fm.order,
      chapter: fm.chapter,
      reading_minutes: fm.reading_minutes,
      depends_on: fm.depends_on ?? [],
      provides: fm.provides ?? [],
      last_reviewed: fm.last_reviewed,
      Component: mod.default,
      filePath,
    });
  }
  return entries.sort((a, b) => a.order - b.order);
}

const ALL = entriesFromModules();
const BY_SLUG = new Map(ALL.map((e) => [e.slug, e]));

export function getAllChapters(): ChapterEntry[] {
  return ALL;
}

export function getChapter(slug: string): ChapterEntry | undefined {
  return BY_SLUG.get(slug);
}

export function getAdjacentChapters(
  slug: string,
): { prev: ChapterEntry | null; next: ChapterEntry | null } {
  const idx = ALL.findIndex((c) => c.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? ALL[idx - 1] : null,
    next: idx < ALL.length - 1 ? ALL[idx + 1] : null,
  };
}
