# 03 — RLHF and RL methods

## What this is

RL-flavored post-training: reward modeling, RLHF (PPO), the preference-optimization family (DPO/IPO/KTO/SimPO/ORPO), RLAIF, Constitutional AI, RL with verifiable rewards (RLVR), and emerging long-horizon / agentic RL.

You already have classical RL background (multi-armed bandits, online primal-dual). This topic is about how that machinery is bent to fit LLMs at scale.

## Reading list

**Foundational:**
- [ ] **Deep Reinforcement Learning from Human Preferences** (Christiano et al, 2017) — the original RLHF setup.
- [ ] **InstructGPT** (Ouyang et al, 2022) — the canonical SFT → RM → PPO pipeline at scale (also referenced in `02-post-training/`).
- [ ] **Learning to summarize from human feedback** (Stiennon et al, 2020) — earlier well-documented RLHF case study; precursor to InstructGPT.

**Reward modeling:**
- [ ] **A Survey on Reward Model Learning** (any 2024 survey) — Bradley-Terry, scalar vs binary, ensembles, calibration.
- [ ] **Reward Hacking in Reinforcement Learning** (Skalse et al, 2022) — taxonomy of failure modes.
- [ ] **Open Problems and Fundamental Limitations of RLHF** (Casper et al, 2023) — comprehensive critique. Sections 3–4 are mandatory reading.

**Direct preference optimization (the DPO family):**
- [ ] **Direct Preference Optimization** (Rafailov et al, 2023) — the foundational DPO paper.
- [ ] **A General Theoretical Paradigm to Understand Learning from Human Preferences** (Azar et al, 2023) — IPO. Why DPO can overfit and what to do.
- [ ] **KTO: Model Alignment as Prospect Theoretic Optimization** (Ethayarajh et al, 2024) — preference optimization without paired data.
- [ ] **SimPO: Simple Preference Optimization with a Reference-Free Reward** (Meng et al, 2024) — drops the reference model.
- [ ] **ORPO: Monolithic Preference Optimization without Reference Model** (Hong et al, 2024) — fuses SFT and preference optimization.

**RLAIF and Constitutional AI:**
- [ ] **Constitutional AI: Harmlessness from AI Feedback** (Bai et al, Anthropic, 2022) — RLAIF + the constitution mechanism.
- [ ] **RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback** (Lee et al, 2023) — empirical RLAIF vs RLHF.

**RL with verifiable rewards / reasoning:**
- [ ] **Let's Verify Step by Step** (Lightman et al, 2023) — process reward models for math.
- [ ] **DeepSeek-R1** (DeepSeek, 2025) — RL-only training for reasoning; current frontier reference.
- [ ] **OpenAI o1 / o3 system cards** — closed-but-disclosing the RLVR paradigm.

Order: foundational → RM → DPO family → RLAIF/CAI → RLVR/reasoning.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- `projects/02-post-train-end-to-end/` — DPO vs PPO head-to-head and an RLAIF flavor.
- External: `trl` (HuggingFace) for PPO/DPO/KTO trainers; `verl` (Volcano Engine), `OpenRLHF`, `Open-Instruct` (AI2).
