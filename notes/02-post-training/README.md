# 02 — Post-training (non-RL)

## What this is

Everything that happens after pretraining but before (or alongside) RL: SFT, instruction tuning, distillation, synthetic-data generation. This is what turns a base model into something that follows instructions before any preference optimization is layered on.

For RL-flavored post-training (RLHF, DPO, RLAIF, RLVR), see `03-rlhf-and-rl/`.

## Reading list

**SFT and instruction tuning:**
- [ ] **InstructGPT — Training Language Models to Follow Instructions with Human Feedback** (Ouyang et al, OpenAI, 2022) — establishes the SFT → RM → PPO pipeline. SFT section is the foundation here; the RLHF parts feed into `03-rlhf-and-rl/`.
- [ ] **FLAN-T5 / Scaling Instruction-Finetuned Language Models** (Chung et al, 2022) — instruction-tuning at scale; benchmark gains as a function of task variety.
- [ ] **The Tülu 3 Technical Report** (AI2, 2024) — open recipe for SFT data mix and curation.
- [ ] **Self-Instruct** (Wang et al, 2022) — bootstrapping instruction data from an LLM.
- [ ] **LIMA: Less Is More for Alignment** (Zhou et al, 2023) — argument for tiny, high-quality SFT sets. Good debate-fuel.

**Synthetic data / response generation:**
- [ ] **WizardLM / Evol-Instruct** (Xu et al, 2023) — automated instruction complexity-evolution.
- [ ] **Phi-4 Technical Report** (Microsoft, 2024) — synthetic-data-driven training; controversial but informative.

**Distillation:**
- [ ] **Distilling Step-by-Step** (Hsieh et al, 2023) — chain-of-thought distillation.
- [ ] **On-Policy Distillation of Language Models** (Agarwal et al, 2024) — distillation that keeps the student in-distribution.

**LoRA & PEFT (relevant for SFT efficiency):**
- [ ] **LoRA: Low-Rank Adaptation of Large Language Models** (Hu et al, 2021) — parameter-efficient fine-tuning.
- [ ] **QLoRA** (Dettmers et al, 2023) — quantized base + LoRA.

Order: instruction-tuning history → modern SFT recipes → synthetic data → distillation → PEFT.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- `projects/02-post-train-end-to-end/` — milestone project for this topic and `03-rlhf-and-rl/`.
- External: `axolotl`, `LLaMA-Factory`, `trl` (HuggingFace), `oumi`. Read `trl/sft_trainer.py` source.
