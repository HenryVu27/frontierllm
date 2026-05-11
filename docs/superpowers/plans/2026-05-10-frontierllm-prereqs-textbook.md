# Prerequisites Textbook Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a polished, MDX-driven prerequisites textbook (1 landing page + 8 chapters) inside the existing frontierllm web app, synthesising current frontier-LLM foundations as of May 2026 from primary sources so the reader does not need to leave the site to learn the material.

**Architecture:** Add MDX support to the existing Vite pipeline as a second content path (markdown notes remain untouched). Port greek-style MDX components (Callout, Sidenote, Sources, ComparisonTable) plus KaTeX math rendering. New `/textbook` and `/textbook/:slug` routes. Content is researched in 8 parallel research-brief passes, then written in 8 parallel chapter-writing passes, then integrated.

**Tech Stack:** React 19 + Vite 8 + TypeScript (strict) + Tailwind v4 + shadcn/ui (existing); `@mdx-js/rollup` + `remark-frontmatter` + `remark-mdx-frontmatter` + `remark-math` + `rehype-katex` + KaTeX CSS (new).

**Reference spec:** `docs/superpowers/specs/2026-05-10-frontierllm-prereqs-textbook-design.md`

**Defaults locked in from brainstorming session:**
- Chapter order: attention variants before positional encodings
- Sidebar placement: new top-level "Textbook" entry alongside Notes / Projects
- Closed-lab rows in comparison tables: include with `(inferred from public reports / API behaviour)` caveat

---

## Phase overview

| Phase | What | Concurrency | Output |
|---|---|---|---|
| 1 | MDX pipeline + components + routing | Sequential (Tasks 1-12) | Empty textbook surface that renders, plus all components |
| 2 | Research briefs | 8 parallel agent dispatches (Tasks 13a-13h) | One markdown brief per chapter under `scratch/research-briefs/` |
| 3 | Chapter writing | 8 parallel agent dispatches (Tasks 14a-14h) | Eight `.mdx` chapter files under `web/content/textbook/` |
| 4 | Integration + landing | Sequential (Tasks 15-20) | Cross-references, landing page, voice/notation audit, search index, README updates |

Phase 2 can only start once Phase 1 is verified rendering. Phase 3 can only start once each chapter's Phase 2 brief is complete (but per-chapter Phase 2 → Phase 3 is independent across chapters). Phase 4 can only start once Phase 3 is done.

---

# Phase 1 — Pipeline & components

## Task 1: Install MDX and KaTeX dependencies

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: Install runtime dependencies**

Run (from `web/`):
```powershell
npm install @mdx-js/rollup@^3.1.0 @mdx-js/react@^3.1.0 remark-frontmatter@^5.0.0 remark-mdx-frontmatter@^5.1.0 remark-math@^6.0.0 rehype-katex@^7.0.1 katex@^0.16.11
```

- [ ] **Step 2: Install dev type packages**

Run:
```powershell
npm install -D @types/mdx@^2.0.13
```

- [ ] **Step 3: Verify install succeeded**

Run:
```powershell
npm ls @mdx-js/rollup @mdx-js/react remark-math rehype-katex katex
```

Expected: each package prints a version line; no "UNMET" or error.

- [ ] **Step 4: Commit**

```powershell
git add web/package.json web/package-lock.json
git commit -m "deps: add mdx, remark-math, rehype-katex, katex for textbook module"
```

---

## Task 2: Wire MDX into vite.config.ts

**Files:**
- Modify: `web/vite.config.ts`

- [ ] **Step 1: Add the MDX plugin import and registration**

At the top of `web/vite.config.ts`, add imports after the existing `tailwindcss` import:

```typescript
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import { remarkMdxFrontmatter } from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
```

Then inside the `plugins` array (currently `[react(), tailwindcss(), contentPlugin]`), insert the MDX plugin **before** `react()`:

```typescript
plugins: [
  mdx({
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: "frontmatter" }],
      remarkGfm,
      remarkMath,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypeKatex, { strict: false }],
      [
        rehypePrettyCode,
        {
          theme: { light: "github-light", dark: "github-dark-dimmed" },
          keepBackground: false,
        },
      ],
    ],
    providerImportSource: "@mdx-js/react",
  }),
  react(),
  tailwindcss(),
  contentPlugin,
],
```

- [ ] **Step 2: Verify config typechecks**

Run (from `web/`):
```powershell
npm run typecheck
```

Expected: zero errors. If you see "Cannot find module '@mdx-js/rollup'", re-run `npm install` from Task 1.

- [ ] **Step 3: Commit**

```powershell
git add web/vite.config.ts
git commit -m "build: register mdx plugin with remark-math + rehype-katex"
```

---

## Task 3: Import KaTeX CSS globally

**Files:**
- Modify: `web/src/main.tsx`

- [ ] **Step 1: Add the KaTeX CSS import**

In `web/src/main.tsx`, add this import line near the other CSS imports (after `globals.css` / `prose.css`):

```typescript
import "katex/dist/katex.min.css";
```

- [ ] **Step 2: Run the dev server and confirm no console errors**

```powershell
npm run dev
```

Open the existing dashboard at http://localhost:5173. Expected: page loads as before, no KaTeX-related errors in the browser console. Stop the server (Ctrl+C).

- [ ] **Step 3: Commit**

```powershell
git add web/src/main.tsx
git commit -m "style: import katex css globally for math rendering"
```

---

## Task 4: Create the Callout component

**Files:**
- Create: `web/src/components/mdx/Callout.tsx`

- [ ] **Step 1: Write the component**

Create `web/src/components/mdx/Callout.tsx` with:

```typescript
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, BookOpen, PencilLine } from "lucide-react";
import type { ReactNode } from "react";

export type CalloutVariant = "info" | "warning" | "note" | "exercise";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const VARIANT_META: Record<
  CalloutVariant,
  { defaultTitle: string; Icon: typeof Info; tint: string; border: string }
> = {
  info: {
    defaultTitle: "Note",
    Icon: Info,
    tint: "bg-sky-50/40 dark:bg-sky-950/20",
    border: "border-l-sky-500/70",
  },
  warning: {
    defaultTitle: "Caution",
    Icon: AlertTriangle,
    tint: "bg-amber-50/40 dark:bg-amber-950/20",
    border: "border-l-amber-500/70",
  },
  note: {
    defaultTitle: "Note",
    Icon: BookOpen,
    tint: "bg-subtle/40",
    border: "border-l-foreground/30",
  },
  exercise: {
    defaultTitle: "Exercise",
    Icon: PencilLine,
    tint: "bg-emerald-50/40 dark:bg-emerald-950/20",
    border: "border-l-emerald-500/70",
  },
};

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const meta = VARIANT_META[variant];
  const Icon = meta.Icon;
  return (
    <aside
      className={cn(
        "my-6 rounded-r-md border-l-4 pl-4 pr-4 py-3",
        meta.tint,
        meta.border,
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title ?? meta.defaultTitle}
        </span>
      </div>
      <div className="prose-callout text-sm leading-relaxed">{children}</div>
    </aside>
  );
}
```

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```powershell
git add web/src/components/mdx/Callout.tsx
git commit -m "feat(mdx): add Callout component (4 variants)"
```

---

## Task 5: Create the Sidenote component

**Files:**
- Create: `web/src/components/mdx/Sidenote.tsx`

- [ ] **Step 1: Write the component**

Create `web/src/components/mdx/Sidenote.tsx`:

```typescript
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidenoteProps {
  children: ReactNode;
}

let counter = 0;

export function Sidenote({ children }: SidenoteProps) {
  // Stable per-mount id for ARIA wiring
  const id = useId();
  const [open, setOpen] = useState(false);
  // Increment a module-level counter so each sidenote shows a number.
  // Reset semantics are best-effort — pages remount on navigation in this SPA,
  // so this is acceptable for an MVP. If numbering becomes wrong, replace this
  // with a SidenoteProvider that resets per chapter.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [num] = useState(() => ++counter);

  return (
    <span className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "align-super text-[10px] font-medium tabular-nums",
          "text-primary hover:underline focus-visible:outline-2",
          "focus-visible:outline-ring focus-visible:outline-offset-1",
          "mx-0.5 cursor-pointer",
        )}
      >
        [{num}]
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className={cn(
            "block my-2 mx-0 rounded-md border-l-2 border-primary/60",
            "bg-subtle/50 px-3 py-2 text-xs text-muted-foreground",
            "leading-relaxed",
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```powershell
git add web/src/components/mdx/Sidenote.tsx
git commit -m "feat(mdx): add Sidenote component"
```

---

## Task 6: Create the Sources component

**Files:**
- Create: `web/src/components/mdx/Sources.tsx`

- [ ] **Step 1: Write the component**

Create `web/src/components/mdx/Sources.tsx`:

```typescript
import { cn } from "@/lib/utils";

export interface SourceItem {
  authors: string;
  year: string | number;
  title: string;
  venue?: string;
  url?: string;
  note?: string;
}

interface SourcesProps {
  items: SourceItem[];
  caption?: string;
}

export function Sources({ items, caption }: SourcesProps) {
  return (
    <section className="my-8 not-prose">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Sources
      </h2>
      {caption && (
        <p className="text-xs text-muted-foreground mb-4 italic">{caption}</p>
      )}
      <ol className="space-y-3 list-none pl-0">
        {items.map((item, i) => (
          <li
            key={`${item.authors}-${item.year}-${i}`}
            className={cn(
              "text-sm leading-relaxed text-foreground/90",
              "border-l-2 border-border pl-3",
            )}
          >
            <span className="font-medium">{item.authors}</span>
            <span className="text-muted-foreground"> ({item.year}). </span>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {item.title}
              </a>
            ) : (
              <span className="italic">{item.title}</span>
            )}
            {item.venue && (
              <span className="text-muted-foreground">. {item.venue}</span>
            )}
            {item.note && (
              <span className="block mt-1 text-xs text-muted-foreground">
                — {item.note}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```

- [ ] **Step 3: Commit**

```powershell
git add web/src/components/mdx/Sources.tsx
git commit -m "feat(mdx): add Sources bibliography component"
```

---

## Task 7: Create the ComparisonTable component

**Files:**
- Create: `web/src/components/mdx/ComparisonTable.tsx`

- [ ] **Step 1: Write the component**

Create `web/src/components/mdx/ComparisonTable.tsx`:

```typescript
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ComparisonTableProps {
  columns: string[];
  rows: ReactNode[][];
  caption?: string;
}

export function ComparisonTable({
  columns,
  rows,
  caption,
}: ComparisonTableProps) {
  return (
    <figure className="my-8 not-prose">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-subtle/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={cn(
                    "text-left px-3 py-2",
                    "text-xs font-semibold uppercase tracking-wider",
                    "text-muted-foreground",
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={cn(
                  "border-t border-border",
                  ri % 2 === 0 ? "" : "bg-subtle/20",
                )}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 align-top text-foreground/90 leading-relaxed"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```

- [ ] **Step 3: Commit**

```powershell
git add web/src/components/mdx/ComparisonTable.tsx
git commit -m "feat(mdx): add ComparisonTable component"
```

---

## Task 8: Create the MDX components provider

**Files:**
- Create: `web/src/components/mdx/MdxComponents.tsx`

- [ ] **Step 1: Write the provider**

Create `web/src/components/mdx/MdxComponents.tsx`:

```typescript
import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { Callout } from "./Callout";
import { Sidenote } from "./Sidenote";
import { Sources } from "./Sources";
import { ComparisonTable } from "./ComparisonTable";

const components = {
  Callout,
  Sidenote,
  Sources,
  ComparisonTable,
};

interface MdxComponentsProviderProps {
  children: ReactNode;
}

export function MdxComponentsProvider({ children }: MdxComponentsProviderProps) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
```

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```

- [ ] **Step 3: Commit**

```powershell
git add web/src/components/mdx/MdxComponents.tsx
git commit -m "feat(mdx): add MDXProvider wiring component scope"
```

---

## Task 9: Create the textbook loader and types

**Files:**
- Create: `web/src/lib/textbook.ts`

- [ ] **Step 1: Write the loader**

Create `web/src/lib/textbook.ts`:

```typescript
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
```

- [ ] **Step 2: Add a `mdx` module shim if TypeScript complains**

If `npm run typecheck` produces "Cannot find module" errors for `.mdx` imports, create `web/src/mdx.d.ts`:

```typescript
declare module "*.mdx" {
  import type { ComponentType } from "react";
  export const frontmatter: import("@/lib/textbook").ChapterFrontmatter;
  const Component: ComponentType;
  export default Component;
}
```

- [ ] **Step 3: Typecheck**

```powershell
npm run typecheck
```

Expected: zero errors. (The glob currently matches zero files — that's fine; `ALL` will be empty until Phase 3 ships content.)

- [ ] **Step 4: Commit**

```powershell
git add web/src/lib/textbook.ts web/src/mdx.d.ts
git commit -m "feat(textbook): add typed mdx chapter loader"
```

---

## Task 10: Create the TextbookIndexPage and TextbookChapterPage

**Files:**
- Create: `web/src/pages/TextbookIndexPage.tsx`
- Create: `web/src/pages/TextbookChapterPage.tsx`

- [ ] **Step 1: Write the index page**

Create `web/src/pages/TextbookIndexPage.tsx`:

```typescript
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAllChapters } from "@/lib/textbook";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TextbookIndexPage() {
  const chapters = getAllChapters();

  return (
    <PageContainer>
      <header className="mb-10">
        <span className="text-2xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 inline-block">
          Textbook · Prerequisites
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground leading-tight text-balance mb-3">
          Prerequisites
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          The math and engineering foundations every frontier-LLM topic on this
          site assumes. Calibrated to frontier-model practice as of May 2026.
        </p>
      </header>

      {chapters.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No chapters loaded — content is generated by Phase 3 of the
          textbook delivery. See <code>docs/superpowers/plans/</code>.
        </p>
      ) : (
        <ol className="space-y-3 list-none pl-0">
          {chapters.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/textbook/${c.slug}`}
                className={cn(
                  "group block rounded-md border border-border p-4",
                  "transition-colors duration-150",
                  "hover:bg-subtle/40 focus-visible:outline-2",
                  "focus-visible:outline-ring focus-visible:outline-offset-1",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {c.chapter !== undefined && (
                      <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Chapter {c.chapter}
                      </span>
                    )}
                    <h2 className="text-lg font-semibold tracking-tight text-foreground mt-1">
                      {c.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-2xs text-muted-foreground tabular-nums">
                      <Clock className="w-3 h-3" aria-hidden />
                      {c.reading_minutes} min
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                      aria-hidden
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </PageContainer>
  );
}
```

- [ ] **Step 2: Write the chapter page**

Create `web/src/pages/TextbookChapterPage.tsx`:

```typescript
import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { MdxComponentsProvider } from "@/components/mdx/MdxComponents";
import { getChapter, getAdjacentChapters } from "@/lib/textbook";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function TextbookChapterPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">No chapter specified.</p>
      </PageContainer>
    );
  }

  const chapter = getChapter(slug);
  if (!chapter) {
    return (
      <PageContainer>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-3 leading-tight">
          Chapter not found
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          No chapter found for{" "}
          <code className="font-mono text-xs bg-subtle px-1 py-0.5 rounded-sm">
            {slug}
          </code>
          .
        </p>
        <Link
          to="/textbook"
          className="text-sm text-foreground underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary"
        >
          Back to Textbook
        </Link>
      </PageContainer>
    );
  }

  const { Component } = chapter;
  const { prev, next } = getAdjacentChapters(slug);

  return (
    <PageContainer>
      <header className="mb-8">
        <span className="text-2xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 inline-block">
          {chapter.chapter !== undefined
            ? `Chapter ${chapter.chapter}`
            : "Textbook"}
          {" · "}Prerequisites
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground leading-tight text-balance">
          {chapter.title}
        </h1>
        <p className="text-2xs text-muted-foreground mt-3 tabular-nums">
          {chapter.reading_minutes} min · Last reviewed {chapter.last_reviewed}
        </p>
      </header>

      <article className="prose max-w-none">
        <MdxComponentsProvider>
          <Component />
        </MdxComponentsProvider>
      </article>

      <nav
        aria-label="Chapter navigation"
        className="mt-16 pt-6 border-t border-border flex items-center justify-between gap-4"
      >
        {prev ? (
          <Link
            to={`/textbook/${prev.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <span className="flex flex-col">
              <span className="text-2xs uppercase tracking-wider">Previous</span>
              <span className="font-medium">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/textbook/${next.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
          >
            <span className="flex flex-col">
              <span className="text-2xs uppercase tracking-wider">Next</span>
              <span className="font-medium">{next.title}</span>
            </span>
            <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </PageContainer>
  );
}
```

- [ ] **Step 3: Typecheck**

```powershell
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```powershell
git add web/src/pages/TextbookIndexPage.tsx web/src/pages/TextbookChapterPage.tsx
git commit -m "feat(textbook): add index and chapter pages"
```

---

## Task 11: Wire the routes

**Files:**
- Modify: `web/src/routes.tsx`

- [ ] **Step 1: Add the imports and routes**

In `web/src/routes.tsx`, add the imports near the other page imports (alphabetical with the rest):

```typescript
import { TextbookIndexPage } from "@/pages/TextbookIndexPage";
import { TextbookChapterPage } from "@/pages/TextbookChapterPage";
```

Inside the `children` array, add two new entries just before the `{ path: "*", element: <NotFoundPage /> }` catch-all:

```typescript
      { path: "textbook", element: <TextbookIndexPage /> },
      { path: "textbook/:slug", element: <TextbookChapterPage /> },
```

- [ ] **Step 2: Typecheck**

```powershell
npm run typecheck
```

- [ ] **Step 3: Commit**

```powershell
git add web/src/routes.tsx
git commit -m "feat(routes): add /textbook and /textbook/:slug routes"
```

---

## Task 12: Add Textbook to the sidebar + verify pipeline

**Files:**
- Modify: `web/src/components/layout/Sidebar.tsx`
- Create: `web/content/textbook/00-prerequisites.mdx` (hello-world stub)

- [ ] **Step 1: Add the sidebar entry**

In `web/src/components/layout/Sidebar.tsx`, find this line near the imports:

```typescript
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  List,
  Info,
```

Add `GraduationCap` to that import block:

```typescript
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FolderKanban,
  List,
  Info,
```

Then in the JSX, find this block (around line 290):

```tsx
        <div className="mt-3">
          <NavItem
            to="/reading"
            label="Reading List"
            icon={<List className="w-4 h-4" />}
            collapsed={collapsed}
          />
        </div>
```

Insert a new `NavItem` for Textbook directly **before** that "Reading List" block:

```tsx
        <div className="mt-3">
          <NavItem
            to="/textbook"
            label="Textbook"
            icon={<GraduationCap className="w-4 h-4" />}
            collapsed={collapsed}
          />
        </div>

```

- [ ] **Step 2: Create the hello-world MDX stub**

Create `web/content/textbook/00-prerequisites.mdx`. This is a stub to verify the pipeline; Phase 4 will replace it with the real landing page.

```mdx
---
slug: 00-prerequisites
title: Prerequisites — orientation
description: How to read this module, dependency chain across chapters, notation conventions.
order: 0
chapter: 0
reading_minutes: 1
depends_on: []
provides: []
last_reviewed: 2026-05-10
---

# Pipeline smoke test

This is a placeholder to confirm the MDX pipeline renders. Phase 4 of the
implementation replaces this with the real orientation page.

<Callout variant="info" title="Hello">
Inline math: $d_1 = \frac{\ln(S/K)}{\sigma\sqrt{\tau}}$ — verify KaTeX is loading.
</Callout>

<Callout variant="warning">
Variant without an explicit title — should display "Caution".
</Callout>

A sidenote in flowing prose<Sidenote>This expands when clicked. Verify the numbering increments.</Sidenote> and another<Sidenote>Second sidenote — number should be 2.</Sidenote> right after.

<ComparisonTable
  caption="Trivial comparison table to verify the component renders."
  columns={["A", "B", "C"]}
  rows={[
    ["row-1-a", "row-1-b", "row-1-c"],
    ["row-2-a", "row-2-b", "row-2-c"],
  ]}
/>

Display math:

$$
\mathrm{softmax}(x_i) = \frac{e^{x_i}}{\sum_j e^{x_j}}
$$

A fenced code block:

```python
def attention(Q, K, V):
    return softmax(Q @ K.T / math.sqrt(Q.shape[-1])) @ V
```

<Sources items={[
  {
    authors: "Vaswani, A. et al.",
    year: 2017,
    title: "Attention Is All You Need",
    venue: "NeurIPS 2017",
    url: "https://arxiv.org/abs/1706.03762",
    note: "Original transformer paper — cited everywhere in this module."
  }
]} />
```

- [ ] **Step 3: Run the dev server and verify**

```powershell
npm run dev
```

Open http://localhost:5173/textbook. Expected: index page lists one chapter, "Prerequisites — orientation".

Click into it. Expected on the chapter page:
- Title and chapter header render
- Inline math `$d_1 = ...$` rendered by KaTeX
- Display math (softmax) rendered as a centered block
- Two Callout boxes render (info + warning)
- Two Sidenote `[1]` `[2]` superscript markers; clicking expands them
- ComparisonTable renders as a table with header
- Python code block is syntax-highlighted
- Sources block at bottom with one entry linking to arxiv

If any of these fail, debug before moving on. Common issues:
- KaTeX CSS not loading → check Task 3 import in `main.tsx`
- "frontmatter is undefined" → check `remarkMdxFrontmatter` plugin in vite config
- Components undefined inside MDX → check `MdxComponentsProvider` wraps the `<Component />` in `TextbookChapterPage`

Stop the server (Ctrl+C).

- [ ] **Step 4: Typecheck and lint**

```powershell
npm run typecheck
npm run lint
```

Expected: zero errors. Fix any lint issues inline (likely just import ordering).

- [ ] **Step 5: Commit**

```powershell
git add web/src/components/layout/Sidebar.tsx web/content/textbook/00-prerequisites.mdx
git commit -m "feat(textbook): add sidebar link and hello-world mdx stub"
```

---

**Phase 1 verification gate.** Before moving to Phase 2, confirm:

- [ ] `/textbook` shows the index page with one chapter card
- [ ] `/textbook/00-prerequisites` renders the stub with math, callouts, sidenotes, table, code, sources
- [ ] Sidebar "Textbook" link is visible alongside Dashboard/Notes/Projects/Reading List/About
- [ ] No console errors in the browser, no TS errors, no lint errors
- [ ] Existing `/notes/*` and `/projects/*` pages still work (the markdown pipeline is untouched)

---

# Phase 2 — Research briefs

**Goal of Phase 2:** Each of the eight chapters gets a structured *research brief* file under `scratch/research-briefs/` that the Phase 3 writing agent uses as its source material. The brief is a deeply-researched, source-cited intermediate artefact — not the final MDX. The brief enforces the "synthesize knowledge, don't push readers to external resources" requirement, because by the time Phase 3 writes the chapter, all the synthesis work is already done in the brief.

**Concurrency:** Tasks 13a–13h run in parallel via 8 separate `Agent` tool calls in a single message.

**Common research-agent prompt scaffold (used in all eight 13x tasks):**

```
You are a research agent for the frontierllm prereqs textbook module. Your output is a structured research brief that a separate writing agent will use to produce a final MDX chapter — you are NOT writing the chapter.

REPO CONTEXT
- Working directory: C:\Personal\frontierllm
- Design spec: docs/superpowers/specs/2026-05-10-frontierllm-prereqs-textbook-design.md (read sections 4 and 6 carefully)
- Your output goes to scratch/research-briefs/<your-chapter-slug>.md (create the scratch/research-briefs/ directory if it does not exist)

CURRENCY
- All sources must be retrievable. Every URL you cite must be one you actually visited via WebFetch or WebSearch.
- Calibration date: May 10, 2026. Explicitly search for 2025 and 2026 papers and tech reports — do not rely solely on training-cutoff knowledge.
- For each frontier-lab "current practice" claim, name the source (tech report, blog post, paper) and its publication date.

SOURCE POLICY
- Preferred sources, in rough priority order:
  1. arXiv papers and lab technical reports (DeepMind, OpenAI, Anthropic, Meta, DeepSeek, Google, Alibaba, Mistral, Cohere, AI2, Reka, xAI)
  2. Frontier-lab engineering blog posts
  3. Researcher blogs that are the best public exposition (Karpathy, Lilian Weng, Sebastian Raschka, Sasha Rush)
  4. HuggingFace cookbooks, EleutherAI engineering posts
  5. Course notes (Stanford CS25, CMU 11-785, Berkeley CS294) for pedagogy
- For each major source, capture: authors, year, title, venue or URL, and a one-line note on why it is worth citing.
- Aim for 10–20 primary sources per chapter brief.

BRIEF STRUCTURE — emit a markdown file with these sections, in this order:

# Chapter brief: <chapter slug>

## 1. Scope
A short paragraph restating what this chapter covers (lifted from the design spec §4) so the writer knows the boundary.

## 2. Concept map
A bulleted dependency tree of the concepts the chapter must teach, in roughly the order they should be introduced.

## 3. Per-concept synthesis
For each concept on the map, provide:
- **Canonical statement** — one sentence stating what the concept is.
- **Math** — the formal definition with notation, written so the writing agent can drop it into KaTeX with minor reformatting.
- **Worked example** — concrete numbers, end-to-end. The reader should be able to reproduce on a calculator.
- **Why it matters** — what problem it solves or what failure mode it prevents.
- **Frontier-lab practice (May 2026)** — which models / labs ship which variant, with source citation.
- **Failure modes / common confusions** — what readers / users commonly get wrong.
- **Cross-references to other chapters** — when this concept depends on or is depended on by content in another chapter (slugs listed in the design spec §4).

## 4. Comparison table data
For each `<ComparisonTable>` the chapter should include, give the column schema, every row, and the per-row source. The writing agent will drop this directly into MDX.

## 5. Proposed charts
For each illustrative chart the chapter would benefit from, describe: what it shows, what its parameter ranges should be, what story it tells. The writing agent will decide whether to commission a small SVG component or describe the chart in prose only.

## 6. Sources block (final)
The list of sources for the chapter's `<Sources>` MDX block. Each entry: authors, year, title, venue, URL, one-line note. Include only sources you actually used in the brief.

## 7. Gaps and uncertainties
- List places where the literature is divided or you could not find a clean primary source. The writer will hedge in those spots.
- List anything you considered including but cut, with reason.

## 8. Recommended cross-references
- Forward references the chapter should make to *later* chapters in the module.
- Backward references the chapter should make to *earlier* chapters.
- Suggested anchor names so the writer can deep-link with `/textbook/<slug>#<anchor>`.

NON-NEGOTIABLE RULES
- Synthesise. Do not produce "here's a list of links, go read them yourself" — that's exactly the problem we're fixing.
- Every comparison-table row has a source. No exceptions.
- Every "frontier-lab does X" claim has a source with a date.
- If you cannot verify a source, do not cite it.
- Voice in the brief itself can be terse; the writing agent rewrites in textbook voice.

OUTPUT
- A single markdown file at scratch/research-briefs/<chapter-slug>.md
- Aim for 3000–6000 words of dense, structured content.
- Report when done — DO NOT proceed to write the MDX chapter; that's a separate phase.
```

The eight per-chapter tasks below differ only in the chapter slug and the section-specific outline they pass to the agent.

---

## Task 13a: Dispatch research agent — `00a-transformer`

- [ ] **Step 1: Dispatch the agent**

Use the Agent tool with `subagent_type: general-purpose` and the common scaffold above, appended with this chapter-specific block:

```
CHAPTER SLUG: 00a-transformer
CHAPTER TITLE: The transformer block

CONCEPTS TO COVER (from design spec §4):
- The residual-stream framing (Elhage et al's mental model)
- Attention as kernel: queries, keys, values, scaled-dot-product, softmax. Worked numerical example end-to-end.
- The MLP block (basic form — gating goes in 00e-activations-and-gating)
- Block stacking: pre-norm vs post-norm; convergence in 2026 to pre-norm; peri-norm / sandwich-norm variants
- Compute and memory accounting for one block: FLOPs per token (the 6N rule), KV cache per token, activation memory
- Where modern frontier blocks diverge from the 2017 baseline (pointers forward to 00b, 00c, 00d, 00e)

ANCHOR REFERENCES — set up so other chapters can deep-link:
#residual-stream, #attention-math, #mlp-block, #pre-norm-vs-post-norm, #flops-per-token

ESTIMATED LENGTH: 6000–8000 words of MDX (final chapter), so research brief should be ~4000–5000 words.
```

Run the agent in the foreground.

- [ ] **Step 2: Verify the brief exists and looks complete**

After the agent returns:

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00a-transformer.md | Measure-Object -Line -Word
```

Expected: file exists, word count between 3000 and 6000. Open and skim to confirm sections 1–8 are present.

- [ ] **Step 3: No commit yet** — briefs live in `scratch/` which is gitignored. They are working artifacts.

---

## Task 13b: Dispatch research agent — `00b-attention-variants`

- [ ] **Step 1: Dispatch the agent**

Same scaffold, with this chapter-specific block:

```
CHAPTER SLUG: 00b-attention-variants
CHAPTER TITLE: Attention variants and FlashAttention

CONCEPTS TO COVER:
- MHA → MQA → GQA → MLA progression: math, parameter count, KV-cache arithmetic, quality/efficiency tradeoff
- Sliding-window attention (Mistral) and its KV-cache interaction
- FlashAttention conceptual story: online softmax recurrence, IO-aware tiling, why it is equivalent and faster (not a kernel walkthrough — that belongs in tiny-llm and InferenceEngineering)
- Linear / sub-quadratic alternatives (Mamba/SSM, RWKV, Hyena) — brief comparison; primary focus stays on softmax attention
- 2024–2026 hybrid SSM+attention architectures (e.g. Jamba, Zamba, RecurrentGemma) — short treatment

ANCHOR REFERENCES: #mha, #mqa, #gqa, #mla, #sliding-window, #flash-attention, #linear-attention, #ssm-hybrid

CROSS-REFERENCES TO COORDINATE:
- 00a-transformer#attention-math is the prerequisite
- 00c-positional-encodings interacts with attention via RoPE
- 00d-normalization-and-init introduces QK-norm which fixes attention-specific stability issues

ESTIMATED LENGTH: 5000–7000 word MDX chapter, so brief should be ~3500–4500 words.
```

- [ ] **Step 2: Verify the brief**

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00b-attention-variants.md | Measure-Object -Line -Word
```

- [ ] **Step 3: No commit** (brief is in gitignored scratch/).

---

## Task 13c: Dispatch research agent — `00c-positional-encodings`

- [ ] **Step 1: Dispatch the agent**

Same scaffold, with:

```
CHAPTER SLUG: 00c-positional-encodings
CHAPTER TITLE: Positional encodings

CONCEPTS TO COVER:
- Why position matters (attention's permutation equivariance)
- Absolute encodings: sinusoidal (original transformer), learned absolute
- Relative encodings: T5 buckets, ALiBi
- Rotary (RoPE): rotation math, why it functions as a relative encoding, interaction with attention scores, base-frequency choice and what it controls
- Context-extension methods: Position Interpolation (PI), NTK-aware scaling, YaRN, LongRoPE — what each rescales, quality cost
- "What frontier labs ship in 2026" comparison table
- Worked example: rotate a 4-dimensional query/key pair through RoPE end-to-end with concrete numbers

ANCHOR REFERENCES: #sinusoidal, #learned-absolute, #alibi, #rope, #rope-base-frequency, #yarn, #longrope, #frontier-positional-encodings

CROSS-REFERENCES:
- 00a-transformer#attention-math is a prerequisite
- 00b-attention-variants references RoPE interactions

ESTIMATED LENGTH: 5000–7000 word MDX chapter, so brief should be ~3500–4500 words.
```

- [ ] **Step 2: Verify the brief**

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00c-positional-encodings.md | Measure-Object -Line -Word
```

- [ ] **Step 3: No commit.**

---

## Task 13d: Dispatch research agent — `00d-normalization-and-init`

- [ ] **Step 1: Dispatch the agent**

Same scaffold, with:

```
CHAPTER SLUG: 00d-normalization-and-init
CHAPTER TITLE: Normalisation and initialisation

CONCEPTS TO COVER:
- LayerNorm vs RMSNorm: math, what each subtracts/divides, why RMSNorm won (compute + stability), the "removing the mean did nothing" empirical evidence
- Pre-norm vs post-norm: training dynamics, gradient flow, why pre-norm is default, the post-norm revival in some 2024–2025 hybrids
- QK-norm: the attention-logit blowup problem at scale, what it fixes and what it does not
- Initialisation: standard small-variance init, depth-scaled / Wang et al's 2/L-scaled output projection, fan-in scaling, embedding init
- μP and hyperparameter transfer: the mechanism (preserve update RMS as width scales), what mup-transfer actually buys, practical workflow (sweep small → run large)
- Frontier-lab normalisation / init choices in published reports (Llama-3, DeepSeek-V3, Qwen, plus inferred-with-caveat rows for Claude / GPT / Gemini)

ANCHOR REFERENCES: #layernorm, #rmsnorm, #pre-norm-vs-post-norm, #qk-norm, #initialisation, #mup, #frontier-norm-init-table

CROSS-REFERENCES:
- 00a-transformer references pre-norm vs post-norm — this chapter expands
- 00b-attention-variants references QK-norm — this chapter explains it
- 00f-optimizers references μP in the hyperparameter-search context

ESTIMATED LENGTH: 4000–6000 word MDX chapter, so brief should be ~3000–4000 words.
```

- [ ] **Step 2: Verify the brief**

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00d-normalization-and-init.md | Measure-Object -Line -Word
```

- [ ] **Step 3: No commit.**

---

## Task 13e: Dispatch research agent — `00e-activations-and-gating`

- [ ] **Step 1: Dispatch the agent**

Same scaffold, with:

```
CHAPTER SLUG: 00e-activations-and-gating
CHAPTER TITLE: Activations and gating

CONCEPTS TO COVER:
- Activation history: ReLU → GELU → SiLU/Swish. Numerical shape, gradient at zero, motivation for each move.
- Gated Linear Units (GLU family): GLU, SwiGLU, GeGLU, ReGLU. The math. Capacity argument + PaLM-era ablations.
- The 2/3 width adjustment: why SwiGLU blocks use ⅔ · d_ff to match parameter count with a plain MLP. The arithmetic.
- Current frontier-model usage (almost all SwiGLU, plus the few outliers with reasons)

ANCHOR REFERENCES: #relu-gelu-silu, #glu, #swiglu, #two-thirds-width

CROSS-REFERENCES:
- 00a-transformer#mlp-block is a prerequisite; this chapter expands the MLP block with gating
- 00h-moe-plumbing references SwiGLU as the standard expert block

ESTIMATED LENGTH: 3000–5000 word MDX chapter, so brief should be ~2500–3500 words.
```

- [ ] **Step 2: Verify the brief**

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00e-activations-and-gating.md | Measure-Object -Line -Word
```

- [ ] **Step 3: No commit.**

---

## Task 13f: Dispatch research agent — `00f-optimizers`

- [ ] **Step 1: Dispatch the agent**

Same scaffold, with:

```
CHAPTER SLUG: 00f-optimizers
CHAPTER TITLE: Optimisers

CONCEPTS TO COVER:
- SGD, momentum, Nesterov — the floor
- Adaptive methods: Adam, AdamW. Moment estimates math, what each hyperparameter (β1, β2, ε, weight decay) controls. Why AdamW (decoupled weight decay) replaced Adam-with-L2.
- Lion: sign-of-momentum update, compute/memory savings, hyperparameter shifts vs AdamW
- Muon: orthogonalising-update story (Newton-Schulz iteration), where it helps, the 2024–2026 adoption trajectory
- Shampoo / SOAP: second-moment matrix view, compute cost, why frontier labs are or are not shipping it
- Learning-rate schedules: warmup → cosine, WSD (warmup-stable-decay), the "infinite LR" / continual-pretrain schedule revival
- Gradient clipping: per-param vs global, SIO (spike of interest) literature
- Frontier-lab optimiser table: model, optimiser, β1/β2, weight decay, LR schedule, source

ANCHOR REFERENCES: #sgd, #adam, #adamw, #lion, #muon, #shampoo, #lr-schedules, #wsd, #grad-clip, #frontier-optimizer-table

CROSS-REFERENCES:
- 00d-normalization-and-init#mup is the prerequisite for the hparam-transfer paragraph
- All other chapters take the optimiser as given; this chapter is referenced from them but does not reference back

ESTIMATED LENGTH: 5000–7000 word MDX chapter, so brief should be ~3500–4500 words.
```

- [ ] **Step 2: Verify the brief**

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00f-optimizers.md | Measure-Object -Line -Word
```

- [ ] **Step 3: No commit.**

---

## Task 13g: Dispatch research agent — `00g-tokenization-and-objectives`

- [ ] **Step 1: Dispatch the agent**

Same scaffold, with:

```
CHAPTER SLUG: 00g-tokenization-and-objectives
CHAPTER TITLE: Tokenisation, embeddings, training objectives

CONCEPTS TO COVER:
- BPE (Sennrich), byte-level BPE (GPT-2), SentencePiece / unigram LM, tiktoken practicalities. Shape of the merges, vocab-size tradeoff.
- "Is your tokeniser broken" failure modes: glitch tokens, untrained tokens, encoding inconsistencies, the SolidGoldMagikarp class
- Tied vs untied embeddings, parameter saving, the rare cases untied wins
- Embedding norm growth at scale and the QK-norm / embedding-LayerNorm fixes
- Training objectives: causal LM, masked LM (legacy), prefix LM, fill-in-the-middle (FIM) for code, multi-token prediction (DeepSeek-V3 two-token head + 2025–2026 generalisations)
- Label smoothing: math, why most frontier pretraining stopped using it
- Short note on what "loss" means at scale (per-token CE in nats, 2026 calibration of typical loss numbers)

ANCHOR REFERENCES: #bpe, #sentencepiece, #glitch-tokens, #tied-embeddings, #embedding-norm-growth, #causal-lm, #fim, #mtp, #label-smoothing

CROSS-REFERENCES:
- 00d-normalization-and-init references embedding-norm growth; this chapter explains the mechanism
- 00a-transformer references the embedding layer briefly; this chapter is the deep treatment

ESTIMATED LENGTH: 4000–6000 word MDX chapter, so brief should be ~3000–4000 words.
```

- [ ] **Step 2: Verify the brief**

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00g-tokenization-and-objectives.md | Measure-Object -Line -Word
```

- [ ] **Step 3: No commit.**

---

## Task 13h: Dispatch research agent — `00h-moe-plumbing`

- [ ] **Step 1: Dispatch the agent**

Same scaffold, with:

```
CHAPTER SLUG: 00h-moe-plumbing
CHAPTER TITLE: Mixture-of-experts plumbing

CONCEPTS TO COVER:
- Why MoE: FLOPs per token vs parameter-count tradeoff; compute-capacity decoupling
- Routing: top-k gating, expert-choice routing, soft routing — math of each, load-balancing and capacity-factor problems each solves or does not
- Auxiliary losses: load-balance loss, z-loss, router z-loss. What each prevents. Numerical sizing in practice.
- Capacity factor: at training (drop tokens vs pad), at inference (different problem)
- Expert parallelism (EP) at conceptual level — full distributed-training treatment lives in future 04-distributed-training module
- Current frontier MoE landscape (May 2026): DeepSeek-V3-style fine-grained shared-expert designs, Mixtral 8x7B / 8x22B, Snowflake / Databricks hybrids, inferred-with-caveat treatment of GPT-4-class and Claude-class

ANCHOR REFERENCES: #why-moe, #top-k-routing, #expert-choice, #aux-losses, #capacity-factor, #expert-parallelism, #frontier-moe-landscape

CROSS-REFERENCES:
- 00e-activations-and-gating#swiglu is a prerequisite (experts are SwiGLU blocks)
- 00a-transformer is a prerequisite

ESTIMATED LENGTH: 4000–6000 word MDX chapter, so brief should be ~3000–4000 words.
```

- [ ] **Step 2: Verify the brief**

```powershell
Get-Content C:\Personal\frontierllm\scratch\research-briefs\00h-moe-plumbing.md | Measure-Object -Line -Word
```

- [ ] **Step 3: No commit.**

---

**Phase 2 verification gate.** Before moving to Phase 3:

- [ ] Eight brief files exist under `scratch/research-briefs/`
- [ ] Each has all 8 sections from the scaffold
- [ ] Each lists 10–20 sources with URLs
- [ ] User spot-checks 2–3 briefs to confirm they synthesise (not just list)

---

# Phase 3 — Chapter writing

**Goal of Phase 3:** Each of the eight research briefs is turned into a polished MDX chapter file under `web/content/textbook/`.

**Concurrency:** Tasks 14a–14h run in parallel via 8 separate `Agent` tool calls in a single message.

**Common writing-agent prompt scaffold:**

```
You are a writing agent for the frontierllm prereqs textbook module. You take a structured research brief and produce a polished MDX chapter file.

REPO CONTEXT
- Working directory: C:\Personal\frontierllm
- Design spec: docs/superpowers/specs/2026-05-10-frontierllm-prereqs-textbook-design.md (read §6 voice guide carefully)
- Research brief input: scratch/research-briefs/<your-chapter-slug>.md
- Output: web/content/textbook/<your-chapter-slug>.mdx

VOICE
- Neutral textbook (Hull / Goodfellow / Bishop register).
- No verdicts. No "this is dead", no "this is what to trust".
- Where literature has converged (SwiGLU, RoPE, RMSNorm, AdamW), state the convergence and cite. Don't editorialise.
- Where literature is divided, present the tradeoff without picking.
- No marketing copy. Words to avoid: powerful, cutting-edge, state-of-the-art (except when comparing to a dated specific claim), revolutionary, novel.
- Cite primary sources. Most citations in <Sources> at end of chapter; flow-breaking ones in <Sidenote>.
- Date every "frontier labs ship X" claim. If the year is 2026, say so explicitly.

STRUCTURAL REQUIREMENTS
- Frontmatter (YAML, at top of file):
  ---
  slug: <your-chapter-slug>
  title: <chapter title from spec §4>
  description: <one-line description used in cards and search>
  order: <integer, see below>
  chapter: <integer, see below>
  reading_minutes: <integer estimate based on word count: ~250 words/min>
  depends_on: [<slugs of prerequisite chapters>]
  provides: [<short kebab-case keywords this chapter introduces>]
  last_reviewed: 2026-05-10
  ---
- First section of body is an H2 introduction (NOT an H1 — the page header above the MDX provides the title).
- Use H2 for major sections, H3 for sub-sections. Avoid H4+ unless absolutely necessary.
- Every major concept gets: mechanism → math → worked example. Triple-pattern is non-negotiable.
- At least one <ComparisonTable> per chapter, populated from the brief's section 4.
- At least one <Callout> (info or warning), used at a high-leverage moment, not decoratively.
- One or more <Sidenote> per chapter for flow-breaking citations.
- Final section is <Sources items={[...]} /> populated from brief's section 6.
- Math: inline as $...$, display as $$...$$. Follow notation conventions in design spec §6.

CONTENT RULES
- Synthesise — do NOT push the reader to external resources to learn the basics. External links are for deeper reading after the chapter has taught the concept.
- Worked examples use concrete numbers, not symbolic placeholders.
- Cross-references to other chapters use the format `[chapter title](/textbook/<slug>#<anchor>)` matching anchors from the brief's section 8.
- Every <ComparisonTable> row has a source — if a row is closed-lab inferred, append "(inferred from public reports / API behaviour)" to the source cell.
- Length: hit the word-count target from the brief's instructions. Below target = thin; above target by more than 30% = needs trimming.

COMPONENTS YOU MAY USE (no imports needed — auto-injected by MdxComponentsProvider):
- <Callout variant="info|warning|note|exercise" title="optional">...</Callout>
- <Sidenote>caveat or citation</Sidenote>
- <Sources items={[{ authors, year, title, venue?, url?, note? }]} />
- <ComparisonTable columns={["A","B","C"]} rows={[["a1","b1","c1"],...]} caption="optional" />

COMPONENTS YOU MAY NOT INVENT
- Any other JSX component. If you want a visualisation, describe it in prose with the math; chart components are a separate workstream and the integration phase decides which to build.

OUTPUT
- Write directly to web/content/textbook/<your-chapter-slug>.mdx
- Report when done. Do NOT run the dev server or attempt to verify rendering; the integration phase handles that.

NON-NEGOTIABLE RULES
- Synthesise, do not curate.
- Every comparison-table row has a source.
- Every "frontier labs ship X" claim has a dated source.
- Voice stays neutral. No verdicts.
- Math is concrete (numbers in worked examples).
```

The eight tasks below differ in chapter slug, frontmatter values, and which brief they consume.

---

## Task 14a: Write chapter — `00a-transformer`

- [ ] **Step 1: Dispatch the writing agent**

Use the Agent tool with `subagent_type: general-purpose`. Pass the common scaffold above, plus:

```
CHAPTER SLUG: 00a-transformer
CHAPTER TITLE: The transformer block
ORDER: 1
CHAPTER: 1
DESCRIPTION: The residual-stream framing, attention as kernel, the MLP block, and how blocks stack — the canonical building block of every frontier language model.
DEPENDS_ON: []
PROVIDES: [residual-stream, attention-math, mlp-block, pre-norm, flops-per-token]
WORD-COUNT TARGET: 6000–8000 words
INPUT BRIEF: scratch/research-briefs/00a-transformer.md
OUTPUT: web/content/textbook/00a-transformer.mdx
```

- [ ] **Step 2: Verify the chapter exists**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00a-transformer.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00a-transformer.mdx | Measure-Object -Word
```

Expected: file exists, word count between 5000 and 10000.

- [ ] **Step 3: Don't commit yet** — Phase 4 commits all chapters together after the integration audit.

---

## Task 14b: Write chapter — `00b-attention-variants`

- [ ] **Step 1: Dispatch the writing agent**

Common scaffold plus:

```
CHAPTER SLUG: 00b-attention-variants
CHAPTER TITLE: Attention variants and FlashAttention
ORDER: 2
CHAPTER: 2
DESCRIPTION: MHA / MQA / GQA / MLA, sliding-window attention, the FlashAttention idea, and how 2024–2026 hybrid SSM-attention architectures fit in.
DEPENDS_ON: [00a-transformer]
PROVIDES: [mha, mqa, gqa, mla, sliding-window, flash-attention, ssm-hybrid]
WORD-COUNT TARGET: 5000–7000 words
INPUT BRIEF: scratch/research-briefs/00b-attention-variants.md
OUTPUT: web/content/textbook/00b-attention-variants.mdx
```

- [ ] **Step 2: Verify**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00b-attention-variants.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00b-attention-variants.mdx | Measure-Object -Word
```

- [ ] **Step 3: Don't commit yet.**

---

## Task 14c: Write chapter — `00c-positional-encodings`

- [ ] **Step 1: Dispatch the writing agent**

Common scaffold plus:

```
CHAPTER SLUG: 00c-positional-encodings
CHAPTER TITLE: Positional encodings
ORDER: 3
CHAPTER: 3
DESCRIPTION: Sinusoidal, learned, ALiBi, RoPE, and the YaRN / LongRoPE family of context-extension methods — the math, the choices, and what frontier models ship in 2026.
DEPENDS_ON: [00a-transformer]
PROVIDES: [sinusoidal, alibi, rope, yarn, longrope]
WORD-COUNT TARGET: 5000–7000 words
INPUT BRIEF: scratch/research-briefs/00c-positional-encodings.md
OUTPUT: web/content/textbook/00c-positional-encodings.mdx
```

- [ ] **Step 2: Verify**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00c-positional-encodings.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00c-positional-encodings.mdx | Measure-Object -Word
```

- [ ] **Step 3: Don't commit yet.**

---

## Task 14d: Write chapter — `00d-normalization-and-init`

- [ ] **Step 1: Dispatch the writing agent**

Common scaffold plus:

```
CHAPTER SLUG: 00d-normalization-and-init
CHAPTER TITLE: Normalisation and initialisation
ORDER: 4
CHAPTER: 4
DESCRIPTION: LayerNorm vs RMSNorm, pre-norm vs post-norm, QK-norm, initialisation schemes, and μP — the choices that keep frontier-scale training stable.
DEPENDS_ON: [00a-transformer, 00b-attention-variants]
PROVIDES: [rmsnorm, qk-norm, pre-norm, mup]
WORD-COUNT TARGET: 4000–6000 words
INPUT BRIEF: scratch/research-briefs/00d-normalization-and-init.md
OUTPUT: web/content/textbook/00d-normalization-and-init.mdx
```

- [ ] **Step 2: Verify**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00d-normalization-and-init.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00d-normalization-and-init.mdx | Measure-Object -Word
```

- [ ] **Step 3: Don't commit yet.**

---

## Task 14e: Write chapter — `00e-activations-and-gating`

- [ ] **Step 1: Dispatch the writing agent**

Common scaffold plus:

```
CHAPTER SLUG: 00e-activations-and-gating
CHAPTER TITLE: Activations and gating
ORDER: 5
CHAPTER: 5
DESCRIPTION: ReLU / GELU / SiLU, gated linear units (GLU / SwiGLU / GeGLU), the 2/3 width adjustment, and why frontier MLP blocks converged on SwiGLU.
DEPENDS_ON: [00a-transformer]
PROVIDES: [relu, gelu, silu, swiglu, two-thirds-width]
WORD-COUNT TARGET: 3000–5000 words
INPUT BRIEF: scratch/research-briefs/00e-activations-and-gating.md
OUTPUT: web/content/textbook/00e-activations-and-gating.mdx
```

- [ ] **Step 2: Verify**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00e-activations-and-gating.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00e-activations-and-gating.mdx | Measure-Object -Word
```

- [ ] **Step 3: Don't commit yet.**

---

## Task 14f: Write chapter — `00f-optimizers`

- [ ] **Step 1: Dispatch the writing agent**

Common scaffold plus:

```
CHAPTER SLUG: 00f-optimizers
CHAPTER TITLE: Optimisers and learning-rate schedules
ORDER: 6
CHAPTER: 6
DESCRIPTION: SGD through AdamW, Lion, Muon, Shampoo / SOAP, plus the WSD-style learning-rate schedule landscape and gradient clipping — the optimiser choices behind 2026 frontier models.
DEPENDS_ON: [00d-normalization-and-init]
PROVIDES: [adam, adamw, lion, muon, shampoo, wsd-schedule, grad-clip]
WORD-COUNT TARGET: 5000–7000 words
INPUT BRIEF: scratch/research-briefs/00f-optimizers.md
OUTPUT: web/content/textbook/00f-optimizers.mdx
```

- [ ] **Step 2: Verify**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00f-optimizers.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00f-optimizers.mdx | Measure-Object -Word
```

- [ ] **Step 3: Don't commit yet.**

---

## Task 14g: Write chapter — `00g-tokenization-and-objectives`

- [ ] **Step 1: Dispatch the writing agent**

Common scaffold plus:

```
CHAPTER SLUG: 00g-tokenization-and-objectives
CHAPTER TITLE: Tokenisation, embeddings, and training objectives
ORDER: 7
CHAPTER: 7
DESCRIPTION: BPE and SentencePiece, glitch-token failure modes, tied embeddings, embedding-norm growth, and the menagerie of pretraining objectives (CLM, FIM, MTP, label smoothing) in 2026.
DEPENDS_ON: [00a-transformer]
PROVIDES: [bpe, sentencepiece, tied-embeddings, embedding-norm-growth, causal-lm, fim, mtp]
WORD-COUNT TARGET: 4000–6000 words
INPUT BRIEF: scratch/research-briefs/00g-tokenization-and-objectives.md
OUTPUT: web/content/textbook/00g-tokenization-and-objectives.mdx
```

- [ ] **Step 2: Verify**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00g-tokenization-and-objectives.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00g-tokenization-and-objectives.mdx | Measure-Object -Word
```

- [ ] **Step 3: Don't commit yet.**

---

## Task 14h: Write chapter — `00h-moe-plumbing`

- [ ] **Step 1: Dispatch the writing agent**

Common scaffold plus:

```
CHAPTER SLUG: 00h-moe-plumbing
CHAPTER TITLE: Mixture-of-experts plumbing
ORDER: 8
CHAPTER: 8
DESCRIPTION: Why MoE, routing functions (top-k, expert choice, soft), auxiliary losses (load-balance, z-loss), capacity factors, and the 2026 frontier-MoE landscape from DeepSeek-V3 through inferred Anthropic / OpenAI / Google designs.
DEPENDS_ON: [00a-transformer, 00e-activations-and-gating]
PROVIDES: [top-k-routing, expert-choice, aux-losses, capacity-factor, expert-parallelism]
WORD-COUNT TARGET: 4000–6000 words
INPUT BRIEF: scratch/research-briefs/00h-moe-plumbing.md
OUTPUT: web/content/textbook/00h-moe-plumbing.mdx
```

- [ ] **Step 2: Verify**

```powershell
Test-Path C:\Personal\frontierllm\web\content\textbook\00h-moe-plumbing.mdx
Get-Content C:\Personal\frontierllm\web\content\textbook\00h-moe-plumbing.mdx | Measure-Object -Word
```

- [ ] **Step 3: Don't commit yet.**

---

**Phase 3 verification gate.** Before moving to Phase 4:

- [ ] Eight `.mdx` chapter files exist under `web/content/textbook/`
- [ ] Each has YAML frontmatter with the required keys
- [ ] Word counts are within target ranges
- [ ] Run `npm run dev`, navigate to `/textbook`, confirm eight chapter cards appear
- [ ] Click into each chapter; confirm it renders (math, callouts, sidenotes, sources, table)
- [ ] No console errors in browser

If any chapter fails to render, re-dispatch the writing agent for that specific chapter with the error message included in the prompt.

---

# Phase 4 — Integration

**Goal of Phase 4:** Cross-reference audit, write the real landing page, voice and notation consistency pass, update the search index to include MDX content, and update README + ROADMAP.

## Task 15: Audit cross-references and notation

**Files:**
- Modify (as needed): each `web/content/textbook/00[a-h]-*.mdx` file

- [ ] **Step 1: Dispatch a code-reviewer agent**

Use Agent with `subagent_type: feature-dev:code-reviewer` and this prompt:

```
You are auditing eight MDX chapter files for cross-reference correctness and notation consistency. They are part of the prereqs textbook module at:
- C:\Personal\frontierllm\web\content\textbook\00a-transformer.mdx
- C:\Personal\frontierllm\web\content\textbook\00b-attention-variants.mdx
- C:\Personal\frontierllm\web\content\textbook\00c-positional-encodings.mdx
- C:\Personal\frontierllm\web\content\textbook\00d-normalization-and-init.mdx
- C:\Personal\frontierllm\web\content\textbook\00e-activations-and-gating.mdx
- C:\Personal\frontierllm\web\content\textbook\00f-optimizers.mdx
- C:\Personal\frontierllm\web\content\textbook\00g-tokenization-and-objectives.mdx
- C:\Personal\frontierllm\web\content\textbook\00h-moe-plumbing.mdx

CHECK AND REPORT (do not edit files yourself; produce a report I'll act on):

1. CROSS-REFERENCES: For every link of the form /textbook/<slug>#<anchor>, verify (a) the slug exists in the file list above, and (b) the anchor — generated from a heading in the target file via rehype-slug, which lowercases and replaces spaces with hyphens — exists in the target. List every broken reference with file:line.

2. NOTATION: Search every chapter for the symbols below and report inconsistencies:
   - $d_{model}$ vs $d_{embed}$ vs $d$ (pick one — flag deviations)
   - $h$ as "number of heads" vs as "head dim" — must be consistent within and across chapters
   - $\\sigma$ for "softmax temperature" / "activation" / "layer-norm scale" — flag overloads
   - Use of "log" (natural log) vs "ln" — pick one

3. VOICE: Skim each chapter for "marketing copy" violations. Words to flag: powerful, revolutionary, cutting-edge, novel, breakthrough, game-changing, state-of-the-art used without a dated comparison.

4. CITATION COVERAGE: For each <ComparisonTable> in every chapter, verify every row has a source cell. Flag rows without sources.

5. SOURCES BLOCK PRESENCE: Every chapter must end with a <Sources items={[...]} /> block. Flag any that don't.

OUTPUT FORMAT: structured markdown report with sections for each of the five checks. Provide concrete file:line citations.
```

Run the agent in the foreground.

- [ ] **Step 2: Apply the fixes**

For each finding in the report, edit the relevant chapter file to fix the issue. Use `Edit` tool with exact `old_string` / `new_string`.

- [ ] **Step 3: Re-run the dev server and confirm chapters still render**

```powershell
npm run dev
```

Click through every chapter. Stop the server.

- [ ] **Step 4: Don't commit yet** — landing page (Task 16) and search index (Task 17) commit together.

---

## Task 16: Write the real landing page

**Files:**
- Modify: `web/content/textbook/00-prerequisites.mdx` (currently a hello-world stub)

- [ ] **Step 1: Dispatch a writing agent for the landing page**

Use Agent with `subagent_type: general-purpose`:

```
You are writing the landing page for the prerequisites textbook module. The eight chapters are already written. Your job is to produce the orientation page that ties them together.

CONTEXT
- Working directory: C:\Personal\frontierllm
- Design spec: docs/superpowers/specs/2026-05-10-frontierllm-prereqs-textbook-design.md (read sections 4 and 6)
- The eight existing chapter files at web/content/textbook/00[a-h]-*.mdx — READ ALL OF THEM before writing the landing page. The landing must summarise their actual content.
- The current web/content/textbook/00-prerequisites.mdx is a hello-world stub. REPLACE IT entirely.

VOICE
- Neutral textbook (see design spec §6). No verdicts. No marketing copy.
- Modelled on greek's 00-intro.mdx in structure (but neutral, not opinionated):
  - What the module is and what it isn't
  - Prerequisites for THIS module (calculus, linear algebra, basic probability, having trained a small NN)
  - Dependency chain across the eight chapters
  - Reading-order recommendations for three reader profiles: deep refresher / calibration check / first time
  - Notation conventions used module-wide
  - "What success looks like" — six concrete skills

STRUCTURAL REQUIREMENTS
- Same frontmatter shape as the chapters, with:
  slug: 00-prerequisites
  title: Prerequisites — orientation
  description: How to read this module, dependency chain across chapters, and notation conventions.
  order: 0
  chapter: 0
  reading_minutes: <integer>
  depends_on: []
  provides: []
  last_reviewed: 2026-05-10
- Use <Callout>, <Sidenote>, <ComparisonTable>, <Sources> as needed
- Cross-reference every chapter by slug

WORD-COUNT TARGET: 3000–5000 words

OUTPUT: overwrite web/content/textbook/00-prerequisites.mdx
```

- [ ] **Step 2: Verify**

```powershell
Get-Content C:\Personal\frontierllm\web\content\textbook\00-prerequisites.mdx | Measure-Object -Word
```

Expected: 2500–6000 words.

- [ ] **Step 3: Render-check**

```powershell
npm run dev
```

Open http://localhost:5173/textbook/00-prerequisites — confirm renders. Confirm every cross-reference link works.

- [ ] **Step 4: Don't commit yet** — combined commit with Task 17.

---

## Task 17: Extend the search index to cover MDX chapters

**Files:**
- Create: `web/scripts/build-textbook.ts`
- Modify: `web/vite.config.ts`
- Modify: `web/src/lib/search-index.ts` (or whichever file builds the search index — confirm by reading first)

- [ ] **Step 1: Read the existing search-index implementation**

```powershell
Get-Content C:\Personal\frontierllm\web\src\lib\search-index.ts | Select-Object -First 60
```

Inspect to understand the existing record shape. The MDX chapters must be added as records with the same shape (typically: `{ id, slug, title, heading, anchor, content }`).

- [ ] **Step 2: Write the textbook search-index builder**

Create `web/scripts/build-textbook.ts`:

```typescript
/**
 * build-textbook.ts
 *
 * Extracts text content from MDX chapter files in web/content/textbook/ and
 * emits search records compatible with the existing search index. Runs from
 * the frontierllm-content Vite plugin as a sibling of build-content.ts.
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
  // Remove JSX components (best-effort regex; good enough for indexing)
  return body
    .replace(/<[A-Z][^>]*\/>/g, " ") // self-closing JSX
    .replace(/<[A-Z][\s\S]*?>([\s\S]*?)<\/[A-Z][a-zA-Z]*>/g, " $1 ") // paired JSX
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // display math
    .replace(/\$[^$]*\$/g, " ") // inline math
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → keep text
    .replace(/[#*_>`]/g, " ") // markdown markers
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
    const slug = frontmatter.slug as string;
    const title = frontmatter.title as string;
    if (!slug || !title) continue;

    // Chunk by H2 / H3
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
      const h = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
      if (h) {
        flush();
        buffer = [];
        currentHeading = h[2];
        currentAnchor = slugify(h[2]);
      } else {
        buffer.push(line);
      }
    }
    flush();
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(records, null, 2));
}
```

- [ ] **Step 3: Call buildTextbook from the Vite plugin**

In `web/vite.config.ts`, find the line `const { buildContent } = await import("./scripts/build-content.js");` and add directly below it:

```typescript
  const { buildTextbook } = await import("./scripts/build-textbook.js");
```

Then in the same plugin, replace every `await buildContent();` call (there should be three: one in `buildStart`, one in the `change` handler, one in the `add` handler) with:

```typescript
            await buildContent();
            await buildTextbook();
```

(Indentation matches the existing call site.)

Also extend the chokidar watch path list to include the textbook directory. Find:

```typescript
        [
          resolve(__dirname, "../notes"),
          resolve(__dirname, "../projects"),
          resolve(__dirname, "../README.md"),
        ],
```

Change to:

```typescript
        [
          resolve(__dirname, "../notes"),
          resolve(__dirname, "../projects"),
          resolve(__dirname, "../README.md"),
          resolve(__dirname, "./content/textbook"),
        ],
```

- [ ] **Step 4: Wire the textbook records into the in-app search index**

Open `web/src/lib/search-index.ts`. The existing code loads `manifest.json` records and indexes them. Add an import for the textbook search records (the generated file from Step 2 above) and merge them into the same index:

```typescript
import textbookRecordsRaw from "@/generated/textbook-search.json";

// near where existing records are collected:
const textbookRecords = (textbookRecordsRaw as TextbookSearchRecord[]).map(
  (r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    heading: r.heading,
    anchor: r.anchor,
    content: r.content,
    kind: "textbook" as const,
    href: `/textbook/${r.slug}#${r.anchor}`,
  }),
);
```

Then concatenate `textbookRecords` into the array the MiniSearch index is built from. Update the `Result` type if needed so the search-results page can render textbook hits.

> **Note:** the exact shape of the existing search-index code depends on its current implementation. If the integration doesn't drop in cleanly, read the file in full first and adapt. The goal is: "cmd-K returns textbook chapter sections as results, click-through opens the chapter at the right anchor."

- [ ] **Step 5: Typecheck**

```powershell
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 6: Verify search works**

```powershell
npm run dev
```

Open http://localhost:5173, press Cmd-K (or Ctrl-K), type "RoPE" or "AdamW" or "RMSNorm" — expect textbook chapter results to appear. Click through and confirm the anchor scroll lands at the right heading.

Stop the server.

- [ ] **Step 7: Lint and commit chapters + landing + search-index changes together**

```powershell
npm run lint
npm run typecheck
```

Fix any issues. Then:

```powershell
git add web/content/textbook/ web/scripts/build-textbook.ts web/vite.config.ts web/src/lib/search-index.ts
git commit -m "feat(textbook): add prereqs module (1 landing + 8 chapters) with search"
```

---

## Task 18: Update notes/00-foundations/README.md with banner

**Files:**
- Modify: `notes/00-foundations/README.md`

- [ ] **Step 1: Add a top-of-page banner**

Open `notes/00-foundations/README.md`. After the `# 00 — Foundations` heading and before the `## What this is` heading, insert a blockquote banner:

```markdown
> **Looking for the taught material?** The prerequisites textbook lives at
> [/textbook](/textbook). The reading list below is the curated bibliography
> behind those chapters.
```

- [ ] **Step 2: Commit**

```powershell
git add notes/00-foundations/README.md
git commit -m "docs(notes): link foundations to textbook module"
```

---

## Task 19: Update README.md and ROADMAP.md

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`

- [ ] **Step 1: Update the top-level README.md**

In `README.md`, find the "Layout" section. Update the description of `notes/` to reflect that taught material now lives under `web/content/textbook/`, and add a new line for the textbook tree:

Change:
```
notes/        # conceptual layer — markdown synthesis + reading lists per topic
```

To:
```
notes/        # reading lists per topic (curated bibliography)
web/content/textbook/  # taught chapters rendered at /textbook (MDX)
```

Then in the "Where to start" section, add a bullet:
- "**Prereqs textbook:** start at [`web/content/textbook/00-prerequisites.mdx`](web/content/textbook/00-prerequisites.mdx) or visit `/textbook` in the web reader for the full eight-chapter module on transformers, attention variants, positional encodings, normalisation, activations, optimisers, tokenisation, and MoE plumbing."

- [ ] **Step 2: Update ROADMAP.md**

In `ROADMAP.md`, in the "Notes" section, update the `00-foundations` line to indicate the textbook now covers the synthesis:

Change:
```
- `00-foundations/` — refresher on what's assumed (transformer math, optimization basics) — *0/6 done*
```

To:
```
- `00-foundations/` — reading list, with synthesis now in textbook module at `/textbook` — *bibliography only*
```

Add a new top-level "Textbook" section after "Notes":

```markdown
## Textbook

- `web/content/textbook/00-prerequisites` — prereqs module (1 landing + 8 chapters) — *shipped 2026-05-10*
- *(future)* pretraining textbook module — *not started*
- *(future)* post-training, RLHF, distributed, eval, alignment textbook modules — *not started*
```

- [ ] **Step 3: Commit**

```powershell
git add README.md ROADMAP.md
git commit -m "docs: announce prereqs textbook module in README and ROADMAP"
```

---

## Task 20: Final smoke test

**Files:** None (verification only)

- [ ] **Step 1: Clean build**

```powershell
npm run build
```

Expected: build succeeds. No TypeScript errors, no Vite errors. Look for any KaTeX warnings — they're usually fixable.

- [ ] **Step 2: Preview the production build**

```powershell
npm run preview
```

Open http://localhost:4173. Walk through:

- [ ] Dashboard renders
- [ ] Sidebar shows "Textbook" entry
- [ ] `/textbook` lists nine entries (landing + 8 chapters)
- [ ] Each chapter renders with math, callouts, sidenotes, tables, sources
- [ ] Cross-references between chapters work (anchor scrolling)
- [ ] cmd-K search returns textbook content; clicking results opens the right anchor
- [ ] Existing `/notes/*` and `/projects/*` pages still render unchanged
- [ ] `/notes/00-foundations` shows the new banner pointing to `/textbook`

Stop the server.

- [ ] **Step 3: Lint and typecheck final**

```powershell
npm run lint
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 4: No additional commit needed** — all changes have been committed in their respective tasks. If any final fixes were applied during Step 2 smoke test, commit them with `git commit -m "fix: smoke-test fixups"`.

- [ ] **Step 5: Report success**

The textbook module is shipped. The web reader at `/textbook` is the new home for taught prereqs content. Reading lists in `notes/00-foundations/` link forward to it. The other seven topic areas (pretraining, post-training, RLHF, distributed, eval, alignment, frontier labs) remain reading-list-only and are the subject of future textbook deliveries.

---

# Self-review

## Spec coverage

- §2 In scope: new MDX path → Tasks 1–11. Eight chapters → 13a-h research + 14a-h writing. Six components → Tasks 4–8 (Callout, Sidenote, Sources, ComparisonTable, MdxComponents provider; Math is documented as optional in spec and not built here). Pipeline → Tasks 1–2, 17. Agent dispatch → Tasks 13, 14. Search → Task 17. ✓
- §3 Architecture file layout: implemented in Tasks 1–12. ✓
- §3 Frontmatter schema: enforced in writing-agent prompts (Tasks 14a-h) and read by `textbook.ts` (Task 9). ✓
- §3 Relationship to existing notes/: banner added in Task 18, README/ROADMAP updated in Task 19. ✓
- §4 Nine MDX files with the section-by-section content specs: each writing-task prompt references the spec by name and the brief (Phase 2) is structured to match the spec section layout. ✓
- §5 Components: built in Tasks 4–8. ✓
- §6 Voice guidance: embedded in the common Phase-3 prompt scaffold. Audit in Task 15. ✓
- §7 May 2026 currency: enforced in Phase-2 prompt scaffold. `last_reviewed` frontmatter date set in 14a-h prompts. ✓
- §8 4-phase dispatch plan: each phase is one section here. ✓
- §10 Success criteria: covered by Task 20 smoke test checklist. ✓
- §11 Non-goals: respected — markdown pipeline untouched, no auth, no backend, charts not built (deferred). ✓

## Placeholder scan

- No "TBD" / "TODO" / "implement later".
- One soft place: Task 17 Step 4 reads "the exact shape of the existing search-index code depends on its current implementation. If the integration doesn't drop in cleanly, read the file in full first and adapt." — this is honest engineering guidance, not a placeholder; the goal statement that follows is concrete.
- Per-chapter agent prompts contain exact slugs, anchors, depends_on lists, word-count targets, and reference to the specific research brief file. No placeholders. ✓

## Type consistency

- `ChapterEntry` / `ChapterFrontmatter` / `ChapterModule` defined in Task 9 are used in Task 10 (`getChapter`, `getAllChapters`, `getAdjacentChapters`) consistently. ✓
- `Callout` props (`variant`, `title`, `children`) match what the writing-agent prompt scaffold tells writers to use. ✓
- `ComparisonTable` props (`columns`, `rows`, `caption`) match. ✓
- `Sources` `SourceItem` shape (`{ authors, year, title, venue?, url?, note? }`) matches what the research-brief and writing-agent prompts produce. ✓
- `TextbookSearchRecord` defined in Task 17 — used internally by `build-textbook.ts`, mapped into the existing search-record shape in Step 4. ✓

No issues found. Plan is ready for execution.
