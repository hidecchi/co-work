#!/usr/bin/env python3
"""Build a clean A1 (594mm x 841mm) ONE COIN coworking poster."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
SRC_POSTER = ROOT / "source-poster.png"
SRC_QR = ROOT / "source-qr.png"
FALLBACK_POSTER = Path(
    "/home/ubuntu/.cursor/projects/workspace/assets/4b4d3d7a-7a3e-4b2f-b1e7-32abbec80c14.png"
)
FALLBACK_QR = Path(
    "/home/ubuntu/.cursor/projects/workspace/assets/75ca4b81-bf9a-4853-80c1-348399df3ad7.png"
)

DPI = 300
A1_MM = (594, 841)
A1_PX = (
    round(A1_MM[0] / 25.4 * DPI),
    round(A1_MM[1] / 25.4 * DPI),
)

# Original poster has a gray rounded-rect stroke around the edge.
FRAME_CROP = (10, 10, 974, 1586)

# Keep a little cream around the ink when trimming extra top/bottom padding.
INK_PAD_PX = 10
PAPER_MARGIN_MM = 6
# A1 is wider than the artwork. Stretch width only so left/right
# margins match the top/bottom, without clipping logo or URL.
SIDE_MARGIN_MM = 10

# QR module box on the UNCROPPED original image.
OLD_QR = (798, 1354, 910, 1467)
QR_COVER = (775, 1330, 932, 1482)


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def poster_background(crop: np.ndarray) -> tuple[int, int, int]:
    pixels = crop.reshape(-1, 3)
    near_white = pixels[pixels.min(axis=1) > 240]
    sample = near_white if len(near_white) else pixels
    med = np.median(sample, axis=0).astype(np.uint8)
    return int(med[0]), int(med[1]), int(med[2])


def extract_qr_modules(qr_img: Image.Image) -> Image.Image:
    arr = np.array(qr_img.convert("RGB"))
    gray = arr.mean(axis=2)
    ys, xs = np.where(gray < 40)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    modules = arr[y0:y1, x0:x1]
    g = modules.mean(axis=2)
    binary = np.where(g < 128, 0, 255).astype(np.uint8)
    modules = np.stack([binary, binary, binary], axis=2)
    return Image.fromarray(modules, "RGB")


def render_qr(modules: Image.Image, module_px: int, quiet_px: int, bg: tuple[int, int, int]) -> Image.Image:
    scaled = modules.resize((module_px, module_px), Image.Resampling.NEAREST)
    side = module_px + quiet_px * 2
    canvas = Image.new("RGB", (side, side), bg)
    arr = np.array(scaled)
    mask = arr.mean(axis=2) < 128
    out = np.array(scaled)
    out[mask] = (20, 20, 20)
    out[~mask] = bg
    canvas.paste(Image.fromarray(out, "RGB"), (quiet_px, quiet_px))
    return canvas


def ink_bbox(arr: np.ndarray, bg: tuple[int, int, int], threshold: int = 18) -> tuple[int, int, int, int]:
    diff = np.abs(arr.astype(np.int16) - np.array(bg, dtype=np.int16)).max(axis=2)
    ys, xs = np.where(diff > threshold)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def build() -> None:
    poster_path = SRC_POSTER if SRC_POSTER.exists() else FALLBACK_POSTER
    qr_path = SRC_QR if SRC_QR.exists() else FALLBACK_QR

    original = load_rgb(poster_path)
    qr_src = Image.open(qr_path)

    framed = original.crop(FRAME_CROP)
    ox, oy = FRAME_CROP[0], FRAME_CROP[1]
    bg = poster_background(np.array(framed))

    draw = ImageDraw.Draw(framed)
    draw.rectangle(
        (QR_COVER[0] - ox, QR_COVER[1] - oy, QR_COVER[2] - ox, QR_COVER[3] - oy),
        fill=bg,
    )
    framed_arr = np.array(framed)

    _ix0, iy0, _ix1, iy1 = ink_bbox(framed_arr, bg)
    top = max(0, iy0 - INK_PAD_PX)
    bottom = min(framed.height, iy1 + INK_PAD_PX)
    cropped = framed.crop((0, top, framed.width, bottom))
    src_x, src_y = ox, oy + top

    a1 = Image.new("RGB", A1_PX, bg)
    inset_y = round(PAPER_MARGIN_MM / 25.4 * DPI)
    inset_x = round(SIDE_MARGIN_MM / 25.4 * DPI)
    target_h = A1_PX[1] - inset_y * 2
    target_w = A1_PX[0] - inset_x * 2
    scale_y = target_h / cropped.height
    scale_x = target_w / cropped.width
    content = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

    x = inset_x
    y = inset_y
    a1.paste(content, (x, y))

    modules = extract_qr_modules(qr_src)
    old_w = OLD_QR[2] - OLD_QR[0]
    old_h = OLD_QR[3] - OLD_QR[1]
    old_cx = (OLD_QR[0] + OLD_QR[2]) / 2 - src_x
    old_cy = (OLD_QR[1] + OLD_QR[3]) / 2 - src_y
    # Keep the QR square; size it from the vertical scale.
    module_px = max(1, round(((old_w + old_h) / 2) * scale_y))
    quiet_px = max(8, round(module_px * 0.12))
    qr_final = render_qr(modules, module_px, quiet_px, bg)

    paste_x = x + round(old_cx * scale_x) - qr_final.width // 2
    paste_y = y + round(old_cy * scale_y) - qr_final.height // 2
    a1.paste(qr_final, (paste_x, paste_y))

    out_png = ROOT / "one-coin-poster-a1.png"
    out_pdf = ROOT / "one-coin-poster-a1.pdf"
    preview = ROOT / "one-coin-poster-a1-preview.png"

    a1.save(out_png, "PNG", dpi=(DPI, DPI))
    a1.save(out_pdf, "PDF", resolution=DPI, title="ONE COIN コワーキング")

    preview_w = 1200
    preview_h = round(preview_w * A1_PX[1] / A1_PX[0])
    a1.resize((preview_w, preview_h), Image.Resampling.LANCZOS).save(preview, "PNG")

    print(f"A1 px: {A1_PX}")
    print(f"trimmed source: {cropped.size} (top {top}px, bottom cut {framed.height - bottom}px)")
    print(f"content: {content.size} at ({x}, {y})")
    print(f"side {x / DPI * 25.4:.1f}mm  top {y / DPI * 25.4:.1f}mm")
    print(f"QR: {qr_final.size} at ({paste_x}, {paste_y})")
    print(f"wrote {out_png}")
    print(f"wrote {out_pdf}")
    print(f"wrote {preview}")


if __name__ == "__main__":
    build()
