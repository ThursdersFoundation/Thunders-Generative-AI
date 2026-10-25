# ⚡ Scripts

Repo-root convenience commands.

| Script | Purpose |
| --- | --- |
| `setup.sh` / `setup.ps1` | One-shot dev setup: venv, deps, `.env` files |
| `install_dependencies.sh` | Install Python + pnpm dependencies |
| `download_models.py` | Fetch checkpoints from `models/registry.yaml` |
| `prepare_datasets.py` | Run data-pipeline stages for registered datasets |
| `train_model.py` | Wrapper for `training/train.py` |
| `evaluate_model.py` | Wrapper for `training/evaluate.py` |
| `run_inference.py` | Send a prompt to the inference server |
| `start_backend.sh` | Run FastAPI with reload on :8000 |
| `start_frontend.sh` | Run the Next.js web client on :3000 |
| `run_tests.sh` | Python + frontend test suites |
