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
const PW = 96;
const PH = 150;
const CX = 48;

// Palette (non-honey)
const OUTLINE = "#2e2336";
const GLASS = "#dde9e4";
const GLASS_SHADE = "#bfd0c8";
const SHINE = "#ffffff";
const CORK = "#b07b43";
const CORK_HI = "#c89058";
const CORK_DK = "#7c5128";
const LID = "#cdc6b6";
const LID_DK = "#9c947f";
const AIR_WATER = "#7fc6e0";
const SHADOW = "rgba(46,35,54,0.16)";

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
  carboy:   { shape: "carboy",   neckTop: 40, neckHW: 6, shoulderTop: 54, bodyTop: 72, bodyBottom: 144, maxHW: 30, baseRound: 10, lid: "cork" },
  jug:      { shape: "jug",      neckTop: 40, neckHW: 7, shoulderTop: 52, bodyTop: 70, bodyBottom: 144, maxHW: 34, baseRound: 10, lid: "cork", handle: true },
  demijohn: { shape: "demijohn", neckTop: 40, neckHW: 8, shoulderTop: 52, bodyTop: 66, bodyBottom: 144, maxHW: 37, baseRound: 10, lid: "cork" },
  bucket:   { shape: "bucket",   neckTop: 38, neckHW: 34, shoulderTop: 38, bodyTop: 46, bodyBottom: 144, maxHW: 34, baseRound: 0, lid: "lid", taperBottomHW: 31 },
};

interface PhaseViz { bubbles: number; speed: number; airlock: boolean; foam: number; sediment: number }
const PHASE_VIZ: Record<PhaseName, PhaseViz> = {
  lag:          { bubbles: 4,  speed: 5,   airlock: false, foam: 2, sediment: 2 },
  primary:      { bubbles: 26, speed: 1.6, airlock: true,  foam: 7, sediment: 4 },
  secondary:    { bubbles: 9,  speed: 3,   airlock: true,  foam: 3, sediment: 7 },
  conditioning: { bubbles: 2,  speed: 6,   airlock: false, foam: 1, sediment: 10 },
  done:         { bubbles: 0,  speed: 0,   airlock: false, foam: 0, sediment: 12 },
};

type Cell = [number, number, string];
interface Bubble { x: number; speed: number; offset: number; big: boolean }

interface Built {
  cells: Cell[];
  bubbles: Bubble[];
  bubbleTop: number;     // highest y a bubble may reach (just below foam)
  bubbleBottom: number;  // lowest y (just above sediment)
  hasLiquid: boolean;
  airlock: { active: boolean; x: number; yLo: number; yHi: number } | null;
  ariaLabel: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function toRGB(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function fromRGB(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("")}`;
}
function shade(hex: string, amt: number): string {
  const [r, g, b] = toRGB(hex);
  return fromRGB(r + amt, g + amt, b + amt);
}
function blend(a: string, b: string, t: number): string {
  const [r1, g1, b1] = toRGB(a);
  const [r2, g2, b2] = toRGB(b);
  return fromRGB(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}
function hash(x: number, y: number): number {
  let h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return h >>> 0;
}

function halfWidth(p: ShapeParams, y: number): number | null {
  if (p.shape === "bucket") {
    if (y < p.bodyTop || y > p.bodyBottom) return null;
    const t = (y - p.bodyTop) / (p.bodyBottom - p.bodyTop);
    return lerp(p.maxHW, p.taperBottomHW ?? p.maxHW, t);
  }
  if (y < p.neckTop || y > p.bodyBottom) return null;
  if (y < p.shoulderTop) return p.neckHW;
  if (y < p.bodyTop) {
    // eased shoulder curve (smoothstep) for a rounded glass shoulder
    const u = (y - p.shoulderTop) / (p.bodyTop - p.shoulderTop);
    const s = u * u * (3 - 2 * u);
    return lerp(p.neckHW, p.maxHW, s);
  }
  const baseStart = p.bodyBottom - p.baseRound;
  if (y < baseStart) {
    const m = (y - p.bodyTop) / (baseStart - p.bodyTop);
    return p.maxHW + Math.sin(m * Math.PI) * 1.6; // gentle barrel bulge
  }
  return lerp(p.maxHW, p.maxHW * 0.55, (y - baseStart) / p.baseRound);
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
  const liquidH = Math.max(1, bottomY - surfaceY);

  const foamThk = Math.min(viz.foam, Math.floor(liquidH * 0.4));
  const sedThk = Math.min(viz.sediment, Math.floor(liquidH * 0.5));
  const foamBottom = surfaceY + foamThk;
  const sedTop = bottomY - sedThk;

  // honey-derived ramps
  const base = honey.color;
  const liq = [
    shade(base, 62), shade(base, 30), base, shade(base, -26), shade(base, -52), shade(base, -82),
  ];
  const specular = shade(base, 86);
  const foamA = blend(base, "#ffffff", 0.74);
  const foamB = blend(base, "#ffffff", 0.52);
  const foamEdge = blend(base, "#ffffff", 0.3);
  const sedA = blend(base, "#3a2008", 0.6);
  const sedB = blend(base, "#21130a", 0.74);

  const cells: Cell[] = [];

  // soft dithered ground shadow
  for (let x = CX - p.maxHW + 3; x <= CX + p.maxHW + (p.handle ? 6 : 3); x++) {
    if (hash(x, 1) % 5 !== 0) cells.push([x, p.bodyBottom + 3, SHADOW]);
    if (x > CX - p.maxHW + 9 && x < CX + p.maxHW - 6 && hash(x, 2) % 3 !== 0) {
      cells.push([x, p.bodyBottom + 4, SHADOW]);
    }
  }

  // handle (jug only) — glass tube bracket on the right
  if (p.handle) {
    const ox = CX + p.maxHW + 6;
    const hTop = p.bodyTop + 16;
    const hBot = p.bodyTop + 52;
    for (let y = hTop; y <= hBot; y++) {
      cells.push([ox, y, OUTLINE]);
      cells.push([ox - 1, y, GLASS]);
      cells.push([ox - 2, y, GLASS_SHADE]);
      cells.push([ox - 3, y, OUTLINE]);
      if (hash(ox, y) % 7 === 0) cells.push([ox - 1, y, SHINE]);
    }
    for (let x = CX + p.maxHW - 1; x <= ox; x++) {
      cells.push([x, hTop, OUTLINE]);
      cells.push([x, hBot, OUTLINE]);
    }
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
        cells.push([x, y, liquidColor(
          x, y, left, right, surfaceY, foamBottom, sedTop, bottomY,
          liq, specular, foamA, foamB, foamEdge, sedA, sedB,
        )]);
      } else {
        cells.push([x, y, glassColor(x, y, left, right, p)]);
      }
    }
  }

  // cork or lid
  if (p.lid === "cork") {
    const cw = p.neckHW + 2;
    const cBot = p.neckTop + 2;
    const cTop = cBot - 9;
    for (let y = cTop; y <= cBot; y++) {
      for (let x = CX - cw; x <= CX + cw; x++) {
        const edge = y === cTop || x === CX - cw || x === CX + cw;
        let c = edge ? CORK_DK : CORK;
        if (!edge && hash(x, y) % 4 === 0) c = CORK_HI;
        if (!edge && hash(x, y * 3) % 5 === 0) c = CORK_DK;
        cells.push([x, y, c]);
      }
    }
  } else {
    const cw = p.maxHW + 2;
    const lBot = p.bodyTop;
    const lTop = lBot - 7;
    for (let y = lTop; y <= lBot; y++) {
      for (let x = CX - cw; x <= CX + cw; x++) {
        const edge = y === lTop || x === CX - cw || x === CX + cw;
        cells.push([x, y, edge ? LID_DK : LID]);
      }
    }
    // lid grip lip
    for (let x = CX - cw - 1; x <= CX + cw + 1; x++) cells.push([x, lTop, LID_DK]);
  }

  // airlock — 3-piece bubbler cylinder on top of the cork
  let airlock: Built["airlock"] = null;
  if (p.lid === "cork") {
    const corkTop = p.neckTop + 2 - 9;
    // stem into cork
    for (let y = corkTop - 4; y <= corkTop - 1; y++) {
      cells.push([CX - 1, y, OUTLINE]);
      cells.push([CX, y, GLASS]);
      cells.push([CX + 1, y, OUTLINE]);
    }
    // cylinder chamber
    const chTop = corkTop - 24;
    const chBot = corkTop - 4;
    const chHW = 4;
    for (let y = chTop; y <= chBot; y++) {
      for (let x = CX - chHW; x <= CX + chHW; x++) {
        const edge = x === CX - chHW || x === CX + chHW || y === chTop || y === chBot;
        if (edge) { cells.push([x, y, OUTLINE]); continue; }
        // water sits in the lower half of the chamber
        if (y >= corkTop - 16) cells.push([x, y, x <= CX - chHW + 2 ? AIR_WATER : blend(AIR_WATER, "#ffffff", 0.2)]);
        else cells.push([x, y, x <= CX - chHW + 2 ? SHINE : GLASS]);
      }
    }
    // floating inner cap + vented top cap
    for (let x = CX - chHW + 1; x <= CX + chHW - 1; x++) cells.push([x, corkTop - 17, LID_DK]);
    for (let x = CX - 2; x <= CX + 2; x++) cells.push([x, chTop - 1, OUTLINE]);
    cells.push([CX, chTop - 2, OUTLINE]);
    airlock = { active: viz.airlock && hasLiquid, x: CX, yLo: corkTop - 6, yHi: corkTop - 15 };
  }

  // bubbles
  const rng = mulberry(seed);
  const bubbles: Bubble[] = [];
  const count = hasLiquid ? viz.bubbles : 0;
  const span = p.maxHW * 2 - 10;
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: Math.round(CX - p.maxHW + 5 + rng() * span),
      speed: viz.speed * (0.7 + rng() * 0.6),
      offset: rng(),
      big: rng() > 0.78,
    });
  }

  const ariaLabel = hasLiquid
    ? `${VESSELS[vessel].label} of ${honey.label} mead, ${phase} phase`
    : `Empty ${VESSELS[vessel].label}`;

  return {
    cells, bubbles,
    bubbleTop: foamBottom + 1,
    bubbleBottom: sedTop - 1,
    hasLiquid, airlock, ariaLabel,
  };
}

function liquidColor(
  x: number, y: number, left: number, right: number,
  surfaceY: number, foamBottom: number, sedTop: number, bottomY: number,
  liq: string[], specular: string,
  foamA: string, foamB: string, foamEdge: string, sedA: string, sedB: string,
): string {
  // krausen foam ring
  if (y < foamBottom) {
    if (y === foamBottom - 1) return foamEdge;
    return hash(x, y) % 2 === 0 ? foamA : foamB;
  }
  // sediment / lees
  if (y >= sedTop) {
    const r = hash(x, y) % 3;
    return r === 0 ? sedB : sedA;
  }
  // gradient body
  const t = (y - foamBottom) / Math.max(1, sedTop - foamBottom);
  let idx = clamp(Math.floor(t * liq.length), 0, liq.length - 1);
  // subtle dither between bands
  if (hash(x, y) % 2 === 0 && t * liq.length - idx > 0.55) idx = Math.min(idx + 1, liq.length - 1);
  // edge shading near the glass walls
  if (x <= left + 1 || x >= right - 1) idx = Math.min(idx + 1, liq.length - 1);
  // broken specular streak on the upper-left
  if ((x === left + 3 || x === left + 4) && hash(x, y) % 3 !== 0) return specular;
  return liq[idx];
}

function glassColor(x: number, y: number, left: number, right: number, p: ShapeParams): string {
  // bright shoulder highlight cluster (upper-left of the shoulder)
  if (y >= p.shoulderTop && y < p.bodyTop && x > left + 2 && x < left + 7 && hash(x, y) % 4 !== 0) {
    return SHINE;
  }
  if (x === left + 2 || x === left + 3) return SHINE;       // vertical specular streak
  if (x >= right - 2) return GLASS_SHADE;                    // shaded right edge
  return GLASS;
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

    // render the static art once onto an offscreen buffer
    const off = document.createElement("canvas");
    off.width = PW; off.height = PH;
    const octx = off.getContext("2d")!;
    octx.imageSmoothingEnabled = false;
    for (const [x, y, c] of built.cells) { octx.fillStyle = c; octx.fillRect(x, y, 1, 1); }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const noMotion = !animated || reduced || (built.bubbles.length === 0 && !built.airlock?.active);
    if (noMotion) {
      ctx.clearRect(0, 0, PW, PH);
      ctx.drawImage(off, 0, 0);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, PW, PH);
      ctx.drawImage(off, 0, 0);
      // rising fermentation bubbles
      for (const b of built.bubbles) {
        const prog = ((t / b.speed) + b.offset) % 1;
        if (prog < 0.04 || prog > 0.96) continue;
        const y = Math.round(lerp(built.bubbleBottom, built.bubbleTop, prog));
        const wob = Math.round(Math.sin((t + b.offset * 6) * 3));
        const x = b.x + wob;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(x, y, 1, 1);
        if (b.big) { ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x + 1, y, 1, 1); }
      }
      // airlock bubble trickling up through the water trap
      if (built.airlock?.active) {
        const a = built.airlock;
        const prog = (t / 1.4) % 1;
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
