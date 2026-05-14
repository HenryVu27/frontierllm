# Design — frontierllm post-training + reasoning textbook module

**Date:** 2026-05-14
**Author:** Henry (with Claude as drafting agent)
**Status:** Draft, executing autonomously
**Predecessors:** Modules 0, 1, 2 shipped.

---

## 1 — Motivation

Modules 0–2 cover the architecture, pretraining recipe, and infrastructure of frontier model training. They stop at the point a *base* model is handed off to a post-training team. This module covers what happens after: supervised fine-tuning, preference tuning, RLHF, RLAIF, RLVR, reasoning RL (o1 / R1 / GRPO), process rewards, and the agentic post-training that shapes 2024-2026 frontier deployments.

After this module a reader can read the post-training section of a frontier tech report — Llama-3 SFT recipe, DeepSeek-R1's GRPO derivation, Anthropic's Constitutional AI, OpenAI's o-series cards, Tülu-3, OLMo-2-Instruct, Qwen-3-Thinking — and understand each engineering decision: which loss objective, which reward function, which data-collection protocol, which RL infrastructure.

## 2 — Scope

### In scope

- Eight chapter MDX files plus landing at `web/content/textbook/03-*`.
- Reuse pipeline + components.
- Currency anchored to May 14 2026.
- Four-phase agent dispatch.

### Out of scope

- Production deployment / serving (Module 4).
- Evaluation methodology (Module 5; touched in passing).
- Interpretability and alignment beyond the RL-side techniques (Module 5).

## 3 — Architecture

Reuse existing pipeline. Only content added.

### File layout

```
web/content/textbook/
  03-post-training.mdx        # landing
  03a-sft.mdx                 # supervised fine-tuning
  03b-preference-tuning.mdx   # DPO/IPO/KTO/SimPO/ORPO
  03c-rlhf.mdx                # RLHF, PPO, reward modeling
  03d-rlaif-constitutional.mdx # RLAIF + Constitutional AI
  03e-rlvr.mdx                # RL with verifiable rewards
  03f-reasoning-rl.mdx        # o1 / R1 / GRPO
  03g-process-rewards.mdx     # PRM, step-level supervision
  03h-tool-use-and-agents.mdx # agentic post-training
```

Orders 28-36, chapters 27-35 (landing 27).

## 4 — Chapter list

### `03-post-training.mdx` — Landing (~3-5k)

Module orientation. Phase boundaries: SFT → preference → RL → reasoning → agentic. Notation. Reading orders.

### `03a-sft.mdx` — Supervised fine-tuning (~5-7k)

Data curation: human, synthetic, distilled. The "1k vs 1M examples" debate (LIMA, Tülu). Loss masking. Multi-turn templates. Tülu-3, OLMo-2-Instruct, Llama-3-Instruct recipes verbatim.

### `03b-preference-tuning.mdx` — Preference tuning (~6-8k)

DPO (Rafailov 2023, derivation). IPO (Azar 2023). KTO (Ethayarajh 2024). SimPO (Meng 2024). ORPO (Hong 2024). β hyperparameter. The "what DPO is actually optimizing" geometry. Mistral, Tülu-3, Llama-3 preference-tuning recipes.

### `03c-rlhf.mdx` — RLHF (~6-8k)

Reward modeling. The Bradley-Terry preference model. PPO at LLM scale: clipping, KL penalty, reference model, value head. The InstructGPT pipeline. Reward hacking. Llama-2 RLHF, Tülu-3 PPO.

### `03d-rlaif-constitutional.mdx` — RLAIF + Constitutional AI (~5-7k)

Bai et al. 2022 (Constitutional AI). RLAIF (Lee et al. 2023). The judge-LLM-as-rewarder pattern. Self-critique chains. Anthropic's Claude-3/4 alignment recipe.

### `03e-rlvr.mdx` — RL with verifiable rewards (~5-7k)

The verifier-as-reward pattern. Math (verified by symbolic check). Code (verified by unit test). Tool-call grounding. Tülu-3-RLVR. OpenAI o-series RLVR. DeepSeek-R1 cold-start vs RL-only.

### `03f-reasoning-rl.mdx` — Reasoning RL (o1 / R1 / GRPO) (~6-8k)

The keystone reasoning-RL chapter. GRPO (Group Relative Policy Optimization, DeepSeek-R1 paper). Process supervision vs outcome supervision. Long-chain-of-thought emergence. Aha moments. The o1-vs-R1 distillation story. Test-time compute scaling. Qwen-3-Thinking.

### `03g-process-rewards.mdx` — Process reward models (~5-7k)

PRM (Lightman et al. 2023, Let's Verify Step by Step). PRM800K. Step-level supervision. Outcome-vs-process tradeoff. Math-Shepherd, ReST-MCTS, ProcessBench.

### `03h-tool-use-and-agents.mdx` — Agentic post-training (~5-7k)

Tool-call SFT data construction. ReAct, Toolformer. Function-calling fine-tuning. Browser-use, code-execution-use. Multi-step agent SFT. The 2025-2026 agentic-RL recipes: SWE-RL, AgentR1.

## 5 — MDX components

Reuse from prior modules. Maybe new figure: PPO/GRPO computation graph; reasoning trace timeline.

## 6 — Voice & style

Inherits Module 1 §6. Special hedging: closed-frontier (OpenAI o-series, Anthropic Claude post-training, Gemini) mostly inferred; mark explicitly.

## 7 — Currency

May 14 2026. Reasoning-RL is *the* fastest-moving area in frontier work; comparison tables will age within months.

## 8 — Agent dispatch plan

8 parallel research agents → 8 parallel writers → integration. Same pattern as Modules 1-2.

## 9 — Risks

- Reasoning-RL recipes (GRPO derivation, o1 inferred details) ageing fast.
- Closed-frontier disclosure gap larger than in pretraining (post-training is the moat).

## 10 — Success criteria

A reader who finishes the module should be able to:
1. Read any 2024-2026 frontier post-training disclosure and identify the SFT → preference → RL pipeline stage.
2. Derive the DPO loss from the RLHF objective.
3. Reproduce a GRPO derivation from the policy gradient.
4. Compare PRM vs ORM tradeoffs concretely.
5. Design a verifier-reward function for a custom domain.

## 11 — Non-goals

No serving (Module 4). No evaluation methodology (Module 5). No mechanistic interpretability (Module 5).
