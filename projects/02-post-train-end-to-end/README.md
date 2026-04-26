# Project 02 — Post-train End-to-End

> **Status:** Scoped, no code yet. When ready to start, run the writing-plans skill against this README to produce a detailed implementation plan.

## Goal

Take the base model from Project 01 (or a small public base such as Qwen-0.5B if Project 01 isn't ready yet) and run the full post-training pipeline. Anchor the topics in `notes/02-post-training/` and `notes/03-rlhf-and-rl/`.

## Deliverables

- **SFT** on a small instruction dataset (UltraChat / Tulu mix). Ablation on data quality vs quantity.
- **Reward model:** Bradley-Terry RM trained on a preference dataset (UltraFeedback or similar).
- **DPO vs PPO head-to-head:** same base, same preferences, both methods. Study the KL-vs-quality frontier, reward hacking, length bias.
- **At least one alternative preference method:** SimPO or KTO, for breadth.
- **RLAIF flavor:** use a stronger judge to generate preferences; repeat the optimization.
- **(Stretch) RLVR:** small math or code task with verifiable rewards (the o1-style training paradigm).

## Constraints

- **Base model:** prefer the 500M base from Project 01. If Project 01 is not ready, fall back to Qwen-0.5B or Llama-3.2-1B.
- **Frameworks:** `trl` (HuggingFace) is the default for PPO/DPO/KTO. Read its source.
- **Hardware:** single 5080 is enough for SFT and DPO at this scale. PPO with RM may need a rented A100 / H100 for a few hours.
- **No production-grade evals here** — use `lm-evaluation-harness` quick-eval; full eval lives in Project 03.

## Phase plan (rough)

1. **Phase 1:** SFT on the base model with a small instruction set. Establish baseline.
2. **Phase 2:** Train the reward model on preferences. Study calibration / agreement with held-out human prefs.
3. **Phase 3:** DPO from the SFT checkpoint. Study reward / length / KL curves.
4. **Phase 4:** PPO from the SFT checkpoint, using the RM from Phase 2. Compare to DPO.
5. **Phase 5:** SimPO or KTO ablation. Compare to DPO.
6. **Phase 6:** RLAIF flavor — judge-generated preferences, re-run.
7. **Phase 7:** (Stretch) RLVR on a small verifiable task.
8. **Phase 8:** Writeup, ablation plots, qualitative samples per variant.

## Out of scope

- Production red-teaming and full eval (lives in Project 03).
- Mech interp (lives in Project 03).
- Going past ~1B parameters.
- Multi-turn / agentic RL (read papers, don't reproduce).

## When to start

After at least one pass through `notes/02-post-training/` and `notes/03-rlhf-and-rl/`. Project 01 doesn't need to be complete — fall back to a public base if so.

## Connection to other projects

- **Inputs:** base model from Project 01 (or fallback public base).
- **Outputs:** SFT-only / DPO / PPO / SimPO-or-KTO / RLAIF model variants for Project 03 to evaluate.

## References

- `notes/02-post-training/` and `notes/03-rlhf-and-rl/` — reading lists for this project.
- External: `trl`, `verl`, `OpenRLHF`, `Open-Instruct` (AI2). Read `trl/sft_trainer.py`, `trl/dpo_trainer.py`, `trl/ppo_trainer.py`.
