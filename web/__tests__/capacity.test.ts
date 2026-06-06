import { describe, expect, it } from "vitest";
import {
  applyHoneyChangeKg,
  applyJuiceChangeL,
  applyVolumeChange,
  applyWaterChangeL,
  type Volumes,
} from "../lib/capacity";

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol;

describe("applyVolumeChange (under capacity)", () => {
  it("passes the requested value through when the vessel has room", () => {
    const cur: Volumes = { honeyL: 1, waterL: 1, juiceL: 0 };
    const out = applyVolumeChange(cur, "water", 1.5, 4);
    expect(out).toEqual({ honeyL: 1, waterL: 1.5, juiceL: 0 });
  });
  it("clamps negative requests to zero", () => {
    const cur: Volumes = { honeyL: 1, waterL: 1, juiceL: 0 };
    const out = applyVolumeChange(cur, "water", -1, 4);
    expect(out.waterL).toBe(0);
  });
});

describe("applyVolumeChange (over capacity → proportional push-down)", () => {
  it("reduces the others proportionally to fit", () => {
    // capacity 4, current honey+water+juice = 1+1+1 = 3; push water to 3 (sum 5)
    // need to free 1 from the other two (honey, juice), each currently 1.
    // k = (4 - 3) / (1 + 1) = 0.5 → both go from 1 to 0.5.
    const cur: Volumes = { honeyL: 1, waterL: 1, juiceL: 1 };
    const out = applyVolumeChange(cur, "water", 3, 4);
    expect(close(out.waterL, 3)).toBe(true);
    expect(close(out.honeyL, 0.5)).toBe(true);
    expect(close(out.juiceL, 0.5)).toBe(true);
    expect(close(out.honeyL + out.waterL + out.juiceL, 4)).toBe(true);
  });

  it("clamps the dragged value at capacity when the others bottom out", () => {
    const cur: Volumes = { honeyL: 1, waterL: 0.5, juiceL: 0 };
    // request water=10 in a 4 L vessel → others go to 0, water caps at 4.
    const out = applyVolumeChange(cur, "water", 10, 4);
    expect(close(out.honeyL, 0)).toBe(true);
    expect(close(out.juiceL, 0)).toBe(true);
    expect(close(out.waterL, 4)).toBe(true);
  });

  it("never makes the other ingredients go negative", () => {
    const cur: Volumes = { honeyL: 0.5, waterL: 0, juiceL: 0 };
    const out = applyVolumeChange(cur, "juice", 5, 3);
    expect(out.honeyL).toBeGreaterThanOrEqual(0);
    expect(out.waterL).toBeGreaterThanOrEqual(0);
  });

  it("works when one of the others is already zero", () => {
    // honey 1, water 0, juice 2, cap 3; push honey to 2 (sum 4).
    // others = water + juice = 2; k = (3-2)/2 = 0.5 → juice 2→1, water stays 0.
    const cur: Volumes = { honeyL: 1, waterL: 0, juiceL: 2 };
    const out = applyVolumeChange(cur, "honey", 2, 3);
    expect(close(out.honeyL, 2)).toBe(true);
    expect(close(out.waterL, 0)).toBe(true);
    expect(close(out.juiceL, 1)).toBe(true);
  });
});

describe("kg/L convenience wrappers (honey converts via density)", () => {
  it("honey kg pushes water down in liters", () => {
    // empty: honey 0 kg, water 3 L, juice 0; vessel 3.78 L (1 gal jug).
    // push honey to 2 kg (≈ 1.4 L). Sum would be 4.4 > 3.78 → reduce water.
    const out = applyHoneyChangeKg(0, 3, 0, 2, 3.78);
    expect(close(out.honeyKg, 2)).toBe(true);
    expect(out.waterL).toBeLessThan(3);
    // total volume (honey vol + water + juice) caps at vessel capacity
    const totalL = out.honeyKg * 0.7 + out.waterL + out.juiceL;
    expect(totalL).toBeLessThanOrEqual(3.78 + 1e-9);
  });

  it("water L push-down preserves other ingredients when there is room", () => {
    const out = applyWaterChangeL(1, 0.5, 0, 1.5, 3.78);
    expect(out).toEqual({ honeyKg: 1, waterL: 1.5, juiceL: 0 });
  });

  it("juice L push-down reduces others when over capacity", () => {
    // 1 gal vessel; honey 1 kg (0.7 L), water 2 L, juice 0 → 2.7 L used.
    // request juice 2 L → sum 4.7 > 3.78. Free 0.92 L from honey+water=2.7
    // k = (3.78-2)/2.7 ≈ 0.659. Result: juice 2, water 1.318, honey 0.659 kg.
    const out = applyJuiceChangeL(1, 2, 0, 2, 3.78);
    expect(close(out.juiceL, 2)).toBe(true);
    expect(out.honeyKg).toBeLessThan(1);
    expect(out.waterL).toBeLessThan(2);
    const totalL = out.honeyKg * 0.7 + out.waterL + out.juiceL;
    expect(totalL).toBeLessThanOrEqual(3.78 + 1e-9);
  });
});
