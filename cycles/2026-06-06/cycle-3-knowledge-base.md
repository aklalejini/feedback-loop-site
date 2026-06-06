# Cycle 3 — Knowledge base (owner-directed)

Implements the `no_knowledge_base_pages` domain finding deferred by the cycle-1
manager as a multi-cycle build (see `changelist.json`). This is the strategy
doc's core SEO bet: durable, crawlable, database-backed entity pages with real
URLs and internal links.

## Scope this cycle
- **Change 6 — Yeast knowledge base.** Statically-generated `/yeast` index +
  `/yeast/[slug]` profiles for the four Lallemand strains the research brief
  documents (71B, ICV-D47, EC-1118, K1-V1116), each with sourced temperature,
  alcohol tolerance, nitrogen notes, sensory profile, citations, and a CTA into
  the planner. Per-page SEO metadata + canonical/OpenGraph.
- **Change 7 — SEO plumbing.** `sitemap.ts`, `robots.ts`, and a site-wide nav
  link so crawlers and users reach the KB.

## Deliberately deferred (cycle 4+)
- Honey varietal pages and a troubleshooting/problem hub (stuck fermentation,
  H2S, off-flavors) — both well-sourced in the brief.
- Wyeast-4632 and "Bread" yeast profiles — the brief has no sourced data for
  them, so they are not published (no unsourced numbers).
- Deep-linking the planner with a preselected yeast (`?yeast=`).
- JSON-LD structured data.

## Grounding
All yeast facts trace to docs/research/mead-fermentation.md "Product Table for
Common Mead Yeasts" and the per-strain Lallemand source URLs.
