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
