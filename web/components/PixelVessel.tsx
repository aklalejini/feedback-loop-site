"use client";
import { useEffect, useRef } from "react";
import {
  HONEYS,
  VESSELS,
  type HoneyType,
  type PhaseName,
  type VesselKind,
} from "@/lib/mead";

interface Props {
  vessel: VesselKind;
  honeyType: HoneyType;
  liters: number;       // total liquid volume in the vessel
  phase: PhaseName;
  size?: number;        // rendered width in CSS px
  animated?: boolean;   // false for thumbnails (draw a single static frame)
  className?: string;
}

// Logical pixel canvas. Everything is drawn on this grid then upscaled
// nearest-neighbour, which is what gives the chunky pixel-art look.
const PW = 64;
const PH = 104;
const CX = 32;

// Palette
const OUTLINE = "#34243f";
const GLASS = "#e6efe9";
const GLASS_SHADE = "#c9d8d1";
const SHINE = "#ffffff";
const CORK = "#b07b43";
const CORK_DK = "#7c5128";
const LID = "#cdc6b6";
const LID_DK = "#9c947f";
const AIR_WATER = "#86c9da";
const SHADOW = "rgba(40,28,50,0.18)";

type ShapeKind = "jug" | "carboy" | "bucket" | "demijohn";

interface ShapeParams {
  shape: ShapeKind;
  neckTop: number;
  neckHW: number;
  shoulderTop: number;
  bodyTop: number;
  bodyBottom: number;
  maxHW: number;
  baseRound: number;
  lid: "cork" | "lid";
  handle?: boolean;
  taperBottomHW?: number;
}

const PARAMS: Record<ShapeKind, ShapeParams> = {
  carboy:   { shape: "carboy",   neckTop: 26, neckHW: 4, shoulderTop: 36, bodyTop: 48, bodyBottom: 98, maxHW: 20, baseRound: 7, lid: "cork" },
  jug:      { shape: "jug",      neckTop: 26, neckHW: 5, shoulderTop: 34, bodyTop: 46, bodyBottom: 98, maxHW: 23, baseRound: 7, lid: "cork", handle: true },
  demijohn: { shape: "demijohn", neckTop: 26, neckHW: 6, shoulderTop: 34, bodyTop: 44, bodyBottom: 98, maxHW: 25, baseRound: 7, lid: "cork" },
  bucket:   { shape: "bucket",   neckTop: 24, neckHW: 23, shoulderTop: 24, bodyTop: 30, bodyBottom: 98, maxHW: 23, baseRound: 0, lid: "lid", taperBottomHW: 21 },
};

interface PhaseViz { bubbles: number; speed: number; airlock: boolean; cloud: number }
const PHASE_VIZ: Record<PhaseName, PhaseViz> = {
  lag:          { bubbles: 2,  speed: 4.5, airlock: false, cloud: 0.45 },
  primary:      { bubbles: 11, speed: 1.8, airlock: true,  cloud: 0.6 },
  secondary:    { bubbles: 4,  speed: 3.2, airlock: true,  cloud: 0.25 },
  conditioning: { bubbles: 1,  speed: 6,   airlock: false, cloud: 0.06 },
  done:         { bubbles: 0,  speed: 0,   airlock: false, cloud: 0 },
};

type Cell = [number, number, string];
interface Bubble { x: number; speed: number; offset: number; big: boolean }

interface Built {
  cells: Cell[];
  bubbles: Bubble[];
  surfaceY: number;
  bottomY: number;
  hasLiquid: boolean;
  airlock: { active: boolean; x: number; yLo: number; yHi: number } | null;
  ariaLabel: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function shade(hex: string, amt: number): string {
  const m = hex.replace("#", "");
  const n = parseInt(m, 16);
  const r = clamp(((n >> 16) & 255) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function halfWidth(p: ShapeParams, y: number): number | null {
  if (p.shape === "bucket") {
    if (y < p.bodyTop || y > p.bodyBottom) return null;
    const t = (y - p.bodyTop) / (p.bodyBottom - p.bodyTop);
    return lerp(p.maxHW, p.taperBottomHW ?? p.maxHW, t);
  }
  if (y < p.neckTop || y > p.bodyBottom) return null;
  if (y < p.shoulderTop) return p.neckHW;
  if (y < p.bodyTop) return lerp(p.neckHW, p.maxHW, (y - p.shoulderTop) / (p.bodyTop - p.shoulderTop));
  const baseStart = p.bodyBottom - p.baseRound;
  if (y < baseStart) {
    const m = (y - p.bodyTop) / (baseStart - p.bodyTop);
    return p.maxHW + Math.sin(m * Math.PI) * 1.4; // gentle barrel bulge
  }
  return lerp(p.maxHW, p.maxHW * 0.6, (y - baseStart) / p.baseRound);
}

function build(vessel: VesselKind, honeyType: HoneyType, liters: number, phase: PhaseName, seed: number): Built {
  const p = PARAMS[VESSELS[vessel].shape as ShapeKind];
  const honey = HONEYS[honeyType];
  const capacity = VESSELS[vessel].capacityL;
  const viz = PHASE_VIZ[phase];

  const fill = liters <= 0.01 ? 0 : clamp(liters / capacity, 0.08, 0.95);
  const hasLiquid = fill > 0;
  const surfaceY = Math.round(p.bodyBottom - fill * (p.bodyBottom - p.bodyTop));
  const bottomY = p.bodyBottom - 2;

  const base = honey.color;
  const liquidLight = shade(base, 46);
  const liquidDark = shade(base, -46);
  const surfaceCol = shade(base, 74);

  const cells: Cell[] = [];

  // ground shadow first (drawn under the vessel)
  for (let x = CX - p.maxHW + 2; x <= CX + p.maxHW - 2; x++) {
    cells.push([x, p.bodyBottom + 2, SHADOW]);
    if (x > CX - p.maxHW + 6 && x < CX + p.maxHW - 6) cells.push([x, p.bodyBottom + 3, SHADOW]);
  }

  // body + neck
  for (let y = 0; y < PH; y++) {
    const h = halfWidth(p, y);
    if (h == null) continue;
    const left = Math.round(CX - h);
    const right = Math.round(CX + h);
    for (let x = left; x <= right; x++) {
      if (x === left || x === right) { cells.push([x, y, OUTLINE]); continue; }
      if (hasLiquid && y >= surfaceY) {
        let c = liquidPixelColor(x, y, left, right, surfaceY, liquidLight, base, liquidDark, surfaceCol, viz.cloud);
        cells.push([x, y, c]);
      } else {
        let c: string = GLASS;
        if (x === left + 2 || x === left + 3) c = SHINE;
        else if (x >= right - 2) c = GLASS_SHADE;
        cells.push([x, y, c]);
      }
    }
  }

  // handle (jug only)
  if (p.handle) {
    const hx = CX + p.maxHW + 4;
    const hTop = p.bodyTop + 14;
    const hBot = p.bodyTop + 34;
    for (let y = hTop; y <= hBot; y++) cells.push([hx, y, OUTLINE]);
    for (let x = CX + p.maxHW; x <= hx; x++) { cells.push([x, hTop, OUTLINE]); cells.push([x, hBot, OUTLINE]); }
  }

  // cork or lid
  if (p.lid === "cork") {
    const cw = p.neckHW + 1;
    const cBot = p.neckTop + 1;
    const cTop = cBot - 6;
    for (let y = cTop; y <= cBot; y++) {
      for (let x = CX - cw; x <= CX + cw; x++) {
        const edge = y === cTop || x === CX - cw || x === CX + cw;
        cells.push([x, y, edge ? CORK_DK : CORK]);
      }
    }
  } else {
    const cw = p.maxHW + 1;
    const lBot = p.bodyTop;
    const lTop = lBot - 5;
    for (let y = lTop; y <= lBot; y++) {
      for (let x = CX - cw; x <= CX + cw; x++) {
        const edge = y === lTop || x === CX - cw || x === CX + cw;
        cells.push([x, y, edge ? LID_DK : LID]);
      }
    }
  }

  // airlock (cork vessels only): stem + bubbler bulb on top of the cork
  let airlock: Built["airlock"] = null;
  if (p.lid === "cork") {
    const corkTop = p.neckTop + 1 - 6;
    // stem
    for (let y = corkTop - 3; y <= corkTop - 1; y++) {
      cells.push([CX - 1, y, OUTLINE]);
      cells.push([CX, y, GLASS]);
      cells.push([CX + 1, y, OUTLINE]);
    }
    // bulb (rounded glass chamber)
    const bTop = corkTop - 11;
    const bBot = corkTop - 4;
    for (let y = bTop; y <= bBot; y++) {
      const bh = y === bTop || y === bBot ? 1 : 2;
      for (let x = CX - bh; x <= CX + bh; x++) {
        const edge = x === CX - bh || x === CX + bh || y === bTop || y === bBot;
        if (edge) cells.push([x, y, OUTLINE]);
        else cells.push([x, y, y >= corkTop - 7 ? AIR_WATER : GLASS]);
      }
    }
    cells.push([CX, bTop - 1, OUTLINE]); // little cap
    airlock = { active: viz.airlock && hasLiquid, x: CX, yLo: corkTop - 5, yHi: corkTop - 8 };
  }

  // bubbles
  const rng = mulberry(seed);
  const bubbles: Bubble[] = [];
  const count = hasLiquid ? viz.bubbles : 0;
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: Math.round(CX - p.maxHW + 4 + rng() * (p.maxHW * 2 - 8)),
      speed: viz.speed * (0.75 + rng() * 0.5),
      offset: rng(),
      big: rng() > 0.7,
    });
  }

  const ariaLabel = hasLiquid
    ? `${VESSELS[vessel].label} of ${honey.label} mead, ${phase} phase`
    : `Empty ${VESSELS[vessel].label}`;

  return { cells, bubbles, surfaceY, bottomY, hasLiquid, airlock, ariaLabel };
}

function liquidPixelColor(
  x: number, y: number, left: number, right: number, surfaceY: number,
  light: string, base: string, dark: string, surface: string, cloud: number,
): string {
  if (y <= surfaceY + 1) return surface;          // surface meniscus
  if (x === left + 2) return light;               // shine streak
  if (x === left + 1 || x === right - 1) return dark; // edge shading
  // cloudiness: sparse lighter speckle near the top third of the liquid
  if (cloud > 0 && (x * 7 + y * 13) % 17 === 0 && y < surfaceY + 18) {
    return cloud > 0.4 ? light : base;
  }
  return base;
}

// tiny deterministic PRNG so a given batch always renders the same bubbles
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function PixelVessel({ vessel, honeyType, liters, phase, size = 200, animated = true, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const seed = seedFrom(`${vessel}|${honeyType}|${phase}`);
    const built = build(vessel, honeyType, liters, phase, seed);

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const drawStatic = () => {
      ctx.clearRect(0, 0, PW, PH);
      for (const [x, y, c] of built.cells) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    };

    if (!animated || reduced || (built.bubbles.length === 0 && !built.airlock?.active)) {
      drawStatic();
      return;
    }

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      drawStatic();
      // rising fermentation bubbles
      for (const b of built.bubbles) {
        const prog = ((t / b.speed) + b.offset) % 1;
        if (prog < 0.05 || prog > 0.95) continue; // fade at ends
        const y = Math.round(lerp(built.bottomY, built.surfaceY + 1, prog));
        const wob = Math.round(Math.sin((t + b.offset * 6) * 3) * 1);
        const x = b.x + wob;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, 1, 1);
        if (b.big) ctx.fillRect(x, y - 1, 1, 1);
      }
      // airlock bubble trickling through the water trap
      if (built.airlock?.active) {
        const a = built.airlock;
        const prog = (t / 1.3) % 1;
        const y = Math.round(lerp(a.yLo, a.yHi, prog));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(a.x, y, 1, 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [vessel, honeyType, liters, phase, animated]);

  return (
    <canvas
      ref={ref}
      width={PW}
      height={PH}
      role="img"
      aria-label={
        liters <= 0.01 ? `Empty ${VESSELS[vessel].label}` : `${VESSELS[vessel].label} of ${HONEYS[honeyType].label} mead`
      }
      className={className}
      style={{
        width: size,
        height: (size * PH) / PW,
        imageRendering: "pixelated",
        display: "block",
      }}
    />
  );
}
