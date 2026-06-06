"""Orchestrate one full cycle: capture → review → manage → write artifacts.

Usage:
  python run_cycle.py --url http://localhost:3000
  python run_cycle.py --url https://your-site.example.com --routes / /mead/sample
  python run_cycle.py --url http://localhost:3000 --dry-run
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import date
from pathlib import Path

from manager.manager import synthesize
from reviewers.domain_reviewer import review as domain_review
from reviewers.ux_reviewer import review as ux_review
from shared.analytics import fetch_snapshot
from shared.goal import load_goal
from shared.screenshot import capture

REPO_ROOT = Path(__file__).resolve().parents[1]
CYCLES_DIR = REPO_ROOT / "cycles"

DRY_RUN_FINDINGS = {
    "reviewer": "ux_reviewer",
    "model": "dry-run",
    "url": "dry-run",
    "routes": ["home"],
    "findings": [
        {
            "id": "empty_state_lacks_example",
            "title": "Empty state has no example batch to inspect",
            "description": "First-time visitors see only 'No batches yet' — no way to preview what the tool does without committing to filling the form.",
            "evidence": "Home route shows an empty list with only a 'New batch' button. No demo, no thumbnail.",
            "estimated_impact": "high",
            "estimated_effort": "low",
            "metric_affected": "primary",
            "category": "ux",
            "anti_goal_risk": [],
            "suggested_change": "Add a 'Try with a sample batch' button on the empty state that loads a pre-filled demo batch.",
        }
    ],
}


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--url", required=True, help="Base URL of the live site.")
    p.add_argument(
        "--routes",
        nargs="*",
        default=["/"],
        help="Routes to screenshot (default: /). Pre-existing /mead/<id> can be added when a sample batch is seeded.",
    )
    p.add_argument("--dry-run", action="store_true", help="Skip LLM calls; use fixture findings.")
    args = p.parse_args()

    started = time.time()
    today = date.today().isoformat()
    cycle_dir = CYCLES_DIR / today
    (cycle_dir / "screenshots").mkdir(parents=True, exist_ok=True)
    (cycle_dir / "findings").mkdir(parents=True, exist_ok=True)

    goal = load_goal()

    if args.dry_run:
        print(f"[cycle {today}] dry-run: skipping screenshot + LLM")
        screenshots = {}
        ux_findings = DRY_RUN_FINDINGS
        domain_findings = {
            "reviewer": "domain_reviewer", "model": "dry-run",
            "url": "dry-run", "routes": ["home"], "findings": [],
        }
    else:
        print(f"[cycle {today}] capturing screenshots…")
        screenshots = capture(args.url, args.routes, cycle_dir / "screenshots")
        print(f"[cycle {today}] running UX reviewer ({len(screenshots)} screenshots)…")
        ux_findings = ux_review(goal=goal, url=args.url, screenshots=screenshots)
        print(f"[cycle {today}] running domain reviewer…")
        domain_findings = domain_review(goal=goal, url=args.url, screenshots=screenshots)

    (cycle_dir / "findings" / "ux.json").write_text(
        json.dumps(ux_findings, indent=2), encoding="utf-8",
    )
    (cycle_dir / "findings" / "domain.json").write_text(
        json.dumps(domain_findings, indent=2), encoding="utf-8",
    )

    analytics = fetch_snapshot()
    if analytics is not None:
        (cycle_dir / "analytics.json").write_text(
            json.dumps(analytics, indent=2), encoding="utf-8",
        )
        print(f"[cycle {today}] analytics: present")
    else:
        print(f"[cycle {today}] analytics: not configured (reviewer-only signal)")

    if args.dry_run:
        changelist = {
            "summary": "Dry-run: passing the sample finding straight through.",
            "analytics_used": False,
            "rejected": [],
            "approved": [{
                "rank": 1,
                "finding_id": "empty_state_lacks_example",
                "change_description": "Add a 'Try with a sample batch' button on the empty home state that loads a pre-filled demo batch.",
                "rationale": "Reduces first-action friction for new visitors — should lift batch_creation_rate and engaged_sessions.",
                "expected_lift_pct": 8,
                "passes_threshold_rule": "a",
                "effort": "low",
                "files_likely_touched": ["web/app/page.tsx", "web/lib/mead.ts"],
            }],
            "notes_to_human": "Dry run output; verify by re-running without --dry-run before approving.",
        }
    else:
        print(f"[cycle {today}] running manager…")
        changelist = synthesize(goal=goal, reviews=[ux_findings, domain_findings], analytics=analytics)

    (cycle_dir / "changelist.json").write_text(
        json.dumps(changelist, indent=2), encoding="utf-8",
    )

    manifest = {
        "cycle_date": today,
        "url": args.url,
        "routes": args.routes,
        "dry_run": args.dry_run,
        "reviewers": ["ux_reviewer", "domain_reviewer"],
        "analytics_used": analytics is not None,
        "duration_seconds": round(time.time() - started, 2),
    }
    (cycle_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"\n[cycle {today}] done in {manifest['duration_seconds']}s")
    print(f"  artifacts: {cycle_dir.relative_to(REPO_ROOT)}/")
    print(f"  approved:  {len(changelist.get('approved', []))}")
    print(f"  rejected:  {len(changelist.get('rejected', []))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
