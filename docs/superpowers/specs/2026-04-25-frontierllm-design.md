# frontierllm — Design

**Date:** 2026-04-25
**Author:** Henry Vu (with Claude)
**Status:** Approved (pending implementation plan)

## Purpose

A personal learning repo for frontier large language models, scoped to the
**training side** of the lifecycle: pretraining, post-training, RLHF and
related RL methods, distributed training, evaluation, and alignment / interp.

The repo is the **training-side counterpart** to two existing repos in
`C:/Personal/`:

- `tiny-llm/` — LLM serving / inference primitives (attention, RoPE, GQA, KV
  cache, FlashAttention, paged attention, MoE inference, speculative decoding)
- `InferenceEngineering/` — production-grade inference engine on RTX 5080
  (Triton kernels, FP8/FP4 quantization, continuous batching, structured
  decoding)

Together, the three repos cover the full pipeline. `frontierllm` does not
re-cover serving topics already handled by the other two.

## Scope

### In scope

- **Pretraining**: scaling laws, data curation, modern architecture deltas,
  optimization stability, tokenization, mid-training, long context
- **Post-training**: SFT, reward modeling, RLHF (PPO), DPO and the
  preference-optimization family (IPO, KTO, SimPO, ORPO), RLAIF, Constitutional
  AI, RL with verifiable rewards (RLVR), distillation
- **Distributed training**: DP/TP/PP/SP/EP/CP, ZeRO, FSDP, Megatron 3D
  parallelism, mixed precision (BF16 / FP8 / MX), activation checkpointing
- **Evaluation**: benchmark families, contamination, eval design, capability
  surfaces, red-teaming
- **Alignment & interpretability** (lightweight): mech-interp basics, sparse
  autoencoders, scalable oversight, sleeper-agents-style safety research
- **Frontier-lab perspective**: reading and synthesizing recent technical
  reports (Anthropic, OpenAI, DeepMind, Meta, DeepSeek, Qwen, etc.)

### Explicitly out of scope

- Inference / serving (covered by `tiny-llm` and `InferenceEngineering`)
- Production agentic systems / RAG / memory architectures (covered by
  professional work at eXRealityAI)
- Vision-only SSL (covered by professional work at ThorMed; may be referenced
  under foundations)
- Building polished public-facing tooling (this is a personal learning repo)

## Approach

**Hybrid: notes as substrate, projects as milestones.**

Two primary layers in the repo:

1. **`notes/`** — the conceptual layer. One folder per topic. Each folder
   contains a curated reading list, the user's synthesis in their own words,
   and open questions. Captures topics where understanding is the deliverable
   (e.g., alignment debates, eval design, frontier-lab analysis).
2. **`projects/`** — the hands-on layer. A small, fixed number (three) of
   milestone code projects that anchor the topics where intuition needs code
   (pretraining, post-training, eval).

A third optional layer — `web/` for interactive visualizations — is
**deferred** behind explicit trigger conditions described below. It is not
built as part of the initial implementation.

### Why hybrid

The user is a practitioner who learns by building, but several frontier topics
(alignment research, eval design, frontier-lab analysis) have no natural code
anchor. Pure project-driven would neglect those; pure reading would underuse
the user's hands-on advantage and available compute. The hybrid lets each
pillar live in the form it deserves and bounds the engineering surface to a
fixed number of projects.

## Repository layout

```
frontierllm/
├── README.md                    # repo orientation, current status, how to use
├── ROADMAP.md                   # thin index across all topics: title + 1-line status
├── notes/                       # conceptual layer (markdown only)
│   ├── 00-foundations/          # quick refresher on transformer math, etc.
│   ├── 01-pretraining/
│   ├── 02-post-training/
│   ├── 03-rlhf-and-rl/
│   ├── 04-distributed-training/
│   ├── 05-eval-and-benchmarks/
│   ├── 06-alignment-and-interp/
│   └── 07-frontier-labs/        # what Anthropic / OpenAI / DeepMind / DeepSeek / etc. are doing
├── projects/                    # hands-on layer (code milestones)
│   ├── 01-pretrain-end-to-end/
│   ├── 02-post-train-end-to-end/
│   └── 03-eval-and-interp/
├── papers/                      # local-only PDFs (gitignored)
├── scratch/                     # half-baked experiments (gitignored)
└── docs/
    └── superpowers/specs/       # design docs (this file lives here)
```

### Directory principles

- Numbered prefixes (`01-`, `02-`) make order obvious without reading
  `README.md`. The numbering reflects a *suggested* order, not a hard
  dependency — topics can be hopped.
- `notes/` is the substrate. Even when work happens in a project, the
  *learning* lives in notes; code is the means, not the artifact.
- `papers/` and `scratch/` are gitignored to avoid committing copyrighted PDFs
  or messy experiments.

## Note template

Every topic folder starts with a `README.md` using this template:

```markdown
# [Topic]

## What this is
2-3 sentences. What falls under this topic, why it matters at frontier scale.

## Reading list
- [ ] Title — link — 1-line "what to take from this" — (paper/blog/talk, est read time)
- [x] (checked once read)

Ordered roughly foundational → frontier within the topic.

## Synthesis (your own words)
- Core idea
- How it connects to what you already know
- Open problems and debates
- Where the frontier currently is

## Open questions
Things you didn't fully understand yet. These become next study targets.

## Code / experiments
Pointers into `projects/` or external repos worth reading.
```

`ROADMAP.md` at the repo root maintains a thin one-line status per topic:
`- 01-pretraining — 3/12 reading items done, no synthesis yet`.

## Projects

Three milestone projects, in order. Each project's output feeds the next, so
one model lineage walks through every stage of the frontier-lab pipeline.

### Project 01 — Pretrain end-to-end

**Goal:** Build the full pretraining stack on a small-but-real model, single
GPU baseline → rented multi-GPU run.

**Deliverables:**
- Data pipeline: download a slice of FineWeb-Edu / SlimPajama, dedup,
  quality-filter, tokenize, shard into mmap files
- Trained custom BPE tokenizer on the data, compared against GPT-2's
- Modern transformer (RoPE, GQA, SwiGLU, RMSNorm) — reusing primitives from
  the user's `tiny-llm` repo where applicable
- **Four sizes** of the same recipe (e.g., 25M / 80M / 250M / 500M params) on
  a fixed token budget. Fit a Chinchilla-style scaling-law curve. Predict the
  loss of a held-out larger size and verify the prediction.
- Stability experiments: μP vs standard parameterization, lr sweeps, written
  analysis of any loss spikes
- Cloud rental phase: 500M run distributed via FSDP + activation checkpointing
  on rented 4× H100. Attempt FP8 training using `torchao` or
  `transformer-engine`.
- Small mid-training anneal at the end (curriculum / data-mix change with lr
  cooldown)

**Artifacts:** 4 base checkpoints, scaling-law plot, writeup of what broke
and how it was fixed.

### Project 02 — Post-train end-to-end

**Goal:** Take the 500M base from Project 01 (or a small public base such as
Qwen-0.5B if Project 01 isn't ready yet) and run the full post-training
pipeline.

**Deliverables:**
- **SFT** on a small instruction dataset (UltraChat / Tulu mix). Ablation on
  data quality vs quantity.
- **Reward model**: train a Bradley-Terry RM on a preference dataset such as
  UltraFeedback.
- **DPO vs PPO head-to-head**: same base, same preferences, both methods.
  Study the KL-vs-quality frontier, reward hacking, length bias.
- **At least one alternative preference method**: SimPO or KTO, for breadth.
- **RLAIF flavor**: use a stronger judge to generate preferences, repeat.
- (Stretch) **RLVR**: small math or code task with verifiable rewards (the
  o1-style training paradigm).

**Artifacts:** instruct model trained by the user, with SFT-only / DPO / PPO
variants for comparison; ablation plots.

### Project 03 — Eval and interp

**Goal:** Answer the question "what did we actually train, and how do we
know?"

**Deliverables:**
- Small reusable eval harness (or fork of `lm-eval-harness`); run on base +
  every variant from Project 02.
- Contamination probing: memorization tests, n-gram overlap with eval data.
- Capability surface plot: which capabilities emerged at which scale across
  the 4 sizes from Project 01.
- Mech-interp side: train a sparse autoencoder on activations of the
  user-trained model; surface a few interpretable features.
- Red-team / jailbreak study on the instruct-tuned model from Project 02.

**Artifacts:** eval report card across all models + a feature catalog from
the SAE.

### Project sequencing

No calendar timeline is committed in this spec. Order is fixed (01 → 02 →
03), but pace is user-driven and gated by available compute and study
priorities surfaced from the orientation pass below.

## Entry point: frontier-lab orientation pass

Because the user is intentionally undecided about the first deep topic, the
first concrete activity is **not** a deep dive — it is an orientation pass
designed to surface what to study deeply.

**Activity:** Read 6 recent frontier-model technical reports / system cards
and produce a comparative writeup at
`notes/07-frontier-labs/00-orientation.md`.

**Targets:**

1. Anthropic Claude 4.X system card
2. OpenAI GPT-5 / o-series technical report
3. Google Gemini 3 technical report
4. Meta Llama 4 paper
5. DeepSeek-V3 / DeepSeek-R1 papers
6. Qwen 3 technical report

**For each:** capture architecture choices, training data scale, post-training
method, eval focus, novel claims, and the user's open questions.

**Output:** a comparative table + ~1-page synthesis covering:

- What labs are converging on
- What labs are diverging on
- What surprised the user
- A personal "I know this / I half-know this / this is alien" map

**Why this entry point:**

- The user encounters every pillar at the *current* frontier rather than
  starting from 2017 and grinding forward
- It exposes vocabulary and acronyms (μP, MTP, MoE topology, RLVR,
  mid-training, etc.) in context
- The personal map drives the next pick — the orientation pass *is* the
  path-picker

**After the orientation pass**, the user picks the next deep dive based on the
map:

- If post-training felt most opaque → dive into `02-post-training/` and
  `03-rlhf-and-rl/`, kick off Project 02 against an open base
- If pretraining infra felt most opaque → dive into `04-distributed-training/`
  and `01-pretraining/`, kick off Project 01
- If eval / alignment felt most opaque → dive into `05-eval-and-benchmarks/`
  and `06-alignment-and-interp/`

## Optional `web/` layer (deferred)

A future interactive-visualization layer is explicitly **out of scope for
initial implementation**. It is documented here only so the trigger
conditions are agreed on in advance.

**Stack (when triggered):** Vite + React + TypeScript + Tailwind + shadcn,
matching the user's existing `MLPlayGround` stack.

**Candidate visualizations:**

- Scaling-laws explorer (Chinchilla-style interactive plots)
- Training-loss anatomy (annotated curves with hover-to-explain spikes,
  anneals, mid-training transitions)
- RLHF reward landscape (toy 2D reward surface with KL-tethered policy)
- Attention / tokenizer playground (only if a specific angle exists that
  isn't covered well elsewhere)

**Trigger conditions** (all must hold before the web layer is built):

1. At least 4 of 7 `notes/` topics are mature (real synthesis, not just
   reading lists)
2. At least one project is complete with a clear visualization that would
   explain it better than text
3. The user explicitly wants to build it — not because the repo "feels
   incomplete" without it

If these conditions never hit, the web layer is never built. The repo's
primary value is `notes/` + `projects/`.

## Initial implementation surface

The implementation plan that follows this spec will scaffold:

- `README.md` and `ROADMAP.md` at the root
- All 7 `notes/<topic>/README.md` files using the template, each pre-seeded
  with a starter reading list (target 5-10 items per topic) curated to the
  user's level
- `notes/07-frontier-labs/00-orientation.md` filled in with the 6-target
  reading list and the comparative-table skeleton ready to fill in
- All 3 `projects/<project>/README.md` files describing scope, deliverables,
  and a lightweight phase plan; no code in `projects/` yet
- `.gitignore` covering `papers/`, `scratch/`, model weights, common
  venv / cache paths, and large-file safety nets

The initial implementation does **not** include:

- Any code in `projects/` (each project is its own future plan)
- The optional `web/` layer
- Population of the synthesis sections in any `notes/` topic (those are
  written by the user as they study)

## Success criteria

- The user can `cd` into the repo and immediately see what to study next
  without re-reading this spec
- After Week 1's orientation pass, the user has a self-generated map of where
  to go next
- Each `notes/<topic>/README.md` has enough starter material that "I want to
  study X" is met with a curated reading list, not a blank page
- Each `projects/<project>/README.md` is concrete enough to launch its own
  implementation plan when the user is ready
- The repo composes cleanly with `tiny-llm/` and `InferenceEngineering/`
  without overlap

## Risks and open questions

- **Reading-list staleness:** frontier-lab outputs evolve fast. Reading lists
  will need refreshing every ~3-6 months. `ROADMAP.md` should track last-
  refreshed dates per topic.
- **Project-01 compute cost:** the 4-size scaling-law sweep is the most
  cloud-intensive activity in the repo. The implementation plan for Project
  01 (when written) must include a cost ceiling.
- **Cross-repo references:** `tiny-llm/` and `InferenceEngineering/` are
  referenced from this repo. If those repos are reorganized, links will
  rot. Keep cross-repo references coarse (link to repo root, not deep paths).
- **Project 02 dependency on Project 01:** if Project 01 takes longer than
  expected, Project 02 should fall back to an open base model (Qwen-0.5B or
  similar) so post-training learning isn't blocked on pretraining
  completion.

## Next step

After user review of this spec, transition to the writing-plans skill to
produce the detailed implementation plan for the initial scaffolding.
