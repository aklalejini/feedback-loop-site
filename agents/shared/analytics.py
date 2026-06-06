"""Behavior-signal snapshot for the manager.

The site uses Vercel Web Analytics (chosen for zero-config privacy-friendly
tracking). Unlike Plausible, Vercel Web Analytics does not expose a simple
read/stats API on the hobby tier, so there is currently no programmatic
snapshot to fold in: fetch_snapshot() returns None and the manager runs
reviewer-only, noting the gap in its output.

Custom events are still emitted client-side (web/lib/analytics.ts:
batch_created, observation_logged, batch_viewed, …) and are visible in the
Vercel dashboard for manual review between cycles.

If a queryable analytics source is added later (e.g. self-hosted Umami, or
Vercel's data export), implement it here behind the same signature so
run_cycle.py keeps working unchanged.
"""
from __future__ import annotations

from typing import Any


def fetch_snapshot(period: str = "7d") -> dict[str, Any] | None:
    # No programmatic stats API for Vercel Web Analytics at present.
    return None
