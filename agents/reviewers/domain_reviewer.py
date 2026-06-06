"""Domain / strategy reviewer.

Looks at the live site through the lens of goal.yaml v2 (the "decision-layer"
mission) and two reference docs:

  - docs/research/mead-fermentation.md  (factual / safety backbone)
  - docs/strategy/plant-by-zip-lessons.md (product / SEO / retention strategy)

Returns findings about tool accuracy, trust/safety, knowledge depth,
discovery/SEO, and retention — NOT pure UX (that's the UX reviewer's job).
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from shared.goal import summarize_for_prompt
from shared.llm import REVIEWER_MODEL, call_with_tool, image_block
from shared.schemas import FINDING_LIST_SCHEMA

REVIEWER_NAME = "domain_reviewer"

REPO_ROOT = Path(__file__).resolve().parents[2]
RESEARCH_PATH = REPO_ROOT / "docs" / "research" / "mead-fermentation.md"
STRATEGY_PATH = REPO_ROOT / "docs" / "strategy" / "plant-by-zip-lessons.md"
MAX_DOC_CHARS = 18_000  # cap each doc's slice into the prompt

SYSTEM = """You are a domain + strategy reviewer for a mead-making decision
layer. You read the goal, the sourced research brief, and the strategy doc,
then look at the live site (URL + screenshots) and identify the highest-impact
gaps in tool accuracy, trust/safety, knowledge depth, discovery/SEO, and
retention — judged against goal.yaml.

Rules:
- Focus on the DECISION-LAYER mission (planning + tracking + sourced KB),
  not pure visual UX. The UX reviewer covers that.
- Every factual claim in a finding must be groundable in the research brief
  (cite the section heading inline, e.g. 'per "Gravity and ABV Calculations"').
- Never propose anything that violates anti-goals (no signup walls, no GA4,
  no dark patterns, no commercial/regulatory ABV claims, no presenting
  community protocols as universal scientific law).
- Estimate impact against the PRIMARY metric (engaged_sessions, as redefined
  in v2) or call out (b)/(c)/(d) under the change_threshold when relevant.
- Prefer one sharp finding over three vague ones. Cap at 8.
- If a finding has any anti-goal risk, list it — the manager needs to know."""


def _doc_slice(path: Path) -> str:
    if not path.exists():
        return f"[missing: {path.name}]"
    text = path.read_text(encoding="utf-8")
    if len(text) > MAX_DOC_CHARS:
        return text[:MAX_DOC_CHARS] + f"\n\n[truncated — {len(text) - MAX_DOC_CHARS} more chars]"
    return text


def user_prompt(goal_summary: str, url: str, routes: list[str]) -> str:
    return f"""GOAL (v2 contract)
------------------
{goal_summary}

RESEARCH BRIEF (factual + safety backbone)
------------------------------------------
{_doc_slice(RESEARCH_PATH)}

STRATEGY DOC (product / SEO / retention model)
----------------------------------------------
{_doc_slice(STRATEGY_PATH)}

LIVE TARGET
-----------
URL: {url}
Routes captured: {", ".join(routes)}

TASK
----
Review the screenshot(s) and what's visible at the URL. Identify the
highest-impact gaps between the live site and the decision-layer mission,
graded against goal.yaml v2 and grounded in the research brief.

For each finding fill the required schema. Use the `id` as a stable slug
(e.g. "no_measured_og_override", "missing_tosna_schedule",
"no_completion_safety_warning", "no_yeast_profile_pages"). Cap at 8."""


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
        tool_description="Submit your domain + strategy findings as a structured list.",
        input_schema=FINDING_LIST_SCHEMA,
        max_tokens=6144,
    )
    return {
        "reviewer": REVIEWER_NAME,
        "model": REVIEWER_MODEL,
        "url": url,
        "routes": routes,
        "findings": result.get("findings", []),
    }
