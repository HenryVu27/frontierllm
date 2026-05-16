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
- `03-post-training` — landing/orientation page — *shipped 2026-05-15*
- `03a-sft` — supervised fine-tuning, LIMA vs Tülu-3, loss masking — *shipped 2026-05-14*
- `03b-preference-tuning` — DPO derivation, IPO/KTO/SimPO/ORPO — *shipped 2026-05-14*
- `03c-rlhf` — Bradley-Terry RM, PPO at LLM scale, reward hacking — *shipped 2026-05-14*
- `03d-rlaif-constitutional` — Constitutional AI, RLAIF judges, failure modes — *shipped 2026-05-14*
- `03e-rlvr` — verifier rewards, math/code/tool verifiers — *shipped 2026-05-14*
- `03f-reasoning-rl` — GRPO derivation, R1 recipe, long-CoT, test-time compute — *shipped 2026-05-14*
- `03g-process-rewards` — PRM vs ORM, PRM800K, ProcessBench, R1 indictment — *shipped 2026-05-14*
- `03h-tool-use-and-agents` — tool-call SFT, ReAct, Computer Use, SWE-RL — *shipped 2026-05-14*
- `04-inference` — landing/orientation page — *shipped 2026-05-15*
- `04a-kv-cache` — KV memory math, paged attention, H2O / StreamingLLM / SnapKV / KIVI — *shipped 2026-05-15*
- `04b-decoding-strategies` — top-p / min-p / DRY / XTC / Mirostat — *shipped 2026-05-15*
- `04c-speculative-decoding` — draft-target, Medusa, EAGLE-1/2/3, Lookahead — *shipped 2026-05-15*
- `04d-continuous-batching` — Orca, vLLM, ragged batching, chunked prefill — *shipped 2026-05-15*
- `04e-quantization` — GPTQ / AWQ / AQLM / HQQ / QuaRot / SpinQuant / MXFP4 — *shipped 2026-05-15*
- `04f-frontier-engines` — vLLM / SGLang / TRT-LLM / TGI / llama.cpp / MLX / LMDeploy — *shipped 2026-05-15*
- `04g-structured-output` — XGrammar / Outlines / OpenAI Structured Outputs — *shipped 2026-05-15*
- `04h-deployment-architecture` — Splitwise / DistServe / Mooncake / wide-EP — *shipped 2026-05-15*
- `05-eval-alignment-interp` — landing/orientation page — *shipped 2026-05-15*
- `05a-benchmarks` — MMLU/GPQA/HLE/SWE-bench/FrontierMath/ARC-AGI-2, saturation crisis — *shipped 2026-05-15*
- `05b-contamination` — N-gram detection, Min-K%, LiveBench, ICML 2025 result — *shipped 2026-05-15*
- `05c-arena-elo` — Bradley-Terry-Luce, Arena-Hard-Auto, Leaderboard Illusion — *shipped 2026-05-15*
- `05d-saes` — Bricken / Templeton / Gemma-Scope, TopK / JumpReLU / BatchTopK / Matryoshka — *shipped 2026-05-15*
- `05e-circuit-analysis` — induction heads, IOI, patching, function vectors, transcoders, attribution graphs — *shipped 2026-05-15*
- `05f-scalable-oversight` — debate, IDA, weak-to-strong, deliberative alignment, sandwiching — *shipped 2026-05-15*
- `05g-red-teaming` — GCG, PAIR, AutoDAN, many-shot, HarmBench, ASL/Preparedness/FSF — *shipped 2026-05-15*
- `05h-deceptive-alignment-evals` — Sleeper Agents, Alignment Faking, Apollo scheming, SAD — *shipped 2026-05-15*
- `06-frontier-labs` — landing/orientation page — *shipped 2026-05-15*
- `06a-openai` — GPT-4 → GPT-5.5, o-series, Operator, Preparedness Framework v2, deliberative alignment — *shipped 2026-05-15*
- `06b-anthropic` — Claude 3 → 4.7, RSP v3.2 + ASL levels, Constitutional AI, Sleeper Agents, Computer Use, MCP — *shipped 2026-05-15*
- `06c-google-deepmind` — Gemini 1.5 → 3.1, Gemma 2/3/4, Veo / Imagen, AlphaProof / AlphaGeometry 2, FSF v3.0, Gemini Robotics — *shipped 2026-05-15*
- `06d-meta-llama` — Llama 3 → 3.3 dense, Llama 4 Scout/Maverick/Behemoth MoE, 405B training recipe, Meta Community License — *shipped 2026-05-15*
- `06e-deepseek` — V2 MLA, V3 (FP8, DualPipe, aux-loss-free MoE), R1 (GRPO + cold-start), V3.2 (DSA), wide-EP inference — *shipped 2026-05-15*
- `06f-qwen-alibaba` — Qwen2 → Qwen2.5 → Qwen3 (235B/480B MoE), hybrid reasoning toggle, QwQ → Qwen3-Thinking, Qwen-VL, Qwen2.5-Math TIR — *shipped 2026-05-15*
- `06g-mistral-others` — Mistral Large 3 / Magistral / Codestral, Cohere Command-A, xAI Grok-4.3, AI21 Jamba SSM-Transformer hybrid — *shipped 2026-05-15*
- `06h-china-frontier` — Moonshot Kimi K2, Zhipu GLM-4.5, 01.AI Yi, Baichuan domain specialists, Tencent Hunyuan, MiniMax M1, iFlytek Spark, ByteDance Doubao — *shipped 2026-05-15*

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
