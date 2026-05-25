#!/usr/bin/env python3
"""Create timestamped static snapshots for campaign email HTML files."""

from __future__ import annotations

import argparse
import html
import shutil
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover - Python < 3.9 fallback
    ZoneInfo = None


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SLUG = "google-traffic-onboarding"
DEFAULT_PRODUCTION_BASE_URL = "https://sabiotrade-email-experiments.vercel.app"
EMAIL_PATTERNS = {
    "google-traffic-onboarding": ("GTO_*.html",),
}


def now_moscow() -> datetime:
    if ZoneInfo is None:
        return datetime.now().astimezone()
    return datetime.now(ZoneInfo("Europe/Moscow"))


def unique_snapshot_dir(versions_dir: Path, base_slug: str) -> Path:
    candidate = versions_dir / base_slug
    if not candidate.exists():
        return candidate
    index = 2
    while True:
        candidate = versions_dir / f"{base_slug}-{index}"
        if not candidate.exists():
            return candidate
        index += 1


def email_files(preview_dir: Path, slug: str) -> list[Path]:
    patterns = EMAIL_PATTERNS.get(slug)
    if patterns is None:
        patterns = ("*.html",)
    files: list[Path] = []
    for pattern in patterns:
        files.extend(preview_dir.glob(pattern))
    return sorted({f for f in files if f.is_file()})


def build_versions_index(slug: str, versions_dir: Path) -> None:
    snapshots = sorted(
        [d for d in versions_dir.iterdir() if d.is_dir()],
        key=lambda path: path.name,
        reverse=True,
    )

    cards = []
    versions_base_path = f"/preview/{slug}/versions"
    for snapshot in snapshots:
        label = html.escape(format_snapshot_label(snapshot.name))
        links = []
        for email in sorted(snapshot.glob("*.html")):
            email_name = html.escape(email.name)
            links.append(
                f'<a class="version-email-link" href="{versions_base_path}/{snapshot.name}/{email_name}">{email_name}</a>'
            )
        if not links:
            continue
        source_note = ""
        if "prod-before-deploy" in snapshot.name:
            source_note = '<span class="version-card-note">Архив production перед деплоем</span>'
        cards.append(
            "\n".join(
                [
                    '<li class="version-card">',
                    f'  <strong>{label}</strong>',
                    f"  {source_note}",
                    f'  <div class="version-email-links">{"".join(links)}</div>',
                    "</li>",
                ]
            )
        )

    cards_html = "\n".join(cards) if cards else "<li>Версий пока нет.</li>"
    index_html = f"""<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{html.escape(slug)} - версии писем</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/hub.css" />
  </head>
  <body>
    <div class="hub">
      <header class="hub-header">
        <p><a href="/chain?chain={html.escape(slug)}">← К текущей версии</a></p>
        <h1>Версии писем</h1>
        <p class="hub-lead">Снимки HTML, созданные перед деплоем. Каждый блок открывает сами письма в выбранной версии.</p>
      </header>

      <main>
        <ul class="version-list">
{cards_html}
        </ul>
      </main>
    </div>
  </body>
</html>
"""
    (versions_dir / "index.html").write_text(index_html, encoding="utf-8")
    sync_compatibility_paths(slug, versions_dir, snapshots)


def sync_compatibility_paths(slug: str, versions_dir: Path, snapshots: list[Path]) -> None:
    preview_dir = ROOT / "preview" / slug
    for snapshot in snapshots:
        if not snapshot.is_dir():
            continue
        compat_dir = preview_dir / snapshot.name
        compat_dir.mkdir(parents=True, exist_ok=True)
        for email in snapshot.glob("*.html"):
            shutil.copy2(email, compat_dir / email.name)


def format_snapshot_label(name: str) -> str:
    raw = name
    if raw.endswith("-MSK"):
        raw = raw[:-4]
    try:
        parsed = datetime.strptime(raw[:19], "%Y-%m-%d_%H-%M-%S")
    except ValueError:
        return name
    suffix = name[19:]
    duplicate_suffix = suffix[4:] if suffix.startswith("-MSK") else suffix
    readable_suffix = duplicate_suffix.lstrip("-").replace("-", " ")
    if readable_suffix:
        return f"{parsed:%Y-%m-%d %H:%M:%S} MSK · {readable_suffix}"
    return f"{parsed:%Y-%m-%d %H:%M:%S} MSK"


def create_snapshot_dir(slug: str, suffix: str = "") -> tuple[Path, Path]:
    versions_dir = ROOT / "preview" / slug / "versions"
    versions_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_moscow().strftime("%Y-%m-%d_%H-%M-%S-MSK")
    base_name = stamp + (f"-{suffix}" if suffix else "")
    snapshot_dir = unique_snapshot_dir(versions_dir, base_name)
    snapshot_dir.mkdir()
    return versions_dir, snapshot_dir


def latest_snapshot_with_suffix(versions_dir: Path, suffix: str) -> Path | None:
    matches = sorted(
        [d for d in versions_dir.iterdir() if d.is_dir() and d.name.endswith(suffix)],
        key=lambda path: path.name,
        reverse=True,
    )
    return matches[0] if matches else None


def snapshot_matches(snapshot_dir: Path, fetched_files: list[tuple[str, bytes]]) -> bool:
    for filename, content in fetched_files:
        existing = snapshot_dir / filename
        if not existing.is_file() or existing.read_bytes() != content:
            return False
    return True


def snapshot(slug: str) -> None:
    preview_dir = ROOT / "preview" / slug
    if not preview_dir.is_dir():
        raise FileNotFoundError(preview_dir)

    files = email_files(preview_dir, slug)
    if not files:
        raise FileNotFoundError(f"No email HTML files found for {slug}")

    versions_dir, snapshot_dir = create_snapshot_dir(slug)

    for src in files:
        shutil.copy2(src, snapshot_dir / src.name)
        print(f"  {slug}/versions/{snapshot_dir.name}/{src.name}")

    build_versions_index(slug, versions_dir)
    print(f"versions index: preview/{slug}/versions/index.html")


def fetch_bytes(url: str) -> bytes:
    current_url = url
    for _ in range(5):
        request = Request(current_url, headers={"User-Agent": "sabiotrade-email-version-archiver/1.0"})
        try:
            with urlopen(request, timeout=30) as response:
                status = getattr(response, "status", 200)
                if status >= 400:
                    raise RuntimeError(f"HTTP {status} for {current_url}")
                return response.read()
        except HTTPError as error:
            if error.code in {301, 302, 303, 307, 308}:
                location = error.headers.get("Location")
                if location:
                    current_url = urljoin(current_url, location)
                    continue
            raise RuntimeError(f"HTTP {error.code} for {current_url}") from error
        except URLError as error:
            raise RuntimeError(f"Could not fetch {current_url}: {error.reason}") from error
    raise RuntimeError(f"Too many redirects for {url}")


def snapshot_production(slug: str, base_url: str) -> None:
    preview_dir = ROOT / "preview" / slug
    if not preview_dir.is_dir():
        raise FileNotFoundError(preview_dir)

    files = email_files(preview_dir, slug)
    if not files:
        raise FileNotFoundError(f"No local email filenames found for {slug}")

    versions_dir = preview_dir / "versions"
    versions_dir.mkdir(parents=True, exist_ok=True)
    preview_path = preview_dir.relative_to(ROOT).as_posix()
    base_url = base_url.rstrip("/")

    fetched_files: list[tuple[str, bytes]] = []
    for local_file in files:
        url = f"{base_url}/{preview_path}/{local_file.name}"
        fetched_files.append((local_file.name, fetch_bytes(url)))

    latest_prod_snapshot = latest_snapshot_with_suffix(versions_dir, "prod-before-deploy")
    if latest_prod_snapshot and snapshot_matches(latest_prod_snapshot, fetched_files):
        build_versions_index(slug, versions_dir)
        print(f"  current production already archived: {slug}/versions/{latest_prod_snapshot.name}")
        print(f"versions index: preview/{slug}/versions/index.html")
        return

    _, snapshot_dir = create_snapshot_dir(slug, "prod-before-deploy")
    try:
        for filename, content in fetched_files:
            target = snapshot_dir / filename
            target.write_bytes(content)
            print(f"  {slug}/versions/{snapshot_dir.name}/{filename}")
    except Exception:
        shutil.rmtree(snapshot_dir, ignore_errors=True)
        raise

    build_versions_index(slug, versions_dir)
    print(f"versions index: preview/{slug}/versions/index.html")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create email HTML version snapshots.")
    parser.add_argument("slugs", nargs="*", default=[DEFAULT_SLUG])
    parser.add_argument(
        "--source",
        choices=["local", "production"],
        default="local",
        help="Snapshot local preview files or current production files.",
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_PRODUCTION_BASE_URL,
        help="Production base URL for --source production.",
    )
    args = parser.parse_args()

    for slug in args.slugs:
        if args.source == "production":
            print(f"snapshot versions ← production/{slug}")
            snapshot_production(slug, args.base_url)
        else:
            print(f"snapshot versions ← preview/{slug}")
            snapshot(slug)


if __name__ == "__main__":
    main()
