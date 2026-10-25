# ⚡ Thunders Generative AI — root Makefile
# Works on macOS/Linux and Git Bash on Windows.

.DEFAULT_GOAL := help
SHELL := /bin/bash

# --- Help -------------------------------------------------------------------
.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Install ----------------------------------------------------------------
.PHONY: install
install: ## Install all dependencies (backend + frontend)
	./scripts/install_dependencies.sh

.PHONY: install-backend
install-backend: ## Install Python backend dependencies
	python -m pip install --upgrade pip
	python -m pip install -r backend/requirements.txt
	python -m pip install -e "backend[dev]"

.PHONY: install-frontend
install-frontend: ## Install Node workspace dependencies (pnpm)
	pnpm install

# --- Development ------------------------------------------------------------
.PHONY: backend-dev
backend-dev: ## Run the FastAPI backend with hot reload
	./scripts/start_backend.sh

.PHONY: web-dev
web-dev: ## Run the Next.js web app in dev mode
	./scripts/start_frontend.sh

.PHONY: mobile-dev
mobile-dev: ## Run the Flutter mobile app
	cd apps/mobile && flutter run

.PHONY: desktop-dev
desktop-dev: ## Run the Tauri desktop app in dev mode
	cd apps/desktop && pnpm tauri dev

.PHONY: admin-dev
admin-dev: ## Run the Vite admin app in dev mode
	pnpm --filter @thunders/admin dev

# --- Quality ----------------------------------------------------------------
.PHONY: lint
lint: ## Lint Python (ruff) and TypeScript (eslint)
	python -m ruff check backend training inference tests sdk
	pnpm -r --if-present lint

.PHONY: format
format: ## Auto-format Python (ruff-format)
	python -m ruff format backend training inference tests sdk

.PHONY: typecheck
typecheck: ## Run mypy on backend code
	python -m mypy backend

# --- Tests ------------------------------------------------------------------
.PHONY: test
test: test-python test-frontend ## Run all test suites

.PHONY: test-python
test-python: ## Run Python tests (pytest)
	python -m pytest tests backend -q

.PHONY: test-frontend
test-frontend: ## Run frontend tests (pnpm workspaces)
	pnpm -r --if-present test

.PHONY: test-models
test-models: ## Run model smoke tests
	python -m pytest tests/model_tests -m "not slow" -q

# --- Docker -----------------------------------------------------------------
.PHONY: docker-up
docker-up: ## Start the development stack (postgres, redis, minio, backend)
	docker compose up -d

.PHONY: docker-down
docker-down: ## Stop the development stack
	docker compose down

.PHONY: docker-build
docker-build: ## Build all Docker images
	docker compose build

.PHONY: docker-logs
docker-logs: ## Tail logs from the development stack
	docker compose logs -f --tail=100

# --- Cleanup ----------------------------------------------------------------
.PHONY: clean
clean: ## Remove caches, build artifacts and virtualenvs
	rm -rf .venv .pytest_cache .mypy_cache .ruff_cache
	find . -type d -name "__pycache__" -prune -exec rm -rf {} +
	rm -rf apps/web/.next apps/admin/dist sdk/javascript/dist
