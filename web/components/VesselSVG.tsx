"use client";
import { HONEYS, VESSELS, type Mead, type PhaseName } from "@/lib/mead";

interface Props {
  mead: Mead;
  phase: PhaseName;
}

// Maps phase -> visual params (clarity, bubble activity).
function visualForPhase(phase: PhaseName) {
  switch (phase) {
    case "lag":          return { cloudiness: 0.4, bubbles: 0, colorShift: 0.0 };
    case "primary":      return { cloudiness: 0.6, bubbles: 8, colorShift: -0.05 };
    case "secondary":    return { cloudiness: 0.3, bubbles: 2, colorShift: 0.0 };
    case "conditioning": return { cloudiness: 0.1, bubbles: 0, colorShift: 0.05 };
    case "done":         return { cloudiness: 0.0, bubbles: 0, colorShift: 0.1 };
  }
}

export function VesselSVG({ mead, phase }: Props) {
  const v = VESSELS[mead.vessel];
  const honey = HONEYS[mead.honeyType];
  const viz = visualForPhase(phase);

  // total volume → fill height (clamped 0.15..0.95)
  const totalL = mead.waterL + mead.honeyKg * 0.7;
  const fillFraction = Math.max(0.15, Math.min(0.95, totalL / v.capacityL));

  const W = 200, H = 280;
  const liquidY = H * (1 - fillFraction * 0.75) - 10;

  // simple silhouettes per vessel shape
  const shapes: Record<typeof v.shape, string> = {
    jug:      `M 60,40 Q 60,15 100,15 Q 140,15 140,40 L 140,80 Q 175,90 175,150 L 175,250 Q 175,270 155,270 L 45,270 Q 25,270 25,250 L 25,150 Q 25,90 60,80 Z`,
    carboy:   `M 80,15 L 120,15 L 120,55 Q 175,80 175,160 L 175,250 Q 175,270 155,270 L 45,270 Q 25,270 25,250 L 25,160 Q 25,80 80,55 Z`,
    bucket:   `M 30,40 L 170,40 L 175,260 Q 175,270 165,270 L 35,270 Q 25,270 25,260 Z`,
    demijohn: `M 80,15 L 120,15 L 120,50 Q 185,75 185,170 L 185,255 Q 185,270 165,270 L 35,270 Q 15,270 15,255 L 15,170 Q 15,75 80,50 Z`,
  };

  // tweak honey color by phase clarity / colorShift
  const baseColor = honey.color;
  const liquidColor = shiftHex(baseColor, viz.colorShift);

  return (
    <div className="relative w-fit mx-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${v.label} containing ${honey.label} mead in ${phase} phase`}>
        <defs>
          <clipPath id={`clip-${mead.id}`}>
            <path d={shapes[v.shape]} />
          </clipPath>
        </defs>
        {/* vessel outline */}
        <path d={shapes[v.shape]} fill="rgba(255,255,255,0.5)" stroke="#1f1a12" strokeWidth={2} />
        {/* liquid (clipped to vessel) */}
        <g clipPath={`url(#clip-${mead.id})`}>
          <rect
            x={0}
            y={liquidY}
            width={W}
            height={H}
            fill={liquidColor}
            opacity={0.92 - viz.cloudiness * 0.25}
          />
          {/* cloudiness as a layered noise overlay */}
          {viz.cloudiness > 0 ? (
            <rect
              x={0}
              y={liquidY}
              width={W}
              height={H}
              fill="rgba(255,255,255,0.7)"
              opacity={viz.cloudiness}
            />
          ) : null}
          {/* surface line */}
          <line x1={0} y1={liquidY} x2={W} y2={liquidY} stroke="#1f1a12" strokeOpacity={0.15} strokeWidth={1.5} />
        </g>
        {/* bubbles (CSS animated, respects prefers-reduced-motion) */}
        {Array.from({ length: viz.bubbles }).map((_, i) => {
          const x = 50 + ((i * 37) % 110);
          const delay = (i * 0.7) % 4;
          const r = 2 + (i % 3);
          return (
            <circle
              key={i}
              className="bubble"
              cx={x}
              cy={H - 30}
              r={r}
              fill="rgba(255,255,255,0.85)"
              style={{
                animation: `bubble 3.5s ${delay}s infinite ease-in`,
                transformOrigin: `${x}px ${H - 30}px`,
              }}
            />
          );
        })}
      </svg>
      <p className="text-xs text-center text-[var(--muted)] mt-1">{v.label} · {honey.label}</p>
    </div>
  );
}

function shiftHex(hex: string, amount: number): string {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + Math.round(amount * 60)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round(amount * 60)));
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round(amount * 60)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
