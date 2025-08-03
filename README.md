# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# QR コード生成ツール - Web 版

現在の Python/Tkinter 版 QR コード生成ツールを React + TypeScript + Tailwind CSS で Web 版として再実装したアプリケーションです。

## 📋 概要

Python 版のすべての機能を維持しつつ、モダンな Web アプリケーションとして提供します。リアルタイムプレビュー、レスポンシブデザイン、直感的な UI/UX を特徴としています。

## 🎯 機能

### ✅ 既存機能の完全移行

- **QR コード生成**: URL/テキスト入力による高品質 QR コード生成
- **ロゴ埋め込み**: 中央位置への画像埋め込み（サイズ・パディング・角丸調整）
- **カラーカスタマイズ**: RGB/16 進数による前景色・背景色設定
- **ドット形状選択**: 四角・円形・角丸の 3 種類
- **構造パターン保持**: ファインダー・タイミング・フォーマット情報の適切な描画
- **エラー訂正レベル**: L/M/Q/H の 4 段階設定
- **詳細調整**: ボックスサイズ・ボーダー調整
- **画像出力**: PNG/JPG 形式でのダウンロード

### 🆕 Web 版追加機能

- **リアルタイムプレビュー**: 設定変更時の即座な反映
- **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- **ドラッグ&ドロップ**: 直感的なロゴアップロード
- **設定永続化**: LocalStorage による設定保存
- **クリップボード連携**: 生成画像の直接コピー
- **使いやすい UI**: 折りたたみセクション・プリセット機能

## 🏗️ 技術スタック

```json
{
  "フロントエンド": {
    "フレームワーク": "React 19 + TypeScript",
    "スタイリング": "Tailwind CSS 3.4",
    "ビルドツール": "Vite 7",
    "状態管理": "Zustand 5",
    "QR生成": "qrcode.js 1.5",
    "キャンバス処理": "HTML5 Canvas API"
  },
  "開発環境": {
    "Node.js": "22.x",
    "パッケージマネージャー": "npm",
    "リンター": "ESLint",
    "型チェック": "TypeScript 5.8"
  }
}
```

## 📁 プロジェクト構造

```
qr-generator-web/
├── public/                     # 静的ファイル
├── src/
│   ├── components/             # UIコンポーネント
│   │   ├── layout/            # レイアウトコンポーネント
│   │   │   ├── Container.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── forms/             # フォームコンポーネント
│   │   │   ├── UrlInput.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── StyleSettings.tsx
│   │   │   └── LogoUpload.tsx
│   │   ├── qr/                # QR関連コンポーネント
│   │   │   ├── QRPreview.tsx
│   │   │   └── DownloadButton.tsx
│   │   └── ui/                # 基本UIコンポーネント
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Slider.tsx
│   │       ├── FileUpload.tsx
│   │       └── CollapsibleSection.tsx
│   ├── utils/                 # ユーティリティ関数
│   │   ├── qrGenerator.ts     # QR生成ロジック
│   │   ├── structureDetector.ts # 構造パターン判定
│   │   ├── colorUtils.ts      # 色変換・検証
│   │   └── canvasUtils.ts     # キャンバス描画
│   ├── store/                 # 状態管理
│   │   └── qrStore.ts         # Zustandストア
│   ├── types/                 # TypeScript型定義
│   │   └── qr.types.ts
│   ├── App.tsx               # メインアプリケーション
│   └── main.tsx              # エントリーポイント
├── doc/                      # ドキュメント
│   ├── REACT_IMPLEMENTATION_PLAN.md
│   ├── REACT_WEB_VERSION_PLAN.md
│   └── LOGO_EMBEDDING_GUIDE.md
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 セットアップ・使用方法

### 1. 開発環境の準備

```bash
# Node.js 22.x がインストールされていることを確認
node --version

# リポジトリのクローン（または解凍）
cd qr-generator-web

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:5173/` にアクセスしてアプリケーションを確認してください。

### 2. 基本的な使用方法

1. **テキスト入力**: URL、連絡先、Wi-Fi 設定などを入力
2. **スタイル設定**: 色、形状、サイズを調整
3. **ロゴ追加**: 必要に応じて画像ファイルを選択
4. **プレビュー確認**: リアルタイムで結果を確認
5. **ダウンロード**: PNG/JPG 形式で保存

### 3. 推奨設定

#### ロゴ付き QR コード

```
エラー訂正レベル: H（高）- 30%まで損失許容
ロゴサイズ: 20-25%（推奨）
ボックスサイズ: 10-15px
ボーダーサイズ: 4px以上
```

#### 印刷用途

```
ボックスサイズ: 15px以上
出力サイズ: 最低2cm×2cm
形式: PNG（透明背景対応）
```

## 🎨 UI/UX 設計

### デザインシステム

#### カラーパレット

```css
/* Primary Colors */
--blue-500: #3b82f6; /* メインカラー */
--blue-600: #2563eb; /* ホバー */

/* Neutral Colors */
--gray-50: #f9fafb; /* 背景 */
--gray-200: #e5e7eb; /* ボーダー */
--gray-600: #4b5563; /* テキスト */

/* Status Colors */
--green-500: #10b981; /* 成功 */
--red-500: #ef4444; /* エラー */
--yellow-500: #f59e0b; /* 警告 */
```

#### レスポンシブブレークポイント

```css
sm: 640px   /* スマートフォン */
md: 768px   /* タブレット */
lg: 1024px  /* デスクトップ */
xl: 1280px  /* 大画面 */
```

### アクセシビリティ

- **キーボードナビゲーション**: 全機能をキーボードで操作可能
- **スクリーンリーダー対応**: 適切な aria-label 設定
- **カラーコントラスト**: WCAG AA 準拠（4.5:1 以上）
- **フォーカス表示**: 明確なフォーカスインジケーター

## 🔧 開発・ビルド

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# リンター実行
npm run lint

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### ディレクトリ構造の原則

- **コンポーネント分割**: 100 行以内を目安とした適切な分割
- **責任の分離**: UI・ロジック・状態管理の明確な分離
- **再利用性**: 汎用的な UI コンポーネントの共通化
- **型安全性**: 厳密な TypeScript 型定義

## 📱 対応環境

### ブラウザサポート

- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+
- **モバイルブラウザ**: iOS Safari 14+, Android Chrome 88+

### デバイス対応

- **デスクトップ**: 1920×1080 以上推奨
- **タブレット**: iPad、Android タブレット
- **スマートフォン**: iPhone、Android（320px 幅から対応）

## 🔍 品質保証

### テスト項目

- [ ] QR コード生成・読み取りテスト
- [ ] ロゴ埋め込み機能テスト
- [ ] レスポンシブデザインテスト
- [ ] ブラウザ互換性テスト
- [ ] アクセシビリティテスト
- [ ] パフォーマンステスト

### 推奨テスト手順

1. **基本機能**: 各種設定での QR コード生成
2. **読み取りテスト**: 実際の QR リーダーでの確認
3. **印刷テスト**: 異なるサイズでの印刷品質確認
4. **デバイステスト**: 各デバイスでの操作性確認

## 📖 関連ドキュメント

- [実装計画書](./doc/REACT_IMPLEMENTATION_PLAN.md) - 詳細な設計・実装方針
- [Web 版仕様書](./doc/REACT_WEB_VERSION_PLAN.md) - 機能仕様・技術仕様
- [ロゴ埋め込みガイド](./doc/LOGO_EMBEDDING_GUIDE.md) - ロゴ機能の詳細説明

## 🤝 コントリビューション

### 開発ガイドライン

1. **コーディング規約**: ESLint 設定に従った記述
2. **コミット規約**: Conventional Commits 形式
3. **ブランチ戦略**: feature/機能名でブランチ作成
4. **プルリクエスト**: レビュー必須

### 改善提案・バグ報告

- Issues 機能を使用してバグ報告・機能要望を投稿
- 再現手順の詳細な記載をお願いします
- スクリーンショット・画面録画の添付を推奨

## 📞 サポート

### よくある質問

**Q: QR コードが読み取れません**
A: エラー訂正レベルを H（高）に設定し、ロゴサイズを 20%以下にしてください。

**Q: 印刷時に画質が粗くなります**
A: ボックスサイズを 15px 以上に設定し、2cm×2cm 以上のサイズで印刷してください。

**Q: スマートフォンで操作しにくいです**
A: 画面を横向きにするか、ブラウザのズーム機能を使用してください。

### 技術サポート

- 開発者向けのサポートは Issues 機能をご利用ください
- ビジネス利用に関するお問い合わせは別途ご連絡ください

---

**開発者**: Python 版から Web 版への完全移行プロジェクト  
**ライセンス**: MIT License  
**最終更新**: 2024 年 8 月 4 日

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
