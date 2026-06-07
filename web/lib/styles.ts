// Mead style profiles. Each one is a starter template that the recipe solver
// turns into concrete honey/water/juice amounts at the user's vessel size.
//
// References: docs/research/mead-fermentation.md "Style and Gravity Ranges"
// (AHA bands), plus traditional homebrew terminology for variant styles
// (cyser, pyment, melomel, metheglin, bochet — well-established names).

import type { HoneyType, JuiceKind, YeastStrain } from "./mead";

export type StyleKind =
  | "traditional"
  | "sack"
  | "hydromel"
  | "cyser"
  | "pyment"
  | "melomel"
  | "metheglin"
  | "bochet"
  | "custom";

export interface StyleProfile {
  kind: StyleKind;
  label: string;
  description: string;
  // Suggested OG midpoint; the solver may shift this to hit the target sweetness.
  defaultOG: number;
  // Range shown in the UI ("standard 1.080-1.120").
  ogRange: [number, number];
  // What proportion of the vessel volume is juice when the style implies fruit.
  // 0 = no juice; cyser ~0.75 (apple-heavy); pyment ~0.85; melomel ~0.30.
  juiceFraction: number;
  // For cyser/pyment the juice is pinned. Melomel is "your pick" so it's null.
  juiceType: JuiceKind | null;
  // Honey nuance: bochet is caramelized honey (we don't simulate the burn here,
  // we just lean on a darker honey to set expectations).
  honeyType?: HoneyType;
  // Common yeast pick for the style (a sensible default; user can change).
  yeast: YeastStrain;
  // Default target sweetness band (0=Dry..4=Dessert).
  defaultSweetness: number;
  // Pre-selected spices for metheglin; empty otherwise.
  spices: string[];
}

export const STYLE_PROFILES: Record<StyleKind, StyleProfile> = {
  traditional: {
    kind: "traditional",
    label: "Traditional",
    description: "Plain mead — honey + water + yeast. The reference point.",
    defaultOG: 1.100,
    ogRange: [1.080, 1.120],
    juiceFraction: 0,
    juiceType: null,
    yeast: "D-47",
    // With D-47's 0.80 attenuation, Semi-sweet (FG mid 1.016) maps to OG ≈ 1.080
    // — right at the bottom of AHA's standard band. The right "default" for the
    // style. Drier targets push OG down out of style; sweeter push it up.
    defaultSweetness: 2,
    spices: [],
  },
  sack: {
    kind: "sack",
    label: "Sack",
    description: "High-gravity mead — strong, sweet, long-aging. Built for the cellar.",
    defaultOG: 1.140,
    ogRange: [1.120, 1.170],
    juiceFraction: 0,
    juiceType: null,
    yeast: "K1-V1116",
    defaultSweetness: 3, // Sweet
    spices: [],
  },
  hydromel: {
    kind: "hydromel",
    label: "Hydromel",
    description: "Session-strength mead — light, dry, drinkable young.",
    defaultOG: 1.055,
    ogRange: [1.035, 1.080],
    juiceFraction: 0,
    juiceType: null,
    yeast: "71B-1122",
    defaultSweetness: 0, // Dry
    spices: [],
  },
  cyser: {
    kind: "cyser",
    label: "Cyser",
    description: "Honey + apple juice — classic North American melomel.",
    defaultOG: 1.085,
    ogRange: [1.075, 1.110],
    juiceFraction: 0.75,
    juiceType: "apple",
    yeast: "71B-1122",
    defaultSweetness: 2,
    spices: [],
  },
  pyment: {
    kind: "pyment",
    label: "Pyment",
    description: "Honey + grape juice — a mead-wine hybrid.",
    defaultOG: 1.100,
    ogRange: [1.090, 1.120],
    juiceFraction: 0.85,
    juiceType: "grape",
    yeast: "D-47",
    defaultSweetness: 2,
    spices: [],
  },
  melomel: {
    kind: "melomel",
    label: "Melomel",
    description: "Honey + non-apple/grape fruit juice (cherry, pomegranate, citrus).",
    defaultOG: 1.090,
    ogRange: [1.080, 1.110],
    juiceFraction: 0.30,
    juiceType: null, // user picks
    yeast: "71B-1122",
    defaultSweetness: 2,
    spices: [],
  },
  metheglin: {
    kind: "metheglin",
    label: "Metheglin",
    description: "Spiced mead — cinnamon, vanilla, ginger, citrus peel.",
    defaultOG: 1.100,
    ogRange: [1.080, 1.120],
    juiceFraction: 0,
    juiceType: null,
    yeast: "D-47",
    defaultSweetness: 2,
    spices: ["cinnamon", "vanilla bean", "orange peel"],
  },
  bochet: {
    kind: "bochet",
    label: "Bochet",
    description: "Mead from caramelized honey — toffee, marshmallow, dark fruit notes.",
    defaultOG: 1.110,
    ogRange: [1.090, 1.130],
    juiceFraction: 0,
    juiceType: null,
    honeyType: "buckwheat",
    yeast: "D-47",
    defaultSweetness: 2,
    spices: [],
  },
  custom: {
    kind: "custom",
    label: "Custom",
    description: "Free-form — design from the inputs directly.",
    defaultOG: 1.100,
    ogRange: [1.080, 1.120],
    juiceFraction: 0,
    juiceType: null,
    yeast: "D-47",
    defaultSweetness: 2,
    spices: [],
  },
};

// Style order shown in the picker; "custom" anchors the end.
export const STYLE_ORDER: StyleKind[] = [
  "traditional", "sack", "hydromel", "cyser", "pyment", "melomel", "metheglin", "bochet", "custom",
];
