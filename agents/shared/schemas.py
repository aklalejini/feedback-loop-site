"""JSON schemas for forced structured output. Kept in one place so reviewer
and manager agree on shape."""

FINDING_LIST_SCHEMA = {
    "type": "object",
    "required": ["findings"],
    "properties": {
        "findings": {
            "type": "array",
            "maxItems": 12,
            "items": {
                "type": "object",
                "required": [
                    "id", "title", "description", "evidence",
                    "estimated_impact", "estimated_effort",
                    "metric_affected", "category", "suggested_change",
                ],
                "properties": {
                    "id": {"type": "string", "description": "Short stable slug, e.g. 'cta_below_fold'."},
                    "title": {"type": "string", "description": "One-line summary."},
                    "description": {"type": "string", "description": "What's wrong (or what could be better) and why it matters to the mission."},
                    "evidence": {"type": "string", "description": "Concrete observation from the screenshot/page that supports this — pixel landmarks, missing affordances, copy quoted."},
                    "estimated_impact": {"type": "string", "enum": ["low", "medium", "high"]},
                    "estimated_effort": {"type": "string", "enum": ["low", "medium", "high"]},
                    "metric_affected": {
                        "type": "string",
                        "enum": ["primary", "secondary", "neither"],
                        "description": "Which goal.yaml metric this most plausibly moves.",
                    },
                    "category": {
                        "type": "string",
                        "enum": ["ux", "accessibility", "content", "performance", "trust", "visual", "other"],
                    },
                    "anti_goal_risk": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Anti-goals from goal.yaml that this proposal could conflict with. Empty if none.",
                    },
                    "suggested_change": {"type": "string", "description": "Concrete, scoped action the implementer can take."},
                },
            },
        },
    },
}

CHANGELIST_SCHEMA = {
    "type": "object",
    "required": ["summary", "analytics_used", "rejected", "approved"],
    "properties": {
        "summary": {"type": "string", "description": "One-paragraph rationale for the cycle's picks."},
        "analytics_used": {"type": "boolean", "description": "True if real behavior signals were available, false if reviewer-only."},
        "rejected": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["finding_id", "reason"],
                "properties": {
                    "finding_id": {"type": "string"},
                    "reason": {"type": "string", "description": "Why this didn't make the cut — threshold miss, anti-goal conflict, redundancy, etc."},
                },
            },
        },
        "approved": {
            "type": "array",
            "maxItems": 3,
            "items": {
                "type": "object",
                "required": [
                    "rank", "finding_id", "change_description", "rationale",
                    "passes_threshold_rule", "effort", "files_likely_touched",
                ],
                "properties": {
                    "rank": {"type": "integer", "minimum": 1, "maximum": 3},
                    "finding_id": {"type": "string"},
                    "change_description": {"type": "string", "description": "What the implementer will do — actionable, scoped."},
                    "rationale": {"type": "string"},
                    "expected_lift_pct": {
                        "type": ["number", "null"],
                        "description": "Estimated % lift on primary metric, null when justified by rule (b)/(c).",
                    },
                    "passes_threshold_rule": {
                        "type": "string",
                        "enum": ["a", "b", "c", "d"],
                        "description": "(a) >=5% lift, (b) UX bug fix, (c) a11y fix, (d) factual/accuracy or safety fix.",
                    },
                    "effort": {"type": "string", "enum": ["low", "medium", "high"]},
                    "files_likely_touched": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Best-guess repo paths the change will modify.",
                    },
                },
            },
        },
        "notes_to_human": {"type": "string", "description": "Anything the approver should know before yes/no."},
    },
}
