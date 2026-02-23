import { Hono } from "hono"
import { Google, GitHub } from "arctic"
import type { Env } from "../types"
import { setSessionCookie, clearSessionCookie, createSession } from "../middleware/session"

const STATE_TTL = 60 * 10 // 10 minutes

function generateState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function generateUserId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .filter((parts) => parts.length === 2)
      .map(([k, v]) => [k.trim(), decodeURIComponent(v.trim())]),
  )
}

export const authRoutes = new Hono<{ Bindings: Env }>()

// GET /auth/login/google
authRoutes.get("/login/google", async (ctx) => {
  const workerUrl = new URL(ctx.req.url).origin
  const google = new Google(
    ctx.env.GOOGLE_CLIENT_ID,
    ctx.env.GOOGLE_CLIENT_SECRET,
    `${workerUrl}/auth/callback/google`,
  )

  const state = generateState()
  const codeVerifier = generateState() // PKCE
  const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"])

  // Store state + codeVerifier in KV (10 min TTL)
  await ctx.env.AUTH_STATE_KV.put(
    `oauth_state:${state}`,
    JSON.stringify({ codeVerifier, provider: "google" }),
    { expirationTtl: STATE_TTL },
  )

  return ctx.redirect(url.toString())
})

// GET /auth/login/github
authRoutes.get("/login/github", async (ctx) => {
  const workerUrl = new URL(ctx.req.url).origin
  const github = new GitHub(
    ctx.env.GITHUB_CLIENT_ID,
    ctx.env.GITHUB_CLIENT_SECRET,
    `${workerUrl}/auth/callback/github`,
  )

  const state = generateState()
  const url = github.createAuthorizationURL(state, [])

  await ctx.env.AUTH_STATE_KV.put(
    `oauth_state:${state}`,
    JSON.stringify({ provider: "github" }),
    { expirationTtl: STATE_TTL },
  )

  return ctx.redirect(url.toString())
})

// GET /auth/callback/google
authRoutes.get("/callback/google", async (ctx) => {
  const workerUrl = new URL(ctx.req.url).origin
  const { code, state } = ctx.req.query()

  if (!code || !state) {
    return ctx.text("Missing code or state", 400)
  }

  const storedRaw = await ctx.env.AUTH_STATE_KV.get(`oauth_state:${state}`)
  if (!storedRaw) {
    return ctx.text("Invalid or expired state", 400)
  }
  await ctx.env.AUTH_STATE_KV.delete(`oauth_state:${state}`)

  const stored = JSON.parse(storedRaw) as { codeVerifier: string; provider: string }
  if (stored.provider !== "google") {
    return ctx.text("State mismatch", 400)
  }

  const google = new Google(
    ctx.env.GOOGLE_CLIENT_ID,
    ctx.env.GOOGLE_CLIENT_SECRET,
    `${workerUrl}/auth/callback/google`,
  )

  let tokens
  try {
    tokens = await google.validateAuthorizationCode(code, stored.codeVerifier)
  } catch {
    return ctx.text("Failed to exchange code", 400)
  }

  // Fetch Google user info
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.accessToken()}` },
  })
  if (!userInfoRes.ok) {
    return ctx.text("Failed to fetch user info", 500)
  }
  const userInfo = (await userInfoRes.json()) as {
    id: string
    email?: string
    name?: string
    picture?: string
  }

  const userId = await upsertUser(ctx.env.DB, {
    provider: "google",
    providerId: userInfo.id,
    email: userInfo.email ?? null,
    name: userInfo.name ?? null,
    avatarUrl: userInfo.picture ?? null,
  })

  const sessionId = await createSession(ctx.env.DB, userId)
  const isProd = !ctx.req.url.includes("localhost")
  setSessionCookie(ctx, sessionId, isProd)

  const frontendUrl = ctx.env.FRONTEND_URL ?? "http://localhost:5173"
  return ctx.redirect(`${frontendUrl}/#/dynamic-qr`)
})

// GET /auth/callback/github
authRoutes.get("/callback/github", async (ctx) => {
  const workerUrl = new URL(ctx.req.url).origin
  const { code, state } = ctx.req.query()

  if (!code || !state) {
    return ctx.text("Missing code or state", 400)
  }

  const storedRaw = await ctx.env.AUTH_STATE_KV.get(`oauth_state:${state}`)
  if (!storedRaw) {
    return ctx.text("Invalid or expired state", 400)
  }
  await ctx.env.AUTH_STATE_KV.delete(`oauth_state:${state}`)

  const stored = JSON.parse(storedRaw) as { provider: string }
  if (stored.provider !== "github") {
    return ctx.text("State mismatch", 400)
  }

  const github = new GitHub(
    ctx.env.GITHUB_CLIENT_ID,
    ctx.env.GITHUB_CLIENT_SECRET,
    `${workerUrl}/auth/callback/github`,
  )

  let tokens
  try {
    tokens = await github.validateAuthorizationCode(code)
  } catch {
    return ctx.text("Failed to exchange code", 400)
  }

  // Fetch GitHub user info
  const userInfoRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
      "User-Agent": "qr-generator-web",
    },
  })
  if (!userInfoRes.ok) {
    return ctx.text("Failed to fetch user info", 500)
  }
  const userInfo = (await userInfoRes.json()) as {
    id: number
    login: string
    name?: string
    avatar_url?: string
    email?: string
  }

  // GitHub may not expose email; fetch primary email separately
  let email: string | null = userInfo.email ?? null
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
        "User-Agent": "qr-generator-web",
      },
    })
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{
        email: string
        primary: boolean
        verified: boolean
      }>
      email = emails.find((e) => e.primary && e.verified)?.email ?? null
    }
  }

  const userId = await upsertUser(ctx.env.DB, {
    provider: "github",
    providerId: String(userInfo.id),
    email,
    name: userInfo.name ?? userInfo.login,
    avatarUrl: userInfo.avatar_url ?? null,
  })

  const sessionId = await createSession(ctx.env.DB, userId)
  const isProd = !ctx.req.url.includes("localhost")
  setSessionCookie(ctx, sessionId, isProd)

  const frontendUrl = ctx.env.FRONTEND_URL ?? "http://localhost:5173"
  return ctx.redirect(`${frontendUrl}/#/dynamic-qr`)
})

// GET /auth/me — returns current user or 401
authRoutes.get("/me", async (ctx) => {
  const cookieHeader = ctx.req.header("Cookie") ?? ""
  const cookies = parseCookies(cookieHeader)
  const sessionId = cookies["session_id"]

  if (!sessionId) {
    return ctx.json({ error: "Unauthorized" }, 401)
  }

  const row = await ctx.env.DB.prepare(
    `SELECT u.id, u.provider, u.provider_id, u.email, u.name, u.avatar_url, u.created_at, u.updated_at
     FROM sessions s JOIN users u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > ?`,
  )
    .bind(sessionId, new Date().toISOString())
    .first<{
      id: string
      provider: string
      provider_id: string
      email: string | null
      name: string | null
      avatar_url: string | null
      created_at: string
      updated_at: string
    }>()

  if (!row) {
    return ctx.json({ error: "Unauthorized" }, 401)
  }

  return ctx.json(row)
})

// POST /auth/logout
authRoutes.post("/logout", async (ctx) => {
  const cookieHeader = ctx.req.header("Cookie") ?? ""
  const cookies = parseCookies(cookieHeader)
  const sessionId = cookies["session_id"]

  if (sessionId) {
    await ctx.env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run()
  }

  const isProd = !ctx.req.url.includes("localhost")
  clearSessionCookie(ctx, isProd)
  return ctx.json({ ok: true })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertUser(
  db: D1Database,
  opts: {
    provider: string
    providerId: string
    email: string | null
    name: string | null
    avatarUrl: string | null
  },
): Promise<string> {
  const existing = await db
    .prepare("SELECT id FROM users WHERE provider = ? AND provider_id = ?")
    .bind(opts.provider, opts.providerId)
    .first<{ id: string }>()

  const now = new Date().toISOString()

  if (existing) {
    await db
      .prepare(
        "UPDATE users SET email = ?, name = ?, avatar_url = ?, updated_at = ? WHERE id = ?",
      )
      .bind(opts.email, opts.name, opts.avatarUrl, now, existing.id)
      .run()
    return existing.id
  }

  const id = generateUserId()
  await db
    .prepare(
      "INSERT INTO users (id, provider, provider_id, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(id, opts.provider, opts.providerId, opts.email, opts.name, opts.avatarUrl, now, now)
    .run()
  return id
}

// D1Database type alias
type D1Database = Env["DB"]
