# Roadmap

High-level direction for the Thunders Generative AI platform.
Details and status tracked in [GitHub Projects](https://github.com/orgs/thunders-ai/projects).

## Phase 1 — Foundations (Q4 2026)

- [x] Monorepo scaffold, CI/CD, dev stack
- [ ] Backend core: auth, rate limiting, model registry API
- [ ] Web client: chat, image generator, model browser
- [ ] Python & JavaScript SDKs v0

## Phase 2 — Generation suite (Q1 2027)

- [ ] Text generation engines (streaming, tool calls)
- [ ] Image generation pipelines (diffusion, ControlNet, inpainting)
- [ ] Audio: TTS + speech-to-text
- [ ] RAG stack: ingestion → retrieval → reranking → generation

## Phase 3 — Agents & multimodal (Q2 2027)

- [ ] Autonomous agents with planning, memory and tool use
- [ ] Multi-agent orchestration and workflows
- [ ] Vision-language models, cross-modal retrieval
- [ ] Video generation (text-to-video, interpolation)

## Phase 4 — Scale & safety (Q3 2027+)

- [ ] Distributed training (FSDP/DeepSpeed), preference optimization
- [ ] Safety hardening: red teaming, hallucination detection, PII protection
- [ ] Model monitoring, drift detection, A/B evaluation
- [ ] Enterprise deployment: Helm charts, multi-tenant quotas, audit logs

## Ongoing (every phase)

- Evaluation suites & benchmarks per modality (`evaluation/`, `benchmarks/`)
- Model cards and safety reports for every registered model
- Documentation, examples and SDK coverage
