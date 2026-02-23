import type { Context, MiddlewareHandler } from "hono"
import type { Env, User } from "../types"

export type Variables = {
  user: User
}

const SESSION_COOKIE = "session_id"
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function setSessionCookie(
  ctx: Context,
  sessionId: string,
  isProd: boolean,
): void {
  const cookieAttrs = [
    `session_id=${sessionId}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${30 * 24 * 60 * 60}`,
    isProd ? "SameSite=None" : "SameSite=Lax",
    isProd ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")

  ctx.header("Set-Cookie", cookieAttrs)
}

export function clearSessionCookie(ctx: Context, isProd: boolean): void {
  const cookieAttrs = [
    `session_id=`,
    "HttpOnly",
    "Path=/",
    "Max-Age=0",
    isProd ? "SameSite=None" : "SameSite=Lax",
    isProd ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")

  ctx.header("Set-Cookie", cookieAttrs)
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

export function requireAuth(): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (ctx, next) => {
    const cookieHeader = ctx.req.header("Cookie") ?? ""
    const cookies = parseCookies(cookieHeader)
    const sessionId = cookies[SESSION_COOKIE]

    if (!sessionId) {
      return ctx.json({ error: "Unauthorized" }, 401)
    }

    const session = await ctx.env.DB.prepare(
      "SELECT s.user_id, s.expires_at, u.id, u.provider, u.provider_id, u.email, u.name, u.avatar_url, u.created_at, u.updated_at FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ?",
    )
      .bind(sessionId)
      .first<{
        user_id: string
        expires_at: string
        id: string
        provider: string
        provider_id: string
        email: string | null
        name: string | null
        avatar_url: string | null
        created_at: string
        updated_at: string
      }>()

    if (!session) {
      return ctx.json({ error: "Unauthorized" }, 401)
    }

    if (new Date(session.expires_at) < new Date()) {
      await ctx.env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run()
      return ctx.json({ error: "Session expired" }, 401)
    }

    ctx.set("user", {
      id: session.id,
      provider: session.provider,
      provider_id: session.provider_id,
      email: session.email,
      name: session.name,
      avatar_url: session.avatar_url,
      created_at: session.created_at,
      updated_at: session.updated_at,
    })

    await next()
  }
}

export async function createSession(
  db: D1Database,
  userId: string,
): Promise<string> {
  const sessionId = generateId(32)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(sessionId, userId, expiresAt)
    .run()
  return sessionId
}

function generateId(n: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const bytes = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(bytes, (b) => chars[b % chars.length]).join("")
}

// D1Database is available via @cloudflare/workers-types but we need to reference it inline
declare const D1Database: never
