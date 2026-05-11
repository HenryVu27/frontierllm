# Design — frontierllm prerequisites textbook module

**Date:** 2026-05-10
**Author:** Henry (with Claude as drafting agent)
**Status:** Draft, pending review

---

## 1 — Motivation

The frontierllm repo today ships as a curated reading list. Each `notes/<topic>/README.md`
points the reader to ten or twenty external papers and blog posts and asks them to
synthesise the material themselves. The web reader (`web/`) is excellent at rendering
those reading lists, tracking checkbox progress, and providing search, but the
*taught content* — the synthesis — is empty in every topic.

The repo needs the synthesis layer. The first delivery is the **prerequisites
module**: a self-contained textbook chapter that teaches the foundational math and
engineering knowledge every later topic assumes. After this module a reader should
not need to leave the site to understand what a transformer block is, what an
optimiser does, what RoPE is, why frontier models use RMSNorm not LayerNorm, or how
MoE routing works.

The reference for style is the sibling repo at `C:\Personal\greek`, which is a
textbook-grade MDX study guide on options market microstructure. Greek's MDX
components (`<Callout>`, `<Sidenote>`, `<Sources>`, comparison tables), KaTeX math
rendering, and dense synthesised prose are the bar. The voice differs — see §6.

## 2 — Scope

### In scope

- A new MDX-driven content path at `web/content/textbook/` rendered by a new
  `/textbook/<slug>` route in the React app.
- Eight chapter MDX files plus a landing page covering the prerequisites topic
  clusters (see §4).
- MDX pipeline integration into the existing Vite build (MDX parser, KaTeX,
  `rehype-pretty-code`, frontmatter loader, TOC extractor).
- Six MDX components ported and adapted from greek (see §5).
- A research-then-write parallel agent dispatch plan that synthesises current SOTA
  as of May 2026 from primary sources into the chapters (see §8).
- Search-index integration so chapter content is reachable from cmd-K.

### Out of scope (this delivery)

- The other seven topic areas (pretraining, post-training, RLHF, distributed
  training, eval, alignment & interp, frontier labs). These get their own design
  later; this delivery sets the pattern.
- Replacing the existing `notes/<topic>/README.md` reading lists. They stay as the
  curated bibliography layer; the new textbook content is additive.
- Live or interactive widgets that need backend data (loss curves with real
  training runs, etc.). Charts that ship in this module are parametric
  illustrations, like greek's.
- Authentication, comments, multi-user features. The site stays a personal local-
  first reader.

### Explicitly not changing

- The existing markdown pipeline (`scripts/build-content.ts`) keeps working
  unchanged for `notes/` and `projects/` content. We add MDX as a *second* content
  path, not a replacement.
- The existing `TopicPage` route and its tabs (Overview / Reading list /
  Synthesis / Open questions / Code).
- The existing design tokens, fonts, and prose CSS. Textbook content reads in the
  same visual register as the rest of the site.

## 3 — Architecture

### File layout

```
frontierllm/
├── web/
│   ├── content/
│   │   └── textbook/
│   │       ├── 00-prerequisites.mdx        # landing page, dependency chain
│   │       ├── 00a-transformer.mdx
│   │       ├── 00b-attention-variants.mdx
│   │       ├── 00c-positional-encodings.mdx
│   │       ├── 00d-normalization-and-init.mdx
│   │       ├── 00e-activations-and-gating.mdx
│   │       ├── 00f-optimizers.mdx
│   │       ├── 00g-tokenization-and-objectives.mdx
│   │       └── 00h-moe-plumbing.mdx
│   ├── src/
│   │   ├── components/
│   │   │   └── mdx/                        # NEW — ported from greek
│   │   │       ├── Callout.tsx
│   │   │       ├── Sidenote.tsx
│   │   │       ├── Sources.tsx
│   │   │       ├── ComparisonTable.tsx
│   │   │       ├── MdxComponents.tsx       # provider that wires all of them
│   │   │       └── charts/                 # parametric SVG charts (per chapter)
│   │   ├── lib/
│   │   │   ├── textbook.ts                 # NEW — MDX loader, TOC, prev/next
│   │   │   └── search-index.ts             # extend to include MDX chapters
│   │   └── pages/
│   │       ├── TextbookIndexPage.tsx       # NEW — /textbook
│   │       └── TextbookChapterPage.tsx     # NEW — /textbook/:slug
│   ├── scripts/
│   │   └── build-textbook.ts               # NEW — MDX → manifest + search records
│   └── vite.config.ts                       # add @mdx-js/rollup, remark-math,
│                                            #   rehype-katex, frontmatter loader
└── docs/superpowers/specs/
    └── 2026-05-10-frontierllm-prereqs-textbook-design.md   # this file
```

### MDX rendering pipeline

The existing `scripts/build-content.ts` walks markdown to HTML at build time and
emits one HTML chunk per source file. For MDX we use a different approach: the
chapters are imported *as React components* via `@mdx-js/rollup`, evaluated at
build time, and rendered through the standard React tree. This is how greek does
it (Next.js App Router gives this for free; we're recreating it on top of Vite).

Steps:

1. **`vite.config.ts`** — register `@mdx-js/rollup` with these plugins:
   - `remark-frontmatter` + `remark-mdx-frontmatter` → exports frontmatter as a
     named `frontmatter` export from every MDX file
   - `remark-gfm` → tables, task lists
   - `remark-math` → math syntax
   - `rehype-katex` → math rendering
   - `rehype-slug` + `rehype-autolink-headings` → anchored headings
   - `rehype-pretty-code` → code highlighting (reuse existing dual themes)
2. **`web/src/lib/textbook.ts`** — uses `import.meta.glob('/content/textbook/*.mdx', { eager: true })`
   to load all chapters; exports a typed manifest keyed by slug with `{ slug,
   title, description, order, frontmatter, default: ReactComponent, headings }`.
3. **`MdxComponents.tsx`** — wraps the rendered tree in an `MDXProvider` that
   injects `Callout`, `Sidenote`, `Sources`, `ComparisonTable`, and the chart
   components into the MDX scope so chapters can use them without imports.
4. **`build-textbook.ts`** — a small Node script run during `npm run build` that
   extracts plain-text content from each MDX (stripping JSX) and appends records
   to the search index so chapters are searchable.

### Routing

Two new routes added to `routes.tsx`:

| Route | Component | Purpose |
|---|---|---|
| `/textbook` | `TextbookIndexPage` | Module landing: chapter cards, reading order, dependency chain |
| `/textbook/:slug` | `TextbookChapterPage` | One chapter, with TOC sidebar and prev/next |

`TextbookChapterPage` renders the chapter's `default` export (the MDX content),
plus the existing right-sidebar TOC component (`Toc.tsx`) populated from the
chapter's headings.

Cross-references between chapters use ordinary markdown links:
`[transformer block](/textbook/00a-transformer#mlp-block)`.

### Frontmatter schema

Every chapter MDX has YAML frontmatter:

```yaml
---
slug: 00a-transformer                # URL: /textbook/00a-transformer
title: The transformer block
description: One-line description used in cards and search.
order: 1                              # ordering in landing and prev/next
chapter: 1                            # chapter number shown in header
reading_minutes: 28                   # estimate
depends_on: []                        # slugs of prerequisite chapters
provides: [residual-stream, attention-math, mlp-block]
last_reviewed: 2026-05-10             # date currency was last verified
---
```

The `provides` / `depends_on` keys power a small dependency-graph visualisation on
the landing page and let later phases (other modules) cite "this chapter
introduces X".

### Relationship to existing notes/

The existing `notes/00-foundations/README.md` reading list stays. Its tab order
(Overview / Reading list / Synthesis / Open questions / Code) is unchanged. We add
a new top-of-page banner on `notes/00-foundations` (and only on that one for this
delivery) that links into `/textbook/00-prerequisites`:

> **Looking for the taught material?** The prerequisites textbook chapters live
> at `/textbook/00-prerequisites`. The reading list below is the curated
> bibliography behind those chapters.

The textbook chapters cite the reading list in their `<Sources>` blocks, closing
the loop in the other direction.

## 4 — Chapter list

Nine MDX files. Word-count estimates are targets, not contracts.

### `00-prerequisites.mdx` — Landing (orientation)

~3-5k words. The "how to read this module" page, modelled on greek's
`00-intro.mdx`. Covers:

- What the module is and what it isn't (it teaches the math + arch foundations;
  it isn't a primer on Python, PyTorch, or undergraduate ML).
- Prerequisites for *this module* (assumes calculus, linear algebra, basic
  probability, and that you've trained a small neural net before).
- Dependency chain across the eight chapters, with reading-order recommendations
  for three reader profiles (deep refresher, calibration check, first time).
- Notation conventions, sign conventions, what notation choices the module makes
  where there's no industry consensus.
- A "what success looks like" closer — six concrete skills you should have after
  finishing the module.

### `00a-transformer.mdx` — The transformer block

~6-8k words. The canonical block. Covers:

- The residual stream framing (Elhage et al's mental model — most useful one).
- Attention as kernel: queries, keys, values, the softmax, scaled-dot-product.
  Worked numerical example end-to-end.
- The MLP block (later expanded in `00e` for gating).
- How blocks stack: pre-norm vs post-norm, why frontier labs converged on
  pre-norm; norm placement variants in 2026 (peri-norm, sandwich norm,
  Norm-Former-style).
- Compute and memory accounting for one block — FLOPs per token, KV cache
  per token, activation memory.
- Where modern frontier blocks diverge from the 2017 baseline: GQA/MLA, RoPE,
  SwiGLU, RMSNorm — pointers forward to the chapters that cover each.

### `00b-attention-variants.mdx` — Attention shapes & FlashAttention

~5-7k words. The attention zoo. Covers:

- MHA → MQA → GQA → MLA progression. The math of each, the parameter and KV-cache
  arithmetic, the quality/efficiency tradeoff. Comparison table across the four.
- Sliding-window attention (Mistral) and how it interacts with KV caching.
- The FlashAttention math at the level of "why is it equivalent and faster" —
  the online softmax recurrence and IO-aware tiling. Not a kernel walkthrough
  (that lives in tiny-llm and InferenceEngineering); the conceptual story.
- Linear / sub-quadratic alternatives (Mamba/SSM, RWKV, Hyena) in a brief comparison
  section; primary focus stays on softmax attention because that is what frontier
  models still ship in 2026 (with hybrid SSM-attention exceptions noted).
- Cross-references to `00c` (RoPE interaction with attention) and `00d` (QK-norm).

### `00c-positional-encodings.mdx` — Positional encodings

~5-7k words. Covers:

- Why position matters (attention is permutation-equivariant without it).
- Absolute encodings: sinusoidal (original transformer), learned absolute.
- Relative encodings: T5 buckets, ALiBi.
- Rotary (RoPE): the rotation math, why it works as relative encoding, how it
  interacts with attention scores, the base-frequency choice and what it controls.
- Context-extension methods: position interpolation (PI), NTK-aware scaling, YaRN,
  LongRoPE — what each one rescales and what the quality cost looks like.
- A "what frontier labs ship in 2026" comparison table.
- Worked example: rotate a 4-d query/key pair through RoPE end-to-end so the
  reader has a concrete picture, not just a formula.

### `00d-normalization-and-init.mdx` — Normalisation & initialisation

~4-6k words. Covers:

- LayerNorm vs RMSNorm: the math, what each one subtracts/divides, why RMSNorm
  won (compute + stability), and the empirical evidence for the "removing the
  mean did nothing" claim.
- Pre-norm vs post-norm: training dynamics, gradient flow, why pre-norm is
  default but post-norm has a small revival in some 2024-2025 hybrid recipes.
- QK-norm: the specific stability problem it solves (attention-logit blowup
  at scale), what frontier labs put it in for, what it does and doesn't fix.
- Initialisation: standard small-variance init, depth-scaled / Wang et al's
  $2/L$-scaled output projection, fan-in scaling, embedding init.
- μP and hyperparameter transfer: the mechanism (preserve update RMS as width
  scales), what `mup-transfer` actually buys you, how to use it in practice
  (sweep small, run large).
- The set of normalisation choices in current frontier models (Llama-3, DeepSeek-V3,
  Claude / GPT family per published reports) in a comparison table.

### `00e-activations-and-gating.mdx` — Activations & gating

~3-5k words. Covers:

- The activation history: ReLU → GELU → SiLU/Swish. The numerical shape of each,
  the gradient at zero, what motivated each move.
- Gated linear units: the GLU family. The math of GLU, then SwiGLU, GeGLU, ReGLU.
  Why gating helps (capacity argument + the empirical PaLM-era ablations).
- The 2/3 width adjustment: why SwiGLU blocks use $\tfrac{2}{3} \cdot d_{ff}$ to
  match parameter count with a plain MLP. The arithmetic.
- What current frontier models use (almost all SwiGLU) and the few outliers and
  why.

### `00f-optimizers.mdx` — Optimisers

~5-7k words. Covers:

- SGD, momentum, Nesterov — the floor.
- Adaptive methods: Adam, AdamW. The math of the moment estimates, what each
  hyperparameter ($\beta_1$, $\beta_2$, $\epsilon$, weight decay) controls. Why
  AdamW (decoupled weight decay) replaced Adam-with-L2.
- Lion: sign-of-momentum update, the practical compute / memory savings, the
  hyperparameter shifts vs AdamW.
- Muon: the orthogonalising-update story (Newton-Schulz iteration), where it
  helps, the 2024-2026 trajectory of Muon adoption.
- Shampoo / SOAP: the second-moment matrix view, where the compute cost lives,
  why frontier labs are or aren't shipping it.
- Learning-rate schedules: warmup → cosine, WSD (warmup-stable-decay), the recent
  "infinite LR" / continual-pretrain schedule revival.
- Gradient clipping: per-param vs global, the SIO (spike of interest) literature.
- A comparison table of current frontier-lab optimiser choices with sources.

### `00g-tokenization-and-objectives.mdx` — Tokenisation, embeddings, training objectives

~4-6k words. Covers:

- BPE (Sennrich), byte-level BPE (GPT-2), SentencePiece (unigram LM), tiktoken
  practicalities. The shape of the merges, the vocab-size tradeoff.
- The "is your tokeniser broken" failure modes: glitch tokens, untrained tokens,
  encoding inconsistencies, the SolidGoldMagikarp class of issues.
- Tied vs untied embeddings, the parameter saving, the rare cases untied wins.
- Embedding norm growth at scale and the QK-norm / embedding-LayerNorm fixes.
- Training objectives: causal LM, masked LM (legacy), prefix LM, fill-in-the-middle
  (FIM) for code, multi-token prediction (DeepSeek-V3's two-token head and the
  generalisation in 2025-2026 papers).
- Label smoothing: the math, why most frontier pretraining stopped using it.
- A short note on what "loss" means at scale (per-token CE in nats, what the
  level numbers actually mean in 2026 calibration).

### `00h-moe-plumbing.mdx` — Mixture-of-experts

~4-6k words. Covers:

- Why MoE (compute decoupled from capacity): the FLOPs-per-token vs
  parameter-count argument.
- Routing: top-k gating, expert choice routing, soft routing — the math of each,
  the load-balancing and capacity-factor problems each one solves or doesn't.
- Auxiliary losses: load-balance loss, z-loss, router z-loss. What each one
  prevents. The numerical sizing of these terms in practice.
- Capacity factor: what it is, why it matters at training (drop tokens vs pad),
  why it matters at inference (different problem).
- Expert parallelism (EP) at a high level — full distributed-training treatment
  lives in the future `04-distributed-training` module, but the conceptual story
  belongs here.
- The current frontier MoE landscape: DeepSeek-V3-style fine-grained shared-expert
  designs, Mixtral-style 8x7B, the Snowflake / Databricks dense+MoE hybrids,
  what the published Anthropic/OpenAI/Google models almost certainly do (with
  uncertainty noted where reports are vague).

## 5 — MDX components

Six components ported from greek with small adaptations.

### `<Callout variant="..." title="...">`

Four variants (greek has five; we drop `verdict` since the voice is neutral):

- `info` — neutral context, definition, side fact
- `warning` — common pitfall or sign-flip risk
- `note` — author's working assumption that the reader should carry forward
- `exercise` — pointed prompt; not graded

Visual treatment matches greek's: coloured left border, optional title row, body
supports MDX content. Reuses existing oklch design tokens.

### `<Sidenote>`

Inline numbered footnote that expands on click. Used for citations that would
break prose flow and for caveats that deserve to be visible but not block the
narrative. Auto-numbers per page. Direct port from greek.

### `<Sources items={[...]} />`

End-of-chapter bibliography. Each entry: `{ authors, year, title, venue?, url?,
note? }`. Renders as a labelled list with consistent styling. Direct port from
greek.

### `<ComparisonTable rows={[...]} caption="..." />`

Greek calls this `VerdictTable` and uses it for the real/thin/execution/gone
edge framing. We rename to `ComparisonTable` and let each chapter define its own
column schema as needed. Concrete sub-components or generic-with-typed-rows is an
implementation choice for the writing-plans phase; the spec is "tabular
comparison with a caption, used at least once per chapter, styled consistently".

Example use in `00f-optimizers.mdx`:

```mdx
<ComparisonTable
  caption="Frontier-lab optimiser choices, public reports as of May 2026."
  columns={["Model", "Optimiser", "β1 / β2", "Weight decay", "LR schedule", "Source"]}
  rows={[
    ["DeepSeek-V3", "AdamW", "0.9 / 0.95", "0.1", "WSD", "DeepSeek-V3 tech report (2024)"],
    // ...
  ]}
/>
```

### `<Math display="block|inline">` *(optional)*

Most math uses the native `$...$` / `$$...$$` syntax handled by remark-math /
rehype-katex. We include a `<Math>` component only as an escape hatch for math
that needs custom labelling or numbering. Probably not needed for v1; flagged so
the implementation plan knows it's optional.

### Per-chapter chart components

Greek ships four parametric SVG/canvas charts (gamma profile, gamma chart, vol
term structure, skew) that are options-specific and do not carry over. The
prereqs module will need a different set, designed per chapter as the content
demands. Likely candidates the writing phase will surface:

- **RoPE rotation visualisation** in `00c`: rotate a 2-d query/key pair as the
  position index slides via a `<input type="range">`.
- **Attention-shape diagram** in `00b`: SVG comparing MHA / MQA / GQA / MLA
  weight-sharing patterns.
- **Activation curves** in `00e`: overlay ReLU / GELU / SiLU on the same axes.
- **Loss-curve sketch** in `00f`: parametric loss-vs-step curves for different
  schedules (warmup-cosine vs WSD vs constant).

These are all small SVG-with-React-state components. They don't need a charting
library; they're illustrative, not data-bound. The writing-plans phase decides
which chapters get which charts.

## 6 — Voice & style

The voice is **neutral textbook** — Hull / Goodfellow / Bishop register. Not
greek's opinionated voice; the prereqs are settled enough that opinion is
mostly noise.

What this means in practice:

- **State the mechanism, then the math, then the worked example.** Every
  important concept gets all three. The reader should be able to reproduce the
  worked example by hand with a calculator.
- **No verdicts.** No "this signal is dead" or "this is what to trust". Where
  the literature has converged (e.g. SwiGLU, RoPE, RMSNorm, AdamW), say so and
  cite the convergence; don't editorialise.
- **Hedge where the literature is divided.** When two choices are both reasonable
  (e.g. embedding tying, GQA group count) say so and present the tradeoff
  without picking.
- **Cite primary sources.** Every non-trivial claim gets a citation. Most
  citations are in `<Sources>` at end of chapter; flow-breaking ones go in
  `<Sidenote>`. Prefer original papers; cite blog posts only when they're the
  best public exposition (Karpathy nanoGPT walkthroughs, Lilian Weng surveys,
  EleutherAI/HuggingFace cookbooks).
- **Use Hull-style explicit notation conventions.** State the notation choice up
  front, use it consistently, flag where industry doesn't agree (e.g.
  $d_{model}$ vs $d_{embed}$, $h$ for "number of heads" vs "head dim").
- **No marketing copy.** No "powerful", "cutting-edge", "state-of-the-art" as
  adjectives. SOTA appears only when comparing to a specific other claim with
  a date. The Hull tone.

## 7 — Currency: "up to date as of May 10 2026"

The user's hard requirement is that the content reflect frontier practice as of
May 2026. Concretely this means:

- **Primary literature cut-off:** include all major frontier-lab technical
  reports, papers, and blog posts published through 2025 and Q1-Q2 2026. The
  research-phase agents (§8 Phase 2) explicitly search for 2025-2026 papers.
- **Date every claim.** Where a choice is "what frontier labs ship in
  $year$", say which year. Where a recipe has changed (e.g. WSD schedules
  emerging in 2024), flag the year.
- **Use a frontmatter `last_reviewed` date.** Each chapter ships with the date
  its sources were last verified. Future refresh passes can diff against this.
- **Add a top-of-module note:** "Calibrated to frontier-model practice as of
  May 2026. The math is durable; the SOTA-choice tables age fastest. Recheck
  every 6-12 months."
- **Avoid speculation about unreleased models** beyond what's been publicly
  reported. Where a frontier lab's choice is inferred (because they haven't
  shipped a tech report on the latest model), say so.

## 8 — Agent dispatch plan

Four phases. Phases run sequentially but the agents *within* phases 2 and 3 run
in parallel.

### Phase 1 — Pipeline & components (1 implementation agent, sequential)

**Outputs:**
- MDX support added to `vite.config.ts` with all six remark/rehype plugins.
- Six components in `web/src/components/mdx/`: `Callout`, `Sidenote`, `Sources`,
  `ComparisonTable`, plus `MdxComponents` provider.
- `web/src/lib/textbook.ts` loader with typed manifest.
- Two new pages: `TextbookIndexPage`, `TextbookChapterPage`.
- Two new routes in `routes.tsx`.
- `web/scripts/build-textbook.ts` for search-index extraction.
- A "Hello world" `00-prerequisites.mdx` with one of each component to verify
  the pipeline renders.

**Verification:** `npm run dev`, navigate to `/textbook/00-prerequisites`,
confirm the page renders with math, callouts, sources, comparison table,
syntax-highlighted code, and the right-sidebar TOC.

### Phase 2 — Research briefs (8 parallel research agents, one per chapter)

Each agent owns one chapter. They produce a structured *research brief* (not the
final MDX) covering:

- 10-20 primary sources with full citation metadata, organised by sub-topic.
- For each major concept in the chapter: the canonical statement, the math, a
  worked example, the failure modes, the frontier-lab current practice as of
  May 2026.
- For comparison tables: the raw data with sources for each row.
- For chart proposals: a description of what chart would help here and what
  data it would parametrise on.
- A list of cross-references the writer should make to other chapters.
- A list of "things I couldn't find a clean primary source for" — calibrates
  the writer's hedging.

**Source policy for research agents:**
- Prefer arXiv papers and lab tech reports (DeepMind, OpenAI, Anthropic, Meta,
  DeepSeek, Google, Alibaba, Mistral, Cohere, AI2, Reka, xAI).
- Blog posts from researchers (Karpathy, Lilian Weng, Sebastian Raschka, Sasha
  Rush, Yannic Kilcher transcripts) are fine when they're the best public
  exposition.
- HuggingFace cookbooks and EleutherAI engineering posts are fine for tooling
  and recipe references.
- Course notes (Stanford CS25, CMU CS785, Berkeley CS294) are fine for pedagogy.
- For each chapter, the agent searches for "2025 [topic]" and "2026 [topic]"
  explicitly to catch recent papers; doesn't rely on training-cutoff knowledge.

**Output format:** one markdown file per chapter under `scratch/research-briefs/`
(gitignored), structured to match the chapter section list in §4.

### Phase 3 — Writing (8 parallel writing agents, one per chapter, fed by Phase 2)

Each agent takes its corresponding Phase 2 research brief and produces the final
MDX chapter file. Each agent's prompt includes:

- The full chapter spec from §4.
- The voice guide from §6.
- The component API from §5.
- The notation conventions to use.
- The cross-reference targets (slugs and anchors of sibling chapters).
- The Phase 2 research brief.
- Word-count target.

**Constraints on writers:**
- Use the component set; do not invent new components without flagging.
- Every comparison-table row has a source.
- Every chapter ends with a `<Sources>` block.
- Math notation matches §6.
- Worked examples are concrete numbers, not symbolic.
- Do not push the reader to external resources without first explaining the
  thing yourself. External links are for *deeper* reading after the chapter has
  taught the basics.

### Phase 4 — Integration (1 agent, sequential)

**Outputs:**
- `00-prerequisites.mdx` landing page (written last because it summarises the
  chapter-by-chapter shape).
- Cross-reference audit: every chapter's forward references resolve to a valid
  slug + anchor.
- Notation consistency pass: every chapter uses the same notation for $d_{model}$,
  number of heads, etc.
- Voice consistency pass: catch the places where one chapter slipped into
  opinionated voice or marketing register.
- Search-index regen + verification: every chapter heading is searchable from
  cmd-K.
- Update the existing `notes/00-foundations/README.md` with the top-of-page
  banner described in §3.
- Update the existing top-level `README.md` and `ROADMAP.md` to mention the
  textbook module.

## 9 — Risks & mitigations

- **Research agents hallucinate citations.** Mitigation: every citation in the
  Phase 2 brief is required to include a verifiable URL. The Phase 4 integration
  pass spot-checks 10-20% of citations across chapters. The writer is told to
  only use citations from its brief, not invent.
- **Chapters drift in length and depth.** Mitigation: word-count targets in §4,
  plus a Phase 4 integration audit that compares chapter shape (sections,
  components used, worked-example count) against a checklist.
- **Voice drift between chapters.** Mitigation: §6 is explicit, Phase 3 prompts
  cite §6, Phase 4 does a voice pass. We accept some residual drift; eight
  parallel writers will not be perfectly uniform.
- **Vite MDX integration breaks the existing markdown pipeline.** Mitigation:
  MDX is added as a *second* content path; the existing
  `scripts/build-content.ts` is untouched. The two pipelines coexist.
- **KaTeX bundle weight.** Mitigation: KaTeX CSS is loaded once globally; the
  KaTeX runtime is only pulled into pages that render math. The textbook pages
  will, the existing notes pages will not.
- **The eight chapters take longer than expected and partial completion is
  ugly.** Mitigation: chapter order in §4 is roughly easiest → hardest, so
  partial progress always ships a coherent prefix. The landing page is written
  last and can describe whatever subset has shipped.
- **The user (Henry) disagrees with a choice we made in research / writing.**
  Mitigation: design doc + writing-plans both go through user-review gates;
  per-chapter content also gets a user-review checkpoint before it's merged.

## 10 — Success criteria

After this delivery, the following should be true:

1. `npm run dev` opens the existing site; the topbar gains a "Textbook" link;
   `/textbook` shows the eight chapter cards plus the landing summary.
2. Every chapter renders with math, syntax-highlighted code, the component set
   (callouts, sidenotes, sources, comparison tables), and a working TOC sidebar.
3. A reader can finish all eight chapters without leaving the site to learn the
   prerequisite material. External links are for *deeper* reading, not for
   "go find out what this means".
4. cmd-K search returns chapter content (not just headings) as results.
5. Every comparison-table row and every non-trivial claim has a citation.
6. The `last_reviewed` frontmatter date on every chapter is 2026-05-10 (or later
   if individual chapters slip).
7. The existing `notes/` and `projects/` pipelines still work unchanged.

## 11 — Non-goals (restated for clarity)

- This delivery does **not** ship synthesis content for the other seven topic
  areas. Each one is a separate future module with its own design doc.
- This delivery does **not** replace the existing reading lists in `notes/`.
- This delivery does **not** introduce a backend, authentication, or any cloud
  service. The site stays local-first.
- This delivery does **not** produce production-grade interactive widgets
  (live training curves, real model outputs). Charts are parametric illustrations.

## 12 — Open questions for the user before writing-plans

1. The chapter order in §4 puts attention variants before positional encodings.
   That mirrors how dependency flows in the math (positional encodings are
   easiest to motivate once you have attention scores in hand). Acceptable, or
   prefer positional-encodings before attention-variants?
2. Should the textbook be linked from the existing main-navigation sidebar
   (a new top-level "Textbook" entry), or kept as a topbar link? Probably
   sidebar — confirm.
3. For frontier-lab "current practice" claims, the research agents will hit
   recent papers and tech reports. For closed-model labs (Anthropic, OpenAI,
   the Gemini side of Google), there's less public info — should those rows
   in comparison tables be omitted, included with explicit "inferred from
   published reports / API behaviour", or included with a separate "closed
   model" subsection?
4. The orientation page (`00-prerequisites.mdx`) is written last in the agent
   plan. That ordering means the landing page can summarise the chapters
   accurately. Acceptable, or would you prefer it written first as a guide for
   the writers?
