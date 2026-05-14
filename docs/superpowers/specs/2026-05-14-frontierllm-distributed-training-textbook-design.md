# Design — frontierllm distributed-training textbook module

**Date:** 2026-05-14
**Author:** Henry (with Claude as drafting agent)
**Status:** Draft, executing autonomously
**Predecessors:** Module 0 (Prerequisites, shipped 2026-05-11); Module 1 (Pretraining at scale, shipped 2026-05-12)

---

## 1 — Motivation

Modules 0 and 1 cover the *architecture* and the *recipe* of frontier pretraining. Both treat parallelism as a label — "the model is trained with ZeRO-3 + tensor parallel + pipeline parallel" — without saying what those labels mean mechanically. This module fills the gap. After it a reader can read the "infrastructure" section of any 2024–2026 tech report (the Llama-3 4D parallelism configuration, DeepSeek-V3's DualPipe schedule, the Megatron-LM tensor-parallel recipe, the FSDP-2 documentation, the Qwen-3 expert-parallel choice) and understand each engineering decision: which parameters are sharded by which dimension, how the all-reduce, all-gather, and reduce-scatter calls compose, what activation memory looks like at each parallel stage, what the bubble-time vs activation-memory tradeoff in pipeline parallel actually is, and what FSDP-2 changed relative to FSDP-1 + ZeRO-3.

This module also covers the *operational* dimensions: NCCL collectives, communication overlap with computation, mixed-precision and FP8 training in a distributed context, gradient checkpointing math, and the 3D / 4D parallelism configurations frontier labs publish (Llama-3 405B's 4D mix, DeepSeek-V3's pipeline schedule, the Megatron-LM tensor + sequence-parallel composition).

## 2 — Scope

### In scope

- Eight chapter MDX files plus a landing page at `web/content/textbook/02-*`.
- Reuse the existing pipeline (MDX, KaTeX, `Callout`, `Sidenote`, `Sources`, `ComparisonTable`, `Figure` and its figure components).
- Currency anchored to May 14 2026: every comparison-table row cites a source from 2023–2026, every "frontier practice" claim names the model + year.
- Four-phase agent dispatch.
- Landing page + sidebar / index integration so `/textbook/02-distributed` is reachable.
- One or two distributed-training-specific figures (e.g. tensor-parallel matrix-split diagram; pipeline-parallel bubble-time chart).

### Out of scope (this delivery)

- Hardware specifics (Hopper vs Blackwell vs TPU vs Trainium): treated as black boxes with NCCL semantics.
- Inference-time parallelism (KV-cache parallelism, paged attention): belongs to the Inference & Serving module.
- Compiler-level details (XLA, Triton kernel implementation): treated as a black box.
- Cloud cluster orchestration (Slurm, Kubernetes, ray.io): not covered.

## 3 — Architecture

Reuse the existing infrastructure. Only **content** is added.

### File layout

```
web/content/textbook/
  02-distributed.mdx                    # landing
  02a-data-parallel.mdx
  02b-tensor-parallel.mdx
  02c-pipeline-parallel.mdx
  02d-expert-parallel.mdx
  02e-fsdp-and-zero.mdx
  02f-collectives-and-overlap.mdx
  02g-mixed-precision-and-recompute.mdx
  02h-3d-4d-composition.mdx
```

### Frontmatter

```yaml
---
slug: 02a-data-parallel
title: Data parallelism (DP, DDP) and the synchronous gradient
description: The simplest parallelism strategy — replicate the model, shard the batch. AllReduce semantics, gradient accumulation, weak-vs-strong scaling.
order: 20
chapter: 19
module: 2
module_title: Distributed training
reading_minutes: 32
depends_on: [01e-schedules-and-batch]
provides: [data-parallel, allreduce, gradient-accumulation, weak-scaling]
last_reviewed: 2026-05-14
---
```

`order` starts at 19 (the landing) so it follows Module 1's last chapter (order 18). `chapter` continues from 18 to 19 (landing) and chapters 20–27 for the 8 content chapters.

## 4 — Chapter list

Nine MDX files. Order is dependency-graph based: data parallel is the simplest and grounds all others; tensor parallel and pipeline parallel are the two model-sharding axes; expert parallel sits on the MoE side; FSDP / ZeRO sit on the activation-and-state-sharding side; collectives are the primitives that make all of the above work; mixed precision and recompute are cross-cutting; 3D / 4D composition closes the module by showing how a real frontier recipe combines everything.

### `02-distributed.mdx` — Landing

~3–5k words. Module orientation. Dependency map across the 8 content chapters. Notation conventions specific to this module ($P$ for total parallel rank count, $W$ for world size, $G$ for group sizes per dim, $M$ for micro-batch, $\mu$ for gradient-accumulation steps). Reader profiles: training engineer at a small lab vs research scientist at a frontier lab vs evaluator. Success criteria.

### `02a-data-parallel.mdx` — Data parallelism

~5–7k words. Replicate the model, shard the batch. PyTorch DDP semantics. AllReduce over gradients at the end of each backward pass. Gradient accumulation as a "virtual batch size" multiplier — when to use, the AdamW-momentum subtlety from `01e`. The weak-vs-strong scaling distinction; why frontier labs care about weak scaling. AllReduce bandwidth analysis: ring reduce, recursive halving, NCCL's tree algorithm. A worked example with concrete numbers for a 7B model on 64 H100s.

### `02b-tensor-parallel.mdx` — Tensor parallelism

~6–8k words. Megatron-LM (Shoeybi et al., 2019; Korthikanti et al., 2022) as the canonical reference. The Q/K/V/Output projection split for MHA. The MLP column-then-row split. Why tensor parallel is bandwidth-bound by *both* AllReduces per layer (forward + backward). Sequence-parallel optimization (Korthikanti et al.): how to remove the redundant LayerNorm by treating the residual stream as sequence-sharded. Context parallel for very long sequences. Worked example: TP=8 for a 70B model with concrete activation-memory numbers and AllReduce traffic per token.

### `02c-pipeline-parallel.mdx` — Pipeline parallelism

~6–8k words. GPipe (Huang et al., 2018), PipeDream / 1F1B (Narayanan et al., 2019), interleaved 1F1B (Megatron-LM), DeepSeek-V3's DualPipe, Llama-3's pipeline schedule. The bubble time as $(p - 1)/m$ where $p$ is the pipeline depth and $m$ is the micro-batch count. Activation memory tradeoff: storing activations per micro-batch vs recomputing. Pipeline scheduling diagrams. Worked example: PP=8 with micro-batch 16 for a 70B model.

### `02d-expert-parallel.mdx` — Expert parallelism

~5–7k words. MoE-specific parallelism: route tokens across experts that live on different ranks. AlltoAll dispatch + AlltoAll combine. The DeepSeek-V3 expert-parallel recipe (EP=8, 256 experts, node-limited routing to bound the AlltoAll). DeepSpeed-MoE and Tutel. The capacity-factor interaction with EP. Worked example: EP=8 routing for a 600B-active-37B MoE with concrete AlltoAll traffic.

### `02e-fsdp-and-zero.mdx` — FSDP and ZeRO

~6–8k words. ZeRO-1 (Rajbhandari et al., 2019) — partition optimiser states. ZeRO-2 — also partition gradients. ZeRO-3 — also partition parameters. PyTorch's FSDP-1 vs FSDP-2 (2024 rewrite for DTensor + per-parameter sharding). When ZeRO-3 beats tensor parallel and when it doesn't. AllGather on the forward path; ReduceScatter on the backward path; comparison to the AllReduce of plain DDP. Hybrid sharding (FSDP within a node, DDP across nodes). Worked example: FSDP-2 on a 70B model with concrete state-sharded memory budget.

### `02f-collectives-and-overlap.mdx` — NCCL primitives and communication overlap

~5–7k words. AllReduce, AllGather, ReduceScatter, Broadcast, AlltoAll. The bandwidth-vs-latency tradeoff (small messages are latency-bound; large messages are bandwidth-bound). NCCL's algorithm selection (ring for bandwidth, tree for latency). Communication-computation overlap: prefetching the next layer's parameters during the current layer's backward, the prefetch-depth knob in FSDP. Communication-bound vs compute-bound regimes. The arithmetic intensity floor below which a stage is communication-bound. Megatron-LM's communication-overlap tricks. A worked example: estimating whether a given TP=8 layer is compute- or comm-bound on H100 NVLink.

### `02g-mixed-precision-and-recompute.mdx` — Mixed precision and gradient checkpointing

~5–7k words. BF16 vs FP16 (the dynamic-range argument). FP32 master weights and the AdamW state. Loss scaling for FP16; not needed for BF16. The FP8 cross-references to `01h` for block scaling, MXFP8, NVFP4. Gradient checkpointing math: trade $\Theta(L)$ activation memory for one extra forward pass per checkpoint. Selective recompute (Korthikanti 2022): only recompute the attention block, keep the MLP activations. Sequence-parallel recompute. Worked example: memory and time impact of full-recompute vs selective-recompute for a 70B model.

### `02h-3d-4d-composition.mdx` — 3D / 4D parallelism composition

~6–8k words. The canonical 3D mix: DP × TP × PP. Llama-3 405B's 4D mix: adds context parallel (CP) for the long-context phase. DeepSeek-V3's mix: DP × EP × PP. The DP / TP / PP / EP / CP / SP axes and how they compose. The communication-memory-compute Pareto frontier and where current frontier labs sit. Choosing the configuration: how to think about TP-vs-FSDP-3 (both shard parameters but along different axes), DP-vs-PP (when does PP help), EP-vs-not-EP (Mixtral vs Llama). Verbatim configuration tables from Llama-3, DeepSeek-V3, Llama-4, OLMo-2. Worked example: derive a 4D config for a 70B run on 512 H100s.

## 5 — MDX components

No new components needed. Reuse from prereqs + Module 1. Probably need 2 new figure components (in `web/src/components/mdx/figures/`):

- **`TensorParallelSplit`** — schematic of the MHA Q/K/V split across 4 TP ranks, used in `02b`.
- **`PipelineScheduleDiagram`** — bubble-time chart for 1F1B and DualPipe, used in `02c`.

Both are static SVG, decided in Phase 1 or Phase 4.

## 6 — Voice & style

Inherits Module 1 §6 unchanged. Hull / Goodfellow / Bishop register; no marketing; cite primary sources; hedge where labs don't disclose; worked examples are concrete numbers.

## 7 — Currency

Calibrated to May 14 2026. Pipeline-parallelism is a fast-moving area (DualPipe is December 2024; many 2025 follow-ups). FP8 details (from `01h`) intersect here.

## 8 — Agent dispatch plan

Identical to Module 1's pattern: 8 parallel research agents → 8 parallel writing agents → integration + visualization.

## 9 — Risks & mitigations

- **Closed-frontier configurations are partly inferred.** OpenAI, Anthropic, Google internal recipes mostly undisclosed. Mark "inferred from API throughput / pricing / blog posts" where applicable.
- **NCCL implementation details age fast.** Cite the NCCL release version of each behavioural claim.
- **FSDP-1 → FSDP-2 transition still in progress.** Cite the PyTorch versions explicitly.

## 10 — Success criteria

A reader who finishes the module should be able to:
1. Read any 2024–2026 frontier "training infrastructure" section and identify the DP/TP/PP/EP/FSDP/CP rank assignments.
2. Compute the activation memory of one transformer block under a given parallel config.
3. Predict whether a given TP rank is communication- or compute-bound on a given interconnect.
4. Design a 3D/4D config for a hypothetical model + hardware envelope.
5. Distinguish FSDP-2 from FSDP-1 + ZeRO-3 in design and engineering implications.

## 11 — Non-goals

Same as Module 1: no inference-side parallelism (lives in Module 4); no hardware specifics; no compiler details.
