# frontierllm — Web UI Design

**Date:** 2026-04-26
**Author:** Henry Vu (with Claude)
**Status:** Draft for review (implementation deferred to `frontend-design` subagent)
**Supersedes / extends:** `docs/superpowers/specs/2026-04-25-frontierllm-design.md` — section "Optional `web/` layer (deferred)"

## 0. Scope of this spec

This spec covers **Option B: a content-focused web reader** for the existing
markdown content under `notes/` and `projects/`. It does **not** cover Option C
(interactive visualizations: scaling-law explorers, attention viz, RLHF reward
landscapes). C is deferred per the original design's trigger conditions.
Section 12 documents extension points so C can slot in later without
rearchitecting.

## 1. Purpose and scope

### What this UI is

A polished, local-first web reader for the `frontierllm` learning repo. The UI
turns the existing markdown in `notes/` and `projects/` into a navigable,
trackable study surface so the user can:

- See the seven topics and three projects at a glance with a status dashboard.
- Read any topic / project / orientation file as rendered HTML with proper
  typography, code blocks, and tables.
- Tick off items in a topic's reading list and have the progress persist
  (localStorage) and roll up into a "topic completeness %" on the dashboard.
- Filter the reading lists by status (unread / read / all) and by basic
  metadata (topic).
- Quickly find a paper or section by title via lightweight search.

### What this UI is NOT

- Not a Markdown editor. The repo is the source of truth; the UI is read-only
  except for ticking reading-list checkboxes, which persist to localStorage and
  do not write back to the repo.
- Not a CMS / database. No backend, no auth, no server.
- Not the place where synthesis is written. The user keeps writing synthesis
  in the `.md` files in their editor; the UI surfaces what's there.
- Not a public-facing site. It is a personal tool. Localhost first; if
  deployed it is intended to be private.
- Not a viz / playground (that is Option C, deferred).

## 2. Information architecture

### Top-level routes

| Route                          | Purpose                                                              |
|--------------------------------|----------------------------------------------------------------------|
| `/`                            | **Dashboard.** Roadmap rollup, active activity callout, recent edits |
| `/notes`                       | **Notes index.** Grid of all 7 topics with progress meters           |
| `/notes/:slug`                 | **Topic page.** Renders `notes/<slug>/README.md` + reading-list UI   |
| `/notes/07-frontier-labs/orientation` | **Orientation pass.** Renders `00-orientation.md` (special)   |
| `/projects`                    | **Projects index.** 3-card grid                                      |
| `/projects/:slug`              | **Project page.** Renders `projects/<slug>/README.md`                |
| `/reading`                     | **Reading list view.** Flat, filterable across all topics            |
| `/about`                       | **About.** Renders root `README.md` + design-spec link               |
| `/search?q=...`                | **Search results page.** Title + heading matches across all content  |

`*` slugs map 1:1 to the existing folder names (`00-foundations`,
`01-pretraining`, ..., `07-frontier-labs`, `01-pretrain-end-to-end`, etc.).

### Hierarchy

```
Dashboard
├─ Notes
│  ├─ 00-foundations
│  ├─ 01-pretraining
│  ├─ 02-post-training
│  ├─ 03-rlhf-and-rl
│  ├─ 04-distributed-training
│  ├─ 05-eval-and-benchmarks
│  ├─ 06-alignment-and-interp
│  └─ 07-frontier-labs
│     └─ 00-orientation (special; promoted to nav)
├─ Projects
│  ├─ 01-pretrain-end-to-end
│  ├─ 02-post-train-end-to-end
│  └─ 03-eval-and-interp
├─ Reading list (flat view)
└─ About
```

### Mental model for the user

"The Dashboard is my homepage; Notes is where I read and tick boxes; Projects
is where I look up scope when I'm about to start one; Reading list is the
queue; everything else is plumbing."

## 3. Content pipeline

### Decision: build-time markdown → JSON manifest

At build time (and on `vite dev` startup), a Vite plugin walks the repo's
`notes/` and `projects/` directories, parses each `.md` file with
**`unified` + `remark-parse` + `remark-gfm`** (GitHub-flavored markdown,
so `- [ ]` checkboxes are recognized), extracts metadata, and emits two
artifacts the React app consumes at runtime:

1. **`web/src/generated/manifest.json`** — small, eagerly imported.
   - All topics, all projects, with: `slug`, `title`, `path`, `kind`
     (`topic | project | orientation | root`), `headings` (h1–h3 with
     anchor ids), `readingList` (array of `{ id, text, url, gloss, meta,
     status: "unread" }` parsed from list items in the "Reading list"
     section), `wordCount`, `lastModified` (mtime), and any cross-links
     to other docs.
2. **`web/src/generated/content/<slug>.html`** (one per source `.md`) —
   pre-rendered HTML produced via remark → rehype → rehype-stringify with
   syntax highlighting (`rehype-pretty-code` using the **Tokyo Night** dark
   theme + a light variant), heading anchors, and external link icons.
   Files are imported lazily via Vite's `import.meta.glob({ as: 'raw' })`.

Why pre-render to HTML rather than render in the browser:
- Fast first paint; no markdown parser shipped to the client.
- Syntax highlighting (Shiki via `rehype-pretty-code`) is a non-trivial
  dependency we do not want at runtime.
- The content rarely changes; it is a build-time artifact.
- Keeps client bundle small.

Why JSON manifest *and* HTML files (not one or the other):
- Manifest powers the dashboard, navigation, search, reading-list view, and
  progress meters without parsing per-page HTML at runtime.
- Per-file HTML keeps each topic page chunk tiny and lazy-loadable.

### Reading-list parsing rules

The reading-list parser looks inside the `## Reading list` section (case-
insensitive H2 match) and treats every `- [ ]` / `- [x]` list item as a
reading-list entry. Bold leading text is parsed as the title; subsequent
em-dash-separated segments are parsed as `link`, `gloss`, and `meta`
(parenthesized). The parser is deliberately lenient: anything it cannot parse
becomes the `text` field verbatim, preserving inline formatting. The
checkboxes in the source markdown are **ignored** for state purposes — runtime
progress lives in localStorage and is keyed by a stable id.

A stable id is derived as `sha1(topicSlug + ":" + normalized title text)`
truncated to 12 chars. This is stable across re-orderings as long as the
title text is unchanged. If the user renames a reading-list title in
markdown, the id changes and the checkbox effectively resets — acceptable
trade-off for a personal tool.

### Headings and table-of-contents

`rehype-slug` + `rehype-autolink-headings` adds anchor ids and clickable
heading links. The manifest stores h2/h3 entries per page so the right
sidebar can render a TOC.

### Special handling: orientation page

`notes/07-frontier-labs/00-orientation.md` is special: its "comparative table"
and "personal map" sections become candidates for richer rendering later
(Option C extension point). For B, render it as plain content with a banner
at the top promoting it as the "first active activity."

### Tooling decision summary

- **Markdown processor:** `unified` + `remark-parse` + `remark-gfm` +
  `remark-rehype` + `rehype-slug` + `rehype-autolink-headings` +
  `rehype-pretty-code` + `rehype-stringify`.
- **Build integration:** custom Vite plugin (`web/scripts/build-content.ts`)
  that runs on `buildStart` and on file change in dev (chokidar watcher
  rooted at `../notes` and `../projects`). It writes into
  `web/src/generated/` which is gitignored.
- **Not used:** MDX (overkill, JSX-in-markdown not needed for B), `marked`
  (less ergonomic plugin ecosystem), runtime markdown parsing (slower,
  heavier bundle).

## 4. Component inventory

Grouped by responsibility. Each entry: file path → 1-line responsibility.

### App shell

- `web/src/App.tsx` — routes, providers (theme, query client, router).
- `web/src/components/layout/AppShell.tsx` — sidebar + main pane + topbar grid.
- `web/src/components/layout/Sidebar.tsx` — left nav: dashboard, notes (group
  with 7 children), projects (group with 3 children), reading list, about.
- `web/src/components/layout/Topbar.tsx` — search input, theme toggle, GitHub
  link, "open in editor" link to the underlying `.md`.
- `web/src/components/layout/RightSidebar.tsx` — per-page TOC (h2/h3 anchors)
  with active-section scroll-spy.
- `web/src/components/layout/PageContainer.tsx` — max-width prose container
  with consistent padding and entrance animation.

### Routing pages

- `web/src/pages/DashboardPage.tsx` — overall progress, active activity card,
  per-topic progress strip, recent edits, quick links.
- `web/src/pages/NotesIndexPage.tsx` — 7-card grid of topics.
- `web/src/pages/TopicPage.tsx` — renders one topic; embeds reading list with
  interactive checkboxes; renders synthesis / open questions sections as
  prose with empty-state hints when stubbed.
- `web/src/pages/OrientationPage.tsx` — wraps the topic renderer with the
  orientation-specific "first activity" header.
- `web/src/pages/ProjectsIndexPage.tsx` — 3-card grid of projects.
- `web/src/pages/ProjectPage.tsx` — renders one project README.
- `web/src/pages/ReadingListPage.tsx` — flat, filterable, groupable.
- `web/src/pages/SearchPage.tsx` — search results.
- `web/src/pages/AboutPage.tsx` — repo README + design-spec link.
- `web/src/pages/NotFoundPage.tsx` — 404.

### Content rendering

- `web/src/components/content/RenderedMarkdown.tsx` — injects pre-rendered
  HTML into a `prose` container; intercepts internal anchor clicks; renders
  reading-list section as the interactive component below; sanitizes via
  build-time allowlist (we own the source content, but we still scrub).
- `web/src/components/content/ReadingList.tsx` — reads
  `manifest[topicSlug].readingList`, renders rows, syncs checkbox state with
  the progress store; supports filter, sort, and a small "mark all read /
  unread" action.
- `web/src/components/content/ReadingListItem.tsx` — single row: checkbox,
  title (link), gloss, meta pill (paper/blog/talk + est read time).
- `web/src/components/content/Toc.tsx` — table-of-contents component (h2/h3).
- `web/src/components/content/CrossLinkPreview.tsx` — hover preview for
  internal links to other docs (loads from manifest, not the HTML chunk).

### Progress / dashboard

- `web/src/components/progress/ProgressBar.tsx` — thin shadcn-style bar.
- `web/src/components/progress/TopicProgressCard.tsx` — single card on the
  notes index / dashboard with title, 1-line gloss, "X/Y read" and a meter.
- `web/src/components/progress/RoadmapStrip.tsx` — horizontal compact view of
  all topics with progress bars; fits on dashboard.
- `web/src/components/progress/ActivityCard.tsx` — "current active activity"
  block on the dashboard.
- `web/src/components/progress/RecentEdits.tsx` — list of last-modified files.

### Search

- `web/src/components/search/SearchInput.tsx` — debounced input bound to
  cmd-k overlay or topbar.
- `web/src/components/search/SearchResults.tsx` — grouped results.
- `web/src/components/search/CommandMenu.tsx` — cmd-k palette (shadcn
  command), shows recent pages + quick actions + search.

### UI primitives (shadcn install set)

`button`, `card`, `badge`, `checkbox`, `input`, `select`, `tabs`, `dialog`,
`command`, `popover`, `tooltip`, `separator`, `scroll-area`, `progress`,
`switch`, `breadcrumb`. Installed via `npx shadcn@latest add <name>`. No
custom CSS beyond design tokens.

### Hooks

- `web/src/hooks/useReadingProgress.ts` — read/write reading-list state
  (localStorage, JSON, schema-versioned).
- `web/src/hooks/useTopic.ts` — manifest entry + lazy HTML chunk for a slug.
- `web/src/hooks/useSearch.ts` — debounced, runs against in-memory MiniSearch
  index built from manifest.
- `web/src/hooks/useTheme.ts` — light/dark toggle (default dark).
- `web/src/hooks/useScrollSpy.ts` — for active TOC heading.

### Lib / utilities

- `web/src/lib/manifest.ts` — typed accessors over `manifest.json`.
- `web/src/lib/progress.ts` — derive completeness % per topic, overall %.
- `web/src/lib/storage.ts` — namespaced localStorage with schema migration.
- `web/src/lib/cn.ts` — `clsx` + `tailwind-merge`.
- `web/src/lib/search-index.ts` — builds MiniSearch index at startup.

## 5. State management

Decision: **no Zustand, no Redux.** Three buckets, three mechanisms.

### A. Local component state (`useState` / `useReducer`)

Anything that does not survive a refresh and is not URL-meaningful: hover,
focus, dropdown open, transient form state, command-menu open state.

### B. URL state (`react-router-dom` search params)

Anything bookmarkable or shareable across reloads:

- `?q=` on `/search`
- `?status=unread|read|all` and `?topic=<slug>` on `/reading`
- `?tab=overview|reading|synthesis` on `/notes/:slug` (if we tabbify; see §8)

### C. localStorage (via `useReadingProgress` + a couple of small hooks)

Anything that persists per-user but is not server-backed:

- `frontierllm:reading-progress:v1` — `Record<readingItemId, { status:
  "read" | "unread", checkedAt?: ISOString }>`. Single flat map keyed by
  the stable id from §3.
- `frontierllm:theme:v1` — `"dark" | "light" | "system"` (default `"dark"`).
- `frontierllm:ui-prefs:v1` — `{ readingFilter: "all" | "unread" | "read",
  notesView: "grid" | "list", sidebarCollapsed: boolean }`.
- `frontierllm:recent-pages:v1` — last 8 visited slugs (for cmd-k).

All localStorage values are read through a single `storage` module that
validates with a Zod schema and migrates on version mismatch.

### Why no global store

The data is mostly static (manifest + HTML), state is small (a flat map of
checkbox booleans), and no two components write the same key cross-tree
beyond the reading-progress store. A custom hook with a `useSyncExternalStore`
subscription is sufficient and avoids a dependency. If state grows (e.g.,
notebook-like view state on multiple cards), revisit Zustand.

### Server state

`@tanstack/react-query` is **not used** in B (no fetches). It is included in
the global standards default but is overkill here. Listing it as an
extension point if we ever fetch a remote eval-result API.

## 6. Progress tracking model

### Definition of "done" for a reading-list item

`status === "read"`. There is no partial / "skimmed" state in B (could be
added later as an enum, but YAGNI).

### Per-topic completeness

```
topicCompletenessPct(slug) =
  100 * count(status == "read") / total(readingList[slug])
```

If `total === 0` (no reading list items, e.g., 07-frontier-labs has a
"living list" rather than fixed items), display "—" instead of 0%, so the
topic is not penalized.

### Per-topic "synthesis written?" flag

A coarse signal computed at build time from the manifest: scan the
"Synthesis (your own words)" section of each topic README. If the section
contains only the placeholder `*Fill in as you go.*`, flag
`synthesisStatus = "empty"`; else `"started"`. This is a heuristic, not a
quality measure, but it fuels the dashboard.

### Overall progress

A simple weighted average of topic completeness, weighted by reading-list
length (so foundations with 6 items doesn't dominate pretraining with 17).
Topics with `total === 0` are excluded.

### Surface in UI

- **Dashboard:** big circular progress (overall %), strip of 7 mini-bars
  (one per topic), "X of Y reading items done", "synthesis started in N of
  7 topics", "active activity: orientation pass — 0 of 6 reports read".
- **Notes index:** each topic card shows "X/Y" + a thin progress bar.
- **Topic page:** progress bar at the top of the reading-list section
  ("3/12 read"); inline checkboxes; "mark all read" / "reset" button.
- **Reading list view:** filter controls + counts ("Showing 14 of 87
  items, 23 read overall").

### Reset / export

- "Reset progress for this topic" (confirmation modal).
- "Reset all progress" (in About page settings, double confirmation).
- "Export progress as JSON" / "Import" (a tiny JSON download/upload). Cheap
  to add; mitigates the only thing that hurts when localStorage clears.

## 7. Design system

### Visual stance

This is a learning repo, not a SaaS marketing site. The aesthetic to target
is **"thoughtful, technical, calm"** — closer to a research lab notebook
than a product page. Reference moodboard: Anthropic's docs, Vercel docs in
dark mode, Linear's documentation pages, classic LaTeX papers.

Core principles:
- High information density without feeling cluttered.
- Long-form readability is the primary pleasure metric.
- Zero gradient, zero hero illustrations, no marketing copy.
- Color is a tool for hierarchy, not decoration; one accent only.

### Color tokens (oklch)

Defined as CSS variables on `:root` and `:root.dark`. Tailwind config maps
these to utility classes (`bg-background`, `text-foreground`, etc.). No
hex/rgb in components per global standards.

```css
:root {
  /* Light mode (secondary; default is dark) */
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.18 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0 0);
  --muted: oklch(0.96 0 0);
  --muted-foreground: oklch(0.48 0 0);
  --border: oklch(0.92 0 0);
  --input: oklch(0.92 0 0);
  --ring: oklch(0.55 0.13 240);
  --primary: oklch(0.55 0.13 240);          /* slate-blue */
  --primary-foreground: oklch(0.99 0 0);
  --accent: oklch(0.94 0.02 240);
  --accent-foreground: oklch(0.18 0 0);
  --destructive: oklch(0.55 0.22 27);
  --success: oklch(0.62 0.14 150);
  --radius: 0.5rem;
}

:root.dark {
  --background: oklch(0.16 0.005 240);      /* deep cool gray */
  --foreground: oklch(0.93 0 0);
  --card: oklch(0.20 0.005 240);
  --card-foreground: oklch(0.93 0 0);
  --muted: oklch(0.22 0.005 240);
  --muted-foreground: oklch(0.65 0 0);
  --border: oklch(0.27 0.008 240);
  --input: oklch(0.27 0.008 240);
  --ring: oklch(0.72 0.10 240);
  --primary: oklch(0.72 0.10 240);          /* slightly desaturated blue */
  --primary-foreground: oklch(0.16 0.005 240);
  --accent: oklch(0.26 0.02 240);
  --accent-foreground: oklch(0.93 0 0);
  --destructive: oklch(0.65 0.20 27);
  --success: oklch(0.72 0.14 150);
  --radius: 0.5rem;
}
```

The single accent is a **muted slate-blue**: technical, calm, and
unmistakably not "marketing teal" or "AI lab purple." Status colors
(success / destructive / warning) are reserved for status pills and
alerts only — never decorative.

### Typography pairing

- **Body / UI:** `Inter` (variable) — mature, neutral, exceptional at all
  sizes; the Anthropic-docs feel.
- **Display / headings:** `Inter` at heavier weights (no separate display
  face; keeps the page calm).
- **Mono / code:** `JetBrains Mono` (variable) — clean ligatures-off, a
  near-universal "I am a developer reading code" signal.
- Loaded via `@fontsource-variable/inter` and
  `@fontsource-variable/jetbrains-mono` (self-hosted; no Google Fonts call
  for offline-first dev). Listed in CSS as `font-sans` and `font-mono`.

Heading scale (Tailwind `prose`-aware):
- `h1`: `text-3xl font-semibold tracking-tight` (page title).
- `h2`: `text-2xl font-semibold tracking-tight mt-10` (section).
- `h3`: `text-xl font-medium tracking-tight mt-8`.
- `h4`: `text-lg font-medium`.
- Body: `text-[15px] leading-relaxed text-foreground/90`.
- Muted body: `text-sm text-muted-foreground leading-relaxed`.

### Spacing scale

4px base unit. Used values: 4, 8, 12, 16, 24, 32, 48, 64. Internal card
padding is `p-6` minimum (`p-4` on small cards). Section gaps are `gap-6`
or `gap-8` and never mixed within a region.

### Shadows / elevation

- Light mode cards: `shadow-sm`, hover `shadow-md`, transition 200ms.
- Dark mode: no shadows. Use `border border-border` plus subtle
  `ring-1 ring-white/[0.04]` for elevated surfaces (popovers, dialogs).

### Radius

- Cards / containers: `rounded-xl` (12px).
- Buttons / inputs: `rounded-md` (6px).
- Avatars / pills: `rounded-full`.
- Code blocks: `rounded-lg` (8px).

### Motion

`framer-motion` for orchestrated entrances. Page transitions:

- `initial={{ opacity: 0, y: 8 }}` →
  `animate={{ opacity: 1, y: 0 }}` →
  `exit={{ opacity: 0, y: -4 }}`,
- duration 220ms, easing `easeOut`.
- Lists stagger children at 30–40ms between items, capped at 8 items
  (then snap remaining).

Interactive transitions per global standards:
- Links: `transition-colors duration-150`.
- Buttons: hover bg shift + `active:scale-[0.98]`.
- Cards: `transition-shadow duration-200 hover:shadow-md` (light) /
  `hover:bg-accent/40` (dark).
- All interactive elements get visible focus rings:
  `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`.

### Prose styling

`@tailwindcss/typography` plugin with a custom theme that maps `prose`
classes to design tokens (no hardcoded colors). Code blocks use the Shiki-
generated HTML untouched (themed via `rehype-pretty-code`). Inline code
gets `bg-muted px-1.5 py-0.5 rounded font-mono text-[0.92em]`.

Tables get a subtle striped variant via `prose-table:...` modifiers; the
orientation comparative table is the headline use case and must look
respectable.

## 8. Page-by-page layout

All pages live inside `AppShell` which provides Sidebar (left) + content
column (center) + RightSidebar (right, hidden < 1280px). Header is a thin
Topbar with breadcrumbs, search, theme toggle.

### Dashboard (`/`)

Top: a compact hero with the repo title, a 1-line description, and the
"current active activity" call-out (orientation pass, with progress
"0/6 reports").

Middle: an overall-progress card on the left (large circular meter +
"X% across all topics, Y of Z reading items read"), and a "Synthesis
status" card on the right ("Started in N of 7 topics").

Bottom: `RoadmapStrip` listing all 7 topics as horizontal mini-bars (1
row each, slug + 1-line gloss + bar + count), and below it a 3-card
project status grid. Final block: "Recently edited" (last 5 markdown
files by mtime, links).

### Notes index (`/notes`)

Header: "Notes" + subtitle "The conceptual layer." A toggle between
"Grid" and "List" views (URL `?view=grid|list`).

Grid: 2 columns on `md`, 3 on `xl`. Each `TopicProgressCard` shows topic
title, slug pill, 2-line gloss (the "What this is" first paragraph),
reading progress bar, "X/Y read", synthesis status pill ("Empty" /
"Started"), last-modified date. Hover elevation. Click goes to topic page.

### Topic page (`/notes/:slug`)

Two-column layout (content + RightSidebar TOC). Content column:

- Breadcrumb: `Notes / 01 Pretraining`.
- H1 title.
- Subtitle pulled from "What this is" (first paragraph).
- Tabbed view: `Overview | Reading list | Synthesis | Open questions |
  Code` (URL `?tab=...`). Default `Overview` shows full rendered markdown
  scrolled top-to-bottom; the other tabs deep-link into individual sections
  with their own focus mode (and, for Reading list, the interactive
  component overrides the static rendered section). Tabs are ergonomic for
  this user since topics are long; the URL parameter is shareable.
- "Open in editor" link (top-right) using a `vscode://file//<absolute
  path>` URI; falls back to copy-path button if scheme unsupported.
- "Last modified" timestamp.

Reading-list section: progress bar at top, status filter (`All / Unread
/ Read`), then list of `ReadingListItem` rows. Each row: checkbox, title
(external link, opens new tab), em-dash, gloss text, then a small badge
(`paper`, `blog`, `talk`, `code`) and a clock icon + estimated read time
when present. Hover: row gets `bg-accent/40`. Animated checkmark on tick.

### Orientation page (`/notes/07-frontier-labs/orientation`)

Same as topic page, but with a top banner: "First active activity. Read 6
recent frontier-model technical reports and produce a comparative
writeup." The 6 target reports are rendered as a primary checklist (not
inside a tab) with a progress bar. Below, the comparative-table skeleton
renders as a regular GFM table (read-only). Below that, the personal-map
section renders as a list. (In Option C, the table becomes editable; not
in B.)

### Projects index (`/projects`)

3-card grid. Each card: project number + title, one-line goal, status
pill ("Scoped / not started"), connection arrows ("← inputs from
Project 01" / "→ outputs to Project 03").

### Project page (`/projects/:slug`)

Single column. Renders the project README in full as prose. RightSidebar
TOC. Top: breadcrumb, title, status pill, "Open in editor" link.

### Reading list (`/reading`)

Flat, sortable, filterable. Header with totals. Filters (URL-driven):
- Status: `all | unread | read`
- Topic: `all | <slug>` (multi-select via popover)
- Sort: `topic order (default) | est read time | title`

Rows are reused `ReadingListItem` but include a topic pill. Double-click
or "Open topic" arrow goes to the source topic.

### Search (`/search?q=...`)

Three result groups: `Pages` (matches in title / topic gloss), `Headings`
(matches in h2/h3 from the manifest), `Reading items` (matches in
reading-list titles + glosses). Each group capped at 10 results, with
"see all" expansion. No fulltext over rendered content body in B; this
keeps the index small (all matches come from the manifest).

### About (`/about`)

Renders root `README.md`. Adds a "Design specs" section linking to
`docs/superpowers/specs/2026-04-25-frontierllm-design.md` (rendered) and
this spec. Settings panel at the bottom: theme picker, "Reset all
progress", export/import JSON.

### 404

Standard "Not found" with a search input and links back to dashboard.

## 9. Navigation pattern

**Both: persistent left sidebar + minimal topbar.**

- **Left sidebar** (collapsible, default expanded on `≥ md`): primary
  navigation. Sections: Dashboard, Notes (collapsible group with all 7
  topics, each row showing a tiny progress dot), Projects (group with
  3), Reading list, About. Mobile: hidden behind a hamburger; uses
  shadcn `Sheet`.
- **Topbar** (sticky): breadcrumbs left, search input center (cmd-k
  trigger on small widths), theme toggle and "Open repo on GitHub"
  link right.
- **Right sidebar** (only on `≥ xl`): per-page TOC with scroll-spy;
  fades out at smaller widths and becomes a floating "On this page"
  popover button.
- **Cmd-k command menu** (global): from anywhere, jump to any topic /
  project / reading item / heading. Uses shadcn `Command`.

Why both: the user is browsing both deep (one topic at a time, long
reading) and wide (cross-topic search, reading-list flat view). A single
top nav is too thin; sidebar-only loses breadcrumbs and search-affordance
on a long scroll. The combination matches what he uses elsewhere
(MLPlayGround, plus standard tooling like Linear/Vercel docs).

## 10. Search

### Decision: lightweight in-memory index over manifest only

**Library:** `minisearch` (10kb, no native deps). At app boot, build an
index from the manifest with the following fields:

- Page titles, gloss, breadcrumb (boost ×3).
- All h2/h3 headings (boost ×2).
- Reading-list item titles + glosses (boost ×1.5).
- Reading-list `meta` (e.g., "paper", "Anthropic") (boost ×1).

Stop at headings/titles. Do **not** index the body prose.

### Why not full text

The body prose is currently mostly empty (synthesis sections are
placeholders). A heavyweight fulltext system (Pagefind, Lunr) would index
mostly empty content. When synthesis grows substantial, swap MiniSearch
for Pagefind which builds a static fulltext index at build time (extension
point — see §12).

### Quality features

- Fuzzy + prefix matching enabled.
- Max 30 results, grouped by kind (page / heading / reading item).
- Cmd-k uses the same index.

## 11. Dark mode

**Default: dark.** The user is a developer; the tokens are designed dark-
first (deep cool gray ~oklch(0.16 0.005 240)) with a light-mode
counterpart for daylight reading. Implementation:

- `class`-based dark mode in Tailwind config (`darkMode: "class"`).
- `useTheme` hook syncs `<html>` class with localStorage and supports
  three values: `dark` (default), `light`, `system`.
- Theme toggle is a 3-state `Switch` group in the topbar (sun / monitor /
  moon icons).
- Code blocks: dual-theme via `rehype-pretty-code` (`themes: { light:
  "github-light", dark: "tokyo-night" }`); output emits CSS variables
  flipped by the dark class.
- Images / diagrams (none currently, but plan for it): if an image has a
  `light` and `dark` variant, render the appropriate one via Tailwind
  variants; otherwise wrap in a thin `bg-card` frame.

## 12. Future extension points (for layer C)

Design B so that adding C is **additive**, not a rewrite. Extension points:

1. **Custom blocks in markdown.** Use a remark transform to recognize
   directive-style fences (`:::scaling-laws-explorer params="..."`) and
   compile them into placeholder nodes that the runtime renders as React
   components. In B, this transform is a no-op (no directives are used).
   In C, registering a component name per directive lights up an
   interactive widget without touching the markdown source.
2. **Interactive component registry.** A `web/src/components/widgets/`
   folder (empty in B) keyed by directive name (`ScalingLawsExplorer`,
   `LossCurveAnnotated`, `RewardLandscape`). The renderer in
   `RenderedMarkdown` looks up the registry on encountering placeholder
   nodes.
3. **Per-page metadata block.** Front-matter parsing (YAML at top of
   `.md`) is supported in the build plugin and stored on the manifest.
   In B, no front-matter is required (existing files have none); in C,
   pages can declare which interactive companions to show in the
   RightSidebar (e.g., "this page has a scaling-laws explorer").
4. **Comparative-table editor.** The orientation page already renders a
   GFM table. In C, replace the static table with an editable component
   backed by localStorage that reads/writes the markdown source via a
   small dev-only API (or only writes to localStorage if read-only is
   preferred). Component slot is reserved at `OrientationPage.tsx`.
5. **Right-sidebar widget slot.** The RightSidebar already renders a TOC
   and is sized to host other widgets. C adds widgets here without a
   layout change.
6. **Pagefind upgrade.** Search abstracts behind `useSearch`. Swap
   MiniSearch for Pagefind without touching consumers.
7. **Optional API surface.** No backend in B. A `web/src/lib/api.ts`
   module is reserved (empty exports). When/if a tiny API is added (e.g.,
   to fetch live arXiv abstracts), `react-query` becomes the consumer.

## 13. Out of scope

- No interactive visualizations (Option C): no scaling-law explorer, no
  attention head viz, no reward landscape, no playgrounds.
- No write-back to `.md` files from the UI. Reading-list checkboxes in
  the source markdown remain `[ ]` forever; runtime state is localStorage.
- No multi-user support, sync, or auth. localStorage is per-browser-
  per-machine. Acceptable per project context (personal repo).
- No mobile-first design. Responsive down to ~768px is required;
  below that we collapse the sidebar to a Sheet, but reading on a phone
  is not a target use case.
- No live arXiv/citation fetching. Reading-list items are static text +
  links from the markdown.
- No analytics, telemetry, or external network calls beyond clicking
  reading-list links to external papers.
- No SSR / SSG framework. Static SPA via Vite. (We considered Next/Remix
  and rejected as overkill.)
- No image-heavy galleries / video. The repo is text-first.
- No content authoring UI. Editing happens in the user's editor.
- No print stylesheet. Optional later.
- No i18n.

## 14. Open decisions you (the user) might want to revisit

These are defaults I picked. Listed in rough order of "most likely to push
back."

1. **Pre-rendered HTML at build time vs runtime markdown rendering.** I
   picked build-time HTML chunks for performance and bundle size, at the
   cost of a slightly more complex Vite plugin and a generated/ folder
   under git ignore. If you want the simplest possible setup ("just ship
   the markdown and parse it client-side with `marked`"), we lose syntax
   highlighting fidelity and add ~150kb to the bundle but reduce build-
   pipeline complexity by ~60%. I think build-time wins, but it's the
   biggest infra choice and worth a check.

2. **Separate `/reading` flat view as a top-level route.** This is
   useful but slightly redundant with topic pages. You may prefer it as
   a tab on the dashboard instead of a separate page. I left it
   separate because the user's stated workflow is "what should I read
   next" which deserves its own URL.

3. **Font choice: Inter / Inter / JetBrains Mono.** Safe, well-loved, but
   "calm and impersonal" is exactly the criticism. Alternatives that
   keep the technical feel: **Geist** (single family for sans+mono,
   modern), **iA Writer Quattro** (warmer, more editorial), or
   **Söhne** if you want something Anthropic-coded. Inter is the
   default-default; Geist would be my second pick.

4. **Single accent color (slate-blue).** I picked one accent
   (`oklch(0.55 0.13 240)`) intentionally to keep things calm. If you
   want each topic to carry an identity color (one accent per topic
   number, hue-shifted), that is supportable but pushes toward
   "marketing site" feel. I would not do it; you might want a single
   subtle topic stripe color for navigation cues, which is a smaller
   change.

5. **Tab-based topic page vs single long scroll.** I picked tabs
   (`Overview / Reading list / Synthesis / Open questions / Code`)
   because topics with 17 reading items + synthesis get long and
   navigation between sections is a real cost. Alternative: single
   scrolled page with the right-sidebar TOC handling jumps. The pure-
   prose alternative is more "documentation-honest" and lets users
   skim more naturally; I am 60/40 in favor of tabs but easy to flip.

6. **No per-item annotation / notes UI.** Reading-list items are
   read/unread booleans. We could add a tiny text field per item
   ("my one-line takeaway") that persists to localStorage. Useful but
   risks duplicating what synthesis sections are for. I left it out;
   the user will probably want it within a month.

7. **No PDF / paper viewer.** Reading-list links open in a new tab to
   the external source (arXiv, etc.). The `papers/` folder is
   gitignored and local. We could light up a route that lists local
   PDFs and opens them with a `<embed>` viewer; rejected for B as
   scope creep, but trivial to add (a directory scan in the build
   plugin).

8. **Reset semantics on reading-list title rename.** Stable ids are
   `sha1(slug + normalized title)`. Renaming a title in markdown
   resets that item's check. The alternative is content-based ids that
   match on link URL — more stable, but breaks when an item has no
   external link. I picked title-based. If this bites once, switch
   to URL-when-present-else-title.

9. **Self-hosted fonts via `@fontsource-variable/*` rather than Google
   Fonts CDN.** Trade-off: tiny bit larger build, much better offline
   dev. Fits "local-first" better. Easy to revert.

10. **Vite plugin location: `web/scripts/build-content.ts`.** Could
    instead be a separate published-locally Node package or live in
    the repo root. I kept it inside `web/` to avoid leaking
    JS/Node tooling into a Python-leaning repo root. If you want
    `notes/` and `projects/` to be authored by other tools too, the
    plugin could live at the repo root.

## 15. File layout (`web/`)

```
web/
├── index.html
├── package.json
├── vite.config.ts                       # plugin invocation, alias @
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── postcss.config.js
├── components.json                      # shadcn config
├── public/
│   └── favicon.svg
├── scripts/
│   └── build-content.ts                 # markdown → manifest + HTML
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx
│   ├── styles/
│   │   ├── globals.css                  # tokens + tailwind layers
│   │   └── prose.css                    # @tailwindcss/typography overrides
│   ├── components/
│   │   ├── ui/                          # shadcn primitives
│   │   ├── layout/
│   │   ├── content/
│   │   ├── progress/
│   │   ├── search/
│   │   └── widgets/                     # empty in B; reserved for C
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── generated/                       # gitignored
│       ├── manifest.json
│       └── content/
│           ├── notes-00-foundations.html
│           ├── ...
│           ├── projects-01-pretrain-end-to-end.html
│           └── root-readme.html
└── README.md                            # how to dev / build / deploy
```

`.gitignore` additions at repo root:

```
# Web app
web/node_modules/
web/dist/
web/src/generated/
```

## 16. Build sequence (for the implementer)

A phased checklist the `frontend-design` subagent can execute. Each phase
is a discrete, verifiable chunk; do not interleave.

### Phase 1 — Project skeleton

- [ ] `npm create vite@latest web -- --template react-ts` (run from repo
      root; this creates `web/`).
- [ ] Install dependencies:
      `react-router-dom framer-motion lucide-react clsx tailwind-merge
      class-variance-authority sonner @fontsource-variable/inter
      @fontsource-variable/jetbrains-mono minisearch zod`.
- [ ] Install Tailwind v4 + plugin:
      `tailwindcss @tailwindcss/vite @tailwindcss/typography`.
- [ ] Install dev deps:
      `unified remark-parse remark-gfm remark-rehype rehype-slug
      rehype-autolink-headings rehype-pretty-code rehype-stringify
      shiki gray-matter chokidar fast-glob @types/node`.
- [ ] `npx shadcn@latest init` (Slate base, CSS variables yes).
- [ ] Install shadcn primitives listed in §4.
- [ ] Configure path alias `@ → src`.
- [ ] Set up `tsconfig.json` strict mode.

### Phase 2 — Design tokens + styles

- [ ] Author `src/styles/globals.css` with the oklch tokens from §7
      and `dark` class strategy.
- [ ] Configure Tailwind theme to map tokens.
- [ ] Wire `@tailwindcss/typography`; create `prose.css` overrides.
- [ ] Import Inter + JetBrains Mono variable fonts in `main.tsx`.
- [ ] Add `useTheme` hook + topbar toggle; verify light/dark switch.

### Phase 3 — Content pipeline

- [ ] Implement `web/scripts/build-content.ts` per §3.
- [ ] Wire as a Vite plugin: run on `buildStart`, watch `../notes`
      and `../projects` in dev.
- [ ] Define TypeScript types for the manifest in
      `src/lib/manifest.ts` and write a typed loader.
- [ ] Generate manifest + HTML chunks; verify both checked into
      `.gitignore` and excluded from build inputs.
- [ ] Sanity-check rendered HTML for one note + the orientation page +
      one project + the root README.

### Phase 4 — App shell + routing

- [ ] Implement `AppShell`, `Sidebar`, `Topbar`, `RightSidebar`,
      `PageContainer`.
- [ ] Define routes in `App.tsx`.
- [ ] Add `NotFoundPage`, breadcrumbs, sticky topbar.
- [ ] framer-motion `AnimatePresence` for page transitions.
- [ ] Implement scroll-restoration on route change.

### Phase 5 — Content rendering

- [ ] Implement `RenderedMarkdown` (HTML chunk loader, anchor
      rewriter, sanitizer pass).
- [ ] Implement `Toc` + scroll-spy.
- [ ] Implement `ReadingList` + `ReadingListItem` with localStorage
      via `useReadingProgress`.
- [ ] Implement progress derivation in `lib/progress.ts`.

### Phase 6 — Pages

- [ ] `DashboardPage` (RoadmapStrip, ActivityCard, RecentEdits, totals).
- [ ] `NotesIndexPage` + `TopicProgressCard`.
- [ ] `TopicPage` with tabs (overview / reading / synthesis / open
      questions / code).
- [ ] `OrientationPage` with banner + checklist.
- [ ] `ProjectsIndexPage` + `ProjectPage`.
- [ ] `ReadingListPage` (flat, filterable).
- [ ] `AboutPage` with settings panel (theme, reset, export/import).

### Phase 7 — Search + cmd-k

- [ ] Build MiniSearch index in `lib/search-index.ts`.
- [ ] `SearchInput`, `SearchResults`, `SearchPage`.
- [ ] `CommandMenu` (cmd-k).

### Phase 8 — Polish

- [ ] Empty / loading states for every list and page.
- [ ] Focus rings audit on every interactive element.
- [ ] Skip-link "skip to content" for keyboard accessibility.
- [ ] Dark/light parity audit (no hardcoded colors).
- [ ] Print-suppression of nav (cheap; hide via `print:hidden`).
- [ ] Lighthouse pass on dev build (aim a11y ≥ 95).

### Phase 9 — Deploy story

- [ ] `npm run build` produces `web/dist/`.
- [ ] Add `web/README.md` with `npm run dev`, `npm run build`,
      Vercel/Netlify static-site deploy notes.

## 17. Critical details

### Error handling

- Manifest read failure → fatal at build time (CI fails); at runtime,
  error boundary surfaces "content failed to load, see console" with
  a retry. Cannot really recover from a missing manifest.
- HTML chunk fetch failure (lazy import) → error boundary at the page
  level; show "page failed to load" with a link back to dashboard.
- Reading-list parse failure for one item → log a warning at build
  time; render the item as a plain text row with no checkbox, so the
  page still works.
- localStorage quota / corruption → `storage` module catches `JSON.parse`
  errors, logs a warning, resets the key to default; toasts "progress
  reset" via `sonner`.

### Performance

- Manifest is < 100kb gzipped; eagerly imported.
- Per-page HTML chunks lazy-loaded via `import.meta.glob`; each chunk
  ~5–30kb gzipped.
- MiniSearch index built once at boot; rebuild not needed at runtime.
- No `useLayoutEffect` for non-DOM-measurement work.
- Code-split by route (Vite default with React Router data routers).

### Testing

- Unit: `vitest` for `lib/progress.ts`, `lib/storage.ts`,
  `scripts/build-content.ts` (happy + malformed input cases).
- Component: `vitest` + `@testing-library/react` for
  `ReadingList`, `Toc`, `RenderedMarkdown`. Smoke-test each page
  renders without crashing given the real manifest.
- Snapshot: one snapshot of generated manifest shape (not values) to
  catch schema drift.
- E2E: not required for B. If added later, Playwright with one
  scenario: tick a checkbox → reload → still ticked.

### Security

- Repo content is the user's own; the only XSS surface is markdown body.
  Even so, run rendered HTML through a `rehype-sanitize` pass at build
  time with a strict allowlist (no `<script>`, no `<iframe>`). External
  links open with `rel="noopener noreferrer" target="_blank"`.
- No external network calls at runtime except clicking external links.
- localStorage holds no secrets.
- CSP not enforced (static site, single-origin, no embedded third
  parties).

### Accessibility

- Color contrast: tokens chosen to meet WCAG AA at minimum on body and
  AAA on heading vs background. Verified during phase 8.
- Keyboard nav: tab order matches visual order; cmd-k accessible.
- Screen-reader: semantic HTML from prose styling; skip-link;
  `aria-current="page"` on active nav.
- Reduced motion: respect `prefers-reduced-motion`; replace stagger
  + transitions with instant.

## 18. Success criteria

- The user can `cd web && npm run dev`, hit `localhost:5173`, and
  immediately see the dashboard reflecting current progress.
- Editing any `.md` file in `notes/` or `projects/` triggers a hot
  reload and updates the rendered page within ~1s.
- Ticking a reading-list item updates the topic progress meter
  without a refresh and survives reload.
- Search finds any topic, project, or reading item by title within
  100ms.
- Lighthouse a11y score ≥ 95 on the dashboard and a topic page.
- The user describes the look as "thoughtful, technical, calm" or
  similar — not "marketing site."

## 19. Non-goals reminder (for the implementer)

Do not introduce: a backend, a database, MDX, server-side rendering,
authentication, analytics, or interactive visualizations. Do not edit
files outside `web/` and `.gitignore` (and the new spec file
location). The markdown content is read-only.

## 20. Next step

After review, implementer dispatch via `frontend-design` subagent against
this spec. The implementer should treat this spec as the source of truth
and ask before deviating on any §14 decision.
