import { unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

/** Max width ~2× largest hero slide (26.25rem ≈ 420px) */
const MAX_WIDTH = 840;
const JPEG_QUALITY = 82;

const slides = [
  { input: "164 (2).jpg", output: "hero-slide-desk-row.jpg" },
  { input: "166.jpg", output: "hero-slide-open-space.jpg" },
  { input: "169 (2).jpg", output: "hero-slide-shared-desk.jpg" },
];

for (const { input, output } of slides) {
  const inputPath = join(publicDir, input);
  const outputPath = join(publicDir, output);

  const info = await sharp(inputPath)
    .rotate()
    .resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outputPath);

  const before = (await sharp(inputPath).metadata()).width;
  console.log(
    `${input} → ${output}: ${before}px wide → ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB`,
  );

  if (input !== output) {
    unlinkSync(inputPath);
  }
}

console.log("Hero slides optimized.");
