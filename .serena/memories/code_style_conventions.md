# コードスタイルと規約

## TypeScript/React 規約
- **ファイル名**: kebab-case.tsx（コンポーネント）、camelCase.ts（ユーティリティ）
- **コンポーネント名**: PascalCase
- **関数名**: camelCase
- **型定義**: interface（オブジェクト）、type（ユニオン・エイリアス）
- **props型**: ComponentProps形式で定義

## インポート順序
1. React関連
2. 外部ライブラリ
3. 内部コンポーネント（相対パス）
4. 型定義

## コンポーネント設計原則
- **UI/ロジック分離**: Presentationalコンポーネント（props駆動・副作用なし）
- **Custom Hooks**: ロジック・状態・副作用はhooksに分離
- **100行ルール**: コンポーネントは100行以内で分割
- **責任分離**: 単一責任の原則

## ディレクトリ構造
```
src/
  components/
    layout/      # ヘッダー・フッター・コンテナ
    forms/       # フォーム関連
    qr/          # QR機能固有
    tour/        # ツアー機能
    ui/          # 基本UIコンポーネント（shadcn/ui）
  utils/         # ユーティリティ関数
  store/         # Zustand状態管理
  types/         # TypeScript型定義
  hooks/         # カスタムフック
```

## Tailwind CSS 規約
- **クラス名順序**: レイアウト → スペーシング → 装飾 → 状態
- **レスポンシブ**: mobile-first（sm:, md:, lg:, xl:）
- **カスタムCSS**: 最小限、デザイントークンを優先
- **コンポーネントクラス**: 長大なクラス列は避け、cvaでバリアント管理

## 命名規約
- **ファイル**: kebab-case
- **コンポーネント**: PascalCase
- **hooks**: useXxx
- **types**: PascalCase + Type/Interface suffix
- **constants**: UPPER_SNAKE_CASE