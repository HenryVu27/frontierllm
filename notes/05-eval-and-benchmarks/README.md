# 05 — Evaluation and benchmarks

## What this is

How frontier labs measure progress. Benchmark families, contamination handling, eval design pitfalls, capability surfaces, and the bigger question of how to evaluate things that have outgrown most public benchmarks.

This topic is closely tied to `06-alignment-and-interp/` — benchmarks that measure "is the model dangerous" / "is the model deceptive" overlap with both.

## Reading list

**Benchmark families:**
- [ ] **MMLU: Measuring Massive Multitask Language Understanding** (Hendrycks et al, 2020) — knowledge benchmark; near-saturated for frontier models, instructive history.
- [ ] **BIG-Bench** (Srivastava et al, 2022) — early diversity benchmark; useful for thinking about coverage.
- [ ] **HumanEval / MBPP** (Chen et al, 2021) — code; canonical and now over-saturated.
- [ ] **GSM8K / MATH** (Cobbe et al, 2021 / Hendrycks et al, 2021) — math reasoning; the latter is now the meaningful one.
- [ ] **GPQA: Graduate-Level Google-Proof Q&A** (Rein et al, 2023) — current hard knowledge benchmark.
- [ ] **SWE-bench** (Jimenez et al, 2023) — agentic coding from real GitHub issues.
- [ ] **ARC-AGI** (Chollet, 2019; v2 2024) — out-of-distribution reasoning. Currently an open frontier.

**Contamination and methodology:**
- [ ] **Detecting Pretraining Data from Large Language Models** (Shi et al, 2023) — Min-K%-Prob method.
- [ ] **A Survey on Data Contamination for Large Language Models** (any 2024 survey).

**Eval design:**
- [ ] **Holistic Evaluation of Language Models (HELM)** (Liang et al, 2022) — multi-axis evaluation framework.
- [ ] **Are Emergent Abilities of Large Language Models a Mirage?** (Schaeffer et al, 2023) — eval-metric-driven "emergence."
- [ ] **Chatbot Arena** (lmsys, ongoing) — pairwise human preference; how to read the leaderboard.

**Frontier-specific:**
- [ ] **GAIA** (Mialon et al, 2023) — agentic eval. Pair with reading on METR / OpenAI Preparedness Framework / Anthropic RSP capability evals.

Order: benchmark families → contamination → eval design → frontier-specific.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- `projects/03-eval-and-interp/` — milestone project: build / fork an eval harness, run on the user-trained models.
- External: `lm-evaluation-harness` (EleutherAI), `inspect_ai` (UK AISI). Read `lm-evaluation-harness` source.
