# コードベース構造

## メインディレクトリ構成
```
qr-generator-web/
├── src/
│   ├── App.tsx                 # メインアプリケーション
│   ├── main.tsx               # エントリーポイント
│   ├── components/            # UIコンポーネント
│   │   ├── layout/           # レイアウト系（Header, Footer, Container）
│   │   ├── forms/            # フォーム系（UrlInput, ColorPicker, etc）
│   │   ├── qr/               # QR関連（QRPreview, DownloadButton）
│   │   ├── tour/             # ツアー機能（TourGuide, TourStep）
│   │   └── ui/               # 基本UI（shadcn/uiベース）
│   ├── store/                # Zustand状態管理
│   │   ├── qrStore.ts        # QR設定・データ管理
│   │   └── tourStore.ts      # ツアー状態管理
│   ├── utils/                # ユーティリティ関数
│   │   ├── qrGenerator.ts    # QR生成ロジック
│   │   ├── structureDetector.ts # 構造パターン判定
│   │   ├── colorUtils.ts     # 色変換・検証
│   │   └── canvasUtils.ts    # キャンバス描画
│   ├── types/                # TypeScript型定義
│   │   └── qr.types.ts       # QR関連型
│   └── hooks/                # カスタムフック
├── public/                   # 静的ファイル
├── doc/                     # ドキュメント
└── 設定ファイル群
```

## 主要コンポーネントの役割
- **App.tsx**: メインレイアウト・ページ構成
- **QRPreview**: QRコード表示・リアルタイム更新
- **各種フォーム**: URL入力・スタイル設定・ロゴアップロード
- **ツアー機能**: インタラクティブガイド・画像ベースツアー
- **Store**: Zustandによる状態管理（設定永続化含む）

## 依存関係の特徴
- **shadcn/ui**: Radix UIベースの高品質コンポーネント
- **Zustand**: 軽量状態管理
- **qrcode.js**: QRコード生成ライブラリ
- **Tailwind CSS**: ユーティリティファーストCSS
- **Fabric.js**: キャンバス操作（ロゴ埋め込み用）

## 設定ファイル
- **tailwind.config.js**: Tailwindカスタマイズ
- **vite.config.ts**: Viteビルド設定
- **tsconfig.json**: TypeScript設定
- **eslint.config.js**: リンター設定