# frontierllm Initial Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `frontierllm` learning repo with root orientation files, seven seeded `notes/` topic folders (with curated reading lists ready to read), and three `projects/` README stubs that describe scope and deliverables — no project code yet.

**Architecture:** Pure markdown scaffolding. The `notes/` folders use a standardized template; the special file `notes/07-frontier-labs/00-orientation.md` is the user's first concrete activity (read 6 frontier model technical reports → comparative writeup → personal map of what to study deeply). The `projects/` folders contain README stubs only; each project is its own future implementation plan launched against its README. Root files (`README.md`, `ROADMAP.md`, `.gitignore`) orient the user and track progress.

**Tech Stack:** Markdown, Git. No code in the initial scaffolding.

**Note on TDD:** Standard TDD does not apply here — no production code is written. The pattern for each task is `write file → verify file content → commit`, where "verify" replaces "run failing test then run passing test."

**Reference:** Design spec at `docs/superpowers/specs/2026-04-25-frontierllm-design.md`.

---

## File map

Files created by this plan (relative to repo root `C:/Personal/frontierllm/`):

```
.gitignore
README.md
ROADMAP.md
notes/00-foundations/README.md
notes/01-pretraining/README.md
notes/02-post-training/README.md
notes/03-rlhf-and-rl/README.md
notes/04-distributed-training/README.md
notes/05-eval-and-benchmarks/README.md
notes/06-alignment-and-interp/README.md
notes/07-frontier-labs/README.md
notes/07-frontier-labs/00-orientation.md
projects/01-pretrain-end-to-end/README.md
projects/02-post-train-end-to-end/README.md
projects/03-eval-and-interp/README.md
```

Files NOT created by this plan (per spec):
- Anything in `projects/<n>/` other than the README (each project gets its own future plan)
- `web/` (deferred behind explicit trigger conditions per spec)
- Any code files

---

## Task 1: Scaffold root files

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `ROADMAP.md`

- [ ] **Step 1: Create `.gitignore`**

Write `.gitignore` at repo root with this content:

```
# Local-only / heavy
papers/
scratch/

# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
env/
.uv/
.pdm-python

# Notebooks
.ipynb_checkpoints/

# Editors
.vscode/
.idea/

# Model weights / checkpoints (when projects exist)
*.pt
*.bin
*.safetensors
*.gguf
*.ckpt
checkpoints/
runs/
wandb/

# OS
.DS_Store
Thumbs.db

# Common large files
*.zip
*.tar
*.tar.gz
*.parquet
data/
```

- [ ] **Step 2: Create `README.md`**

Write `README.md` at repo root with this content:

````markdown
# frontierllm

Personal learning repo for frontier large language models, scoped to the **training side** of the lifecycle.

## What this repo is

A structured study of pretraining, post-training/RLHF, distributed training, evaluation, and alignment.

This is the *training-side counterpart* to two adjacent repos:

- `tiny-llm/` — LLM serving / inference primitives (attention, RoPE, GQA, KV cache, FlashAttention, paged attention, MoE inference, speculative decoding)
- `InferenceEngineering/` — production inference engine on RTX 5080 (Triton kernels, FP8/FP4 quantization, continuous batching)

Together those three repos cover the full pipeline. **`frontierllm` does not re-cover serving topics.**

## Layout

```
notes/        # conceptual layer — markdown synthesis + reading lists per topic
projects/     # hands-on layer — three milestone code projects (no code yet)
papers/       # local-only PDFs (gitignored)
scratch/      # half-baked experiments (gitignored)
docs/         # design specs and plans
ROADMAP.md    # thin index across all topics: what's been touched, what's next
```

## Where to start

If you're new to this repo (or returning after a break):

1. Read [`docs/superpowers/specs/2026-04-25-frontierllm-design.md`](docs/superpowers/specs/2026-04-25-frontierllm-design.md) for the design.
2. Open [`ROADMAP.md`](ROADMAP.md) to see current status.
3. **First active activity:** [`notes/07-frontier-labs/00-orientation.md`](notes/07-frontier-labs/00-orientation.md) — read 6 recent frontier-model technical reports and produce a comparative writeup. The output is a personal map of "what I know / don't know" that drives the next deep dive.

## How to use

- `notes/` is the substrate. Every topic has a `README.md` with a reading list and synthesis sections to fill in.
- `projects/` are *milestone* code projects, each one its own future implementation plan. They're scoped but not implemented.
- Update `ROADMAP.md` as you progress so this repo's status is always visible at a glance.

## Out of scope

- Inference / serving — see `tiny-llm/` and `InferenceEngineering/`.
- Production agentic systems — see eXRealityAI work.
- Vision-only SSL — see ThorMed work.
````

- [ ] **Step 3: Create `ROADMAP.md`**

Write `ROADMAP.md` at repo root with this content:

```markdown
# Roadmap

Thin index across all topics. Update the status line as you progress.

**Reading-list format:** `N items / M done` per topic.

## Notes

- `00-foundations/` — refresher on what's assumed (transformer math, optimization basics) — *0/6 done*
- `01-pretraining/` — scaling laws, data, modern arch, optimization stability, mid-training, long context — *0/16 done*
- `02-post-training/` — SFT, distillation, instruction tuning, synthetic data — *0/11 done*
- `03-rlhf-and-rl/` — RM training, PPO, DPO family, RLAIF, RLVR, online vs offline — *0/15 done*
- `04-distributed-training/` — DP/TP/PP/SP/EP, ZeRO, FSDP, Megatron 3D, FP8 — *0/13 done*
- `05-eval-and-benchmarks/` — benchmark families, contamination, eval design — *0/13 done*
- `06-alignment-and-interp/` — mech interp, SAEs, scalable oversight, red-teaming — *0/12 done*
- `07-frontier-labs/` — frontier model reports, comparative analysis — *orientation pass: not started*

## Projects

- `01-pretrain-end-to-end/` — *not started* (scoped, plan TBD)
- `02-post-train-end-to-end/` — *not started* (scoped, plan TBD)
- `03-eval-and-interp/` — *not started* (scoped, plan TBD)

## Active activity

**Orientation pass** — read 6 recent frontier model reports, populate `notes/07-frontier-labs/00-orientation.md`. See that file for the target list and template.

## Reading list refresh

Reading lists are curated to ~5-10+ items per topic but get stale every 3-6 months. Refresh dates per topic:

- `00-foundations`: 2026-04-25 (initial)
- `01-pretraining`: 2026-04-25 (initial)
- `02-post-training`: 2026-04-25 (initial)
- `03-rlhf-and-rl`: 2026-04-25 (initial)
- `04-distributed-training`: 2026-04-25 (initial)
- `05-eval-and-benchmarks`: 2026-04-25 (initial)
- `06-alignment-and-interp`: 2026-04-25 (initial)
- `07-frontier-labs`: 2026-04-25 (initial)
```

- [ ] **Step 4: Verify all three files were created with expected content**

Run: `ls -la .gitignore README.md ROADMAP.md`
Expected: all three files exist.

Run: `head -1 README.md` → expect `# frontierllm`.
Run: `head -1 ROADMAP.md` → expect `# Roadmap`.
Run: `grep -c "papers/" .gitignore` → expect `1`.

- [ ] **Step 5: Commit**

```bash
git add .gitignore README.md ROADMAP.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
scaffold root: .gitignore, README, ROADMAP

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Seed `notes/00-foundations/README.md`

**Files:**
- Create: `notes/00-foundations/README.md`

- [ ] **Step 1: Create the file with the standardized template + curated reading list**

Write `notes/00-foundations/README.md` with this content:

```markdown
# 00 — Foundations

## What this is

A thin layer of refreshers for things assumed by every other topic. Skim if confident; come back when stuck.

You already know most of this — this folder exists to:
- Pin down vocabulary used by other topics (parameter count, FLOP, token, batch size, sequence length, parallelism dimensions)
- Catch any 2017–2026 deltas you might have missed
- Anchor symbols and conventions used across the rest of the repo

## Reading list

- [ ] **Attention Is All You Need** (Vaswani et al, 2017) — the original transformer. Skim section 3.2 (attention) and 5.4 (regularization) for notation.
- [ ] **The Illustrated Transformer** (Jay Alammar, blog) — visual intuition. Skim if rusty.
- [ ] **The Annotated Transformer** (Sasha Rush et al) — code-along walkthrough; sanity-check on PyTorch idioms.
- [ ] **A Mathematical Framework for Transformer Circuits** (Elhage et al, Anthropic, 2021) — sets up the cleanest mental model of what a transformer *is*. Sections 1–2 are foundational; later sections feed into `06-alignment-and-interp/`.
- [ ] **Speeding up the GPT — KV Caching, Quantization** (Lilian Weng, blog) — connects to your existing `tiny-llm` work; refresher on serving-side terms used elsewhere.
- [ ] **Adam, AdamW, and the optimizer landscape** (any modern survey or Lilian Weng's optimizer post) — terminology check. You know optimization theory deeply but the LLM literature uses specific conventions worth refreshing.

Order: foundations skim → math framework → optimizer terminology.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- See `tiny-llm/` for from-scratch implementations of attention, RoPE, GQA, RMSNorm, KV cache.
```

- [ ] **Step 2: Verify the file was created and has the right structure**

Run: `ls notes/00-foundations/README.md` → expect file exists.
Run: `grep -c "^## " notes/00-foundations/README.md` → expect `5` (What this is, Reading list, Synthesis, Open questions, Code).
Run: `grep -c "^- \[ \]" notes/00-foundations/README.md` → expect `6`.

- [ ] **Step 3: Commit**

```bash
git add notes/00-foundations/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/00-foundations with reading list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Seed `notes/01-pretraining/README.md`

**Files:**
- Create: `notes/01-pretraining/README.md`

- [ ] **Step 1: Create the file**

Write `notes/01-pretraining/README.md` with this content:

```markdown
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
```

- [ ] **Step 2: Verify**

Run: `ls notes/01-pretraining/README.md` → file exists.
Run: `grep -c "^## " notes/01-pretraining/README.md` → expect `5`.
Run: `grep -c "^- \[ \]" notes/01-pretraining/README.md` → expect `16`.

- [ ] **Step 3: Commit**

```bash
git add notes/01-pretraining/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/01-pretraining with reading list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Seed `notes/02-post-training/README.md`

**Files:**
- Create: `notes/02-post-training/README.md`

- [ ] **Step 1: Create the file**

Write `notes/02-post-training/README.md` with this content:

```markdown
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
```

- [ ] **Step 2: Verify**

Run: `ls notes/02-post-training/README.md` → file exists.
Run: `grep -c "^## " notes/02-post-training/README.md` → expect `5`.
Run: `grep -c "^- \[ \]" notes/02-post-training/README.md` → expect `11`.

- [ ] **Step 3: Commit**

```bash
git add notes/02-post-training/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/02-post-training with reading list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Seed `notes/03-rlhf-and-rl/README.md`

**Files:**
- Create: `notes/03-rlhf-and-rl/README.md`

- [ ] **Step 1: Create the file**

Write `notes/03-rlhf-and-rl/README.md` with this content:

```markdown
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
```

- [ ] **Step 2: Verify**

Run: `ls notes/03-rlhf-and-rl/README.md` → file exists.
Run: `grep -c "^## " notes/03-rlhf-and-rl/README.md` → expect `5`.
Run: `grep -c "^- \[ \]" notes/03-rlhf-and-rl/README.md` → expect `15`.

- [ ] **Step 3: Commit**

```bash
git add notes/03-rlhf-and-rl/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/03-rlhf-and-rl with reading list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Seed `notes/04-distributed-training/README.md`

**Files:**
- Create: `notes/04-distributed-training/README.md`

- [ ] **Step 1: Create the file**

Write `notes/04-distributed-training/README.md` with this content:

```markdown
# 04 — Distributed training

## What this is

How frontier labs train models across thousands of GPUs. Parallelism dimensions, sharding strategies, mixed precision, communication patterns, and the practical engineering that makes a multi-trillion-token training run not crash on day 4.

You're inference-savvy already (`InferenceEngineering` repo with FP4/FP8 kernels). This topic is the *training-side* counterpart: different bottlenecks, different precision regimes, much harder fault tolerance.

## Reading list

**Parallelism fundamentals:**
- [ ] **Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism** (Shoeybi et al, 2019) — tensor parallelism (TP). Foundational.
- [ ] **Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM** (Narayanan et al, 2021) — 3D parallelism (TP × PP × DP). Reference paper for the topology.
- [ ] **GPipe / PipeDream** — pipeline parallelism (PP) origins. Skim either.
- [ ] **Reducing Activation Recomputation in Large Transformer Models** (Korthikanti et al, 2022) — sequence parallelism + selective activation checkpointing.

**ZeRO and FSDP:**
- [ ] **ZeRO: Memory Optimizations Toward Training Trillion Parameter Models** (Rajbhandari et al, 2019) — ZeRO 1/2/3 derivation. Read carefully — the rest of FSDP is built on this.
- [ ] **PyTorch FSDP** (Zhao et al, 2023) — modern FSDP design and usage.
- [ ] **FSDP2** (PyTorch blog, 2024) — per-parameter sharding; improvements over FSDP1.

**Mixed precision and FP8:**
- [ ] **Mixed Precision Training** (Micikevicius et al, 2017) — FP16 with loss scaling.
- [ ] **FP8 Formats for Deep Learning** (Micikevicius et al, NVIDIA, 2022) — E4M3 / E5M2.
- [ ] **Transformer Engine documentation** (NVIDIA) — practical FP8 usage; read the technical blog posts.
- [ ] **DeepSeek-V3 Technical Report** (2024) — section on FP8 training in production at scale.

**Open codebases (read the code):**
- [ ] `torchtitan` (PyTorch) — modern, FSDP2 + 2D parallelism, clean reference.
- [ ] `nanotron` (HuggingFace) — readable 3D parallelism implementation.
- [ ] `Megatron-LM` (NVIDIA) — the canonical complex one. Read selectively.

Order: parallelism fundamentals → ZeRO/FSDP → mixed precision → codebase reading.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- `projects/01-pretrain-end-to-end/` — FSDP run on rented 4× H100. FP8 training attempt with `torchao` / `transformer-engine`.
```

- [ ] **Step 2: Verify**

Run: `ls notes/04-distributed-training/README.md` → file exists.
Run: `grep -c "^## " notes/04-distributed-training/README.md` → expect `5`.
Run: `grep -c "^- \[ \]" notes/04-distributed-training/README.md` → expect `13`.

- [ ] **Step 3: Commit**

```bash
git add notes/04-distributed-training/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/04-distributed-training with reading list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Seed `notes/05-eval-and-benchmarks/README.md`

**Files:**
- Create: `notes/05-eval-and-benchmarks/README.md`

- [ ] **Step 1: Create the file**

Write `notes/05-eval-and-benchmarks/README.md` with this content:

```markdown
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
```

- [ ] **Step 2: Verify**

Run: `ls notes/05-eval-and-benchmarks/README.md` → file exists.
Run: `grep -c "^## " notes/05-eval-and-benchmarks/README.md` → expect `5`.
Run: `grep -c "^- \[ \]" notes/05-eval-and-benchmarks/README.md` → expect `13`.

- [ ] **Step 3: Commit**

```bash
git add notes/05-eval-and-benchmarks/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/05-eval-and-benchmarks with reading list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Seed `notes/06-alignment-and-interp/README.md`

**Files:**
- Create: `notes/06-alignment-and-interp/README.md`

- [ ] **Step 1: Create the file**

Write `notes/06-alignment-and-interp/README.md` with this content:

```markdown
# 06 — Alignment and interpretability

## What this is

The "is this model safe and steerable" research direction. Mechanistic interpretability (understanding what's *inside* the model), scalable oversight (training models we can't directly evaluate), and the safety research that informs how frontier labs decide what to deploy.

Lighter coverage than the engineering-heavy topics — the goal is a working mental model of the field, not deep mech-interp expertise.

## Reading list

**Mechanistic interpretability:**
- [ ] **A Mathematical Framework for Transformer Circuits** (Elhage et al, Anthropic, 2021) — read in `00-foundations/` if not already.
- [ ] **In-context Learning and Induction Heads** (Olsson et al, Anthropic, 2022) — circuit-level emergence.
- [ ] **Toy Models of Superposition** (Elhage et al, Anthropic, 2022) — why neurons aren't features.
- [ ] **Towards Monosemanticity / Scaling Monosemanticity** (Anthropic, 2023/2024) — sparse autoencoders for feature extraction. The current dominant interp method.
- [ ] **Sparse Autoencoders Find Highly Interpretable Features in Language Models** (Cunningham et al, 2023) — independent SAE work.

**Scalable oversight:**
- [ ] **AI Safety via Debate** (Irving et al, OpenAI, 2018) — oversight via adversarial argument.
- [ ] **Weak-to-Strong Generalization** (Burns et al, OpenAI, 2023) — supervising stronger models with weaker labels.
- [ ] **Measuring Progress on Scalable Oversight for Large Language Models** (Bowman et al, Anthropic, 2022) — sandwiching methodology.

**Safety research / red-teaming:**
- [ ] **Sleeper Agents: Training Deceptively Aligned LLMs** (Hubinger et al, Anthropic, 2024) — persistent backdoors that survive safety training.
- [ ] **Universal and Transferable Adversarial Attacks on Aligned Language Models** (Zou et al, 2023) — the GCG attack.
- [ ] **Discovering Language Model Behaviors with Model-Written Evaluations** (Perez et al, 2022) — automated red-teaming.

**Deployment / governance:**
- [ ] **Anthropic Responsible Scaling Policy** (current version) and **OpenAI Preparedness Framework** (current version) — read together; concrete safety case structures.

Order: mech interp → scalable oversight → safety research → deployment / governance.

## Synthesis (your own words)

*Fill in as you go.*

## Open questions

*Fill in as you go.*

## Code / experiments

- `projects/03-eval-and-interp/` — train a small SAE on a user-trained model, surface a few interpretable features. Red-team the instruct model.
- External: `sae_lens` (Joseph Bloom), `TransformerLens` (Neel Nanda), `inspect_ai`.
```

- [ ] **Step 2: Verify**

Run: `ls notes/06-alignment-and-interp/README.md` → file exists.
Run: `grep -c "^## " notes/06-alignment-and-interp/README.md` → expect `5`.
Run: `grep -c "^- \[ \]" notes/06-alignment-and-interp/README.md` → expect `12`.

- [ ] **Step 3: Commit**

```bash
git add notes/06-alignment-and-interp/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/06-alignment-and-interp with reading list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Seed `notes/07-frontier-labs/` (README.md and 00-orientation.md)

**Files:**
- Create: `notes/07-frontier-labs/README.md`
- Create: `notes/07-frontier-labs/00-orientation.md`

This task creates two files because they're tightly coupled — the README points users to `00-orientation.md` as the active activity.

- [ ] **Step 1: Create `notes/07-frontier-labs/README.md`**

```markdown
# 07 — Frontier labs

## What this is

What the major labs (Anthropic, OpenAI, DeepMind, Meta, DeepSeek, Qwen, Mistral, xAI, etc.) are actually doing — read straight from their technical reports, system cards, and release blog posts.

This folder is the **entry point for the whole repo**. The orientation pass at `00-orientation.md` is the first active activity; output is a personal map of "I know this / I half-know this / this is alien" that drives the next deep dive.

## Layout

- `00-orientation.md` — first orientation pass: read 6 frontier reports, write comparative analysis. **Start here.**
- (future) `01-anthropic-claude-X.md`, `02-openai-gpt-X.md`, etc. — per-lab deep notes as they accumulate.

## Reading list

The reading list for this topic is a *living list* of the 6–8 most recent / highest-signal frontier reports. See `00-orientation.md` for the current target list. Refresh this every 3–6 months.

## Synthesis

After completing `00-orientation.md`, distill cross-lab patterns here:
- What are labs converging on?
- What are they diverging on?
- Where is the actual frontier (not the marketed frontier)?

## Open questions

*Fill in as you go.*

## Code / experiments

None. This topic is pure synthesis.
```

- [ ] **Step 2: Create `notes/07-frontier-labs/00-orientation.md`**

```markdown
# Orientation Pass

**Goal:** Read 6 recent frontier-model technical reports and produce a comparative writeup. Output a personal map of "what I know / half-know / don't know" that picks the next deep dive.

## Why this first

You're entering the field as a practitioner who's stronger on inference and agents than on training and alignment. Rather than starting from 2017 and grinding forward, this pass exposes you to every pillar (pretraining, post-training, eval, distributed) at the *current* frontier in a few hours per report. Vocabulary like μP, MTP, MoE topology, RLVR, mid-training, anneal cooldown, etc. lands in context.

The output of this exercise is what tells you what to study next — not me.

## Targets

Read each of these (technical report + system card / release blog if available):

- [ ] **Anthropic Claude 4.X system card** (current latest)
- [ ] **OpenAI GPT-5 / o-series technical report** (most recent flagship)
- [ ] **Google Gemini 3 technical report** (most recent flagship)
- [ ] **Meta Llama 4 paper** (or current Llama)
- [ ] **DeepSeek-V3 / DeepSeek-R1 papers**
- [ ] **Qwen 3 technical report**

Substitute: if a more recent flagship has dropped from any of these labs, swap in the newer one. The mix of closed (Anthropic, OpenAI, Google) and open-weight (Meta, DeepSeek, Qwen) is the point — closed labs disclose what they *care about*; open labs disclose how they *do it*.

## Per-report capture template

For each report, fill in this section. Keep it tight — don't reproduce the paper.

### [Lab + model name]

- **Architecture:** dense or MoE? params total / active? attention variant (MHA / GQA / MLA / MQA)? notable choices?
- **Training data:** rough scale (tokens, languages), sources, notable filtering / curation
- **Pretraining:** any unusual schedule, mid-training, cooldown, anneal?
- **Post-training:** SFT recipe? RLHF / DPO / RLVR? RM details? RLAIF / Constitutional?
- **Eval focus:** which benchmarks do they emphasize? what new evals did they build?
- **Distributed / infra:** what's disclosed about parallelism, precision, hardware?
- **Novel claims:** what does this paper say is new?
- **My open questions:** what didn't I understand? where would I want to dive deeper?

(Duplicate this section once per report.)

## Comparative table

After reading all 6, fill this in. Add columns / swap rows as patterns emerge.

| Dimension | Claude | GPT | Gemini | Llama | DeepSeek | Qwen |
|---|---|---|---|---|---|---|
| Active / total params | | | | | | |
| Attention variant | | | | | | |
| MoE? | | | | | | |
| Train data scale (tokens) | | | | | | |
| Mid-training disclosed? | | | | | | |
| Post-training method | | | | | | |
| RM type | | | | | | |
| Headline eval | | | | | | |
| Distributed disclosure | | | | | | |
| Precision (BF16/FP8) | | | | | | |

## Synthesis (~1 page)

After the per-report capture and table:

### What labs are converging on

*e.g., "everyone uses GQA / MoE / RoPE / SwiGLU; everyone runs some form of post-training preference optimization"*

### What labs are diverging on

*e.g., "DeepSeek discloses FP8 training in detail; closed labs do not. RLVR is claimed by OpenAI, partially by Anthropic, openly by DeepSeek"*

### What surprised me

*Free-form.*

### My personal map

Tag each pillar with `known / half / alien`:

- Pretraining (data curation): ?
- Pretraining (architecture choices): ?
- Pretraining (optimization stability / μP): ?
- Pretraining (scaling laws): ?
- Pretraining (mid-training, cooldown, anneal): ?
- Post-training (SFT recipe design): ?
- Post-training (reward modeling): ?
- Post-training (PPO / RLHF infrastructure): ?
- Post-training (DPO family): ?
- Post-training (RLAIF, Constitutional): ?
- Post-training (RLVR / reasoning): ?
- Distributed (FSDP, ZeRO): ?
- Distributed (3D parallelism): ?
- Distributed (FP8 / mixed precision): ?
- Eval (benchmark families): ?
- Eval (contamination / methodology): ?
- Alignment (mech interp, SAEs): ?
- Alignment (scalable oversight): ?
- Alignment (red-teaming, jailbreaks): ?

### Next deep dive

Based on the map, the next folder I'm going to go deep on is: ?

The first 3 reading items I'm going to attack: ?
```

- [ ] **Step 3: Verify both files were created**

Run: `ls notes/07-frontier-labs/`
Expected: `README.md` and `00-orientation.md` both present.

Run: `grep -c "^- \[ \]" notes/07-frontier-labs/00-orientation.md` → expect `6` (the 6 lab targets).
Run: `grep -c "^### " notes/07-frontier-labs/00-orientation.md` → expect `5` (per-report template heading + 4 synthesis subheadings).

- [ ] **Step 4: Commit**

```bash
git add notes/07-frontier-labs/README.md notes/07-frontier-labs/00-orientation.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
seed notes/07-frontier-labs with orientation pass

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Seed `projects/01-pretrain-end-to-end/README.md`

**Files:**
- Create: `projects/01-pretrain-end-to-end/README.md`

- [ ] **Step 1: Create the file**

Write `projects/01-pretrain-end-to-end/README.md` with this content:

```markdown
# Project 01 — Pretrain End-to-End

> **Status:** Scoped, no code yet. When ready to start, run the writing-plans skill against this README to produce a detailed implementation plan.

## Goal

Build the full pretraining stack on a small-but-real model. Single-GPU baseline → rented multi-GPU run. Anchor the topics in `notes/01-pretraining/` and `notes/04-distributed-training/`.

## Deliverables

- **Data pipeline:** download a slice of FineWeb-Edu or SlimPajama; dedup; quality-filter; tokenize; shard into mmap files
- **Custom tokenizer:** train a BPE tokenizer on the data; compare to GPT-2's
- **Modern transformer architecture:** RoPE, GQA, SwiGLU, RMSNorm. Reuse primitives from `tiny-llm/` where applicable
- **Four sizes** of the same recipe (e.g., 25M / 80M / 250M / 500M params) on a fixed token budget
- **Scaling-law fit:** Chinchilla-style curve fit; predict the loss of a held-out larger size and verify
- **Stability experiments:** μP vs standard parameterization, lr sweeps, written analysis of any loss spikes encountered
- **Cloud rental phase:** 500M run distributed via FSDP + activation checkpointing on rented 4× H100
- **FP8 training attempt:** using `torchao` or `transformer-engine`
- **Mid-training anneal:** small curriculum / data-mix change with lr cooldown at the end

## Constraints

- **Hardware:** RTX 5080 (16GB) for single-GPU work; rented cloud (Lambda / RunPod / Modal) for distributed runs.
- **Budget:** the implementation plan must include a cost ceiling for cloud rental.
- **Reuse where possible:** lift modern-transformer primitives from `tiny-llm/`. Don't re-implement what's already done.

## Phase plan (rough)

1. **Phase 1:** Data pipeline + tokenizer training, single GPU.
2. **Phase 2:** Single-GPU training loop; smallest size end-to-end.
3. **Phase 3:** Add μP, lr sweep, four-size scaling-law sweep on the 5080.
4. **Phase 4:** Distributed training infrastructure (FSDP) — first locally simulated, then on rented cloud.
5. **Phase 5:** FP8 training attempt + mid-training anneal experiment.
6. **Phase 6:** Writeup, plots, scaling-law analysis.

## Out of scope

- Inference / serving (covered by `tiny-llm/` and `InferenceEngineering/`).
- Going past ~500M parameters.
- Multi-trillion-parameter MoE (read papers, don't reproduce).

## When to start

After at least one pass through `notes/01-pretraining/` and `notes/04-distributed-training/`. The orientation pass at `notes/07-frontier-labs/00-orientation.md` should also be complete.

## Connection to other projects

- **Outputs the base model** that Project 02 (post-training) takes as input.
- **Outputs the 4-size sweep** that Project 03 (eval-and-interp) uses to plot capability emergence across scale.

## References

- `notes/01-pretraining/` — reading list for this project.
- `notes/04-distributed-training/` — reading list for the distributed phase.
- `tiny-llm/src/` — reusable primitives (attention, RoPE, GQA, RMSNorm).
```

- [ ] **Step 2: Verify**

Run: `ls projects/01-pretrain-end-to-end/README.md` → file exists.
Run: `grep -c "^## " projects/01-pretrain-end-to-end/README.md` → expect `8` (Goal, Deliverables, Constraints, Phase plan, Out of scope, When to start, Connection to other projects, References).

- [ ] **Step 3: Commit**

```bash
git add projects/01-pretrain-end-to-end/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
scope projects/01-pretrain-end-to-end

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Seed `projects/02-post-train-end-to-end/README.md`

**Files:**
- Create: `projects/02-post-train-end-to-end/README.md`

- [ ] **Step 1: Create the file**

Write `projects/02-post-train-end-to-end/README.md` with this content:

```markdown
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
```

- [ ] **Step 2: Verify**

Run: `ls projects/02-post-train-end-to-end/README.md` → file exists.
Run: `grep -c "^## " projects/02-post-train-end-to-end/README.md` → expect `8`.

- [ ] **Step 3: Commit**

```bash
git add projects/02-post-train-end-to-end/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
scope projects/02-post-train-end-to-end

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Seed `projects/03-eval-and-interp/README.md`

**Files:**
- Create: `projects/03-eval-and-interp/README.md`

- [ ] **Step 1: Create the file**

Write `projects/03-eval-and-interp/README.md` with this content:

```markdown
# Project 03 — Eval and Interp

> **Status:** Scoped, no code yet. When ready to start, run the writing-plans skill against this README to produce a detailed implementation plan.

## Goal

Answer "what did we actually train, and how do we know?" Build a reusable eval harness, run it across the model lineage from Projects 01–02, and add a lightweight mech-interp probe. Anchor the topics in `notes/05-eval-and-benchmarks/` and `notes/06-alignment-and-interp/`.

## Deliverables

- **Eval harness:** small reusable harness (or fork of `lm-evaluation-harness`); run across base + every variant from Project 02.
- **Contamination probing:** memorization tests, n-gram overlap with eval data, Min-K%-Prob style detection.
- **Capability surface plot:** which capabilities emerged at which scale across the 4 sizes from Project 01.
- **Sparse autoencoder:** train an SAE on activations of the user-trained model; surface a few interpretable features.
- **Red-team / jailbreak study:** apply known attacks (GCG-style, persona-injection, etc.) to the instruct-tuned model from Project 02.

## Constraints

- **Base for SAE:** use the 500M base from Project 01 (a meaningful size for feature interpretation). If smaller, results are noisier but still instructive.
- **Frameworks:** `lm-evaluation-harness` (EleutherAI), `inspect_ai` (UK AISI) for evals. `sae_lens` for the SAE. `TransformerLens` for general interp.
- **Hardware:** 5080 sufficient for evals and SAE training at this scale.

## Phase plan (rough)

1. **Phase 1:** Eval harness setup; run on base + Project 02 variants. Produce eval report card.
2. **Phase 2:** Contamination probes — memorization / n-gram / Min-K%-Prob.
3. **Phase 3:** Capability surface plot across the 4 sizes from Project 01.
4. **Phase 4:** SAE training on residual stream of a chosen layer; feature catalog.
5. **Phase 5:** Red-team study on the instruct model from Project 02.
6. **Phase 6:** Writeup combining all five outputs.

## Out of scope

- Heavy-duty mech interp (circuit-tracing, attribution patching at scale).
- Frontier-style preparedness / safety case work.
- Deploying anything publicly.

## When to start

After at least one pass through `notes/05-eval-and-benchmarks/` and `notes/06-alignment-and-interp/`. Project 02 must be at least at "DPO baseline trained" stage to have models worth evaluating.

## Connection to other projects

- **Inputs:** all checkpoints from Projects 01 and 02.
- **Outputs:** the final report card that closes the loop on the model lineage walked through Projects 01 → 02 → 03.

## References

- `notes/05-eval-and-benchmarks/` and `notes/06-alignment-and-interp/` — reading lists for this project.
- External: `lm-evaluation-harness` (EleutherAI), `inspect_ai` (UK AISI), `sae_lens`, `TransformerLens`.
```

- [ ] **Step 2: Verify**

Run: `ls projects/03-eval-and-interp/README.md` → file exists.
Run: `grep -c "^## " projects/03-eval-and-interp/README.md` → expect `8`.

- [ ] **Step 3: Commit**

```bash
git add projects/03-eval-and-interp/README.md
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
scope projects/03-eval-and-interp

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Final verification

After all tasks complete, run a final pass to confirm the scaffolding is whole.

- [ ] **Step 1: Confirm directory tree matches spec**

Run: `find . -type f -name "*.md" | grep -v "^./docs" | sort`

Expected output (15 entries — 14 markdown files + (none non-doc)):

```
./README.md
./ROADMAP.md
./notes/00-foundations/README.md
./notes/01-pretraining/README.md
./notes/02-post-training/README.md
./notes/03-rlhf-and-rl/README.md
./notes/04-distributed-training/README.md
./notes/05-eval-and-benchmarks/README.md
./notes/06-alignment-and-interp/README.md
./notes/07-frontier-labs/00-orientation.md
./notes/07-frontier-labs/README.md
./projects/01-pretrain-end-to-end/README.md
./projects/02-post-train-end-to-end/README.md
./projects/03-eval-and-interp/README.md
```

- [ ] **Step 2: Confirm `.gitignore` is in place**

Run: `ls .gitignore`
Expected: file exists.

- [ ] **Step 3: Confirm git history is clean and tasks are committed**

Run: `git log --oneline`
Expected: at least 13 commits (1 spec commit + 12 task commits) plus this plan commit if/when it's added.

- [ ] **Step 4: Confirm no stray files**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

---

## Self-review notes (for the plan author, not the executor)

This plan was self-reviewed against the spec at `docs/superpowers/specs/2026-04-25-frontierllm-design.md`:

- **Spec coverage:** every requirement in the spec's "Initial implementation surface" section maps to a task. README → Task 1. ROADMAP → Task 1. `.gitignore` → Task 1. 7 notes folders → Tasks 2–9. `00-orientation.md` → Task 9. 3 project READMEs → Tasks 10–12. ✓
- **Out-of-scope respected:** no project code, no `web/`, no synthesis content (synthesis sections all say "fill in as you go"). ✓
- **Placeholder scan:** no TBDs, no "implement later," no "similar to Task N" — every task has its complete content inline. The reading lists themselves contain template authors/years that the user will resolve to URLs as they read; this is intentional, not a placeholder. ✓
- **Internal consistency:** every cross-reference in the seeded files (e.g., "see `02-post-training/`", "see `tiny-llm/`") points to a path that either exists in this repo after this plan, or is documented as an out-of-repo reference in the spec. ✓
- **Reading-list counts** in `ROADMAP.md` (Task 1) match the actual reading-list lengths of each topic file (Tasks 2–9): 00-foundations 6, 01-pretraining 16, 02-post-training 11, 03-rlhf-and-rl 15, 04-distributed-training 13, 05-eval-and-benchmarks 13, 06-alignment-and-interp 12. ✓
