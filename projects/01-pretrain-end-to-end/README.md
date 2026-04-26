# Project 01 — Pretrain End-to-End

> **Status:** Scoped, no code yet. When ready to start, run the writing-plans skill against this README to produce a detailed implementation plan.

## Goal

Build the full pretraining stack on a small-but-real model. Single-GPU baseline → rented multi-GPU run. Anchor the topics in `notes/01-pretraining/` and `notes/04-distributed-training/`.

## Deliverables

- **Data pipeline:** download a slice of FineWeb-Edu or SlimPajama; dedup; quality-filter; tokenize; shard into mmap files
- **Custom tokenizer:** train a BPE tokenizer on the data; compare to GPT-2's
- **Modern transformer architecture:** RoPE, GQA, SwiGLU, RMSNorm. Reuse primitives from `tiny-llm/` where applicable
- **Four sizes** of the same recipe (e.g., 25M / 80M / 250M / 500M params) on a fixed token budget
- **Scaling-law fit:** Chinchilla-style curve fit; predict the loss of a held-out larger size and verify
- **Stability experiments:** μP vs standard parameterization, lr sweeps, written analysis of any loss spikes encountered
- **Cloud rental phase:** 500M run distributed via FSDP + activation checkpointing on rented 4× H100
- **FP8 training attempt:** using `torchao` or `transformer-engine`
- **Mid-training anneal:** small curriculum / data-mix change with lr cooldown at the end

## Constraints

- **Hardware:** RTX 5080 (16GB) for single-GPU work; rented cloud (Lambda / RunPod / Modal) for distributed runs.
- **Budget:** the implementation plan must include a cost ceiling for cloud rental.
- **Reuse where possible:** lift modern-transformer primitives from `tiny-llm/`. Don't re-implement what's already done.

## Phase plan (rough)

1. **Phase 1:** Data pipeline + tokenizer training, single GPU.
2. **Phase 2:** Single-GPU training loop; smallest size end-to-end.
3. **Phase 3:** Add μP, lr sweep, four-size scaling-law sweep on the 5080.
4. **Phase 4:** Distributed training infrastructure (FSDP) — first locally simulated, then on rented cloud.
5. **Phase 5:** FP8 training attempt + mid-training anneal experiment.
6. **Phase 6:** Writeup, plots, scaling-law analysis.

## Out of scope

- Inference / serving (covered by `tiny-llm/` and `InferenceEngineering/`).
- Going past ~500M parameters.
- Multi-trillion-parameter MoE (read papers, don't reproduce).

## When to start

After at least one pass through `notes/01-pretraining/` and `notes/04-distributed-training/`. The orientation pass at `notes/07-frontier-labs/00-orientation.md` should also be complete.

## Connection to other projects

- **Outputs the base model** that Project 02 (post-training) takes as input.
- **Outputs the 4-size sweep** that Project 03 (eval-and-interp) uses to plot capability emergence across scale.

## References

- `notes/01-pretraining/` — reading list for this project.
- `notes/04-distributed-training/` — reading list for the distributed phase.
- `tiny-llm/src/` — reusable primitives (attention, RoPE, GQA, RMSNorm).
