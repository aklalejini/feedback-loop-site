// Backward-design solver: given vessel capacity, a style, and a target sweetness,
// compute the honey/water/juice amounts and a recommended yeast.
//
// Reuses the SAME gravity model as lib/mead.ts so projections stay consistent.
// The solver only produces a starting point — the user can drag any slider after
// applying a preset.

import {
  HONEY_DENSITY_L_PER_KG,
  HONEY_GRAVITY_PER_KG_PER_L,
  JUICES,
  SG_PER_BRIX,
  YEASTS,
  type JuiceKind,
  type Mead,
  type YeastStrain,
} from "./mead";
import { STYLE_PROFILES, type StyleKind } from "./styles";

// Target FG band midpoints, paired with the SWEETNESS_LABELS in lib/flavor.ts.
// Picking the midpoint gives a recipe centered on the band; small deviations from
// it (from honey rounding or solver caps) still land inside the band's range.
const TARGET_FG_MIDPOINT = [1.002, 1.008, 1.016, 1.028, 1.050];

// Cap the solved OG. Anything past 1.150 is impractical for a homebrewer and
// the solver should warn rather than spit out a wildly unrealistic recipe.
const MAX_SOLVE_OG = 1.150;

export interface SolveInput {
  vesselCapacityL: number;
  style: StyleKind;
  // 0..4 → Dry, Off-dry, Semi-sweet, Sweet, Dessert. If undefined, uses the
  // style's own default sweetness band.
  targetSweetness?: number;
  // Optional override: by default the solver uses the style's preferred yeast.
  yeast?: YeastStrain;
  // For melomel the juice type comes from the user (style has none); other
  // fruit styles override.
  juiceType?: JuiceKind | null;
}

export interface SolvedRecipe {
  honeyKg: number;
  waterL: number;
  juiceL: number;
  juiceType?: JuiceKind;
  yeast: YeastStrain;
  targetSweetness: number;
  targetOG: number;
  warning?: string;
}

// Bisection on OG: too low and the must hits the target sweetness without
// stressing the yeast; too high and we exceed yeast tolerance. We just compute
// the FG-mid → OG relation analytically, then cap.
function targetOGFor(fgMid: number, attenuation: number): number {
  // FG = 1 + (OG - 1)(1 - att) → OG = 1 + (FG - 1) / (1 - att)
  return 1 + (fgMid - 1) / Math.max(0.001, 1 - attenuation);
}

export function solveRecipe(input: SolveInput): SolvedRecipe {
  const style = STYLE_PROFILES[input.style];
  const sweetness = Math.max(0, Math.min(4, input.targetSweetness ?? style.defaultSweetness));
  const yeastStrain = input.yeast ?? style.yeast;
  const yeast = YEASTS[yeastStrain];

  const fgMid = TARGET_FG_MIDPOINT[sweetness];
  let targetOG = targetOGFor(fgMid, yeast.attenuationPct);

  // Cap at the practical limit, and at the yeast's tolerance OG (where it
  // would stall dry). Either cap triggers a warning so the maker knows the
  // pure-fermentation path can't get them where they asked.
  const toleranceOG = 1 + yeast.alcoholTolerancePct / 131.25;
  let warning: string | undefined;
  if (targetOG > MAX_SOLVE_OG) {
    targetOG = MAX_SOLVE_OG;
    warning =
      `Target ${["Dry","Off-dry","Semi-sweet","Sweet","Dessert"][sweetness]} ` +
      `with ${yeastStrain} requires an impractical OG. Capped at ${MAX_SOLVE_OG.toFixed(3)}; ` +
      `consider a lower-attenuation yeast (D-47, 71B, Wyeast-4632) or plan to stabilize + backsweeten.`;
  } else if (targetOG > toleranceOG + 0.005) {
    // Naturally finishing dry would exceed yeast tolerance: expect a stall —
    // which actually *helps* hit the sweet target (residual sugar). Flag it.
    warning =
      `OG ${targetOG.toFixed(3)} exceeds ${yeastStrain}'s tolerance (~${yeast.alcoholTolerancePct}% ABV ` +
      `≈ OG ${toleranceOG.toFixed(3)}). Expect the ferment to stall sweet — close to your target.`;
  }

  // Volume allocation: juice first (style-dictated), water + honey fill the rest.
  // input.juiceType: null → caller explicitly cleared juice; undefined → fall back to style.
  const juiceType: JuiceKind | undefined =
    input.juiceType === null ? undefined :
    input.juiceType ?? (style.juiceType ?? undefined);
  const juiceFraction = juiceType && style.juiceFraction > 0 ? style.juiceFraction : 0;
  let juiceL = juiceFraction * input.vesselCapacityL;
  const juiceBrix = juiceType ? JUICES[juiceType].typicalBrix : 0;

  // Total volume we're targeting = full vessel.
  const totalL = input.vesselCapacityL;

  // Gravity contributions: honeyKg × HGPP_L  +  juiceL × Brix × SG_PER_BRIX,
  // divided by totalL, gives (OG − 1). Solve for honeyKg.
  const targetPoints = (targetOG - 1) * totalL;
  let juicePoints = juiceL * juiceBrix * SG_PER_BRIX;

  // If juice alone would meet or exceed the target gravity, the solver would
  // otherwise clamp honey to 0 — producing "cider with a hint of honey", which
  // isn't what a maker means by "Dry Cyser." Reduce juice so honey contributes
  // at least MIN_HONEY_FRACTION of the points (the recipe is still juice-heavy
  // but honey character is preserved).
  const MIN_HONEY_FRACTION = 0.3;
  if (juiceBrix > 0 && juicePoints > targetPoints * (1 - MIN_HONEY_FRACTION)) {
    const targetJuicePoints = Math.max(0, targetPoints * (1 - MIN_HONEY_FRACTION));
    juiceL = targetJuicePoints / (juiceBrix * SG_PER_BRIX);
    juicePoints = targetJuicePoints;
    warning = warning ??
      `Reduced juice from the style default so honey still contributes meaningful character — ` +
      `at this sweetness target the original juice fraction would have dominated.`;
  }
  let honeyKg = Math.max(0, (targetPoints - juicePoints) / HONEY_GRAVITY_PER_KG_PER_L);

  // Volumes left for water (vessel - juice - honey volume). If honey + juice
  // already fill the vessel (very high OG / very juicy style), shrink juice to
  // make room for the honey; if still over, cap honey at what fits.
  let honeyL = honeyKg * HONEY_DENSITY_L_PER_KG;
  if (honeyL + juiceL > totalL) {
    // Trim juice first (style hint, not a hard target)
    const trim = honeyL + juiceL - totalL;
    juiceL = Math.max(0, juiceL - trim);
    if (honeyL > totalL) {
      honeyKg = totalL / HONEY_DENSITY_L_PER_KG;
      honeyL = totalL;
    }
  }
  let waterL = Math.max(0, totalL - juiceL - honeyL);

  // Round to two decimal places (matches the form's display precision).
  const r = (n: number) => Math.round(n * 100) / 100;
  honeyKg = r(honeyKg);
  waterL = r(waterL);
  juiceL = r(juiceL);

  return {
    honeyKg,
    waterL,
    juiceL,
    juiceType,
    yeast: yeastStrain,
    targetSweetness: sweetness,
    targetOG,
    warning,
  };
}

// Apply a solved recipe onto a Mead draft, preserving fields the solver doesn't
// own (batch name, vessel, observations, etc.). Used by the form's "apply
// preset" handler.
export function applySolvedRecipe(draft: Mead, solved: SolvedRecipe, style: StyleKind): Mead {
  const styleProfile = STYLE_PROFILES[style];
  return {
    ...draft,
    style,
    targetSweetness: solved.targetSweetness,
    honeyKg: solved.honeyKg,
    waterL: solved.waterL,
    juiceL: solved.juiceL,
    juiceType: solved.juiceType,
    yeast: solved.yeast,
    spices: styleProfile.spices.length ? [...styleProfile.spices] : draft.spices,
    honeyType: styleProfile.honeyType ?? draft.honeyType,
  };
}
