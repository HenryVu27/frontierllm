# 04 — Distributed training

## What this is

How frontier labs train models across thousands of GPUs. Parallelism dimensions, sharding strategies, mixed precision, communication patterns, and the practical engineering that makes a multi-trillion-token training run not crash on day 4.

You're inference-savvy already (`InferenceEngineering` repo with FP4/FP8 kernels). This topic is the *training-side* counterpart: different bottlenecks, different precision regimes, much harder fault tolerance.

## Reading list

**Parallelism fundamentals:**
- [ ] **Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism** (Shoeybi et al, 2019) — tensor parallelism (TP). Foundational.
- [ ] **Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM** (Narayanan et al, 2021) — 3D parallelism (TP × PP × DP). Reference paper for the topology.
- [ ] **GPipe / PipeDream** — pipeline parallelism (PP) origins. Skim either.
- [ ] **Reducing Activation Recomputation in Large Transformer Models** (Korthikanti et al, 2022) — sequence parallelism + selective activation checkpointing.

**ZeRO and FSDP:**
- [ ] **ZeRO: Memory Optimizations Toward Training Trillion Parameter Models** (Rajbhandari et al, 2019) — ZeRO 1/2/3 derivation. Read carefully — the rest of FSDP is built on this.
- [ ] **PyTorch FSDP** (Zhao et al, 2023) — modern FSDP design and usage.
- [ ] **FSDP2** (PyTorch blog, 2024) — per-parameter sharding; improvements over FSDP1.

**Mixed precision and FP8:**
- [ ] **Mixed Precision Training** (Micikevicius et al, 2017) — FP16 with loss scaling.
- [ ] **FP8 Formats for Deep Learning** (Micikevicius et al, NVIDIA, 2022) — E4M3 / E5M2.
- [ ] **Transformer Engine documentation** (NVIDIA) — practical FP8 usage; read the technical blog posts.
- [ ] **DeepSeek-V3 Technical Report** (2024) — section on FP8 training in production at scale.

**Open codebases (read the code):**
- [ ] `torchtitan` (PyTorch) — modern, FSDP2 + 2D parallelism, clean reference.
- [ ] `nanotron` (HuggingFace) — readable 3D parallelism implementation.
- [ ] `Megatron-LM` (NVIDIA) — the canonical complex one. Read selectively.

Order: parallelism fundamentals → ZeRO/FSDP → mixed precision → codebase reading.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- `projects/01-pretrain-end-to-end/` — FSDP run on rented 4× H100. FP8 training attempt with `torchao` / `transformer-engine`.
