import Link from "next/link";

// A decorative "hero band" at the top of the page: a painterly Norse-feeling
// landscape (dawn sky over mountains + fjord, rendered inline as SVG) framed
// with knotwork corners, with the brand wordmark + drinking-horn glyph sitting
// over it. Designed to be the LOUD visual element of the page so the content
// area below can stay calm and readable. The art is decorative — `aria-hidden`,
// no semantics — and the wordmark / nav stay accessible above it.
export function HeroBand({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <div className="hero-band relative isolate">
      <div aria-hidden className="hero-art absolute inset-0 -z-10 overflow-hidden">
        <NorseLandscape />
        <div className="hero-vignette" />
      </div>
      <KnotCorner pos="tl" />
      <KnotCorner pos="tr" />
      <KnotCorner pos="bl" />
      <KnotCorner pos="br" />
      <div className="relative flex items-start justify-between gap-4 px-5 sm:px-8 pt-6 sm:pt-7 pb-24 sm:pb-28">
        <Link href="/" className="inline-flex items-center gap-3.5 no-underline">
          <DrinkingHorn />
          <span className="hero-wordmark">MEAD PLANNER</span>
        </Link>
        {rightSlot ? (
          <div className="hero-nav flex items-center gap-3 px-3 py-1.5 rounded-md">{rightSlot}</div>
        ) : null}
      </div>
    </div>
  );
}

function NorseLandscape() {
  return (
    <svg viewBox="0 0 1600 360" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3a55" />
          <stop offset="0.35" stopColor="#5e5275" />
          <stop offset="0.6" stopColor="#c9824a" />
          <stop offset="0.82" stopColor="#f0c684" />
          <stop offset="1" stopColor="#f6ddae" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe8a8" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#f4b365" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4b365" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a6a55" />
          <stop offset="0.5" stopColor="#5a4d3c" />
          <stop offset="1" stopColor="#3d3324" />
        </linearGradient>
        <linearGradient id="m-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b6480" />
          <stop offset="1" stopColor="#3f475e" />
        </linearGradient>
        <linearGradient id="m-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a4e" />
          <stop offset="1" stopColor="#22202c" />
        </linearGradient>
        <linearGradient id="m-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1a22" />
          <stop offset="1" stopColor="#0d0c10" />
        </linearGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.08 0" />
        </filter>
      </defs>

      <rect width="1600" height="360" fill="url(#sky)" />

      {/* sun + glow halo */}
      <ellipse cx="1240" cy="232" rx="320" ry="120" fill="url(#sunGlow)" />
      <circle cx="1240" cy="232" r="42" fill="#fff1c4" opacity="0.95" />

      {/* drifting cloud bands */}
      <g opacity="0.45" fill="#f6e4c0">
        <ellipse cx="280" cy="80" rx="180" ry="14" />
        <ellipse cx="620" cy="60" rx="240" ry="11" />
        <ellipse cx="1000" cy="100" rx="200" ry="13" />
        <ellipse cx="1400" cy="70" rx="180" ry="10" />
      </g>

      {/* distant mountain range (palest) */}
      <path
        d="M0,240 L60,210 L120,225 L190,180 L260,205 L340,165 L420,200 L500,175 L590,210 L680,170 L770,205 L870,180 L960,220 L1060,185 L1170,215 L1280,195 L1390,225 L1490,200 L1600,225 L1600,360 L0,360 Z"
        fill="url(#m-far)"
        opacity="0.85"
      />
      {/* mid mountain range */}
      <path
        d="M0,275 L80,230 L170,265 L260,215 L360,260 L470,225 L580,265 L700,220 L820,260 L940,235 L1080,275 L1200,240 L1330,270 L1450,245 L1600,275 L1600,360 L0,360 Z"
        fill="url(#m-mid)"
        opacity="0.95"
      />
      {/* near treeline + cliffs */}
      <path
        d="M0,310 L90,285 L180,305 L260,280 L340,300 L420,275 L520,305 L620,285 L740,310 L860,290 L1000,315 L1140,295 L1280,315 L1420,300 L1600,318 L1600,360 L0,360 Z"
        fill="url(#m-near)"
      />

      {/* lake */}
      <rect y="318" width="1600" height="42" fill="url(#lake)" />
      {/* sun reflection on lake */}
      <ellipse cx="1240" cy="332" rx="130" ry="6" fill="#f1c886" opacity="0.55" />
      <ellipse cx="1240" cy="345" rx="80" ry="3" fill="#f6dba6" opacity="0.4" />

      {/* foreground pine silhouettes (left + right) */}
      <g fill="#0a0a0e">
        <Tree x={40} baseY={335} h={70} />
        <Tree x={80} baseY={338} h={55} />
        <Tree x={1520} baseY={334} h={72} />
        <Tree x={1560} baseY={337} h={58} />
      </g>

      {/* subtle painterly grain overlay */}
      <rect width="1600" height="360" filter="url(#grain)" opacity="0.7" />
    </svg>
  );
}

function Tree({ x, baseY, h }: { x: number; baseY: number; h: number }) {
  const w = h * 0.42;
  const path = `M${x},${baseY} L${x - w / 2},${baseY - h * 0.25} L${x - w / 3},${baseY - h * 0.25} L${x - w / 2 - 4},${baseY - h * 0.55} L${x - w / 4},${baseY - h * 0.55} L${x - w / 2 - 6},${baseY - h * 0.85} L${x},${baseY - h} L${x + w / 2 + 6},${baseY - h * 0.85} L${x + w / 4},${baseY - h * 0.55} L${x + w / 2 + 4},${baseY - h * 0.55} L${x + w / 3},${baseY - h * 0.25} L${x + w / 2},${baseY - h * 0.25} Z`;
  return <path d={path} />;
}

function KnotCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const flip =
    pos === "tr" ? "scaleX(-1)" : pos === "bl" ? "scaleY(-1)" : pos === "br" ? "scale(-1,-1)" : undefined;
  const cls =
    pos === "tl"
      ? "top-2 left-2"
      : pos === "tr"
      ? "top-2 right-2"
      : pos === "bl"
      ? "bottom-2 left-2"
      : "bottom-2 right-2";
  return (
    <svg
      aria-hidden
      width="52"
      height="52"
      viewBox="0 0 38 38"
      className={`absolute ${cls} text-[var(--accent-glow)]`}
      style={{
        transform: flip,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))",
        opacity: 0.92,
      }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2 L22 2 M2 2 L2 22" />
        <path d="M6 6 L16 6 L16 16 L6 16 Z" />
        <circle cx="11" cy="11" r="2.6" />
        <path d="M22 2 C 27 4, 27 9, 22 12" />
        <path d="M2 22 C 4 27, 9 27, 12 22" />
        <path d="M18 18 L24 18 L24 24" />
      </g>
    </svg>
  );
}

function DrinkingHorn() {
  // A simple curved drinking horn: wide rim on the left, tapering down-right to
  // a tip, with a metallic band near the rim and a tone-shift along the body.
  return (
    <svg
      aria-hidden
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className="shrink-0 drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)]"
    >
      <defs>
        <linearGradient id="hornBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dba6" />
          <stop offset="0.45" stopColor="#c98c3c" />
          <stop offset="1" stopColor="#3d2208" />
        </linearGradient>
        <linearGradient id="hornBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8d28a" />
          <stop offset="0.5" stopColor="#a07a30" />
          <stop offset="1" stopColor="#6b4a12" />
        </linearGradient>
      </defs>
      {/* horn body — gentle crescent curling down to the right */}
      <path
        d="M6 10
           C 4 10, 4 18, 10 19
           C 18 21, 28 25, 38 36
           C 42 40, 46 40, 44 36
           C 38 24, 26 14, 14 11
           C 11 10.5, 9 10, 6 10 Z"
        fill="url(#hornBody)"
        stroke="#2a1808"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* rim ellipse (opening) */}
      <ellipse cx="7.5" cy="14.5" rx="4.5" ry="5.5" fill="#1d1106" stroke="#2a1808" strokeWidth="1" />
      <ellipse cx="7.5" cy="14.5" rx="2.6" ry="3.2" fill="#5a3a18" opacity="0.85" />
      {/* metallic band just below the rim */}
      <path d="M11 9.5 C 14 8.5, 16 10.5, 16 14 C 16 17, 14 19, 11 19 Z" fill="url(#hornBand)" stroke="#3a2a14" strokeWidth="0.9" />
      {/* sheen on the upper curve */}
      <path d="M14 12 C 22 13, 30 18, 36 26" stroke="#fff3cf" strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round" />
      {/* tip droplet */}
      <circle cx="44" cy="37.5" r="1.3" fill="#2a1808" />
    </svg>
  );
}
