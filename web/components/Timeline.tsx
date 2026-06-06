"use client";
import type { Projection } from "@/lib/mead";

interface Props {
  projection: Projection;
  now?: Date;
}

const phaseLabel: Record<string, string> = {
  lag: "Lag",
  primary: "Primary",
  secondary: "Secondary",
  conditioning: "Conditioning",
  done: "Ready",
};

const phaseColor: Record<string, string> = {
  lag: "#e8dfca",
  primary: "#d68a2e",
  secondary: "#b56a1f",
  conditioning: "#7c4416",
  done: "#3b2306",
};

export function Timeline({ projection, now = new Date() }: Props) {
  const start = new Date(projection.phases[0].startsAt).getTime();
  const end = new Date(projection.phases[projection.phases.length - 1].endsAt).getTime();
  const totalMs = end - start;
  const nowMs = Math.max(start, Math.min(end, now.getTime()));
  const nowPct = totalMs > 0 ? ((nowMs - start) / totalMs) * 100 : 0;

  return (
    <div className="grid gap-3">
      <div className="relative h-10 rounded overflow-hidden border border-[var(--line)] bg-white">
        <div className="flex h-full">
          {projection.phases.map((p) => {
            const pStart = new Date(p.startsAt).getTime();
            const pEnd = new Date(p.endsAt).getTime();
            const width = totalMs > 0 ? ((pEnd - pStart) / totalMs) * 100 : 25;
            return (
              <div
                key={p.name + p.startsAt}
                style={{ width: `${width}%`, background: phaseColor[p.name] }}
                title={`${phaseLabel[p.name]}: ${fmtDate(p.startsAt)} → ${fmtDate(p.endsAt)}`}
                className="flex items-center justify-center text-xs text-white/90 truncate px-1"
              >
                {phaseLabel[p.name]}
              </div>
            );
          })}
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--ink)]"
          style={{ left: `${nowPct}%` }}
          aria-label="current time marker"
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>{fmtDate(projection.phases[0].startsAt)}</span>
        <span>now: {fmtDate(now.toISOString())} · phase: <strong>{phaseLabel[projection.currentPhase]}</strong></span>
        <span>{fmtDate(projection.phases[projection.phases.length - 1].endsAt)}</span>
      </div>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}
