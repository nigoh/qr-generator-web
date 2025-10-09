# 開発コマンドと運用ガイド

## 基本開発コマンド
```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# リンター実行
npm run lint

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

## Windows 固有のコマンド
```powershell
# プロジェクト構造確認
dir /s
Get-ChildItem -Recurse

# ファイル検索
findstr /r /i "pattern" *.tsx *.ts

# Git操作
git status
git add .
git commit -m "message"
git push
```

## タスク完了時の推奨アクション
1. **リンターチェック**: `npm run lint`
2. **型チェック**: TypeScriptコンパイラが自動実行
3. **ビルドテスト**: `npm run build` でエラーがないことを確認
4. **動作確認**: ブラウザで機能テスト
5. **Git操作**: コミット・プッシュ

## よく使うファイル操作
```bash
# ファイル作成
echo. > newfile.tsx

# ディレクトリ作成
mkdir new-folder

# ファイルコピー
copy source.tsx destination.tsx
```