#!/usr/bin/env bash
# ⚡ Start the Next.js web client in dev mode.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "⚡ Web client starting on http://localhost:3000"
exec pnpm --filter @thunders/web dev
