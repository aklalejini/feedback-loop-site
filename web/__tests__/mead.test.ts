import { describe, expect, it } from "vitest";
import {
  blankMead,
  currentPhase,
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
