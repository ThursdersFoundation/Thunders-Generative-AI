#!/usr/bin/env bash
# ⚡ Start the FastAPI backend with hot reload.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/backend"

if [ -f "$ROOT_DIR/.venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.venv/bin/activate"
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
echo "⚡ Backend starting on http://$HOST:$PORT (docs: /docs)"
exec uvicorn main:app --reload --host "$HOST" --port "$PORT"
