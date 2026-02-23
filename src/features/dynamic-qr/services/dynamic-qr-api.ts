import type {
  CreateLinkRequest,
  CreateLinkResponse,
  DynamicLink,
  UpdateLinkRequest,
} from "@/features/dynamic-qr/types"

export interface ApiClientOptions {
  workerBaseUrl: string
  adminToken: string
}

function buildHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

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
  options: ApiClientOptions,
): Promise<CreateLinkResponse> {
  const res = await fetch(`${options.workerBaseUrl}/api/links`, {
    method: "POST",
    headers: buildHeaders(options.adminToken),
    body: JSON.stringify(request),
  })
  return handleResponse<CreateLinkResponse>(res)
}

/** GET /api/links/{code} – リンク詳細取得 */
export async function getLink(
  code: string,
  options: ApiClientOptions,
): Promise<DynamicLink> {
  const res = await fetch(`${options.workerBaseUrl}/api/links/${code}`, {
    method: "GET",
    headers: buildHeaders(options.adminToken),
  })
  return handleResponse<DynamicLink>(res)
}

/** PATCH /api/links/{code} – リンク更新 */
export async function updateLink(
  code: string,
  request: UpdateLinkRequest,
  options: ApiClientOptions,
): Promise<DynamicLink> {
  const res = await fetch(`${options.workerBaseUrl}/api/links/${code}`, {
    method: "PATCH",
    headers: buildHeaders(options.adminToken),
    body: JSON.stringify(request),
  })
  return handleResponse<DynamicLink>(res)
}

/** POST /api/links/{code}/disable – リンクを無効化 */
export async function disableLink(
  code: string,
  options: ApiClientOptions,
): Promise<DynamicLink> {
  const res = await fetch(`${options.workerBaseUrl}/api/links/${code}/disable`, {
    method: "POST",
    headers: buildHeaders(options.adminToken),
  })
  return handleResponse<DynamicLink>(res)
}

/** GET /api/links – リンク一覧取得 */
export async function listLinks(
  options: ApiClientOptions,
  limit = 20,
  cursor?: string,
): Promise<{ links: DynamicLink[]; cursor?: string }> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) {
    params.set("cursor", cursor)
  }
  const res = await fetch(
    `${options.workerBaseUrl}/api/links?${params.toString()}`,
    {
      method: "GET",
      headers: buildHeaders(options.adminToken),
    },
  )
  return handleResponse<{ links: DynamicLink[]; cursor?: string }>(res)
}
