# 01 — Pretraining

## What this is

How to take a randomly initialized transformer and turn it into a useful base model. The frontier-lab cost center: data, compute, optimizer dynamics, architecture choices, and the multi-stage process (pretrain → mid-train → cooldown → anneal) that produces a "raw" capable model before any post-training.

## Reading list

**Scaling laws:**
- [ ] **Scaling Laws for Neural Language Models** (Kaplan et al, OpenAI, 2020) — establishes loss-vs-{params, data, compute} power laws.
- [ ] **Training Compute-Optimal Large Language Models** (Hoffmann et al, DeepMind, 2022) — "Chinchilla." Read section 3 carefully; the canonical compute-optimal point.
- [ ] **Beyond Chinchilla-Optimal: Accounting for Inference** (Sardana et al, 2023) — why frontier labs over-train on data relative to Chinchilla.
- [ ] **Scaling Laws for Precision** (Kumar et al, 2024) — how scaling interacts with FP8/INT8 training.

**Architecture (post-2017 deltas):**
- [ ] **PaLM** (Chowdhery et al, 2022) — for the architectural choices section: SwiGLU, RoPE, parallel layers, etc.
- [ ] **Llama 2 / Llama 3 papers** (Meta) — modern decoder-only baseline with GQA, RoPE.
- [ ] **DeepSeek-V3 Technical Report** (2024) — MLA (multi-head latent attention), MoE topology, MTP (multi-token prediction). Frontier MoE design.
- [ ] **Mamba: Linear-Time Sequence Modeling with Selective State Spaces** (Gu & Dao, 2023) — SSM alternative; understand what hybrid models are mixing.

**Data:**
- [ ] **The RefinedWeb Dataset for Falcon LLM** (Penedo et al, 2023) — web-data quality pipeline.
- [ ] **The FineWeb Datasets** (HuggingFace, 2024) — current open-source SOTA pretraining mix; annotated quality filters.
- [ ] **DataComp-LM** (Li et al, 2024) — controlled data ablations across recipes.

**Optimization & stability:**
- [ ] **Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer** (Yang et al, 2022) — μP / μTransfer. Why frontier labs sweep hparams on small models.
- [ ] **Methods for Stabilizing Deep Network Training** — read any Anthropic, OpenAI, or DeepMind training-stability blog post on loss spikes, embedding norm growth, query-key normalization.

**Long context:**
- [ ] **YaRN: Efficient Context Window Extension** (Peng et al, 2023) — modern RoPE extension.
- [ ] **Ring Attention** (Liu et al, 2023) — distributed attention for million-token context.

**Mid-training / cooldown:**
- [ ] **MiniCPM** (Hu et al, 2024) — explicit treatment of cooldown / annealing data mixes.
- [ ] **OLMo / OLMo 2** (AI2, 2024) — fully open mid-training recipes; rare disclosure.

Order: scaling laws → architecture → data → stability → long context → mid-training.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- `projects/01-pretrain-end-to-end/` — milestone project for this topic.
- External: `nanoGPT` (Karpathy), `torchtitan` (PyTorch), `levanter` (Stanford), `gpt-neox` (EleutherAI), `nanotron` (HuggingFace). Read `torchtitan` source for modern best-practices.
