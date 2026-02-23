import type { VCardData } from "@/features/vcard/types"

export interface VCardRecord {
  id: string
  user_id: string
  label: string
  data: VCardData
  created_at: string
  updated_at: string
}

const BASE = import.meta.env.VITE_WORKER_BASE_URL ?? "http://localhost:8787"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch { /* ignore */ }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export async function listVCards(): Promise<{ vcards: VCardRecord[] }> {
  const res = await fetch(`${BASE}/api/vcards`, { credentials: "include" })
  return handleResponse<{ vcards: VCardRecord[] }>(res)
}

export async function createVCard(label: string, data: VCardData): Promise<VCardRecord> {
  const res = await fetch(`${BASE}/api/vcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ label, data }),
  })
  return handleResponse<VCardRecord>(res)
}

export async function updateVCard(id: string, label: string, data: VCardData): Promise<VCardRecord> {
  const res = await fetch(`${BASE}/api/vcards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ label, data }),
  })
  return handleResponse<VCardRecord>(res)
}

export async function deleteVCard(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/vcards/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) await handleResponse<void>(res)
}
