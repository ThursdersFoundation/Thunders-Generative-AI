# Contributing to Thunders Generative AI

Thanks for your interest in contributing! ⚡ This monorepo covers clients, backend,
models, training and research — pick the area that fits your contribution.

## 🧭 Ways to contribute

- 🐛 **Bug reports** — use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- 💡 **Features** — propose via the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml)
- 🧠 **Research** — models, training methods and evaluations via the [research proposal template](.github/ISSUE_TEMPLATE/research_proposal.yml)
- 📝 **Docs & examples** — improvements to `docs/`, `examples/` and model cards

## 🛠️ Development setup

```bash
git clone https://github.com/thunders-ai/Thunders-Generative-AI.git
cd Thunders-Generative-AI
./scripts/setup.sh          # venv, deps, .env files
pre-commit install          # lint & secret hooks
```

## 🔀 Workflow

1. **Branch** from `main`: `feat/<short-name>`, `fix/<issue>-<short-name>`, or `research/<topic>`.
2. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/) —
   e.g. `feat(backend): add streaming chat endpoint`.
3. **Test** your change: `make test` (Python), `make test-frontend`, plus
   `pytest tests/model_tests` for model-related work.
4. **PR** using the pull request template. All checks must pass; at least one
   code owner review is required (see [CODEOWNERS](.github/CODEOWNERS)).

## 🧪 Standards

- **Python**: `ruff` (lint + format), type hints required, 100-char lines.
- **TypeScript**: ESLint (`next/core-web-vitals`), strict mode.
- **Models**: every registered model needs a model card and an evaluation report —
  see [Model development](docs/model-development.md).
- **Safety**: changes affecting generation behavior need a safety review
  (`ai/safety/` owners) before merge.

## 📜 Code of conduct

By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).
