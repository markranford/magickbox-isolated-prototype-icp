#!/usr/bin/env python3
"""Command bridge from Magick Box worker jobs to the real MagickAI SDK.

The bridge reads one JSON request from stdin and writes one JSON response to stdout.
It imports MagickAI from MAGICKAI_REPO_PATH, which should point at a read-only
checkout such as ../_readonly_references/magick_ai.
"""

from __future__ import annotations

import argparse
import dataclasses
import json
import os
import sys
from pathlib import Path
from typing import Any


def default_repo_path() -> Path:
    return Path(__file__).resolve().parents[1].parent / "_readonly_references" / "magick_ai"


def resolve_repo_path() -> Path:
    return Path(os.environ.get("MAGICKAI_REPO_PATH", default_repo_path())).resolve()


def import_magick_ai() -> Any:
    repo_path = resolve_repo_path()
    if not repo_path.exists():
        raise RuntimeError(f"MAGICKAI_REPO_PATH does not exist: {repo_path}")

    sys.path.insert(0, str(repo_path))
    from magick_ai import MagickAI  # type: ignore

    return MagickAI


def to_jsonable(value: Any) -> Any:
    if dataclasses.is_dataclass(value):
        return dataclasses.asdict(value)

    if hasattr(value, "model_dump"):
        return value.model_dump()

    if isinstance(value, dict):
        return {key: to_jsonable(item) for key, item in value.items()}

    if isinstance(value, (list, tuple)):
        return [to_jsonable(item) for item in value]

    if hasattr(value, "__dict__"):
        return {
            key: to_jsonable(item)
            for key, item in vars(value).items()
            if not key.startswith("_")
        }

    return value


def extract_output(result: Any) -> str:
    response = getattr(result, "response", None)
    for field in ("content", "text", "url", "file_url", "status"):
        value = getattr(response, field, None)
        if value:
            return str(value)

    payload = to_jsonable(result)
    if isinstance(payload, dict):
        nested = payload.get("response")
        if isinstance(nested, dict):
            for field in ("content", "text", "url", "file_url", "status"):
                if nested.get(field):
                    return str(nested[field])

    return json.dumps(payload, default=str)


def run_once() -> int:
    request = json.load(sys.stdin)
    MagickAI = import_magick_ai()
    client = MagickAI.from_env()
    result = client.universal_process(
        type=request.get("type", "chat"),
        model=request.get("model", os.environ.get("MAGICKAI_MODEL", "gpt-4o")),
        prompt=request["prompt"],
        parameters=request.get("parameters") or {},
        user_id=request.get("user_id", "magickbox-icp-worker"),
        session_id=request.get("session_id", "magickbox-icp-session"),
    )
    payload = to_jsonable(result)

    print(
        json.dumps(
            {
                "output": extract_output(result),
                "result": payload,
            },
            default=str,
        )
    )
    return 0


def run_health() -> int:
    repo_path = resolve_repo_path()
    try:
        import_magick_ai()
        importable = True
        error = None
    except Exception as exc:  # pragma: no cover - surfaced by smoke output
        importable = False
        error = str(exc)

    print(
        json.dumps(
            {
                "repo_path": str(repo_path),
                "repo_exists": repo_path.exists(),
                "importable": importable,
                "error": error,
            }
        )
    )
    return 0 if importable else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--health", action="store_true")
    args = parser.parse_args()

    if args.health:
        return run_health()

    return run_once()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        raise SystemExit(1)
