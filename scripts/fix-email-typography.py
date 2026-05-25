#!/usr/bin/env python3
"""Align development email HTML typography with Email_UI_Kit_Blocks.html."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEV_DIR = ROOT / "development"

REPLACEMENTS = [
    ("font-size: 38px; line-height: 46px", "font-size: 40px; line-height: 50px"),
    ("font-size: 28px; line-height: 36px", "font-size: 24px; line-height: 34px"),
    ("font-size: 26px; line-height: 34px", "font-size: 24px; line-height: 34px"),
    ("line-height: 26px", "line-height: 25px"),
    ("font-size: 17px", "font-size: 18px"),
    ("font-size: 13px; line-height: 20px", "font-size: 14px; line-height: 20px"),
    ("font-size: 13px; line-height: 18px", "font-size: 16px; line-height: 23px"),
    ("font-size: 40px; line-height: 48px", "font-size: 40px; line-height: 50px"),
    ("font-size: 20px; line-height: 24px", "font-size: 18px; line-height: 25px"),
    ("letter-spacing: 1 px", "letter-spacing: 1px"),
    ("font-weight: bold; font-weight: bold", "font-weight: bold"),
    (
        "padding: 14px 17px; font-size: 16px",
        "padding: 14px 17px; font-weight: normal; font-size: 16px",
    ),
    (
        "margin: 0 0 16px; font-weight: bold; font-size: 24px; line-height: 34px; color: #1358ff",
        "margin: 0 0 16px; font-weight: bold; font-size: 30px; line-height: 34px; color: #1358ff",
    ),
    (
        "margin: 0 0 20px; font-weight: bold; font-size: 24px; line-height: 34px; color: #1358ff",
        "margin: 0 0 20px; font-weight: bold; font-size: 30px; line-height: 34px; color: #1358ff",
    ),
    ("font-size: 16px; line-height: 24px; color: #000b36", "font-size: 16px; line-height: 23px; color: #000b36"),
    ("color: #000b36; font-size: 16px; line-height: 24px", "color: #000b36; font-size: 16px; line-height: 23px"),
]


def add_normal_weight_to_paragraphs(html: str) -> str:
    def repl(match: re.Match[str]) -> str:
        style = match.group(1)
        if "font-weight" in style:
            return match.group(0)
        return f'<p style="font-weight: normal; {style}"'

    return re.sub(r'<p style="([^"]+)"', repl, html)


def process_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = original

    for old, new in REPLACEMENTS:
        if old in updated and "font-weight: normal; font-weight: normal" not in new:
            updated = updated.replace(old, new)

    updated = add_normal_weight_to_paragraphs(updated)

    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(DEV_DIR.rglob("*.html")):
        if process_file(path):
            changed.append(path.relative_to(ROOT))

    print(f"Updated {len(changed)} file(s):")
    for rel in changed:
        print(f"  - {rel}")


if __name__ == "__main__":
    main()
