"use client";
import { flavorProjection, SWEETNESS_LABELS } from "@/lib/flavor";
import type { Mead } from "@/lib/mead";

// A "likely taste" card: a dry→sweet scale plus strength, body, and character
// notes derived from the selected honey / juice / yeast / spices. Clearly an
// estimate (see the footnote) — taste really depends on fermentation + aging.
export function FlavorSummary({ mead }: { mead: Mead }) {
  const f = flavorProjection(mead);
  return (
    <div className="grid gap-2.5">
      <p className="eyebrow text-[var(--ink-soft)]">Likely taste</p>

      <div className="grid gap-1">
        <div className="flex justify-between text-[10px] text-[var(--muted)]">
          <span>Dry</span>
          <span>Sweet</span>
        </div>
        <div className="flex gap-1" role="img" aria-label={`Sweetness: ${f.sweetnessLabel}`}>
          {SWEETNESS_LABELS.map((lab, i) => (
            <div
              key={lab}
              title={lab}
              className={`flex-1 h-2 rounded-full ${
                i === f.sweetnessLevel
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--card-2)] border border-[var(--line)]"
              }`}
            />
          ))}
        </div>
        <p className="text-sm">
          <strong className="text-[var(--ink)]">{f.sweetnessLabel}</strong>
          <span className="text-[var(--muted)]"> · </span>
          {f.strengthLabel} (~{f.estABV.toFixed(1)}% ABV)
          <span className="text-[var(--muted)]"> · </span>
          {f.body} body
        </p>
      </div>

      <ul className="grid gap-1 text-sm text-[var(--ink-soft)]">
        {f.character.map((c) => (
          <li key={c} className="flex gap-1.5">
            <span aria-hidden className="text-[var(--muted)]">•</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      {f.caveat ? <p className="text-xs text-amber-900">{f.caveat}</p> : null}

      <p className="text-xs text-[var(--muted)]">
        A rough projection from the recipe — actual taste depends on fermentation, aging, and your palate.
      </p>
    </div>
  );
}
