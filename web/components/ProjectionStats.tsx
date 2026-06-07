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

// Gravity as two comparison bars (sugar above 1.000): OG full, FG shorter. Bars
// are meant to span the width, so this never reads as a "stretched" line, and the
// short FG bar makes the drop obvious. The honest framing is "how much sugar is
// left vs. fermented".
function GravityBar({ og, fg }: { og: number; fg: number }) {
  const ogPts = Math.max(0.0001, (og - 1) * 1000);
  const fgPts = Math.max(0, (fg - 1) * 1000);
  const fgPctOfOg = Math.min(100, (fgPts / ogPts) * 100);
  const dropped = Math.max(0, Math.round(ogPts - fgPts));
  return (
    <div className="grid gap-1.5">
      <GravityRow label="OG" value={og.toFixed(3)} pct={100} color="var(--accent)" />
      <GravityRow label="FG" value={fg.toFixed(3)} pct={fgPctOfOg} color="var(--accent-deep)" />
      <p className="text-xs text-[var(--ink-soft)] font-mono">
        −{dropped} pts fermented<span className="text-[var(--muted)]"> · gravity only drops</span>
      </p>
    </div>
  );
}

function GravityRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] w-6 shrink-0 text-[var(--ink-soft)]">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-[var(--card-2)] border border-[var(--line)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.max(2, pct)}%`, background: color }} />
      </div>
      <span className="font-mono text-[11px] w-16 shrink-0 text-right text-[var(--ink)]">{value}</span>
    </div>
  );
}
