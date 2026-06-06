import { describe, expect, it } from "vitest";
import { blankMead, type Mead } from "../lib/mead";
import {
  defaultNitrogenNeed,
  NITROGEN_FACTORS,
  nutrientAdditionStatus,
  oneThirdBreakSG,
  sgToBrix,
  tosnaSchedule,
} from "../lib/nutrients";

describe("sgToBrix", () => {
  it("is ~0 at 1.000", () => {
    expect(sgToBrix(1.0)).toBeCloseTo(0, 1);
  });
  it("maps a typical mead OG into a plausible Brix range", () => {
    // 1.090 ≈ 21-22 Brix
    expect(sgToBrix(1.09)).toBeGreaterThan(20);
    expect(sgToBrix(1.09)).toBeLessThan(23);
  });
});

describe("oneThirdBreakSG", () => {
  it("matches the research example: 1.105 -> 1.070", () => {
    expect(oneThirdBreakSG(1.105)).toBeCloseTo(1.07, 3);
  });
});

describe("NITROGEN_FACTORS", () => {
  it("matches the Mead Made Right factors", () => {
    expect(NITROGEN_FACTORS).toEqual({ low: 0.75, medium: 0.9, high: 1.25 });
  });
});

describe("defaultNitrogenNeed", () => {
  it("is low for the strains the brief calls low-demand", () => {
    expect(defaultNitrogenNeed("D-47")).toBe("low");
    expect(defaultNitrogenNeed("71B-1122")).toBe("low");
  });
  it("defaults to medium otherwise", () => {
    expect(defaultNitrogenNeed("EC-1118")).toBe("medium");
  });
});

const meadFor = (overrides: Partial<Mead>): Mead => ({
  ...blankMead("t"),
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("tosnaSchedule", () => {
  it("reproduces research Example 3 (5 gal, 24 Brix, medium → 21.6 g total)", () => {
    // 24 Brix ≈ SG 1.101; use measuredOG so Brix is pinned, and size the volume
    // to 5 gal (≈ 18.93 L). Use override 'medium'.
    // Solve volume: we set water so total L ≈ 18.93 (honeyKg negligible effect via density).
    const m = meadFor({ measuredOG: 1.10092, honeyKg: 0, waterL: 18.927, yeast: "EC-1118" });
    const s = tosnaSchedule(m, "medium")!;
    expect(s).not.toBeNull();
    expect(s.volumeGal).toBeCloseTo(5, 1);
    expect(s.brix).toBeCloseTo(24, 0);
    expect(s.totalGrams).toBeCloseTo(21.6, 0);
    expect(s.perAdditionGrams).toBeCloseTo(5.4, 1);
  });

  it("produces four additions at 24/48/72h and day 7", () => {
    const m = meadFor({ honeyKg: 1.4, waterL: 3.0 });
    const s = tosnaSchedule(m)!;
    expect(s.additions).toHaveLength(4);
    const hours = s.additions.map(
      (a) => (new Date(a.at).getTime() - new Date(m.createdAt).getTime()) / 3_600_000,
    );
    expect(hours).toEqual([24, 48, 72, 168]);
  });

  it("scales total grams with the nitrogen factor", () => {
    const m = meadFor({ honeyKg: 1.4, waterL: 3.0 });
    const low = tosnaSchedule(m, "low")!.totalGrams;
    const high = tosnaSchedule(m, "high")!.totalGrams;
    expect(high / low).toBeCloseTo(1.25 / 0.75, 5);
  });

  it("splits total evenly across the four additions", () => {
    const m = meadFor({ honeyKg: 1.4, waterL: 3.0 });
    const s = tosnaSchedule(m)!;
    const sum = s.additions.reduce((acc, a) => acc + a.grams, 0);
    expect(sum).toBeCloseTo(s.totalGrams, 6);
  });

  it("returns null for an empty must", () => {
    expect(tosnaSchedule(meadFor({ honeyKg: 0, waterL: 0 }))).toBeNull();
  });

  it("uses the stored nitrogenNeed when no override is given", () => {
    const m = meadFor({ honeyKg: 1.4, waterL: 3.0, nitrogenNeed: "high" });
    expect(tosnaSchedule(m)!.nitrogenNeed).toBe("high");
  });
});

describe("nutrientAdditionStatus", () => {
  const now = new Date("2026-06-10T12:00:00.000Z");
  it("returns 'done' whenever marked done, regardless of date", () => {
    expect(nutrientAdditionStatus("2026-06-01T00:00:00.000Z", now, true)).toBe("done");
    expect(nutrientAdditionStatus("2026-06-20T00:00:00.000Z", now, true)).toBe("done");
  });
  it("returns 'overdue' for an earlier day not done", () => {
    expect(nutrientAdditionStatus("2026-06-09T08:00:00.000Z", now, false)).toBe("overdue");
  });
  it("returns 'due' for the same calendar day", () => {
    expect(nutrientAdditionStatus("2026-06-10T23:00:00.000Z", now, false)).toBe("due");
  });
  it("returns 'upcoming' for a future day", () => {
    expect(nutrientAdditionStatus("2026-06-12T00:00:00.000Z", now, false)).toBe("upcoming");
  });
});
