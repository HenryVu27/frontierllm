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
notes/                  # reading lists per topic (curated bibliography)
web/content/textbook/   # taught chapters rendered at /textbook (MDX)
projects/               # hands-on layer — three milestone code projects (no code yet)
papers/                 # local-only PDFs (gitignored)
scratch/                # half-baked experiments + research briefs (gitignored)
docs/                   # design specs and plans
ROADMAP.md              # thin index across all topics: what's been touched, what's next
```

## Where to start

If you're new to this repo (or returning after a break):

1. Read [`docs/superpowers/specs/2026-04-25-frontierllm-design.md`](docs/superpowers/specs/2026-04-25-frontierllm-design.md) for the original design.
2. Open [`ROADMAP.md`](ROADMAP.md) to see current status.
3. **Prereqs textbook:** start at [`web/content/textbook/00-prerequisites.mdx`](web/content/textbook/00-prerequisites.mdx) or visit `/textbook` in the web reader for the eight-chapter module on transformers, attention variants, positional encodings, normalisation, activations, optimisers, tokenisation, and MoE plumbing. Synthesised from primary sources as of May 2026.
4. **Pretraining-at-scale textbook:** Module 1 at [`web/content/textbook/01-pretraining.mdx`](web/content/textbook/01-pretraining.mdx) or `/textbook/01-pretraining` covers data pipeline, tokenizer training, scaling laws, μP / HP transfer, schedules and batch sizes, data curriculum, long-context extension, and the midtraining / annealing / FP8 reliability phase. Synthesised from 2024–2026 frontier-lab tech reports + the SmolLM3 training playbook.
5. **Distributed-training textbook:** Module 2 at [`web/content/textbook/02-distributed.mdx`](web/content/textbook/02-distributed.mdx) or `/textbook/02-distributed` covers DP/DDP, tensor parallelism, pipeline parallelism (incl. DualPipe), expert parallelism, FSDP / ZeRO, NCCL primitives and overlap, mixed precision and gradient checkpointing, 3D/4D parallelism composition, and a ninth chapter on the *practice* of running a training campaign (framework choice, pre-flight checklist, monitoring, ablation-compute accounting). Verbatim configurations from Llama-3.1 405B, DeepSeek-V3, OLMo-2, PaLM, GPT-3, and the SmolLM3 training playbook for the practice chapter.
6. **Post-training and reasoning textbook:** Module 3 at [`web/content/textbook/03-post-training.mdx`](web/content/textbook/03-post-training.mdx) or `/textbook/03-post-training` covers SFT, preference tuning (DPO/IPO/KTO/SimPO/ORPO with full DPO derivation), RLHF (Bradley-Terry RM, PPO at scale), Constitutional AI and RLAIF, RLVR (verifier rewards), reasoning RL (GRPO derivation, DeepSeek-R1, the o-series), process reward models (PRM800K, ProcessBench), and agentic post-training (ReAct, Computer Use, SWE-RL).
7. **Inference and serving textbook:** Module 4 at [`web/content/textbook/04-inference.mdx`](web/content/textbook/04-inference.mdx) or `/textbook/04-inference` covers KV cache + paged attention, decoding strategies, speculative decoding (Medusa, EAGLE-1/2/3), continuous batching, quantization (GPTQ/AWQ/AQLM/QuaRot, FP8/MXFP4), inference engines (vLLM/SGLang/TRT-LLM/llama.cpp/MLX), constrained decoding (XGrammar, Outlines), and deployment architectures (Splitwise, DistServe, Mooncake, wide-EP).
8. **Evaluation, alignment, and interpretability textbook:** Module 5 at [`web/content/textbook/05-eval-alignment-interp.mdx`](web/content/textbook/05-eval-alignment-interp.mdx) or `/textbook/05-eval-alignment-interp` covers benchmark families (MMLU/GPQA/HLE/SWE-bench/FrontierMath/ARC-AGI-2) and the saturation crisis, test-set contamination detection (Min-K%, LiveBench), LMSYS Arena ELO methodology, sparse autoencoders (Bricken / Templeton / Gemma-Scope, TopK/JumpReLU/BatchTopK), circuit analysis (induction heads, IOI, activation patching, function vectors, transcoders, attribution graphs), scalable oversight (debate, IDA, weak-to-strong, deliberative alignment), red-teaming (GCG, PAIR, HarmBench, ASL/Preparedness/FSF frameworks), and deceptive-alignment evaluations (Sleeper Agents, Alignment Faking, Apollo scheming evals).
9. **Frontier-lab survey textbook:** Module 6 at [`web/content/textbook/06-frontier-labs.mdx`](web/content/textbook/06-frontier-labs.mdx) or `/textbook/06-frontier-labs` walks the 2024–2026 frontier-lab landscape lab by lab: OpenAI (GPT-5.5 + o-series + Operator + Preparedness v2), Anthropic (Claude 4.7 + RSP v3.2 + Constitutional AI + Sleeper Agents + MCP), Google DeepMind (Gemini 3.1 + Gemma 4 + Veo / Imagen + AlphaProof + FSF v3.0), Meta (Llama 3.1 405B + Llama 4 Scout/Maverick/Behemoth), DeepSeek (V3.2 + R1 + MLA + DualPipe + FP8 + wide-EP), Alibaba Qwen (Qwen3-480B-A35B + hybrid reasoning toggle), Mistral / Cohere / xAI / AI21, and the other Chinese labs (Kimi K2 / GLM-4.5 / MiniMax M1 / Hunyuan / Yi / Baichuan / Doubao).
10. **First active activity:** [`notes/07-frontier-labs/00-orientation.md`](notes/07-frontier-labs/00-orientation.md) — read 6 recent frontier-model technical reports and produce a comparative writeup. The output is a personal map of "what I know / don't know" that drives the next deep dive.

## How to use

- `notes/` is the substrate. Every topic has a `README.md` with a reading list and synthesis sections to fill in.
- `projects/` are *milestone* code projects, each one its own future implementation plan. They're scoped but not implemented.
- Update `ROADMAP.md` as you progress so this repo's status is always visible at a glance.

## Out of scope

- Inference / serving — see `tiny-llm/` and `InferenceEngineering/`.
- Production agentic systems — see eXRealityAI work.
- Vision-only SSL — see ThorMed work.
