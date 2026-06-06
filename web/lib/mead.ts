// Domain types + fermentation projection for the mead planner.
// Kept simple and testable; the loop will refine the model over time.

export type HoneyType = "clover" | "wildflower" | "orange_blossom" | "buckwheat" | "raw";
export type YeastStrain = "EC-1118" | "D-47" | "K1-V1116" | "71B-1122" | "Wyeast-4632" | "Bread";
export type VesselKind = "jug-1gal" | "carboy-1gal" | "carboy-5gal" | "bucket-5gal" | "demijohn-3gal";
export type PhaseName = "lag" | "primary" | "secondary" | "conditioning" | "done";

export interface YeastInfo {
  strain: YeastStrain;
  attenuationPct: number; // 0..1, apparent attenuation
  lagDays: number;
  primaryDays: number;
  secondaryDays: number;
  conditioningDays: number;
  note: string;
}

export const YEASTS: Record<YeastStrain, YeastInfo> = {
  "EC-1118":     { strain: "EC-1118",     attenuationPct: 0.95, lagDays: 1, primaryDays: 10, secondaryDays: 30, conditioningDays: 30, note: "Champagne yeast — fast, dry, high alcohol tolerance." },
  "D-47":        { strain: "D-47",        attenuationPct: 0.80, lagDays: 2, primaryDays: 14, secondaryDays: 35, conditioningDays: 45, note: "Lalvin D-47 — fruity, well-suited to traditional mead." },
  "K1-V1116":    { strain: "K1-V1116",    attenuationPct: 0.85, lagDays: 2, primaryDays: 12, secondaryDays: 30, conditioningDays: 30, note: "Killer strain, clean profile." },
  "71B-1122":    { strain: "71B-1122",    attenuationPct: 0.82, lagDays: 2, primaryDays: 14, secondaryDays: 30, conditioningDays: 30, note: "Reduces malic acid — good for fruit meads." },
  "Wyeast-4632": { strain: "Wyeast-4632", attenuationPct: 0.78, lagDays: 2, primaryDays: 16, secondaryDays: 40, conditioningDays: 60, note: "Dry mead profile, residual character." },
  "Bread":       { strain: "Bread",       attenuationPct: 0.70, lagDays: 1, primaryDays: 7,  secondaryDays: 21, conditioningDays: 30, note: "Bread yeast — not ideal but it works. Lower alcohol tolerance." },
};

export interface HoneyInfo {
  type: HoneyType;
  color: string; // hex
  label: string;
  note: string;
}

export const HONEYS: Record<HoneyType, HoneyInfo> = {
  clover:         { type: "clover",         color: "#fdd35f", label: "Clover",         note: "Light, mild." },
  wildflower:     { type: "wildflower",     color: "#d68a2e", label: "Wildflower",     note: "Varies by source." },
  orange_blossom: { type: "orange_blossom", color: "#e8b04c", label: "Orange Blossom", note: "Floral, citrus notes." },
  buckwheat:      { type: "buckwheat",      color: "#5a3a1a", label: "Buckwheat",      note: "Dark, malty." },
  raw:            { type: "raw",            color: "#e9c763", label: "Raw (mixed)",    note: "Unfiltered, cloudy." },
};

export interface VesselInfo {
  kind: VesselKind;
  capacityL: number;
  label: string;
  shape: "jug" | "carboy" | "bucket" | "demijohn";
}

export const VESSELS: Record<VesselKind, VesselInfo> = {
  "jug-1gal":     { kind: "jug-1gal",     capacityL: 3.78, label: "1-gallon jug",     shape: "jug" },
  "carboy-1gal":  { kind: "carboy-1gal",  capacityL: 3.78, label: "1-gallon carboy",  shape: "carboy" },
  "carboy-5gal":  { kind: "carboy-5gal",  capacityL: 18.9, label: "5-gallon carboy",  shape: "carboy" },
  "bucket-5gal":  { kind: "bucket-5gal",  capacityL: 18.9, label: "5-gallon bucket",  shape: "bucket" },
  "demijohn-3gal":{ kind: "demijohn-3gal",capacityL: 11.4, label: "3-gallon demijohn",shape: "demijohn" },
};

export interface Observation {
  id: string;
  at: string;          // ISO timestamp
  gravity?: number;    // measured specific gravity, e.g. 1.012
  note?: string;
}

export interface Mead {
  id: string;
  name: string;
  honeyType: HoneyType;
  honeyKg: number;
  waterL: number;
  vessel: VesselKind;
  yeast: YeastStrain;
  spices: string[];
  fruitsKg?: number;
  createdAt: string;   // ISO date
  observations: Observation[];
}

export interface Phase {
  name: PhaseName;
  startsAt: string;
  endsAt: string;
}

export interface Projection {
  startingGravity: number;
  estFinalGravity: number;
  estABV: number;
  phases: Phase[];
  currentPhase: PhaseName;
}

// 1 kg honey ≈ 0.319 gravity points per liter of total volume (≈ 35 points per lb per gal).
const HONEY_GRAVITY_PER_KG_PER_L = 0.319;
const HONEY_DENSITY_L_PER_KG = 0.7; // honey ≈ 1.42 kg/L → 1 kg ≈ 0.7 L

export function startingGravity(input: Pick<Mead, "honeyKg" | "waterL">): number {
  const totalL = Math.max(0, input.waterL) + Math.max(0, input.honeyKg) * HONEY_DENSITY_L_PER_KG;
  if (totalL <= 0) return 1.0;
  return 1 + (input.honeyKg * HONEY_GRAVITY_PER_KG_PER_L) / totalL;
}

export function project(mead: Mead, now: Date = new Date()): Projection {
  const yeast = YEASTS[mead.yeast];
  const sg = startingGravity(mead);
  const estFG = 1 + (sg - 1) * (1 - yeast.attenuationPct);
  const estABV = Math.max(0, (sg - estFG) * 131.25);

  const phases: Phase[] = [];
  let cursor = new Date(mead.createdAt);
  const append = (name: PhaseName, days: number) => {
    const startsAt = cursor.toISOString();
    cursor = new Date(cursor.getTime() + days * 86400000);
    phases.push({ name, startsAt, endsAt: cursor.toISOString() });
  };
  append("lag", yeast.lagDays);
  append("primary", yeast.primaryDays);
  append("secondary", yeast.secondaryDays);
  append("conditioning", yeast.conditioningDays);

  // Adjust remaining timeline from latest gravity observation.
  const latest = mead.observations
    .filter((o) => typeof o.gravity === "number")
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1);

  if (latest?.gravity != null) {
    const totalDrop = sg - estFG;
    const remaining = Math.max(0, latest.gravity - estFG);
    const fractionRemaining = totalDrop > 0 ? Math.min(1, remaining / totalDrop) : 0;
    const obsDate = new Date(latest.at);
    // Scale remaining duration between 0.4x (close to done) and 1.4x (barely started)
    const remainingDaysExpected = yeast.secondaryDays + yeast.conditioningDays;
    const remainingDays = remainingDaysExpected * (0.4 + fractionRemaining);
    const secShare = yeast.secondaryDays / remainingDaysExpected;
    const secDays = remainingDays * secShare;
    const condDays = remainingDays - secDays;
    phases[2].startsAt = obsDate.toISOString();
    phases[2].endsAt = new Date(obsDate.getTime() + secDays * 86400000).toISOString();
    phases[3].startsAt = phases[2].endsAt;
    phases[3].endsAt = new Date(new Date(phases[3].startsAt).getTime() + condDays * 86400000).toISOString();
  }

  return { startingGravity: sg, estFinalGravity: estFG, estABV, phases, currentPhase: currentPhase(phases, now) };
}

export function currentPhase(phases: Phase[], now: Date): PhaseName {
  const ts = now.toISOString();
  for (const p of phases) {
    if (ts >= p.startsAt && ts < p.endsAt) return p.name;
  }
  const last = phases[phases.length - 1];
  if (last && ts >= last.endsAt) return "done";
  return phases[0]?.name ?? "lag";
}

export function blankMead(name = "Untitled batch"): Mead {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return {
    id,
    name,
    honeyType: "wildflower",
    honeyKg: 1.4,
    waterL: 3.0,
    vessel: "carboy-1gal",
    yeast: "D-47",
    spices: [],
    createdAt: new Date().toISOString(),
    observations: [],
  };
}
