# 00 — Foundations

> **Looking for the taught material?** The prerequisites textbook lives at
> [`/textbook`](/textbook) (or `web/content/textbook/` on disk). Eight chapters
> covering the transformer block, attention variants, positional encodings,
> normalisation and initialisation, activations and gating, optimisers,
> tokenisation and objectives, and MoE plumbing — synthesised from primary
> sources as of May 2026. The reading list below is the curated bibliography
> behind those chapters.

## What this is

A thin layer of refreshers for things assumed by every other topic. Skim if confident; come back when stuck.

You already know most of this — this folder exists to:
- Pin down vocabulary used by other topics (parameter count, FLOP, token, batch size, sequence length, parallelism dimensions)
- Catch any 2017–2026 deltas you might have missed
- Anchor symbols and conventions used across the rest of the repo

## Reading list

- [ ] **Attention Is All You Need** (Vaswani et al, 2017) — the original transformer. Skim section 3.2 (attention) and 5.4 (regularization) for notation.
- [ ] **The Illustrated Transformer** (Jay Alammar, blog) — visual intuition. Skim if rusty.
- [ ] **The Annotated Transformer** (Sasha Rush et al) — code-along walkthrough; sanity-check on PyTorch idioms.
- [ ] **A Mathematical Framework for Transformer Circuits** (Elhage et al, Anthropic, 2021) — sets up the cleanest mental model of what a transformer *is*. Sections 1–2 are foundational; later sections feed into `06-alignment-and-interp/`.
- [ ] **Speeding up the GPT — KV Caching, Quantization** (Lilian Weng, blog) — connects to your existing `tiny-llm` work; refresher on serving-side terms used elsewhere.
- [ ] **Adam, AdamW, and the optimizer landscape** (any modern survey or Lilian Weng's optimizer post) — terminology check. You know optimization theory deeply but the LLM literature uses specific conventions worth refreshing.

Order: foundations skim → math framework → optimizer terminology.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- See `tiny-llm/` for from-scratch implementations of attention, RoPE, GQA, RMSNorm, KV cache.
