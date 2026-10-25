"""⚡ Prepare datasets registered in datasets/dataset_registry.yaml.

Walks each dataset's declared pipeline steps (cleaning, deduplication,
tokenization, ...) and invokes the matching stage in data_pipeline/.

Usage:

    python scripts/prepare_datasets.py --dataset webtext-sample-2026
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRY = REPO_ROOT / "datasets" / "dataset_registry.yaml"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run data pipeline stages for registered datasets")
    parser.add_argument("--dataset", help="Dataset id (default: all)")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    registry = yaml.safe_load(REGISTRY.read_text(encoding="utf-8")).get("datasets", [])
    if args.dataset:
        registry = [d for d in registry if d.get("id") == args.dataset]
        if not registry:
            print(f"error: dataset '{args.dataset}' not found in {REGISTRY}", file=sys.stderr)
            return 1

    for dataset in registry:
        dataset_id = dataset["id"]
        location = REPO_ROOT / dataset.get("location", "")
        steps = dataset.get("pipeline", [])
        print(f"⚡ {dataset_id} ({dataset.get('license', 'unknown license')})")
        if not location.exists():
            print(f"  ⚠ data not present at {location} — download/ingest it first")
            continue
        for step in steps:
            print(f"  → {step}")
            # TODO: import data_pipeline.<step> and run it over the dataset shards.

    print("done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
