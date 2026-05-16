# Design — frontierllm inference & serving textbook module

**Date:** 2026-05-15
**Status:** Draft, executing autonomously
**Predecessors:** Modules 0, 1, 2, 3 shipped.

## 1 — Motivation

Modules 0–3 cover architecture, pretraining, distributed training, and post-training. They stop at the point a *deployable* model is handed off to a serving team. This module covers how 2024–2026 inference engines achieve $10$–$50$× more tokens-per-second than naive sequential decoding, what the engineering tradeoffs are, and how the frontier serving stack composes.

## 2 — Scope

In scope: KV-cache mechanics + paged attention; decoding-time sampling; speculative decoding (Medusa, EAGLE, draft-target); continuous batching; INT8/INT4 quantization; frontier inference engines (vLLM, SGLang, TRT-LLM, DeepSpeed-FastGen); structured output decoding; deployment-time architectures (prefill/decode disaggregation, KV offload).

Out of scope: pretraining-distributed parallelism (Module 2); RL rollout infra (Module 3); evaluation methodology (Module 5).

## 3 — Architecture

Reuse pipeline. Files at `web/content/textbook/04-*`. Orders 36–44, chapters 36–44 (landing 36).

## 4 — Chapter list

### `04-inference.mdx` — Landing (~3-5k)

Orientation, dependency map, notation, reading orders.

### `04a-kv-cache.mdx` — KV cache and paged attention (~6-8k)

The KV cache. Memory math: layers × heads × head-dim × context-length × 2 (K and V) × batch × precision. The pre-2023 contiguous KV cache and the fragmentation problem. Paged attention (Kwon et al. 2023, vLLM). Block size, page table. KV cache compression: H2O, StreamingLLM, SnapKV.

### `04b-decoding-strategies.mdx` — Sampling and decoding (~5-7k)

Greedy, top-k, top-p (nucleus), temperature, min-p, top-a, repetition penalty. The 2024-2026 best-practice combinations. DRY sampler. XTC. Speculative-decoding compatibility.

### `04c-speculative-decoding.mdx` — Speculative decoding (~6-8k)

The draft-target framework. Lookahead decoding (Fu 2023). Medusa (Cai 2024). EAGLE (Li 2024) and EAGLE-2 / EAGLE-3. The acceptance-rate math. Inference speedups in production: 2-4× on a 70B + 7B draft.

### `04d-continuous-batching.mdx` — Continuous batching (~5-7k)

Orca's iteration-level scheduling (Yu 2022). vLLM's continuous batching. Request preemption, KV-cache eviction. Throughput vs latency tradeoffs.

### `04e-quantization.mdx` — Quantization (~6-8k)

Post-training quantization. INT8 (LLM.int8(), SmoothQuant). INT4 (GPTQ, AWQ, AQLM, HQQ). The weight-only vs weight-activation distinction. KV-cache quantization (FP8, INT8, INT4). The 2024-2026 FP8 / FP4 inference recipes.

### `04f-frontier-engines.mdx` — Inference engines (~6-8k)

vLLM, SGLang, TRT-LLM (NVIDIA), DeepSpeed-FastGen, llama.cpp, MLX. Architecture comparison. When each one wins.

### `04g-structured-output.mdx` — Constrained decoding (~4-6k)

JSON mode, function calling. Outlines (Willard 2023). XGrammar (2024). LM Format Enforcer. The token-mask-vs-FSM debate.

### `04h-deployment-architecture.mdx` — Deployment architectures (~6-8k)

Prefill/decode disaggregation (Splitwise, DistServe). KV-cache offload (CXL, NVMe). Multi-LoRA serving. DeepSeek-V3's inference deployment.

## 5 — Voice & style

Inherits Module 1 §6. Hedge frontier-engine performance numbers heavily (versioning fast).

## 6 — Currency

May 15 2026. Inference engines and quantization age fastest.

## 7 — Agent dispatch

8 parallel research agents (Haiku, 15-call cap) → 8 parallel writers (Haiku for most, Sonnet for math-heavy decoding) → integration.

## 8 — Success criteria

Reader can read a frontier inference deployment description and identify: KV-cache strategy, decoding algorithm, quantization recipe, engine choice, deployment architecture.
