// Domain types + fermentation projection for the mead planner.
// Kept simple and testable; the loop will refine the model over time.

export type HoneyType = "clover" | "wildflower" | "orange_blossom" | "buckwheat" | "raw" | "maple";
export type YeastStrain = "EC-1118" | "D-47" | "K1-V1116" | "71B-1122" | "Wyeast-4632" | "Bread";
export type VesselKind = "jar-1gal" | "jug-1gal" | "jug-5gal" | "bucket-5gal";
export type PhaseName = "lag" | "primary" | "secondary" | "conditioning" | "done";
export type NitrogenNeed = "low" | "medium" | "high";

// Common juices for melomels. Brix sourced from typical food-composition values;
// these are estimates — measured OG always wins for accuracy (docs/research:
// "Prefer Measured OG"). Values reflect 100% unsweetened juice.
export type JuiceKind = "apple" | "grape" | "tart_cherry" | "pomegranate" | "orange" | "blueberry" | "blackcurrant";

export interface JuiceInfo {
  kind: JuiceKind;
  label: string;
  color: string;     // hex (for the chip)
  typicalBrix: number; // °Bx of straight juice
  note: string;
}

export const JUICES: Record<JuiceKind, JuiceInfo> = {
  apple:        { kind: "apple",        label: "Apple",        color: "#e9c45c", typicalBrix: 12.0, note: "Classic cyser base; clean fruit." },
  grape:        { kind: "grape",        label: "Grape",        color: "#7a3559", typicalBrix: 18.0, note: "High sugar — boosts gravity quickly." },
  tart_cherry:  { kind: "tart_cherry",  label: "Tart cherry",  color: "#a92a3b", typicalBrix: 14.0, note: "Bright acid, deep color." },
  pomegranate:  { kind: "pomegranate",  label: "Pomegranate",  color: "#8a1d2a", typicalBrix: 15.0, note: "Pucker + colour; pair with lower honey." },
  orange:       { kind: "orange",       label: "Orange",       color: "#e08f24", typicalBrix: 11.0, note: "Bright citrus; lower sugar." },
  blueberry:    { kind: "blueberry",    label: "Blueberry",    color: "#3b2a78", typicalBrix: 14.0, note: "Deep purple, mellow fruit — base for bilbemel." },
  blackcurrant: { kind: "blackcurrant", label: "Blackcurrant", color: "#321b3a", typicalBrix: 15.0, note: "Tart, jammy, intense colour — the black mead juice." },
};

export interface YeastInfo {
  strain: YeastStrain;
  attenuationPct: number; // 0..1, apparent attenuation
  alcoholTolerancePct: number; // manufacturer-listed approx; depends on conditions
  lagDays: number;
  primaryDays: number;
  secondaryDays: number;
  conditioningDays: number;
  note: string;
}

export const YEASTS: Record<YeastStrain, YeastInfo> = {
  "EC-1118":     { strain: "EC-1118",     attenuationPct: 0.95, alcoholTolerancePct: 18, lagDays: 1, primaryDays: 10, secondaryDays: 30, conditioningDays: 30, note: "Champagne yeast — fast, dry, high alcohol tolerance." },
  "D-47":        { strain: "D-47",        attenuationPct: 0.80, alcoholTolerancePct: 14, lagDays: 2, primaryDays: 14, secondaryDays: 35, conditioningDays: 45, note: "Lalvin D-47 — fruity, well-suited to traditional mead." },
  "K1-V1116":    { strain: "K1-V1116",    attenuationPct: 0.85, alcoholTolerancePct: 18, lagDays: 2, primaryDays: 12, secondaryDays: 30, conditioningDays: 30, note: "Killer strain, clean profile." },
  "71B-1122":    { strain: "71B-1122",    attenuationPct: 0.82, alcoholTolerancePct: 14, lagDays: 2, primaryDays: 14, secondaryDays: 30, conditioningDays: 30, note: "Reduces malic acid — good for fruit meads." },
  "Wyeast-4632": { strain: "Wyeast-4632", attenuationPct: 0.78, alcoholTolerancePct: 18, lagDays: 2, primaryDays: 16, secondaryDays: 40, conditioningDays: 60, note: "Dry mead profile, residual character." },
  "Bread":       { strain: "Bread",       attenuationPct: 0.70, alcoholTolerancePct: 10, lagDays: 1, primaryDays: 7,  secondaryDays: 21, conditioningDays: 30, note: "Bread yeast — not ideal but it works. Lower alcohol tolerance." },
};

export interface HoneyInfo {
  type: HoneyType;
  color: string; // hex
  label: string;
  note: string;
  // Optional override for sugar contribution per kg per L of must. Defaults to
  // HONEY_GRAVITY_PER_KG_PER_L when undefined. Useful for sweeteners that
  // aren't honey-density (e.g. maple syrup is ~66% sugar vs honey's ~80%).
  gravityPerKgPerL?: number;
}

export const HONEYS: Record<HoneyType, HoneyInfo> = {
  clover:         { type: "clover",         color: "#fdd35f", label: "Clover",         note: "Light, mild." },
  wildflower:     { type: "wildflower",     color: "#d68a2e", label: "Wildflower",     note: "Varies by source." },
  orange_blossom: { type: "orange_blossom", color: "#e8b04c", label: "Orange Blossom", note: "Floral, citrus notes." },
  buckwheat:      { type: "buckwheat",      color: "#5a3a1a", label: "Buckwheat",      note: "Dark, malty." },
  raw:            { type: "raw",            color: "#e9c763", label: "Raw (mixed)",    note: "Unfiltered, cloudy." },
  // Maple syrup is ~66% sugar by weight vs honey's ~80%, so it contributes
  // proportionally less gravity per kg. Used for acerglyn (maple mead).
  maple:          { type: "maple",          color: "#a85f1a", label: "Maple syrup",    note: "For acerglyn — toffee + caramel.", gravityPerKgPerL: 0.319 * 0.66 / 0.80 },
};

export interface VesselInfo {
  kind: VesselKind;
  capacityL: number;
  label: string;
  shape: "jug" | "bucket" | "demijohn";
}

export const VESSELS: Record<VesselKind, VesselInfo> = {
  "jar-1gal":    { kind: "jar-1gal",    capacityL: 3.78, label: "1-gallon jar",    shape: "jug" },
  "jug-1gal":    { kind: "jug-1gal",    capacityL: 3.78, label: "1-gallon jug",    shape: "jug" },
  "jug-5gal":    { kind: "jug-5gal",    capacityL: 18.9, label: "5-gallon jug",    shape: "jug" },
  "bucket-5gal": { kind: "bucket-5gal", capacityL: 18.9, label: "5-gallon bucket", shape: "bucket" },
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
  // Optional fruit juice (melomel). Volume always counted; sugar contribution
  // counted from the juice's typical Brix (an estimate — labeled as such; the
  // measured-OG override still wins).
  juiceType?: JuiceKind;
  juiceL?: number;
  vessel: VesselKind;
  yeast: YeastStrain;
  spices: string[];
  fruitsKg?: number;
  createdAt: string;   // ISO date
  observations: Observation[];
  // Optional hydrometer reading of the actual must. When present it overrides
  // the recipe estimate as the source of truth for FG/ABV (docs/research:
  // "Prefer Measured OG").
  measuredOG?: number;
  // Optional override for the yeast's nitrogen demand, used by the TOSNA
  // nutrient schedule. Defaults from the strain when unset.
  nitrogenNeed?: NitrogenNeed;
  // Indices (0-3) of TOSNA nutrient additions the maker has marked as added.
  nutrientsDone?: number[];
  // Optional style tag (Traditional / Sack / Cyser / ...) chosen via the style
  // picker. Doesn't drive any math — display + re-seeding only.
  style?: string;
  // Optional target sweetness band (0..4) the maker designed toward.
  targetSweetness?: number;
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
export const HONEY_GRAVITY_PER_KG_PER_L = 0.319;
// honey ≈ 1.42 kg/L → 1 kg ≈ 0.704 L (kept at 0.7 to match prior fills exactly)
export const HONEY_DENSITY_L_PER_KG = 0.7;
// ~0.004 SG per °Brix (Pearson; close enough across the mead/wine range)
export const SG_PER_BRIX = 0.004;

export interface MustComposition {
  honeyL: number;   // honey's contribution to volume
  juiceL: number;   // juice volume (0 if no juice)
  waterL: number;   // free water
  totalL: number;   // sum of the above
}

export function mustComposition(input: Pick<Mead, "honeyKg" | "waterL" | "juiceL">): MustComposition {
  const honeyL = Math.max(0, input.honeyKg ?? 0) * HONEY_DENSITY_L_PER_KG;
  const juiceL = Math.max(0, input.juiceL ?? 0);
  const waterL = Math.max(0, input.waterL ?? 0);
  return { honeyL, juiceL, waterL, totalL: honeyL + juiceL + waterL };
}

type GravityInput =
  Pick<Mead, "honeyKg" | "waterL" | "juiceL" | "juiceType"> &
  { measuredOG?: number; honeyType?: HoneyType };

export function startingGravity(input: GravityInput): number {
  if (typeof input.measuredOG === "number" && input.measuredOG > 0) return input.measuredOG;
  const { totalL } = mustComposition(input);
  if (totalL <= 0) return 1.0;
  // Per-honey PPG override (e.g. maple syrup has lower sugar density). When the
  // caller doesn't tell us the honey type we fall back to the default constant,
  // which matches every honey except maple to within rounding.
  const ppg = input.honeyType ? (HONEYS[input.honeyType].gravityPerKgPerL ?? HONEY_GRAVITY_PER_KG_PER_L) : HONEY_GRAVITY_PER_KG_PER_L;
  const honeyPoints = Math.max(0, input.honeyKg ?? 0) * ppg;
  // Juice contributes sugar = juiceL × (typicalBrix × SG/°Bx). Volume already
  // counted in totalL above. This is a recipe estimate; juice composition
  // varies, so measured OG should override (per docs/research).
  const juiceL = Math.max(0, input.juiceL ?? 0);
  const juiceBrix = input.juiceType ? JUICES[input.juiceType].typicalBrix : 0;
  const juicePoints = juiceL * juiceBrix * SG_PER_BRIX;
  return 1 + (honeyPoints + juicePoints) / totalL;
}

export function gravitySource(input: { measuredOG?: number }): "measured" | "estimated" {
  return typeof input.measuredOG === "number" && input.measuredOG > 0 ? "measured" : "estimated";
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

// A clearly-labeled example traditional mead so first-time visitors can see the
// shape of the tool (vessel + timeline + stats) before filling the form.
// 'Sample —' prefix and the SAMPLE_MEAD_NAME_PREFIX const keep it identifiable
// in the list and let callers filter or dismiss it.
export const SAMPLE_MEAD_NAME_PREFIX = "Sample — ";

export function sampleMead(now: Date = new Date()): Mead {
  // Standard traditional: ~1 kg orange-blossom honey in a 1-gallon jug, D-47.
  // Backdated 21 days so the timeline lands in primary/secondary on first view.
  const created = new Date(now.getTime() - 21 * 86400000);
  return {
    ...blankMead(`${SAMPLE_MEAD_NAME_PREFIX}Traditional`),
    honeyType: "orange_blossom",
    honeyKg: 1.0,
    waterL: 2.8,
    vessel: "jar-1gal",
    yeast: "D-47",
    spices: [],
    createdAt: created.toISOString(),
    observations: [
      {
        id: "sample-obs-1",
        at: new Date(created.getTime() + 9 * 86400000).toISOString(),
        gravity: 1.030,
        note: "active fermentation, slowing — example reading",
      },
    ],
  };
}

export function blankMead(name = "Untitled batch"): Mead {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return {
    id,
    name,
    honeyType: "wildflower",
    honeyKg: 0,
    waterL: 0,
    vessel: "jar-1gal",
    yeast: "D-47",
    spices: [],
    createdAt: new Date().toISOString(),
    observations: [],
  };
}

// ----- Honesty / safety risk flags (sourced from docs/research/mead-fermentation.md) -----

export type RiskKind = "tolerance" | "osmotic" | "low-gravity";

export interface Risk {
  kind: RiskKind;
  message: string;
}

// Potential ABV if the yeast attenuated the must to 1.000 (the dry limit).
export function potentialAbvToDry(sg: number): number {
  return Math.max(0, (sg - 1) * 131.25);
}

// Per docs/research "Yeast-Limited Final Gravity Estimate" and "Stuck Fermentation
// Causes": warn when potential ABV exceeds the yeast's listed tolerance (expect
// residual sweetness / stall) and when OG > 1.120 (osmotic stress).
export function fermentationRisks(sg: number, yeast: YeastInfo): Risk[] {
  const risks: Risk[] = [];
  const potential = potentialAbvToDry(sg);
  if (potential > yeast.alcoholTolerancePct + 0.5) {
    risks.push({
      kind: "tolerance",
      message:
        `Potential ABV (~${potential.toFixed(1)}%) exceeds ${yeast.strain}'s typical tolerance ` +
        `(~${yeast.alcoholTolerancePct}%). Expect residual sweetness or a stall — tolerance varies ` +
        `with nutrients and temperature.`,
    });
  }
  if (sg > 1.120) {
    risks.push({
      kind: "osmotic",
      message:
        `Starting gravity above 1.120 stresses yeast (osmotic pressure). Stagger the honey, ` +
        `aerate early, and consider a step-up nutrient schedule.`,
    });
  }
  if (sg > 1 && sg < 1.030) {
    risks.push({
      kind: "low-gravity",
      message:
        `Starting gravity is very low. Final ABV will be modest; if this isn't intentional ` +
        `(session mead), increase honey.`,
    });
  }
  return risks;
}
