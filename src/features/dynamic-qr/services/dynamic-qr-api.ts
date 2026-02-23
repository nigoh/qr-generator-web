import type {
  CreateLinkRequest,
  CreateLinkResponse,
  DynamicLink,
  UpdateLinkRequest,
} from "@/features/dynamic-qr/types"

const BASE = import.meta.env.VITE_WORKER_BASE_URL ?? "http://localhost:8787"

const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json" }

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) {
        message = body.error
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

/** POST /api/links – 新しいダイナミックリンクを作成 */
export async function createLink(
  request: CreateLinkRequest,
): Promise<CreateLinkResponse> {
  const res = await fetch(`${BASE}/api/links`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(request),
  })
  return handleResponse<CreateLinkResponse>(res)
}

/** GET /api/links/{code} – リンク詳細取得 */
export async function getLink(code: string): Promise<DynamicLink> {
  const res = await fetch(`${BASE}/api/links/${code}`, {
    method: "GET",
    credentials: "include",
  })
  return handleResponse<DynamicLink>(res)
}

/** PATCH /api/links/{code} – リンク更新 */
export async function updateLink(
  code: string,
  request: UpdateLinkRequest,
): Promise<DynamicLink> {
  const res = await fetch(`${BASE}/api/links/${code}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(request),
  })
  return handleResponse<DynamicLink>(res)
}

/** POST /api/links/{code}/disable – リンクを無効化 */
export async function disableLink(code: string): Promise<DynamicLink> {
  const res = await fetch(`${BASE}/api/links/${code}/disable`, {
    method: "POST",
    credentials: "include",
  })
  return handleResponse<DynamicLink>(res)
}

/** GET /api/links – リンク一覧取得 */
export async function listLinks(
  limit = 20,
  cursor?: string,
): Promise<{ links: DynamicLink[]; cursor?: string }> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) {
    params.set("cursor", cursor)
  }
  const res = await fetch(`${BASE}/api/links?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  })
  return handleResponse<{ links: DynamicLink[]; cursor?: string }>(res)
}
