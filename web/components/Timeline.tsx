"use client";
import type { PhaseName, Projection } from "@/lib/mead";

interface Props {
  projection: Projection;
  now?: Date;
  selectedPhase?: PhaseName | null;
  onSelectPhase?: (phase: PhaseName | null) => void;
}

const phaseLabel: Record<string, string> = {
  lag: "Lag",
  primary: "Primary",
  secondary: "Secondary",
  conditioning: "Conditioning",
  done: "Ready",
};

// Honey → aged-oak ramp, harmonised with the apothecary palette.
const phaseColor: Record<string, string> = {
  lag: "#e2cfa3",
  primary: "#c88a2c",
  secondary: "#a4641d",
  conditioning: "#6f4520",
  done: "#3f2d18",
};

// Pick readable text (ink vs cream) per segment by background luminance.
function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#3a2a18" : "#fff6e6";
}

export function Timeline({ projection, now = new Date(), selectedPhase, onSelectPhase }: Props) {
  const start = new Date(projection.phases[0].startsAt).getTime();
  const end = new Date(projection.phases[projection.phases.length - 1].endsAt).getTime();
  const totalMs = end - start;
  const nowMs = Math.max(start, Math.min(end, now.getTime()));
  const nowPct = totalMs > 0 ? ((nowMs - start) / totalMs) * 100 : 0;
  const interactive = typeof onSelectPhase === "function";

  return (
    <div className="grid gap-3">
      <div className="relative h-10 rounded-md overflow-hidden border border-[var(--line)] bg-[var(--card)] shadow-[inset_0_1px_2px_rgba(58,40,16,0.12)]">
        <div className="flex h-full">
          {projection.phases.map((p) => {
            const pStart = new Date(p.startsAt).getTime();
            const pEnd = new Date(p.endsAt).getTime();
            const width = totalMs > 0 ? ((pEnd - pStart) / totalMs) * 100 : 25;
            const isSelected = selectedPhase === p.name;
            const isCurrent = projection.currentPhase === p.name;
            const fg = textOn(phaseColor[p.name]);
            const segStyle = {
              width: `${width}%`,
              background: phaseColor[p.name],
              color: fg,
              filter: isSelected ? "brightness(1.12) saturate(1.08)" : undefined,
              boxShadow: isSelected ? "inset 0 0 0 2px var(--ink)" : undefined,
            };
            const segTitle = `${phaseLabel[p.name]}: ${fmtDate(p.startsAt)} → ${fmtDate(p.endsAt)}${interactive ? "\nClick to preview the vessel at this phase." : ""}`;
            const segChildren = (
              <>
                <span className="truncate font-medium">{phaseLabel[p.name]}</span>
                {isCurrent ? (
                  <span aria-hidden className="mt-0.5 block h-1 w-1 rounded-full" style={{ background: fg }} />
                ) : null}
              </>
            );
            if (interactive) {
              return (
                <button
                  key={p.name + p.startsAt}
                  type="button"
                  style={segStyle}
                  title={segTitle}
                  aria-pressed={isSelected}
                  onClick={() => onSelectPhase?.(isSelected ? null : p.name)}
                  className="flex flex-col items-center justify-center text-xs px-1 transition-[filter] hover:brightness-110"
                >
                  {segChildren}
                </button>
              );
            }
            return (
              <div
                key={p.name + p.startsAt}
                style={segStyle}
                title={segTitle}
                className="flex flex-col items-center justify-center text-xs px-1"
              >
                {segChildren}
              </div>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-[var(--ink)]"
          style={{ left: `${nowPct}%` }}
          aria-label="current time marker"
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>{fmtDate(projection.phases[0].startsAt)}</span>
        <span>
          now: {fmtDate(now.toISOString())} · phase: <strong>{phaseLabel[projection.currentPhase]}</strong>
          {selectedPhase ? (
            <> · previewing: <strong>{phaseLabel[selectedPhase]}</strong></>
          ) : null}
        </span>
        <span>{fmtDate(projection.phases[projection.phases.length - 1].endsAt)}</span>
      </div>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}
