"""Playwright screenshot capture. One image per route; full-page."""
from __future__ import annotations

from pathlib import Path
from typing import Iterable

from playwright.sync_api import sync_playwright


def capture(
    base_url: str,
    routes: Iterable[str],
    out_dir: Path,
    viewport: tuple[int, int] = (1280, 800),
) -> dict[str, Path]:
    """Capture full-page screenshots of each route. Returns {route_name: file_path}."""
    out_dir.mkdir(parents=True, exist_ok=True)
    results: dict[str, Path] = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            context = browser.new_context(viewport={"width": viewport[0], "height": viewport[1]})
            for route in routes:
                page = context.new_page()
                url = base_url.rstrip("/") + route
                page.goto(url, wait_until="networkidle", timeout=15000)
                name = route.strip("/").replace("/", "_") or "home"
                path = out_dir / f"{name}.png"
                page.screenshot(path=str(path), full_page=True)
                results[name] = path
                page.close()
        finally:
            browser.close()
    return results
