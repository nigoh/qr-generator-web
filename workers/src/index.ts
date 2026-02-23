/**
 * Cloudflare Workers  EQRコード生成サービス バックエンチE
 * Hono + D1 + OAuth (Google / GitHub) 構�E
 *
 * エンド�EインチE
 *   GET  /r/:code                     E期限判宁EↁEリダイレクト（�E開！E
 *   GET  /auth/login/google           EGoogle OAuth 開姁E
 *   GET  /auth/login/github           EGitHub OAuth 開姁E
 *   GET  /auth/callback/google        EGoogle OAuth コールバック
 *   GET  /auth/callback/github        EGitHub OAuth コールバック
 *   GET  /auth/me                     E現在のユーザー惁E��
 *   POST /auth/logout                 EログアウチE
 *   POST /api/links                   Eリンク作�E�E�認証忁E��！E
 *   GET  /api/links                   Eリンク一覧�E�認証忁E��！E
 *   GET  /api/links/:code             Eリンク詳細�E�認証忁E��！E
 *   PATCH /api/links/:code            Eリンク更新�E�認証忁E��！E
 *   POST /api/links/:code/disable     Eリンク無効化（認証忁E��！E
 *   GET  /api/vcards                  EvCard一覧�E�認証忁E��！E
 *   POST /api/vcards                  EvCard作�E�E�認証忁E��！E
 *   GET  /api/vcards/:id              EvCard詳細�E�認証忁E��！E
 *   PATCH /api/vcards/:id             EvCard更新�E�認証忁E��！E
 *   DELETE /api/vcards/:id            EvCard削除�E�認証忁E��！E
 */

import { Hono } from "hono"
import { cors } from "hono/cors"
import type { Env } from "./types"
import { authRoutes } from "./routes/auth"
import { linksRoutes } from "./routes/links"
import { vcardsRoutes } from "./routes/vcards"
import { redirectRoutes } from "./routes/redirect"

const app = new Hono<{ Bindings: Env }>()

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use("/*", async (ctx, next) => {
  const allowedOrigins = [
    "https://nigoh.github.io",
    "http://localhost:5173",
    "http://localhost:4173",
  ]

  if (ctx.env.FRONTEND_URL && !allowedOrigins.includes(ctx.env.FRONTEND_URL)) {
    allowedOrigins.push(ctx.env.FRONTEND_URL)
  }

  return cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  })(ctx, next)
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.route("/r", redirectRoutes)
app.route("/auth", authRoutes)
app.route("/api/links", linksRoutes)
app.route("/api/vcards", vcardsRoutes)

app.all("*", (ctx) => ctx.json({ error: "Not Found" }, 404))

export default app


