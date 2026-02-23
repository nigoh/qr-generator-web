import { Hono } from "hono"
import type { Env, DynamicLink, LinkStatus } from "../types"
import { requireAuth, type Variables } from "../middleware/session"

const CODE_PATTERN = /^[A-Za-z0-9]{4,16}$/

function generateCode(n = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const bytes = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(bytes, (b) => chars[b % chars.length]).join("")
}

function isSafeUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export const linksRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

linksRoutes.use("/*", requireAuth())

// POST /api/links — リンク作成
linksRoutes.post("/", async (ctx) => {
  const user = ctx.get("user")
  const body = (await ctx.req.json()) as Record<string, unknown>

  const target_url = typeof body.target_url === "string" ? body.target_url : ""
  if (!target_url || !isSafeUrl(target_url)) {
    return ctx.json({ error: "target_url は有効な http/https URL を指定してください" }, 400)
  }

  const expires_at =
    typeof body.expires_at === "string" ? body.expires_at
    : body.expires_at == null ? null
    : null

  const note = typeof body.note === "string" ? body.note : null

  // 重複しないコードを生成（最大5回リトライ）
  let code = ""
  for (let i = 0; i < 5; i++) {
    const candidate = generateCode(10)
    const existing = await ctx.env.DB.prepare("SELECT code FROM dynamic_links WHERE code = ?")
      .bind(candidate)
      .first()
    if (!existing) {
      code = candidate
      break
    }
  }
  if (!code) {
    return ctx.json({ error: "コードの生成に失敗しました。もう一度お試しください。" }, 500)
  }

  const now = new Date().toISOString()
  await ctx.env.DB.prepare(
    "INSERT INTO dynamic_links (code, user_id, target_url, status, expires_at, note, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?, ?, ?)",
  )
    .bind(code, user.id, target_url, expires_at, note, now, now)
    .run()

  const workerUrl = new URL(ctx.req.url).origin
  return ctx.json({ code, redirect_url: `${workerUrl}/r/${code}`, expires_at }, 201)
})

// GET /api/links — リンク一覧
linksRoutes.get("/", async (ctx) => {
  const user = ctx.get("user")
  const limit = Math.min(parseInt(ctx.req.query("limit") ?? "20", 10), 100)
  const offset = parseInt(ctx.req.query("offset") ?? "0", 10)

  const rows = await ctx.env.DB.prepare(
    "SELECT * FROM dynamic_links WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
  )
    .bind(user.id, limit, offset)
    .all<DynamicLink>()

  const total = await ctx.env.DB.prepare(
    "SELECT COUNT(*) as count FROM dynamic_links WHERE user_id = ?",
  )
    .bind(user.id)
    .first<{ count: number }>()

  return ctx.json({ links: rows.results, total: total?.count ?? 0, offset, limit })
})

// GET /api/links/:code — リンク詳細
linksRoutes.get("/:code", async (ctx) => {
  const user = ctx.get("user")
  const { code } = ctx.req.param()

  if (!CODE_PATTERN.test(code)) {
    return ctx.json({ error: "不正なコードです" }, 400)
  }

  const link = await ctx.env.DB.prepare(
    "SELECT * FROM dynamic_links WHERE code = ? AND user_id = ?",
  )
    .bind(code, user.id)
    .first<DynamicLink>()

  if (!link) {
    return ctx.json({ error: "リンクが見つかりません" }, 404)
  }

  return ctx.json(link)
})

// PATCH /api/links/:code — リンク更新
linksRoutes.patch("/:code", async (ctx) => {
  const user = ctx.get("user")
  const { code } = ctx.req.param()

  if (!CODE_PATTERN.test(code)) {
    return ctx.json({ error: "不正なコードです" }, 400)
  }

  const link = await ctx.env.DB.prepare(
    "SELECT * FROM dynamic_links WHERE code = ? AND user_id = ?",
  )
    .bind(code, user.id)
    .first<DynamicLink>()

  if (!link) {
    return ctx.json({ error: "リンクが見つかりません" }, 404)
  }

  const body = (await ctx.req.json()) as Record<string, unknown>
  const updated = { ...link, updated_at: new Date().toISOString() }

  if (typeof body.target_url === "string") {
    if (!isSafeUrl(body.target_url)) {
      return ctx.json({ error: "target_url は有効な http/https URL を指定してください" }, 400)
    }
    updated.target_url = body.target_url
  }

  if ("expires_at" in body) {
    updated.expires_at = typeof body.expires_at === "string" ? body.expires_at : null
  }

  if (
    typeof body.status === "string" &&
    ["active", "disabled", "expired"].includes(body.status)
  ) {
    updated.status = body.status as LinkStatus
  }

  if ("note" in body) {
    updated.note = typeof body.note === "string" ? body.note : null
  }

  await ctx.env.DB.prepare(
    "UPDATE dynamic_links SET target_url = ?, status = ?, expires_at = ?, note = ?, updated_at = ? WHERE code = ? AND user_id = ?",
  )
    .bind(updated.target_url, updated.status, updated.expires_at, updated.note, updated.updated_at, code, user.id)
    .run()

  return ctx.json(updated)
})

// POST /api/links/:code/disable — 無効化
linksRoutes.post("/:code/disable", async (ctx) => {
  const user = ctx.get("user")
  const { code } = ctx.req.param()

  if (!CODE_PATTERN.test(code)) {
    return ctx.json({ error: "不正なコードです" }, 400)
  }

  const link = await ctx.env.DB.prepare(
    "SELECT * FROM dynamic_links WHERE code = ? AND user_id = ?",
  )
    .bind(code, user.id)
    .first<DynamicLink>()

  if (!link) {
    return ctx.json({ error: "リンクが見つかりません" }, 404)
  }

  const now = new Date().toISOString()
  await ctx.env.DB.prepare(
    "UPDATE dynamic_links SET status = 'disabled', updated_at = ? WHERE code = ? AND user_id = ?",
  )
    .bind(now, code, user.id)
    .run()

  return ctx.json({ ...link, status: "disabled", updated_at: now })
})
