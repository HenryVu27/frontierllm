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
