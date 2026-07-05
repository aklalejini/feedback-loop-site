// ABV from hydrometer readings — pure math, no UI (testable in isolation).
// Formulas and validation ranges from docs/research/mead-fermentation.md
// ("Gravity and ABV Calculations").
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
