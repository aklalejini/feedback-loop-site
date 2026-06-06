"use client";
import { useEffect, useRef, useState } from "react";
import {
  HONEYS,
  VESSELS,
  type HoneyType,
  type PhaseName,
  type VesselKind,
} from "@/lib/mead";
import { PixelVessel } from "./PixelVessel";

interface Props {
  vessel: VesselKind;
  honeyType: HoneyType;
  liters: number;
  phase: PhaseName;
  size?: number;
  animated?: boolean;
  className?: string;
}

interface Meta {
  w: number;
  h: number;
  headroom?: number;
  bg?: [number, number, number];
  neck: { cx: number; y_top: number; y_bottom: number; width: number };
  interior: { x: number; y: number; w: number; h: number };
  fill?: { top: number; bottom: number; x: number; w: number };
}

interface Assets {
  sprite: HTMLImageElement;
  mask: HTMLImageElement;
  meta: Meta;
}

const cache: Record<string, Promise<Assets | null>> = {};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = (e) => rej(e);
    img.src = url;
  });
}

function loadAssets(vessel: VesselKind): Promise<Assets | null> {
  if (!cache[vessel]) {
    cache[vessel] = (async () => {
      try {
        const [sprite, mask, metaResp] = await Promise.all([
          loadImage(`/vessels/${vessel}.png`),
          loadImage(`/vessels/${vessel}.mask.png`),
          fetch(`/vessels/${vessel}.meta.json`),
        ]);
        if (!metaResp.ok) return null;
        const meta: Meta = await metaResp.json();
        return { sprite, mask, meta };
      } catch {
        return null;
      }
    })();
  }
  return cache[vessel];
}

interface PhaseViz { bubbles: number; speed: number; airlock: boolean; foam: number; sediment: number }
const PHASE_VIZ: Record<PhaseName, PhaseViz> = {
  lag:          { bubbles: 5,  speed: 4.5, airlock: false, foam: 0.05, sediment: 0.04 },
  primary:      { bubbles: 16, speed: 1.8, airlock: true,  foam: 0.14, sediment: 0.07 },
  secondary:    { bubbles: 7,  speed: 3,   airlock: true,  foam: 0.06, sediment: 0.13 },
  conditioning: { bubbles: 2,  speed: 6,   airlock: false, foam: 0.02, sediment: 0.18 },
  done:         { bubbles: 0,  speed: 0,   airlock: false, foam: 0,    sediment: 0.22 },
};

// ---------- colour helpers (HSL so amber stays luminous, never muddy) ----------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
function lift(hex: string, dL: number, dS = 0): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s + dS, l + dL);
}

interface Palette { top: string; body: string; deep: string; surface: string; foam: string; foamHi: string; sed: string }
function paletteFor(honey: HoneyType): Palette {
  const base = HONEYS[honey].color;
  const [h, s, l] = hexToHsl(base);
  // keep the body luminous; clamp lightness into a pleasant amber band
  const bodyL = clamp(l, 0.46, 0.6);
  const body = hslToHex(h, clamp(s * 1.06, 0, 1), bodyL);
  return {
    top: lift(body, 0.07, 0.02),
    body,
    deep: lift(body, -0.1, 0.02),       // gently deeper, NOT muddy
    surface: lift(body, 0.16, -0.02),
    foam: hslToHex(h, clamp(s * 0.45, 0, 0.4), 0.9),
    foamHi: hslToHex(h, clamp(s * 0.3, 0, 0.3), 0.96),
    sed: hslToHex(h, clamp(s * 0.7, 0, 1), clamp(bodyL - 0.16, 0.1, 0.5)),
  };
}

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

export function SpriteVessel({ vessel, honeyType, liters, phase, size = 200, animated = true, className }: Props) {
  const [assets, setAssets] = useState<Assets | "fallback" | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let alive = true;
    loadAssets(vessel).then((a) => { if (alive) setAssets(a ?? "fallback"); });
    return () => { alive = false; };
  }, [vessel]);

  useEffect(() => {
    if (!assets || assets === "fallback") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { sprite, mask, meta } = assets;
    const pal = paletteFor(honeyType);
    const viz = PHASE_VIZ[phase];
    const capacity = VESSELS[vessel].capacityL;
    const fill = liters <= 0.01 ? 0 : clamp(liters / capacity, 0.06, 0.95);
    const hasLiquid = fill > 0;

    // Liquid sits between the top of the straight body and the cavity bottom,
    // using the body bbox (not the handle) for width-based effects.
    const fillMeta = meta.fill ?? {
      top: meta.interior.y,
      bottom: meta.interior.y + meta.interior.h,
      x: meta.interior.x,
      w: meta.interior.w,
    };
    const intX = fillMeta.x;
    const intW = fillMeta.w;
    const intY1 = fillMeta.bottom;
    const fillRange = fillMeta.bottom - fillMeta.top;
    const liquidH = Math.round(fill * fillRange);
    const liquidTop = intY1 - liquidH;

    const bgRGB = meta.bg ?? [253, 253, 253];
    const bgHex = `rgb(${bgRGB[0]},${bgRGB[1]},${bgRGB[2]})`;

    // ----- 1. base: the silhouette filled with the art's background colour,
    // with the liquid painted into the cavity. Multiplying the glass over this
    // reproduces the original art everywhere the glass is "clear", and shows the
    // mead through it where there's liquid. -----
    const base = document.createElement("canvas");
    base.width = meta.w; base.height = meta.h;
    const bx = base.getContext("2d")!;
    bx.imageSmoothingEnabled = true;
    // silhouette shape from the glass alpha, recoloured to the bg
    bx.drawImage(sprite, 0, 0);
    bx.globalCompositeOperation = "source-in";
    bx.fillStyle = bgHex;
    bx.fillRect(0, 0, meta.w, meta.h);
    bx.globalCompositeOperation = "source-over";

    if (hasLiquid) {
      // liquid drawn on its own layer, then clipped to the cavity mask
      const liq = document.createElement("canvas");
      liq.width = meta.w; liq.height = meta.h;
      const l = liq.getContext("2d")!;
      l.imageSmoothingEnabled = true;

      const vg = l.createLinearGradient(0, liquidTop, 0, intY1);
      vg.addColorStop(0, pal.top);
      vg.addColorStop(0.45, pal.body);
      vg.addColorStop(1, pal.deep);
      l.fillStyle = vg;
      l.fillRect(intX - 6, liquidTop, intW + 12, liquidH + 6);

      // horizontal roundness — light from upper-left, edges fall off
      const hg = l.createLinearGradient(intX, 0, intX + intW, 0);
      hg.addColorStop(0.0, "rgba(60,30,0,0.18)");
      hg.addColorStop(0.16, "rgba(0,0,0,0)");
      hg.addColorStop(0.34, "rgba(255,250,235,0.14)");
      hg.addColorStop(0.6, "rgba(0,0,0,0)");
      hg.addColorStop(1.0, "rgba(50,25,0,0.24)");
      l.fillStyle = hg;
      l.fillRect(intX - 6, liquidTop, intW + 12, liquidH + 6);

      // soft specular bloom on the upper-left
      const cxh = intX + intW * 0.34;
      const cyh = liquidTop + liquidH * 0.26;
      const rad = l.createRadialGradient(cxh, cyh, 2, cxh, cyh, intW * 0.5);
      rad.addColorStop(0, "rgba(255,252,240,0.2)");
      rad.addColorStop(1, "rgba(255,252,240,0)");
      l.fillStyle = rad;
      l.fillRect(intX - 6, liquidTop, intW + 12, liquidH * 0.7);

      // sediment — soft band fading upward
      const sedH = Math.round(viz.sediment * liquidH);
      if (sedH > 2) {
        const sg = l.createLinearGradient(0, intY1 - sedH, 0, intY1);
        sg.addColorStop(0, "rgba(0,0,0,0)");
        sg.addColorStop(1, pal.sed);
        l.fillStyle = sg;
        l.fillRect(intX - 6, intY1 - sedH, intW + 12, sedH + 6);
      }

      // krausen foam + meniscus
      const foamH = Math.max(2, Math.round(viz.foam * liquidH));
      if (foamH >= 2) {
        const fg = l.createLinearGradient(0, liquidTop, 0, liquidTop + foamH);
        fg.addColorStop(0, pal.foamHi);
        fg.addColorStop(1, pal.foam);
        l.fillStyle = fg;
        l.fillRect(intX - 6, liquidTop, intW + 12, foamH);
        l.fillStyle = "rgba(60,35,5,0.12)";
        l.fillRect(intX - 6, liquidTop + foamH, intW + 12, 2);
      }
      l.fillStyle = "rgba(255,253,245,0.5)";
      l.fillRect(intX - 6, liquidTop, intW + 12, 1.5);

      // clip the liquid to the cavity, then lay it over the cream base
      l.globalCompositeOperation = "destination-in";
      l.drawImage(mask, 0, 0);
      bx.drawImage(liq, 0, 0);
    }

    // ----- 2. static composite: multiply the glass art over the base, then the
    // procedural cork + airlock on top. Built once; only bubbles animate. -----
    const still = document.createElement("canvas");
    still.width = meta.w; still.height = meta.h;
    const sx = still.getContext("2d")!;
    sx.imageSmoothingEnabled = true;
    sx.drawImage(base, 0, 0);
    sx.globalCompositeOperation = "multiply";
    sx.drawImage(sprite, 0, 0);
    sx.globalCompositeOperation = "source-over";
    drawCorkAndAirlock(sx, meta);

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, meta.w, meta.h);
      ctx.drawImage(still, 0, 0);
      if (animated && hasLiquid && viz.bubbles > 0) {
        drawBubbles(ctx, intX, intW, liquidTop, intY1, viz, vessel, honeyType, phase, t);
      }
      if (animated && viz.airlock && hasLiquid) drawAirlockBubble(ctx, meta, t);
    };

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const noMotion = !animated || reduced || (viz.bubbles === 0 && !viz.airlock);
    if (noMotion) { drawFrame(0); return; }

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      drawFrame((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [assets, vessel, honeyType, liters, phase, animated]);

  if (assets === "fallback") {
    return (
      <PixelVessel
        vessel={vessel} honeyType={honeyType} liters={liters}
        phase={phase} size={size} animated={animated} className={className}
      />
    );
  }

  const meta = assets && typeof assets === "object" ? assets.meta : null;
  const w = meta?.w ?? 480;
  const h = meta?.h ?? 420;
  const aria = liters <= 0.01
    ? `Empty ${VESSELS[vessel].label}`
    : `${VESSELS[vessel].label} of ${HONEYS[honeyType].label} mead`;
  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      role="img"
      aria-label={aria}
      className={className}
      style={{ width: size, height: (size * h) / w, display: "block" }}
    />
  );
}

// ---- smooth cork + 3-piece airlock, drawn to match the painterly glass ----
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCorkAndAirlock(ctx: CanvasRenderingContext2D, meta: Meta) {
  const { neck } = meta;
  const cx = neck.cx;
  const corkW = Math.max(neck.width + 8, 22);
  const corkH = Math.max(16, Math.round(neck.width * 0.9));
  const corkX = cx - corkW / 2;
  const corkY = neck.y_top - Math.round(corkH * 0.55);

  // cork body with vertical wood gradient
  const cg = ctx.createLinearGradient(corkX, 0, corkX + corkW, 0);
  cg.addColorStop(0, "#8a5a2c");
  cg.addColorStop(0.4, "#c08a4e");
  cg.addColorStop(0.65, "#b07b43");
  cg.addColorStop(1, "#7c5128");
  rrect(ctx, corkX, corkY, corkW, corkH, 3);
  ctx.fillStyle = cg;
  ctx.fill();
  // rounded top cap
  rrect(ctx, corkX - 1, corkY - 2, corkW + 2, 5, 2.5);
  ctx.fillStyle = "#caa066";
  ctx.fill();
  ctx.strokeStyle = "rgba(60,40,20,0.55)";
  ctx.lineWidth = 1;
  rrect(ctx, corkX, corkY, corkW, corkH, 3);
  ctx.stroke();

  // airlock: stem + chamber + cap, all glass
  const alW = Math.max(12, Math.round(corkW * 0.5));
  const alH = Math.max(26, Math.round(corkH * 2.4));
  const alX = cx - alW / 2;
  const alY = corkY - 4 - alH;

  // stem
  ctx.fillStyle = "rgba(210,228,222,0.95)";
  ctx.fillRect(cx - 1.5, alY + alH - 2, 3, 8);
  ctx.strokeStyle = "rgba(70,90,84,0.6)";
  ctx.strokeRect(cx - 1.5, alY + alH - 2, 3, 8);

  // chamber body (glass)
  const gg = ctx.createLinearGradient(alX, 0, alX + alW, 0);
  gg.addColorStop(0, "#acc7be");
  gg.addColorStop(0.35, "#eaf3ef");
  gg.addColorStop(1, "#bcd2c9");
  rrect(ctx, alX, alY, alW, alH, alW / 2);
  ctx.fillStyle = gg;
  ctx.fill();
  // blue water in the lower half
  ctx.save();
  rrect(ctx, alX, alY, alW, alH, alW / 2);
  ctx.clip();
  const wg = ctx.createLinearGradient(0, alY + alH * 0.5, 0, alY + alH);
  wg.addColorStop(0, "#9bd3e6");
  wg.addColorStop(1, "#6cbcd6");
  ctx.fillStyle = wg;
  ctx.fillRect(alX, alY + alH * 0.52, alW, alH * 0.42);
  ctx.restore();
  // floating cap line + outline + highlight
  ctx.fillStyle = "rgba(120,112,96,0.8)";
  ctx.fillRect(alX + 2, alY + alH * 0.5, alW - 4, 1.5);
  ctx.strokeStyle = "rgba(70,90,84,0.65)";
  ctx.lineWidth = 1;
  rrect(ctx, alX, alY, alW, alH, alW / 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillRect(alX + 2, alY + 3, 1.5, alH - 8);
  // vent cap
  ctx.fillStyle = "#cdd9d3";
  rrect(ctx, cx - alW * 0.4, alY - 4, alW * 0.8, 5, 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(70,90,84,0.6)";
  ctx.stroke();
}

function drawBubbles(
  ctx: CanvasRenderingContext2D, bodyX: number, bodyW: number,
  liquidTop: number, liquidBottom: number,
  viz: PhaseViz, vessel: VesselKind, honeyType: HoneyType, phase: PhaseName, t: number,
) {
  const rng = mulberry(seedFrom(`${vessel}|${honeyType}|${phase}|b`));
  const pad = bodyW * 0.18;
  const x0 = bodyX + pad;
  const x1 = bodyX + bodyW - pad;
  const top = liquidTop + (liquidBottom - liquidTop) * 0.12;
  const bot = liquidBottom - (liquidBottom - liquidTop) * 0.16;
  for (let i = 0; i < viz.bubbles; i++) {
    const x = x0 + rng() * (x1 - x0);
    const speed = viz.speed * (0.7 + rng() * 0.6);
    const off = rng();
    const r = rng() > 0.8 ? 2.4 : 1.4;
    const prog = ((t / speed) + off) % 1;
    if (prog < 0.05 || prog > 0.95) continue;
    const y = bot + (top - bot) * prog;
    const wob = Math.sin((t + off * 6) * 2.5) * 2;
    const px = x + wob;
    const g = ctx.createRadialGradient(px, y, 0, px, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.85)");
    g.addColorStop(0.6, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAirlockBubble(ctx: CanvasRenderingContext2D, meta: Meta, t: number) {
  const { neck } = meta;
  const cx = neck.cx;
  const corkH = Math.max(16, Math.round(neck.width * 0.9));
  const corkY = neck.y_top - Math.round(corkH * 0.55);
  const alH = Math.max(26, Math.round(corkH * 2.4));
  const alY = corkY - 4 - alH;
  const wTop = alY + alH * 0.55;
  const wBot = alY + alH * 0.9;
  const prog = (t / 1.4) % 1;
  const y = wBot + (wTop - wBot) * prog;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(cx, y, 1.6, 0, Math.PI * 2);
  ctx.fill();
}
