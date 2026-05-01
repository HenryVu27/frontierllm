# frontierllm — Web Reader

A content-focused web reader for the `frontierllm` learning repository. It turns
the markdown in `notes/` and `projects/` into a navigable, trackable study surface:
browse seven topics and three projects, read rendered content with proper typography
and syntax-highlighted code, tick off reading-list checkboxes with per-topic progress
meters, and search across all titles and headings with a cmd-k palette. This is a
personal tool — localhost-first, no backend, no auth; if deployed it is intended to
remain private.

---

## Quick start

```bash
cd web
npm install
npm run dev
```

Opens at **http://localhost:5173**. The content pipeline runs automatically on
startup and again whenever you save a file in `notes/` or `projects/`.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR. The content pipeline (markdown → manifest + HTML) runs on startup and re-runs on any `notes/` or `projects/` file change (~150 ms debounce). |
| `npm run build` | Type-check (`tsc -b`) then produce an optimized production build in `dist/`. The content pipeline runs as part of the build. |
| `npm run preview` | Static-serve the production `dist/` at **http://localhost:4173**. Run `npm run build` first. |
| `npm run lint` | Run ESLint across all source files. |
| `npm run typecheck` | Run `tsc --noEmit` for a quick type-check without emitting output. Useful in pre-commit checks. |

---

## Editing content

The source of truth for all content is the markdown in the **repo root**, not inside
`web/`:

- Topic notes: `notes/<slug>/README.md` (plus supplementary `.md` files)
- Projects: `projects/<slug>/README.md`
- About page: root `README.md`

Edit those files in your editor as usual. In `npm run dev` mode, saving any markdown
file triggers a full-reload within ~1 second (chokidar watcher + Vite HMR).

**Reading-list checkbox state** is stored in `localStorage` under the key
`frontierllm:reading-progress:v1`. It does **not** write back to the markdown source.
Checkboxes in the `.md` files are always `[ ]`; runtime progress lives in the browser
only. This is by design — the repo is read-only from the UI's perspective.

Progress is keyed by a stable id derived from `sha1(topicSlug + ":" + normalized title)`
truncated to 12 characters. Renaming a reading-list title in markdown resets that
item's check (the id changes). Renaming is infrequent enough that this is an acceptable
trade-off for a personal tool.

---

## Architecture overview

Full design spec: [`docs/superpowers/specs/2026-04-26-web-ui-design.md`](../docs/superpowers/specs/2026-04-26-web-ui-design.md)

### Build-time content pipeline

A custom Vite plugin (`scripts/build-content.ts`) runs on every `buildStart` and on
file changes in dev mode. It walks `notes/` and `projects/`, processes each `.md` with
`unified` → `remark-parse` → `remark-gfm` → `remark-rehype` → `rehype-slug` →
`rehype-autolink-headings` → `rehype-pretty-code` → `rehype-stringify`, and emits two
artifacts into `src/generated/`:

- **`src/generated/manifest.json`** — eagerly imported. Contains all topics and
  projects with slugs, titles, headings (h1–h3 with anchor ids), reading-list entries
  parsed from `## Reading list` sections, word counts, and last-modified timestamps.
  Powers the dashboard, navigation, search index, and progress meters.

- **`src/generated/content/<slug>.html`** — one pre-rendered HTML file per source
  `.md`. Imported lazily via `import.meta.glob({ as: 'raw' })` so each route chunk
  stays small. Syntax highlighting uses `rehype-pretty-code` with dual themes
  (`one-light` / `vesper`) that flip with the dark-mode class.

`src/generated/` is **gitignored** — it is a build artifact. Pull new content and
run `npm run build` (or `npm run dev`) to regenerate it. The first `npm run dev` after
a fresh clone will produce it automatically.

### State model

- **URL search params** — bookmarkable filter and tab state (e.g., `?status=unread`,
  `?tab=reading`).
- **localStorage** — reading-list progress, theme preference, UI preferences, recent
  pages visited. Schema-versioned; corrupt/missing keys reset silently.
- **No global store** — no Zustand, no Redux. Component state + `useSyncExternalStore`
  for the reading-progress hook is sufficient.

---

## Tech stack

| Layer | Technology |
|---|---|
| Build tool | Vite 8 |
| UI framework | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Component library | shadcn/ui (Radix UI primitives) |
| Animation | framer-motion |
| Routing | react-router-dom v7 |
| Search | MiniSearch (in-memory, manifest-only) |
| Fonts | Cormorant Garamond (serif, via `@fontsource`); system-ui (sans); system mono stack |
| Design tokens | oklch CSS custom properties — warm parchment light mode, warm dark-brown dark mode |
| Icons | lucide-react |
| Notifications | sonner |

Default theme is **dark**. Theme toggle in the topbar switches between dark / light /
system.

---

## Deploy

### Local-only (primary use case)

```bash
# Live editing — content pipeline runs on file change
npm run dev

# Production preview — full build then static serve
npm run build && npm run preview
```

This is all you need for day-to-day use.

### Static host (Vercel / Netlify / Cloudflare Pages)

Point the host at `web/` as the project root:

| Setting | Value |
|---|---|
| Root directory | `web` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | none required |

The host must support **SPA fallback** (rewrite all paths to `index.html`). Both
Vercel and Netlify do this automatically for static deployments. Cloudflare Pages
requires a `_redirects` file in `public/`:

```
/*  /index.html  200
```

No environment variables are needed — the app is fully static with no backend calls.

### GitHub Pages

GitHub Pages can host the static build but has two gotchas:

1. **Base path.** If the repo is not at the domain root (e.g., it lives at
   `username.github.io/frontierllm/`), add a `base` option to `vite.config.ts`:
   ```ts
   base: '/frontierllm/',
   ```
   Without this, asset paths break.

2. **SPA fallback.** GitHub Pages does not natively support SPA-style routing. A
   common workaround: copy `dist/index.html` to `dist/404.html` after the build so
   deep links fall through to the React app. Add to your deploy workflow:
   ```bash
   cp dist/index.html dist/404.html
   ```

If you do not want to manage these quirks, **Vercel or Netlify are easier** — one
click, no config, SPA fallback is automatic.

---

## Folder layout

```
web/
├── index.html
├── package.json
├── vite.config.ts              # Vite config + content-pipeline plugin invocation
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── components.json             # shadcn/ui config
├── eslint.config.js
├── public/
│   └── favicon.svg
├── scripts/
│   └── build-content.ts        # markdown → manifest.json + per-file HTML chunks
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx
│   ├── styles/
│   │   ├── globals.css         # oklch design tokens + Tailwind layers
│   │   └── prose.css           # @tailwindcss/typography overrides
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (Button, Card, etc.)
│   │   ├── layout/             # AppShell, Sidebar, Topbar, RightSidebar, PageContainer
│   │   ├── content/            # RenderedMarkdown, ReadingList, ReadingListItem, Toc
│   │   ├── progress/           # ProgressBar, TopicProgressCard, RoadmapStrip, ActivityCard
│   │   ├── search/             # SearchInput, SearchResults, CommandMenu
│   │   └── widgets/            # empty — reserved for Option C interactive widgets
│   ├── pages/                  # DashboardPage, NotesIndexPage, TopicPage, …
│   ├── hooks/                  # useReadingProgress, useTopic, useSearch, useTheme, …
│   ├── lib/                    # manifest.ts, progress.ts, storage.ts, search-index.ts, cn.ts
│   └── generated/              # gitignored — produced by the content pipeline
│       ├── manifest.json
│       └── content/
│           ├── 00-foundations.html
│           ├── 01-pretraining.html
│           ├── …
│           └── root.html
└── README.md
```

---

## Troubleshooting

**"manifest not found" / blank dashboard after cloning**
The `src/generated/` directory is gitignored and not committed. Run `npm run dev` or
`npm run build` once to generate it. The content pipeline runs automatically on startup.

**Reading-list progress disappeared**
localStorage is per-browser-per-machine with no sync — by design for a personal local
tool. If you cleared browser storage or switched browsers, progress resets. Use
"Export progress as JSON" on the About page (bottom settings panel) before clearing
storage, and "Import" to restore it.

**Syntax highlighting looks wrong after updating notes**
The HTML chunks in `src/generated/content/` are stale. Stop the dev server, run
`npm run build`, then restart with `npm run dev`. The content pipeline regenerates
all chunks on startup.

**Build warnings about "Could not parse bold title"**
The reading-list parser expects items formatted as `- [ ] **Title** — gloss (meta)`.
Items using inline code (`` `name` ``) as the leading token are rendered as plain-text
rows with no checkbox — they still appear in the reading list, just without interactive
check state. This is a known trade-off. See `scripts/build-content.ts` for the parser
logic.

---

## Success criteria checklist

From spec §18:

- [x] `cd web && npm run dev` → `localhost:5173` opens immediately showing the
      dashboard with current progress reflected from the markdown files.
- [x] Editing any `.md` file in `notes/` or `projects/` triggers a hot reload and
      updates the rendered page within ~1 s (chokidar watcher + Vite HMR).
- [x] Ticking a reading-list item updates the topic progress meter without a refresh
      and survives page reload (localStorage persistence confirmed).
- [x] Search finds any topic, project, or reading item by title within 100 ms
      (MiniSearch in-memory index, built at boot from the manifest).
- [ ] Lighthouse a11y score ≥ 95 on the dashboard and a topic page — *not formally
      verified in this phase; Phase 8 polish pass covered focus rings, skip-link,
      aria-current, and reduced-motion; formal Lighthouse run pending.*
- [x] The design reads as "thoughtful, technical, calm": Cormorant Garamond serif,
      warm oklch palette, minimal motion, editorial prose layout — not a marketing site.
