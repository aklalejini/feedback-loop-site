import type { ReactNode } from "react";

interface Props {
  startingGravity: number;
  estFinalGravity: number;
  estABV: number;
  source: "measured" | "estimated";
}

// The projection summary used by both the planner and the batch detail page:
// three labelled cards plus a gravity sparkline so the OG → FG drop reads at a
// glance, and an honesty note about where the numbers come from.
export function ProjectionStats({ startingGravity, estFinalGravity, estABV, source }: Props) {
  const measured = source === "measured";
  return (
    <div className="grid gap-2.5">
      <p className="eyebrow text-[var(--ink-soft)]">{measured ? "Measured" : "Recipe estimate"}</p>

      <div className="grid grid-cols-3 gap-2">
        <StatCard
          tag="OG"
          label={measured ? "Measured OG" : "Starting gravity"}
          value={startingGravity.toFixed(3)}
        />
        <StatCard tag="FG" label="Est. final gravity" value={estFinalGravity.toFixed(3)} />
        <StatCard tag="ABV" label="Est. alcohol" value={`${estABV.toFixed(1)}%`} />
      </div>

      <GravityBar og={startingGravity} fg={estFinalGravity} />

      <p className="text-xs text-[var(--muted)]">
        {measured
          ? "Using your hydrometer reading. FG and ABV are still estimates from yeast attenuation."
          : "Estimated from the recipe. A hydrometer reading of your actual must is more accurate."}
      </p>
    </div>
  );
}

function StatCard({ tag, label, value }: { tag: string; label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--card-2)] px-3 py-2 grid gap-0.5">
      <span className="eyebrow text-[10px] text-[var(--muted)]">{label}</span>
      <span className="flex items-baseline gap-1">
        <span className="font-mono text-base text-[var(--ink)]">{value}</span>
        <span className="text-[10px] font-semibold text-[var(--muted)]">{tag}</span>
      </span>
    </div>
  );
}

// A clean, monotonic gravity chart: a single straight descent from OG (high,
// left) to FG (low, right) with labeled endpoints — gravity only ever drops, so
// a straight line can't imply a rise. Endpoints are dotted + labeled; the points
// dropped are called out.
function GravityBar({ og, fg }: { og: number; fg: number }) {
  const points = Math.max(0, Math.round((og - fg) * 1000));
  const W = 240, H = 48, x0 = 12, x1 = W - 12, yTop = 12, yBot = H - 14;
  const line = `M ${x0} ${yTop} L ${x1} ${yBot}`;
  const area = `${line} L ${x1} ${H - 2} L ${x0} ${H - 2} Z`;
  return (
    <div className="grid gap-1">
      <div className="flex items-stretch gap-2">
        <span className="font-mono text-[11px] text-[var(--ink-soft)] self-start leading-none pt-1">OG</span>
        <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 h-12" preserveAspectRatio="none" aria-hidden>
          <line x1={x0} y1={H - 2} x2={x1} y2={H - 2} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={area} fill="var(--accent)" opacity="0.12" />
          <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <circle cx={x0} cy={yTop} r="4" fill="var(--accent)" />
          <circle cx={x1} cy={yBot} r="4" fill="var(--accent-deep)" />
        </svg>
        <span className="font-mono text-[11px] text-[var(--ink-soft)] self-end leading-none pb-1">FG</span>
      </div>
      <p className="text-xs text-[var(--ink-soft)] font-mono">
        {og.toFixed(3)} <span aria-hidden>↓</span> {fg.toFixed(3)}
        <span className="text-[var(--muted)]"> · −{points} pts</span>
      </p>
    </div>
  );
}
