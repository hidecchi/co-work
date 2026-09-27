#!/usr/bin/env python3
"""Build a clean A1 (594mm x 841mm) ONE COIN coworking poster."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
# Source files live next to this script after copy, with fallbacks for the agent workspace.
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
# Crop inside that stroke so the dirty frame is gone.
CROP = (10, 10, 974, 1586)  # left, top, right, bottom (exclusive)

# QR module box on the UNCROPPED original image.
OLD_QR = (798, 1354, 910, 1467)

# Cover a bit extra around the old QR so leftover modules do not show.
QR_COVER = (775, 1330, 932, 1482)


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def poster_background(crop: np.ndarray) -> tuple[int, int, int]:
    """Median near-white pixel, used as the clean paper color."""
    pixels = crop.reshape(-1, 3)
    near_white = pixels[pixels.min(axis=1) > 240]
    sample = near_white if len(near_white) else pixels
    med = np.median(sample, axis=0).astype(np.uint8)
    return int(med[0]), int(med[1]), int(med[2])


def extract_qr_modules(qr_img: Image.Image) -> Image.Image:
    """Return a binary (1-bit-like) RGB crop of the QR module area."""
    arr = np.array(qr_img.convert("RGB"))
    gray = arr.mean(axis=2)
    ys, xs = np.where(gray < 40)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    modules = arr[y0:y1, x0:x1]
    # Force true black / white so scaling stays crisp.
    g = modules.mean(axis=2)
    binary = np.where(g < 128, 0, 255).astype(np.uint8)
    modules = np.stack([binary, binary, binary], axis=2)
    return Image.fromarray(modules, "RGB")


def render_qr(modules: Image.Image, module_px: int, quiet_px: int, bg: tuple[int, int, int]) -> Image.Image:
    """Scale QR modules with nearest-neighbor and add a quiet zone in the poster color."""
    scaled = modules.resize((module_px, module_px), Image.Resampling.NEAREST)
    side = module_px + quiet_px * 2
    canvas = Image.new("RGB", (side, side), bg)
    arr = np.array(scaled)
    mask = arr.mean(axis=2) < 128
    black = np.zeros_like(arr)
    black[..., :] = 20, 20, 20
    out = np.array(scaled)
    out[mask] = black[mask]
    out[~mask] = bg
    canvas.paste(Image.fromarray(out, "RGB"), (quiet_px, quiet_px))
    return canvas


def build() -> None:
    poster_path = SRC_POSTER if SRC_POSTER.exists() else FALLBACK_POSTER
    qr_path = SRC_QR if SRC_QR.exists() else FALLBACK_QR

    original = load_rgb(poster_path)
    qr_src = Image.open(qr_path)

    cropped = original.crop(CROP)
    crop_arr = np.array(cropped)
    bg = poster_background(crop_arr)

    # Erase old QR on the cropped image.
    ox, oy = CROP[0], CROP[1]
    cover = (
        QR_COVER[0] - ox,
        QR_COVER[1] - oy,
        QR_COVER[2] - ox,
        QR_COVER[3] - oy,
    )
    draw = ImageDraw.Draw(cropped)
    draw.rectangle(cover, fill=bg)

    # A1 canvas
    a1 = Image.new("RGB", A1_PX, bg)

    # Fit content by height with even vertical inset; extra space goes to the sides.
    inset_mm = 8
    inset_px = round(inset_mm / 25.4 * DPI)
    target_h = A1_PX[1] - inset_px * 2
    scale = target_h / cropped.height
    target_w = round(cropped.width * scale)
    content = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

    x = (A1_PX[0] - target_w) // 2
    y = inset_px
    a1.paste(content, (x, y))

    # Place the new QR in the same visual spot, rendered at final resolution.
    modules = extract_qr_modules(qr_src)
    old_w = OLD_QR[2] - OLD_QR[0]
    old_h = OLD_QR[3] - OLD_QR[1]
    old_cx = (OLD_QR[0] + OLD_QR[2]) / 2 - ox
    old_cy = (OLD_QR[1] + OLD_QR[3]) / 2 - oy
    module_px = max(1, round(((old_w + old_h) / 2) * scale))
    quiet_px = max(8, round(module_px * 0.16))
    qr_final = render_qr(modules, module_px, quiet_px, bg)

    paste_x = x + round(old_cx * scale) - qr_final.width // 2
    paste_y = y + round(old_cy * scale) - qr_final.height // 2
    a1.paste(qr_final, (paste_x, paste_y))

    out_png = ROOT / "one-coin-poster-a1.png"
    out_pdf = ROOT / "one-coin-poster-a1.pdf"
    preview = ROOT / "one-coin-poster-a1-preview.png"

    a1.save(out_png, "PNG", dpi=(DPI, DPI))
    a1.save(out_pdf, "PDF", resolution=DPI, title="ONE COIN コワーキング")

    preview_w = 1200
    preview_h = round(preview_w * A1_PX[1] / A1_PX[0])
    a1.resize((preview_w, preview_h), Image.Resampling.LANCZOS).save(preview, "PNG")

    print(f"A1 px: {A1_PX} (ratio {A1_PX[0]/A1_PX[1]:.6f}, target {A1_MM[0]/A1_MM[1]:.6f})")
    print(f"content: {content.size} at ({x}, {y})")
    print(f"QR: {qr_final.size} at ({paste_x}, {paste_y}) modules={module_px}px")
    print(f"bg: {bg}")
    print(f"wrote {out_png}")
    print(f"wrote {out_pdf}")
    print(f"wrote {preview}")


if __name__ == "__main__":
    build()
