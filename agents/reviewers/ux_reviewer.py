"""UX specialist reviewer. Takes the live URL + screenshot(s) + goal, returns findings."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from shared.goal import summarize_for_prompt
from shared.llm import REVIEWER_MODEL, call_with_tool, image_block
from shared.schemas import FINDING_LIST_SCHEMA

REVIEWER_NAME = "ux_reviewer"

SYSTEM = """You are a UX reviewer. You look at a live web page (URL + screenshot)
and identify the specific friction, confusion, or missed-opportunity moments that
prevent visitors from completing the goal. You are blunt and concrete.

Rules:
- Ground every finding in something visible in the screenshot or visitable at the URL.
- Prefer one sharp finding over three vague ones. Quality > quantity.
- Do not propose changes that violate the listed anti-goals.
- Estimate impact against the PRIMARY METRIC, not generic 'engagement'.
- If a finding has any anti-goal risk, list it — the manager needs to know.
- If the page looks fine for now, return zero findings. Do not invent issues."""


def user_prompt(goal_summary: str, url: str, routes: list[str]) -> str:
    return f"""GOAL CONTEXT
------------
{goal_summary}

LIVE TARGET
-----------
URL: {url}
Routes captured: {", ".join(routes)}

TASK
----
Review the attached screenshot(s). Identify UX issues that, if fixed, would most
plausibly improve the primary metric. For each finding produce a row matching the
required schema. Use the `id` field as a short stable slug so it can be referenced
later (e.g. "empty_state_lacks_example", "cta_competes_with_link"). Cap at 6 findings."""


def review(*, goal: dict[str, Any], url: str, screenshots: dict[str, Path]) -> dict[str, Any]:
    routes = list(screenshots.keys())
    content: list[dict[str, Any]] = []
    for name, path in screenshots.items():
        content.append({"type": "text", "text": f"Screenshot: {name}"})
        content.append(image_block(path))
    content.append({"type": "text", "text": user_prompt(summarize_for_prompt(goal), url, routes)})

    result = call_with_tool(
        model=REVIEWER_MODEL,
        system=SYSTEM,
        messages=[{"role": "user", "content": content}],
        tool_name="submit_findings",
        tool_description="Submit your UX findings as a structured list.",
        input_schema=FINDING_LIST_SCHEMA,
        max_tokens=4096,
    )
    return {
        "reviewer": REVIEWER_NAME,
        "model": REVIEWER_MODEL,
        "url": url,
        "routes": routes,
        "findings": result.get("findings", []),
    }
