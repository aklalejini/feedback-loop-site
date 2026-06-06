// Display-unit system for the planner. Data stays metric (kg/L) so projections
// and persistence are unchanged; this module converts only for display + input.

export type UnitSystem = "metric" | "imperial";

const STORAGE_KEY = "feedback-loop-site:units:v1";

export const KG_PER_LB = 0.45359237;
export const L_PER_GAL = 3.78541;

export interface UnitTriple {
  // labels shown in the UI
  weight: "kg" | "lb";
  volume: "L" | "gal";
  // conversion helpers
  toDisplayWeight: (kg: number) => number;   // kg → kg | lb
  fromDisplayWeight: (v: number) => number;  // kg | lb → kg
  toDisplayVolume: (l: number) => number;
  fromDisplayVolume: (v: number) => number;
}

export function unitsFor(system: UnitSystem): UnitTriple {
  if (system === "imperial") {
    return {
      weight: "lb",
      volume: "gal",
      toDisplayWeight: (kg) => kg / KG_PER_LB,
      fromDisplayWeight: (lb) => lb * KG_PER_LB,
      toDisplayVolume: (l) => l / L_PER_GAL,
      fromDisplayVolume: (gal) => gal * L_PER_GAL,
    };
  }
  return {
    weight: "kg",
    volume: "L",
    toDisplayWeight: (kg) => kg,
    fromDisplayWeight: (v) => v,
    toDisplayVolume: (l) => l,
    fromDisplayVolume: (v) => v,
  };
}

// Browser-only persistence. Default is metric (matches existing behavior).
export function loadUnits(): UnitSystem {
  if (typeof window === "undefined") return "metric";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "imperial" ? "imperial" : "metric";
}

export function saveUnits(units: UnitSystem): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, units);
}
