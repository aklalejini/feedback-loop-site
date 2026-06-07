"use client";
import { useEffect, useState } from "react";

// The two wall torches are baked into the fixed `cover` background image. To
// make them look like they're burning, we overlay a soft warm glow on each
// flame and flicker it in CSS. The tricky part is that a `background-size:cover`
// image is scaled + cropped differently per viewport, so a fixed CSS percentage
// would drift off the flames. Here we replicate the cover transform in JS and
// place each glow at the flame's exact on-screen position, updating on resize.

const IMG_W = 1672;
const IMG_H = 941;
// flame centres in image pixels (measured from bg-dungeon.png)
const FLAMES = [
  { x: 106, y: 511 },
  { x: 1555, y: 513 },
];

export function Torchlight() {
  const [pts, setPts] = useState<{ x: number; y: number }[] | null>(null);

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // background-size: cover  → scale so both dimensions are covered
      const scale = Math.max(vw / IMG_W, vh / IMG_H);
      const dispW = IMG_W * scale;
      // background-position: center top  → centred horizontally, top-anchored
      const offX = (vw - dispW) / 2;
      const offY = 0;
      setPts(FLAMES.map((f) => ({ x: offX + f.x * scale, y: offY + f.y * scale })));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  if (!pts) return null;
  return (
    <div className="torchlight" aria-hidden>
      {pts.map((p, i) => (
        <span
          key={i}
          className={`torch-glow ${i === 0 ? "tg-a" : "tg-b"}`}
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
        />
      ))}
    </div>
  );
}
