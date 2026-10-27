import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const iconPath = join(publicDir, "黒地に白い「OC」ロゴアイコン.png");

const resize = (size) =>
  sharp(iconPath)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
    })
    .png()
    .toBuffer();

const png16 = await resize(16);
const png32 = await resize(32);
const png180 = await resize(180);

writeFileSync(join(publicDir, "favicon-16.png"), png16);
writeFileSync(join(publicDir, "favicon-32.png"), png32);
writeFileSync(join(publicDir, "favicon.ico"), await toIco([png16, png32]));
writeFileSync(join(publicDir, "apple-touch-icon.png"), png180);

console.log(
  "Favicons generated from 黒地に白い「OC」ロゴアイコン.png (16 / 32 / ico / apple-touch 180)",
);
