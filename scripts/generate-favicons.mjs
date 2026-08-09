import sharp from "sharp";
import toIco from "to-ico";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const logo = readFileSync(join(publicDir, "logo.png"));
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

const png16 = await resize(logo, 16);
const png32 = await resize(logo, 32);

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

console.log("Favicons generated (favicon: logo.png / apple-touch-icon: logo4.png)");
