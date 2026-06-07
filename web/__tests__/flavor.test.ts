import { describe, expect, it } from "vitest";
import { blankMead, type Mead } from "../lib/mead";
import { flavorProjection, SWEETNESS_LABELS } from "../lib/flavor";

const mead = (o: Partial<Mead> = {}): Mead => ({ ...blankMead("t"), ...o });

describe("flavorProjection — sweetness", () => {
  it("reads dry when the must ferments well down (low OG, high attenuation)", () => {
    // EC-1118 (0.95 attenuation), modest OG → very low FG
    const f = flavorProjection(mead({ honeyKg: 1.0, waterL: 3.5, yeast: "EC-1118" }));
    expect(["Dry", "Off-dry"]).toContain(f.sweetnessLabel);
  });

  it("reads sweet/dessert for a big honey load with a low-attenuation yeast", () => {
    const f = flavorProjection(mead({ honeyKg: 3.0, waterL: 2.0, yeast: "Bread" }));
    expect(f.sweetnessLevel).toBeGreaterThanOrEqual(3); // Sweet or Dessert
  });

  it("flags + nudges sweeter when potential ABV exceeds yeast tolerance", () => {
    // Huge OG with low-tolerance Bread yeast → potential ABV >> tolerance
    const f = flavorProjection(mead({ honeyKg: 4.0, waterL: 1.0, yeast: "Bread" }));
    expect(f.caveat).toBeTruthy();
    expect(f.sweetnessLevel).toBe(SWEETNESS_LABELS.length - 1);
  });
});

describe("flavorProjection — strength + body", () => {
  it("labels a low-alcohol must session-strength", () => {
    const f = flavorProjection(mead({ honeyKg: 0.5, waterL: 3.5, yeast: "EC-1118" }));
    expect(f.strengthLabel).toBe("Session-strength");
    expect(f.estABV).toBeLessThan(7.5);
  });

  it("gives buckwheat + D-47 a fuller body than clover + EC-1118 at equal sugar", () => {
    const full = flavorProjection(mead({ honeyKg: 1.6, waterL: 2.4, honeyType: "buckwheat", yeast: "D-47" }));
    const light = flavorProjection(mead({ honeyKg: 1.6, waterL: 2.4, honeyType: "clover", yeast: "EC-1118" }));
    const order = ["Light", "Light–medium", "Medium", "Medium–full", "Full"];
    expect(order.indexOf(full.body)).toBeGreaterThan(order.indexOf(light.body));
  });
});

describe("flavorProjection — character notes", () => {
  it("always mentions the honey and the yeast", () => {
    const f = flavorProjection(mead({ honeyKg: 1.4, waterL: 3.0, honeyType: "orange_blossom", yeast: "71B-1122" }));
    expect(f.character.some((c) => c.startsWith("Orange Blossom honey"))).toBe(true);
    expect(f.character.some((c) => c.startsWith("71B-1122:"))).toBe(true);
  });

  it("adds juice + tart-acidity notes for a tart-cherry melomel", () => {
    const f = flavorProjection(mead({ honeyKg: 1.2, waterL: 1.5, juiceType: "tart_cherry", juiceL: 1.0 }));
    expect(f.character.some((c) => c.includes("Tart cherry juice"))).toBe(true);
    expect(f.character.some((c) => c.includes("tart acidity"))).toBe(true);
  });

  it("lists spices when present", () => {
    const f = flavorProjection(mead({ honeyKg: 1.4, waterL: 3.0, spices: ["cinnamon", "vanilla bean"] }));
    expect(f.character.some((c) => c.includes("cinnamon, vanilla bean"))).toBe(true);
  });
});
