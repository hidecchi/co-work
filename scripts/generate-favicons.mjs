import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const iconPath = join(publicDir, "椅子を囲む円弧のミニマルアイコン.png");
// apple-touch-icon には高解像度版を使用
const logoLarge = readFileSync(join(publicDir, "logo4.png"));

const resize = (source, size) =>
  sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

// クリーム色の余白を透明にして、椅子と円弧だけを残す
const { data, info } = await sharp(iconPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const bg = [data[0], data[1], data[2]];
for (let i = 0; i < data.length; i += 4) {
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  if (Math.hypot(dr, dg, db) < 18) {
    data[i + 3] = 0;
  }
}

const trimmedIcon = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim()
  .png()
  .toBuffer();

const faviconBackground = { r: bg[0], g: bg[1], b: bg[2], alpha: 1 };

const renderFavicon = async (size) => {
  const pad = Math.max(1, Math.round(size * 0.08));
  const inner = size - pad * 2;
  const glyph = await sharp(trimmedIcon)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: faviconBackground,
    },
  })
    .composite([{ input: glyph, gravity: "center" }])
    .png()
    .toBuffer();
};

const png16 = await renderFavicon(16);
const png32 = await renderFavicon(32);

writeFileSync(join(publicDir, "favicon-16.png"), png16);
writeFileSync(join(publicDir, "favicon-32.png"), png32);
writeFileSync(join(publicDir, "favicon.ico"), await toIco([png16, png32]));

// iOSは角丸マスクを自動適用するため、白背景+余白付きで生成
const appleLogo = await resize(logoLarge, 150);
await sharp({
  create: {
    width: 180,
    height: 180,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: appleLogo, gravity: "center" }])
  .png()
  .toFile(join(publicDir, "apple-touch-icon.png"));

console.log(
  "Favicons generated (favicon: 椅子を囲む円弧のミニマルアイコン.png / apple-touch-icon: logo4.png)",
);
