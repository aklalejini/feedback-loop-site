import { describe, expect, it } from "vitest";
import {
  abvBasic,
  abvHighGravity,
  computeAbv,
  HIGH_GRAVITY_OG,
} from "../lib/calculators";

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
