/** 本番URL。カスタムドメイン利用時は SITE_URL 環境変数で上書き */
export const siteConfig = {
  defaultSiteUrl: "https://cowork-net.web.app",
  name: "ONE COIN コワーキング",
  ogImage: "/sample.jpg",
  themeColor: "#444444",
  twitterCard: "summary_large_image" as const,
  business: {
    streetAddress: "中山手通4丁目10-31",
    streetAddressEn: "4-10-31 Nakayamate-dori, Chuo-ku",
    addressLocality: "神戸市中央区",
    addressLocalityEn: "Kobe, Hyogo",
    addressRegion: "兵庫県",
    postalCode: "650-0004",
    addressCountry: "JP",
    latitude: 34.691833,
    longitude: 135.185229,
    priceRange: "¥500",
  },
};
