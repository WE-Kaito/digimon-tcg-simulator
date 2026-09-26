#!/usr/bin/env python3
"""Build and run Project Drasil with Docker Compose."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
COMPOSE_FILES = {
    "start": ROOT / "docker-compose.yml",
    "dev": ROOT / "docker-compose.dev.yml",
}
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "mode",
        choices=COMPOSE_FILES,
        help="start the production stack or the developer stack",
    )
    parser.add_argument(
        "--foreground",
        action="store_true",
        help="attach to container output instead of running in the background",
    )
    parser.add_argument(
        "--no-build",
        action="store_true",
        help="reuse existing images without rebuilding them",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if shutil.which("docker") is None:
        print("Docker is required but was not found in PATH.", file=sys.stderr)
        return 1

    try:
        subprocess.run(
            ["docker", "compose", "version"],
            cwd=ROOT,
            check=True,
            stdout=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError:
        print("Docker Compose is required but is not available.", file=sys.stderr)
        return 1

    command = [
        "docker",
        "compose",
        "--project-name",
        "project-drasil",
        "--file",
        str(COMPOSE_FILES[args.mode]),
        "up",
        "--remove-orphans",
    ]
    if not args.no_build:
        command.append("--build")
    if not args.foreground:
        command.append("--detach")

    try:
        subprocess.run(command, cwd=ROOT, check=True)
    except subprocess.CalledProcessError as error:
        return error.returncode
    except KeyboardInterrupt:
        return 130

    if not args.foreground:
        port = os.environ.get("APP_PORT", "3000") if args.mode == "start" else "5173"
        print(f"Project Drasil is running at http://localhost:{port}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
