"use client";
import { useEffect, useRef } from "react";

// Procedural fire on top of the baked-in wall torches. Each torch gets a
// flickering layered flame and a stream of small orange→red→black pixel embers
// rising above it. Everything is drawn on a single fixed canvas behind the
// content (z-index:-1, pointer-events:none) and the flames are anchored to the
// actual flame positions in the background image (which scales with `cover`),
// so they track the painted torches at every viewport size.

const IMG_W = 1672;
const IMG_H = 941;

// Each torch: cx in image px, y_base = bottom of painted flame (torch holder
// top), and H_paint = the painted flame's vertical extent — used to size the
// animated flame so it covers + slightly extends the painted one.
const TORCHES = [
  { cx: 107, y_base: 578, H_paint: 119 },
  { cx: 1557, y_base: 560, H_paint: 102 },
];

interface Ember {
  x: number; y: number;        // CSS px
  vx: number; vy: number;      // CSS px / sec
  age: number;
  life: number;                // sec
  size: number;                // 1..3 px
  black: boolean;              // some embers cool to black before fading out
}

export function Torchlight() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas!.style.width = vw + "px";
      canvas!.style.height = vh + "px";
      canvas!.width = Math.floor(vw * dpr);
      canvas!.height = Math.floor(vh * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Per-torch state: screen-space anchor + ember pool + spawn timer.
    interface TorchState {
      cx: number;
      yBase: number;
      H: number;          // animated flame height in CSS px
      W: number;          // animated flame width in CSS px
      seed: number;       // wobble phase
      embers: Ember[];
      emit: number;       // accumulator for spawn rate
    }

    const torches: TorchState[] = TORCHES.map((t, i) => ({
      cx: 0, yBase: 0, H: 0, W: 0,
      seed: i * 2.31,
      embers: [],
      emit: 0,
    }));

    function placeTorches() {
      // background-size: cover, background-position: center top
      const scale = Math.max(vw / IMG_W, vh / IMG_H);
      const dispW = IMG_W * scale;
      const offX = (vw - dispW) / 2;
      for (let i = 0; i < TORCHES.length; i++) {
        const src = TORCHES[i];
        const t = torches[i];
        t.cx = offX + src.cx * scale;
        t.yBase = src.y_base * scale;
        // animated flame slightly taller than the painted one, sized in CSS px
        t.H = src.H_paint * scale * 1.05;
        t.W = 26 * scale;
      }
    }

    // simple seeded RNG so we don't waste alloc on Math.random nondeterminism
    function r() { return Math.random(); }

    function spawnEmber(t: TorchState) {
      const yTop = t.yBase - t.H * 0.85;
      t.embers.push({
        x: t.cx + (r() - 0.5) * t.W * 0.7,
        y: yTop + (r() - 0.5) * 6,
        vx: (r() - 0.5) * 14,
        vy: -28 - r() * 32,
        age: 0,
        life: 1.4 + r() * 1.6,
        size: r() < 0.28 ? 3 : 2,
        black: r() < 0.18,
      });
    }

    function flameLayer(
      cx: number, yBase: number, w: number, h: number,
      color: string, jitter: number, t: number, seed: number,
    ) {
      // Build a closed candle-flame silhouette: wider at the base, tapers to a
      // sharp point at the top, with organic side-sway that grows toward the
      // tip (so the bottom stays put on the torch). Left and right sides sway
      // independently for an asymmetric, alive feel.
      const N = 22;
      // a single "wind" phase that biases the whole flame slightly left/right
      const wind = Math.sin(t * 1.3 + seed * 0.7) * 0.6;
      ctx!.beginPath();
      // up the left side
      for (let i = 0; i <= N; i++) {
        const u = i / N; // 0 = base, 1 = tip
        const profile = Math.pow(Math.sin(Math.PI * (1 - u * 0.96)), 1.35);
        const swayL =
          Math.sin(t * 5.1 + seed + u * 4.2) * jitter * u +
          Math.sin(t * 9.7 + seed * 1.3 + u * 7) * jitter * 0.35 * u +
          wind * u * jitter * 0.8;
        ctx!.lineTo(cx - w * 0.5 * profile + swayL, yBase - h * u);
      }
      // down the right side (independent sway)
      for (let i = N; i >= 0; i--) {
        const u = i / N;
        const profile = Math.pow(Math.sin(Math.PI * (1 - u * 0.96)), 1.35);
        const swayR =
          Math.sin(t * 5.1 + seed + u * 4.2 + 1.8) * jitter * u +
          Math.sin(t * 9.7 + seed * 1.3 + u * 7 + 2.1) * jitter * 0.35 * u +
          wind * u * jitter * 0.8;
        ctx!.lineTo(cx + w * 0.5 * profile + swayR, yBase - h * u);
      }
      ctx!.closePath();
      ctx!.fillStyle = color;
      ctx!.fill();
    }

    function drawHalo(cx: number, cy: number, r: number, alpha: number) {
      const g = ctx!.createRadialGradient(cx, cy - 6, 2, cx, cy, r);
      g.addColorStop(0, `rgba(255, 220, 140, ${0.34 * alpha})`);
      g.addColorStop(0.32, `rgba(255, 150, 60, ${0.18 * alpha})`);
      g.addColorStop(0.7, `rgba(255, 110, 30, ${0.05 * alpha})`);
      g.addColorStop(1, "rgba(255, 100, 30, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    function drawTorch(t: TorchState, time: number, dt: number) {
      const cx = t.cx;
      const yBase = t.yBase;
      const flameCenterY = yBase - t.H * 0.5;

      // ambient halo on the wall — gentle slow breath
      const breath = 1 + Math.sin(time * 1.7 + t.seed) * 0.06;
      drawHalo(cx, flameCenterY + t.H * 0.1, t.H * 2.6, breath);

      // flame body — four additive layers
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";

      // outer dim red (large + slow)
      flameLayer(
        cx + Math.sin(time * 2.6 + t.seed) * 3,
        yBase,
        t.W * 1.6,
        t.H * 1.12 * (0.94 + Math.sin(time * 2.1 + t.seed * 1.3) * 0.09),
        "rgba(150, 36, 8, 0.6)",
        7,
        time,
        t.seed * 1.1,
      );

      // orange body
      flameLayer(
        cx + Math.sin(time * 4.4 + t.seed * 2.1) * 2.4,
        yBase - 2,
        t.W * 1.0,
        t.H * (0.92 + Math.sin(time * 3.7 + t.seed) * 0.12),
        "rgba(232, 110, 26, 0.88)",
        5.5,
        time,
        t.seed * 1.7,
      );

      // yellow inner — sometimes splits into a wisp
      flameLayer(
        cx + Math.sin(time * 6.0 + t.seed * 3.3) * 1.6,
        yBase - 4,
        t.W * 0.6,
        t.H * (0.74 + Math.sin(time * 5.2 + t.seed * 2.1) * 0.14),
        "rgba(255, 206, 96, 0.95)",
        4,
        time,
        t.seed * 2.5,
      );

      // white-hot tip (often visible, dances most)
      const tip = Math.sin(time * 4 + t.seed) * 0.5 + 0.5;
      if (tip > 0.15) {
        flameLayer(
          cx + Math.sin(time * 8 + t.seed) * 1.4,
          yBase - 6,
          t.W * 0.34,
          t.H * (0.5 + tip * 0.22),
          `rgba(255, 250, 210, ${0.55 + tip * 0.35})`,
          2.6,
          time,
          t.seed * 3.6,
        );
      }
      ctx!.restore();

      // ember spawn rate (8–14 per second per torch — clearly visible stream)
      t.emit += dt;
      const interval = 0.08 + Math.random() * 0.06;
      while (t.emit >= interval) {
        spawnEmber(t);
        t.emit -= interval;
      }

      // update + draw embers (pixel-art squares, no AA)
      for (let i = t.embers.length - 1; i >= 0; i--) {
        const e = t.embers[i];
        e.age += dt;
        if (e.age >= e.life) {
          t.embers.splice(i, 1);
          continue;
        }
        // gentle x wobble (rising smoke drift)
        e.vx += Math.sin(e.age * 4 + e.size + i) * 8 * dt;
        e.vy += 6 * dt; // slight deceleration (gravity barely matters for embers but adds organic feel)
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        const u = e.age / e.life; // 0..1
        let col: string;
        if (e.black && u > 0.55) {
          // cooled cinder — small dark square fading out
          const a = (1 - (u - 0.55) / 0.45) * 0.9;
          col = `rgba(18, 12, 6, ${a})`;
        } else if (u < 0.18) {
          col = `rgba(255, 232, 138, ${1 - u * 0.4})`;
        } else if (u < 0.5) {
          const a = 1 - (u - 0.18) * 0.6;
          col = `rgba(240, 130, 28, ${a})`;
        } else {
          const a = (1 - u) * 0.8;
          col = `rgba(160, 50, 10, ${a})`;
        }
        ctx!.fillStyle = col;
        ctx!.fillRect(Math.round(e.x), Math.round(e.y), e.size, e.size);
      }
    }

    let raf = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      ctx.clearRect(0, 0, vw, vh);
      placeTorches();
      for (const t of torches) drawTorch(t, now / 1000, dt);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      // Static glow only — respect the user's preference.
      placeTorches();
      ctx.clearRect(0, 0, vw, vh);
      for (const t of torches) {
        drawHalo(t.cx, t.yBase - t.H * 0.4, t.H * 2.6, 1);
      }
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
