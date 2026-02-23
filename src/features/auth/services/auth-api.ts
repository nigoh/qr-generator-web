import type { User } from "../types"

const BASE = import.meta.env.VITE_WORKER_BASE_URL ?? "http://localhost:8787"

export async function getMe(): Promise<User | null> {
  try {
    const res = await fetch(`${BASE}/auth/me`, { credentials: "include" })
    if (!res.ok) return null
    return res.json() as Promise<User>
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" })
}

export function getLoginUrl(provider: "google" | "github"): string {
  return `${BASE}/auth/login/${provider}`
}
