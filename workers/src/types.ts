import type { D1Database, KVNamespace } from "@cloudflare/workers-types"

export interface Env {
  DB: D1Database
  // Legacy KV (kept for OAuth state + backward compat during migration)
  LINKS_KV: KVNamespace
  STATS_KV: KVNamespace
  AUTH_STATE_KV: KVNamespace
  // OAuth
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  // Session signing
  SESSION_SECRET: string
  // URLs
  FRONTEND_URL: string
}

export interface User {
  id: string
  provider: string
  provider_id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type LinkStatus = "active" | "disabled" | "expired"

export interface DynamicLink {
  code: string
  user_id: string
  target_url: string
  status: LinkStatus
  expires_at: string | null
  created_at: string
  updated_at: string
  note: string | null
}

export interface VCard {
  id: string
  user_id: string
  last_name: string | null
  first_name: string | null
  last_name_kana: string | null
  first_name_kana: string | null
  company: string | null
  title: string | null
  phone: string | null
  email: string | null
  url: string | null
  address: string | null
  note: string | null
  created_at: string
  updated_at: string
}
