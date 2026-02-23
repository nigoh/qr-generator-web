import { Hono } from "hono"
import type { Env, DynamicLink } from "../types"

export const redirectRoutes = new Hono<{ Bindings: Env }>()

redirectRoutes.get("/:code", async (ctx) => {
  const { code } = ctx.req.param()

  if (!/^[A-Za-z0-9]{4,16}$/.test(code)) {
    return ctx.text("Not Found", 404)
  }

  const link = await ctx.env.DB.prepare(
    "SELECT * FROM dynamic_links WHERE code = ?",
  )
    .bind(code)
    .first<DynamicLink>()

  if (!link) {
    return ctx.text("Not Found", 404)
  }

  if (link.status === "disabled") {
    return new Response(disabledPage(), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    })
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    // 非同期でstatus更新
    ctx.executionCtx.waitUntil(
      ctx.env.DB.prepare(
        "UPDATE dynamic_links SET status = 'expired', updated_at = ? WHERE code = ?",
      )
        .bind(new Date().toISOString(), code)
        .run(),
    )
    return new Response(expiredPage(), {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    })
  }

  // アクセス統計をインクリメント
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  ctx.executionCtx.waitUntil(
    ctx.env.DB.prepare(
      `INSERT INTO link_stats (code, date, count) VALUES (?, ?, 1)
       ON CONFLICT(code, date) DO UPDATE SET count = count + 1`,
    )
      .bind(code, date)
      .run(),
  )

  return ctx.redirect(link.target_url, 302)
})

function expiredPage(): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>リンクの有効期限が切れています</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
    .card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:2.5rem 2rem;max-width:400px;width:100%;text-align:center}
    .icon{font-size:3rem;margin-bottom:1rem}
    h1{font-size:1.25rem;font-weight:700;color:#1e293b;margin-bottom:.5rem}
    p{font-size:.9rem;color:#64748b;line-height:1.6}
  </style>
</head>
<body>
  <div class="card" role="main">
    <div class="icon" aria-hidden="true">⏰</div>
    <h1>リンクの有効期限が切れています</h1>
    <p>このQRコードは有効期限が過ぎているため、アクセスできません。</p>
  </div>
</body>
</html>`
}

function disabledPage(): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>このリンクは無効です</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
    .card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:2.5rem 2rem;max-width:400px;width:100%;text-align:center}
    .icon{font-size:3rem;margin-bottom:1rem}
    h1{font-size:1.25rem;font-weight:700;color:#1e293b;margin-bottom:.5rem}
    p{font-size:.9rem;color:#64748b;line-height:1.6}
  </style>
</head>
<body>
  <div class="card" role="main">
    <div class="icon" aria-hidden="true">🚫</div>
    <h1>このリンクは無効です</h1>
    <p>このQRコードは現在利用できません。</p>
  </div>
</body>
</html>`
}
