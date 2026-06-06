"""Optional Plausible Stats API client.

When PLAUSIBLE_API_KEY + PLAUSIBLE_SITE_ID are set, returns a compact snapshot
the manager can fold into its decision. When unset, returns None so the manager
runs reviewer-only and notes the gap.
"""
from __future__ import annotations

import os
from typing import Any

import httpx


def fetch_snapshot(period: str = "7d") -> dict[str, Any] | None:
    key = os.environ.get("PLAUSIBLE_API_KEY")
    site = os.environ.get("PLAUSIBLE_SITE_ID")
    if not (key and site):
        return None
    host = os.environ.get("PLAUSIBLE_API_HOST", "https://plausible.io").rstrip("/")
    headers = {"Authorization": f"Bearer {key}"}
    params_aggregate = {
        "site_id": site,
        "period": period,
        "metrics": "visitors,visits,pageviews,bounce_rate,visit_duration",
    }
    try:
        with httpx.Client(timeout=15.0) as h:
            agg = h.get(f"{host}/api/v1/stats/aggregate", headers=headers, params=params_aggregate)
            agg.raise_for_status()
            events = h.get(
                f"{host}/api/v1/stats/breakdown",
                headers=headers,
                params={"site_id": site, "period": period, "property": "event:name", "limit": 20},
            )
            events.raise_for_status()
            return {
                "period": period,
                "aggregate": agg.json().get("results", {}),
                "events": events.json().get("results", []),
            }
    except httpx.HTTPError as e:
        return {"error": str(e), "period": period}
