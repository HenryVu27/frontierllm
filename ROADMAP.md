# Roadmap

Thin index across all topics. Update the status line as you progress.

**Reading-list format:** `N items / M done` per topic.

## Notes

- `00-foundations/` — reading list, with synthesis now in textbook module at `/textbook` — *bibliography only*
- `01-pretraining/` — scaling laws, data, modern arch, optimization stability, mid-training, long context — *0/17 done*
- `02-post-training/` — SFT, distillation, instruction tuning, synthetic data — *0/11 done*
- `03-rlhf-and-rl/` — RM training, PPO, DPO family, RLAIF, RLVR, online vs offline — *0/16 done*
- `04-distributed-training/` — DP/TP/PP/SP/EP, ZeRO, FSDP, Megatron 3D, FP8 — *0/14 done*
- `05-eval-and-benchmarks/` — benchmark families, contamination, eval design — *0/13 done*
- `06-alignment-and-interp/` — mech interp, SAEs, scalable oversight, red-teaming — *0/12 done*
- `07-frontier-labs/` — frontier model reports, comparative analysis — *orientation pass: not started*

## Textbook

Polished MDX chapters rendered at `/textbook`, synthesised from primary sources.

- `00-prerequisites` — landing/orientation page — *shipped 2026-05-11*
- `00a-transformer` — residual stream, attention math, MLP, pre-norm, FLOPs — *shipped 2026-05-11*
- `00b-attention-variants` — MHA/MQA/GQA/MLA, sliding-window, FlashAttention, SSM hybrids — *shipped 2026-05-11*
- `00c-positional-encodings` — sinusoidal, ALiBi, RoPE, YaRN/LongRoPE — *shipped 2026-05-11*
- `00d-normalization-and-init` — RMSNorm, QK-norm, Peri-LN/HybridNorm, μP — *shipped 2026-05-11*
- `00e-activations-and-gating` — ReLU/GELU/SiLU, GLU family, SwiGLU, 2/3 width — *shipped 2026-05-11*
- `00f-optimizers` — Adam/AdamW/Lion/Muon/Shampoo, WSD schedules — *shipped 2026-05-11*
- `00g-tokenization-and-objectives` — BPE/SentencePiece, embeddings, CLM/FIM/MTP — *shipped 2026-05-11*
- `00h-moe-plumbing` — routing, aux losses, capacity, frontier MoE landscape — *shipped 2026-05-11*
- `01-pretraining` — landing/orientation page — *shipped 2026-05-12*
- `01a-data-pipeline` — sources, extraction, filtering, dedup, multilingual — *shipped 2026-05-11*
- `01b-tokenizer-training` — vocab-size scaling laws, fertility, glitch-token prevention — *shipped 2026-05-11*
- `01c-scaling-laws` — Kaplan → Chinchilla → Besiroglu/Porian → inference-aware overtraining — *shipped 2026-05-11*
- `01d-mup-and-transfer` — μP, hyperparameter transfer, Kosson 2025 challenge — *shipped 2026-05-11*
- `01e-schedules-and-batch` — warmup-cosine, WSD, critical batch size, batch ramp — *shipped 2026-05-11*
- `01f-data-curriculum` — DoReMi, RegMix, Data Mixing Laws, multilingual temperature — *shipped 2026-05-11*
- `01g-long-context` — ABF / YaRN / LongRoPE / iRoPE staged extension — *shipped 2026-05-11*
- `01h-annealing-and-stability` — midtraining, FP8 (DeepSeek-V3, MXFP8, NVFP4), spike control — *shipped 2026-05-11*
- `02-distributed` — landing/orientation page — *shipped 2026-05-14*
- `02a-data-parallel` — DDP, gradient bucketing, AllReduce bandwidth — *shipped 2026-05-14*
- `02b-tensor-parallel` — Megatron split, sequence parallel, context parallel — *shipped 2026-05-14*
- `02c-pipeline-parallel` — GPipe, 1F1B, interleaved, DualPipe, zero-bubble — *shipped 2026-05-14*
- `02d-expert-parallel` — AlltoAll dispatch/combine, node-limited routing — *shipped 2026-05-14*
- `02e-fsdp-and-zero` — ZeRO-1/2/3, FSDP-1/2, hybrid sharding — *shipped 2026-05-14*
- `02f-collectives-and-overlap` — NCCL primitives, SHARP, intensity floor — *shipped 2026-05-14*
- `02g-mixed-precision-and-recompute` — BF16/FP16/FP8, selective recompute — *shipped 2026-05-14*
- `02h-3d-4d-composition` — DP × TP × PP × EP × CP frontier configs — *shipped 2026-05-14*
- *(future)* post-training / inference / eval / alignment / frontier-labs textbook modules — *not started*

## Projects

- `01-pretrain-end-to-end/` — *not started* (scoped, plan TBD)
- `02-post-train-end-to-end/` — *not started* (scoped, plan TBD)
- `03-eval-and-interp/` — *not started* (scoped, plan TBD)

## Active activity

**Orientation pass** — read 6 recent frontier model reports, populate `notes/07-frontier-labs/00-orientation.md`. See that file for the target list and template.

## Reading list refresh

Reading lists are curated to ~5-10+ items per topic but get stale every 3-6 months. Refresh dates per topic:

- `00-foundations`: 2026-04-25 (initial); superseded by textbook module 2026-05-11
- `01-pretraining`: 2026-04-25 (initial)
- `02-post-training`: 2026-04-25 (initial)
- `03-rlhf-and-rl`: 2026-04-25 (initial)
- `04-distributed-training`: 2026-04-25 (initial)
- `05-eval-and-benchmarks`: 2026-04-25 (initial)
- `06-alignment-and-interp`: 2026-04-25 (initial)
- `07-frontier-labs`: 2026-04-25 (initial)
