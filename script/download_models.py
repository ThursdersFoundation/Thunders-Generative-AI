"""⚡ Download model checkpoints listed in models/registry.yaml.

Usage:

    python scripts/download_models.py                 # all models
    python scripts/download_models.py --model thunders-t1-chat
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY = REPO_ROOT / "models" / "registry.yaml"
OUTPUT_DIR = REPO_ROOT / "models" / "checkpoints"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download registered model checkpoints")
    parser.add_argument("--model", help="Download a single model id instead of all")
    parser.add_argument("--output", type=Path, default=OUTPUT_DIR)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    entries = yaml.safe_load(REGISTRY.read_text(encoding="utf-8")).get("models", [])
    if args.model:
        entries = [e for e in entries if e.get("id") == args.model]
        if not entries:
            print(f"error: model '{args.model}' not found in {REGISTRY}", file=sys.stderr)
            return 1

    args.output.mkdir(parents=True, exist_ok=True)

    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        print("error: install the downloader first: pip install huggingface_hub", file=sys.stderr)
        return 1

    failures = 0
    for entry in entries:
        model_id, source = entry["id"], entry.get("source", {})
        if source.get("type") != "huggingface":
            print(f"⏭  {model_id}: source type '{source.get('type')}' not supported yet")
            continue
        repo = source.get("repo")
        print(f"⬇  {model_id} ← {repo}")
        try:
            snapshot_download(repo_id=repo, local_dir=args.output / model_id)
        except Exception as exc:  # noqa: BLE001 — report and continue
            failures += 1
            print(f"  ✖ failed: {exc}", file=sys.stderr)

    print("done" if not failures else f"done with {failures} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
