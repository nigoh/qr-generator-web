/**
 * Cloudflare Workers – 時限QR（Dynamic QR）バックエンド
 *
 * エンドポイント:
 *   GET  /r/{code}                  – 期限判定 → リダイレクト (公開)
 *   POST /api/links                 – リンク作成 (管理)
 *   GET  /api/links                 – リンク一覧 (管理)
 *   GET  /api/links/{code}          – リンク詳細 (管理)
 *   PATCH /api/links/{code}         – リンク更新 (管理)
 *   POST /api/links/{code}/disable  – リンク無効化 (管理)
 */

export interface Env {
  LINKS_KV: KVNamespace
  STATS_KV: KVNamespace
  ADMIN_TOKEN: string
}

// ─── Data types ───────────────────────────────────────────────────────────────

type LinkStatus = "active" | "disabled" | "expired"

interface DynamicLink {
  code: string
  target_url: string
  status: LinkStatus
  expires_at: string | null
  created_at: string
  updated_at: string
  note: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CODE_PATTERN = /^[A-Za-z0-9]{4,16}$/

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  })
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status)
}

function corsHeaders(origin: string): Record<string, string> {
  // Allow GitHub Pages origin and localhost for development
  const allowed = [
    "https://nigoh.github.io",
    "http://localhost:5173",
    "http://localhost:4173",
  ]
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0]
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    Vary: "Origin",
  }
}

/** CSPRNG: 英数字 n 文字のコードを生成 */
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

async function getLink(kv: KVNamespace, code: string): Promise<DynamicLink | null> {
  const raw = await kv.get(`link:${code}`)
  if (!raw) return null
  return JSON.parse(raw) as DynamicLink
}

async function putLink(kv: KVNamespace, link: DynamicLink): Promise<void> {
  await kv.put(`link:${link.code}`, JSON.stringify(link))
}

async function incrementStat(kv: KVNamespace, code: string): Promise<void> {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const key = `stats:${code}:${day}`
  const current = await kv.get(key)
  const count = current ? parseInt(current, 10) + 1 : 1
  await kv.put(key, String(count), { expirationTtl: 60 * 60 * 24 * 90 }) // 90日保持
}

function requireAuth(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization") ?? ""
  return auth === `Bearer ${env.ADMIN_TOKEN}`
}

// ─── Redirect handler ─────────────────────────────────────────────────────────

async function handleRedirect(
  code: string,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  if (!CODE_PATTERN.test(code)) {
    return new Response("Not Found", { status: 404 })
  }

  const link = await getLink(env.LINKS_KV, code)
  if (!link) {
    return new Response("Not Found", { status: 404 })
  }

  if (link.status === "disabled") {
    return new Response(disabledPage(), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    })
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    // 非同期で status を expired に更新
    ctx.waitUntil(
      putLink(env.LINKS_KV, { ...link, status: "expired", updated_at: new Date().toISOString() }),
    )
    return new Response(expiredPage(), {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    })
  }

  // 非同期でアクセス数をインクリメント
  ctx.waitUntil(incrementStat(env.STATS_KV, code))

  return Response.redirect(link.target_url, 302)
}

// ─── Management API ───────────────────────────────────────────────────────────

async function handleCreateLink(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as Record<string, unknown>
  const target_url = typeof body.target_url === "string" ? body.target_url : ""
  if (!target_url || !isSafeUrl(target_url)) {
    return error("target_url は有効な http/https URL を指定してください")
  }

  const expires_at =
    typeof body.expires_at === "string" ? body.expires_at
    : body.expires_at == null ? null
    : null

  const note = typeof body.note === "string" ? body.note : null

  // 衝突しないコードを生成（最大 5 回リトライ）
  let code = ""
  for (let i = 0; i < 5; i++) {
    const candidate = generateCode(10)
    const existing = await getLink(env.LINKS_KV, candidate)
    if (!existing) {
      code = candidate
      break
    }
  }
  if (!code) {
    return error("コードの生成に失敗しました。もう一度お試しください。", 500)
  }

  const now = new Date().toISOString()
  const link: DynamicLink = {
    code,
    target_url,
    status: "active",
    expires_at,
    created_at: now,
    updated_at: now,
    note,
  }
  await putLink(env.LINKS_KV, link)

  const host = new URL(request.url).origin
  return json(
    { code, redirect_url: `${host}/r/${code}`, expires_at },
    201,
  )
}

async function handleGetLink(code: string, env: Env): Promise<Response> {
  if (!CODE_PATTERN.test(code)) return error("不正なコードです", 400)
  const link = await getLink(env.LINKS_KV, code)
  if (!link) return error("リンクが見つかりません", 404)
  return json(link)
}

async function handleUpdateLink(
  code: string,
  request: Request,
  env: Env,
): Promise<Response> {
  if (!CODE_PATTERN.test(code)) return error("不正なコードです", 400)

  const link = await getLink(env.LINKS_KV, code)
  if (!link) return error("リンクが見つかりません", 404)

  const body = (await request.json()) as Record<string, unknown>
  const updated: DynamicLink = { ...link, updated_at: new Date().toISOString() }

  if (typeof body.target_url === "string") {
    if (!isSafeUrl(body.target_url)) {
      return error("target_url は有効な http/https URL を指定してください")
    }
    updated.target_url = body.target_url
  }

  if ("expires_at" in body) {
    updated.expires_at =
      typeof body.expires_at === "string" ? body.expires_at : null
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

  await putLink(env.LINKS_KV, updated)
  return json(updated)
}

async function handleDisableLink(code: string, env: Env): Promise<Response> {
  if (!CODE_PATTERN.test(code)) return error("不正なコードです", 400)

  const link = await getLink(env.LINKS_KV, code)
  if (!link) return error("リンクが見つかりません", 404)

  const updated: DynamicLink = {
    ...link,
    status: "disabled",
    updated_at: new Date().toISOString(),
  }
  await putLink(env.LINKS_KV, updated)
  return json(updated)
}

async function handleListLinks(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100)
  const cursor = url.searchParams.get("cursor") ?? undefined

  const list = await env.LINKS_KV.list({ prefix: "link:", limit, cursor })
  const links: DynamicLink[] = []

  for (const key of list.keys) {
    const raw = await env.LINKS_KV.get(key.name)
    if (raw) {
      links.push(JSON.parse(raw) as DynamicLink)
    }
  }

  return json({
    links,
    cursor: list.list_complete ? undefined : list.cursor,
  })
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    const reqMethod = request.method.toUpperCase()
    const origin = request.headers.get("Origin") ?? ""
    const cors = corsHeaders(origin)

    // CORS preflight
    if (reqMethod === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors })
    }

    // ── 公開: リダイレクト ────────────────────────────────────────────────
    const redirectMatch = pathname.match(/^\/r\/([A-Za-z0-9]{4,16})$/)
    if (redirectMatch) {
      const response = await handleRedirect(redirectMatch[1], env, ctx)
      // リダイレクト応答には no-store を付与
      response.headers.set("Cache-Control", "no-store")
      return response
    }

    // ── 管理 API ──────────────────────────────────────────────────────────
    if (pathname.startsWith("/api/")) {
      if (!requireAuth(request, env)) {
        return json({ error: "Unauthorized" }, 401, cors)
      }

      // POST /api/links
      if (pathname === "/api/links" && reqMethod === "POST") {
        const res = await handleCreateLink(request, env)
        for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
        return res
      }

      // GET /api/links
      if (pathname === "/api/links" && reqMethod === "GET") {
        const res = await handleListLinks(request, env)
        for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
        return res
      }

      const codeMatch = pathname.match(/^\/api\/links\/([A-Za-z0-9]{4,16})(\/disable)?$/)
      if (codeMatch) {
        const code = codeMatch[1]

        // POST /api/links/{code}/disable
        if (codeMatch[2] === "/disable" && reqMethod === "POST") {
          const res = await handleDisableLink(code, env)
          for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
          return res
        }

        // GET /api/links/{code}
        if (!codeMatch[2] && reqMethod === "GET") {
          const res = await handleGetLink(code, env)
          for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
          return res
        }

        // PATCH /api/links/{code}
        if (!codeMatch[2] && reqMethod === "PATCH") {
          const res = await handleUpdateLink(code, request, env)
          for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
          return res
        }
      }

      return json({ error: "Not Found" }, 404, cors)
    }

    return new Response("Not Found", { status: 404 })
  },
} satisfies ExportedHandler<Env>

// ─── HTML ページ ──────────────────────────────────────────────────────────────

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
    <p>このQRコードは無効化されており、アクセスできません。</p>
  </div>
</body>
</html>`
}
