"use client";
import { flavorProjection, SWEETNESS_LABELS } from "@/lib/flavor";
import { STYLE_PROFILES, type StyleKind } from "@/lib/styles";
import { gravitySource, JUICES, type Mead } from "@/lib/mead";

interface Props {
  mead: Mead;
  startingGravity: number;
  estFinalGravity: number;
  estABV: number;
}

// A single consolidated "spec sheet" replacing the previous three stacked
// blocks (cards / gravity bars / taste). One scannable table top-to-bottom
// (OG · FG · ABV · Sweetness · Body · Style), then ONE combined visual below
// it that shows the OG → FG drop and the dry-to-sweet position on the same
// row. Keeps the honesty caveats + character bullets the v2 mission depends on.
export function SpecSheet({ mead, startingGravity, estFinalGravity, estABV }: Props) {
  const measured = gravitySource(mead) === "measured";
  const flavor = flavorProjection(mead);
  const styleKind = (mead.style as StyleKind | undefined) ?? "custom";
  const styleProfile = STYLE_PROFILES[styleKind];
  const styleLabel = styleKind === "custom" ? "Custom" : styleProfile.label;
  const juiceLabel = mead.juiceType ? JUICES[mead.juiceType].label.toLowerCase() : "";
  const styleDisplay = mead.juiceType && styleKind !== "custom"
    ? `${styleLabel} (${juiceLabel} melomel)`
    : styleLabel;

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="eyebrow text-[var(--ink-soft)]">{measured ? "Spec sheet · measured OG" : "Spec sheet · recipe estimate"}</p>
        <span className="text-[10px] text-[var(--muted)]">estimate</span>
      </div>

      <dl className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-1 text-sm">
        <Row k={measured ? "Measured OG" : "Starting gravity"} v={startingGravity.toFixed(3)} />
        <Row k="Final gravity" v={estFinalGravity.toFixed(3)} />
        <Row k="ABV" v={`${estABV.toFixed(1)}%`} />
        <Row k="Sweetness" v={flavor.sweetnessLabel} />
        <Row k="Body" v={flavor.body} />
        <Row k="Style" v={styleDisplay} />
      </dl>

      {/* One consolidated visual: OG→FG drop on top, sweetness band below,
          sharing a column so the eye reads them as one ribbon. */}
      <GravityAndSweetness
        og={startingGravity}
        fg={estFinalGravity}
        sweetnessLevel={flavor.sweetnessLevel}
      />

      <ul className="grid gap-1 text-sm text-[var(--ink-soft)]">
        {flavor.character.map((c) => (
          <li key={c} className="flex gap-1.5">
            <span aria-hidden className="text-[var(--muted)]">•</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      {flavor.caveat ? <p className="text-xs text-[var(--warn)]">{flavor.caveat}</p> : null}

      <p className="text-xs text-[var(--muted)]">
        {measured
          ? "Final gravity, ABV, and taste are projected from yeast attenuation — taste also depends on fermentation, aging, and your palate."
          : "Estimated from the recipe. A hydrometer reading is more accurate; taste also depends on fermentation, aging, and your palate."}
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-[var(--muted)] uppercase tracking-wide text-[11px] self-baseline">{k}</dt>
      <dd className="font-mono text-[var(--ink)] tabular-nums">{v}</dd>
    </>
  );
}

// One ribbon, two lanes: gravity (OG bar, FG bar) on top, sweetness band on
// bottom. Same width column so the two read as one consolidated visual.
function GravityAndSweetness({ og, fg, sweetnessLevel }: { og: number; fg: number; sweetnessLevel: number }) {
  const ogPts = Math.max(0.0001, (og - 1) * 1000);
  const fgPts = Math.max(0, (fg - 1) * 1000);
  const fgPctOfOg = Math.min(100, (fgPts / ogPts) * 100);
  const dropped = Math.max(0, Math.round(ogPts - fgPts));
  return (
    <div className="grid gap-1.5 rounded-md border border-[var(--line)] bg-[var(--card-2)] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] w-6 shrink-0 text-[var(--ink-soft)]">OG</span>
        <div className="flex-1 h-2 rounded-full bg-[var(--card)] border border-[var(--line)] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: "100%", background: "var(--accent)" }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] w-6 shrink-0 text-[var(--ink-soft)]">FG</span>
        <div className="flex-1 h-2 rounded-full bg-[var(--card)] border border-[var(--line)] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.max(2, fgPctOfOg)}%`, background: "var(--accent-deep)" }} />
        </div>
      </div>
      <p className="text-[11px] text-[var(--ink-soft)] font-mono pl-8">
        −{dropped} pts fermented<span className="text-[var(--muted)]"> · gravity only drops</span>
      </p>

      <div className="grid gap-1 mt-1">
        <div className="flex justify-between text-[10px] text-[var(--muted)] px-8">
          <span>Dry</span>
          <span>Sweet</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] w-6 shrink-0 text-[var(--ink-soft)]">SW</span>
          <div className="flex-1 flex gap-1" role="img" aria-label={`Sweetness: ${SWEETNESS_LABELS[sweetnessLevel]}`}>
            {SWEETNESS_LABELS.map((lab, i) => (
              <div
                key={lab}
                title={lab}
                className={`flex-1 h-2 rounded-full ${
                  i === sweetnessLevel
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--card)] border border-[var(--line)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
