"""Manager: synthesizes reviewer findings into a ranked changelist tied to goal.yaml.

Two layers:
  - `enforce_limits` — pure function that caps and filters the LLM's output.
    Tested in tests/test_manager.py.
  - `synthesize` — the LLM call.
"""
from __future__ import annotations

import json
from typing import Any

from shared.goal import summarize_for_prompt
from shared.llm import MANAGER_MODEL, call_with_tool
from shared.schemas import CHANGELIST_SCHEMA

MANAGER_NAME = "manager"

SYSTEM = """You are the manager of a multi-agent feedback loop. You receive
findings from specialist reviewers and (when available) a real analytics snapshot.
You produce a small, ranked changelist of items that meet the GOAL's change
threshold and respect its anti-goals.

Hard rules:
- Approve AT MOST `cycle_limits.max_changes_per_cycle` items.
- Reject any finding whose ONLY justification is < 5% lift on the primary metric
  unless it cleanly falls under rule (b) UX bug fix or rule (c) accessibility fix.
- Reject any finding whose `anti_goal_risk` is non-empty AND the risk is not
  trivially mitigated — explain why in the rejection reason.
- Prefer findings tied to the PRIMARY metric over those tied to secondary metrics.
- Be honest: if you have NO finding that clears the bar, approve zero. The
  point of the threshold is to prevent churn.
- Cite concrete evidence from the findings in your rationale."""


def synthesize(
    *,
    goal: dict[str, Any],
    reviews: list[dict[str, Any]],
    analytics: dict[str, Any] | None,
) -> dict[str, Any]:
    """Call the manager LLM to produce a draft changelist."""
    findings_blob = json.dumps(
        [{"reviewer": r["reviewer"], "findings": r["findings"]} for r in reviews],
        indent=2,
    )
    analytics_blob = (
        json.dumps(analytics, indent=2)
        if analytics is not None
        else "NOT AVAILABLE — this cycle is reviewer-only. Note this in `analytics_used` and in `notes_to_human`."
    )
    user = f"""GOAL
----
{summarize_for_prompt(goal)}

REVIEWER FINDINGS
-----------------
{findings_blob}

ANALYTICS (last 7 days)
-----------------------
{analytics_blob}

TASK
----
Produce a ranked changelist matching the schema. Honor the change_threshold and
cycle_limits exactly. If a finding is tempting but doesn't clear the bar, put it
in `rejected` with a clear reason — do not stuff borderline items into `approved`."""
    raw = call_with_tool(
        model=MANAGER_MODEL,
        system=SYSTEM,
        messages=[{"role": "user", "content": [{"type": "text", "text": user}]}],
        tool_name="submit_changelist",
        tool_description="Submit your ranked changelist.",
        input_schema=CHANGELIST_SCHEMA,
        max_tokens=4096,
    )
    return enforce_limits(raw, goal)


def enforce_limits(changelist: dict[str, Any], goal: dict[str, Any]) -> dict[str, Any]:
    """Pure, deterministic post-filter. Caps count and re-checks the threshold rule
    in case the LLM was generous with itself."""
    limits = goal["cycle_limits"]
    threshold_lift = goal["primary_metric"]["target_lift_per_cycle"]

    approved = list(changelist.get("approved", []))
    rejected = list(changelist.get("rejected", []))

    kept: list[dict[str, Any]] = []
    for item in approved:
        rule = item.get("passes_threshold_rule")
        lift = item.get("expected_lift_pct")
        clears_a = rule == "a" and isinstance(lift, (int, float)) and lift >= threshold_lift * 100
        clears_bcd = rule in ("b", "c", "d")
        if clears_a or clears_bcd:
            kept.append(item)
        else:
            rejected.append({
                "finding_id": item.get("finding_id", "?"),
                "reason": (
                    f"Post-filter: rule={rule} expected_lift_pct={lift} did not clear "
                    f">={threshold_lift*100:.0f}% bar and was not a (b)/(c)/(d) fix."
                ),
            })

    max_n = int(limits["max_changes_per_cycle"])
    kept.sort(key=lambda x: x.get("rank", 99))
    if len(kept) > max_n:
        for over in kept[max_n:]:
            rejected.append({
                "finding_id": over.get("finding_id", "?"),
                "reason": f"Post-filter: exceeds max_changes_per_cycle={max_n}.",
            })
        kept = kept[:max_n]
    for i, item in enumerate(kept, start=1):
        item["rank"] = i

    return {
        **changelist,
        "approved": kept,
        "rejected": rejected,
    }
