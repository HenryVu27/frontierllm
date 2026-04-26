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
