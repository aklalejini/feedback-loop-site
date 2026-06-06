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
  neck: { cx: number; y_top: number; y_bottom: number; width: number };
  interior: { x: number; y: number; w: number; h: number };
}

interface Assets {
  sprite: HTMLImageElement;
  mask: HTMLImageElement;
  meta: Meta;
}

// Module-level cache: each vessel kind's assets fetched once per page session.
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

interface PhaseViz {
  bubbles: number;
  speed: number;
  airlock: boolean;
  foamPx: number;
  sedimentPx: number;
}
const PHASE_VIZ: Record<PhaseName, PhaseViz> = {
  lag:          { bubbles: 4,  speed: 4.5, airlock: false, foamPx: 4,  sedimentPx: 3  },
  primary:      { bubbles: 18, speed: 1.7, airlock: true,  foamPx: 12, sedimentPx: 6  },
  secondary:    { bubbles: 8,  speed: 3,   airlock: true,  foamPx: 5,  sedimentPx: 10 },
  conditioning: { bubbles: 2,  speed: 6,   airlock: false, foamPx: 2,  sedimentPx: 16 },
  done:         { bubbles: 0,  speed: 0,   airlock: false, foamPx: 0,  sedimentPx: 20 },
};

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
  return fromRGB(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
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
    ctx.imageSmoothingEnabled = false;

    const { sprite, mask, meta } = assets;
    const honey = HONEYS[honeyType];
    const viz = PHASE_VIZ[phase];
    const capacity = VESSELS[vessel].capacityL;
    const fill = liters <= 0.01 ? 0 : clamp(liters / capacity, 0.06, 0.95);
    const hasLiquid = fill > 0;

    const intY1 = meta.interior.y + meta.interior.h;
    const liquidH = Math.round(fill * meta.interior.h);
    const liquidTop = intY1 - liquidH;

    // -------- Static background layer: liquid + foam + sediment, clipped to mask --------
    const bg = document.createElement("canvas");
    bg.width = meta.w; bg.height = meta.h;
    const bctx = bg.getContext("2d");
    if (!bctx) return;
    bctx.imageSmoothingEnabled = false;

    if (hasLiquid) {
      const base = honey.color;
      const top = shade(base, 28);
      const mid = base;
      const bot = shade(base, -56);

      const grad = bctx.createLinearGradient(0, liquidTop, 0, intY1);
      grad.addColorStop(0, top);
      grad.addColorStop(0.5, mid);
      grad.addColorStop(1, bot);
      bctx.fillStyle = grad;
      bctx.fillRect(0, liquidTop, meta.w, liquidH);

      // Krausen foam ring at the surface
      const foamThk = Math.min(viz.foamPx, Math.floor(liquidH * 0.35));
      if (foamThk > 0) {
        bctx.fillStyle = blend(base, "#ffffff", 0.72);
        bctx.fillRect(0, liquidTop, meta.w, foamThk);
        // dithered foam texture
        const rng = mulberry(seedFrom(`${vessel}|${honeyType}|foam`));
        const drops = Math.round(foamThk * meta.w * 0.08);
        bctx.fillStyle = blend(base, "#ffffff", 0.45);
        for (let i = 0; i < drops; i++) {
          bctx.fillRect(
            Math.floor(rng() * meta.w),
            liquidTop + Math.floor(rng() * foamThk),
            1, 1,
          );
        }
        // crisp foam edge
        bctx.fillStyle = blend(base, "#ffffff", 0.28);
        bctx.fillRect(0, liquidTop + foamThk - 1, meta.w, 1);
      }

      // Sediment / lees at the bottom of the cavity
      const sedThk = Math.min(viz.sedimentPx, Math.floor(liquidH * 0.45));
      if (sedThk > 0) {
        const sedTop = intY1 - sedThk;
        bctx.fillStyle = blend(base, "#2a1607", 0.7);
        bctx.fillRect(0, sedTop, meta.w, sedThk);
        const rng = mulberry(seedFrom(`${vessel}|${honeyType}|sed`));
        const grains = Math.round(sedThk * meta.w * 0.15);
        bctx.fillStyle = blend(base, "#3a2208", 0.55);
        for (let i = 0; i < grains; i++) {
          bctx.fillRect(
            Math.floor(rng() * meta.w),
            sedTop + Math.floor(rng() * sedThk),
            1, 1,
          );
        }
      }

      // Clip the liquid layer to the interior mask
      bctx.globalCompositeOperation = "destination-in";
      bctx.drawImage(mask, 0, 0);
      bctx.globalCompositeOperation = "source-over";
    }

    // -------- Procedural cork + airlock at the neck (drawn once into bg) --------
    drawCorkAndAirlock(bctx, meta, phase, hasLiquid);

    // -------- Sprite on top of liquid + cork --------
    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, meta.w, meta.h);
      ctx.drawImage(bg, 0, 0);
      ctx.drawImage(sprite, 0, 0);
      // animated bubbles: drawn in a small layer then clipped to the interior mask
      if (animated && hasLiquid && viz.bubbles > 0) {
        const bubLayer = bubbleLayer(meta, liquidTop, intY1, viz, vessel, honeyType, phase, t);
        // clip bubbles to the interior so they don't escape
        bubLayer && ctx.drawImage(bubLayer, 0, 0);
      }
      // airlock bubble overlay (drawn on top of everything; already inside the cork area)
      if (animated && viz.airlock && hasLiquid) {
        drawAirlockBubble(ctx, meta, t);
      }
    };

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const noMotion = !animated || reduced || (viz.bubbles === 0 && !viz.airlock);
    if (noMotion) {
      drawFrame(0);
      return;
    }

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
        vessel={vessel}
        honeyType={honeyType}
        liters={liters}
        phase={phase}
        size={size}
        animated={animated}
        className={className}
      />
    );
  }

  const meta = assets && typeof assets === "object" ? assets.meta : null;
  const w = meta?.w ?? 480;
  const h = meta?.h ?? 360;
  const aria =
    liters <= 0.01
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

function drawCorkAndAirlock(ctx: CanvasRenderingContext2D, meta: Meta, phase: PhaseName, hasLiquid: boolean) {
  const { neck } = meta;
  // cork sits IN the neck opening + slight overhang on top
  const corkW = Math.max(neck.width + 6, 18);
  const corkH = Math.max(12, Math.round(neck.width * 0.7));
  const corkX = neck.cx - corkW / 2;
  const corkY = neck.y_top - Math.round(corkH * 0.45);

  // cork body
  ctx.fillStyle = "#b07b43";
  ctx.fillRect(corkX, corkY, corkW, corkH);
  // top edge
  ctx.fillStyle = "#7c5128";
  ctx.fillRect(corkX, corkY, corkW, 2);
  ctx.fillRect(corkX, corkY + corkH - 2, corkW, 2);
  // simple dither
  const rng = mulberry(seedFrom(`cork|${meta.w}`));
  ctx.fillStyle = "#c89058";
  const flecks = Math.round(corkW * corkH * 0.04);
  for (let i = 0; i < flecks; i++) {
    ctx.fillRect(corkX + Math.floor(rng() * corkW), corkY + 2 + Math.floor(rng() * (corkH - 4)), 1, 1);
  }

  // airlock above the cork: 3-piece glass cylinder
  const alW = Math.max(10, Math.round(corkW * 0.55));
  const alH = Math.max(22, Math.round(corkH * 2.2));
  const alX = neck.cx - Math.floor(alW / 2);
  const alY = corkY - alH;
  // body
  ctx.fillStyle = "#dde9e4";
  ctx.fillRect(alX, alY, alW, alH);
  // water in the lower half
  ctx.fillStyle = "#7fc6e0";
  ctx.fillRect(alX, alY + Math.round(alH * 0.55), alW, Math.round(alH * 0.4));
  // edges
  ctx.fillStyle = "#2e2336";
  ctx.fillRect(alX, alY, 1, alH);
  ctx.fillRect(alX + alW - 1, alY, 1, alH);
  ctx.fillRect(alX, alY, alW, 1);
  ctx.fillRect(alX, alY + alH - 1, alW, 1);
  // floating cap dividing water from air
  ctx.fillStyle = "#9c947f";
  ctx.fillRect(alX + 1, alY + Math.round(alH * 0.5), alW - 2, 1);
  // vent stub on top
  ctx.fillStyle = "#2e2336";
  ctx.fillRect(neck.cx, alY - 3, 1, 3);
  ctx.fillRect(neck.cx - 1, alY - 4, 3, 1);

  // tube from cork into airlock
  ctx.fillStyle = "#2e2336";
  ctx.fillRect(neck.cx - 1, corkY - 1, 1, 1);
  ctx.fillRect(neck.cx + 1, corkY - 1, 1, 1);
  ctx.fillStyle = "#dde9e4";
  ctx.fillRect(neck.cx, corkY - 1, 1, 1);

  void phase; void hasLiquid;
}

function bubbleLayer(
  meta: Meta, liquidTop: number, liquidBottom: number, viz: PhaseViz,
  vessel: VesselKind, honeyType: HoneyType, phase: PhaseName, t: number,
): HTMLCanvasElement | null {
  if (viz.bubbles === 0) return null;
  const c = document.createElement("canvas");
  c.width = meta.w; c.height = meta.h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const seed = seedFrom(`${vessel}|${honeyType}|${phase}|bub`);
  const rng = mulberry(seed);
  // freeze starting positions per bubble so they wiggle but don't jitter
  const pad = Math.round(meta.interior.w * 0.18);
  const x0 = meta.interior.x + pad;
  const x1 = meta.interior.x + meta.interior.w - pad;
  const top = liquidTop + Math.min(14, (liquidBottom - liquidTop) * 0.15);
  const bot = liquidBottom - Math.min(18, (liquidBottom - liquidTop) * 0.18);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  for (let i = 0; i < viz.bubbles; i++) {
    const x = Math.round(x0 + rng() * (x1 - x0));
    const speed = viz.speed * (0.7 + rng() * 0.6);
    const off = rng();
    const big = rng() > 0.78;
    const prog = ((t / speed) + off) % 1;
    if (prog < 0.04 || prog > 0.96) continue;
    const y = Math.round(bot + (top - bot) * prog);
    const wob = Math.round(Math.sin((t + off * 6) * 3) * 1.5);
    const px = x + wob;
    ctx.fillRect(px, y, 1, 1);
    if (big) {
      ctx.fillRect(px + 1, y, 1, 1);
      ctx.fillRect(px, y - 1, 1, 1);
    }
  }
  return c;
}

function drawAirlockBubble(ctx: CanvasRenderingContext2D, meta: Meta, t: number) {
  const { neck } = meta;
  const corkW = Math.max(neck.width + 6, 18);
  const corkH = Math.max(12, Math.round(neck.width * 0.7));
  const corkY = neck.y_top - Math.round(corkH * 0.45);
  const alH = Math.max(22, Math.round(corkH * 2.2));
  const alY = corkY - alH;
  const wTop = alY + Math.round(alH * 0.55);
  const wBot = alY + Math.round(alH * 0.92);
  const prog = (t / 1.4) % 1;
  const y = Math.round(wBot + (wTop - wBot) * prog);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(neck.cx, y, 1, 1);
}
