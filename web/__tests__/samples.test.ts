import { describe, expect, it } from "vitest";
import { project, SAMPLE_MEAD_NAME_PREFIX } from "../lib/mead";
import { buildAllSamples, buildSampleMead, SAMPLES } from "../lib/samples";

describe("SAMPLES — beginner roster shape", () => {
  it("has at least 3 variants so a beginner sees a real choice", () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(3);
  });
  it("every sample has a label + end-product description + takeaway", () => {
    for (const s of SAMPLES) {
      expect(s.label.length).toBeGreaterThan(2);
      expect(s.endProduct.length).toBeGreaterThan(10);
      expect(s.takeaway.length).toBeGreaterThan(5);
    }
  });
  it("each sample.kind is unique", () => {
    const kinds = SAMPLES.map((s) => s.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });
});

describe("buildSampleMead — day-0 batches", () => {
  const NOW = new Date("2026-06-07T12:00:00.000Z");

  it("createdAt is the SAME instant as `now` (no backdating)", () => {
    for (const spec of SAMPLES) {
      const m = buildSampleMead(spec, NOW);
      expect(m.createdAt).toBe(NOW.toISOString());
    }
  });

  it("has no observations on first load (was previously 1; that was the bug)", () => {
    for (const spec of SAMPLES) {
      expect(buildSampleMead(spec, NOW).observations).toEqual([]);
    }
  });

  it("starts in the LAG phase when viewed at the same instant", () => {
    for (const spec of SAMPLES) {
      const m = buildSampleMead(spec, NOW);
      const p = project(m, NOW);
      expect(p.currentPhase).toBe("lag");
    }
  });

  it("names carry the SAMPLE_MEAD_NAME_PREFIX for easy identification", () => {
    for (const spec of SAMPLES) {
      const m = buildSampleMead(spec, NOW);
      expect(m.name.startsWith(SAMPLE_MEAD_NAME_PREFIX)).toBe(true);
      expect(m.name).toContain(spec.label);
    }
  });

  it("each call yields a fresh id (so two loads of the same sample don't collide)", () => {
    for (const spec of SAMPLES) {
      expect(buildSampleMead(spec, NOW).id).not.toBe(buildSampleMead(spec, NOW).id);
    }
  });

  it("each sample produces a sensible projected ABV (hobbyist band 4–18%)", () => {
    for (const spec of SAMPLES) {
      const m = buildSampleMead(spec, NOW);
      const p = project(m, NOW);
      expect(p.estABV).toBeGreaterThan(4);
      expect(p.estABV).toBeLessThan(18);
    }
  });

  it("each sample carries its style tag (used by the detail page's flavor summary)", () => {
    for (const spec of SAMPLES) {
      const m = buildSampleMead(spec, NOW);
      expect(m.style).toBe(spec.style);
      expect(m.targetSweetness).toBe(spec.targetSweetness);
    }
  });
});

describe("buildAllSamples — convenience", () => {
  it("returns one entry per sample, all with the same createdAt instant", () => {
    const now = new Date("2026-06-07T00:00:00.000Z");
    const built = buildAllSamples(now);
    expect(built.length).toBe(SAMPLES.length);
    for (const { mead } of built) {
      expect(mead.createdAt).toBe(now.toISOString());
    }
  });
});
