import { describe, expect, it } from "vitest";
import {
  abvBasic,
  abvHighGravity,
  computeAbv,
  HIGH_GRAVITY_OG,
  honeyToTarget,
  SWEETNESS_BANDS,
} from "../lib/calculators";
import { HONEY_DENSITY_L_PER_KG, HONEY_GRAVITY_PER_KG_PER_L } from "../lib/mead";

describe("abvBasic", () => {
  it("matches (OG - FG) * 131.25", () => {
    expect(abvBasic(1.09, 1.01)).toBeCloseTo(10.5, 5);
    expect(abvBasic(1.06, 1.0)).toBeCloseTo(7.875, 5);
  });

  it("is zero when OG equals FG", () => {
    expect(abvBasic(1.05, 1.05)).toBe(0);
  });
});

describe("abvHighGravity", () => {
  it("matches the empirical formula", () => {
    // 76.08 * 0.11 / (1.775 - 1.12) * (1.01 / 0.794)
    expect(abvHighGravity(1.12, 1.01)).toBeCloseTo(16.25, 1);
  });

  it("exceeds the basic estimate for strong ferments", () => {
    expect(abvHighGravity(1.12, 1.01)).toBeGreaterThan(abvBasic(1.12, 1.01));
  });
});

describe("computeAbv", () => {
  it("returns a clean result for a typical mead", () => {
    const r = computeAbv(1.09, 1.005);
    expect(r.error).toBeUndefined();
    expect(r.warnings).toEqual([]);
    expect(r.abv).toBeCloseTo(11.15625, 4);
    expect(r.highGravity).toBe(false);
  });

  it("errors when FG exceeds OG instead of returning negative ABV", () => {
    const r = computeAbv(1.01, 1.09);
    expect(r.error).toBeTruthy();
    expect(r.abv).toBe(0);
  });

  it("flags high gravity at the threshold", () => {
    expect(computeAbv(HIGH_GRAVITY_OG, 1.0).highGravity).toBe(true);
    expect(computeAbv(1.09, 1.0).highGravity).toBe(false);
  });

  it("warns on implausible OG but still computes", () => {
    const r = computeAbv(1.25, 1.01);
    expect(r.error).toBeUndefined();
    expect(r.warnings.some((w) => w.includes("Starting gravity"))).toBe(true);
    expect(r.abv).toBeCloseTo((1.25 - 1.01) * 131.25, 5);
  });

  it("warns on implausible FG", () => {
    const r = computeAbv(1.09, 0.97);
    expect(r.warnings.some((w) => w.includes("Final gravity"))).toBe(true);
  });

  it("warns when the result exceeds any yeast's tolerance", () => {
    const r = computeAbv(1.18, 1.0); // 23.6% basic
    expect(r.warnings.some((w) => w.includes("20%"))).toBe(true);
  });
});

describe("honeyToTarget", () => {
  it("round-trips: adding the suggested honey reaches the target gravity", () => {
    const V = 18.9, G = 0.998, T = 1.015;
    const r = honeyToTarget(V, G, T);
    expect(r.error).toBeUndefined();
    // Recompute the gravity the planner's own model would give after the add.
    const newSG =
      1 + ((G - 1) * V + HONEY_GRAVITY_PER_KG_PER_L * r.honeyKg) / (V + HONEY_DENSITY_L_PER_KG * r.honeyKg);
    expect(newSG).toBeCloseTo(T, 6);
    expect(r.newVolumeL).toBeCloseTo(V + r.honeyKg * HONEY_DENSITY_L_PER_KG, 6);
  });

  it("suggests ~1 kg for a dry 5-gallon batch to semi-sweet", () => {
    const r = honeyToTarget(18.9, 0.998, 1.015);
    expect(r.honeyKg).toBeGreaterThan(0.9);
    expect(r.honeyKg).toBeLessThan(1.2);
  });

  it("returns zero honey when already at target", () => {
    const r = honeyToTarget(3.78, 1.015, 1.015);
    expect(r.error).toBeUndefined();
    expect(r.honeyKg).toBe(0);
  });

  it("more sweetness needs more honey", () => {
    const semi = honeyToTarget(3.78, 1.0, 1.018);
    const sweet = honeyToTarget(3.78, 1.0, 1.035);
    expect(sweet.honeyKg).toBeGreaterThan(semi.honeyKg);
  });

  it("errors when the target is below the current gravity", () => {
    const r = honeyToTarget(3.78, 1.02, 1.005);
    expect(r.error).toBeTruthy();
    expect(r.honeyKg).toBe(0);
  });

  it("errors on a non-positive volume", () => {
    expect(honeyToTarget(0, 1.0, 1.02).error).toBeTruthy();
  });

  it("warns above the sweet band", () => {
    const r = honeyToTarget(3.78, 1.0, 1.06);
    expect(r.warnings.some((w) => w.includes("sweet band"))).toBe(true);
  });

  it("warns on an implausible current gravity", () => {
    const r = honeyToTarget(3.78, 1.08, 1.09);
    expect(r.warnings.some((w) => w.includes("Current gravity"))).toBe(true);
  });

  it("band targets sit inside their own FG ranges", () => {
    for (const b of SWEETNESS_BANDS) {
      expect(b.target).toBeGreaterThanOrEqual(b.fgMin);
      expect(b.target).toBeLessThanOrEqual(b.fgMax);
    }
  });
});
