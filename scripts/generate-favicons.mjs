import sharp from "sharp";
import toIco from "to-ico";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const logoPath = join(publicDir, "logo.png");
const logo = readFileSync(logoPath);

const resize = (size) =>
  sharp(logo)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

const png16 = await resize(16);
const png32 = await resize(32);

writeFileSync(join(publicDir, "favicon-16.png"), png16);
writeFileSync(join(publicDir, "favicon-32.png"), png32);
writeFileSync(join(publicDir, "favicon.ico"), await toIco([png16, png32]));

const appleIcon = await resize(180);
writeFileSync(join(publicDir, "apple-touch-icon.png"), appleIcon);

console.log("Favicons generated from public/logo.png");
