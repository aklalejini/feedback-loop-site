// Beginner-friendly sample batches the maker can load with one click. Each one
// is a tested combination — style + sweetness + vessel — solved through the
// same recipe engine the planner uses, then tagged with a one-line description
// of the END PRODUCT (taste, body, time-to-drink) so a first-time visitor can
// pick the result they want, not just the inputs.

import { applySolvedRecipe, solveRecipe } from "./recipeSolver";
import { SAMPLE_MEAD_NAME_PREFIX, blankMead, type Mead, type VesselKind, type YeastStrain } from "./mead";
import type { StyleKind } from "./styles";

export type SampleKind = "sweet_starter" | "light_cyser" | "dry_session" | "spiced_warmth";

export interface SampleSpec {
  kind: SampleKind;
  label: string;          // human-friendly title shown on the card
  endProduct: string;     // one sentence describing the FINISHED drink
  takeaway: string;       // a short ABV + "ready when" line
  style: StyleKind;
  targetSweetness: number; // 0..4 (Dry → Dessert)
  vessel: VesselKind;
  // Optional yeast override. The style's default yeast is fine for most samples,
  // but the dry session sample swaps to EC-1118 — a low-attenuation yeast like
  // 71B can't physically reach a dry FG at hydromel-strength OGs (the result
  // would be a 1.2% honey water).
  yeast?: YeastStrain;
  swatchColor: string;    // small chip colour next to the title
}

export const SAMPLES: SampleSpec[] = [
  {
    kind: "sweet_starter",
    label: "Sweet starter",
    endProduct: "A friendly off-dry mead with floral honey notes — easy first sip, easy first batch.",
    takeaway: "≈ 10% ABV · ready in ~2 months",
    style: "traditional",
    targetSweetness: 1,
    vessel: "jar-1gal",
    swatchColor: "#e3a23e",
  },
  {
    kind: "light_cyser",
    label: "Apple cyser",
    endProduct: "Apple-forward and round — drinks like a richer cider with honey body.",
    takeaway: "≈ 8% ABV · ready in ~6 weeks",
    style: "cyser",
    targetSweetness: 2,
    vessel: "jar-1gal",
    swatchColor: "#c98a2a",
  },
  {
    kind: "dry_session",
    label: "Dry session mead",
    endProduct: "Light and dry — the most drinkable option, lets the honey character lead.",
    takeaway: "≈ 6% ABV · ready in 4–6 weeks",
    style: "hydromel",
    targetSweetness: 0,
    vessel: "jar-1gal",
    yeast: "EC-1118",
    swatchColor: "#d6c08a",
  },
  {
    kind: "spiced_warmth",
    label: "Spiced metheglin",
    endProduct: "Warm cinnamon, vanilla, and orange peel layered over honey — a holiday pour.",
    takeaway: "≈ 11% ABV · rewards aging beyond the timeline",
    style: "metheglin",
    targetSweetness: 2,
    vessel: "jar-1gal",
    swatchColor: "#8a5310",
  },
];

// Build a fresh Mead at day 0 from a sample spec. Uses solveRecipe so the
// recipe stays in lock-step with what the planner would produce for the same
// style + sweetness + vessel.
export function buildSampleMead(spec: SampleSpec, now: Date = new Date()): Mead {
  const draft = { ...blankMead(`${SAMPLE_MEAD_NAME_PREFIX}${spec.label}`), vessel: spec.vessel, createdAt: now.toISOString() };
  const solved = solveRecipe({
    vesselCapacityL: 3.78, // 1-gal jar — every starter sample uses the small vessel
    style: spec.style,
    targetSweetness: spec.targetSweetness,
    yeast: spec.yeast,
  });
  // applySolvedRecipe owns honey/water/juice/yeast/spices + the style tag.
  return applySolvedRecipe(draft, solved, spec.style);
}

// Convenience for the home page: build all samples at once with a single `now`,
// so all four created-at timestamps are the same (the UI shows them all as
// "day 0" until one is chosen).
export function buildAllSamples(now: Date = new Date()): { spec: SampleSpec; mead: Mead }[] {
  return SAMPLES.map((spec) => ({ spec, mead: buildSampleMead(spec, now) }));
}
