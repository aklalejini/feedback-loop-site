# Reference material

Durable domain + strategy inputs for the mead site. These are **reference for the
feedback loop** — reviewer and manager agents can cite them, and the calculator's
facts/data should trace back here.

| File | What it is | Use |
|---|---|---|
| [`mead-fermentation.md`](./mead-fermentation.md) | Sourced research brief: gravity/ABV math, honey PPG, yeast data, YAN/TOSNA nutrient schedules, timeline bands, faults, stabilization/backsweetening safety, confidence labels, suggested data structures. | The factual backbone for the projection model, nutrient calculator, safety warnings, and structured data files (`yeasts.json`, etc.). |
| [`../strategy/plant-by-zip-lessons.md`](../strategy/plant-by-zip-lessons.md) | Transferable lessons from a prior successful site: lead-with-utility, crawlable DB-backed pages, hub-and-spoke SEO, measurement, retention/email, subtle monetization. | Product/architecture direction. Several points interact with `goal.yaml` (analytics stance, mission, anti-goals) and should be reconciled there, not assumed. |

Every technical claim shown to users should be traceable to a source in the
research brief (the brief keeps its own source list).
