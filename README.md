# feedback-loop-site

A website that improves itself through a daily multi-agent feedback loop.

The site itself is **a mead fermentation planner**: design a batch, see a projected
timeline as an evolving visual, log observations as fermentation progresses. The site
is the testbed; the loop is the experiment.

## The loop

```
goal.yaml ──┐
            │
live site ──┼──> [specialist reviewers] ──> findings.json ──┐
screenshot ─┘                                                │
                                                             v
analytics ──────────────────────────────────> [manager] ──> changelist.json
                                                             │
                                              human approval (you)
                                                             │
                                                             v
                                                        implementation
                                                        (Claude on a branch)
                                                             │
                                                             v
                                                          merge / revert
```

Everything is graded against [`goal.yaml`](./goal.yaml). The manager enforces
[`change_threshold`](./goal.yaml) and `cycle_limits` so we don't ship churn.

## Layout

```
goal.yaml          # the contract everything is graded against (versioned)
web/               # Next.js app — the site itself
agents/            # Python — reviewer + manager
cycles/            # dated artifacts from each loop cycle
docs/loop.md       # how the loop works in practice
```

## Running v1

### The site
```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests for fermentation projection
```

### One loop cycle (manual)
```bash
cd agents
python -m venv .venv && source .venv/bin/activate
pip install -e .
playwright install chromium

export ANTHROPIC_API_KEY=...
# Analytics is Vercel Web Analytics (no API key); the manager runs
# reviewer-only until a queryable analytics source is wired.

python run_cycle.py --url http://localhost:3000
# outputs to cycles/YYYY-MM-DD/
```

## Rollback

Every implemented change ships on its own branch (`cycle/YYYY-MM-DD/change-N`)
and merges via PR. Rollback = `git revert <merge-commit>` or close the PR.
See [docs/loop.md](./docs/loop.md).

## Status

**v1 — manual loop, one reviewer (UX), one tool (mead planner).** No cron yet;
no full reviewer panel yet. We scale once this slice works end to end.
