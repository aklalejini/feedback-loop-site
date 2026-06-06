// TOSNA nutrient schedule for honey must.
//
// Honey-only must is nitrogen-poor, and low YAN is a leading cause of slow or
// stuck mead fermentation (docs/research "Yeast Nutrition and YAN"). TOSNA
// (Tailored Organic Staggered Nutrient Addition) is the widely-used community
// protocol popularized by Mead Made Right: Fermaid O split into four additions
// over the first week. It is a practical meadmaking protocol, NOT a lab YAN
// measurement or universal scientific law (docs/research "TOSNA", anti-goal).
//
// All numbers here trace to docs/research/mead-fermentation.md "TOSNA":
//   total_fermaid_o_g = (((Brix * 10) * factor) / 50) * batch_volume_gal
// verified against Example 3 (5 gal, 24 Brix, Medium -> 21.6 g, 5.4 g x4).

import { mustComposition, startingGravity, type Mead, type NitrogenNeed, type YeastStrain } from "./mead";

export const NITROGEN_FACTORS: Record<NitrogenNeed, number> = {
  low: 0.75,
  medium: 0.90,
  high: 1.25,
};

export const NITROGEN_NEED_LABELS: Record<NitrogenNeed, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const L_PER_GAL = 3.78541;

// Strains the research brief explicitly calls low nitrogen demand
// (docs/research "Yeast Reference Table": Lalvin 71B, ICV-D47). Everything else
// defaults to Medium; the brief recommends letting the user pick.
export function defaultNitrogenNeed(strain: YeastStrain): NitrogenNeed {
  if (strain === "D-47" || strain === "71B-1122") return "low";
  return "medium";
}

// Specific gravity -> degrees Brix (standard ASBC refractometer cubic).
export function sgToBrix(sg: number): number {
  return ((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622;
}

// One-third sugar break in SG terms (docs/research Example 2): og - (og - 1)/3.
export function oneThirdBreakSG(og: number): number {
  return og - (og - 1) / 3;
}

export interface NutrientAddition {
  label: string; // "24h after pitch", …
  at: string;    // ISO timestamp
  grams: number;
  note?: string;
}

export interface NutrientSchedule {
  protocol: "TOSNA";
  product: "Fermaid O";
  nitrogenNeed: NitrogenNeed;
  brix: number;
  volumeGal: number;
  totalGrams: number;
  perAdditionGrams: number;
  oneThirdBreakSG: number;
  additions: NutrientAddition[];
}

// Returns null for an empty/too-dilute must (no meaningful schedule).
export function tosnaSchedule(mead: Mead, override?: NitrogenNeed): NutrientSchedule | null {
  const og = startingGravity(mead);
  const volumeL = mustComposition(mead).totalL;
  if (og <= 1.0001 || volumeL <= 0.01) return null;

  const nitrogenNeed = override ?? mead.nitrogenNeed ?? defaultNitrogenNeed(mead.yeast);
  const factor = NITROGEN_FACTORS[nitrogenNeed];
  const brix = sgToBrix(og);
  const volumeGal = volumeL / L_PER_GAL;
  const totalGrams = (((brix * 10) * factor) / 50) * volumeGal;
  const perAdditionGrams = totalGrams / 4;
  const breakSG = oneThirdBreakSG(og);

  const start = new Date(mead.createdAt).getTime();
  const HOUR = 3_600_000;
  const at = (hours: number) => new Date(start + hours * HOUR).toISOString();
  const additions: NutrientAddition[] = [
    { label: "24h after pitch", at: at(24), grams: perAdditionGrams },
    { label: "48h after pitch", at: at(48), grams: perAdditionGrams },
    { label: "72h after pitch", at: at(72), grams: perAdditionGrams },
    {
      label: "1/3 sugar break or day 7",
      at: at(24 * 7),
      grams: perAdditionGrams,
      note: `whichever comes first (≈ SG ${breakSG.toFixed(3)})`,
    },
  ];

  return {
    protocol: "TOSNA",
    product: "Fermaid O",
    nitrogenNeed,
    brix,
    volumeGal,
    totalGrams,
    perAdditionGrams,
    oneThirdBreakSG: breakSG,
    additions,
  };
}
