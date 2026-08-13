// @ts-check
import { defineConfig } from "astro/config";

const defaultSiteUrl = "https://cowork-net.web.app";

// https://astro.build/config
export default defineConfig({
  // canonical / OGP / 構造化データに使用（HTTPS必須）
  // カスタムドメイン: SITE_URL=https://your-domain.com npm run build
  site: process.env.SITE_URL || defaultSiteUrl,
});
