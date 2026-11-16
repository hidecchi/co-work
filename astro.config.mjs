// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const defaultSiteUrl = "https://cowork-net.com";

// https://astro.build/config
export default defineConfig({
  // canonical / OGP / 構造化データに使用（HTTPS必須）
  // 別ドメインでビルドする場合: SITE_URL=https://example.com npm run build
  site: process.env.SITE_URL || defaultSiteUrl,
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "ja",
        locales: {
          ja: "ja",
          en: "en",
        },
      },
    }),
  ],
});
