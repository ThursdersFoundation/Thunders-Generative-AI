# ⚡ Thunders Generative AI

[![CI](https://github.com/thunders-ai/Thunders-Generative-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/thunders-ai/Thunders-Generative-AI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)](backend/)
[![Node](https://img.shields.io/badge/Node-20%2B-green)](apps/web/)

**Thunders-Generative-AI** is the umbrella monorepo for the Thunders generative-AI platform:
text, image, video, audio and code generation, autonomous agents, RAG, model training and
inference — delivered through **web, mobile, desktop and admin** clients on a shared **Python backend**.

## ✨ Capabilities

- 💬 **Text** — chat, summarization, translation, Q&A, creative writing, reasoning
- 🖼️ **Image** — text-to-image, inpainting, super-resolution, ControlNet, diffusion pipelines
- 🎬 **Video** — text-to-video, frame interpolation, motion generation, enhancement
- 🎧 **Audio** — TTS, speech-to-text, music generation, voice conversion
- 💻 **Code** — completion, refactoring, test & documentation generation, bug detection
- 🤖 **Agents** — autonomous agents, multi-agent systems, planning, tools, orchestration
- 🔎 **RAG** — ingestion, chunking, indexing, retrieval, reranking, vector stores
- 🛡️ **Safety** — content moderation, prompt-injection defense, PII protection, red teaming

## 🗂️ Repository layout

| Path | What lives here |
| --- | --- |
| `apps/` | Client applications — `web` (Next.js), `mobile` (Flutter), `desktop` (Tauri), `admin` |
| `backend/` | FastAPI service: `api/v1` endpoints, services, middleware, core, workers |
| `ai/` | Generative-AI research & implementation modules (foundation models → safety) |
| `models/` | Model registry, configs, adapters, tokenizers, model cards, evaluation reports |
| `training/` | Pretraining, SFT, preference optimization, RLHF, distributed training utilities |
| `inference/` | Serving engines, batching, streaming, caching, scheduling |
| `datasets/` | Raw / processed / synthetic datasets, manifests, licenses, registry |
| `data_pipeline/` | Ingestion → cleaning → dedup → tokenization → validation orchestration |
| `research/` | Papers, experiments, notebooks, prototypes, ablations, publications |
| `evaluation/` | Per-modality evaluation suites, human evaluation, regression tests |
| `sdk/` | Client SDKs — Python, JavaScript, TypeScript, Dart, C++ |
| `integrations/` | Thunders ecosystem + databases, clouds, model providers, messaging |
| `infrastructure/` | Docker, Kubernetes, Terraform, Helm, GPU, storage, secrets |
| `security/` & `observability/` | Auth, encryption, policies / metrics, tracing, dashboards, alerts |
| `tests/` & `benchmarks/` | Unit → e2e → load tests / LLM & generation benchmarks |
| `examples/` | Runnable end-to-end examples (chatbot, RAG, agents, generators) |
| `scripts/`, `configs/`, `docs/`, `tools/`, `prompts/`, `packages/`, `assets/` | Developer tooling and shared resources |

## 🚀 Quickstart

```bash
# 1. Clone and bootstrap
git clone https://github.com/thunders-ai/Thunders-Generative-AI.git
cd Thunders-Generative-AI
./scripts/setup.sh            # or: pwsh scripts/setup.ps1 on Windows

# 2. Start infrastructure + backend + web (Docker)
docker compose up -d

# …or run services individually
make backend-dev              # FastAPI  → http://localhost:8000  (docs at /docs)
make web-dev                  # Next.js  → http://localhost:3000
```

## 🛠️ Common commands

| Command | Description |
| --- | --- |
| `make help` | List all make targets |
| `make install` | Install backend + frontend dependencies |
| `make test` | Run Python and frontend test suites |
| `make lint` / `make format` | Lint / auto-format the codebase |
| `make docker-up` / `make docker-down` | Start / stop the dev stack |
| `python scripts/download_models.py` | Fetch models listed in `models/registry.yaml` |
| `python training/train.py --config configs/training.yaml` | Launch a training run |

## 📦 Clients & SDKs

| Client | Stack | Path |
| --- | --- | --- |
| Web | Next.js 15 · React 19 · Tailwind | `apps/web` |
| Mobile | Flutter (Android / iOS) | `apps/mobile` |
| Desktop | Tauri v2 | `apps/desktop` |
| Admin | Vite + React | `apps/admin` |

SDKs: `sdk/python` (`thunders-genai`), `sdk/javascript` (`@thunders/genai`), plus TypeScript, Dart and C++ packages.

## 📚 Documentation

Start with [docs/README.md](docs/README.md), then:

- [Architecture](docs/architecture.md) · [Installation](docs/installation.md) · [Quickstart](docs/quickstart.md)
- [API reference](docs/api-reference.md) · [Model development](docs/model-development.md) · [Deployment](docs/deployment.md)

## 🤝 Contributing

We welcome contributions! Read [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md). Security issues: see [SECURITY.md](SECURITY.md) —
please report privately, never as public issues.

## 📄 License

Released under the [MIT License](LICENSE). © 2026 Thunders AI.
