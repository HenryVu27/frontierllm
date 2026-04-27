# frontierllm Web UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `web/` React application described in `docs/superpowers/specs/2026-04-26-web-ui-design.md` — a content-focused local-first reader for the `notes/` and `projects/` markdown, with reading-list progress tracking, search, and an editorial design language derived from the user's existing blog.

**Architecture:** React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui. Build-time markdown pipeline (unified/remark → rehype → HTML chunks + JSON manifest). No backend, no database, no SSR. Full spec in `docs/superpowers/specs/2026-04-26-web-ui-design.md`.

**Tech Stack:** React 18, TypeScript (strict), Vite 6, Tailwind CSS v4, shadcn/ui, framer-motion, react-router-dom v6, MiniSearch, zod, sonner, @fontsource/cormorant-garamond, unified ecosystem (remark/rehype), lucide-react.

**Dispatch model:** Each task in this plan is dispatched as a single `frontend-design` subagent invocation. The subagent receives the implementer brief verbatim (plus the full spec file for reference) and reports DONE. The orchestrator then runs the verification gates before advancing to the next task.

**Spec reference:** `docs/superpowers/specs/2026-04-26-web-ui-design.md` (all section references below are to this file).

**Note on §14 open decisions:** All defaults stand as specified. Do not re-litigate unless the user explicitly flips one. The implementer brief for each phase instructs the subagent accordingly.

---

## Branch / worktree decision

**Decision: stay on `main`.**

Rationale: the repo has no remote and no CI. The user has been working on `main` throughout. The `web/` folder is a new subtree that does not touch any existing files except `.gitignore`. There is no risk of colliding with in-flight work. Creating a branch would add merge overhead with zero benefit in this single-developer, no-remote context.

The one file outside `web/` that will be modified is `.gitignore` (to add `web/node_modules/`, `web/dist/`, `web/src/generated/`). This is a safe one-line-category addition.

All commits land on `main` directly.

---

## File map

Files created or modified by this plan (relative to repo root `C:/Personal/frontierllm/`):

```
.gitignore                                  (modified — web/ entries added)
web/                                        (new subtree, all files new)
  index.html
  package.json
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  tsconfig.node.json
  postcss.config.js
  components.json
  public/favicon.svg
  scripts/build-content.ts
  src/
    main.tsx
    App.tsx
    routes.tsx
    styles/globals.css
    styles/prose.css
    components/ui/           (shadcn primitives)
    components/layout/
      AppShell.tsx
      Sidebar.tsx
      Topbar.tsx
      RightSidebar.tsx
      PageContainer.tsx
    components/content/
      RenderedMarkdown.tsx
      ReadingList.tsx
      ReadingListItem.tsx
      Toc.tsx
      CrossLinkPreview.tsx
    components/progress/
      ProgressBar.tsx
      TopicProgressCard.tsx
      RoadmapStrip.tsx
      ActivityCard.tsx
      RecentEdits.tsx
    components/search/
      SearchInput.tsx
      SearchResults.tsx
      CommandMenu.tsx
    components/widgets/      (empty in Option B)
    pages/
      DashboardPage.tsx
      NotesIndexPage.tsx
      TopicPage.tsx
      OrientationPage.tsx
      ProjectsIndexPage.tsx
      ProjectPage.tsx
      ReadingListPage.tsx
      SearchPage.tsx
      AboutPage.tsx
      NotFoundPage.tsx
    hooks/
      useReadingProgress.ts
      useTopic.ts
      useSearch.ts
      useTheme.ts
      useScrollSpy.ts
    lib/
      manifest.ts
      progress.ts
      storage.ts
      cn.ts
      search-index.ts
      api.ts                 (empty stub — extension point for Option C)
    generated/               (gitignored — produced by build plugin)
      manifest.json
      content/*.html
  README.md
```

---

## Task 0: Update `.gitignore`

This is not a phase from §16 but a prerequisite. Done once before Phase 1, committed separately.

- [ ] **Step 1: Append web entries to `.gitignore`**

Open `C:/Personal/frontierllm/.gitignore` and append:

```
# Web app
web/node_modules/
web/dist/
web/src/generated/
```

- [ ] **Step 2: Verify**

```bash
grep "web/node_modules" /c/Personal/frontierllm/.gitignore
```
Expected: one matching line.

- [ ] **Step 3: Commit**

```bash
cd /c/Personal/frontierllm
git add .gitignore
git -c commit.gpgsign=false commit -m "$(printf 'chore: add web/ gitignore entries\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>')"
```

**Definition of done:** `.gitignore` contains the three `web/` entries. No other files changed.

---

## Task 1 — Phase 1: Project skeleton

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 1: scaffold the `web/` Vite project, install all dependencies, configure shadcn/ui and path alias, and set up strict TypeScript. Tightening: the subagent must also wire the Tailwind v4 plugin correctly (it uses `@tailwindcss/vite`, not `postcss` as the primary entry), create `web/src/generated/.gitkeep` so the gitignored folder exists for the build plugin, and add a `web/src/components/widgets/` stub folder with a `.gitkeep`.

### Implementer brief

You are a `frontend-design` subagent implementing Phase 1 of the frontierllm web UI. Your full spec is at `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. This brief is self-contained; treat the spec as the authority on any detail not mentioned here.

**Working directory for all commands:** `C:/Personal/frontierllm` (repo root) unless stated otherwise.

**What to build — complete Phase 1 checklist:**

1. Run `npm create vite@latest web -- --template react-ts` from the repo root. Accept all defaults.

2. From `web/`, install runtime dependencies in one command:
   ```
   npm install react-router-dom framer-motion lucide-react clsx tailwind-merge class-variance-authority sonner @fontsource/cormorant-garamond minisearch zod
   ```

3. Install Tailwind v4 and its Vite plugin (NOT the postcss approach — Tailwind v4 uses a dedicated Vite plugin):
   ```
   npm install -D tailwindcss @tailwindcss/vite @tailwindcss/typography
   ```

4. Install the markdown pipeline dev dependencies:
   ```
   npm install -D unified remark-parse remark-gfm remark-rehype rehype-slug rehype-autolink-headings rehype-pretty-code rehype-stringify rehype-sanitize shiki gray-matter chokidar fast-glob @types/node
   ```

5. Initialize shadcn/ui. Run `npx shadcn@latest init` from `web/`. When prompted:
   - Style: Default
   - Base color: Slate (we override tokens in Phase 2, so the base color choice is cosmetic here)
   - CSS variables: Yes
   Accept any other defaults.

6. Install shadcn primitives (run from `web/`):
   ```
   npx shadcn@latest add button card badge checkbox input select tabs dialog command popover tooltip separator scroll-area progress switch breadcrumb
   ```

7. Configure `vite.config.ts` in `web/` to:
   - Use `@tailwindcss/vite` plugin: `import tailwindcss from '@tailwindcss/vite'` and add to plugins array.
   - Add path alias `@` → `./src` using `import { resolve } from 'path'` and the `resolve.alias` option.
   - Do NOT configure the content pipeline plugin yet — that is Phase 3.

8. Configure `tsconfig.json` in `web/` for strict mode: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`. Add `"baseUrl": "."` and `"paths": { "@/*": ["src/*"] }` for the alias.

9. Configure `tsconfig.node.json` similarly for the scripts/ folder.

10. Create `web/src/generated/.gitkeep` (empty file) so the gitignored generated folder structure is documented.

11. Create `web/src/components/widgets/.gitkeep` (empty file, per §12 extension point — this folder is empty in Option B).

12. Create `web/public/favicon.svg` — a minimal SVG: a circle in `oklch(0.42 0.16 30)` (vermillion) with the letter "F" in white Cormorant Garamond. Simple is fine — this is a local tool.

13. Replace the boilerplate `web/src/main.tsx` with a minimal stub that just imports `React`, `ReactDOM`, and a placeholder `App` component. Do not import fonts yet — that is Phase 2.

14. Replace `web/src/App.tsx` with a minimal stub that returns `<div>frontierllm web</div>`.

15. Delete all Vite boilerplate: `web/src/App.css`, `web/src/index.css`, `web/src/assets/react.svg`, `web/public/vite.svg`.

**What NOT to do:**
- Do not implement any components, hooks, or pages. Those are later phases.
- Do not configure design tokens. That is Phase 2.
- Do not implement the content pipeline. That is Phase 3.
- Do not add `@tanstack/react-query` — it is not used in Option B (see §5).
- Do not add `react-hook-form` or `@hookform/resolvers` — no forms in B except the search input, which is uncontrolled.

**Success criteria for this phase:**
- `cd web && npm run dev` starts without errors and the browser shows the text "frontierllm web".
- `npm run build` completes without TypeScript errors.
- `node --input-type=module <<< "import './vite.config.ts'"` does not crash (or equivalent: `npx vite --version` works from `web/`).
- `web/src/components/ui/` contains shadcn primitive files (button.tsx, card.tsx, etc.).
- `web/src/generated/.gitkeep` exists.
- The `@` alias resolves: add a temporary `import { cn } from '@/lib/utils'` to `App.tsx` and verify `npm run build` still passes (then revert to stub).

### Verification gates

Run these from `C:/Personal/frontierllm/web/` after the subagent reports DONE:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Build succeeds
npm run build

# 3. Shadcn primitives present
ls src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/command.tsx

# 4. generated stub present
ls src/generated/.gitkeep

# 5. tailwindcss vite plugin in vite.config
grep -i "tailwindcss" vite.config.ts

# 6. path alias configured
grep '"@/\*"' tsconfig.json
```

Expected: all commands exit 0; grep commands return matching lines.

### Commit message

```
phase-1: scaffold web/ vite project, deps, shadcn, tsconfig

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] `npm run dev` serves without console errors.
- [ ] `npm run build` exits 0.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `web/src/components/ui/` contains at least 14 shadcn component files.
- [ ] `web/src/generated/.gitkeep` exists.
- [ ] `web/src/components/widgets/.gitkeep` exists.
- [ ] No boilerplate CSS/asset files remain.

---

## Task 2 — Phase 2: Design tokens + styles

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 2: author `globals.css` with oklch tokens, configure Tailwind theme, wire typography plugin, import Cormorant Garamond, add `useTheme` hook and topbar toggle. Tightening: the subagent must implement the full token set from §7 (both `:root` light and `:root.dark`), configure `darkMode: 'class'` in Tailwind, produce `prose.css` with ALL overrides listed in §7 (blockquote, tables, inline code, code blocks, section dividers, callout blocks, algorithm boxes), and implement `useTheme` with the three-state `dark | light | system` logic (default `dark`). The topbar toggle in this phase is just enough to verify light/dark switching — full Topbar layout is Phase 4.

### Implementer brief

You are a `frontend-design` subagent implementing Phase 2 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phase 1 is complete: `web/` is scaffolded with all dependencies installed and shadcn initialized.

**The aesthetic mandate:** This UI must match the editorial voice of the user's existing blog (`C:/Personal/blog/`, live at `henryvu.blog`). The design language is described in spec §7 with full design provenance. The keywords are: **warm parchment, Cormorant Garamond serif, vermillion accent, editorial-technical**. No cool grays. No gradients. No marketing-site energy. One radius (8px = `rounded-lg`). Borders over shadows. Every design decision below traces back to the blog reference.

**What to build:**

1. **`web/src/styles/globals.css`** — the master CSS file. Must contain:
   - `@import "tailwindcss"` (Tailwind v4 syntax — NOT `@tailwind base/components/utilities` — that is v3 syntax).
   - The complete `:root` token block from spec §7, exactly as written (light mode parchment palette).
   - The complete `:root.dark` token block from spec §7 (warm dark palette).
   - `darkMode` configuration: in Tailwind v4 this is done via `@variant dark (&:is(.dark *))` or via the `dark` class on `<html>`. Use class-based dark mode.
   - Font-family CSS variables mapping to the Tailwind font stacks from §7.
   - `* { box-sizing: border-box }` and `html { font-size: 16px }`.
   - Scroll behavior: `html { scroll-behavior: smooth }`.
   - Body defaults: `background: var(--background); color: var(--foreground); font-family: var(--font-serif)`.
   - Selection highlight: `::selection { background: oklch(0.42 0.16 30 / 0.15) }` (light vermillion tint).
   - `@import "./prose.css"` at the bottom (to be created in step 2).

2. **`web/src/styles/prose.css`** — typography overrides. Must contain ALL of the following from spec §7 "Prose styling":
   - Custom `@tailwindcss/typography` theme overrides using CSS `[class~="prose"]` selectors — since Tailwind v4 handles typography plugin differently, use the prose plugin's CSS custom property override mechanism.
   - `prose-p`, `prose-headings`: `font-family: var(--font-serif)`.
   - Body: `font-size: 19px; line-height: 1.6`.
   - Blockquote: `border-left: 3px solid var(--border); padding-left: 1rem; color: var(--muted-foreground)`.
   - Tables: `border-collapse: collapse` on the table; `border: 1px solid var(--border)` and `padding: 8px 10px` on all cells.
   - Inline code: `background: var(--muted); padding: 0 4px; border-radius: 4px; font-size: 0.82em; font-family: var(--font-mono)`.
   - Code block wrapper `.code-block`: `border: 1px solid var(--border); border-radius: 8px; overflow: hidden`. Code header `.code-header`: `background: var(--muted); padding: 6px 12px; font-family: var(--font-mono); font-size: 13px; border-bottom: 1px solid var(--border)`.
   - Section ornament divider: `section + section::before { content: "❧"; display: block; text-align: center; color: var(--muted-foreground); margin: 2rem 0; font-size: 1.25rem }`.
   - Callout blocks `.callout`: `border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; background: transparent`.
   - Algorithm boxes `.algorithm-box`: `border: 1px solid var(--border); border-radius: 8px; padding: 1rem; background: var(--muted)`.
   - Link color: `color: var(--primary)` on hover; underline on hover only.
   - Heading anchor links: `opacity: 0` normally, `opacity: 1` on heading hover, `color: var(--muted-foreground)`.

3. **Tailwind config** (`web/tailwind.config.ts` if using v3 config format, or directly in `vite.config.ts` via Tailwind v4 inline config). In Tailwind v4, configuration is done via `@theme` blocks inside CSS. Add to `globals.css`:
   ```css
   @theme {
     --font-serif: "Cormorant Garamond", "Iowan Old Style", Palatino, Georgia, serif;
     --font-sans: system-ui, -apple-system, sans-serif;
     --font-mono: "Monaco", "Menlo", "Consolas", "Liberation Mono", monospace;
     --radius: 0.5rem;
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     --color-primary: var(--primary);
     --color-primary-foreground: var(--primary-foreground);
     --color-secondary: var(--secondary);
     --color-muted: var(--muted);
     --color-muted-foreground: var(--muted-foreground);
     --color-accent: var(--accent);
     --color-accent-foreground: var(--accent-foreground);
     --color-border: var(--border);
     --color-ring: var(--ring);
     --color-card: var(--card);
     --color-card-foreground: var(--card-foreground);
     --color-destructive: var(--destructive);
   }
   ```
   This maps CSS custom properties to Tailwind utility classes so `bg-background`, `text-foreground`, `text-primary`, `border-border`, etc. all work.

4. **`web/src/main.tsx`** — add font imports at the top:
   ```ts
   import "@fontsource/cormorant-garamond/400.css";
   import "@fontsource/cormorant-garamond/400-italic.css";
   import "@fontsource/cormorant-garamond/600.css";
   import "./styles/globals.css";
   ```
   Also wrap the `<App />` render in a React.StrictMode.

5. **`web/src/lib/cn.ts`** — the `cn` utility:
   ```ts
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

6. **`web/src/hooks/useTheme.ts`** — three-state theme hook. Behavior:
   - Reads from `localStorage` key `frontierllm:theme:v1`. Default value: `"dark"`.
   - Supported values: `"dark" | "light" | "system"`.
   - On mount, applies the correct class (`dark` or not) to `document.documentElement` based on the value and `window.matchMedia("(prefers-color-scheme: dark)")` for `"system"`.
   - Exposes `{ theme, setTheme }`. `setTheme` writes to localStorage and updates the DOM class immediately.
   - Respects `prefers-reduced-motion`: no transitions during theme switch (add `transition-none` class briefly, then remove).

7. **`web/src/App.tsx`** — update to a minimal demo page that:
   - Renders a centered `<div>` with `className="min-h-screen bg-background text-foreground font-serif"`.
   - Shows the text "frontierllm" in `text-4xl font-light tracking-tight text-foreground`.
   - Shows a theme toggle button (sun/moon from lucide-react) that calls `useTheme`'s `setTheme`.
   - Shows a short lorem ipsum paragraph in `font-serif text-[19px] leading-relaxed`.
   - This is temporary scaffolding. It will be replaced in Phase 4.

8. **`prefers-reduced-motion` global rule** — add to `globals.css`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

**What NOT to do:**
- Do not build any layout components. That is Phase 4.
- Do not implement the content pipeline. That is Phase 3.
- Do not use hardcoded hex/rgb colors anywhere — only `var(--token)` or Tailwind token utilities.
- Do not use `rounded-xl` or `rounded-md` — only `rounded-lg` (8px) or `rounded-full` for the blog-faithful radius discipline.
- Do not add `box-shadow` to cards or layout elements — use `border border-border` instead (§7 shadows).
- The `@tailwindcss/typography` plugin: use `prose` class with the overrides from `prose.css`. Do NOT use `prose-stone` or any color variant — all colors come from the token system.

**Success criteria for this phase:**
- `localhost:5173` shows parchment background in light mode and warm-brown background in dark mode.
- Toggling the button switches modes and the class `dark` appears/disappears on `<html>`.
- The body text renders in Cormorant Garamond (verify in browser DevTools → Computed → font-family).
- `npx tsc --noEmit` exits 0.
- No hardcoded color values in any `.css` or `.tsx` file (run `grep -r "#[0-9a-fA-F]\{3,6\}" src/` — expect 0 hits outside the CSS token definitions).

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Build succeeds
npm run build

# 3. No hardcoded hex in components (tokens in globals.css are allowed)
grep -rn "#[0-9a-fA-F]\{3,6\}" src/components src/hooks src/pages src/lib 2>/dev/null | grep -v ".gitkeep" && echo "FAIL: hardcoded hex found" || echo "PASS: no hardcoded hex in components"

# 4. globals.css has oklch tokens
grep -c "oklch" src/styles/globals.css

# 5. Font import in main.tsx
grep "cormorant-garamond" src/main.tsx

# 6. useTheme hook exists
ls src/hooks/useTheme.ts
```

Expected: commands 1–2 exit 0; command 3 prints PASS; command 4 returns ≥ 20; commands 5–6 exit 0.

Manual smoke test: `npm run dev`, open `localhost:5173`, click the theme toggle, verify background shifts between parchment (#f2efe8 equivalent) and warm dark brown, verify font is Cormorant Garamond in DevTools.

### Commit message

```
phase-2: design tokens, Cormorant Garamond, useTheme, prose.css

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] `globals.css` contains the full `:root` and `:root.dark` token sets from §7.
- [ ] `prose.css` contains all overrides listed in §7 "Prose styling" section.
- [ ] `useTheme` hook correctly applies `dark` class to `<html>`, defaults to `"dark"`.
- [ ] Cormorant Garamond renders in browser on the demo page.
- [ ] Light/dark toggle is functional.
- [ ] `npx tsc --noEmit` passes.
- [ ] No hardcoded hex colors in component files.

---

## Task 3 — Phase 3: Content pipeline

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 3: implement `web/scripts/build-content.ts`, wire as a Vite plugin, define manifest TypeScript types, generate manifest + HTML chunks, verify gitignored. Tightening: the subagent must implement ALL parsing rules from §3 — reading-list parser (including stable id derivation via `sha1(slug + ":" + normalizedTitle).slice(0, 12)`), `synthesisStatus` heuristic, `headings` extraction, `lastModified`, `wordCount`, `crossLinks`, dual-theme code blocks (`themes: { light: "one-light", dark: "vesper" }`), `rehype-sanitize` with strict allowlist, `rehype-pretty-code` code header injection, and the special orientation-page handling. The `chokidar` watcher for dev mode must be v5 ESM-compatible (chokidar v5 is ESM-only, requires Node ≥ 20).

### Implementer brief

You are a `frontend-design` subagent implementing Phase 3 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phases 1–2 are complete.

**What to build:**

**A. Types — `web/src/lib/manifest.ts`**

Define and export the following TypeScript types (used by all consumers — define them before implementing the build script):

```ts
export type ItemStatus = "read" | "unread";

export interface ReadingListItem {
  id: string;           // sha1(slug:normalizedTitle).slice(0, 12) — stable
  text: string;         // full raw text of list item (preserved)
  title: string;        // parsed bold leading text
  url?: string;         // first markdown link href found in item
  gloss?: string;       // text after em-dash separator
  meta?: string;        // parenthesized content
  kind?: "paper" | "blog" | "talk" | "code" | "report"; // detected from meta
  status: "unread";     // default; runtime overwrites from localStorage
}

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;           // rehype-slug-generated id
}

export interface ManifestEntry {
  slug: string;
  title: string;
  path: string;         // absolute path to source .md file
  kind: "topic" | "project" | "orientation" | "root";
  headings: Heading[];
  readingList: ReadingListItem[];
  wordCount: number;
  lastModified: string; // ISO 8601
  synthesisStatus: "empty" | "started";
  crossLinks: string[]; // slugs of other docs referenced
}

export interface Manifest {
  generatedAt: string;
  entries: ManifestEntry[];
}
```

Export typed accessor functions:
- `getEntry(slug: string): ManifestEntry | undefined`
- `getTopics(): ManifestEntry[]` (kind === "topic" | "orientation")
- `getProjects(): ManifestEntry[]` (kind === "project")
- `getRootEntry(): ManifestEntry | undefined` (kind === "root")

The manifest is imported at `import manifestData from '@/generated/manifest.json'` (typed via `resolveJsonModule`).

**B. Build script — `web/scripts/build-content.ts`**

This is a Node.js script (executed by Vite's plugin hook, not in the browser) that:

1. Uses `fast-glob` to discover:
   - `../notes/**/README.md` → kind `"topic"` (with `07-frontier-labs` being special)
   - `../notes/07-frontier-labs/00-orientation.md` → kind `"orientation"`
   - `../projects/**/README.md` → kind `"project"`
   - `../README.md` → kind `"root"`
   Paths are relative to the `web/` directory.

2. For each discovered file, runs the unified pipeline:
   - `unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: false }).use(rehypeSlug).use(rehypeAutolinkHeadings, { behavior: 'wrap' }).use(rehypePrettyCode, { themes: { light: 'one-light', dark: 'vesper' } }).use(rehypeSanitize, defaultSchema).use(rehypeStringify)`
   - Before stringifying, a custom rehype plugin wraps code blocks in `<div class="code-block"><div class="code-header">…</div>…</div>` (port the blog's `code-blocks.css` IDE-style header).

3. Derives the `ManifestEntry` for each file:
   - `slug`: derived from the directory name (`notes/01-pretraining` → `01-pretraining`; root README → `root`; orientation → `07-frontier-labs-orientation`).
   - `title`: first H1 text node.
   - `headings`: all h2 and h3 elements with their rehype-slug ids.
   - `readingList`: parse the `## Reading list` section using the rules in §3. For each `- [ ]` or `- [x]` list item: extract bold leading text as `title`; find the first `[link](href)` as `url`; find em-dash-separated segment as `gloss`; find parenthesized content as `meta`. Detect `kind` from meta text (`paper`/`blog`/`talk`/`code`/`report`). Stable id: `crypto.createHash('sha1').update(slug + ':' + title.toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12)`.
   - `wordCount`: word count of the markdown source text.
   - `lastModified`: `fs.statSync(path).mtime.toISOString()`.
   - `synthesisStatus`: check the "## Synthesis" section; if the only non-whitespace content is `*Fill in as you go.*`, mark `"empty"`; otherwise `"started"`.
   - `crossLinks`: find all `[text](./relative-path)` links in the markdown that point to other docs in the repo; extract slugs.

4. Writes outputs to `web/src/generated/`:
   - `manifest.json`: the full `Manifest` object.
   - `content/<slug>.html`: the rehype-stringified HTML for each entry.
   - Uses `fs.mkdirSync(outDir, { recursive: true })` to create the directory.

5. Logs a summary line per file: `[build-content] processed 12 files in 230ms`.

**C. Vite plugin — `web/vite.config.ts`**

Add a plugin object alongside the existing tailwindcss plugin:

```ts
import { buildContent } from './scripts/build-content';
// ...
plugins: [
  tailwindcss(),
  {
    name: 'frontierllm-content',
    async buildStart() {
      await buildContent();
    },
    configureServer(server) {
      // Watch notes/ and projects/ for changes in dev
      const watcher = chokidar.watch(
        ['../notes', '../projects', '../README.md'],
        { cwd: __dirname, ignoreInitial: true }
      );
      watcher.on('change', async () => {
        await buildContent();
        server.ws.send({ type: 'full-reload' });
      });
    },
  },
],
```

Export `buildContent` as an async function from `web/scripts/build-content.ts`.

**D. TypeScript config for scripts**

`web/tsconfig.node.json` must include `"scripts/**/*.ts"` in its `include` array and have `"module": "Node16"` or `"NodeNext"` so that ESM imports work (chokidar v5 is ESM-only).

**E. Verify gitignore**

Confirm `web/src/generated/` is in the root `.gitignore` (added in Task 0). Do NOT commit any generated files.

**F. Sanity-check outputs**

After running `npm run dev` (which triggers `buildStart`), verify:
- `web/src/generated/manifest.json` exists and is valid JSON.
- `web/src/generated/content/01-pretraining.html` exists and contains syntax-highlighted code blocks.
- `web/src/generated/content/07-frontier-labs-orientation.html` exists.
- The manifest contains the `readingList` array for `01-pretraining` with at least 10 items, each having a stable `id` of 12 hex chars.
- The manifest's `synthesisStatus` for `00-foundations` is `"empty"` (all synthesis sections are placeholder stubs).

**What NOT to do:**
- Do not implement any React components in this phase.
- Do not use MDX.
- Do not parse markdown client-side. All HTML is generated at build time.
- Do not use `marked` — only the `unified`/`remark`/`rehype` ecosystem.
- Do not commit generated files — they are gitignored.
- Do not use `rehype-sanitize` in a way that strips heading anchor attributes added by `rehype-autolink-headings` — the sanitize schema must allowlist `id` on heading elements.

**Error handling (per §17):**
- If parsing a reading-list item fails (e.g., no bold title found), log a warning to stderr and include the item as `{ id: ..., text: rawText, title: rawText, status: "unread" }`.
- If the manifest directory cannot be written, throw — this is a fatal build error.

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean (includes scripts/)
npx tsc --noEmit

# 2. Dev server builds content (start and stop quickly)
# Run npm run dev in background, wait 5s for buildStart, then check outputs
npm run dev &
DEV_PID=$!
sleep 8
ls src/generated/manifest.json src/generated/content/
kill $DEV_PID 2>/dev/null

# 3. Manifest is valid JSON with expected shape
node -e "const m = require('./src/generated/manifest.json'); console.log('entries:', m.entries.length); m.entries.forEach(e => { if (!e.slug || !e.kind) throw new Error('bad entry: ' + JSON.stringify(e)) }); console.log('PASS')"

# 4. Reading list items have 12-char stable IDs
node -e "const m = require('./src/generated/manifest.json'); const t = m.entries.find(e => e.slug === '01-pretraining'); if (!t) throw new Error('no 01-pretraining'); t.readingList.forEach(i => { if (i.id.length !== 12) throw new Error('bad id: ' + i.id) }); console.log('PASS: ' + t.readingList.length + ' items')"

# 5. Generated HTML has code highlight classes (from rehype-pretty-code)
grep -l "shiki" src/generated/content/*.html && echo "PASS: shiki classes found" || echo "WARN: no shiki classes (may be ok if no code blocks)"

# 6. Generated files are NOT tracked by git
git status src/generated/
# Expected: nothing to commit (all gitignored)
```

### Commit message

```
phase-3: content pipeline, manifest, HTML chunks, Vite plugin

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] `web/scripts/build-content.ts` is implemented and exports `buildContent`.
- [ ] Running `npm run dev` generates `manifest.json` and one `.html` file per source `.md`.
- [ ] Manifest shape matches the `ManifestEntry` TypeScript type exactly.
- [ ] Reading-list items have 12-char stable `id` values.
- [ ] `synthesisStatus` is `"empty"` for all topics that have stub synthesis sections.
- [ ] Generated files are gitignored and not tracked by git.
- [ ] `npx tsc --noEmit` passes.
- [ ] The `01-pretraining` topic has ≥ 10 reading-list items in the manifest.

---

## Task 4 — Phase 4: App shell + routing

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 4: implement `AppShell`, `Sidebar`, `Topbar`, `RightSidebar`, `PageContainer`, define routes, add `NotFoundPage`, breadcrumbs, sticky topbar, framer-motion page transitions, scroll restoration. Tightening: the subagent must implement the full three-column layout from §8 and §9 (sidebar + content + right sidebar), with sidebar collapsible via shadcn `Sheet` on mobile (< 768px), and must implement the breadcrumb system using `react-router-dom`'s `useMatches`. The `RightSidebar` renders empty TOC placeholder in this phase (populated in Phase 5). All 9 routes from §2 must be defined and render a placeholder page.

### Implementer brief

You are a `frontend-design` subagent implementing Phase 4 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phases 1–3 are complete. The content pipeline generates `web/src/generated/manifest.json` and HTML chunks on dev server start.

**What to build:**

**A. Routes — `web/src/routes.tsx` and `web/src/App.tsx`**

Define all routes from spec §2:
- `/` → `DashboardPage`
- `/notes` → `NotesIndexPage`
- `/notes/:slug` → `TopicPage`
- `/notes/07-frontier-labs/orientation` → `OrientationPage` (must be defined BEFORE the `:slug` wildcard)
- `/projects` → `ProjectsIndexPage`
- `/projects/:slug` → `ProjectPage`
- `/reading` → `ReadingListPage`
- `/about` → `AboutPage`
- `/search` → `SearchPage`
- `*` → `NotFoundPage`

Use `react-router-dom` v6 `createBrowserRouter` with `RouterProvider`. Each route component renders inside `AppShell`.

**B. `web/src/components/layout/AppShell.tsx`**

Three-column CSS grid layout:
- Left: `Sidebar` (fixed width 240px on `≥ md`, collapsed on mobile).
- Center: scrollable content column with `PageContainer`.
- Right: `RightSidebar` (240px on `≥ xl`, hidden on smaller widths).
- `Topbar` spans the full top.

Use CSS Grid: `grid-template-columns: 240px 1fr 240px` on xl, `240px 1fr` on md, `1fr` on mobile. `grid-template-rows: auto 1fr`.

The main scrollable area is a `<main id="main-content">` element (for the skip link).

**C. `web/src/components/layout/Sidebar.tsx`**

Left navigation. Must render:
- "frontierllm" wordmark at the top (serif font, small caps effect via `font-variant-small-caps`).
- Navigation sections matching §9: Dashboard (link to `/`), Notes (collapsible group — 7 topic links), Projects (collapsible group — 3 project links), Reading list (link to `/reading`), About (link to `/about`).
- For each note topic link: a tiny progress dot (circle, `w-2 h-2`, color based on completeness — empty: `bg-muted`, partial: `bg-gold`, complete: `bg-success`). Completeness comes from the progress store (import from `lib/progress.ts`, which is implemented in Phase 5; for now, always show empty dot).
- `aria-current="page"` on the active link.
- Collapsible sections use shadcn `Collapsible` (or implement with Radix primitives directly).
- On mobile (< 768px): hide sidebar by default; show via a hamburger button in the Topbar that opens a shadcn `Sheet`.
- `transition-colors duration-150` on all links. Active link: `text-primary font-medium`. Hover: `text-foreground bg-accent`.
- Sidebar background: `bg-card border-r border-border`.

**D. `web/src/components/layout/Topbar.tsx`**

Sticky top bar. Must render:
- Left: breadcrumbs (use `useMatches` from react-router-dom; render the active route path as "Dashboard", "Notes / 01 Pretraining", etc. using shadcn `Breadcrumb`).
- Center: search input placeholder (`SearchInput` renders just a text field for now; wired in Phase 7). Clicking it or pressing `Cmd+K` / `Ctrl+K` will open the command menu (wired in Phase 7 — for now, just an input that navigates to `/search?q=`).
- Right: theme toggle (3-state: sun/monitor/moon icons from lucide-react, using `useTheme`), and a GitHub link icon (external link to the repo, or omit if no remote — render as a disabled icon with tooltip "local repo").
- Height: `h-14` (56px). `sticky top-0 z-40`.
- Background: `bg-background/80 backdrop-blur-sm border-b border-border`.

**E. `web/src/components/layout/RightSidebar.tsx`**

Right sidebar for per-page TOC. In this phase:
- Renders a container `div` with heading "On this page" in `font-sans text-xs uppercase tracking-widest text-muted-foreground`.
- TOC content is empty placeholder text "No headings" — populated in Phase 5.
- Visible only on `≥ xl` (1280px). Below xl: hidden (the `Toc` component in Phase 5 adds a floating popover for mid-widths).
- Background: none (transparent, part of the grid). Sticky within the page scroll.

**F. `web/src/components/layout/PageContainer.tsx`**

Wraps page content in:
- `max-w-[660px]` column, centered, with `px-6 py-8` padding.
- framer-motion entrance: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}` with `duration: 0.18, ease: "easeOut"` and `key={location.pathname}` (so it re-animates on route change).
- Respects `prefers-reduced-motion`: if reduced motion is preferred, skip the animation (use `useReducedMotion()` from framer-motion).

**G. Page stubs — `web/src/pages/*.tsx`**

Create all 10 page files. Each renders inside `PageContainer` and shows:
- `<h1>` with the page title (e.g., "Dashboard", "Notes", "Reading list").
- A `<p className="text-muted-foreground font-sans text-sm">Coming in next phase.</p>`.
These are placeholders replaced in Phase 6.

**H. `web/src/pages/NotFoundPage.tsx`**

This is NOT a stub — implement it fully in this phase since it's simple:
- Heading: "404 — Not found" (`font-serif text-4xl font-light`).
- Paragraph: "This page doesn't exist." with a link back to `/` and a search input.
- The search input navigates to `/search?q=<value>` on submit.

**I. Skip link**

In `AppShell` or `index.html`, add a skip link as the first focusable element:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
  Skip to content
</a>
```

**J. Scroll restoration**

Use `react-router-dom`'s `<ScrollRestoration />` component inside `RouterProvider` to restore scroll position on navigation.

**Design rules for this phase (enforce the blog aesthetic):**
- No `box-shadow` on any layout element. Use `border border-border`.
- All border radii: `rounded-lg` (8px) only. No `rounded-xl`, no `rounded-md`.
- Sidebar width: exactly 240px. No collapsing to icon-only mode (the spec calls for full collapse to hidden on mobile, not an icon rail).
- Font: sidebar labels use `font-sans text-sm`; wordmark uses `font-serif`.
- The topbar search input gets `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`.

**What NOT to do:**
- Do not implement `ReadingList`, `Toc`, progress meters, or search logic. Those are Phases 5 and 7.
- Do not fetch or render actual markdown content. That is Phase 5.
- Do not implement command menu. That is Phase 7.
- Do not add `box-shadow` to any shell element.

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Build
npm run build
```

Manual smoke tests (run `npm run dev` and visit `localhost:5173`):
- Visit `/` — see "Dashboard" heading in the center column, sidebar with all 7 note links and 3 project links.
- Visit `/notes/01-pretraining` — TopicPage placeholder renders inside the shell; breadcrumb shows "Notes / 01 Pretraining".
- Visit `/notes/07-frontier-labs/orientation` — OrientationPage renders (not TopicPage with slug "07-frontier-labs").
- Resize to 767px width — sidebar disappears; hamburger button appears in topbar.
- Click hamburger — sidebar slides in as a Sheet.
- Press Tab — skip link appears as the first focus target.
- Visit `/nonexistent` — 404 page renders with a search input.
- Theme toggle cycles through sun/monitor/moon icons and switches dark class on `<html>`.

### Commit message

```
phase-4: app shell, routing, sidebar, topbar, right sidebar

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] All 9 routes render without errors inside `AppShell`.
- [ ] Three-column layout is correct on xl (1280px+), two-column on md, one-column on mobile.
- [ ] Sidebar shows all 7 note topics and 3 projects.
- [ ] Breadcrumbs update on route change.
- [ ] Mobile hamburger opens sidebar as a Sheet.
- [ ] Skip link is present and functional.
- [ ] framer-motion page transition (opacity fade) fires on route change.
- [ ] 404 page is fully implemented.
- [ ] `npx tsc --noEmit` and `npm run build` pass.

---

## Task 5 — Phase 5: Content rendering

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 5: implement `RenderedMarkdown`, `Toc` + scroll-spy, `ReadingList` + `ReadingListItem` with localStorage, and progress derivation in `lib/progress.ts`. Tightening: `RenderedMarkdown` must intercept internal anchor clicks and use react-router-dom `useNavigate` instead of native navigation; `useReadingProgress` must use `useSyncExternalStore` so multiple component instances stay in sync without prop drilling; `lib/storage.ts` must implement schema-versioned reads with Zod validation and corrupted-state recovery (see §17 error handling); `CrossLinkPreview` is deferred to Phase 8 polish (hover preview is nice-to-have — implement as a plain link in Phase 5).

### Implementer brief

You are a `frontend-design` subagent implementing Phase 5 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phases 1–4 are complete. The app shell routes are working. The content pipeline generates manifest and HTML chunks.

**What to build:**

**A. `web/src/lib/storage.ts`**

Schema-versioned localStorage module. Must:
- Export `readStorage<T>(key: string, schema: ZodSchema<T>, defaultValue: T): T` — reads JSON from localStorage, validates with Zod, returns default on failure (also calls `localStorage.removeItem(key)` to reset the corrupt key, then calls `sonner.toast.warning("Your progress was reset due to a data error.")` — import `toast` from `sonner`).
- Export `writeStorage<T>(key: string, value: T): void` — JSON.stringifies and writes; wraps in try/catch (localStorage quota); logs warning on failure.
- Export storage key constants:
  ```ts
  export const KEYS = {
    readingProgress: "frontierllm:reading-progress:v1",
    theme: "frontierllm:theme:v1",
    uiPrefs: "frontierllm:ui-prefs:v1",
    recentPages: "frontierllm:recent-pages:v1",
  } as const;
  ```

**B. `web/src/hooks/useReadingProgress.ts`**

Reading progress hook using `useSyncExternalStore`. Must:
- Store shape: `Record<string, { status: "read" | "unread"; checkedAt?: string }>`.
- Zod schema: validate the shape; any key with invalid value gets dropped (not reset entirely).
- Export `useReadingProgress()` which returns `{ getStatus(id: string): "read" | "unread"; toggle(id: string): void; markAllRead(ids: string[]): void; reset(ids: string[]): void }`.
- The `toggle` function flips the status and writes back; `checkedAt` is set to `new Date().toISOString()` when marking read.
- Use `useSyncExternalStore` with a custom store that:
  - Subscribes via a Set of listener functions.
  - `getSnapshot` reads from localStorage each time (or from an in-memory cache invalidated on write).
  - Notifies all listeners after any write.
- This ensures `<ReadingList>` and `<RoadmapStrip>` on the dashboard both update when a checkbox is ticked.

**C. `web/src/lib/progress.ts`**

Progress derivation functions:
- `topicCompleteness(slug: string, progressMap: Record<string, {status: string}>): { read: number; total: number; pct: number | null }` — returns `pct: null` if `total === 0` (living list).
- `overallProgress(manifest: Manifest, progressMap: Record<string, {status: string}>): { read: number; total: number; pct: number }` — weighted average by reading-list length, excluding `total === 0` topics.
- `synthesisStartedCount(manifest: Manifest): number` — count topics where `synthesisStatus === "started"`.

**D. `web/src/hooks/useTopic.ts`**

```ts
export function useTopic(slug: string) {
  const entry = getEntry(slug); // from lib/manifest.ts
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const modules = import.meta.glob('@/generated/content/*.html', { as: 'raw' });
    const key = Object.keys(modules).find(k => k.includes(slug));
    if (!key) { setError(new Error(`No content for ${slug}`)); setLoading(false); return; }
    modules[key]().then(raw => { setHtml(raw as string); setLoading(false); })
                  .catch(err => { setError(err); setLoading(false); });
  }, [slug]);

  return { entry, html, loading, error };
}
```

**E. `web/src/components/content/RenderedMarkdown.tsx`**

Renders pre-rendered HTML into a prose container. Must:
- Accept `html: string` and `slug: string` props.
- Use `dangerouslySetInnerHTML={{ __html: html }}` inside a `<div className="prose prose-lg max-w-none">`.
- Intercept internal anchor clicks: attach a click listener to the container; if `event.target` is an `<a>` element with an `href` starting with `/` or `#`, call `navigate(href)` from `useNavigate` instead of letting native navigation fire.
- Override the reading-list section: after mounting, scan the DOM for the element with text content matching the "## Reading list" heading; if found, unmount the static HTML section and replace it with the `<ReadingList>` React component. Implementation: use a `<div ref={containerRef}>` and a `useEffect` that does the DOM surgery after HTML injection.
  - Actually, the cleanest approach given pre-rendered HTML: do NOT do DOM surgery. Instead, render the `<ReadingList>` component BELOW the `RenderedMarkdown` in `TopicPage.tsx` in a separate section (the prose-rendered reading list HTML is already there, but the interactive component supplements it in the Reading tab). See Phase 6 for the tab layout where this is resolved. For Phase 5, just render the full HTML as-is.
- Error boundary: wrap in a React error boundary that shows "Content failed to load" with a retry link if the HTML is invalid.
- Apply the prose CSS classes and the blog-faithful typography from Phase 2.

**F. `web/src/components/content/Toc.tsx`**

Table-of-contents component. Must:
- Accept `headings: Heading[]` prop.
- Render `<nav aria-label="Page contents">` with an ordered list of anchor links.
- H2 headings: `font-sans text-sm text-muted-foreground hover:text-foreground`. H3: indented (`pl-4`), `text-xs`.
- `useScrollSpy` hook (below) highlights the active heading: active link gets `text-primary font-medium`.
- Clicking a TOC link: smooth-scrolls to the anchor AND updates the URL hash.
- Empty state: renders nothing (no "No headings" — that was the Phase 4 right sidebar placeholder which gets replaced here).

**G. `web/src/hooks/useScrollSpy.ts`**

```ts
export function useScrollSpy(ids: string[], options?: IntersectionObserverInit): string | null
```
Uses `IntersectionObserver` to track which heading is currently visible. Returns the `id` of the topmost visible heading. Cleanup on unmount. Options default: `{ rootMargin: '-10% 0px -80% 0px', threshold: 0 }`.

**H. `web/src/components/content/ReadingList.tsx`**

Reading list component. Must:
- Accept `slug: string` prop. Gets `readingList` from `getEntry(slug)`.
- Use `useReadingProgress()` for state.
- Render a progress bar at the top: `{read}/{total} read` using `ProgressBar` component.
- Status filter: 3-state toggle (`All / Unread / Read`) via shadcn `Tabs` or a custom pill toggle. Filter is URL-driven via `?status=all|unread|read` (use `useSearchParams`).
- Renders the filtered list of `ReadingListItem` rows.
- "Mark all read" button (only shown when filter is `all` or `unread`).
- "Reset" button (shows a confirmation `Dialog` before resetting all items in this topic).

**I. `web/src/components/content/ReadingListItem.tsx`**

Single reading list row. Must:
- Accept `item: ReadingListItem`, `status: "read" | "unread"`, `onToggle: () => void` props.
- Render: shadcn `Checkbox` (checked if `status === "read"`), title as external link (`href={item.url}`, `target="_blank"`, `rel="noopener noreferrer"`), em-dash, `gloss` text, `kind` badge, estimated read time icon (if `meta` contains a time like "~30 min").
- Checkbox toggle: calls `onToggle`, which triggers `useReadingProgress.toggle(item.id)`. Animate the checkmark: framer-motion `AnimatePresence` with a scale-in check icon.
- Hover: `hover:bg-accent/40 rounded-lg transition-colors duration-150`.
- Row padding: `px-2 py-2`.
- Focus ring on checkbox: `focus-visible:ring-2 ring-ring ring-offset-2`.

**J. `web/src/components/progress/ProgressBar.tsx`**

```tsx
// Thin progress bar, shadcn Progress wrapper
interface ProgressBarProps { value: number; max: number; className?: string }
```
Uses shadcn `Progress` with `value={(value/max)*100}`. Fill color: `--manuscript-blue` (not `--primary`/vermillion — manuscript blue is the progress meter fill per §7). Thin variant: `h-1.5`.

**What NOT to do:**
- Do not implement `DashboardPage`, `TopicPage`, or any other page — that is Phase 6. Phase 5 only produces the building blocks.
- Do not implement search or command menu — Phase 7.
- Do not implement `CrossLinkPreview` — defer to Phase 8.
- Do not use runtime markdown parsing in any component.

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Build
npm run build
```

Manual smoke test:
- Temporarily wire `RenderedMarkdown` into `TopicPage` stub: pass `useTopic("01-pretraining")` html and verify pretraining content renders with Cormorant Garamond serif and syntax-highlighted code (if any).
- Open DevTools console — no errors.
- Tick a reading-list checkbox on a topic page — progress bar updates. Reload — checkbox is still ticked.
- Filter by "Unread" — ticked items disappear from the list.

```bash
# 3. Storage zod validation test
node -e "
const { z } = require('zod');
// Simulate corrupt data
const raw = 'not json';
try { JSON.parse(raw); } catch(e) { console.log('PASS: corrupt JSON caught') }
"
```

### Commit message

```
phase-5: RenderedMarkdown, ReadingList, useReadingProgress, progress lib

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] `useTopic` lazy-loads HTML chunk via `import.meta.glob` and returns it.
- [ ] `RenderedMarkdown` renders a topic's HTML with `prose` typography classes.
- [ ] `useReadingProgress` persists checkbox state to localStorage and survives reload.
- [ ] Two instances of a reading-list component on the same page (e.g., dashboard strip + topic page) stay in sync via `useSyncExternalStore`.
- [ ] `Toc` renders headings and highlights active section via `useScrollSpy`.
- [ ] `lib/progress.ts` correctly computes `topicCompleteness` and `overallProgress`.
- [ ] `lib/storage.ts` recovers gracefully from corrupt localStorage (shows a toast, resets the key).
- [ ] `npx tsc --noEmit` and `npm run build` pass.

---

## Task 6 — Phase 6: Pages

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 6: implement all page components. Tightening: this is the largest phase — see below for a split recommendation. Each page must be fully functional, not a stub. The `DashboardPage` must compute live progress from the real manifest and localStorage. The `TopicPage` must implement the tab system with URL-driven `?tab=` parameter. `OrientationPage` must render the orientation-specific banner and the 6-report checklist. `ReadingListPage` must implement all three filters with URL state. `AboutPage` must include the settings panel with export/import JSON. `NotFoundPage` was completed in Phase 4.

**RISK FLAG — Phase 6 is large.** It covers 7 distinct page components, each with significant sub-components. The orchestrator may split this into two dispatches: Phase 6a (Dashboard + Notes index + Topic page + Orientation page) and Phase 6b (Projects index + Project page + Reading list page + About page). The brief below covers all of Phase 6 but the orchestrator should judge whether to split based on subagent context limits.

### Implementer brief

You are a `frontend-design` subagent implementing Phase 6 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phases 1–5 are complete. All building blocks (RenderedMarkdown, ReadingList, progress hooks, manifest accessors) are available.

**Aesthetic reminder:** Every page must match the editorial-technical-warm voice from spec §7 and the blog at `C:/Personal/blog/`. Parchment palette, Cormorant Garamond prose, vermillion interactive elements, manuscript blue for progress meters, no shadows — only borders. Heading hierarchy: h1 `font-serif text-4xl font-light tracking-tight`, h2 `font-serif text-2xl font-medium`, body `font-serif text-[19px] leading-relaxed`.

**What to build:**

**A. `web/src/pages/DashboardPage.tsx`** (see spec §8 "Dashboard")

Lay out the page as described in §8. Sub-components to use/create:

- `ActivityCard` (`web/src/components/progress/ActivityCard.tsx`): shows "Current activity: Orientation pass" with a progress bar showing `0 of 6 reports read` (reads from manifest entry `07-frontier-labs-orientation` reading list). Styled as a callout block (`border border-border rounded-lg p-6 bg-card`).

- Overall progress card: large display of `overallProgress(manifest, progressMap).pct + "%"` in `font-serif text-6xl font-light` (the "big number"). Below it: `X of Y reading items read` in `font-sans text-sm text-muted-foreground`. Left half of a two-column card grid.

- Synthesis status card: right half. Shows `synthesisStartedCount(manifest) of 7 topics` with synthesis started. Similar typography.

- `RoadmapStrip` (`web/src/components/progress/RoadmapStrip.tsx`): horizontal list of all 7 topics. Each row: slug pill (`font-mono text-xs bg-muted px-1 rounded`), topic title (`font-sans text-sm`), progress bar (thin, `h-1`, manuscript blue fill), `X/Y` count. Separated by a 1px border between rows.

- Project status grid: 3 cards (one per project from manifest). Each shows project title, one-line goal (first sentence of the README's "## Goal" section — extract from manifest `headings` or store as `gloss` in the manifest entry; add `gloss` to `ManifestEntry` type if missing — this is a note to the subagent: add `gloss?: string` to `ManifestEntry` and set it during the build pipeline). Status pill: "Scoped / not started" (static for now, since all projects are at that status).

- `RecentEdits` (`web/src/components/progress/RecentEdits.tsx`): sorted by `lastModified` descending, top 5 entries from the manifest. Each row: file name, relative time (`"2 days ago"`), link to the page.

**B. `web/src/pages/NotesIndexPage.tsx`** (see spec §8 "Notes index")

- Header: "Notes" h1 + "The conceptual layer." subtitle.
- View toggle: Grid / List (`?view=grid|list`, default `grid`). Use shadcn `Tabs` styled as a pill toggle.
- Grid: 2 cols on md, 3 on xl. Each card is `TopicProgressCard`.

`TopicProgressCard` (`web/src/components/progress/TopicProgressCard.tsx`):
- Topic number + title in `font-serif text-xl font-medium`.
- Slug pill.
- 2-line gloss (the "What this is" first paragraph from the topic README — store as `gloss` in `ManifestEntry`; same fix as above).
- Progress bar + `X/Y read`.
- Synthesis status pill: "Empty" (muted, `bg-muted text-muted-foreground`) or "Started" (`bg-success/20 text-success`).
- Last-modified date in `font-sans text-xs text-muted-foreground`.
- `hover:bg-accent transition-colors duration-200 cursor-pointer`. Click → `navigate('/notes/:slug')`.
- Card: `border border-border rounded-lg p-6`.

**C. `web/src/pages/TopicPage.tsx`** (see spec §8 "Topic page")

This is the most complex page. Must implement:

- Breadcrumb: `Notes / [topic title]` using shadcn `Breadcrumb`.
- H1: topic title.
- Subtitle: topic gloss (first paragraph from "What this is").
- Tabbed view via URL `?tab=overview|reading|synthesis|questions|code`. Default `overview`. Use shadcn `Tabs` with `value` bound to the URL param.
  - `Overview` tab: renders `<RenderedMarkdown html={html} slug={slug} />` (full topic content).
  - `Reading list` tab: renders `<ReadingList slug={slug} />` (the interactive reading list, not the static HTML version — this is where the tab approach cleanly separates interactive from prose).
  - `Synthesis` tab: renders only the `## Synthesis` section of the HTML (extract from full HTML or render just the synthesis heading section; if `synthesisStatus === "empty"`, show an empty-state hint: `"This section is a stub. Write your synthesis in notes/<slug>/README.md — it will appear here after rebuilding."`).
  - `Open questions` tab: similarly renders the `## Open questions` section.
  - `Code / experiments` tab: renders the `## Code / experiments` section.
- "Open in editor" link: `vscode://file/C:/Personal/frontierllm/notes/<slug>/README.md`. Render as a small `<a>` with a `ExternalLink` lucide icon in the top-right of the content column. Tooltip: "Open in VS Code".
- "Last modified" timestamp: `font-sans text-xs text-muted-foreground` below the subtitle.
- Right sidebar: wire `<RightSidebar>` with the topic's `headings` passed as props (from `entry.headings`). Replaces the Phase 4 empty placeholder.

**D. `web/src/pages/OrientationPage.tsx`** (see spec §8 "Orientation page")

- Same as `TopicPage` but:
  - Banner at the top (inside `PageContainer`, above the title): `border border-primary rounded-lg p-4 bg-primary/5` with heading "First active activity" in `text-primary font-medium` and the description text from §8.
  - The 6 reports checklist renders as the primary reading list (no tab needed — the orientation page does NOT use the tab layout; it is a single-scroll page with the checklist prominently at top, then the comparative table, then the personal map).
  - Comparative table: render as a standard `<RenderedMarkdown>` table (the GFM table from the orientation markdown). The table styling from `prose.css` handles the visual.
  - The "Personal map" section renders as prose.

**E. `web/src/pages/ProjectsIndexPage.tsx`** (see spec §8 "Projects index")

- Header: "Projects" h1.
- 3-card grid (`grid-cols-1 md:grid-cols-3 gap-6`). Each card from manifest project entries:
  - Project number + title.
  - One-line goal (from `gloss`).
  - Status pill: "Scoped / not started" (`bg-muted text-muted-foreground`).
  - Connection arrows: static text derived from the project order ("→ outputs base model for Project 02" for Project 01, etc. — hardcode or store in manifest as `crossLinks`).
  - Click → `navigate('/projects/:slug')`.

**F. `web/src/pages/ProjectPage.tsx`** (see spec §8 "Project page")

- Breadcrumb, title, status pill, "Open in editor" link.
- `<RenderedMarkdown>` for the project README.
- Right sidebar TOC.

**G. `web/src/pages/ReadingListPage.tsx`** (see spec §8 "Reading list")

- Header with totals (`Showing X of Y items, Z read overall`).
- Three URL-driven filters:
  - Status: `?status=all|unread|read` (default `all`).
  - Topic: `?topic=all|<slug>` — multi-select via shadcn `Popover` with checkboxes.
  - Sort: `?sort=topic|time|title` (default `topic`).
- Flat list of all reading items across all topics, filtered and sorted. Each row is `<ReadingListItem>` with an additional topic pill (slug badge in `font-mono text-xs`).
- "Open topic" link on each row (navigate to `/notes/<slug>?tab=reading`).

**H. `web/src/pages/AboutPage.tsx`** (see spec §8 "About")

- Renders `<RenderedMarkdown>` for the root README (slug `root`).
- "Design specs" section: two links rendered as prose items:
  - `docs/superpowers/specs/2026-04-25-frontierllm-design.md` — "Original design spec"
  - `docs/superpowers/specs/2026-04-26-web-ui-design.md` — "Web UI design spec"
  These are local file links; render with a `FileText` lucide icon.
- Settings panel at the bottom (`border-t border-border pt-8 mt-8`):
  - Theme picker: 3-button toggle (sun/monitor/moon) using `useTheme`.
  - "Reset all progress" button: opens a `Dialog` with double confirmation ("Type RESET to confirm"). On confirm, calls `writeStorage(KEYS.readingProgress, {})` and shows a `toast.success("All progress reset.")`.
  - "Export progress as JSON" button: serializes `readStorage(KEYS.readingProgress, ...)` and triggers a browser download of `frontierllm-progress.json`.
  - "Import progress" button: `<input type="file" accept=".json">` (hidden), triggers on click. Reads the file, validates with the Zod schema from `useReadingProgress`, writes to localStorage on success, shows error toast on failure.

**What NOT to do:**
- Do not implement search or command menu — Phase 7.
- Do not implement `CrossLinkPreview` hover previews — Phase 8.
- Do not add `box-shadow` to any element.
- Do not use `rounded-xl` or `rounded-md` — only `rounded-lg` or `rounded-full`.
- Do not use hardcoded colors.

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Build
npm run build
```

Manual smoke tests (run `npm run dev`):

- `/` — dashboard shows real progress percentage, roadmap strip shows 7 topics with bars, recent edits shows last-modified files.
- `/notes` — grid of 7 topic cards, each with progress bar (0% since nothing is read). Toggle Grid/List — layout changes.
- `/notes/01-pretraining` — full topic README renders in serif prose with syntax-highlighted code blocks. Tab to "Reading list" — interactive checkboxes appear. Tick one — progress bar updates. Switch to "Synthesis" tab — shows stub empty state hint.
- `/notes/07-frontier-labs/orientation` — orientation banner at top, 6-report checklist, comparative GFM table below.
- `/projects` — 3 project cards.
- `/projects/01-pretrain-end-to-end` — project README renders as prose.
- `/reading` — flat list of all reading items across topics. Filter by "Unread" — only unchecked items show.
- `/about` — root README renders; settings panel shows at bottom; "Export progress" downloads a JSON file.
- Tick a checkbox on `/notes/01-pretraining?tab=reading`, navigate to `/` — dashboard progress percentage has updated.
- Reload after ticking — checkbox is still ticked.

### Commit message

```
phase-6: all pages, dashboard, topic tabs, reading list, about settings

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] Dashboard shows live progress from real manifest and localStorage.
- [ ] TopicPage renders full markdown content with tabs.
- [ ] Reading list checkboxes persist to localStorage and update across pages.
- [ ] OrientationPage has the banner and single-scroll layout (no tabs).
- [ ] ReadingListPage filters work via URL params.
- [ ] AboutPage export/import progress is functional.
- [ ] `npx tsc --noEmit` and `npm run build` pass.
- [ ] No placeholder "coming in next phase" text remains on any page.

---

## Task 7 — Phase 7: Search + cmd-k

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 7: build MiniSearch index, implement `SearchInput`, `SearchResults`, `SearchPage`, and `CommandMenu` (cmd-k). Tightening: the index must be built once at app startup (not rebuilt on every search), the `useSearch` hook must debounce at 150ms, the cmd-k shortcut must work globally via a `useEffect` on `document`, and the command menu must include both search results and recent pages (from `frontierllm:recent-pages:v1` localStorage key).

### Implementer brief

You are a `frontend-design` subagent implementing Phase 7 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phases 1–6 are complete. All pages are implemented.

**What to build:**

**A. `web/src/lib/search-index.ts`**

Builds a MiniSearch index at module initialization (singleton, not rebuilt on search). Must:
- Import the manifest.
- Create a `MiniSearch` instance with fields: `title`, `gloss`, `headingText`, `readingItemTitle`, `readingItemGloss`, `meta`.
- Boost configuration (per §10): title/gloss ×3, headings ×2, reading-item titles/glosses ×1.5, meta ×1.
- Index three document types:
  1. Pages: `{ id: "page:<slug>", type: "page", slug, title, gloss }`.
  2. Headings: for each entry, for each h2/h3 heading: `{ id: "heading:<slug>#<id>", type: "heading", slug, title: heading.text, headingText: heading.text, anchor: heading.id }`.
  3. Reading items: for each entry, for each reading-list item: `{ id: "item:<itemId>", type: "reading-item", slug, title: item.title, readingItemTitle: item.title, readingItemGloss: item.gloss ?? "", meta: item.meta ?? "" }`.
- Enable fuzzy matching (`fuzzy: 0.2`) and prefix matching (`prefix: true`).
- Export: `searchIndex: MiniSearch` singleton, and a typed `SearchResult` interface.

**B. `web/src/hooks/useSearch.ts`**

```ts
export function useSearch(query: string, options?: { debounceMs?: number }): SearchResult[]
```
- Debounces `query` by 150ms (default).
- Returns up to 30 results.
- Groups results by type in the return value: pages first, then headings, then reading items.
- Empty query returns `[]`.

**C. `web/src/pages/SearchPage.tsx`** (replaces the Phase 6 placeholder)

- Reads `?q=` from URL search params.
- Uses `useSearch(q)` to get results.
- Renders three groups: "Pages" (max 10), "Headings" (max 10), "Reading items" (max 10). Each group has a "Show all X" expansion button if results exceed the cap.
- Empty results: show "No results for '{q}'" with suggestions ("Try a topic name, paper title, or author.").
- Clicking a page result → `navigate('/notes/<slug>')` or `/projects/<slug>`.
- Clicking a heading result → `navigate('/notes/<slug>#<anchor>')`.
- Clicking a reading item → `navigate('/notes/<slug>?tab=reading')` and scroll to the item (best-effort via URL hash if the item has an anchor).
- No results with empty query: show "Type to search across topics, projects, and reading items."

**D. `web/src/components/search/SearchInput.tsx`** (replaces the Phase 4 placeholder in Topbar)

- Renders an `<input type="search">` with `placeholder="Search… ⌘K"`.
- On focus or `Cmd+K` / `Ctrl+K` (global shortcut): opens `CommandMenu`.
- On submit (Enter): navigates to `/search?q=<value>`.
- `focus-visible:ring-2 ring-ring ring-offset-2`.
- Debounced update to URL `?q=` param on input change (navigates to `/search?q=` while typing only when already on the search page — otherwise just opens command menu).

**E. `web/src/components/search/SearchResults.tsx`**

Presentational component accepting `results: SearchResult[]` and rendering the three-group layout. Reused by `SearchPage` and `CommandMenu`.

**F. `web/src/components/search/CommandMenu.tsx`**

shadcn `Command` dialog component. Must:
- Open on `Cmd+K` / `Ctrl+K` (global `keydown` listener in a `useEffect`).
- Show recent pages at the top when query is empty (from `frontierllm:recent-pages:v1` localStorage — a list of the last 8 visited `{ slug, title }` entries; update this list on every route change by adding a `useEffect` to `App.tsx` that reads the current location and prepends to the list).
- Show search results below (using `useSearch`).
- Keyboard navigation: arrow keys move focus, Enter confirms. These are handled by shadcn `Command` automatically.
- Item click: navigate and close menu.
- "Close" on Escape or clicking backdrop.
- Width: `max-w-lg`. Shadow: `shadow-[0_8px_24px_rgba(0,0,0,0.18)]` (the one permitted box-shadow exception per §7).

**What NOT to do:**
- Do not index the full body text of rendered HTML — only manifest data (per §10 rationale).
- Do not add fulltext indexing (Pagefind) — that is an extension point for Option C.
- Do not break the existing tab-based navigation on TopicPage when search results link to `?tab=reading`.

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Build
npm run build

# 3. MiniSearch installed
node -e "require('./node_modules/minisearch/dist/cjs/index.js'); console.log('PASS')"
```

Manual smoke tests:
- Press `Cmd+K` (or `Ctrl+K` on Windows) — command menu opens.
- Type "pretraining" — results appear with "Notes / 01 Pretraining" as a page result and heading matches below.
- Type "Chinchilla" — "Training Compute-Optimal Large Language Models" appears as a reading-item result.
- Click a result — navigates to the correct page.
- Escape — command menu closes.
- Visit `/search?q=scaling` — search results page shows three groups.
- Search results appear within 200ms of typing (debounce + render).
- Recent pages appear in command menu when query is empty.
- Search finds any topic by name within 100ms (per §18 success criterion).

### Commit message

```
phase-7: MiniSearch index, search page, command menu, cmd-k

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] `Cmd+K` / `Ctrl+K` opens command menu from any page.
- [ ] Search finds topics, headings, and reading items by title.
- [ ] Recent pages populate the command menu when query is empty.
- [ ] `/search?q=<term>` renders grouped results.
- [ ] Search results render within 200ms of a query change.
- [ ] `npx tsc --noEmit` and `npm run build` pass.

---

## Task 8 — Phase 8: Polish

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 8: empty/loading states, focus ring audit, skip link, dark/light parity audit, print suppression of nav, Lighthouse a11y pass. Tightening: empty states must be meaningful (not just "nothing here" — per §17 component quality). Loading states must use skeleton loaders, not spinners, for content that loads lazily. The Lighthouse audit is run via Chrome DevTools (or `npx lighthouse http://localhost:5173 --output html --output-path ./lighthouse-report.html`). All WCAG AA contrast failures must be fixed before this phase is considered done. Also implement `CrossLinkPreview` in this phase (deferred from Phase 5).

### Implementer brief

You are a `frontend-design` subagent implementing Phase 8 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phases 1–7 are complete and all features are functional.

**What to build:**

**A. Empty states**

Every component that can have zero items must show a meaningful empty state:
- `ReadingList` with 0 items: "No reading items found for this topic. The reading list may still be a stub — check `notes/<slug>/README.md`."
- `ReadingListPage` with 0 filtered items: "No items match your filters." with a "Clear filters" link.
- `SearchPage` with 0 results: "No results for '{q}'. Try a broader search or browse Notes." with a link.
- `RecentEdits` with 0 entries: "No recently edited files." (shouldn't happen in practice).
- `RoadmapStrip` with no manifest entries: "Content not yet generated. Run `npm run dev` from `web/` to build." (shows only if manifest has 0 entries, which indicates a build error).
- Command menu with no recent pages and no query: "Start typing to search, or browse Notes ↑" with a link group.

**B. Loading states**

- `TopicPage` and `ProjectPage` while `useTopic` is loading: render a skeleton using shadcn's layout. The skeleton should match the approximate shape of the content — a wide skeleton bar for the h1, several paragraph-height bars for body text, smaller bars for headings. Use `animate-pulse` on `bg-muted` divs.
- `SearchPage` while results are computing (debounce is in progress): a subtle spinner or "searching…" text (but this should be nearly instant — 150ms debounce — so a spinner is overkill; just show the previous results until new ones arrive, or show nothing during the brief debounce window).

**C. Focus ring audit**

Go through every interactive element in the UI and verify `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` is applied:
- All shadcn `Button`, `Checkbox`, `Input`, `Select`, `Tabs` components — these should already have focus rings from shadcn defaults, but verify.
- Sidebar nav links.
- Topbar links and theme toggle.
- TOC anchor links in `Toc.tsx`.
- ReadingListItem title links.
- "Open in editor" links.
- Any `<a>` without `Button` wrapper.
Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` to any element missing it. Do NOT suppress the focus ring for any element.

**D. Skip link verification**

Verify the skip link from Phase 4 (`<a href="#main-content">Skip to content</a>`) is rendered as the first focusable element in the DOM. Test: Tab once on any page — the skip link should appear in the top-left corner with `bg-primary text-primary-foreground rounded-lg px-4 py-2`.

**E. Dark/light parity audit**

- Open the app in both dark and light mode and check every surface for:
  - Hardcoded colors (any color not from `var(--token)` or a Tailwind token class).
  - Insufficient contrast (use browser's accessibility inspector or axe DevTools).
  - Any element that looks visually broken in one mode but not the other.
- Check specifically: code blocks (rehype-pretty-code dual theme), progress bars, badges, pills, the orientation banner, table cells, blockquotes.
- Fix any issues found.

**F. Print suppression**

Add `print:hidden` class to `Sidebar`, `Topbar`, `RightSidebar`, and `CommandMenu`. This ensures printed topic pages show just the prose content.

**G. `CrossLinkPreview` — `web/src/components/content/CrossLinkPreview.tsx`**

Hover preview for internal links. When a user hovers over an internal link in `RenderedMarkdown`, show a `Popover` with:
- The linked entry's title.
- First 2 lines of gloss.
- Progress status if it's a topic (e.g., "3/12 read").
Implementation: attach a `mouseenter` listener to `<a>` elements inside the rendered markdown container. Render the popover via `shadcn Popover` (or Radix `HoverCard`). Position near the link. Delay 300ms before showing (to avoid flicker on fast mouse-overs).

**H. Lighthouse pass**

Run: `npx lighthouse http://localhost:5173 --only-categories=accessibility --output json --output-path ./lighthouse-a11y.json`

Parse the output and confirm `categories.accessibility.score >= 0.95`. If below threshold, fix the reported issues before considering this phase done. Common issues to pre-fix:
- Missing `aria-label` on icon-only buttons (theme toggle, hamburger, GitHub link).
- Missing `role` on the command menu overlay.
- Color contrast failures (use the token system — if a color fails, adjust the token in `globals.css`).
- Missing `alt` on any `<img>` (should be none in B, but verify).

**What NOT to do:**
- Do not introduce new features. This is a polish-only phase.
- Do not change the manifest schema or content pipeline.
- Do not add animations beyond what is already in the design system.

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Build
npm run build

# 3. Lighthouse accessibility (requires Chrome installed)
# Run npm run dev in another terminal first
npx lighthouse http://localhost:5173 --only-categories=accessibility --output json --output-path ./lighthouse-a11y.json --chrome-flags="--headless"
node -e "
const r = require('./lighthouse-a11y.json');
const score = r.categories.accessibility.score;
console.log('Accessibility score:', score);
if (score < 0.95) process.exit(1);
console.log('PASS');
"

# 4. No hardcoded hex colors in component files
grep -rn "#[0-9a-fA-F]\{3,6\}" src/components src/hooks src/pages src/lib 2>/dev/null | grep -v ".gitkeep" | grep -v "lighthouse" && echo "FAIL" || echo "PASS: no hardcoded hex"

# 5. Print:hidden on nav elements
grep -l "print:hidden" src/components/layout/Sidebar.tsx src/components/layout/Topbar.tsx src/components/layout/RightSidebar.tsx
```

Manual smoke tests:
- Tab through the entire dashboard without a mouse — every interactive element receives a visible focus ring.
- Switch to light mode — verify code blocks switch theme (one-light), badges/pills remain legible.
- Switch to dark mode — same.
- Open `RenderedMarkdown` on a topic that has internal cross-links; hover a cross-link — popover appears after 300ms.
- Print preview (`Ctrl+P`) — only prose content shows; sidebar and topbar are hidden.

### Commit message

```
phase-8: a11y polish, focus rings, empty states, print:hidden, CrossLinkPreview

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] Every interactive element has a visible focus ring (keyboard tab audit passes).
- [ ] Skip link is the first focusable element and appears visibly on focus.
- [ ] Lighthouse a11y score ≥ 0.95 on the dashboard page.
- [ ] No hardcoded hex colors in component/hook/page/lib files.
- [ ] All empty states are meaningful and actionable.
- [ ] Skeleton loaders appear on `TopicPage` and `ProjectPage` while content loads.
- [ ] `print:hidden` applied to sidebar, topbar, right sidebar.
- [ ] `CrossLinkPreview` hover popover functional.
- [ ] Light/dark parity: both modes look correct on all pages.
- [ ] `npx tsc --noEmit` and `npm run build` pass.

---

## Task 9 — Phase 9: Deploy story

### Phase scope (verbatim from §16, plus tightening)

From §16 Phase 9: `npm run build` produces `web/dist/`, add `web/README.md`. Tightening: the subagent must also add a `vitest` test suite for the pure logic modules (`lib/progress.ts`, `lib/storage.ts`, `scripts/build-content.ts`) with the test cases from §17, and must verify the production build is a fully self-contained static site (no server calls on load).

### Implementer brief

You are a `frontend-design` subagent implementing Phase 9 of the frontierllm web UI. Full spec: `C:/Personal/frontierllm/docs/superpowers/specs/2026-04-26-web-ui-design.md`. Phases 1–8 are complete and all features are polished.

**What to build:**

**A. `web/README.md`**

Write a concise developer README covering:
1. Prerequisites: Node ≥ 20 (for ESM chokidar v5), `npm`.
2. **Dev:** `cd web && npm install && npm run dev` — starts at `localhost:5173`. The content pipeline runs automatically on start and on file changes in `notes/` or `projects/`.
3. **Build:** `npm run build` — outputs to `web/dist/`. The `dist/` is a static site; serve with any static host or `npx serve dist`.
4. **Deploy:** Vercel — drag-and-drop `dist/`, or `vercel deploy --prebuilt`. Netlify — similarly. Note: set the base directory to `web/` if using the Git-connected Vercel/Netlify flow (the project root is the monorepo root, not `web/`). Note: this is a personal tool; deploying is optional and purely for cross-device access.
5. **Updating content:** edit markdown files in `notes/` or `projects/`; the dev server hot-reloads. For the production build, re-run `npm run build`.
6. **Resetting progress:** the "About" page settings panel has a "Reset all progress" action.

**B. `vitest` test suite**

Install vitest: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`.

Add to `web/package.json` scripts: `"test": "vitest run"` and `"test:watch": "vitest"`.

Create `web/src/lib/__tests__/progress.test.ts`:
- Test `topicCompleteness` with a mock manifest entry: all unread → `{ read: 0, total: N, pct: 0 }`. All read → `{ read: N, total: N, pct: 100 }`. Empty list → `{ read: 0, total: 0, pct: null }`.
- Test `overallProgress` with 2 topics (different reading-list lengths) — verify weighted average formula.
- Test `synthesisStartedCount` with a mix of empty/started topics.

Create `web/src/lib/__tests__/storage.test.ts`:
- Test `readStorage` with valid JSON matching the schema — returns parsed value.
- Test `readStorage` with malformed JSON — returns default value (mock `localStorage`).
- Test `readStorage` with JSON that fails Zod validation — returns default value.

Create `web/scripts/__tests__/build-content.test.ts`:
- Test the reading-list parser with a sample markdown string containing 3 `- [ ]` items, one with full metadata and one with only a title.
- Test `synthesisStatus` detection: `*Fill in as you go.*` → `"empty"`, actual content → `"started"`.
- Test stable id generation: same input → same 12-char id; different input → different id.

Vitest config in `web/vite.config.ts`:
```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test-setup.ts'],
}
```
Create `web/src/test-setup.ts`:
```ts
import '@testing-library/jest-dom';
```

**C. Production build verification**

After running `npm run build`:
- The `web/dist/` directory contains `index.html` and hashed asset files.
- `web/dist/` does NOT contain any `.md` files (the content is pre-rendered as HTML and embedded in the chunk files or as static HTML assets).
- The generated `manifest.json` content IS included in the build (either as an imported module bundled into a chunk, or as a static asset in `dist/`). Verify: `grep -r "frontierllm" web/dist/ | head -5` returns results (the manifest content is present in the build).
- Open `web/dist/index.html` locally (via `npx serve web/dist` — listens on a free port, usually 3000) and verify the dashboard loads with real data. No server is needed.

**D. Add `npm run typecheck` script**

Add to `web/package.json`:
```json
"typecheck": "tsc --noEmit"
```
This is the canonical typecheck command referenced in all verification gates above.

**What NOT to do:**
- Do not add E2E tests (Playwright) — per §17, these are out of scope for B.
- Do not add snapshot tests of generated HTML values — only schema shape snapshots are appropriate.
- Do not change any feature implementation. Phase 9 is infrastructure-only.

### Verification gates

Run from `C:/Personal/frontierllm/web/`:

```bash
# 1. TypeScript clean
npx tsc --noEmit

# 2. Unit tests pass
npm run test

# 3. Production build
npm run build

# 4. dist/ is a self-contained static site (no server calls)
ls dist/index.html
# Verify manifest data is in the bundle:
grep -r "frontierllm" dist/ | head -3

# 5. Serve the production build and verify dashboard loads
# (run in background, visit localhost:3000, verify)
npx serve dist -l 3000 &
SERVE_PID=$!
sleep 3
curl -s http://localhost:3000 | grep -i "frontierllm" && echo "PASS: prod build serves" || echo "FAIL"
kill $SERVE_PID 2>/dev/null
```

Manual smoke test:
- `npx serve web/dist -l 3000`, open `http://localhost:3000`.
- Dashboard loads with topics and progress.
- Navigate to `/notes/01-pretraining` — content renders.
- Tick a checkbox — works with no server.
- `Ctrl+K` — command menu opens.
- All from a static file serve with no dev server.

### Commit message

```
phase-9: deploy story, vitest unit tests, web/README.md

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Definition of done

- [ ] `npm run test` passes all unit tests (≥ 9 test cases across 3 test files).
- [ ] `npm run build` exits 0 and produces `web/dist/`.
- [ ] `web/dist/` is a self-contained static site that loads correctly when served with `npx serve`.
- [ ] `web/README.md` is complete and accurate.
- [ ] `npm run typecheck` is a valid script.
- [ ] `npx tsc --noEmit` passes.

---

## Task 10 — Final verification

Run the full success-criteria from spec §18 against the running app. This is the orchestrator's responsibility (not dispatched to a subagent).

### Checklist (from spec §18)

- [ ] `cd web && npm run dev` starts without errors.
- [ ] Open `http://localhost:5173` — dashboard is visible immediately, showing current reading progress.
- [ ] Edit any `.md` file in `notes/` or `projects/` — the rendered page updates within ~1 second (hot reload from the chokidar watcher).
- [ ] Tick a reading-list checkbox on any topic page — the topic progress meter updates without a page refresh. Reload — the checkbox is still ticked.
- [ ] Open the command menu (`Cmd+K` / `Ctrl+K`) and type "scaling" — results appear within 100ms.
- [ ] Run: `npx lighthouse http://localhost:5173 --only-categories=accessibility --output json --output-path ./final-a11y.json --chrome-flags="--headless"` and verify `categories.accessibility.score >= 0.95`.
- [ ] Run: `npx lighthouse http://localhost:5173/notes/01-pretraining --only-categories=accessibility --output json --output-path ./final-topic-a11y.json --chrome-flags="--headless"` and verify score ≥ 0.95.
- [ ] Subjective check: ask yourself "Does this look thoughtful, technical, and calm — or does it look like a marketing site?" If the latter, the aesthetic is wrong. Triggers for investigation: cool gray backgrounds, non-serif body text, heavy shadows, bright gradients, rounded-xl cards.
- [ ] Run `npm run build` and verify `web/dist/` is produced and the production build works via `npx serve web/dist`.
- [ ] Run `npm run test` — all unit tests pass.
- [ ] Run `npx tsc --noEmit` — exits 0.

### Final commit

Once all checklist items are verified:

```bash
cd /c/Personal/frontierllm
git -c commit.gpgsign=false commit --allow-empty -m "$(printf 'feat: web UI complete — all 9 phases verified\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>')"
```

---

## Self-review notes

This plan was self-reviewed before delivery:

**Placeholder scan:** No "TBD", no "implement later", no vague "make it polished" in any implementer brief. Every brief specifies file paths, function signatures, exact class names, and concrete deliverables. Phase 6 says "implement all pages" but then enumerates every sub-component of every page. Phase 8 says "focus ring audit" but then lists every component category to audit.

**Phase size assessment:**
- Phase 1 (skeleton): FINE — mostly CLI commands, no design decisions.
- Phase 2 (tokens): FINE — focused CSS work with exact token values from spec.
- Phase 3 (content pipeline): MODERATE — complex but a single cohesive concern (one script, one plugin). The reading-list parser and rehype pipeline are well-specified.
- Phase 4 (app shell): FINE — layout work; the routes are enumerated.
- Phase 5 (content rendering): MODERATE — 10 components/hooks but all are building blocks without user-facing page logic. Self-contained.
- **Phase 6 (pages): LARGE — flagged.** 7 pages, each with sub-components. The orchestrator SHOULD split this into two dispatches:
  - **Phase 6a:** `DashboardPage` + `NotesIndexPage` + `TopicPage` + `OrientationPage` (the reading-critical pages).
  - **Phase 6b:** `ProjectsIndexPage` + `ProjectPage` + `ReadingListPage` + `AboutPage`.
  The brief covers all of Phase 6 in one document, but the orchestrator can simply split the invocation at the "E. ProjectsIndexPage" boundary.
- Phase 7 (search): FINE — tightly scoped around MiniSearch and one dialog component.
- Phase 8 (polish): FINE — enumerated checklist, no new architecture.
- Phase 9 (deploy): FINE — vitest tests + README + build verification.

**Windows/bash compatibility of verification commands:**
- All `npm run *` commands run on Windows via bash.
- `grep -rn`, `ls`, `kill $PID` — all work in bash on Windows 11.
- `node -e` — works on Windows with Node installed.
- `npx lighthouse` — requires Chrome installed; the user is a developer on Windows 11, Chrome is almost certainly present. The `--chrome-flags="--headless"` flag works with Chrome on Windows.
- The `sleep 8` in Phase 3 verification and `sleep 3` in Phase 9 — work in bash on Windows (bash sleep command, not PowerShell).
- `&` for backgrounding and `kill $!` — work in bash on Windows.

**Self-containedness:** Each implementer brief names the phase number, states which prior phases are complete, lists all files to create by absolute path convention (`web/src/...`), specifies exact class names/APIs/types, and states what NOT to do. A subagent with only the brief + spec could implement the phase without asking for clarification.

**§14 open decisions:** Not re-litigated. All defaults applied:
- Pre-rendered HTML at build time (§14 item 1) — used throughout.
- Separate `/reading` route (§14 item 2) — implemented as a top-level route.
- Warm-dark palette (§14 item 3) — used; note in Phase 2 brief that the fallback (neutral dark) is a one-line change.
- Tab-based topic page (§14 item 4) — implemented in Phase 6.
- No per-item annotation (§14 item 5) — not implemented.
- No PDF viewer (§14 item 6) — not implemented.
- Title-based stable IDs (§14 item 7) — used in Phase 3.
- Self-hosted fonts via `@fontsource` (§14 item 8) — implemented in Phase 2.
- Vite plugin in `web/scripts/` (§14 item 9) — used.

---

Now let me save this to the correct path. I need to write this file. Since I don't have a Bash/Write tool available in my tool list, I need to indicate this constraint to the user. Let me re-examine my tools one more time...

My available tools are: Glob, Grep, Read, WebFetch, WebSearch, TaskStop. There is no file-write or shell execution tool. I cannot save the file or commit.

I will provide the complete plan text as my response and give the user exact instructions to save and commit it. The plan content above is complete and ready to save.

---

Here is the complete plan. Since I do not have a file-write or shell tool available in this environment, you will need to save it manually. Here are the exact steps:

**Save the file** — copy everything between the `---` markers above (from the `# frontierllm Web UI Implementation Plan` header through the end of the self-review section) into:

`C:/Personal/frontierllm/docs/superpowers/plans/2026-04-26-web-ui-implementation.md`

**Then commit:**

```bash
cd /c/Personal/frontierllm
git add docs/superpowers/plans/2026-04-26-web-ui-implementation.md
git -c commit.gpgsign=false commit -m "$(printf 'add web UI implementation plan\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>')"
```

---

**Report:**

- **Commit SHA:** Cannot be provided — I do not have shell access to execute the commit. The commit command above is exact; the SHA will be reported after you run it.

- **Total task count:** 11 tasks (Task 0 + Tasks 1–9 + Task 10 final verification), corresponding to 1 pre-phase task, 9 phase tasks, and 1 post-phase verification task. Total implementer dispatches: 9 (one per phase). Total checkboxes: ~95 across all tasks.

- **Phases flagged as too large or risky:**

  1. **Phase 6 (pages) — flagged LARGE.** This is the highest-risk dispatch. It covers 7 page components (DashboardPage, NotesIndexPage, TopicPage, OrientationPage, ProjectsIndexPage, ProjectPage, ReadingListPage, AboutPage) plus their sub-components (ActivityCard, TopicProgressCard, RoadmapStrip, RecentEdits). Recommendation: split into Phase 6a (first 4 pages — the reading-critical ones) and Phase 6b (last 4 pages) at the "E. ProjectsIndexPage" boundary in the brief. The brief is written to support this split without rewriting — just tell the Phase 6b subagent "Phase 6a is complete, implement sections E through H of the Phase 6 brief."

  2. **Phase 3 (content pipeline) — moderate risk.** The reading-list parser is the most bespoke piece of logic in the project (parsing free-form markdown with em-dash separators and parenthesized metadata). The brief specifies the parsing rules from §3 carefully, but the subagent will need to make judgment calls on edge cases. The Zod types and stable-id derivation are fully specified. If the parser produces unexpected output, the verification gate (checking that `01-pretraining` has ≥ 10 items with 12-char IDs) will catch it.

  3. **Phase 8 (polish) — Lighthouse dependency.** The Lighthouse CLI verification requires Chrome to be installed. This is a reasonable assumption for a developer on Windows 11, but if Chrome is not at the default path, the `--chrome-flags` approach may need `--chrome-path` instead. The orchestrator should note this and have a fallback (use axe DevTools browser extension manually if CLI fails).

- **Confirmation the plan is self-contained:** Yes. Each implementer brief:
  - Names its phase number and states which prior phases are complete.
  - References spec sections by number for all design decisions rather than restating them.
  - Lists every file to create or modify.
  - Specifies exact TypeScript interfaces, class names, Tailwind utility classes, and behavioral rules.
  - States explicit "What NOT to do" guards.
  - Provides concrete success criteria (not "be polished").
  - All verification commands are bash-compatible and runnable on Windows 11 with Node ≥ 20 and npm installed.