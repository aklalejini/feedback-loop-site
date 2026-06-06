// Capacity push-down: when a maker drags one ingredient slider above the vessel's
// remaining capacity, reduce the OTHER ingredients proportionally to fit, until
// they hit zero. Once they're at zero, the dragged value caps at capacity.
//
// Inputs and outputs are LITERS for liquids; honey is converted to its volume
// equivalent (HONEY_DENSITY_L_PER_KG) before redistribution and back after.
//
// Pure: no UI, no storage — testable in isolation.

import { HONEY_DENSITY_L_PER_KG } from "./mead";

export type IngredientKey = "honey" | "water" | "juice";

export interface Volumes {
  honeyL: number;
  waterL: number;
  juiceL: number;
}

// Push-down: set one ingredient to `requested` volume (L). If the new total
// exceeds `capacityL`, reduce the OTHER ingredients proportionally to make
// room. Other ingredients never go negative. If they bottom out, the dragged
// ingredient gets clamped to whatever space is actually available.
export function applyVolumeChange(
  current: Volumes,
  changing: IngredientKey,
  requestedL: number,
  capacityL: number,
): Volumes {
  const req = Math.max(0, requestedL);
  const cap = Math.max(0, capacityL);

  // Build the "other two" so this scales if we add more ingredients later.
  const keys: IngredientKey[] = ["honey", "water", "juice"];
  const get = (k: IngredientKey) => (k === "honey" ? current.honeyL : k === "water" ? current.waterL : current.juiceL);
  const others = keys.filter((k) => k !== changing);
  const otherSum = others.reduce((s, k) => s + get(k), 0);

  // Space available for the dragged ingredient before any push-down.
  const headroom = cap - otherSum;
  if (req <= headroom) {
    // Fits without touching the others.
    return write(current, changing, req);
  }

  // Need to push others down. New value for `changing` is whatever capacity is
  // left after the others are reduced. We aim to reduce others proportionally
  // by a factor k ∈ [0, 1]; choose the smallest k that makes the budget fit,
  // i.e. req + k*otherSum = cap → k = (cap - req)/otherSum. Clamp k to ≥ 0.
  const target = Math.min(req, cap);
  let k = otherSum > 0 ? (cap - target) / otherSum : 0;
  k = Math.max(0, Math.min(1, k));

  const next: Volumes = { ...current };
  for (const o of others) {
    write(next, o, get(o) * k, /* mutate */ true);
  }
  write(next, changing, target, true);
  return next;
}

function write(v: Volumes, key: IngredientKey, value: number, mutate = false): Volumes {
  const target = mutate ? v : { ...v };
  if (key === "honey") target.honeyL = value;
  else if (key === "water") target.waterL = value;
  else target.juiceL = value;
  return target;
}

// Convenience wrappers for the form: honey is in kg in the data model, so this
// converts in/out. `capacityL` should be the vessel's full capacity.
export function applyHoneyChangeKg(
  honeyKg: number, waterL: number, juiceL: number,
  newHoneyKg: number, capacityL: number,
): { honeyKg: number; waterL: number; juiceL: number } {
  const cur: Volumes = { honeyL: honeyKg * HONEY_DENSITY_L_PER_KG, waterL, juiceL };
  const out = applyVolumeChange(cur, "honey", newHoneyKg * HONEY_DENSITY_L_PER_KG, capacityL);
  return { honeyKg: out.honeyL / HONEY_DENSITY_L_PER_KG, waterL: out.waterL, juiceL: out.juiceL };
}

export function applyWaterChangeL(
  honeyKg: number, waterL: number, juiceL: number,
  newWaterL: number, capacityL: number,
): { honeyKg: number; waterL: number; juiceL: number } {
  const cur: Volumes = { honeyL: honeyKg * HONEY_DENSITY_L_PER_KG, waterL, juiceL };
  const out = applyVolumeChange(cur, "water", newWaterL, capacityL);
  return { honeyKg: out.honeyL / HONEY_DENSITY_L_PER_KG, waterL: out.waterL, juiceL: out.juiceL };
}

export function applyJuiceChangeL(
  honeyKg: number, waterL: number, juiceL: number,
  newJuiceL: number, capacityL: number,
): { honeyKg: number; waterL: number; juiceL: number } {
  const cur: Volumes = { honeyL: honeyKg * HONEY_DENSITY_L_PER_KG, waterL, juiceL };
  const out = applyVolumeChange(cur, "juice", newJuiceL, capacityL);
  return { honeyKg: out.honeyL / HONEY_DENSITY_L_PER_KG, waterL: out.waterL, juiceL: out.juiceL };
}
