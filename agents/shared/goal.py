"""Load and summarize goal.yaml for prompt injection."""
from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


def load_goal(path: Path | str | None = None) -> dict[str, Any]:
    if path is None:
        path = Path(__file__).resolve().parents[2] / "goal.yaml"
    path = Path(path)
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def summarize_for_prompt(goal: dict[str, Any]) -> str:
    """Compact rendering of goal.yaml for agent prompts. Keeps token use small."""
    lines: list[str] = []
    lines.append(f"MISSION: {goal['mission'].strip()}")
    pm = goal["primary_metric"]
    lines.append(f"PRIMARY METRIC ({pm['name']}): {pm['definition'].strip()}")
    lines.append(f"  source: {pm['source']}  ship_bar: lift >= {pm['target_lift_per_cycle']*100:.0f}%")
    lines.append("SECONDARY METRICS:")
    for sm in goal.get("secondary_metrics", []):
        lines.append(f"  - {sm['name']}: {sm['definition']}")
    lines.append("CONSTRAINTS:")
    for c in goal.get("constraints", []):
        lines.append(f"  - {c}")
    lines.append("ANTI-GOALS (do not propose changes that violate these):")
    for a in goal.get("anti_goals", []):
        lines.append(f"  - {a}")
    ct = goal["change_threshold"]
    lines.append(f"CHANGE THRESHOLD: {ct['rule'].strip()}")
    cl = goal["cycle_limits"]
    lines.append(f"CYCLE LIMITS: max {cl['max_changes_per_cycle']} changes/cycle, "
                 f"<= {cl['max_lines_changed_per_change']} lines/change")
    return "\n".join(lines)
