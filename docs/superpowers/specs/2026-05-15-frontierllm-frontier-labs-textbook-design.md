# Design — frontierllm frontier-labs textbook module

**Date:** 2026-05-15
**Status:** Draft, executing autonomously
**Predecessors:** Modules 0, 1, 2, 3, 4, 5 shipped.

## 1 — Motivation

Modules 0–5 cover the *methods* of frontier-LLM construction. This module covers the *artefacts*: a comparative survey of the 2024–2026 frontier-model families (OpenAI o-series + GPT-5, Anthropic Claude 4.x, Google DeepMind Gemini 2.5 / 3, Meta Llama 4, DeepSeek V3 / R1 / R2, Alibaba Qwen3, Mistral / Magistral, Moonshot Kimi K2). Each chapter is the "what they actually did" deep dive that ties Modules 0–5 to real systems.

After this module, a reader can read any frontier-lab technical report or tech blog and locate every engineering decision in the taxonomy built across Modules 1–5: pretraining recipe, post-training recipe, parallelism strategy, inference deployment, eval/safety posture.

## 2 — Scope

In scope: published architecture, training recipes, data disclosures (when present), post-training pipelines, inference engineering, eval protocols, safety posture (RSP / Preparedness / FSF), and headline benchmark numbers — as disclosed by each lab through May 15, 2026.

Out of scope: rumours, leaked information not confirmed by the labs, methodology already covered in Modules 0–5 (which is cross-referenced instead).

## 3 — File layout

```
web/content/textbook/
  06-frontier-labs.mdx          # landing
  06a-openai.mdx                # o-series, GPT-5, Operator
  06b-anthropic.mdx             # Claude 3.5/3.7 → Claude 4 family, Sonnet 4.6, Opus 4.7
  06c-google-deepmind.mdx       # Gemini 2.0/2.5/3, Gemma
  06d-meta-llama.mdx            # Llama 3.1/3.3 → Llama 4 family
  06e-deepseek.mdx              # DeepSeek-V2 / V3 / R1, DualPipe, MLA economics
  06f-qwen-alibaba.mdx          # Qwen2.5 / Qwen3, hybrid reasoning
  06g-mistral-others.mdx        # Mistral, Cohere Command-R, Inflection, AI21
  06h-china-frontier.mdx        # Kimi K2, Moonshot, Yi, Baichuan, Zhipu GLM-4.5
```

Orders 54–62, chapters 54–62 (landing 54).

## 4 — Chapter list (compact)

- `06-frontier-labs.mdx` — Landing (~3-5k). Orientation: how to read a tech report, the disclosure-tier hierarchy (full tech report → blog → marketing), the 2024-2026 frontier landscape map.
- `06a-openai.mdx` — OpenAI (~6-8k). o1 / o3 / o4-mini reasoning models, GPT-4o → GPT-4.5 / Orion → GPT-5, the multimodal stack, Operator + Computer Use, Preparedness Framework, the deliberative-alignment paper, public-facing eval disclosures (HLE, ARC-AGI).
- `06b-anthropic.mdx` — Anthropic (~6-8k). Claude 3, 3.5 Sonnet / Haiku / Opus, Claude 3.7 / 4 / 4.5 / 4.6 / 4.7, RSP and ASL levels, Constitutional AI lineage, Sleeper Agents / Alignment Faking interpretability program, Computer Use, agentic SWE-bench numbers, MCP.
- `06c-google-deepmind.mdx` — Google DeepMind (~6-8k). Gemini 1.5 (10M context, MoE), Gemini 2.0 / 2.5 Pro, Gemini 3.0, Gemma 2 / 3, Veo / Imagen multimodal, FSF (Frontier Safety Framework), iRoPE, MoE scaling, AlphaProof / AlphaGeometry, Gemini Robotics.
- `06d-meta-llama.mdx` — Meta Llama (~5-7k). Llama 3 / 3.1 / 3.3, Llama 4 Scout / Maverick / Behemoth, dense + MoE strategy, the open-weights release pattern, BF16 vs FP8 training disclosures, the 405B post-training pipeline, Code Llama, NLLB.
- `06e-deepseek.mdx` — DeepSeek (~6-8k). The DeepSeek-V2 → V3 → R1 lineage, MLA, DeepSeek-MoE, DualPipe (cross-ref Module 2), the FP8 training recipe, R1's GRPO + cold-start formula, the V3.2 hybrid sparse attention, the inference deployment with wide-EP, the export-control narrative.
- `06f-qwen-alibaba.mdx` — Qwen (~5-7k). Qwen2 / Qwen2.5 / Qwen3, the hybrid reasoning / non-reasoning toggle, Qwen-VL, Qwen2.5-Math, the open-weights release cadence, post-training recipes (Tülu-3 style), QwQ-32B.
- `06g-mistral-others.mdx` — Other Western labs (~4-6k). Mistral 7B / 8×7B / Large / Codestral / Magistral, Cohere Command-R / R+, Inflection Pi, AI21 Jamba (SSM hybrid), xAI Grok-3 / 4.
- `06h-china-frontier.mdx` — Other Chinese labs (~5-7k). Moonshot Kimi K1.5 / K2, Zhipu GLM-4 / 4.5, 01.AI Yi, Baichuan, Tencent Hunyuan, MiniMax M1 (RWKV-hybrid).

## 5 — Voice / currency / dispatch

Same pattern. Calibrated to **May 15, 2026** disclosures only — no leaks, no rumours.

Haiku research agents (15-call cap each, prioritised on lab tech reports + verified blog posts). Haiku writers throughout (this is fact-aggregation, not derivation-heavy).

## 6 — Success criteria

Reader can: read any frontier-lab tech report and locate the pretraining recipe, post-training recipe, parallelism strategy, inference deployment, and safety posture inside the taxonomy from Modules 1–5. Reader can map "DeepSeek-V3 used DualPipe + FP8 + auxiliary-loss-free MoE" to specific sections in Modules 2 and 1.

## 7 — Linking conventions

Every claim about a method (MLA, DualPipe, DPO, FSF, etc.) cross-references the chapter in Modules 0–5 that explains it. Module 6 is the "case study" volume — it does not re-derive.
