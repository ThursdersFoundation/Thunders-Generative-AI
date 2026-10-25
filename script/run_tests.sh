#!/usr/bin/env bash
# ⚡ Run Python and frontend test suites.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .venv/bin/activate ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

echo "==> Python tests"
python -m pytest tests backend -q

echo "==> Frontend tests"
pnpm -r --if-present test

echo "✅ All test suites completed."
