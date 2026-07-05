// Calculator math — pure, no UI (testable in isolation).
// Formulas and validation ranges from docs/research/mead-fermentation.md
// ("Gravity and ABV Calculations", "Sweetness, FG, and Residual Sugar",
// "Stabilization, Backsweetening, and Packaging Safety").

import { HONEY_DENSITY_L_PER_KG, HONEY_GRAVITY_PER_KG_PER_L } from "./mead";
//
// Basic: ABV = (OG − FG) × 131.25 — the standard homebrew approximation,
// shown by default for transparency.
// High-gravity: ABV = 76.08 × (OG − FG) / (1.775 − OG) × (FG / 0.794) — an
// empirical variant for stronger ferments, where density change isn't linear
// with alcohol. Surfaced alongside the basic number once OG is high enough.

export function abvBasic(og: number, fg: number): number {
  return (og - fg) * 131.25;
}

export function abvHighGravity(og: number, fg: number): number {
  return ((76.08 * (og - fg)) / (1.775 - og)) * (fg / 0.794);
}

// OG above this is "high gravity": the empirical formula is worth showing.
export const HIGH_GRAVITY_OG = 1.1;

// Plausible hydrometer ranges for mead. These validate, they don't clamp —
// out-of-range inputs still compute, with a warning, because an unusual real
// reading beats a silently "corrected" one.
export const OG_PLAUSIBLE = { min: 1.01, max: 1.2 };
export const FG_PLAUSIBLE = { min: 0.985, max: 1.06 };

export interface AbvResult {
  abv: number;            // basic formula
  abvHighGravity: number; // empirical high-gravity formula
  highGravity: boolean;   // OG >= HIGH_GRAVITY_OG — show both estimates
  warnings: string[];     // plausibility flags; result still shown
  error?: string;         // input pair that can't mean anything — no result
}

export function computeAbv(og: number, fg: number): AbvResult {
  if (fg > og) {
    return {
      abv: 0,
      abvHighGravity: 0,
      highGravity: false,
      warnings: [],
      error:
        "Final gravity is higher than starting gravity — the readings may be " +
        "swapped, or the OG was taken after fermentation had already started.",
    };
  }
  const warnings: string[] = [];
  if (og < OG_PLAUSIBLE.min || og > OG_PLAUSIBLE.max) {
    warnings.push(
      `Starting gravity is outside the plausible mead range (${OG_PLAUSIBLE.min.toFixed(3)}–${OG_PLAUSIBLE.max.toFixed(3)}) — double-check the reading.`,
    );
  }
  if (fg < FG_PLAUSIBLE.min || fg > FG_PLAUSIBLE.max) {
    warnings.push(
      `Final gravity is outside the plausible range (${FG_PLAUSIBLE.min.toFixed(3)}–${FG_PLAUSIBLE.max.toFixed(3)}) — double-check the reading.`,
    );
  }
  const abv = abvBasic(og, fg);
  if (abv > 20) {
    warnings.push(
      "Over 20% ABV is beyond nearly every yeast's tolerance — if both readings are right, this wasn't a normal fermentation.",
    );
  }
  return { abv, abvHighGravity: abvHighGravity(og, fg), highGravity: og >= HIGH_GRAVITY_OG, warnings };
}

// ---------------------------------------------------------------------------
// Backsweetening: honey needed to lift a finished mead to a target gravity.
//
// Adding m kg of honey to V litres at gravity G adds m × 0.319 gravity
// points·L of sugar (same constant the planner uses) AND m × 0.7 L of volume,
// so the new gravity is 1 + ((G−1)·V + 0.319·m) / (V + 0.7·m). Solving for the
// m that reaches target T:
//   m = (T − G) · V / (0.319 − 0.7 · (T − 1))

// AHA sweetness bands (FG). Perceived sweetness also depends on acid, tannin,
// alcohol, and aroma — these are expectation bands, not guarantees.
export const SWEETNESS_BANDS = [
  { key: "dry", label: "Dry", fgMin: 0.999, fgMax: 1.01, target: 1.005 },
  { key: "semi", label: "Semi-sweet", fgMin: 1.01, fgMax: 1.025, target: 1.018 },
  { key: "sweet", label: "Sweet", fgMin: 1.025, fgMax: 1.05, target: 1.035 },
] as const;

export interface BacksweetenResult {
  honeyKg: number;      // honey to add
  addedVolumeL: number; // volume that honey brings with it
  newVolumeL: number;
  warnings: string[];
  error?: string;
}

export function honeyToTarget(volumeL: number, currentSG: number, targetSG: number): BacksweetenResult {
  const none = { honeyKg: 0, addedVolumeL: 0, newVolumeL: Math.max(0, volumeL) };
  if (volumeL <= 0) {
    return { ...none, warnings: [], error: "Enter the batch volume — how much mead you're sweetening." };
  }
  if (targetSG < currentSG) {
    return {
      ...none,
      warnings: [],
      error:
        "Target gravity is below the current gravity — adding honey only raises it. " +
        "To dry a mead back out, blend with a drier batch instead.",
    };
  }
  const warnings: string[] = [];
  if (currentSG < FG_PLAUSIBLE.min || currentSG > FG_PLAUSIBLE.max) {
    warnings.push(
      `Current gravity is outside the plausible finished-mead range (${FG_PLAUSIBLE.min.toFixed(3)}–${FG_PLAUSIBLE.max.toFixed(3)}) — double-check the reading.`,
    );
  }
  if (targetSG > 1.05) {
    warnings.push(
      "Target is above the sweet band (1.050) — dessert territory. Sweeten in stages and taste as you go.",
    );
  }
  const honeyKg =
    ((targetSG - currentSG) * volumeL) /
    (HONEY_GRAVITY_PER_KG_PER_L - HONEY_DENSITY_L_PER_KG * (targetSG - 1));
  const addedVolumeL = honeyKg * HONEY_DENSITY_L_PER_KG;
  return { honeyKg, addedVolumeL, newVolumeL: volumeL + addedVolumeL, warnings };
}
