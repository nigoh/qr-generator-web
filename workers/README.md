# 時限QR（Dynamic QR）セットアップガイド

GitHub Pages フロント + Cloudflare Workers バックエンドの構成で動作します。  
このガイドでは **Cloudflare Workers の初回デプロイ** と **GitHub Pages のデプロイ設定** の両方を手順通りに説明します。

---

## 目次

1. [前提条件](#1-前提条件)
2. [Cloudflare Workers のセットアップ](#2-cloudflare-workers-のセットアップ)
   - 2.1 Wrangler のインストールとログイン
   - 2.2 KV ネームスペースの作成
   - 2.3 wrangler.toml の更新
   - 2.4 管理トークンの設定（Secrets）
   - 2.5 カスタムドメインの設定（任意）
   - 2.6 デプロイ
3. [GitHub Pages のセットアップ](#3-github-pages-のセットアップ)
4. [フロントエンドの Worker URL 設定](#4-フロントエンドの-worker-url-設定)
5. [動作確認](#5-動作確認)
6. [運用・管理操作](#6-運用管理操作)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. 前提条件

| 項目 | 要件 |
|------|------|
| Node.js | 18 以上 |
| npm | 9 以上 |
| Cloudflare アカウント | 無料プランで可 |

---

## 2. Cloudflare Workers のセットアップ

### 2.1 Wrangler のインストールとログイン

```bash
# workers ディレクトリに移動
cd workers

# 依存関係のインストール
npm install

# Cloudflare にログイン（ブラウザが開きます）
npx wrangler login
```

### 2.2 KV ネームスペースの作成

リンクデータとアクセス統計用に 2 つの KV ネームスペースを作成します。

```bash
# リンク本体用 KV
npx wrangler kv namespace create LINKS_KV

# アクセス統計用 KV
npx wrangler kv namespace create STATS_KV
```

実行すると以下のような出力が得られます。**`id` の値をメモしてください。**

```
⛅️ wrangler 4.x.x
Add the following to your configuration file in your kv_namespaces array:
{ binding = "LINKS_KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

### 2.3 wrangler.toml の更新

`workers/wrangler.toml` を開き、手順 2.2 で取得した ID を貼り付けます。

```toml
name = "qr-dynamic-worker"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "LINKS_KV"
id = "ここに LINKS_KV の id を貼り付ける"   # ← 変更

[[kv_namespaces]]
binding = "STATS_KV"
id = "ここに STATS_KV の id を貼り付ける"   # ← 変更
```

### 2.4 管理トークンの設定（Secrets）

管理 API の認証に使う任意のランダム文字列（推奨 32 文字以上）を設定します。  
この値は Workers の環境変数として安全に保管されます。

```bash
# 対話形式でトークンを入力（echo して確認しないこと）
npx wrangler secret put ADMIN_TOKEN
```

実行後、Enter your secret を求められるのでトークンを入力してください。  
このトークンは後でフロントの「設定」画面に入力します。

> **⚠ 注意**: ADMIN_TOKEN は絶対にソースコードやコミット履歴に含めないでください。

### 2.5 カスタムドメインの設定（任意・推奨）

QR コードが指す URL を固定するために、独自ドメインを設定することを推奨します。

1. Cloudflare ダッシュボード → **Workers & Pages** → 対象の Worker を選択
2. **Settings** → **Triggers** → **Custom Domains** → **Add Custom Domain**
3. `qr.yourdomain.com` などのサブドメインを入力して保存

> カスタムドメインを使わない場合、Worker の URL は `https://qr-dynamic-worker.<あなたのアカウント>.workers.dev` 形式になります。

### 2.6 デプロイ

```bash
# workers ディレクトリにいることを確認してからデプロイ
npx wrangler deploy
```

成功すると以下のような出力が表示されます。

```
✨ Success! Uploaded 1 files (1.23 sec)
🌎 Deployed qr-dynamic-worker triggers
  https://qr-dynamic-worker.<account>.workers.dev
```

**表示された URL（または設定したカスタムドメイン）をメモしてください。**  
フロントエンドの「設定」画面で使います。

---

## 3. GitHub Pages のセットアップ

リポジトリのフロントエンドは **GitHub Actions** によって自動でデプロイされます。

### 手順

1. GitHub の **Settings** → **Pages** を開く
2. **Source** を `GitHub Actions` に設定する

   ![GitHub Pages 設定](https://docs.github.com/assets/cb-35538/mw-1440/images/help/pages/pages-tab.webp)

3. `main` ブランチに push すると、自動的にビルド・デプロイが実行されます  
   （`.github/workflows/deploy-pages.yml` が実行されます）

デプロイ完了後、フロントエンドは以下の URL で公開されます。

```
https://<あなたのユーザー名>.github.io/qr-generator-web/
```

---

## 4. フロントエンドの Worker URL 設定

GitHub Pages で公開されたフロントエンドにアクセスし、「時限QR」機能を使えるように設定します。

1. ブラウザで `https://<ユーザー名>.github.io/qr-generator-web/` を開く
2. ヘッダーの **「時限QR」** ボタンをクリック
3. **「設定」タブ** を選択

   ![設定タブ](https://github.com/user-attachments/assets/86609860-0723-4cfe-bff1-e53aabdd3a7a)

4. 以下を入力して **「設定を保存」** をクリック

   | 項目 | 値 |
   |------|-----|
   | Worker ベース URL | `https://qr-dynamic-worker.<account>.workers.dev`（手順 2.6 の URL） |
   | 管理トークン | 手順 2.4 で設定した ADMIN_TOKEN の値 |

> **⚠ セキュリティ注意事項**  
> 管理トークンはブラウザのセッションストレージに保持されます（タブを閉じると削除されます）。  
> **共有 PC や公共端末では使用しないでください。**

---

## 5. 動作確認

### 時限QRリンクの作成テスト

1. 「作成」タブで以下を入力してテスト
   - **リダイレクト先 URL**: `https://example.com`
   - **有効期限**: 1〜2 分後の時刻を設定（期限切れテスト用）
2. **「時限QRリンクを作成」** ボタンをクリック
3. `redirect_url`（例: `https://qr-dynamic-worker.xxx.workers.dev/r/abc123`）が表示されればOK

### リダイレクト動作テスト

```bash
# curl でリダイレクト確認（-L でリダイレクト追従）
curl -I https://qr-dynamic-worker.<account>.workers.dev/r/<code>

# 期待されるレスポンス
# HTTP/2 302
# location: https://example.com
```

### 期限切れテスト

有効期限が切れた後に同じ URL にアクセスすると、410 Gone ページが表示されます。

```bash
curl -I https://qr-dynamic-worker.<account>.workers.dev/r/<code>
# HTTP/2 410
```

---

## 6. 運用・管理操作

### curl による管理操作（CLI）

フロントエンドを使わずに curl でも管理できます。ローカル PC からトークンを使って操作します。

```bash
# 変数設定
WORKER_URL="https://qr-dynamic-worker.<account>.workers.dev"
TOKEN="あなたの管理トークン"

# リンク作成
curl -X POST "$WORKER_URL/api/links" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://example.com","expires_at":"2026-12-31T23:59:59Z","note":"イベント用"}'

# リンク詳細確認
curl "$WORKER_URL/api/links/<code>" \
  -H "Authorization: Bearer $TOKEN"

# リダイレクト先の変更（差し替え）
curl -X PATCH "$WORKER_URL/api/links/<code>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://new-page.example.com"}'

# 有効期限の延長
curl -X PATCH "$WORKER_URL/api/links/<code>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expires_at":"2027-03-31T23:59:59Z"}'

# 無効化
curl -X POST "$WORKER_URL/api/links/<code>/disable" \
  -H "Authorization: Bearer $TOKEN"

# 一覧取得
curl "$WORKER_URL/api/links?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### ADMIN_TOKEN の変更

```bash
cd workers
npx wrangler secret put ADMIN_TOKEN
# 新しいトークンを入力
```

変更後はフロントエンドの「設定」タブで新しいトークンを再入力してください。

---

## 7. トラブルシューティング

### `wrangler login` が失敗する

- ブラウザのポップアップブロックを一時的に解除してください
- `npx wrangler login --browser false` でトークン入力方式に切り替えられます

### デプロイ後に 403 が返る

- `ADMIN_TOKEN` が設定されていない可能性があります
- `npx wrangler secret list` でシークレットの存在を確認してください

### `wrangler.toml` の KV ID を変更したのに反映されない

- `npx wrangler deploy` を再度実行してください

### フロントエンドから API を呼んだ時に CORS エラーが出る

`workers/src/index.ts` の `corsHeaders` 関数に GitHub Pages の URL が含まれているか確認してください。

```ts
const allowed = [
  "https://nigoh.github.io",   // ← あなたの GitHub Pages URL
  "http://localhost:5173",
  "http://localhost:4173",
]
```

含まれていない場合は追加して `npx wrangler deploy` を実行してください。

### KV のデータを直接確認したい

```bash
# KV の値を確認
npx wrangler kv key get --binding=LINKS_KV "link:<code>"

# KV の一覧
npx wrangler kv key list --binding=LINKS_KV --prefix="link:"
```

---

## 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Wrangler CLI リファレンス](https://developers.cloudflare.com/workers/wrangler/commands/)
- [KV ストレージのドキュメント](https://developers.cloudflare.com/kv/)
- [GitHub Pages のドキュメント](https://docs.github.com/ja/pages)
