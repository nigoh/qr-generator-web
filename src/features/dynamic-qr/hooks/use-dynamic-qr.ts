import { useCallback, useState } from "react"
import {
  createLink,
  disableLink,
  getLink,
  listLinks,
  updateLink,
} from "@/features/dynamic-qr/services/dynamic-qr-api"
import type {
  CreateLinkRequest,
  CreateLinkResponse,
  DynamicLink,
  DynamicQRConfig,
  UpdateLinkRequest,
} from "@/features/dynamic-qr/types"

interface UseDynamicQRState {
  isLoading: boolean
  error: string | null
  lastCreated: CreateLinkResponse | null
  currentLink: DynamicLink | null
  links: DynamicLink[]
}

interface UseDynamicQRResult extends UseDynamicQRState {
  create: (req: CreateLinkRequest) => Promise<CreateLinkResponse | null>
  fetch: (code: string) => Promise<DynamicLink | null>
  update: (code: string, req: UpdateLinkRequest) => Promise<DynamicLink | null>
  disable: (code: string) => Promise<DynamicLink | null>
  fetchList: (limit?: number, cursor?: string) => Promise<void>
  clearError: () => void
  resetLastCreated: () => void
}

function isConfigured(config: Partial<DynamicQRConfig>): config is DynamicQRConfig {
  return Boolean(config.workerBaseUrl) && Boolean(config.adminToken)
}

export function useDynamicQR(config: Partial<DynamicQRConfig>): UseDynamicQRResult {
  const [state, setState] = useState<UseDynamicQRState>({
    isLoading: false,
    error: null,
    lastCreated: null,
    currentLink: null,
    links: [],
  })

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const result = await fn()
        setState((prev) => ({ ...prev, isLoading: false }))
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "不明なエラーが発生しました"
        setState((prev) => ({ ...prev, isLoading: false, error: message }))
        return null
      }
    },
    [],
  )

  const create = useCallback(
    async (req: CreateLinkRequest): Promise<CreateLinkResponse | null> => {
      if (!isConfigured(config)) {
        setState((prev) => ({
          ...prev,
          error: "Worker URL と管理トークンを設定してください",
        }))
        return null
      }
      return withLoading(async () => {
        const response = await createLink(req, config)
        setState((prev) => ({ ...prev, lastCreated: response }))
        return response
      })
    },
    [config, withLoading],
  )

  const fetch = useCallback(
    async (code: string): Promise<DynamicLink | null> => {
      if (!isConfigured(config)) {
        setState((prev) => ({
          ...prev,
          error: "Worker URL と管理トークンを設定してください",
        }))
        return null
      }
      return withLoading(async () => {
        const link = await getLink(code, config)
        setState((prev) => ({ ...prev, currentLink: link }))
        return link
      })
    },
    [config, withLoading],
  )

  const update = useCallback(
    async (code: string, req: UpdateLinkRequest): Promise<DynamicLink | null> => {
      if (!isConfigured(config)) {
        setState((prev) => ({
          ...prev,
          error: "Worker URL と管理トークンを設定してください",
        }))
        return null
      }
      return withLoading(async () => {
        const link = await updateLink(code, req, config)
        setState((prev) => ({ ...prev, currentLink: link }))
        return link
      })
    },
    [config, withLoading],
  )

  const disable = useCallback(
    async (code: string): Promise<DynamicLink | null> => {
      if (!isConfigured(config)) {
        setState((prev) => ({
          ...prev,
          error: "Worker URL と管理トークンを設定してください",
        }))
        return null
      }
      return withLoading(async () => {
        const link = await disableLink(code, config)
        setState((prev) => ({ ...prev, currentLink: link }))
        return link
      })
    },
    [config, withLoading],
  )

  const fetchList = useCallback(
    async (limit = 20, cursor?: string): Promise<void> => {
      if (!isConfigured(config)) {
        setState((prev) => ({
          ...prev,
          error: "Worker URL と管理トークンを設定してください",
        }))
        return
      }
      await withLoading(async () => {
        const result = await listLinks(config, limit, cursor)
        setState((prev) => ({ ...prev, links: result.links }))
        return result
      })
    },
    [config, withLoading],
  )

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const resetLastCreated = useCallback(() => {
    setState((prev) => ({ ...prev, lastCreated: null }))
  }, [])

  return {
    ...state,
    create,
    fetch,
    update,
    disable,
    fetchList,
    clearError,
    resetLastCreated,
  }
}
