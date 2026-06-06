# Plant by ZIP — Lessons for the Mead Site

Reference document for carrying the strongest discoveries from a prior project
([plantbyzip.com](https://www.plantbyzip.com)) into this mead fermentation site.

Source: provided by the owner, 2026-06-06. Captured here verbatim so the
feedback-loop agents and future contributors can reference it.

---

## Executive Summary

A site grows fastest when a useful tool, a trustworthy knowledge base, and clear
crawlable content reinforce each other. The homepage utility gets users to act.
Database-backed pages give search engines and readers something durable. The
design language creates trust. Measurement and conversion loops make traffic
valuable instead of disposable.

For a mead site the equivalent opportunity:

- **Tool layer:** batch planner, ABV calculator, nutrient schedule, yeast
  selector, sweetness/backsweetening calculator, fermentation timeline,
  troubleshooting assistant.
- **Structured knowledge base:** honey varietals, yeast strains, additives,
  equipment, fermentation faults, recipes, process methods.
- **Crawlable content hubs:** beginner guide, calculators, yeast guides, honey
  guides, "why did my mead…" troubleshooting pages, style pages, recipes.
- **Retention loop:** save a batch plan, email fermentation reminders, log
  readings, return for stabilization, backsweetening, bottling, troubleshooting.

The highest-value version is a **decision layer for home mead makers**:
practical, data-backed, sensory-aware, beginner-friendly without being shallow.
Not only a blog; not only a calculator.

## Core Product Principles

1. **Lead with utility.** First screen is a real tool, not a marketing hero.
   ("Plan a batch", "Calculate ABV", "Fix a fermentation problem", "Choose a
   yeast".)
2. **Do not hide too much before input.** Wait for input to show personalized
   output, but show all controls and starter presets up front.
3. **Make interactive value crawlable.** Search-driven tools alone aren't
   enough; publish durable indexable URLs (e.g. `/mead-abv-calculator/`,
   `/yeast/lalvin-71b/`, `/problems/stalled-fermentation/`).
4. **Prefer database-backed pages over thin fan-out.** Publish a page only when
   it has materially useful content (entities, problems, calculators) — not one
   per possible numeric state.

## Website Design Lessons

- **Match the visual system to the domain.** "Fermentation lab meets old cellar
  notebook." Warm but precise and process-oriented; avoid fantasy-tavern unless
  intended. Cues: carboys, hydrometers, honey jars, yeast packets, batch logs,
  airlocks; dense readable tool panels; comparison tables.
- **Use real photos where trust matters** (active fermentation, lees, clarity,
  hydrometer readings, yeast packets, honey varietals, equipment). Captions
  describe what the user sees — never internal QA language.
- **Keep tool layouts dense and calm.** Tabs for workflows; segmented controls
  for sweetness; sliders/numeric for batch size/ABV/gravity/temp; tables for
  yeast/recipe comparison; tooltips for jargon; save/print/export. Avoid huge
  decorative cards, marketing heroes inside tools, nested cards, redundant copy,
  text overflow.
- **Mobile is a hard requirement.** Large tappable inputs; key output near
  input; long tables become cards or sticky-first-column; tooltips wrap; buttons
  don't resize layout on label change; saved steps scannable one screen at a time.

## Content & SEO Lessons

- **Hub-and-spoke.** Hubs: beginner, calculators, yeast, honey, troubleshooting,
  styles, recipes — each linking tools, guides, and entity pages.
- **Intent-based page types:** tool landing, entity profile, comparison ("D47 vs
  71B"), problem ("why sulfur smell"), process guide, recipe, ingredient
  profile, equipment guide.
- **Complete, satisfying pages.** Yeast profile fields: alcohol tolerance, temp
  range, flavor, nutrient demand, flocculation/clearing, best styles, risks,
  common mistakes, comparable yeasts, nutrient schedule, recipe links, sources,
  last-reviewed. Problem page fields: symptoms, likely causes, what to check
  first, when to wait, when to intervene, what not to do, prevention, related
  tool, sources.
- **Remove placeholder / internal language.** Never expose "Needs source",
  "vetted", "TODO", "affiliate placeholder". Use user-facing confidence wording:
  "estimate", "typical range", "check your yeast manufacturer's data sheet".
- **Trust signals early** (food/alcohol/sanitation/sulfites/legal): methodology,
  editorial policy, about, source list, last-reviewed dates, education-vs-safety
  distinction, links to manufacturers/extension/reputable references.

## Data Model Lessons

- **Structured data from the beginning.** `yeasts.json`, `honeyVarietals.json`,
  `recipes.json`, `ingredients.json`, `equipment.json`, `problems.json`,
  `styles.json`, `calculators.json`, `sources.json`.
- **Keep metrics generated, not hand-maintained** (ABV, honey-for-target-gravity,
  nutrient schedule, stabilization additions, timeline, bottle count, scaling,
  shopping list) — so pages and calculators never disagree.
- **Attach sources to records.** Every technical claim traceable.

## Monetization Lessons

- **Build conversion before scaling traffic.** Primary conversions: save batch
  plan, email fermentation schedule, bottling/stabilization reminders, save
  readings. Then calculator/profile/guide use. Affiliate is tertiary.
- **Affiliate links subtle and real.** Practical wording ("See yeast options",
  "Find one-gallon equipment"); avoid "Buy now / Best deal / Must-have". Best
  surfaces: equipment checklist, recipe shopping list, tool output ("for this
  batch you need…"), beginner kit guide.
- **Owned audience beats affiliate.** Mead's multi-week timeline makes saved
  plans + email reminders especially valuable. Paid: batch history, cellar
  tracker, automated nutrient schedule, stabilization/backsweetening planner,
  fault diagnosis, scaling/bottle count, printable brew sheet.
- **Email is especially valuable for mead** (timed follow-ups: pitch → nutrient
  additions → gravity check → racking/stabilization → clearing/aging/bottling).

## Measurement Lessons

- **Install GA4 + Search Console early** (or at launch). Track impressions,
  clicks, landing engagement, calculator starts/completions, saved plans, email
  signups, affiliate clicks, return visits.
- **Define useful events:** `batch_plan_start/complete`, `abv_calculate`,
  `nutrient_schedule_generate`, `backsweetening_calculate`, `yeast_filter_apply`,
  `yeast_profile_view`, `recipe_view/scale`, `troubleshooting_start`,
  `problem_diagnosis_view`, `save_batch`, `email_signup`, `print_recipe`,
  `share_click`, `outbound_partner_click`, `return_visit_30d`.

## Technical Workflow Lessons

- **Validate data before building** (unique IDs, required fields, valid source
  keys, image sizes, no placeholder copy, calculator outputs in range, no broken
  links).
- **Always build and browser-test** (desktop + mobile, new page, homepage, a
  calculator interaction, horizontal overflow, images, nav/tabs, live deploy).
- **Keep batch edits scoped** (e.g. "add 20 yeast profiles", "add one
  calculator") — don't mix data expansion with design refactors.

## Recommended Structure

- **Nav:** Batch Planner · Calculators · Yeast · Troubleshooting · Recipes · Guides
- **First entities:** ~20-30 yeasts, ~20 honey types, ~15 faults, ~20 beginner
  recipes, ~10 equipment, ~8 styles, ~10 process guides.
- **Tools in order:** ABV calc → batch planner → honey-to-gravity → nutrient
  schedule → backsweetening → yeast selector → troubleshooting.
- **First SEO hubs:** `/mead-abv-calculator/`, `/how-to-make-mead/`,
  `/mead-nutrient-calculator/`, `/best-yeast-for-mead/`, `/mead-troubleshooting/`,
  `/one-gallon-mead-recipe/`, `/backsweetening-mead/`, `/stalled-mead-fermentation/`,
  `/why-does-my-mead-smell-like-sulfur/`, `/dry-vs-sweet-mead/`.

## Mistakes To Avoid

Hiding controls before input · thin programmatic pages · visible placeholders ·
aggressive affiliate language · decorative-when-instructional images · mobile
overflow · marketing homepage instead of a tool · search-box-only discovery ·
advice without sources · affiliate-first business model · one-size-fits-all
advice where fermentation variables matter.

## Tone

Calm, specific, practical, honest about uncertainty, encouraging without hype,
clear on safety/sanitation. Speak to the maker at the bench, not to the site
owner.

> "If the gravity has not moved in 72 hours, check temperature first. A cool
> basement can slow D47 dramatically before anything is actually wrong."

## The Big Transferable Insight

Plant by ZIP isn't a plant database — it's a **personalized decision layer over
gardening knowledge**. Reuse that model. The mead site should be a personalized
decision layer over fermentation knowledge that answers: What should I make? How
much honey? Which yeast? What should my gravity be? What do I do today? Is my
batch okay? When do I rack/stabilize/backsweeten/bottle? What should I buy? How
do I avoid repeating this mistake? — saves the plan, and brings the user back at
the right fermentation moments.
