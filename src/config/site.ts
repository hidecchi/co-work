/** 本番デプロイ時は astro.config.mjs の site または SITE_URL 環境変数を設定してください */
export const siteConfig = {
  name: "ONE COIN コワーキング",
  title: "ONE COIN コワーキング | 神戸・元町の500円コワーキング",
  description:
    "神戸・元町駅徒歩6分のコワーキングスペース。入場料500円で時間無制限、会員登録不要。24時間営業、高速Wi-Fi・電源完備。作業・勉強・休憩にご利用ください。",
  ogImage: "/sample.jpg",
  ogImageAlt: "ONE COIN コワーキングの店内イメージ",
  locale: "ja",
  ogLocale: "ja_JP",
  themeColor: "#444444",
  twitterCard: "summary_large_image" as const,
  business: {
    streetAddress: "中山手通4丁目10-31",
    addressLocality: "神戸市中央区",
    addressRegion: "兵庫県",
    postalCode: "650-0004",
    addressCountry: "JP",
    latitude: 34.691833,
    longitude: 135.185229,
    priceRange: "¥500",
  },
};
