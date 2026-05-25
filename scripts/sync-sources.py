#!/usr/bin/env python3
"""Export public sources from development/ to sources/ for manager handoff."""

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"
SOURCES = ROOT / "sources"
ALLOWED_EXTENSIONS = {".html", ".md"}


def reset_sources_dir() -> None:
    if SOURCES.exists():
        shutil.rmtree(SOURCES)
    SOURCES.mkdir(parents=True, exist_ok=True)


def sync_sources() -> None:
    for src in DEVELOPMENT.rglob("*"):
        if not src.is_file():
            continue
        if src.name.startswith("~$"):
            continue
        if src.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue

        rel = src.relative_to(DEVELOPMENT)
        dst = SOURCES / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        print(f"  {rel.as_posix()}")


def main() -> None:
    if not DEVELOPMENT.is_dir():
        raise FileNotFoundError(f"Missing development folder: {DEVELOPMENT}")
    print("sync sources ← development")
    reset_sources_dir()
    sync_sources()


if __name__ == "__main__":
    main()
