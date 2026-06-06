"use client";
import { HONEYS, VESSELS, type Mead, type PhaseName, type VesselInfo } from "@/lib/mead";

interface Props {
  mead: Mead;
  phase: PhaseName;
  size?: number;
  className?: string;
}

interface PhaseViz {
  bubbleCount: number;
  bubbleSpeed: number; // seconds per loop
  airlockActive: boolean;
  cloudiness: number;  // 0..1
}

const PHASE_VIZ: Record<PhaseName, PhaseViz> = {
  lag:          { bubbleCount: 2,  bubbleSpeed: 5,   airlockActive: false, cloudiness: 0.5 },
  primary:      { bubbleCount: 14, bubbleSpeed: 2.2, airlockActive: true,  cloudiness: 0.7 },
  secondary:    { bubbleCount: 4,  bubbleSpeed: 4,   airlockActive: true,  cloudiness: 0.3 },
  conditioning: { bubbleCount: 1,  bubbleSpeed: 8,   airlockActive: false, cloudiness: 0.08 },
  done:         { bubbleCount: 0,  bubbleSpeed: 0,   airlockActive: false, cloudiness: 0 },
};

export function VesselSVG({ mead, phase, size = 240, className }: Props) {
  const v = VESSELS[mead.vessel];
  const honey = HONEYS[mead.honeyType];
  const viz = PHASE_VIZ[phase];

  const totalL = Math.max(0, mead.waterL) + Math.max(0, mead.honeyKg) * 0.7;
  const isEmpty = totalL <= 0.01;
  const fillFraction = isEmpty ? 0 : Math.max(0.1, Math.min(0.92, totalL / v.capacityL));

  const W = 240;
  const H = 360;
  const shape = getShape(v.shape, W, H);
  const bodyBottom = shape.bodyBottom;
  const bodyTop = shape.bodyTop;
  const liquidTop = bodyBottom - (bodyBottom - bodyTop) * fillFraction;

  const idBase = `vsl-${mead.id}-${phase}`;
  const aspect = H / W;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size}
      height={size * aspect}
      className={className}
      role="img"
      aria-label={
        isEmpty
          ? `Empty ${v.label}, ready to fill`
          : `${v.label} containing ${honey.label} mead in ${phase} phase`
      }
    >
      <defs>
        <clipPath id={`${idBase}-clip`}>
          <path d={shape.interior} />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx={W / 2} cy={bodyBottom + 14} rx={shape.shadowRx} ry={5} fill="#000" opacity={0.18} />

      {/* glass back tint */}
      <path d={shape.outline} fill="#e7efea" fillOpacity={0.55} />

      {/* liquid (clipped to interior) */}
      {!isEmpty ? (
        <g clipPath={`url(#${idBase}-clip)`}>
          <rect x={0} y={liquidTop} width={W} height={H} fill={honey.color} />
          {viz.cloudiness > 0 ? (
            <rect x={0} y={liquidTop} width={W} height={H} fill="#ffffff" opacity={viz.cloudiness * 0.35} />
          ) : null}
          {/* surface ellipse */}
          <ellipse
            cx={W / 2}
            cy={liquidTop}
            rx={shape.surfaceRx}
            ry={2.5}
            fill="#000"
            opacity={0.14}
          />
          {/* rising bubbles */}
          {Array.from({ length: viz.bubbleCount }).map((_, i) => {
            const slot = (i * 41) % Math.max(1, shape.bubbleSpread);
            const x = shape.bubbleLeft + slot;
            const r = 1.4 + ((i * 7) % 4) * 0.5;
            const delay = (i * 0.27) % viz.bubbleSpeed;
            const travelPx = bodyBottom - liquidTop - 8;
            return (
              <circle
                key={i}
                className="bubble-rise"
                cx={x}
                cy={bodyBottom - 8}
                r={r}
                fill="#ffffff"
                opacity={0.85}
                style={{
                  animation: `bubble-rise ${viz.bubbleSpeed}s ${delay}s infinite ease-in`,
                  // CSS custom property consumed by the keyframe
                  ["--rise" as never]: `${travelPx}px`,
                }}
              />
            );
          })}
        </g>
      ) : null}

      {/* glass outline (over liquid so the rim reads clean) */}
      <path
        d={shape.outline}
        fill="none"
        stroke="#2a241c"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />

      {/* glass highlight strip — front-left, semi-translucent */}
      <path d={shape.highlight} fill="#ffffff" opacity={0.5} />

      {/* handle (jug shape only) */}
      {shape.handle ? (
        <path
          d={shape.handle}
          fill="none"
          stroke="#2a241c"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      ) : null}

      {/* cork (or lid for bucket) */}
      {shape.lid === "cork" ? (
        <g>
          <rect
            x={W / 2 - 16}
            y={shape.lidY - 22}
            width={32}
            height={22}
            rx={2}
            fill="#8a6541"
            stroke="#2a241c"
            strokeWidth={2}
          />
          <rect x={W / 2 - 12} y={shape.lidY - 17} width={24} height={2} fill="#6a4a2f" opacity={0.5} />
        </g>
      ) : (
        <g>
          <rect
            x={W / 2 - 60}
            y={shape.lidY - 14}
            width={120}
            height={14}
            rx={3}
            fill="#cdc8b8"
            stroke="#2a241c"
            strokeWidth={2}
          />
          <line x1={W / 2 - 60} y1={shape.lidY - 7} x2={W / 2 + 60} y2={shape.lidY - 7} stroke="#2a241c" strokeWidth={1} opacity={0.4} />
        </g>
      )}

      {/* airlock */}
      <Airlock x={W / 2} yBase={shape.lidY - 22} active={viz.airlockActive && !isEmpty} />
    </svg>
  );
}

function Airlock({ x, yBase, active }: { x: number; yBase: number; active: boolean }) {
  // S-shaped glass tube above the cork. Two small water reservoirs visible.
  // Coordinates are relative to (x, yBase), going UP (smaller y).
  const tubeD = `
    M ${x} ${yBase}
    L ${x} ${yBase - 12}
    Q ${x} ${yBase - 20} ${x - 8} ${yBase - 20}
    Q ${x - 16} ${yBase - 20} ${x - 16} ${yBase - 30}
    L ${x - 16} ${yBase - 42}
    Q ${x - 16} ${yBase - 52} ${x - 8} ${yBase - 52}
    Q ${x} ${yBase - 52} ${x} ${yBase - 62}
    L ${x} ${yBase - 72}
  `;
  return (
    <g>
      <path d={tubeD} stroke="#2a241c" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* water-filled reservoir (lower bend) */}
      <ellipse cx={x - 16} cy={yBase - 36} rx={3} ry={6.5} fill="#bcd8d2" stroke="#2a241c" strokeWidth={0.6} opacity={0.95} />
      {/* small dome of glass at the top */}
      <circle cx={x} cy={yBase - 74} r={3.5} fill="#e7efea" stroke="#2a241c" strokeWidth={1} />
      {/* trickling bubble inside the lower reservoir during active fermentation */}
      {active ? (
        <circle
          className="airlock-bubble"
          cx={x - 16}
          cy={yBase - 33}
          r={1.4}
          fill="#ffffff"
          opacity={0.95}
          style={{ animation: "airlock-bubble 2.6s infinite ease-in-out" }}
        />
      ) : null}
    </g>
  );
}

interface Shape {
  outline: string;     // full silhouette (stroke)
  interior: string;    // clip path for liquid
  highlight: string;   // glass sheen
  handle: string | null;
  lid: "cork" | "lid";
  lidY: number;        // top of the vessel body, where cork/lid sits
  bodyTop: number;
  bodyBottom: number;
  shadowRx: number;
  surfaceRx: number;
  bubbleLeft: number;
  bubbleSpread: number;
}

function getShape(kind: VesselInfo["shape"], W: number, H: number): Shape {
  const cx = W / 2;
  switch (kind) {
    case "jug": {
      // wide-bellied jug with a side handle, short neck. Reference: classic 1-gal mead jug.
      const bodyTop = 130, bodyBottom = 330;
      return {
        outline: `M ${cx - 22},80 L ${cx - 22},108 Q ${cx - 22},120 ${cx - 38},126 L ${cx - 60},134 Q ${cx - 92},148 ${cx - 92},190 L ${cx - 92},296 Q ${cx - 92},326 ${cx - 64},332 L ${cx + 64},332 Q ${cx + 92},326 ${cx + 92},296 L ${cx + 92},190 Q ${cx + 92},148 ${cx + 60},134 L ${cx + 38},126 Q ${cx + 22},120 ${cx + 22},108 L ${cx + 22},80 Z`,
        interior: `M ${cx - 88},${bodyTop} L ${cx + 88},${bodyTop} L ${cx + 88},${bodyBottom - 4} Q ${cx + 88},${bodyBottom} ${cx + 60},${bodyBottom} L ${cx - 60},${bodyBottom} Q ${cx - 88},${bodyBottom} ${cx - 88},${bodyBottom - 4} Z`,
        highlight: `M ${cx - 76},170 Q ${cx - 82},220 ${cx - 76},290 L ${cx - 68},290 Q ${cx - 74},220 ${cx - 68},170 Z`,
        handle: `M ${cx + 92},200 Q ${cx + 122},204 ${cx + 122},234 Q ${cx + 122},262 ${cx + 92},266`,
        lid: "cork",
        lidY: 80,
        bodyTop,
        bodyBottom,
        shadowRx: 96,
        surfaceRx: 80,
        bubbleLeft: cx - 70,
        bubbleSpread: 140,
      };
    }
    case "carboy": {
      // taller, narrower body, longer neck. No handle.
      const bodyTop = 140, bodyBottom = 330;
      return {
        outline: `M ${cx - 16},70 L ${cx - 16},120 Q ${cx - 16},132 ${cx - 30},138 L ${cx - 50},144 Q ${cx - 84},162 ${cx - 84},204 L ${cx - 84},296 Q ${cx - 84},326 ${cx - 56},332 L ${cx + 56},332 Q ${cx + 84},326 ${cx + 84},296 L ${cx + 84},204 Q ${cx + 84},162 ${cx + 50},144 L ${cx + 30},138 Q ${cx + 16},132 ${cx + 16},120 L ${cx + 16},70 Z`,
        interior: `M ${cx - 80},${bodyTop} L ${cx + 80},${bodyTop} L ${cx + 80},${bodyBottom - 4} Q ${cx + 80},${bodyBottom} ${cx + 52},${bodyBottom} L ${cx - 52},${bodyBottom} Q ${cx - 80},${bodyBottom} ${cx - 80},${bodyBottom - 4} Z`,
        highlight: `M ${cx - 68},180 Q ${cx - 74},230 ${cx - 68},290 L ${cx - 60},290 Q ${cx - 66},230 ${cx - 60},180 Z`,
        handle: null,
        lid: "cork",
        lidY: 70,
        bodyTop,
        bodyBottom,
        shadowRx: 88,
        surfaceRx: 72,
        bubbleLeft: cx - 60,
        bubbleSpread: 120,
      };
    }
    case "demijohn": {
      // squat, wide demijohn with short neck. Modest waist.
      const bodyTop = 130, bodyBottom = 330;
      return {
        outline: `M ${cx - 18},80 L ${cx - 18},110 Q ${cx - 18},122 ${cx - 34},128 L ${cx - 60},136 Q ${cx - 100},156 ${cx - 100},198 L ${cx - 100},292 Q ${cx - 100},326 ${cx - 68},332 L ${cx + 68},332 Q ${cx + 100},326 ${cx + 100},292 L ${cx + 100},198 Q ${cx + 100},156 ${cx + 60},136 L ${cx + 34},128 Q ${cx + 18},122 ${cx + 18},110 L ${cx + 18},80 Z`,
        interior: `M ${cx - 96},${bodyTop} L ${cx + 96},${bodyTop} L ${cx + 96},${bodyBottom - 4} Q ${cx + 96},${bodyBottom} ${cx + 64},${bodyBottom} L ${cx - 64},${bodyBottom} Q ${cx - 96},${bodyBottom} ${cx - 96},${bodyBottom - 4} Z`,
        highlight: `M ${cx - 84},170 Q ${cx - 90},230 ${cx - 84},290 L ${cx - 76},290 Q ${cx - 82},230 ${cx - 76},170 Z`,
        handle: null,
        lid: "cork",
        lidY: 80,
        bodyTop,
        bodyBottom,
        shadowRx: 104,
        surfaceRx: 88,
        bubbleLeft: cx - 78,
        bubbleSpread: 156,
      };
    }
    case "bucket": {
      // straight-walled fermenting bucket with a flat lid (not a cork). Wider than tall.
      const bodyTop = 96, bodyBottom = 330;
      return {
        outline: `M ${cx - 90},96 L ${cx + 90},96 L ${cx + 84},330 L ${cx - 84},330 Z`,
        interior: `M ${cx - 86},${bodyTop + 2} L ${cx + 86},${bodyTop + 2} L ${cx + 82},${bodyBottom - 2} L ${cx - 82},${bodyBottom - 2} Z`,
        highlight: `M ${cx - 72},120 L ${cx - 78},310 L ${cx - 68},310 L ${cx - 62},120 Z`,
        handle: null,
        lid: "lid",
        lidY: 96,
        bodyTop,
        bodyBottom,
        shadowRx: 100,
        surfaceRx: 80,
        bubbleLeft: cx - 70,
        bubbleSpread: 140,
      };
    }
  }
}
