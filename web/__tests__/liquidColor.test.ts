import { describe, expect, it } from "vitest";
import { liquidBaseHex } from "../lib/liquidColor";
import { HONEYS, JUICES } from "../lib/mead";

// Parse a hex string into [r, g, b] (0..255).
const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

describe("liquidBaseHex — colour blending", () => {
  it("honey-only must keeps the honey colour exactly", () => {
    expect(liquidBaseHex("clover")).toBe(HONEYS.clover.color);
    expect(liquidBaseHex("orange_blossom", "grape", 0)).toBe(HONEYS.orange_blossom.color);
  });

  it("blending grape juice shifts the colour toward purple (more blue, less red+green)", () => {
    const [hr, hg, hb] = rgb(HONEYS.wildflower.color);
    const [br, bg, bb] = rgb(liquidBaseHex("wildflower", "grape", 0.5));
    const [_jr, _jg, jb] = rgb(JUICES.grape.color);
    // Grape's blue channel is higher than wildflower honey's → blended blue is up
    expect(bb).toBeGreaterThan(hb);
    // and red+green drop (grape is darker than honey on those channels)
    expect(br).toBeLessThan(hr);
    expect(bg).toBeLessThan(hg);
    // Sanity: blended blue sits between honey and pure grape
    expect(bb).toBeLessThanOrEqual(Math.max(hb, jb));
  });

  it("a high juice fraction (≥0.67) blends to the pure juice colour (1.5× intensifier caps at 1)", () => {
    expect(liquidBaseHex("clover", "grape", 0.75)).toBe(JUICES.grape.color);
    expect(liquidBaseHex("clover", "blackcurrant", 1.0)).toBe(JUICES.blackcurrant.color);
  });

  it("small juice fractions still tint perceptibly (intensifier ×1.5)", () => {
    // At 20% volume the effective weight is 0.30 — a real shift, not a token one.
    const before = rgb(HONEYS.wildflower.color);
    const after = rgb(liquidBaseHex("wildflower", "tart_cherry", 0.2));
    const dist = Math.hypot(after[0] - before[0], after[1] - before[1], after[2] - before[2]);
    expect(dist).toBeGreaterThan(15); // not zero, and not just rounding noise
  });
});
