# The loop

How one cycle runs end-to-end, and the rules around it.

## One cycle

1. **Capture.** `agents/run_cycle.py` launches Playwright, navigates to the live
   URL for each route in `--routes`, and saves a full-page PNG per route to
   `cycles/YYYY-MM-DD/screenshots/`.
2. **Review.** The UX reviewer (`agents/reviewers/ux_reviewer.py`) sends the
   screenshots + the goal summary to `claude-sonnet-4-6`, forcing structured
   output via a `submit_findings` tool. Output → `cycles/YYYY-MM-DD/findings/ux.json`.
3. **Analytics (optional).** When `PLAUSIBLE_API_KEY` + `PLAUSIBLE_SITE_ID` are
   set, the manager fetches a 7-day aggregate + event breakdown. Output →
   `cycles/YYYY-MM-DD/analytics.json`. Without these env vars, the cycle still
   runs and the manager notes that signal was reviewer-only.
4. **Manage.** The manager (`agents/manager/manager.py`) sends goal + findings +
   analytics to `claude-opus-4-8`, which ranks and filters into a changelist.
   The result then passes through a deterministic `enforce_limits` post-filter
   that re-checks the change threshold and caps count. Output →
   `cycles/YYYY-MM-DD/changelist.json`.
5. **Human approval.** You read `changelist.json`. For each approved item:
   approve, modify, or skip.
6. **Implement.** For each approved item: a fresh branch
   `cycle/YYYY-MM-DD/change-N`, the change, tests still green, push, PR.
7. **Merge or revert.** PR merges to main when CI is green. Rollback =
   `git revert <merge-commit>` on main, or close the PR before merge.

## Files the loop touches

| File / dir            | Read by                  | Written by                          |
|-----------------------|--------------------------|-------------------------------------|
| `goal.yaml`           | reviewer, manager        | you (versioned, append-only history)|
| `web/`                | Playwright (screenshots) | implementer (per approved change)   |
| `cycles/YYYY-MM-DD/`  | you (review changelist)  | `run_cycle.py`                      |

## Threshold (from goal.yaml)

A proposed change ships only if it clears at least one of:

- **(a)** estimated lift on `primary_metric` ≥ 5% with stated reasoning,
- **(b)** fixes a clearly-broken UX state (error, broken affordance, regression),
- **(c)** fixes an accessibility violation.

The manager LLM picks the rule; `enforce_limits` re-checks it; you make the
final call. Three gates is intentional — the whole point of the threshold is
to keep low-impact churn from accumulating.

## Cycle limits (from goal.yaml)

- `max_changes_per_cycle: 3` — even if 10 findings clear the bar, only the top 3 ship.
- `max_lines_changed_per_change: 200` — keeps PRs reviewable.
- `branch_per_change: true` — rollback isolates to one PR.

## Rollback

Every implemented change is its own branch and its own PR. Three paths back:

- **Before merge.** Close the PR; nothing reaches main.
- **After merge, before users hit it.** `git revert <merge-commit> -m 1` →
  push → merge revert PR. The `cycles/YYYY-MM-DD/manifest.json` lets you trace
  which loop output the change came from.
- **After users hit it.** Same revert, plus tag `goal.yaml` with a learning entry
  in the next version bump.

## What v1 deliberately does NOT include

- Multi-reviewer panel — only UX for now. Add `content_reviewer`,
  `accessibility_reviewer`, etc. once the manual loop proves out.
- Cron / automation — every cycle is run by you typing `python run_cycle.py`.
- Auto-implementation — the implementer (me) only acts on approved items, never
  the raw reviewer findings.
- Cross-device sync — batch data is `localStorage` only.
