import { describe, expect, it } from "vitest";
import { unitsFor } from "../lib/units";

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol;

describe("unitsFor(metric)", () => {
  const u = unitsFor("metric");
  it("uses kg / L labels", () => {
    expect(u.weight).toBe("kg");
    expect(u.volume).toBe("L");
  });
  it("is identity in both directions", () => {
    expect(close(u.toDisplayWeight(1.4), 1.4)).toBe(true);
    expect(close(u.fromDisplayWeight(1.4), 1.4)).toBe(true);
    expect(close(u.toDisplayVolume(3.78), 3.78)).toBe(true);
    expect(close(u.fromDisplayVolume(3.78), 3.78)).toBe(true);
  });
});

describe("unitsFor(imperial)", () => {
  const u = unitsFor("imperial");
  it("uses lb / gal labels", () => {
    expect(u.weight).toBe("lb");
    expect(u.volume).toBe("gal");
  });
  it("converts 1 kg ≈ 2.2046 lb (round-trip exactly)", () => {
    const lb = u.toDisplayWeight(1);
    expect(lb).toBeCloseTo(2.20462, 4);
    expect(close(u.fromDisplayWeight(lb), 1)).toBe(true);
  });
  it("converts 1 gal ≈ 3.78541 L (round-trip exactly)", () => {
    const gal = u.toDisplayVolume(3.78541);
    expect(gal).toBeCloseTo(1, 6);
    expect(close(u.fromDisplayVolume(1), 3.78541)).toBe(true);
  });
});
