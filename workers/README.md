# Workers セットアップガイド — OAuth + D1 + Hono

GitHub Pages フロント + Cloudflare Workers バックエンドの構成で動作します。  
このガイドでは **Cloudflare Workers の初回デプロイ** と **GitHub Pages のデプロイ設定** の両方を手順通りに説明します。

> **旧 ADMIN_TOKEN 方式から移行済み。**  
> 現在はユーザーアカウント制（Google / GitHub OAuth）です。ADMIN_TOKEN は不要になりました。

---

## 目次

1. [前提条件](#1-前提条件)
2. [Google OAuth App の作成](#2-google-oauth-app-の作成)
3. [GitHub OAuth App の作成](#3-github-oauth-app-の作成)
4. [Cloudflare Workers のセットアップ](#4-cloudflare-workers-のセットアップ)
   - 4.1 Wrangler インストール・ログイン
   - 4.2 D1 データベースの作成
   - 4.3 KV ネームスペースの確認・作成
   - 4.4 wrangler.toml の更新
   - 4.5 シークレットの設定
   - 4.6 デプロイ
5. [GitHub Pages のセットアップ](#5-github-pages-のセットアップ)
6. [動作確認](#6-動作確認)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. 前提条件

| 項目 | 要件 |
|------|------|
| Node.js | 18 以上 |
| npm | 9 以上 |
| Cloudflare アカウント | 無料プランで可 |
| Google アカウント | OAuth App 作成用 |
| GitHub アカウント | OAuth App 作成用 + リポジトリホスティング |

---

## 2. Google OAuth App の作成

1. [Google Cloud Console](https://console.cloud.google.com/) を開き、プロジェクトを作成（または選択）
2. **APIとサービス** → **認証情報** → **認証情報を作成** → **OAuth クライアント ID**
3. アプリケーションの種類: `ウェブ アプリケーション`
4. 以下を設定:
   - **承認済みの JavaScript 生成元**: `https://your-worker.workers.dev`
   - **承認済みのリダイレクト URI**: `https://your-worker.workers.dev/auth/callback/google`
5. 作成後、**クライアント ID** と **クライアント シークレット** をメモ

> `your-worker` は実際の Workers サービス名に置き換えてください（wrangler.toml の `name` フィールド）。

---

## 3. GitHub OAuth App の作成

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
2. 以下を設定:
   - **Application name**: 任意（例: `QR Generator`）
   - **Homepage URL**: `https://yourusername.github.io/qr-generator-web/`
   - **Authorization callback URL**: `https://your-worker.workers.dev/auth/callback/github`
3. 作成後、**Client ID** をメモし、**Generate a new client secret** でシークレットを生成・メモ

---

## 4. Cloudflare Workers のセットアップ

### 4.1 Wrangler インストール・ログイン

```bash
# workers ディレクトリに移動
cd workers

# 依存関係のインストール
npm install

# Cloudflare にログイン（ブラウザが開きます）
npx wrangler login
```

### 4.2 D1 データベースの作成

```bash
# D1 データベースを作成
npx wrangler d1 create qr-dynamic-db
```

出力例:
```
✅ Successfully created DB 'qr-dynamic-db'

[[d1_databases]]
binding = "DB"
database_name = "qr-dynamic-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

表示された `database_id` をコピーし、`wrangler.toml` の `REPLACE_WITH_D1_DATABASE_ID` を置き換えます:

```toml
[[d1_databases]]
binding = "DB"
database_name = "qr-dynamic-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   # ← ここを置き換え
```

次に、マイグレーションを実行してスキーマを適用します:

```bash
# ローカル（開発用）
npx wrangler d1 migrations apply qr-dynamic-db --local

# リモート（本番）
npx wrangler d1 migrations apply qr-dynamic-db --remote
```

### 4.3 KV ネームスペースの確認・作成

`wrangler.toml` にすでに KV バインディングが設定されている場合は、既存の ID を確認します:

```bash
npx wrangler kv namespace list
```

まだ存在しない場合は作成します:

```bash
npx wrangler kv namespace create AUTH_STATE_KV
```

出力された `id` を `wrangler.toml` の対応する `id` フィールドに設定します。

### 4.4 wrangler.toml の更新

`workers/wrangler.toml` を確認し、以下が正しく設定されているか確認します:

```toml
name = "your-worker"           # Workers サービス名
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "qr-dynamic-db"
database_id = "実際のdatabase_id"

[[kv_namespaces]]
binding = "AUTH_STATE_KV"
id = "実際のKV_ID"
```

### 4.5 シークレットの設定

以下の 6 つのシークレットを設定します:

```bash
# Google OAuth 認証情報
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET

# GitHub OAuth 認証情報
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET

# セッション署名用シークレット（32文字以上のランダム文字列）
npx wrangler secret put SESSION_SECRET

# フロントエンドの URL（CORS 許可リスト用）
npx wrangler secret put FRONTEND_URL
```

> **SESSION_SECRET の生成方法:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

> **FRONTEND_URL の値:**  
> GitHub Pages の場合: `https://yourusername.github.io`  
> ローカル開発の場合: `http://localhost:5173`

各コマンド実行時にプロンプトが表示されるので、値を入力して Enter を押します。

### 4.6 デプロイ

```bash
npx wrangler deploy
```

デプロイ後に表示される URL（例: `https://your-worker.your-subdomain.workers.dev`）を控えておきます。

---

## 5. GitHub Pages のセットアップ

### 5.1 Repository Variable の設定

GitHub リポジトリの **Settings** → **Secrets and variables** → **Actions** → **Variables** タブで、以下を追加します:

| 変数名 | 値 |
|--------|-----|
| `VITE_WORKER_BASE_URL` | `https://your-worker.workers.dev` |

### 5.2 GitHub Pages の有効化

リポジトリの **Settings** → **Pages** → **Source** を `GitHub Actions` に設定します。

### 5.3 デプロイのトリガー

main ブランチへのプッシュで GitHub Actions が自動実行され、GitHub Pages にデプロイされます。

---

## 6. 動作確認

### ローカル開発

```bash
# Workers をローカルで起動
cd workers
npx wrangler dev

# フロントエンドを別ターミナルで起動
cd ..
VITE_WORKER_BASE_URL=http://localhost:8787 npm run dev
```

`.env.local`（`src` の親ディレクトリ）を作成して環境変数を管理することもできます:

```env
VITE_WORKER_BASE_URL=http://localhost:8787
```

### 動作確認チェックリスト

- [ ] `http://localhost:5173/#/login` にアクセスしてログインボタンが表示される
- [ ] Google / GitHub でログインできる
- [ ] ログイン後にヘッダーにユーザー名が表示される
- [ ] `/#/dynamic-qr` で時限 QR コードを作成・管理できる
- [ ] `/#/vcard` で vCard を作成・管理できる
- [ ] ログアウトできる

---

## 7. トラブルシューティング

### CORS エラーが発生する

`workers/src/index.ts` の `allowedOrigins` に フロントエンドの URL が含まれているか確認してください。  
また、`FRONTEND_URL` シークレットが正しく設定されているか確認してください:

```bash
npx wrangler secret list
```

### D1 マイグレーションが失敗する

```bash
# マイグレーション状態を確認
npx wrangler d1 migrations list qr-dynamic-db --remote

# 手動で SQL を実行
npx wrangler d1 execute qr-dynamic-db --remote --file=./src/db/migrations/001_init.sql
```

### Cookie が送信されない

- フロントエンドの fetch 呼び出しがすべて `credentials: "include"` を指定しているか確認
- Workers 側の CORS レスポンスに `Access-Control-Allow-Credentials: true` が含まれているか確認
- ブラウザのサードパーティ Cookie が有効になっているか確認（特に Chrome）

### OAuth リダイレクト URI が一致しない

Google / GitHub のコンソールで設定した **Callback URL** が、Workers の実際のデプロイ URL と一致しているか確認してください。  
URL の末尾スラッシュにも注意が必要です。

### ローカルで wrangler dev が起動しない

```bash
# Node.js バージョンを確認（18+ が必要）
node --version

# wrangler のバージョンを確認・更新
npx wrangler --version
npm update wrangler
```
