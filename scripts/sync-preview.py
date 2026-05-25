#!/usr/bin/env python3
"""Copy ready HTML/MD from development/ to preview/ for listed campaigns."""

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Add slug here when a campaign is ready for public preview
READY = [
    "google-traffic-onboarding",
    "assessment-30-day-warning",
    "assessment-progress-engagement",
    "free-trial-expired",
    "breach-winback",
    "funded-account-activation",
    "trading-results",
]


def sync_slug(slug: str) -> None:
    src = ROOT / "development" / slug
    dst = ROOT / "preview" / slug
    if not src.is_dir():
        raise FileNotFoundError(src)
    dst.mkdir(parents=True, exist_ok=True)
    candidates = list(src.iterdir())
    html_dir = src / "HTML"
    if html_dir.is_dir():
        candidates.extend(html_dir.iterdir())
    for f in candidates:
        if f.name.startswith("~$"):
            continue
        if f.suffix in {".html", ".md"}:
            shutil.copy2(f, dst / f.name)
            print(f"  {slug}/{f.name}")


def main() -> None:
    for slug in READY:
        print(f"sync preview ← development/{slug}")
        sync_slug(slug)


if __name__ == "__main__":
    main()
