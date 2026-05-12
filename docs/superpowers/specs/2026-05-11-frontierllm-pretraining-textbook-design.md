# Design — frontierllm pretraining-at-scale textbook module

**Date:** 2026-05-11
**Author:** Henry (with Claude as drafting agent)
**Status:** Draft, executing in autonomous mode per user direction
**Predecessor:** `2026-05-10-frontierllm-prereqs-textbook-design.md` (shipped 2026-05-10)

---

## 1 — Motivation

The prerequisites module (`/textbook/00-*`) shipped on 2026-05-10 and gave the
reader the math + architecture foundations: transformer block, attention zoo,
positional encodings, normalisation, gating, optimisers, tokenisation, MoE
plumbing. After eight chapters the reader can read a frontier-model tech
report and understand the architectural choices without external help.

The next gap is **pretraining at scale**. A reader who has finished the prereqs
module still cannot read the data section of a 2025-2026 tech report (DeepSeek-V3,
Llama-4, Qwen-3, Mistral-Large-2, Kimi-K2, GPT-OSS) and know what an
*annealing phase* is, why *μTransfer* lets you tune at small scale, what
*compute-optimal* means after Chinchilla was revisited for inference, or what
*critical batch size* implies for their TPU schedule. The reading lists in
`notes/01-pretraining/` cover the literature but do not synthesise it.

This module ships that synthesis: a self-contained set of chapters covering
data, tokenisers, scaling laws, hyperparameter transfer, learning-rate
schedules, data curriculum, long-context extension, and the midtraining /
annealing phase that frontier labs converged on in 2024-2025.

## 2 — Scope

### In scope

- Eight chapter MDX files plus a landing page at `web/content/textbook/01-*`.
- Reuse the prereqs pipeline (MDX, KaTeX, `Callout`, `Sidenote`, `Sources`,
  `ComparisonTable`) with no new component work unless content demands it.
- Currency anchored to May 11 2026: every comparison table cites a source from
  2024-2026, every "frontier practice" claim names the model + year.
- Four-phase agent dispatch (pipeline reuse → research briefs → writing →
  integration), mirroring the prereqs module.
- Landing page + sidebar integration so `/textbook/01-pretraining` is reachable
  from cmd-K, the Textbook index, and the notes banner on
  `notes/01-pretraining/`.

### Out of scope (this delivery)

- Distributed training internals (DP / TP / PP / EP / FSDP2 / ZeRO mechanics) —
  these belong to a separate "Distributed training" module. Where chapters
  reference parallelism choices (e.g. EP for MoE training, sequence-parallel for
  long context) they treat the choice as a black box and link forward.
- Post-training / RLHF / RLVR / reasoning RL — separate "Post-training +
  Reasoning" module.
- Inference & serving (KV-cache, paged attention, speculative decoding) —
  separate "Inference & serving" module.
- Evaluation methodology — separate "Eval / Alignment / Interp" module.
- Re-implementing or extending the existing `notes/01-pretraining/README.md`
  reading list; the textbook chapters cite it and add the synthesis layer.

### Explicitly not changing

- The prereqs textbook module (`/textbook/00-*`). Cross-references go *into*
  prereqs, never modify them.
- The existing reading-list / project pipelines.
- Design tokens, fonts, prose styles. Module 1 reads in the same visual
  register as Module 0.

## 3 — Architecture

The infrastructure is already in place. Only **content** is added.

### File layout

```
frontierllm/
├── web/
│   └── content/
│       └── textbook/
│           ├── 01-pretraining.mdx                    # landing
│           ├── 01a-data-pipeline.mdx
│           ├── 01b-tokenizer-training.mdx
│           ├── 01c-scaling-laws.mdx
│           ├── 01d-mup-and-transfer.mdx
│           ├── 01e-schedules-and-batch.mdx
│           ├── 01f-data-curriculum.mdx
│           ├── 01g-long-context.mdx
│           └── 01h-annealing-and-stability.mdx
└── docs/superpowers/specs/
    └── 2026-05-11-frontierllm-pretraining-textbook-design.md   # this file
```

### Routing

No new routes. `/textbook` index page lists all chapters across modules; the
existing `/textbook/:slug` route serves the new files automatically because
`textbook.ts` uses `import.meta.glob('/content/textbook/*.mdx')`.

The landing page (`01-pretraining.mdx`) is the first chapter of the
"Pretraining at scale" group on the `/textbook` index. Index page grouping is
inferred from the slug prefix (`00-*` vs `01-*`); the index renders each module
as a section with its own chapter list. **Implementation note:** if the
existing `TextbookIndexPage` does not yet group by prefix, the Phase 4
integration agent adds that — minimal change, no new components.

### Frontmatter schema (reused)

```yaml
---
slug: 01a-data-pipeline
title: Data sources, filtering, and deduplication
description: How frontier labs build a 10-30T-token pretraining corpus in 2026.
order: 11                  # global order across textbook
chapter: 11                # chapter number shown in header
module: 1                  # NEW: which module this chapter belongs to
module_title: Pretraining at scale
reading_minutes: 32
depends_on: [00a-transformer, 00g-tokenization-and-objectives]
provides: [data-pipeline, dedup, quality-filtering, contamination]
last_reviewed: 2026-05-11
---
```

The `module` and `module_title` fields are new; they let the index page group
chapters without parsing slugs. If the existing `Chapter` type in
`textbook.ts` does not have them, Phase 1 (small) adds them as optional fields
so prereqs chapters can omit them and still type-check.

## 4 — Chapter list

Nine MDX files. Word-count estimates are targets, not contracts. Order is
dependency-graph based: data and tokenisation come first because every later
chapter assumes them; scaling laws sit before μP because μP is motivated by
the scaling-law framing; schedules come before curriculum because curriculum
choices interact with the LR schedule; long-context and annealing close the
module because both are "late pretraining" phases.

### `01-pretraining.mdx` — Landing (orientation)

~3-5k words. Covers:

- What "pretraining at scale" means in 2026 — distinct from continued
  pretraining, midtraining, and post-training. The phase boundaries that
  frontier labs draw and where they disagree.
- The shape of a 2026 pretraining run: data scale (10-30T tokens), parameter
  scale (10B-2T active params), wall-clock (weeks-months), the rough cost
  envelope ($1M-$100M+ depending on the lab).
- The eight chapter shape with a dependency diagram (chapters refer back to
  prereqs `00a` and `00g`, and forward to the future Distributed-Training
  module).
- Notation conventions specific to this module: $N$ = parameters, $D$ = tokens,
  $C$ = compute (FLOPs), $B$ = batch size in tokens, $\eta$ = learning rate,
  $T$ = total training tokens.
- Reading-order recommendations for three reader profiles (training engineer,
  research scientist, evaluator / outsider).
- Six success criteria (what you should be able to read after the module).

### `01a-data-pipeline.mdx` — Data sources, filtering, deduplication

~6-8k words. Covers:

- The 2026 data landscape: Common Crawl + FineWeb / FineWeb-Edu /
  RedPajama-2 / Dolma / DCLM, code (StackV2, The Stack), books, papers
  (PubMed, arXiv), conversations (Reddit, StackExchange), synthetic data
  (Phi-style, distilled from larger models).
- The HTML extraction problem: Trafilatura, jusText, custom pipelines.
  Why frontier labs replaced WET files with re-extraction from WARC.
- Quality filtering: heuristic filters (perplexity gate, length, repetition),
  classifier-based filters (FineWeb-Edu's classifier, DCLM's classifier),
  the LLM-judge approach (Phi-1, Llama-3.1's classifier), the recent move
  toward "more compute on filtering" (DCLM's argument).
- Deduplication: MinHash, SuiteSparse-style ExactSubstr, document-level vs
  span-level. The math of MinHash + LSH (why 9-gram with 80% Jaccard threshold
  is the conventional choice). The recent "FineWeb dedup" results showing
  inter-snapshot dedup hurts.
- PII removal, toxicity filtering, contamination removal (test-set bleed —
  the n-gram overlap canon, the strict-vs-loose tradeoff).
- Multilingual considerations: language ID (fastText, CLD3, GlotLID),
  per-language quality thresholds, the long-tail problem.
- A "what frontier labs ship in 2026" table.
- Worked example: the DCLM-Baseline 7B recipe (publicly disclosed
  ~3T-token training set after filtering).

### `01b-tokenizer-training.mdx` — Tokenizer training at frontier scale

~5-6k words. Covers:

- Why tokenizer choice is a *pretraining* decision (not an architecture one):
  it gates downstream loss-per-token interpretation, dataset shape, and
  inference cost.
- Recap of BPE / SentencePiece basics (links to prereqs `00g`); this chapter
  is the *training* recipe.
- Vocab-size selection: the loss-vs-vocab-size frontier, the "right" vocab
  size for a given model size (the Chinchilla-for-vocab result and its
  refinements through 2025).
- Training corpus selection for the tokenizer: should it match the model's
  pretraining mix? The over-/under-representation tradeoff for code and
  multilingual.
- Practical pre-tokenization: GPT-2 / Llama / DeepSeek pre-tokenization
  regexes, why the regex matters, the Unicode normalization choices
  (NFC vs NFKC, byte-fallback).
- Glitch tokens and how to prevent them: the SolidGoldMagikarp class, the
  "train on the model's data, not a separate corpus" mitigation, the
  unused-token-removal step before training.
- Multilingual tokenizer choices: the fertility metric, the
  CJK / Indic / Arabic considerations, why frontier labs use 100k-256k
  vocab in 2026.
- A current-frontier comparison table: vocab sizes and special-token sets
  across Llama-3, DeepSeek-V3, Qwen-3, GPT-4o, Claude, Gemini-2.

### `01c-scaling-laws.mdx` — Scaling laws and compute-optimal training

~7-9k words. The keystone chapter for the module. Covers:

- Kaplan et al. 2020: the original power-law scaling, the $L(N, D)$ form,
  what the exponents mean, the (later corrected) compute-optimal frontier.
- Chinchilla (Hoffmann et al. 2022): the IsoFLOP approach, the $\sim 20$
  tokens-per-parameter optimum, why Kaplan's data-scaling was undersized.
- The Chinchilla revisit (Besiroglu et al. 2024 / Porian et al. 2024): the
  fit issues, the corrected exponents, the implications.
- 2024 refinements: DeepSeek-V1 scaling-law re-derivation, Llama-3.1's
  IsoFLOP plots, the "data quality changes the exponents" finding.
- Inference-aware scaling (Sardana et al. 2023, Beyond Chinchilla papers):
  why Llama-3 / Llama-4 train *past* compute-optimal — when you serve more
  tokens than you train, it pays to overtrain. The math.
- Loss-to-downstream metric scaling: the recent literature on emergent vs
  smooth, the BIG-Bench Hard results, the calibration story.
- A worked example: given a 10^25 FLOP budget, an inference workload of N
  tokens / month, and a target loss, derive $(N^*, D^*)$ under the
  inference-aware framework. Concrete numbers.
- The "scaling-laws under MoE" story (DeepSeek-V2 / V3 scaling-law section,
  the active-vs-total parameter accounting).
- Frontier practice table: published scaling-law parameters across labs
  and their token-per-parameter ratios.

### `01d-mup-and-transfer.mdx` — μP and hyperparameter transfer

~5-7k words. Covers:

- Why hyperparameter sweeping at frontier scale is infeasible: each run
  costs $10^{24}$ FLOPs, you cannot afford 50 of them.
- Standard parametrisation vs μP (Yang et al. 2022): the update-RMS
  preservation condition, what changes (init scale, LR scaling per parameter
  group, embedding LR), what doesn't.
- The mup-transfer experimental procedure: sweep at width 256-512 → predict
  the LR for width 8192-16384. The validation curves that justify the claim.
- The 2024-2025 refinements and challenges: μP for SwiGLU (gate-LR scaling),
  μP for MoE (per-expert vs shared scaling), depth-μP (Stevens et al. 2024,
  Yang et al. 2024 follow-ups).
- The "what mup does and does not give you" honest accounting: it transfers
  LR cleanly, transfers some other hyperparameters, doesn't transfer the
  loss-curve shape, doesn't replace IsoFLOP for finding $D^*$.
- Implementation: which terms in the model need rescaling, how the per-param
  LR multiplier is implemented (param-group split in the optimiser), what
  breaks if you forget one.
- Worked example: a small-width sweep with concrete numbers + the
  prediction equation for a target width.
- Frontier practice: which labs publicly use μP (Meta for Llama-3.1, DeepSeek
  for V2/V3, Cerebras), what's reported, what's inferred.

### `01e-schedules-and-batch.mdx` — Learning-rate schedules and batch size

~6-8k words. Covers:

- Warmup: the linear ramp from 0 to max-LR, why it's needed (Adam's bias
  correction + cold start), the typical length (1-2% of total steps).
- Cosine decay: the classic, why it's robust, the cosine-to-zero vs
  cosine-to-10% choice.
- The WSD schedule (Warmup-Stable-Decay): the rise in 2023-2024
  (MiniCPM, DeepSeek-V2), the "decay last 10%" recipe, why it allows
  continued-training restarts.
- Inverse-square-root and constant + decay schedules: where they fit.
- Schedule-free optimisation (Defazio et al. 2024): the math, where it
  works (large-batch, well-conditioned), where it doesn't (the rest).
- Batch-size theory: McCandlish et al. 2018's critical batch size $B_{crit}$,
  the gradient-noise scale, the "scaling efficiency" curve.
- The 2024-2026 batch-size practice: 4M-tokens for 7B-class, 16M-tokens
  for 70B-class, 32M+ for frontier MoE, why frontier labs ramp the batch
  size during training (Yang et al. 2023, DeepSeek-V3 ramp).
- Learning-rate / batch-size interactions: the $\eta \propto B$ heuristic vs
  $\eta \propto \sqrt{B}$ — when each applies.
- Gradient accumulation as a separate axis: the equivalence proof and the
  optimiser-bias subtlety.
- Worked example: derive a schedule for a 13B-param, 3T-token run with a
  given hardware setup.
- Frontier practice table: schedules + max-LR + batch sizes for public
  recipes.

### `01f-data-curriculum.mdx` — Data mixing and curriculum

~5-7k words. Covers:

- Why data mixing matters: not all tokens are equal — code, math, and reasoning
  data measurably move downstream metrics more than general web.
- The static-mix problem: how to choose mix proportions before training.
  Heuristics, ablation runs (DoReMi, RegMix, RegBench), the recent
  *data mixing laws* (Ye et al. 2024 — predict downstream loss as a
  function of mix proportions, fit at small scale, extrapolate).
- The dynamic / curriculum approach: start with general web, ramp up
  quality, end with code/math/reasoning — the "annealing" recipe (covered
  more in `01h`).
- Multilingual balance: the per-language sampling temperature, the
  long-tail handling, the recent multilingual-laws results.
- Domain weights vs token-level reweighting (Doremi-style, LESS-style):
  which one is which, when each is appropriate.
- Synthetic-data inclusion: the Phi-style "textbooks-are-all-you-need"
  family, the role of synthetic at pretraining (still small), the
  contamination risks.
- Worked example: a four-domain mix (web / code / math / books) — fit a
  small mixing law, predict the optimal mix, compare to a uniform baseline.
- Frontier practice table: published data-mix ratios with sources.

### `01g-long-context.mdx` — Long-context extension

~5-7k words. Covers:

- The phase: long-context training as continued pretraining after the main
  short-context phase (typical: 4k or 8k base → 32k → 128k → 1M).
- Position-encoding integration: how RoPE base-frequency / YaRN /
  LongRoPE / ABF (adjusted base frequency) interact with the continued
  pretraining; this connects back to prereqs `00c`.
- Data for long-context: how to construct long-context training documents
  (long books, repository concatenation, code-repo flat files, fan-fic),
  the "packed needle-in-haystack" tradeoff.
- Loss-mask strategies: which positions you train on at long context.
- Inference-time vs train-time tradeoffs: training at 128k is expensive,
  many labs do most pretraining at 8k-32k and extend at the very end.
- Effective context vs nominal context: the eval gap. The Ruler benchmark,
  the Loft results, why "we train to 1M" doesn't always mean "the model
  uses 1M".
- The 2024-2026 frontier: 200k (Claude 3/4), 1M (Gemini 1.5/2/3), 256k
  (Llama 3.1/4), 128k+ (most labs).
- Worked example: extension recipe (RoPE base frequency adjustment + data
  selection + step count) for going from 8k → 128k.
- Frontier practice: extension recipes with sources.

### `01h-annealing-and-stability.mdx` — Midtraining, annealing, and stability

~6-7k words. Covers:

- The "annealing phase" / "midtraining" terminology: the WSD-style decay,
  the data-quality ramp, why it works (LR decay + high-quality data
  together).
- The Llama-3 / DeepSeek-V3 / Qwen / Kimi annealing recipes as published.
- What goes into the annealing data mix: code, math, reasoning chains,
  long-context, recent web. The shift in proportions.
- Training stability: the loss-spike literature — Brain Float bf16 vs FP32
  master weights, the Z-loss for output softmax, gradient clipping
  conventions, AdamW $\epsilon$ choice, embedding LayerNorm.
- FP8 training (2024-2026 reality): the per-tensor scaling, the
  block-wise scaling, the MX (microscaling) formats, what's stable and what
  isn't. DeepSeek-V3's FP8 recipe as a worked example.
- Restart-from-checkpoint surgery: when a spike persists, what frontier
  labs do (skip-the-bad-batch, replay-with-lower-LR, restart-from-an-
  earlier-checkpoint).
- Frontier practice: stability recipes from the public reports.

## 5 — MDX components

No new components needed. Reuse from prereqs:

- `<Callout variant="info|warning|note|exercise">`
- `<Sidenote>`
- `<Sources items={[...]} />`
- `<ComparisonTable rows={[...]} caption="..." />`

Per-chapter chart suggestions (each is small SVG-with-React-state, decided in
Phase 3 by the writer):

- `01c-scaling-laws`: an IsoFLOP plot with sliders on $\alpha$ and $\beta$ —
  watch the compute-optimal curve shift.
- `01d-mup-and-transfer`: width-sweep curve with the "transfer point" marked.
- `01e-schedules-and-batch`: schedule overlay (cosine vs WSD vs constant)
  with parametric warmup + decay-tail sliders.
- `01f-data-curriculum`: stacked-area chart of data-mix proportions over
  training steps under a curriculum recipe.

All optional. If a chapter has no compelling chart, it ships without one;
the bar is "did the chart earn its keep", not "every chapter needs a chart".

## 6 — Voice & style

Inherits from prereqs §6 unchanged. Restating the key constraints:

- **State, then math, then example.** Every concept gets all three.
- **No verdicts, no marketing copy.** Hull / Goodfellow register.
- **Hedge where the literature is divided.** Inference-aware scaling
  exponents are not settled — present the range.
- **Cite primary sources.** Tech reports > arXiv > blog posts > tweets.
  Recent (2024-2026) papers are the priority for "frontier practice"
  claims.
- **Notation consistency.** This module uses $N$ for parameters, $D$ for
  tokens, $C$ for compute, $B$ for batch size in tokens, $T$ for total
  training tokens, $\eta$ for learning rate, $L$ for loss. State this on
  the landing page; flag deviations explicitly.

## 7 — Currency: "up to date as of May 11 2026"

- Primary literature: include 2024-2026 papers, tech reports, and
  high-signal blog posts. The research-phase agents (§8 Phase 2) search
  for "2025 [topic]" and "2026 [topic]" explicitly and prefer the most
  recent canonical reference.
- Every "frontier practice" claim cites a specific model + year.
- Each chapter ships with `last_reviewed: 2026-05-11`.
- Top-of-module note on the landing page restating the currency window
  and flagging that the scaling-law and FP8 sections age fastest.

## 8 — Agent dispatch plan

Four phases. Phases 2 and 3 run their agents in parallel.

### Phase 1 — Index page grouping (1 implementation agent, sequential)

**Outputs:**
- `TextbookIndexPage.tsx` groups chapters by module (`00-*` → "Prerequisites";
  `01-*` → "Pretraining at scale"). The grouping logic reads the `module` and
  `module_title` frontmatter fields if present, falls back to "Prerequisites"
  for unprefixed chapters.
- `Chapter` type in `web/src/lib/textbook.ts` gains optional `module` and
  `module_title` fields.
- Each `00-*` chapter's frontmatter is updated (Phase 4) to include
  `module: 0` and `module_title: Prerequisites`. (Phase 1 doesn't do this;
  Phase 1 only adds the *capability* to read the fields.)

**Verification:** `npm run build` is green; `/textbook` renders both module
groups; the prereqs chapters render unchanged because the new fields are
optional.

### Phase 2 — Research briefs (8 parallel research agents, one per chapter)

Identical pattern to the prereqs Phase 2. Each agent:

- Owns one of the 8 content chapters (not the landing).
- Produces a structured research brief under
  `scratch/research-briefs/01-pretraining/<chapter-slug>.md` (gitignored).
- Cites 10-25 primary sources per chapter, each with a verifiable URL.
- Marks "could not find clean primary source" gaps so the writer can hedge.
- Covers the section list from §4 — canonical statement, math, worked
  example, frontier-lab current practice with model + year + source.
- Searches "2025 [topic]" and "2026 [topic]" explicitly.
- For comparison tables, supplies raw data with per-row sources.
- Lists cross-references to make (forward to other 01-* chapters; backward to
  00-* chapters).

**Source policy** (unchanged from prereqs):
- Prefer arXiv + lab tech reports (DeepMind, OpenAI, Anthropic, Meta, DeepSeek,
  Alibaba/Qwen, Mistral, Cohere, AI2, Reka, xAI, 01.AI, Moonshot/Kimi).
- HuggingFace cookbooks, EleutherAI engineering posts: fine for tooling and
  recipe references.
- Researcher blogs (Karpathy, Lilian Weng, Sebastian Raschka, Sasha Rush,
  Quentin Anthony, Stas Bekman, Tri Dao): fine when they're the best public
  exposition.
- Course notes (Stanford CS25, CMU CS785, Berkeley CS294, EPFL): fine for
  pedagogy.

### Phase 3 — Writing (8 parallel writing agents, one per chapter)

Each agent takes its corresponding Phase 2 research brief and produces the
final MDX chapter file. Prompts include:

- The full chapter spec from §4.
- The voice guide from §6.
- The component API from §5.
- The notation conventions to use (§6 list).
- The cross-reference targets (prereqs slugs + anchors, sibling 01-* slugs).
- The Phase 2 research brief.
- Word-count target.

**Constraints on writers** (unchanged from prereqs):
- Use the existing component set.
- Every comparison-table row has a source.
- Every chapter ends with a `<Sources>` block.
- Math notation matches §6.
- Worked examples are concrete numbers.
- Do not push the reader to external resources without first explaining
  the thing yourself.
- Use heading-id syntax `## Heading {#explicit-anchor}` for every H2 and any
  H3 referenced cross-chapter. This makes search-index IDs stable.

### Phase 4 — Integration (1 agent, sequential)

**Outputs:**
- `01-pretraining.mdx` landing page (written last — summarises the chapter
  shape).
- Add `module: 0` / `module_title: Prerequisites` to the 8 prereqs chapter
  frontmatters (mechanical update, no content change).
- Add `module: 1` / `module_title: Pretraining at scale` to the new 9 chapter
  frontmatters (mechanical update).
- Cross-reference audit: every chapter's forward references resolve to a
  valid slug + anchor in either 00-* or 01-* chapters.
- Notation consistency pass.
- Voice consistency pass.
- Search-index regen + verification: every chapter heading is searchable
  from cmd-K.
- Update `notes/01-pretraining/README.md` with the textbook banner pattern
  used on `notes/00-foundations`.
- Update top-level `README.md` and `ROADMAP.md` to list the new module.

## 9 — Risks & mitigations

- **Scaling-law numerics drift.** Mitigation: Phase 2 agents are told the
  scaling-law area is the most likely to have shifted since training cutoff;
  prioritise 2025-2026 sources for §01c content.
- **FP8 / mixed-precision recipes are changing fast.** Mitigation: §01h
  flags FP8 as a fast-aging section; cites only what was publicly disclosed
  through Q1 2026.
- **Closed-lab claims are uncertain.** Mitigation: same as prereqs — closed
  rows in comparison tables are flagged "inferred" with the report they're
  inferred from.
- **Cross-module references break if prereqs anchor slugs change.**
  Mitigation: Phase 4 integration enumerates every prereqs anchor cited
  and verifies it exists.
- **Word-count drift, voice drift across 8 parallel writers.** Mitigation:
  same as prereqs — word targets in §4, Phase 4 audit pass.

## 10 — Success criteria

After this delivery:

1. `npm run dev` shows `/textbook` with two module sections: "Prerequisites"
   (8 chapters) and "Pretraining at scale" (8 chapters + landing).
2. Every 01-* chapter renders with math, callouts, sources, comparison
   tables, and a working TOC.
3. A reader who has finished the prereqs module can finish the pretraining
   module without leaving the site to learn the material.
4. cmd-K returns 01-* content (sections + headings, not just titles).
5. Every comparison-table row and every "frontier practice" claim cites a
   primary source dated 2024-2026.
6. Every chapter ships with `last_reviewed: 2026-05-11`.
7. Prereqs chapters render unchanged (no regression).
8. The `notes/01-pretraining` reading list gains the textbook banner.

## 11 — Non-goals (restated for clarity)

- This delivery does **not** ship Distributed Training, Post-training,
  Inference, Eval / Alignment / Interp, or Frontier Labs modules. Each is
  a separate future module.
- This delivery does **not** replace any existing reading list.
- This delivery does **not** introduce a backend.
- This delivery does **not** produce live-data-bound widgets. Charts are
  parametric illustrations.

## 12 — Open questions

Owner has authorised autonomous execution. The questions below are flagged
for the integration phase to resolve in-flow rather than blocking:

1. The chapter order in §4 puts scaling laws (`01c`) *before* μP (`01d`)
   because μP is motivated by the scaling-law framing. Acceptable; flagged
   so the writer of `01d` knows to assume the reader has just read `01c`.
2. The `01e` chapter combines schedules and batch size into one chapter
   (both are "training trajectory" choices). If word count exceeds ~8k,
   Phase 4 can split into `01e-schedules` and `01e2-batch`. Single chapter
   is the default.
3. Long-context extension `01g` straddles "pretraining" and "post-pretraining
   continuation". We keep it in this module because almost all frontier
   labs ship long-context as a continued-pretraining phase, not as a
   separate stage.
4. The DCLM-Baseline recipe is used as the worked example in `01a`. If a
   newer (2026) public recipe becomes available during the research phase,
   the writer is free to swap.
