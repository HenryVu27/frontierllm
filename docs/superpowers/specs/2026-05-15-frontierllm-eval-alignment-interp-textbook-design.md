# Design — frontierllm eval + alignment + interpretability textbook module

**Date:** 2026-05-15
**Status:** Draft, executing autonomously
**Predecessors:** Modules 0, 1, 2, 3, 4 shipped.

## 1 — Motivation

Modules 0–4 cover the *building* of frontier LLMs. This module covers the *measurement* and *understanding* of them: evaluation methodology, alignment techniques beyond RL, mechanistic interpretability, and red-teaming.

After this module a reader can read any 2024–2026 eval / alignment / interp publication and understand the methods: how a benchmark is contamination-checked, what an SAE feature is, how circuit analysis works, what a scalable-oversight protocol promises.

## 2 — Scope

In scope: benchmark families, contamination, capability elicitation, LMSYS Arena methodology, SAEs, circuit-level analysis, scalable oversight, red-teaming, jailbreaks, deceptive-alignment evals.

Out of scope: post-training RL techniques (Module 3); model architecture (Modules 0-1); serving (Module 4).

## 3 — File layout

```
web/content/textbook/
  05-eval-alignment-interp.mdx   # landing
  05a-benchmarks.mdx
  05b-contamination.mdx
  05c-arena-elo.mdx
  05d-saes.mdx
  05e-circuit-analysis.mdx
  05f-scalable-oversight.mdx
  05g-red-teaming.mdx
  05h-deceptive-alignment-evals.mdx
```

Orders 45–53, chapters 45–53 (landing 45).

## 4 — Chapter list (compact)

- `05-eval-alignment-interp.mdx` — Landing (~3-5k). Orientation.
- `05a-benchmarks.mdx` — Benchmark families (~5-7k). MMLU, GPQA, MATH, HumanEval, SWE-bench, AIME, ARC-AGI-2, the saturation problem, the 2024-2026 reasoning benchmarks (FrontierMath, HLE).
- `05b-contamination.mdx` — Test-set contamination (~5-7k). N-gram overlap (Module 1 §01a refresher), embedding-based detection, the LessWrong canon, Carlini 2023, dynamic / private benchmarks (LiveBench).
- `05c-arena-elo.mdx` — LMSYS Arena & ELO (~4-6k). Pairwise preference + Bradley-Terry-Luce, the Chatbot Arena methodology, style-controlled ELO, the "arena hacking" debate.
- `05d-saes.mdx` — Sparse autoencoders (~6-8k). Anthropic Towards Monosemanticity (Bricken 2023), Scaling Monosemanticity (Templeton 2024), Gemma-Scope (Lieberum 2024), TopK / JumpReLU / BatchTopK SAEs, the OpenAI / Anthropic / DeepMind feature catalogues.
- `05e-circuit-analysis.mdx` — Circuit analysis (~6-8k). Induction heads (Olsson 2022), the IOI circuit (Wang 2022), function vectors, attribution patching, transcoders, the 2024-2026 attribution-graph and feature-circuit work (Marks 2024, Lindsey 2024).
- `05f-scalable-oversight.mdx` — Scalable oversight (~5-7k). Debate (Irving 2018), iterative amplification, weak-to-strong generalization (Burns 2023), deliberative alignment (Guan 2024 OpenAI), Constitutional AI cross-ref.
- `05g-red-teaming.mdx` — Red-teaming and jailbreaks (~5-7k). Automated red-teaming (Perez 2022), GCG attacks (Zou 2023), PAIR (Chao 2023), the Anthropic responsible-disclosure pattern, evaluation benchmarks (HarmBench, JailbreakBench).
- `05h-deceptive-alignment-evals.mdx` — Deceptive alignment + sleeper-agent evals (~5-7k). Sleeper Agents (Hubinger 2024), Alignment Faking (Greenblatt 2024 Anthropic), scheming-evaluation framework (Hubinger 2025), agentic-misalignment benchmarks.

## 5 — Voice / currency / dispatch

Same pattern. Haiku research agents (15 calls cap each). Haiku writers for most, Sonnet for the math-heavy SAE/circuits chapters.

## 6 — Success criteria

Reader can: read a contamination disclosure and judge whether the score is trustworthy; identify SAE features and circuits in a published interp paper; design a red-team protocol; argue about scalable oversight tradeoffs.
