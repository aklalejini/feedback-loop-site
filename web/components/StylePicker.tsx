"use client";
import { STYLE_ORDER, STYLE_PROFILES, type StyleKind } from "@/lib/styles";

const SWEETNESS_LABELS = ["Dry", "Off-dry", "Semi-sweet", "Sweet", "Dessert"] as const;

interface Props {
  // Current style + target sweetness (both optional — undefined = "Custom").
  style: StyleKind;
  targetSweetness: number;
  // Called with the new style; the form solves + reseeds.
  onPickStyle: (kind: StyleKind) => void;
  // Called with the new target sweetness (0-4); the form re-solves at the
  // current style.
  onPickSweetness: (level: number) => void;
}

export function StylePicker({ style, targetSweetness, onPickStyle, onPickSweetness }: Props) {
  const styleProfile = STYLE_PROFILES[style];
  const showSweetness = style !== "custom";
  return (
    <div className="grid gap-2">
      <div>
        <p className="eyebrow text-[var(--ink-soft)] mb-1.5">Style</p>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_ORDER.map((k) => {
            const p = STYLE_PROFILES[k];
            return (
              <button
                key={k}
                type="button"
                aria-pressed={style === k}
                onClick={() => onPickStyle(k)}
                title={p.description}
                className="opt px-2.5 py-1 text-xs font-semibold"
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--muted)] mt-1.5">
          {styleProfile.description}
          {style !== "custom" ? (
            <span className="text-[var(--ink-soft)]">
              {" "}· typical OG {styleProfile.ogRange[0].toFixed(3)}–{styleProfile.ogRange[1].toFixed(3)}
            </span>
          ) : null}
        </p>
      </div>

      {showSweetness ? (
        <div>
          <p className="eyebrow text-[var(--ink-soft)] mb-1.5">Target sweetness</p>
          <div className="flex flex-wrap gap-1.5">
            {SWEETNESS_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={targetSweetness === i}
                onClick={() => onPickSweetness(i)}
                className="opt px-2.5 py-1 text-xs font-semibold"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5">
            Picking a chip <strong>seeds the recipe</strong> for that combination —
            honey, water, juice, and yeast. You can still tweak any slider afterwards.
          </p>
        </div>
      ) : null}
    </div>
  );
}
