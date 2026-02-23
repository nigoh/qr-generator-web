export type LinkStatus = "active" | "disabled" | "expired"

export interface DynamicLink {
  code: string
  target_url: string
  status: LinkStatus
  expires_at: string | null
  created_at: string
  updated_at: string
  note: string | null
}

export interface CreateLinkRequest {
  target_url: string
  expires_at?: string | null
  note?: string | null
}

export interface UpdateLinkRequest {
  target_url?: string
  expires_at?: string | null
  status?: LinkStatus
  note?: string | null
}

export interface CreateLinkResponse {
  code: string
  redirect_url: string
  expires_at: string | null
}

export interface DynamicQRConfig {
  /** Cloudflare Workers のベース URL（例: https://qr.example.com） */
  workerBaseUrl: string
  /** 管理 API 認証トークン */
  adminToken: string
}
