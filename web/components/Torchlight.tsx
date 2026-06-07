"use client";
import { useEffect, useRef } from "react";

// Procedural PIXELATED fire on top of the baked-in wall torches. Each torch gets
// a flickering layered flame plus a stream of rising orange→red→black pixel
// embers. Everything is drawn into a low-resolution offscreen buffer and then
// blitted upscaled with smoothing OFF, so the fire reads as chunky pixel art to
// match the game aesthetic.
//
// The flame originates at the *cup mouth* of each torch (measured from the
// background art) and only draws upward from there, so the holder/bracket below
// shows through (the canvas is transparent there and the painted torch sits in
// the background behind it) — the fire looks like it's burning inside the cup
// rather than pasted across the top.
//
// Flame anchors are recomputed each frame from the background's `cover`
// transform, so they stay locked to the painted torches at every viewport size.

const IMG_W = 1672;
const IMG_H = 941;

// cx = flame centre, yCup = cup mouth (where flame emerges), hPaint = painted
// flame height — all in source-image pixels.
const TORCHES = [
  { cx: 107, yCup: 550, hPaint: 120 },
  { cx: 1557, yCup: 549, hPaint: 110 },
];

// screen px per fire-pixel (chunkiness of the pixel-art fire)
const PIX = 3;

interface Ember {
  x: number; y: number;        // screen px
  vx: number; vy: number;      // screen px / sec
  age: number; life: number;   // sec
  size: number;                // buffer px (1–2) → PIX*size screen px
  black: boolean;              // cools to a dark cinder before fading
}

interface TorchState {
  cx: number;     // screen px
  yBase: number;  // screen px (cup mouth)
  H: number;      // flame height, screen px
  W: number;      // flame base half-extent driver, screen px
  seed: number;
  embers: Ember[];
  emit: number;
}

export function Torchlight() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // low-res buffer for the pixelated fire
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d");
    if (!bctx) return;

    let dpr = 1, vw = 0, vh = 0, bw = 0, bh = 0;

    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas!.style.width = vw + "px";
      canvas!.style.height = vh + "px";
      canvas!.width = Math.floor(vw * dpr);
      canvas!.height = Math.floor(vh * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.imageSmoothingEnabled = false;
      bw = Math.max(1, Math.ceil(vw / PIX));
      bh = Math.max(1, Math.ceil(vh / PIX));
      buf.width = bw;
      buf.height = bh;
    }
    resize();
    window.addEventListener("resize", resize);

    const torches: TorchState[] = TORCHES.map((_, i) => ({
      cx: 0, yBase: 0, H: 0, W: 0, seed: i * 2.31, embers: [], emit: 0,
    }));

    function placeTorches() {
      const scale = Math.max(vw / IMG_W, vh / IMG_H);
      const offX = (vw - IMG_W * scale) / 2; // background-position: center top
      for (let i = 0; i < TORCHES.length; i++) {
        const s = TORCHES[i];
        const t = torches[i];
        t.cx = (offX + s.cx * scale) / PIX;   // buffer coords
        t.yBase = (s.yCup * scale) / PIX;
        t.H = (s.hPaint * scale * 1.08) / PIX;
        t.W = (22 * scale) / PIX;
      }
    }

    // Closed flame silhouette (leaf-like: pinched at the cup, fat in the middle,
    // tapering to a dancing tip). Left/right edges sway independently + a slow
    // shared "wind" so it never looks symmetric. All in buffer coords.
    function flameLayer(
      cx: number, yBase: number, w: number, h: number,
      color: string, jitter: number, t: number, seed: number,
    ) {
      const N = 22;
      const wind = Math.sin(t * 1.3 + seed * 0.7) * 0.6;
      bctx!.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const profile = Math.pow(Math.sin(Math.PI * (1 - u * 0.96)), 1.35);
        const sway =
          Math.sin(t * 5.1 + seed + u * 4.2) * jitter * u +
          Math.sin(t * 9.7 + seed * 1.3 + u * 7) * jitter * 0.35 * u +
          wind * u * jitter * 0.8;
        bctx!.lineTo(cx - w * 0.5 * profile + sway, yBase - h * u);
      }
      for (let i = N; i >= 0; i--) {
        const u = i / N;
        const profile = Math.pow(Math.sin(Math.PI * (1 - u * 0.96)), 1.35);
        const sway =
          Math.sin(t * 5.1 + seed + u * 4.2 + 1.8) * jitter * u +
          Math.sin(t * 9.7 + seed * 1.3 + u * 7 + 2.1) * jitter * 0.35 * u +
          wind * u * jitter * 0.8;
        bctx!.lineTo(cx + w * 0.5 * profile + sway, yBase - h * u);
      }
      bctx!.closePath();
      bctx!.fillStyle = color;
      bctx!.fill();
    }

    function drawHalo(cx: number, cy: number, r: number, alpha: number) {
      const g = bctx!.createRadialGradient(cx, cy - 2, 1, cx, cy, r);
      g.addColorStop(0, `rgba(255, 220, 140, ${0.32 * alpha})`);
      g.addColorStop(0.32, `rgba(255, 150, 60, ${0.17 * alpha})`);
      g.addColorStop(0.7, `rgba(255, 110, 30, ${0.05 * alpha})`);
      g.addColorStop(1, "rgba(255, 100, 30, 0)");
      bctx!.fillStyle = g;
      bctx!.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    function drawFlame(t: TorchState, time: number) {
      const cx = t.cx, yBase = t.yBase;
      const breath = 1 + Math.sin(time * 1.7 + t.seed) * 0.06;
      drawHalo(cx, yBase - t.H * 0.4, t.H * 2.6, breath);

      bctx!.save();
      bctx!.globalCompositeOperation = "lighter";
      // outer dim red
      flameLayer(
        cx + Math.sin(time * 2.6 + t.seed) * (3 / PIX), yBase,
        t.W * 1.6, t.H * 1.12 * (0.94 + Math.sin(time * 2.1 + t.seed * 1.3) * 0.09),
        "rgba(150, 36, 8, 0.6)", 7 / PIX, time, t.seed * 1.1,
      );
      // orange body
      flameLayer(
        cx + Math.sin(time * 4.4 + t.seed * 2.1) * (2.4 / PIX), yBase - 2 / PIX,
        t.W * 1.0, t.H * (0.92 + Math.sin(time * 3.7 + t.seed) * 0.12),
        "rgba(232, 110, 26, 0.9)", 5.5 / PIX, time, t.seed * 1.7,
      );
      // yellow inner
      flameLayer(
        cx + Math.sin(time * 6.0 + t.seed * 3.3) * (1.6 / PIX), yBase - 4 / PIX,
        t.W * 0.6, t.H * (0.74 + Math.sin(time * 5.2 + t.seed * 2.1) * 0.14),
        "rgba(255, 206, 96, 0.95)", 4 / PIX, time, t.seed * 2.5,
      );
      // white-hot core (intermittent, dances most)
      const tip = Math.sin(time * 4 + t.seed) * 0.5 + 0.5;
      if (tip > 0.15) {
        flameLayer(
          cx + Math.sin(time * 8 + t.seed) * (1.4 / PIX), yBase - 6 / PIX,
          t.W * 0.34, t.H * (0.5 + tip * 0.22),
          `rgba(255, 250, 210, ${0.55 + tip * 0.35})`, 2.6 / PIX, time, t.seed * 3.6,
        );
      }
      bctx!.restore();
    }

    function spawnEmber(t: TorchState) {
      const yTopScreen = (t.yBase - t.H * 0.8) * PIX;
      const cxScreen = t.cx * PIX;
      const wScreen = t.W * PIX;
      t.embers.push({
        x: cxScreen + (Math.random() - 0.5) * wScreen * 0.9,
        y: yTopScreen + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 16,
        vy: -34 - Math.random() * 42,
        age: 0,
        life: 1.8 + Math.random() * 1.8,
        size: Math.random() < 0.3 ? 2 : 1,
        black: Math.random() < 0.2,
      });
    }

    function drawEmbers(t: TorchState, dt: number) {
      // spawn (≈8–14 / sec)
      t.emit += dt;
      const interval = 0.08 + Math.random() * 0.06;
      while (t.emit >= interval) { spawnEmber(t); t.emit -= interval; }

      for (let i = t.embers.length - 1; i >= 0; i--) {
        const e = t.embers[i];
        e.age += dt;
        if (e.age >= e.life) { t.embers.splice(i, 1); continue; }
        e.vx += Math.sin(e.age * 4 + i) * 9 * dt; // drifting wobble as it rises
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        const u = e.age / e.life;
        let col: string;
        if (e.black && u > 0.55) {
          col = `rgba(20, 13, 7, ${(1 - (u - 0.55) / 0.45) * 0.9})`;
        } else if (u < 0.18) {
          col = `rgba(255, 232, 138, ${1 - u * 0.4})`;
        } else if (u < 0.5) {
          col = `rgba(240, 130, 28, ${1 - (u - 0.18) * 0.6})`;
        } else {
          col = `rgba(160, 50, 10, ${(1 - u) * 0.85})`;
        }
        bctx!.fillStyle = col;
        bctx!.fillRect(Math.round(e.x / PIX), Math.round(e.y / PIX), e.size, e.size);
      }
    }

    function frame(time: number, dt: number) {
      ctx!.clearRect(0, 0, vw, vh);
      bctx!.clearRect(0, 0, bw, bh);
      placeTorches();
      for (const t of torches) {
        drawFlame(t, time);
        drawEmbers(t, dt);
      }
      // blit the low-res buffer upscaled, nearest-neighbour → pixelated
      ctx!.imageSmoothingEnabled = false;
      ctx!.drawImage(buf, 0, 0, bw, bh, 0, 0, vw, vh);
    }

    let raf = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      frame(now / 1000, dt);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      placeTorches();
      ctx.clearRect(0, 0, vw, vh);
      bctx.clearRect(0, 0, bw, bh);
      for (const t of torches) drawFlame(t, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, vw, vh);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="torchlight-canvas" aria-hidden />;
}
