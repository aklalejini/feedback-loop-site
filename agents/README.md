# agents

Reviewer + manager for the daily feedback loop.

## Layout

```
shared/         goal loading, LLM client, screenshot capture, analytics
reviewers/      one specialist per file — v1 has ux_reviewer only
manager/        synthesizes findings → ranked changelist, enforces goal.yaml
schemas/        JSON schemas for findings + changelist
run_cycle.py    one full cycle (capture → review → manage → write artifacts)
tests/          pytest — pure-logic tests for ranking and threshold
```

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
playwright install chromium
cp .env.example .env  # then fill in ANTHROPIC_API_KEY
```

## Run one cycle

```bash
# against local dev server:
python run_cycle.py --url http://localhost:3000

# against a deployed URL:
python run_cycle.py --url https://your-site.example.com

# dry run (no LLM calls; uses fixture findings):
python run_cycle.py --url http://localhost:3000 --dry-run
```

Outputs land in `../cycles/YYYY-MM-DD/`:

```
cycles/2026-06-06/
  screenshots/home.png
  screenshots/detail.png
  findings/ux.json
  analytics.json          # only when a queryable analytics source is wired
  changelist.json         # what the manager wants to ship
  manifest.json           # what was run, what models, run duration
```

## Tests

```bash
pytest
```
