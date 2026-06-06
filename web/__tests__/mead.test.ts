import { describe, expect, it } from "vitest";
import {
  blankMead,
  currentPhase,
  fermentationRisks,
  gravitySource,
  potentialAbvToDry,
  project,
  sampleMead,
  SAMPLE_MEAD_NAME_PREFIX,
  startingGravity,
  YEASTS,
  type Mead,
} from "../lib/mead";

const baseMead = (overrides: Partial<Mead> = {}): Mead => ({
  ...blankMead("Test"),
  createdAt: "2026-01-01T00:00:00.000Z",
  honeyKg: 1.4,
  waterL: 3.0,
  ...overrides,
});

describe("startingGravity", () => {
  it("is 1.0 when no honey", () => {
    expect(startingGravity({ honeyKg: 0, waterL: 3 })).toBeCloseTo(1.0, 4);
  });

  it("is in plausible mead range for a standard recipe", () => {
    const sg = startingGravity({ honeyKg: 1.4, waterL: 3.0 });
    expect(sg).toBeGreaterThan(1.08);
    expect(sg).toBeLessThan(1.16);
  });

  it("scales with honey amount", () => {
    const low = startingGravity({ honeyKg: 1.0, waterL: 3.0 });
    const high = startingGravity({ honeyKg: 2.0, waterL: 3.0 });
    expect(high).toBeGreaterThan(low);
  });
});

describe("project", () => {
  it("produces four phases in chronological order", () => {
    const m = baseMead();
    const p = project(m, new Date("2026-01-02T00:00:00.000Z"));
    expect(p.phases).toHaveLength(4);
    for (let i = 1; i < p.phases.length; i++) {
      expect(new Date(p.phases[i].startsAt).getTime())
        .toBeGreaterThanOrEqual(new Date(p.phases[i - 1].startsAt).getTime());
      expect(new Date(p.phases[i].endsAt).getTime())
        .toBeGreaterThan(new Date(p.phases[i].startsAt).getTime());
    }
  });

  it("estimates ABV within hobbyist-mead bounds (8-18%)", () => {
    const m = baseMead({ yeast: "D-47" });
    const p = project(m, new Date(m.createdAt));
    expect(p.estABV).toBeGreaterThan(8);
    expect(p.estABV).toBeLessThan(18);
  });

  it("phase advances over time", () => {
    const m = baseMead();
    const dayOfStart = project(m, new Date("2026-01-01T01:00:00.000Z")).currentPhase;
    const weekIn = project(m, new Date("2026-01-08T00:00:00.000Z")).currentPhase;
    expect(dayOfStart).toBe("lag");
    expect(["primary", "secondary"]).toContain(weekIn);
  });

  it("re-projects from latest gravity observation", () => {
    const m = baseMead({
      yeast: "D-47",
      observations: [
        {
          id: "o1",
          at: "2026-01-15T00:00:00.000Z",
          gravity: 1.005, // close to FG → should shorten remaining timeline
        },
      ],
    });
    const withObs = project(m);
    const noObs = project({ ...m, observations: [] });
    const lastWith = new Date(withObs.phases.at(-1)!.endsAt).getTime();
    const lastNo = new Date(noObs.phases.at(-1)!.endsAt).getTime();
    expect(lastWith).toBeLessThan(lastNo);
  });
});

describe("currentPhase", () => {
  it("returns 'done' once past the last phase end", () => {
    const m = baseMead();
    const p = project(m);
    const after = new Date(new Date(p.phases.at(-1)!.endsAt).getTime() + 86400000);
    expect(currentPhase(p.phases, after)).toBe("done");
  });
});

describe("YEAST table", () => {
  it("has attenuation between 0.5 and 1.0 for every strain", () => {
    for (const y of Object.values(YEASTS)) {
      expect(y.attenuationPct).toBeGreaterThan(0.5);
      expect(y.attenuationPct).toBeLessThanOrEqual(1.0);
    }
  });
});

describe("sampleMead", () => {
  it("is identifiable as a sample via the name prefix", () => {
    expect(sampleMead().name.startsWith(SAMPLE_MEAD_NAME_PREFIX)).toBe(true);
  });

  it("lands in primary or secondary on first view (backdated ~21 days)", () => {
    const now = new Date("2026-06-06T00:00:00.000Z");
    const s = sampleMead(now);
    const p = project(s, now);
    expect(["primary", "secondary"]).toContain(p.currentPhase);
  });

  it("contains one example observation so the timeline re-projects", () => {
    expect(sampleMead().observations.length).toBe(1);
  });

  it("each call yields a fresh id (so multiple loads don't collide)", () => {
    expect(sampleMead().id).not.toBe(sampleMead().id);
  });

  it("produces a realistic mead with ABV in the hobbyist band", () => {
    const p = project(sampleMead());
    expect(p.estABV).toBeGreaterThan(8);
    expect(p.estABV).toBeLessThan(18);
  });
});

describe("fermentationRisks", () => {
  it("flags yeast tolerance when potential ABV exceeds it", () => {
    // SG 1.140 → ~18.4% potential, well over D-47's ~14%
    const risks = fermentationRisks(1.140, YEASTS["D-47"]);
    expect(risks.some((r) => r.kind === "tolerance")).toBe(true);
  });

  it("does not flag tolerance for a standard batch within range", () => {
    // SG 1.085 → ~11.2% potential, under D-47's ~14%
    const risks = fermentationRisks(1.085, YEASTS["D-47"]);
    expect(risks.some((r) => r.kind === "tolerance")).toBe(false);
  });

  it("flags osmotic stress above 1.120 regardless of yeast", () => {
    const risks = fermentationRisks(1.135, YEASTS["EC-1118"]);
    expect(risks.some((r) => r.kind === "osmotic")).toBe(true);
  });

  it("does not flag osmotic stress at exactly 1.120", () => {
    const risks = fermentationRisks(1.120, YEASTS["EC-1118"]);
    expect(risks.some((r) => r.kind === "osmotic")).toBe(false);
  });

  it("produces no risks for an empty must", () => {
    expect(fermentationRisks(1.000, YEASTS["D-47"]).length).toBe(0);
  });
});

describe("startingGravity (measured-OG override)", () => {
  it("uses measuredOG verbatim when present", () => {
    expect(startingGravity({ honeyKg: 1.4, waterL: 3.0, measuredOG: 1.072 })).toBe(1.072);
  });
  it("falls back to recipe estimate when measuredOG is undefined", () => {
    const sg = startingGravity({ honeyKg: 1.4, waterL: 3.0 });
    expect(sg).toBeGreaterThan(1.08);
    expect(sg).toBeLessThan(1.16);
  });
  it("ignores measuredOG when it is 0 or negative (treats as unset)", () => {
    expect(startingGravity({ honeyKg: 1.4, waterL: 3.0, measuredOG: 0 })).toBeGreaterThan(1.08);
  });
  it("propagates through project() so FG and ABV come off the measured value", () => {
    const m: Mead = { ...blankMead("t"), honeyKg: 0, waterL: 0, measuredOG: 1.100, yeast: "D-47" };
    const p = project(m, new Date(m.createdAt));
    expect(p.startingGravity).toBe(1.100);
    // FG = 1 + (0.1) * (1 - 0.8) = 1.020 → ABV ~ (1.100 - 1.020) * 131.25 = 10.5
    expect(p.estABV).toBeCloseTo(10.5, 1);
  });
});

describe("gravitySource", () => {
  it("returns 'measured' when measuredOG is set and positive", () => {
    expect(gravitySource({ measuredOG: 1.090 })).toBe("measured");
  });
  it("returns 'estimated' when measuredOG is absent or zero", () => {
    expect(gravitySource({})).toBe("estimated");
    expect(gravitySource({ measuredOG: 0 })).toBe("estimated");
  });
});

describe("potentialAbvToDry", () => {
  it("maps SG to ABV via the standard 131.25 factor", () => {
    expect(potentialAbvToDry(1.100)).toBeCloseTo(13.125, 3);
  });
  it("clamps to zero below 1.000", () => {
    expect(potentialAbvToDry(0.995)).toBe(0);
  });
});

describe("startingGravity (juice / melomel)", () => {
  it("juice adds sugar — gravity higher than the equivalent water-only must", () => {
    const water = startingGravity({ honeyKg: 1, waterL: 3 });
    const cider = startingGravity({ honeyKg: 1, waterL: 0, juiceL: 3, juiceType: "apple" });
    expect(cider).toBeGreaterThan(water);
  });
  it("with no honey, juice alone gives a plausible cider-strength gravity (apple ~12 Bx)", () => {
    const og = startingGravity({ honeyKg: 0, waterL: 0, juiceL: 3, juiceType: "apple" });
    // 12 Bx * 0.004 SG/Bx ≈ 0.048 → SG ~ 1.048
    expect(og).toBeGreaterThan(1.04);
    expect(og).toBeLessThan(1.06);
  });
  it("juiceType undefined ignores any juice sugar (treats juice as water for volume)", () => {
    const withJuice = startingGravity({ honeyKg: 1, waterL: 2, juiceL: 1 });
    const allWater = startingGravity({ honeyKg: 1, waterL: 3 });
    expect(withJuice).toBeCloseTo(allWater, 4);
  });
  it("measuredOG still wins when juice is present", () => {
    expect(
      startingGravity({ honeyKg: 1, waterL: 2, juiceL: 1, juiceType: "grape", measuredOG: 1.092 }),
    ).toBe(1.092);
  });
});
