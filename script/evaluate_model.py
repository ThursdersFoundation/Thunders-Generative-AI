"""⚡ Thin wrapper around training/evaluate.py (repo-root convenience).

Usage: python scripts/evaluate_model.py --model thunders-t1-chat --suite text
"""

import subprocess
import sys
from pathlib import Path

EVALUATE = Path(__file__).resolve().parent.parent / "training" / "evaluate.py"

if __name__ == "__main__":
    raise SystemExit(subprocess.call([sys.executable, str(EVALUATE), *sys.argv[1:]]))
