#!/usr/bin/env bash
# ⚡ Install backend + frontend dependencies without creating env files.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Python dependencies"
if [ -d .venv ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
python -m pip install -e "backend[dev]"
python -m pip install -e "sdk/python[dev]"

echo "==> Node dependencies (pnpm)"
pnpm install

echo "✅ Dependencies installed."
