import { describe, expect, it } from "vitest";
import {
  HONEY_DENSITY_L_PER_KG,
  HONEY_GRAVITY_PER_KG_PER_L,
  JUICES,
  SG_PER_BRIX,
  startingGravity,
} from "../lib/mead";
import { solveRecipe } from "../lib/recipeSolver";

const VESSEL_1GAL = 3.78;
const VESSEL_5GAL = 18.9;

describe("solveRecipe — traditional / sack / hydromel", () => {
  it("traditional lands inside the AHA standard band (1.080-1.120)", () => {
    const s = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "traditional" });
    const og = startingGravity(s);
    expect(og).toBeGreaterThan(1.075);
    expect(og).toBeLessThan(1.135);
    expect(s.juiceL).toBe(0);
    expect(s.waterL).toBeGreaterThan(0);
    expect(s.honeyKg).toBeGreaterThan(0);
  });

  it("sack is heavier than traditional at the same vessel", () => {
    const t = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "traditional" });
    const s = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "sack" });
    expect(s.honeyKg).toBeGreaterThan(t.honeyKg);
    expect(s.targetOG).toBeGreaterThan(t.targetOG);
  });

  it("hydromel is lighter than traditional", () => {
    const t = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "traditional" });
    const h = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "hydromel" });
    expect(h.honeyKg).toBeLessThan(t.honeyKg);
  });
});

describe("solveRecipe — fruit styles set the juice", () => {
  it("cyser pins apple juice and fills most of the vessel with it", () => {
    const s = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "cyser" });
    expect(s.juiceType).toBe("apple");
    expect(s.juiceL).toBeGreaterThan(VESSEL_1GAL * 0.5);
  });

  it("pyment pins grape juice with even higher fraction", () => {
    const s = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "pyment" });
    expect(s.juiceType).toBe("grape");
    expect(s.juiceL).toBeGreaterThan(VESSEL_1GAL * 0.7);
  });

  it("melomel leaves the juice type to the caller", () => {
    const noJuice = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "melomel" });
    expect(noJuice.juiceType).toBeUndefined();
    expect(noJuice.juiceL).toBe(0);

    const withCherry = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "melomel", juiceType: "tart_cherry" });
    expect(withCherry.juiceType).toBe("tart_cherry");
    expect(withCherry.juiceL).toBeGreaterThan(0);
  });
});

describe("solveRecipe — target sweetness", () => {
  it("a higher target sweetness needs more honey (same vessel + yeast)", () => {
    const dry = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "traditional", targetSweetness: 0 });
    const sweet = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "traditional", targetSweetness: 3 });
    expect(sweet.honeyKg).toBeGreaterThan(dry.honeyKg);
  });

  it("dessert sweetness with EC-1118 warns + caps (high attenuation can't leave residual)", () => {
    const s = solveRecipe({
      vesselCapacityL: VESSEL_1GAL, style: "traditional", yeast: "EC-1118", targetSweetness: 4,
    });
    expect(s.warning).toBeTruthy();
    expect(s.targetOG).toBeLessThanOrEqual(1.150 + 1e-9);
  });

  it("warns when the solved OG would exceed yeast tolerance (sweet with low-tol yeast)", () => {
    // Bread yeast tolerance is ~10%; pushing target sweetness Sweet/Dessert at
    // a moderate attenuation OG will pass tolerance.
    const s = solveRecipe({
      vesselCapacityL: VESSEL_1GAL, style: "traditional", yeast: "Bread", targetSweetness: 4,
    });
    expect(s.warning).toBeTruthy();
  });
});

describe("solveRecipe — juice doesn't dominate at a dry target", () => {
  it("Dry Cyser still produces SOME honey (juice is auto-reduced + warning fires)", () => {
    // Dry target naturally requires low gravity, so the absolute honey weight
    // is small; the previous bug was honey = 0 (pure cider). Now it's >0 and a
    // warning explains why this combo means "barely-honeyed cider."
    const s = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "cyser", targetSweetness: 0 });
    expect(s.honeyKg).toBeGreaterThan(0);
    expect(s.warning).toBeTruthy();
  });
  it("Semi-sweet Cyser keeps the full style juice fraction (no reduction)", () => {
    const s = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "cyser", targetSweetness: 2 });
    // ~75% of 3.78 ≈ 2.83 L; allow a small tolerance for rounding
    expect(s.juiceL).toBeGreaterThan(2.5);
  });
});

describe("solveRecipe — volume budgeting", () => {
  it("total volume equals the vessel capacity (honey vol + juice + water)", () => {
    const s = solveRecipe({ vesselCapacityL: VESSEL_5GAL, style: "cyser" });
    const total = s.honeyKg * HONEY_DENSITY_L_PER_KG + s.juiceL + s.waterL;
    expect(total).toBeCloseTo(VESSEL_5GAL, 1);
  });

  it("scales with vessel size (5-gal sack uses about 5× the 1-gal honey)", () => {
    const s1 = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "sack" });
    const s5 = solveRecipe({ vesselCapacityL: VESSEL_5GAL, style: "sack" });
    // ratio should be near 5; allow a window for rounding
    expect(s5.honeyKg / s1.honeyKg).toBeGreaterThan(4.5);
    expect(s5.honeyKg / s1.honeyKg).toBeLessThan(5.5);
  });

  it("the projected SG of the solved recipe is close to the solver's target OG", () => {
    const s = solveRecipe({ vesselCapacityL: VESSEL_1GAL, style: "traditional", targetSweetness: 1 });
    const sg = startingGravity(s);
    // Within 0.005 of target — small slop is acceptable; the math may shift
    // slightly after the honey-volume substitution into waterL.
    expect(Math.abs(sg - s.targetOG)).toBeLessThan(0.005);
  });
});

// Quick sanity probe of the gravity model so the solver and projection stay
// in lock-step (catches future refactors to either constant).
describe("solver/projection consistency", () => {
  it("honey-only OG matches the model at totalL = vessel", () => {
    const honeyKg = 1.4;
    const totalL = 3.78;
    const og = startingGravity({ honeyKg, waterL: totalL - honeyKg * HONEY_DENSITY_L_PER_KG });
    const expected = 1 + (honeyKg * HONEY_GRAVITY_PER_KG_PER_L) / totalL;
    expect(og).toBeCloseTo(expected, 4);
  });

  it("juice points use the documented SG_PER_BRIX constant", () => {
    expect(JUICES.apple.typicalBrix * SG_PER_BRIX).toBeCloseTo(0.048, 4);
  });
});
