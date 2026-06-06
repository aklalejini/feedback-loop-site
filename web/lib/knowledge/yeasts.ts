// Yeast strain profiles for the knowledge base.
//
// This is curated CONTENT (separate from the planner's tuning constants in
// lib/mead.ts), so every factual claim can carry a citation. Coverage is the
// four Lallemand strains the research brief documents in detail
// (docs/research/mead-fermentation.md "Product Table for Common Mead Yeasts",
// rows for Lalvin 71B, ICV-D47, EC-1118, K1-V1116). More strains will be added
// as they are sourced — we don't publish unsourced numbers.

import type { YeastStrain } from "@/lib/mead";

export interface YeastSource {
  label: string;
  url: string;
}

export interface YeastProfile {
  slug: string;
  name: string;
  aka?: string;
  plannerStrain?: YeastStrain; // matching id in the planner, if any
  category: string;
  summary: string; // one line — also used as the meta description
  tempRange: string;
  alcoholTolerance: string;
  nitrogen: string; // sourced phrasing, not a forced category
  sensory: string;
  bestFor: string[];
  notes: string[];
  sources: YeastSource[];
}

// Shared, brief-grounded caveat shown on every profile.
export const TOLERANCE_CAVEAT =
  "Alcohol tolerance is not a hard stop — it depends on pitch rate, nutrients, temperature, pH, and osmotic stress, and manufacturer sheets state it is subject to fermentation conditions.";

export const YEAST_PROFILES: YeastProfile[] = [
  {
    slug: "lalvin-71b",
    name: "Lalvin 71B",
    aka: "71B-1122",
    plannerStrain: "71B-1122",
    category: "Wine yeast (Saccharomyces cerevisiae)",
    summary:
      "Ester-forward wine yeast that can partially metabolize malic acid — a friendly pick for fruit meads and early drinking.",
    tempRange: "15–30 °C (59–86 °F)",
    alcoholTolerance: "~14%",
    nitrogen: "Low nutrient need.",
    sensory: "Fruit-forward, ester profile; rounds out high-acid fruit musts.",
    bestFor: ["Fruit meads (melomels)", "Young, early-drinking meads", "High-acid fruit additions"],
    notes: [
      "Can partially metabolize malic acid, softening sharp fruit acidity.",
      "Moderate fermentation speed.",
      TOLERANCE_CAVEAT,
    ],
    sources: [
      { label: "Lallemand — Lalvin 71B", url: "https://www.lallemandwine.com/en/united-states/products/wine-yeasts/lalvin-71b/" },
    ],
  },
  {
    slug: "lalvin-icv-d47",
    name: "Lalvin ICV-D47",
    aka: "D-47",
    plannerStrain: "D-47",
    category: "Wine yeast (Saccharomyces cerevisiae)",
    summary:
      "Round, full-bodied wine yeast well suited to traditional meads — keep it warm enough to avoid stressing it.",
    tempRange: "15–30 °C (59–86 °F)",
    alcoholTolerance: "~15%",
    nitrogen: "Low relative nitrogen demand under lab conditions.",
    sensory: "Round, full-bodied mouthfeel.",
    bestFor: ["Traditional meads", "Full-bodied styles"],
    notes: [
      "Sensitive below 15 °C in clarified juice — hold fermentation temperature up to avoid stalls.",
      TOLERANCE_CAVEAT,
    ],
    sources: [
      { label: "Lallemand — Lalvin ICV-D47", url: "https://www.lallemandbrewing.com/fr/canada/produits/levure-lalvin-icv-d47/" },
    ],
  },
  {
    slug: "lalvin-ec-1118",
    name: "Lalvin EC-1118",
    aka: "EC-1118",
    plannerStrain: "EC-1118",
    category: "Wine/Champagne yeast (Saccharomyces bayanus)",
    summary:
      "Robust, neutral champagne strain that tolerates osmotic and pressure stress — the go-to for difficult ferments and restarts.",
    tempRange: "10–30 °C (50–86 °F)",
    alcoholTolerance: "up to 18%",
    nitrogen: "Robust and tolerant of difficult conditions.",
    sensory: "Neutral; lets honey and fruit character lead.",
    bestFor: ["High-gravity / sack meads", "Restarting stuck ferments", "Cold-tolerant fermentations"],
    notes: [
      "Tolerant of osmotic and pressure stress; useful for difficult ferments and restart-style use.",
      TOLERANCE_CAVEAT,
    ],
    sources: [
      { label: "Lallemand — Lalvin EC-1118", url: "https://www.lallemandbrewing.com/en/united-states/product-details/lalvin-ec-1118/" },
    ],
  },
  {
    slug: "lalvin-k1-v1116",
    name: "Lalvin K1-V1116",
    aka: "K1-V1116",
    plannerStrain: "K1-V1116",
    category: "Wine yeast (Saccharomyces cerevisiae)",
    summary:
      "Floral ester producer that stays robust under difficult conditions — give it good nutrition for low-temperature aromatic ferments.",
    tempRange: "10–35 °C (50–95 °F)",
    alcoholTolerance: "up to 18%",
    nitrogen: "Benefits from good nutrition, especially for low-temperature aromatic use.",
    sensory: "Floral ester producer.",
    bestFor: ["Aromatic / floral meads", "Wide temperature range", "Difficult conditions"],
    notes: [
      "Robust under difficult conditions across a wide temperature range.",
      TOLERANCE_CAVEAT,
    ],
    sources: [
      { label: "Lallemand — Lalvin K1-V1116", url: "https://www.lallemandbrewing.com/es/continental-europe/productos/lalvin-icv-k1-v1116/" },
    ],
  },
];

export function allYeastSlugs(): string[] {
  return YEAST_PROFILES.map((y) => y.slug);
}

export function getYeastProfile(slug: string): YeastProfile | undefined {
  return YEAST_PROFILES.find((y) => y.slug === slug);
}
