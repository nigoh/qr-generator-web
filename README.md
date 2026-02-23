# QRコード生成ツール

GitHub Pages でホスティングされた React フロントエンドと Cloudflare Workers バックエンドで構成された QR コード生成サービスです。

## 機能一覧

| 機能 | 認証 | 説明 |
|------|------|------|
| 静的 QR コード生成 | 不要 | URL・テキストからカスタム QR を即時生成 |
| 時限 QR（Dynamic QR） | **必要** | 有効期限付きリダイレクトリンクの作成・管理 |
| vCard 管理 | **必要** | 連絡先情報の登録と QR 共有 |
| ツアーガイド | 不要 | アプリの操作説明ウォークスルー |

> 認証には **Google または GitHub アカウント**を使用します（OAuth 2.0）。

---

## アーキテクチャ

```
[ブラウザ]
    │  HashRouter (GitHub Pages)
    ▼
[React フロントエンド] ──credentials: include──▶ [Cloudflare Workers (Hono)]
                                                        │
                                          ┌─────────────┴──────────────┐
                                          ▼                            ▼
                                   D1 (SQLite)                   KV ストア
                                   users / sessions              OAuth state
                                   dynamic_links / vcards        一時保存
```

---

## 技術スタック

### フロントエンド
| 項目 | 内容 |
|------|------|
| フレームワーク | React 19 + TypeScript |
| ルーティング | react-router-dom v7 (HashRouter) |
| スタイリング | Tailwind CSS v4 |
| ビルドツール | Vite 7 |
| 状態管理 | Zustand 5（QR 設定）/ React Context（認証） |
| QR 生成 | qrcode.js |

### バックエンド (Cloudflare Workers)
| 項目 | 内容 |
|------|------|
| フレームワーク | Hono v4 |
| 認証 | OAuth 2.0 (Google / GitHub) via `arctic` |
| データベース | Cloudflare D1 (SQLite) |
| KV | OAuth state 一時保存 |
| セッション | HttpOnly Cookie (`session_id`, 30 日間) |

---

## プロジェクト構造

```
qr-generator-web/
├── src/
│   ├── App.tsx                  # HashRouter + AuthProvider + Routes
│   ├── features/
│   │   ├── auth/                # OAuth ログイン・セッション管理
│   │   │   ├── components/      # ProtectedRoute
│   │   │   ├── hooks/           # useAuth (AuthProvider)
│   │   │   └── services/        # auth-api.ts (getMe / logout)
│   │   ├── dynamic-qr/          # 時限 QR 機能
│   │   │   ├── components/
│   │   │   ├── hooks/           # useDynamicQR
│   │   │   └── services/        # dynamic-qr-api.ts
│   │   ├── vcard/               # vCard 管理機能
│   │   │   ├── components/
│   │   │   ├── hooks/           # useVCard
│   │   │   └── services/        # vcard-api.ts
│   │   └── tour-guide/          # ツアーガイド
│   ├── pages/
│   │   ├── auth/login-page.tsx  # ログイン画面
│   │   ├── dynamic-qr/          # 時限 QR ページ
│   │   └── vcard/               # vCard ページ
│   ├── components/
│   │   ├── layout/              # FeatureLayout / Header / Footer
│   │   ├── forms/               # URL入力・スタイル設定フォーム
│   │   ├── qr/                  # QRプレビュー・ダウンロード
│   │   └── ui/                  # 共通 UI コンポーネント
│   ├── store/qrStore.ts         # Zustand (静的 QR 設定)
│   └── utils/                   # QR生成・色変換ユーティリティ
└── workers/                     # Cloudflare Workers バックエンド
    ├── src/
    │   ├── index.ts             # Hono エントリーポイント
    │   ├── types.ts             # Env / User / DynamicLink / VCard
    │   ├── middleware/session.ts # requireAuth / Cookie ヘルパー
    │   ├── routes/
    │   │   ├── auth.ts          # OAuth フロー・/auth/me・/auth/logout
    │   │   ├── links.ts         # 時限 QR CRUD
    │   │   ├── vcards.ts        # vCard CRUD
    │   │   └── redirect.ts      # パブリックリダイレクト
    │   └── db/migrations/
    │       └── 001_init.sql     # D1 スキーマ
    └── wrangler.toml
```

---

## セットアップ

### フロントエンドのみ（静的 QR 機能）

```bash
npm install
npm run dev
# → http://localhost:5173/
```

### フル機能（OAuth + 時限 QR + vCard）

バックエンドのセットアップが必要です。[workers/README.md](./workers/README.md) を参照してください。

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npx tsc --noEmit

# ユニットテスト実行
npx vitest run

# 本番ビルド
npm run build

# ビルドプレビュー
npm run preview

# リンター
npm run lint
```

---

## 認証フロー

```
1. ユーザーが「Google でログイン」or「GitHub でログイン」をクリック
2. フロントエンドが Workers の /auth/login/{provider} にリダイレクト
3. Workers が OAuth プロバイダーへリダイレクト（PKCE + state）
4. コールバック時に Workers が D1 にユーザーを upsert
5. session_id (HttpOnly Cookie) をセット
6. フロントエンドの /#/dynamic-qr にリダイレクト
7. 以降のリクエストはすべて credentials: "include" で Cookie を送信
```

---

## テスト

```bash
npx vitest run
```

| テストファイル | 内容 |
|---|---|
| `colorUtils.test.ts` | 色変換ユーティリティ |
| `use-dynamic-qr.test.ts` | 時限 QR Hook |
| `use-vcard.test.ts` | vCard Hook |
| `use-tour-guide.test.ts` | ツアーガイド Hook |
| `vcard-utils.test.ts` | vCard 文字列生成 |

---

## 関連ドキュメント

- [Workers セットアップガイド](./workers/README.md) — OAuth・D1・デプロイ手順
- [ロゴ埋め込みガイド](./doc/LOGO_EMBEDDING_GUIDE.md)
- [ツアー改善計画](./doc/TOUR_IMPROVEMENT_PLAN.md)


