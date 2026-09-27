#!/usr/bin/env python3
"""Upscale the poster to A1 300dpi and write PNG + PDF."""

from pathlib import Path

import cv2
import img2pdf
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
DPI = 300
A1_MM = (594, 841)
A1_PX = (
    round(A1_MM[0] / 25.4 * DPI),
    round(A1_MM[1] / 25.4 * DPI),
)
A1_PT = (A1_MM[0] / 25.4 * 72, A1_MM[1] / 25.4 * 72)

# Latest user-provided design first.
CANDIDATES = [
    ROOT / "user-poster.png",
    Path("/home/ubuntu/.cursor/projects/workspace/assets/8ce06750-3743-4a7d-b88f-76c73571eea5.png"),
    Path("/home/ubuntu/.cursor/projects/workspace/assets/62cecc53-3ed1-4d3f-a9ee-985a3f54b6b5.png"),
    ROOT / "one-coin-poster-a1.png",
]
QR_SRC = ROOT / "source-qr.png"


def pick_source() -> Path:
    # Use the user-provided design (not the already-resized preview).
    preferred = CANDIDATES[0]
    if preferred.exists():
        return preferred
    existing = [p for p in CANDIDATES if p.exists()]
    if not existing:
        raise FileNotFoundError("no poster source found")
    return existing[0]


def stepwise_upscale(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """2x Lanczos steps, then final resize. Sharper than one huge jump."""
    w, h = im.size
    tw, th = size
    while w * 2 < tw and h * 2 < th:
        w, h = w * 2, h * 2
        im = im.resize((w, h), Image.Resampling.LANCZOS)
    return im.resize(size, Image.Resampling.LANCZOS)


def extract_qr_modules(qr_img: Image.Image) -> Image.Image:
    arr = np.array(qr_img.convert("RGB"))
    gray = arr.mean(axis=2)
    ys, xs = np.where(gray < 40)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    modules = arr[y0:y1, x0:x1]
    g = modules.mean(axis=2)
    binary = np.where(g < 128, 0, 255).astype(np.uint8)
    return Image.fromarray(np.stack([binary, binary, binary], axis=2), "RGB")


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


def replace_qr(poster: Image.Image, qr_src: Path) -> Image.Image:
    arr = np.array(poster)
    det = cv2.QRCodeDetector()
    _data, pts, _ = det.detectAndDecode(arr)
    if pts is None:
        return poster
    pts = pts.reshape(-1, 2)
    x0, y0 = pts.min(axis=0)
    x1, y1 = pts.max(axis=0)
    module_px = max(1, round(((x1 - x0) + (y1 - y0)) / 2))
    quiet_px = max(8, round(module_px * 0.12))
    # Sample cream from just outside the QR.
    cx = int(np.clip(x0 - 8, 0, arr.shape[1] - 1))
    cy = int(np.clip((y0 + y1) / 2, 0, arr.shape[0] - 1))
    bg = tuple(int(v) for v in arr[cy, cx])
    qr = render_qr(extract_qr_modules(Image.open(qr_src)), module_px, quiet_px, bg)
    paste_x = round((x0 + x1) / 2) - qr.width // 2
    paste_y = round((y0 + y1) / 2) - qr.height // 2
    poster.paste(qr, (paste_x, paste_y))
    return poster


def main() -> None:
    src = pick_source()
    im = Image.open(src).convert("RGB")
    print(f"source {src} {im.size}")

    up = stepwise_upscale(im, A1_PX)
    up = up.filter(ImageFilter.UnsharpMask(radius=1.8, percent=110, threshold=2))
    if QR_SRC.exists():
        up = replace_qr(up, QR_SRC)

    png_out = ROOT / "one-coin-poster-a1.png"
    pdf_out = ROOT / "one-coin-poster-a1.pdf"
    preview = ROOT / "one-coin-poster-a1-preview.png"
    up.save(png_out, "PNG", dpi=(DPI, DPI), optimize=True)

    layout = img2pdf.get_layout_fun(pagesize=A1_PT, fit=img2pdf.FitMode.fill)
    with open(pdf_out, "wb") as f:
        f.write(img2pdf.convert(str(png_out), layout_fun=layout))

    pw = 1200
    ph = round(pw * A1_PX[1] / A1_PX[0])
    up.resize((pw, ph), Image.Resampling.LANCZOS).save(preview, "PNG")

    print(f"A1 px {A1_PX} dpi {DPI}")
    print(f"wrote {png_out} ({png_out.stat().st_size} bytes)")
    print(f"wrote {pdf_out} ({pdf_out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
