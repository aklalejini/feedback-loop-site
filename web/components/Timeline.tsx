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

function fmtDate(iso: string | number): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

// Horizontal anchoring so edge labels/markers don't overflow the bar.
function anchor(pct: number): React.CSSProperties {
  if (pct <= 6) return { left: "0%", transform: "none", textAlign: "left" };
  if (pct >= 94) return { left: "100%", transform: "translateX(-100%)", textAlign: "right" };
  return { left: `${pct}%`, transform: "translateX(-50%)", textAlign: "center" };
}

// A thin 2px line: at the very edges, hug the edge; otherwise centre on the pct.
function lineLeft(pct: number): React.CSSProperties {
  if (pct <= 0.5) return { left: 0 };
  if (pct >= 99.5) return { right: 0 };
  return { left: `${pct}%`, transform: "translateX(-50%)" };
}

const MIN_INNER_LABEL_PCT = 13; // segments narrower than this drop their inner label
const MIN_TICK_LABEL_GAP = 13;  // de-dup boundary date labels that crowd each other

export function Timeline({ projection, now = new Date(), selectedPhase, onSelectPhase }: Props) {
  const phases = projection.phases;
  const start = new Date(phases[0].startsAt).getTime();
  const end = new Date(phases[phases.length - 1].endsAt).getTime();
  const totalMs = end - start;
  const pct = (ms: number) => (totalMs > 0 ? ((ms - start) / totalMs) * 100 : 0);

  const nowMs = Math.max(start, Math.min(end, now.getTime()));
  const nowPct = pct(nowMs);
  const interactive = typeof onSelectPhase === "function";

  // Boundaries: the timeline start plus every phase end. De-dup labels that crowd.
  const boundaries = [start, ...phases.map((p) => new Date(p.endsAt).getTime())];
  let lastLabelPct = -100;
  const showLabel = boundaries.map((b, i) => {
    const bp = pct(b);
    const isLast = i === boundaries.length - 1;
    if (i === 0 || isLast || bp - lastLabelPct >= MIN_TICK_LABEL_GAP) {
      lastLabelPct = bp;
      return true;
    }
    return false;
  });

  return (
    <div className="grid gap-1.5">
      {/* marker lane + bar share a relative box so the Today marker is one piece
          that visibly drops onto the bar */}
      <div className="relative">
        <div className="h-5" aria-hidden />

        {/* the bar */}
        <div className="relative h-9 rounded-md overflow-hidden border border-[var(--line)] bg-[var(--card)] shadow-[inset_0_1px_2px_rgba(58,40,16,0.12)]">
          <div className="flex h-full">
            {phases.map((p, i) => {
              const width = pct(new Date(p.endsAt).getTime()) - pct(new Date(p.startsAt).getTime());
              const isSelected = selectedPhase === p.name;
              const isCurrent = projection.currentPhase === p.name;
              const dim = selectedPhase != null && !isSelected;
              const fg = textOn(phaseColor[p.name]);
              const segStyle: React.CSSProperties = {
                width: `${width}%`,
                background: phaseColor[p.name],
                color: fg,
                opacity: dim ? 0.45 : 1,
                // crisp divider between adjacent segments so proportions read clearly
                borderRight: i < phases.length - 1 ? "1px solid rgba(58,40,16,0.28)" : undefined,
                filter: isSelected ? "brightness(1.15) saturate(1.1)" : undefined,
                boxShadow: isSelected ? "inset 0 0 0 2.5px var(--accent-deep)" : undefined,
              };
              const segTitle = `${phaseLabel[p.name]}: ${fmtDate(p.startsAt)} → ${fmtDate(p.endsAt)}${interactive ? "\nClick to preview the vessel at this phase." : ""}`;
              const inner = width >= MIN_INNER_LABEL_PCT ? (
                <span className="flex items-center gap-1 truncate px-1 text-xs font-medium">
                  {phaseLabel[p.name]}
                  {isCurrent ? <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: fg }} /> : null}
                </span>
              ) : null;
              const common = "flex items-center justify-center h-full min-w-0 transition-[filter,opacity]";
              if (interactive) {
                return (
                  <button key={p.name + p.startsAt} type="button" style={segStyle} title={segTitle}
                    aria-pressed={isSelected} onClick={() => onSelectPhase?.(isSelected ? null : p.name)}
                    className={`${common} hover:brightness-110`}>
                    {inner}
                  </button>
                );
              }
              return (
                <div key={p.name + p.startsAt} style={segStyle} title={segTitle} className={common}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today marker: a pill in the lane + a 2px line dropping through the bar,
            one connected element at the current position (hard-left on day 0). */}
        <div className="pointer-events-none absolute top-0 whitespace-nowrap" style={anchor(nowPct)}>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ink)] px-2 py-0.5 text-[10px] font-bold leading-none text-[var(--card)] shadow">
            Today
          </span>
        </div>
        <div className="pointer-events-none absolute w-0.5 bg-[var(--ink)]" style={{ top: "16px", bottom: 0, ...lineLeft(nowPct) }} aria-hidden />
        <div className="pointer-events-none absolute h-1.5 w-1.5 rotate-45 bg-[var(--ink)]" style={{ top: "15px", ...lineLeft(nowPct) }} aria-hidden />
      </div>

      {/* boundary ticks + dates */}
      <div className="relative h-7">
        {boundaries.map((b, i) => {
          const bp = pct(b);
          return (
            <div key={i}>
              <div className="absolute top-0 h-1.5 w-px -translate-x-1/2 bg-[var(--line)]" style={{ left: `${bp}%` }} aria-hidden />
              {showLabel[i] ? (
                <span className="absolute top-2 text-[10px] leading-tight text-[var(--muted)] whitespace-nowrap" style={anchor(bp)}>
                  {fmtDate(b)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* legend — names every phase incl. the narrow Lag sliver */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--ink-soft)]">
        {phases.map((p) => (
          <span key={p.name} className="inline-flex items-center gap-1">
            <span aria-hidden className="h-2 w-2 rounded-sm border border-[rgba(58,40,16,0.25)]" style={{ background: phaseColor[p.name] }} />
            {phaseLabel[p.name]}
          </span>
        ))}
      </div>

      {/* caption: now + (optional) preview */}
      <p className="text-xs text-[var(--ink-soft)]">
        Now: <strong>{phaseLabel[projection.currentPhase]}</strong>
        {selectedPhase ? (
          <> · Previewing <strong>{phaseLabel[selectedPhase]}</strong></>
        ) : null}
      </p>
    </div>
  );
}
