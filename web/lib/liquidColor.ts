// Liquid-colour blend for the vessel renderer. Pulled out of SpriteVessel so
// it can be tested without React / canvas / path-aliases. The renderer composes
// the result into its palette via paletteFromBase.

import { HONEYS, JUICES, type HoneyType, type JuiceKind } from "./mead";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Linear RGB mix of two hex colours by weight w in [0,1] (0 = a, 1 = b).
// RGB-space mix avoids the hue-wraparound artefacts an HSL lerp would produce
// between e.g. amber and purple.
export function mixHex(a: string, b: string, w: number): string {
  const W = clamp(w, 0, 1);
  const na = parseInt(a.replace("#", ""), 16);
  const nb = parseInt(b.replace("#", ""), 16);
  const ar = (na >> 16) & 255, ag = (na >> 8) & 255, ab = na & 255;
  const br = (nb >> 16) & 255, bg = (nb >> 8) & 255, bb = nb & 255;
  const r = Math.round(ar * (1 - W) + br * W);
  const g = Math.round(ag * (1 - W) + bg * W);
  const bl = Math.round(ab * (1 - W) + bb * W);
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(bl)}`;
}

// Blend honey + juice colours into the liquid's base. Fruit pigments
// (anthocyanins) are potent and dominate a pale honey must well beyond their
// volume share — so the colour weight is biased high: any real juice presence
// jumps the blend most of the way to the juice colour, and ~45%+ volume reaches
// the pure juice colour. (A pure volume-average muddies amber + blue into brown,
// which is why blueberry barely showed before.)
export function liquidBaseHex(
  honeyType: HoneyType,
  juiceType?: JuiceKind,
  juiceFraction = 0,
): string {
  const honey = HONEYS[honeyType].color;
  if (!juiceType || juiceFraction <= 0) return honey;
  const juice = JUICES[juiceType].color;
  const w = clamp(0.4 + juiceFraction * 1.3, 0, 1);
  return mixHex(honey, juice, w);
}
