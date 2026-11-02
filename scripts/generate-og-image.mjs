import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(root, "public/hero-slide-desk-row.jpg");
const output = join(root, "public/og-image.jpg");

const meta = await sharp(input).metadata();
const width = meta.width ?? 840;
const cropHeight = Math.round((width * 9) / 16);

await sharp(input)
  .extract({
    left: 0,
    top: 0,
    width,
    height: Math.min(cropHeight, meta.height ?? cropHeight),
  })
  .resize(1200, 675, { fit: "fill" })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(output);

console.log(`OG image: ${output} (1200×675, top 16:9 crop from hero-slide-desk-row.jpg)`);
