# ONE COIN コワーキング (co-work)

神戸・元町の「ワンコイン（¥500）コワーキングスペース」を紹介する Web サイトです。[Astro](https://astro.build) 製の静的サイトで、日本語・英語の 2 言語に対応しています。

- 本番サイト: <https://cowork-net.com>
- 料金: 入場料 ¥500 / 何時間でも利用可能
- 所在地: 兵庫県神戸市中央区中山手通4丁目10-31

## 主な機能

- **ランディングページ** — Hero・特徴紹介・利用方法・店舗情報を掲載
- **多言語対応 (i18n)** — 日本語 (`/`) と英語 (`/en/`) の 2 言語（`src/i18n/`）
- **お問い合わせフォーム** — 外部フォームサービス（ssgform）と連携（`/contact/`）
- **領収書ページ** — アクセスキー付きの領収書表示（`/receipt/`）
- **Three.js 演出** — Hero セクションの WebGL アニメーション（`src/scripts/heroCanvas.ts`）
- **SEO / OGP / 構造化データ** — canonical・OGP・JSON-LD を出力（`src/components/Seo.astro`）

## 必要環境

- Node.js `>=22.12.0`
- npm

## セットアップ

```sh
npm install
```

## コマンド一覧

すべてのコマンドはプロジェクトルートで実行します。

| コマンド                     | 内容                                              |
| :--------------------------- | :------------------------------------------------ |
| `npm run dev`                | 開発サーバーを `localhost:4321` で起動            |
| `npm run build`              | 本番用サイトを `./dist/` にビルド                 |
| `npm run preview`            | ビルド結果をローカルでプレビュー                  |
| `npm run generate:favicons`  | `public/logo.png` などから favicon 一式を生成     |
| `npm run deploy`             | ビルドして Cloudflare へデプロイ                  |
| `npm run astro ...`          | `astro add` や `astro check` などの CLI を実行    |

> 別ドメインでビルドする場合は `SITE_URL` を指定します。
> 例: `SITE_URL=https://example.com npm run build`

## プロジェクト構成

```text
/
├── public/                 # favicon・画像などの静的アセット
├── scripts/
│   └── generate-favicons.mjs
├── src/
│   ├── assets/             # ビルド対象の画像・SVG
│   ├── components/         # Hero, Header, Footer などの UI コンポーネント
│   ├── config/             # サイト設定（site / contact / receipt）
│   ├── i18n/               # 日本語・英語の翻訳とヘルパー
│   ├── layouts/            # ページ共通レイアウト
│   ├── pages/              # ルーティング（/, /en/, /contact/, /receipt/）
│   ├── scripts/            # クライアントサイド JS（Three.js 演出など）
│   ├── styles/             # スタイルシート
│   └── utils/              # ユーティリティ
├── astro.config.mjs        # Astro 設定
└── wrangler.jsonc          # Cloudflare Workers/Assets 設定
```

Astro のプロジェクト構成の詳細は[公式ガイド](https://docs.astro.build/en/basics/project-structure/)を参照してください。

## デプロイ

本番は [Cloudflare](https://developers.cloudflare.com/workers/static-assets/)（`wrangler.jsonc` の設定）へデプロイします。

```sh
npm run deploy
```

上記は `npm run build` 実行後に `wrangler deploy` を行います。事前に [Wrangler](https://developers.cloudflare.com/workers/wrangler/) のログイン（`wrangler login`）が必要です。

## ドキュメント

Astro の詳細は[公式ドキュメント](https://docs.astro.build)を参照してください。
