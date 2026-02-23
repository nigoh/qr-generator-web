# 開発コマンドと運用ガイド

## 基本開発コマンド
```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# リンター実行
npm run lint

# 型チェック（エラーのみ確認、ファイル出力なし）
npm run type-check

# テスト実行（watchモード）
npm run test

# テスト実行（1回のみ）
npm run test -- --run

# ビルド結果のプレビュー
npm run preview
```

## 開発環境セットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（http://localhost:5173/）
npm run dev
```

## タスク完了時の推奨アクション
1. **リンターチェック**: `npm run lint`
2. **型チェック**: `npm run type-check`
3. **テスト実行**: `npm run test -- --run`
4. **ビルドテスト**: `npm run build` でエラーがないことを確認
5. **動作確認**: ブラウザで機能テスト

## テストファイルの配置
- テストファイルはテスト対象のファイルと同じディレクトリに配置
- 命名規則: `<filename>.test.ts` or `<filename>.test.tsx`
- 例: `src/features/tour-guide/hooks/use-tour-guide.test.ts`
- テストフレームワーク: Vitest + Testing Library
- テスト環境設定: `src/test/test-setup.ts`

## パスエイリアス
- `@/` → `./src/` （`tsconfig.app.json` で設定済み）
- 例: `import { cn } from "@/lib/utils"`
