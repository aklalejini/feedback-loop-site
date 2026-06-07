"""Process raw vessel art into web-ready sprite + mask + metadata.

For each entry in JOBS:
  in:  web/public/vessels/raw/<source filename>
  out: web/public/vessels/<kind>.png           - RGBA glass shell (full art kept;
                                                  only background + handle hole
                                                  are transparent). Composited
                                                  over the liquid with MULTIPLY.
       web/public/vessels/<kind>.mask.png      - interior cavity (clips liquid)
       web/public/vessels/<kind>.meta.json     - bg colour, neck, interior, fill

The sprite + mask are downsampled to MAX_W wide so they don't bloat the bundle.
SpriteVessel.tsx reads these at runtime.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import (
    binary_closing,
    binary_dilation,
    binary_fill_holes,
    label as cc_label,
)

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "web" / "public" / "vessels" / "raw"
OUT_DIR = ROOT / "web" / "public" / "vessels"

MAX_W = 480
HEADROOM = 60  # transparent rows added above the vessel for the procedural airlock

# `art_airlock`: the source art already includes its own lid + airlock, so the
#   renderer must NOT draw the procedural cork/airlock (and needs no headroom).
# `solid`: opaque vessel (bucket) — you can't see in, so no interior/liquid.
JOBS = [
    {"src": "1 Gallon Mason Jar Empty.png", "kind": "jar-1gal", "art_airlock": True},
    {"src": "5 Gallon Bucket Empty.png", "kind": "bucket-5gal", "art_airlock": True, "solid": True},
]


def detect_bg_color(arr: np.ndarray) -> np.ndarray:
    """Mean of the four corner pixels (10px sample)."""
    h, w = arr.shape[:2]
    s = 10
    samples = np.concatenate([
        arr[:s, :s, :3].reshape(-1, 3),
        arr[:s, w - s:, :3].reshape(-1, 3),
        arr[h - s:, :s, :3].reshape(-1, 3),
        arr[h - s:, w - s:, :3].reshape(-1, 3),
    ])
    return samples.mean(axis=0)


def process(src_path: Path, kind: str, *, solid: bool = False,
            art_airlock: bool = False) -> dict:
    headroom = 0 if art_airlock else HEADROOM
    im = Image.open(src_path).convert("RGB")
    w0, h0 = im.size

    # downsample early; nothing here needs the full resolution
    if w0 > MAX_W:
        ratio = MAX_W / w0
        new_size = (MAX_W, round(h0 * ratio))
        im = im.resize(new_size, Image.LANCZOS)
    arr = np.array(im)
    h, w = arr.shape[:2]

    bg = detect_bg_color(arr)
    dist = np.linalg.norm(arr.astype(float) - bg, axis=2)
    bg_close = dist < 36  # tight: only the flat background colour

    # The source art usually includes a soft grey drop-shadow under the vessel.
    # It must be treated as background, otherwise it gets filled/painted and looks
    # like spilled mead. The shadow is DESATURATED and MID-VALUE grey bordering the
    # background; the glass is either tinted (saturated), dark (outline) or very
    # bright (highlights/clear interior), so this band isolates the shadow. The
    # enclosed cavity can't be reached by the corner flood through the dark outline,
    # so it is never removed even if some interior pixels fall in the band.
    mx = arr.max(axis=2).astype(float)
    mn = arr.min(axis=2).astype(float)
    val = mx / 255.0
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1.0), 0.0)
    shadowish = (sat < 0.10) & (val > 0.5) & (val < 0.93)
    floodable = bg_close | shadowish

    # Background/shadow = the floodable region reachable from the corners.
    labeled, _ = cc_label(floodable)
    bg_labels = {
        int(labeled[0, 0]), int(labeled[0, w - 1]),
        int(labeled[h - 1, 0]), int(labeled[h - 1, w - 1]),
    }
    bg_mask = np.isin(labeled, list(bg_labels))

    # Vessel mask = the inverse (solid silhouette: glass walls + cavity + ribs).
    vessel_mask = ~bg_mask

    if solid:
        # An opaque vessel (bucket) is ~the background colour, so the corner flood
        # can't separate it. Instead take the region enclosed by the drawn outline:
        # off-background "structure" pixels, lightly sealed, hole-filled, then the
        # largest component. The detached drop-shadow falls away as its own blob.
        structure = binary_closing(dist > 20, np.ones((3, 3), bool), iterations=1)
        filled = binary_fill_holes(structure)
        slbl, _ = cc_label(filled)
        ssz = np.bincount(slbl.ravel())
        ssz[0] = 0
        vessel_mask = (slbl == int(ssz.argmax())) if ssz.size > 1 else filled

    # Interior cavity = light pixels INSIDE the silhouette. Looser threshold so the
    # glass-tinted interior near the walls is included, not just the bright centre.
    # Opaque vessels (buckets) have no visible interior — skip entirely.
    interior_mask = np.zeros_like(vessel_mask)
    if not solid:
        light = dist < 78
        interior_candidate = vessel_mask & light
        # Bridge structural ribs / dividers (e.g. the 5-gallon carboy's bands) so the
        # cavity reads as ONE region instead of a grid of disconnected cells.
        closed = binary_closing(interior_candidate, structure=np.ones((3, 3), bool), iterations=8)
        closed &= vessel_mask
        interior_labeled, _ = cc_label(closed)
        sizes = np.bincount(interior_labeled.ravel())
        sizes[0] = 0  # ignore background label
        if sizes.size > 1 and sizes.max() > 0:
            # largest enclosed region = the cavity; small ones (handle hole) are dropped
            interior_mask = (interior_labeled == sizes.argmax())
            interior_mask = binary_fill_holes(interior_mask)

    # Build RGBA sprite: KEEP the entire glass (tint, highlights, ribs, shading)
    # so it can be composited over the liquid with a multiply blend. Only the
    # exterior background and any enclosed background pockets (e.g. the hole in
    # the jug handle) become transparent. We do NOT carve the interior cavity —
    # carving it was what destroyed the glass art.
    # Carve enclosed background pockets (e.g. the hole in a jug handle) out of the
    # sprite. NOT for solid vessels — their whole opaque body is bg-coloured and
    # would be punched out.
    keep_holes = np.zeros_like(vessel_mask)
    if not solid:
        enclosed_bg = (dist < 38) & vessel_mask  # cream pixels inside the silhouette
        holes = enclosed_bg & ~binary_dilation(interior_mask, iterations=5)
        # keep only reasonably-sized holes (the handle loop), drop stray speckle
        holes_lbl, _ = cc_label(holes)
        hsizes = np.bincount(holes_lbl.ravel())
        hsizes[0] = 0
        for lab in np.where(hsizes > 40)[0]:
            keep_holes |= (holes_lbl == lab)
    alpha = np.where(vessel_mask & ~keep_holes, 255, 0).astype(np.uint8)
    rgba = np.concatenate([arr, alpha[..., None]], axis=2)

    # Detect neck opening: scan from the top of the vessel mask, find the
    # first row that has the silhouette, then walk down until the run widens
    # significantly. The narrow band is the neck.
    rows_with_vessel = np.where(vessel_mask.any(axis=1))[0]
    top_y = int(rows_with_vessel[0]) if rows_with_vessel.size else 0

    def row_width(y: int) -> tuple[int, int]:
        cols = np.where(vessel_mask[y])[0]
        return (int(cols.min()), int(cols.max())) if cols.size else (0, 0)

    neck_top = top_y
    neck_w_top = row_width(top_y)[1] - row_width(top_y)[0]
    # body width = widest row in the image
    body_w = max(
        row_width(y)[1] - row_width(y)[0]
        for y in range(top_y, h, 8)
    )
    threshold = neck_w_top + (body_w - neck_w_top) * 0.4
    neck_bottom = top_y
    for y in range(top_y, h):
        l, r = row_width(y)
        if (r - l) > threshold:
            neck_bottom = y
            break
    l_top, r_top = row_width(top_y)
    neck_cx = (l_top + r_top) // 2
    neck_w = max(8, r_top - l_top)

    # Interior bbox
    ys, xs = np.where(interior_mask)
    if ys.size:
        ibbox = {
            "x": int(xs.min()), "y": int(ys.min()),
            "w": int(xs.max() - xs.min() + 1),
            "h": int(ys.max() - ys.min() + 1),
        }
    else:
        ibbox = {"x": 0, "y": 0, "w": w, "h": h}

    # Fill range: liquid sits between the top of the STRAIGHT BODY (below the
    # narrowing shoulder/neck) and the cavity bottom. For glass vessels we use the
    # interior cavity; for SOLID vessels there is no cavity, so the body band is
    # taken from the silhouette itself — the rows whose width is close to the max
    # are the cylindrical body wall (above the base shadow, below the lid lip).
    if solid:
        row_w = vessel_mask.sum(axis=1).astype(int)
        max_w = int(row_w.max()) if row_w.size else 0
        body_rows_idx = np.where(row_w >= 0.93 * max_w)[0]
        if body_rows_idx.size and max_w > 0:
            fill_top = int(body_rows_idx.min())
            fill_bottom = int(body_rows_idx.max())
            cols = np.where(vessel_mask[(fill_top + fill_bottom) // 2])[0]
            body_bbox = {"x": int(cols.min()), "w": int(cols.max() - cols.min() + 1)}
        else:
            fill_top = int(ibbox["y"])
            fill_bottom = int(ibbox["y"] + ibbox["h"] - 1)
            body_bbox = {"x": ibbox["x"], "w": ibbox["w"]}
    else:
        row_w = np.array([int(interior_mask[y].sum()) for y in range(h)])
        nz = np.where(row_w > 0)[0]
        if nz.size:
            cav_top, cav_bot = int(nz[0]), int(nz[-1])
            ch = cav_bot - cav_top
            mid = row_w[cav_top + int(0.2 * ch): cav_top + int(0.8 * ch) + 1]
            mid = mid[mid > 0]
            body_med = float(np.median(mid)) if mid.size else float(row_w.max())
            top_candidates = np.where(row_w >= 0.8 * body_med)[0]
            fill_top = int(top_candidates[0]) if top_candidates.size else cav_top
            bot_candidates = np.where(row_w >= 0.5 * body_med)[0]
            fill_bottom = int(bot_candidates[-1]) if bot_candidates.size else cav_bot
        else:
            fill_top = int(ibbox["y"])
            fill_bottom = int(ibbox["y"] + ibbox["h"] - 1)

        body_rows = interior_mask[fill_top:fill_bottom + 1]
        bxs = np.where(body_rows.any(axis=0))[0]
        if bxs.size:
            body_bbox = {"x": int(bxs.min()), "w": int(bxs.max() - bxs.min() + 1)}
        else:
            body_bbox = {"x": ibbox["x"], "w": ibbox["w"]}

    # For solid vessels the "interior" placeholder should also reflect the body
    # band, so callers reading meta.interior get sensible numbers.
    if solid:
        ibbox = {"x": body_bbox["x"], "y": fill_top, "w": body_bbox["w"], "h": fill_bottom - fill_top + 1}

    # Pad top with headroom transparent rows so the procedural cork + airlock
    # have somewhere to live above the imported vessel.
    rgba_padded = np.zeros((h + headroom, w, 4), dtype=np.uint8)
    rgba_padded[headroom:, :, :] = rgba
    mask_a = (interior_mask.astype(np.uint8) * 255)
    mask_padded = np.zeros((h + headroom, w), dtype=np.uint8)
    mask_padded[headroom:, :] = mask_a

    meta = {
        "w": w,
        "h": h + headroom,
        "headroom": headroom,
        "bg": [int(bg[0]), int(bg[1]), int(bg[2])],
        "neck": {
            "cx": neck_cx,
            "y_top": neck_top + headroom,
            "y_bottom": neck_bottom + headroom,
            "width": neck_w,
        },
        "interior": {
            "x": ibbox["x"],
            "y": ibbox["y"] + headroom,
            "w": ibbox["w"],
            "h": ibbox["h"],
        },
        "fill": {
            "top": fill_top + headroom,
            "bottom": fill_bottom + headroom,
            "x": body_bbox["x"],
            "w": body_bbox["w"],
        },
        # the art already includes a lid/airlock → renderer skips the procedural one
        "artAirlock": bool(art_airlock),
        # opaque vessel → no liquid drawn (you can't see in)
        "solid": bool(solid),
    }

    sprite_path = OUT_DIR / f"{kind}.png"
    mask_path = OUT_DIR / f"{kind}.mask.png"
    meta_path = OUT_DIR / f"{kind}.meta.json"
    Image.fromarray(rgba_padded, "RGBA").save(sprite_path, optimize=True)
    # Save mask as RGBA with alpha = mask value, so canvas
    # globalCompositeOperation = 'destination-in' clips properly.
    mask_rgba = np.zeros((h + headroom, w, 4), dtype=np.uint8)
    mask_rgba[..., :3] = 255
    mask_rgba[..., 3] = mask_padded
    Image.fromarray(mask_rgba, "RGBA").save(mask_path, optimize=True)
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta


def main() -> int:
    for job in JOBS:
        src = RAW_DIR / job["src"]
        if not src.exists():
            print(f"  skip {job['kind']} (no source: {src.name})")
            continue
        meta = process(src, job["kind"],
                       solid=job.get("solid", False),
                       art_airlock=job.get("art_airlock", False))
        print(f"  {job['kind']:14}  {meta['w']}x{meta['h']}  solid={meta['solid']} "
              f"artAirlock={meta['artAirlock']}  interior h={meta['interior']['h']} "
              f"fill {meta['fill']['top']}-{meta['fill']['bottom']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
