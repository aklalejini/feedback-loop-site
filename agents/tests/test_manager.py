"""Tests for the deterministic part of the manager — `enforce_limits`."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manager.manager import enforce_limits


GOAL = {
    "primary_metric": {"target_lift_per_cycle": 0.05},
    "cycle_limits": {"max_changes_per_cycle": 3, "max_lines_changed_per_change": 200},
}


def _approved(finding_id: str, rule: str, lift: float | None, rank: int = 1) -> dict:
    return {
        "rank": rank,
        "finding_id": finding_id,
        "change_description": "...",
        "rationale": "...",
        "expected_lift_pct": lift,
        "passes_threshold_rule": rule,
        "effort": "low",
        "files_likely_touched": ["web/app/page.tsx"],
    }


def test_rejects_below_threshold_a():
    cl = {
        "summary": "x",
        "analytics_used": False,
        "approved": [_approved("low_lift", "a", 3.0)],
        "rejected": [],
    }
    out = enforce_limits(cl, GOAL)
    assert out["approved"] == []
    assert any(r["finding_id"] == "low_lift" for r in out["rejected"])


def test_keeps_at_threshold_a():
    cl = {
        "summary": "x",
        "analytics_used": False,
        "approved": [_approved("at_bar", "a", 5.0)],
        "rejected": [],
    }
    out = enforce_limits(cl, GOAL)
    assert len(out["approved"]) == 1
    assert out["approved"][0]["finding_id"] == "at_bar"


def test_keeps_bug_fix_with_no_lift_estimate():
    cl = {
        "summary": "x",
        "analytics_used": False,
        "approved": [_approved("a11y_fix", "c", None)],
        "rejected": [],
    }
    out = enforce_limits(cl, GOAL)
    assert len(out["approved"]) == 1


def test_caps_at_max_changes():
    cl = {
        "summary": "x",
        "analytics_used": False,
        "approved": [
            _approved("one", "a", 10, rank=1),
            _approved("two", "a", 10, rank=2),
            _approved("three", "a", 10, rank=3),
            _approved("four", "a", 10, rank=4),
        ],
        "rejected": [],
    }
    out = enforce_limits(cl, GOAL)
    assert len(out["approved"]) == 3
    assert [a["finding_id"] for a in out["approved"]] == ["one", "two", "three"]
    assert any(r["finding_id"] == "four" for r in out["rejected"])


def test_renumbers_ranks_after_cap():
    cl = {
        "summary": "x",
        "analytics_used": False,
        "approved": [
            _approved("a", "a", 10, rank=5),
            _approved("b", "a", 10, rank=9),
        ],
        "rejected": [],
    }
    out = enforce_limits(cl, GOAL)
    assert [a["rank"] for a in out["approved"]] == [1, 2]


def test_unknown_rule_is_rejected():
    cl = {
        "summary": "x",
        "analytics_used": False,
        "approved": [_approved("weird", "z", 50)],  # invalid rule code
        "rejected": [],
    }
    out = enforce_limits(cl, GOAL)
    assert out["approved"] == []
    assert any(r["finding_id"] == "weird" for r in out["rejected"])
