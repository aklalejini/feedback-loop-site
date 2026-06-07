// Rough "what will it taste like" projection from the recipe. This is an
// ESTIMATE — the research brief warns against claiming precise residual sugar
// from gravity, so sweetness is a qualitative band (labeled as such), and the
// measured-OG override still feeds it. Reuses the honey/juice/yeast notes from
// lib/mead so descriptors stay consistent with the pickers.

import {
  HONEYS,
  JUICES,
  YEASTS,
  potentialAbvToDry,
  startingGravity,
  type Mead,
  type YeastStrain,
} from "./mead";

export const SWEETNESS_LABELS = ["Dry", "Off-dry", "Semi-sweet", "Sweet", "Dessert"] as const;
const BODY_LABELS = ["Light", "Light–medium", "Medium", "Medium–full", "Full"] as const;

// Concise flavor descriptor per yeast (manufacturer/character, kept short).
const YEAST_FLAVOR: Record<YeastStrain, string> = {
  "EC-1118": "clean, neutral — lets the honey and fruit lead",
  "D-47": "round, full-bodied",
  "K1-V1116": "floral esters",
  "71B-1122": "fruity esters, softer acidity",
  "Wyeast-4632": "dry, classic mead character",
  "Bread": "rustic, bready",
};

const TART_JUICES = ["tart_cherry", "pomegranate", "orange"];

function sweetnessFromFG(fg: number): number {
  if (fg <= 1.004) return 0; // Dry
  if (fg <= 1.012) return 1; // Off-dry
  if (fg <= 1.020) return 2; // Semi-sweet
  if (fg <= 1.035) return 3; // Sweet
  return 4;                   // Dessert
}

export interface FlavorProjection {
  sweetnessLevel: number; // index into SWEETNESS_LABELS
  sweetnessLabel: string;
  strengthLabel: string;
  estABV: number;
  body: string;
  character: string[];
  caveat?: string;
}

export function flavorProjection(mead: Mead): FlavorProjection {
  const yeast = YEASTS[mead.yeast];
  const sg = startingGravity(mead);
  const estFG = 1 + (sg - 1) * (1 - yeast.attenuationPct);
  const estABV = Math.max(0, (sg - estFG) * 131.25);

  let level = sweetnessFromFG(estFG);
  let caveat: string | undefined;
  // If the must can't ferment to dry within the yeast's tolerance, expect more
  // residual sugar than attenuation alone predicts — nudge sweeter + flag it.
  if (potentialAbvToDry(sg) > yeast.alcoholTolerancePct + 0.5) {
    level = Math.min(SWEETNESS_LABELS.length - 1, level + 1);
    caveat =
      `Likely finishes sweeter than the gravity alone suggests — the potential ABV exceeds ` +
      `${yeast.strain}'s tolerance, so some sugar may stay unfermented.`;
  }

  const strengthLabel =
    estABV < 7.5 ? "Session-strength"
    : estABV < 10 ? "Light-standard"
    : estABV < 12.5 ? "Standard"
    : estABV < 15 ? "Strong"
    : "Sack (high-octane)";

  let bodyScore = level;
  if (mead.honeyType === "buckwheat") bodyScore += 1;
  if (mead.yeast === "D-47") bodyScore += 1;
  if (sg > 1.110) bodyScore += 1;
  const body = BODY_LABELS[Math.max(0, Math.min(BODY_LABELS.length - 1, bodyScore))];

  const tidy = (s: string) => s.toLowerCase().replace(/\.$/, "");
  const character: string[] = [];
  character.push(`${HONEYS[mead.honeyType].label} honey — ${tidy(HONEYS[mead.honeyType].note)}`);
  if (mead.juiceType) {
    character.push(`${JUICES[mead.juiceType].label} juice — ${tidy(JUICES[mead.juiceType].note)}`);
  }
  character.push(`${mead.yeast}: ${YEAST_FLAVOR[mead.yeast]}`);
  if (mead.juiceType && TART_JUICES.includes(mead.juiceType)) {
    character.push("bright, tart acidity from the fruit");
  }
  if (mead.spices.length) character.push(`spiced: ${mead.spices.join(", ")}`);

  return {
    sweetnessLevel: level,
    sweetnessLabel: SWEETNESS_LABELS[level],
    strengthLabel,
    estABV,
    body,
    character,
    caveat,
  };
}
