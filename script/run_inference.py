"""⚡ Send a prompt to the standalone inference server.

Usage:

    python scripts/run_inference.py --prompt "Explain diffusion in one line."
"""

from __future__ import annotations

import argparse
import json

import httpx


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Call the Thunders inference server")
    parser.add_argument("--server", default="http://localhost:8100")
    parser.add_argument("--model", default="thunders-t1-chat")
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--max-tokens", type=int, default=512)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    payload = {
        "model": args.model,
        "prompt": args.prompt,
        "max_tokens": args.max_tokens,
        "stream": False,
    }
    response = httpx.post(f"{args.server}/v1/generate", json=payload, timeout=120)
    print(json.dumps(response.json(), indent=2))
    return 0 if response.is_success else 1


if __name__ == "__main__":
    raise SystemExit(main())
