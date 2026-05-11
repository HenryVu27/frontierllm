# frontierllm

Personal learning repo for frontier large language models, scoped to the **training side** of the lifecycle.

## What this repo is

A structured study of pretraining, post-training/RLHF, distributed training, evaluation, and alignment.

This is the *training-side counterpart* to two adjacent repos:

- `tiny-llm/` — LLM serving / inference primitives (attention, RoPE, GQA, KV cache, FlashAttention, paged attention, MoE inference, speculative decoding)
- `InferenceEngineering/` — production inference engine on RTX 5080 (Triton kernels, FP8/FP4 quantization, continuous batching)

Together those three repos cover the full pipeline. **`frontierllm` does not re-cover serving topics.**

## Layout

```
notes/                  # reading lists per topic (curated bibliography)
web/content/textbook/   # taught chapters rendered at /textbook (MDX)
projects/               # hands-on layer — three milestone code projects (no code yet)
papers/                 # local-only PDFs (gitignored)
scratch/                # half-baked experiments + research briefs (gitignored)
docs/                   # design specs and plans
ROADMAP.md              # thin index across all topics: what's been touched, what's next
```

## Where to start

If you're new to this repo (or returning after a break):

1. Read [`docs/superpowers/specs/2026-04-25-frontierllm-design.md`](docs/superpowers/specs/2026-04-25-frontierllm-design.md) for the original design.
2. Open [`ROADMAP.md`](ROADMAP.md) to see current status.
3. **Prereqs textbook:** start at [`web/content/textbook/00-prerequisites.mdx`](web/content/textbook/00-prerequisites.mdx) or visit `/textbook` in the web reader for the eight-chapter module on transformers, attention variants, positional encodings, normalisation, activations, optimisers, tokenisation, and MoE plumbing. Synthesised from primary sources as of May 2026.
4. **First active activity:** [`notes/07-frontier-labs/00-orientation.md`](notes/07-frontier-labs/00-orientation.md) — read 6 recent frontier-model technical reports and produce a comparative writeup. The output is a personal map of "what I know / don't know" that drives the next deep dive.

## How to use

- `notes/` is the substrate. Every topic has a `README.md` with a reading list and synthesis sections to fill in.
- `projects/` are *milestone* code projects, each one its own future implementation plan. They're scoped but not implemented.
- Update `ROADMAP.md` as you progress so this repo's status is always visible at a glance.

## Out of scope

- Inference / serving — see `tiny-llm/` and `InferenceEngineering/`.
- Production agentic systems — see eXRealityAI work.
- Vision-only SSL — see ThorMed work.
