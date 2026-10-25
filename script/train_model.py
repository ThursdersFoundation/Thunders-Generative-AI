"""⚡ Thin wrapper around training/train.py (repo-root convenience).

Usage: python scripts/train_model.py --config configs/training.yaml
"""

import subprocess
import sys
from pathlib import Path

TRAIN = Path(__file__).resolve().parent.parent / "training" / "train.py"

if __name__ == "__main__":
    raise SystemExit(subprocess.call([sys.executable, str(TRAIN), *sys.argv[1:]]))
