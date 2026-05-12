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
  /** Numeric module id (0 = Prerequisites, 1 = Pretraining at scale, …). */
  module?: number;
  /** Display title for the module group on the textbook index. */
  module_title?: string;
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
  module: number;
  module_title: string;
  Component: ComponentType;
  filePath: string;
}

export interface ModuleGroup {
  module: number;
  module_title: string;
  chapters: ChapterEntry[];
}

// Eager glob: every chapter is loaded at module-eval time. This is fine
// because chapters are static and small enough that lazy-loading per-chapter
// is not worth the routing complexity for this delivery.
const modules = import.meta.glob<ChapterModule>(
  "/content/textbook/*.mdx",
  { eager: true },
);

// Default module assignment for chapters that haven't been migrated yet:
// every prereqs slug starting with "00" lands in module 0.
function defaultModule(slug: string): { module: number; module_title: string } {
  if (slug.startsWith("00")) return { module: 0, module_title: "Prerequisites" };
  if (slug.startsWith("01"))
    return { module: 1, module_title: "Pretraining at scale" };
  return { module: 99, module_title: "Uncategorised" };
}

function entriesFromModules(): ChapterEntry[] {
  const entries: ChapterEntry[] = [];
  for (const [filePath, mod] of Object.entries(modules)) {
    if (!mod.frontmatter) {
      console.warn(`[textbook] ${filePath} is missing frontmatter — skipped`);
      continue;
    }
    const fm = mod.frontmatter;
    const fallback = defaultModule(fm.slug);
    const entry: ChapterEntry = {
      slug: fm.slug,
      title: fm.title,
      description: fm.description,
      order: fm.order,
      reading_minutes: fm.reading_minutes,
      depends_on: fm.depends_on ?? [],
      provides: fm.provides ?? [],
      last_reviewed: fm.last_reviewed,
      module: fm.module ?? fallback.module,
      module_title: fm.module_title ?? fallback.module_title,
      Component: mod.default,
      filePath,
    };
    if (fm.chapter !== undefined) {
      entry.chapter = fm.chapter;
    }
    entries.push(entry);
  }
  return entries.sort((a, b) => a.order - b.order);
}

const ALL = entriesFromModules();
const BY_SLUG = new Map(ALL.map((e) => [e.slug, e]));

export function getAllChapters(): ChapterEntry[] {
  return ALL;
}

/** All chapters grouped by module, sorted by module id then chapter order. */
export function getChaptersByModule(): ModuleGroup[] {
  const byId = new Map<number, ModuleGroup>();
  for (const c of ALL) {
    let group = byId.get(c.module);
    if (!group) {
      group = { module: c.module, module_title: c.module_title, chapters: [] };
      byId.set(c.module, group);
    }
    group.chapters.push(c);
  }
  return [...byId.values()].sort((a, b) => a.module - b.module);
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
    prev: idx > 0 ? (ALL[idx - 1] ?? null) : null,
    next: idx < ALL.length - 1 ? (ALL[idx + 1] ?? null) : null,
  };
}
