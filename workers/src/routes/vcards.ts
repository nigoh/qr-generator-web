import { Hono } from "hono"
import type { Env, VCard } from "../types"
import { requireAuth, type Variables } from "../middleware/session"

function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export const vcardsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

vcardsRoutes.use("/*", requireAuth())

// GET /api/vcards — 一覧
vcardsRoutes.get("/", async (ctx) => {
  const user = ctx.get("user")
  const rows = await ctx.env.DB.prepare(
    "SELECT * FROM vcards WHERE user_id = ? ORDER BY created_at DESC",
  )
    .bind(user.id)
    .all<VCard>()

  return ctx.json({ vcards: rows.results })
})

// POST /api/vcards — 作成
vcardsRoutes.post("/", async (ctx) => {
  const user = ctx.get("user")
  const body = (await ctx.req.json()) as Partial<VCard>
  const now = new Date().toISOString()
  const id = generateId()

  await ctx.env.DB.prepare(
    `INSERT INTO vcards
      (id, user_id, last_name, first_name, last_name_kana, first_name_kana,
       company, title, phone, email, url, address, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id, user.id,
      body.last_name ?? null, body.first_name ?? null,
      body.last_name_kana ?? null, body.first_name_kana ?? null,
      body.company ?? null, body.title ?? null,
      body.phone ?? null, body.email ?? null,
      body.url ?? null, body.address ?? null,
      body.note ?? null, now, now,
    )
    .run()

  const created = await ctx.env.DB.prepare("SELECT * FROM vcards WHERE id = ?")
    .bind(id)
    .first<VCard>()

  return ctx.json(created, 201)
})

// GET /api/vcards/:id — 詳細
vcardsRoutes.get("/:id", async (ctx) => {
  const user = ctx.get("user")
  const { id } = ctx.req.param()

  const vcard = await ctx.env.DB.prepare(
    "SELECT * FROM vcards WHERE id = ? AND user_id = ?",
  )
    .bind(id, user.id)
    .first<VCard>()

  if (!vcard) {
    return ctx.json({ error: "vCardが見つかりません" }, 404)
  }

  return ctx.json(vcard)
})

// PATCH /api/vcards/:id — 更新
vcardsRoutes.patch("/:id", async (ctx) => {
  const user = ctx.get("user")
  const { id } = ctx.req.param()

  const existing = await ctx.env.DB.prepare(
    "SELECT * FROM vcards WHERE id = ? AND user_id = ?",
  )
    .bind(id, user.id)
    .first<VCard>()

  if (!existing) {
    return ctx.json({ error: "vCardが見つかりません" }, 404)
  }

  const body = (await ctx.req.json()) as Partial<VCard>
  const now = new Date().toISOString()

  await ctx.env.DB.prepare(
    `UPDATE vcards SET
      last_name = ?, first_name = ?, last_name_kana = ?, first_name_kana = ?,
      company = ?, title = ?, phone = ?, email = ?, url = ?, address = ?, note = ?,
      updated_at = ?
     WHERE id = ? AND user_id = ?`,
  )
    .bind(
      body.last_name ?? existing.last_name,
      body.first_name ?? existing.first_name,
      body.last_name_kana ?? existing.last_name_kana,
      body.first_name_kana ?? existing.first_name_kana,
      body.company ?? existing.company,
      body.title ?? existing.title,
      body.phone ?? existing.phone,
      body.email ?? existing.email,
      body.url ?? existing.url,
      body.address ?? existing.address,
      body.note ?? existing.note,
      now, id, user.id,
    )
    .run()

  const updated = await ctx.env.DB.prepare("SELECT * FROM vcards WHERE id = ?")
    .bind(id)
    .first<VCard>()

  return ctx.json(updated)
})

// DELETE /api/vcards/:id — 削除
vcardsRoutes.delete("/:id", async (ctx) => {
  const user = ctx.get("user")
  const { id } = ctx.req.param()

  const result = await ctx.env.DB.prepare(
    "DELETE FROM vcards WHERE id = ? AND user_id = ?",
  )
    .bind(id, user.id)
    .run()

  if (result.meta.changes === 0) {
    return ctx.json({ error: "vCardが見つかりません" }, 404)
  }

  return ctx.json({ ok: true })
})
