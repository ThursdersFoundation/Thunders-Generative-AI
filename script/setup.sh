#!/usr/bin/env bash
# ⚡ Thunders Generative AI — one-shot development setup (macOS/Linux/Git Bash).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "⚡ Setting up Thunders Generative AI in $ROOT_DIR"

# 1. Python environment
if [ ! -d .venv ]; then
  python3 -m venv .venv || py -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
pip install -e "backend[dev]"
pip install -e "sdk/python[dev]"

# 2. Node environment
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
else
  echo "⚠️  pnpm not found — enable it with: corepack enable && corepack prepare pnpm@latest --activate" >&2
fi

# 3. Environment files
for example in .env.example backend/.env.example apps/web/.env.example; do
  target="${example%.example}"
  if [ -f "$example" ] && [ ! -f "$target" ]; then
    cp "$example" "$target"
    echo "  created $target"
  fi
done

echo "✅ Setup complete. Try: make help"
