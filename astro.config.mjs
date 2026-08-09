// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // 本番URL（canonical / OGP / 構造化データに使用）
  // 例: SITE_URL=https://example.com npm run build
  site: process.env.SITE_URL,
});