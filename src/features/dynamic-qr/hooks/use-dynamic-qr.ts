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

export function useDynamicQR(): UseDynamicQRResult {
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
      return withLoading(async () => {
        const response = await createLink(req)
        setState((prev) => ({ ...prev, lastCreated: response }))
        return response
      })
    },
    [withLoading],
  )

  const fetch = useCallback(
    async (code: string): Promise<DynamicLink | null> => {
      return withLoading(async () => {
        const link = await getLink(code)
        setState((prev) => ({ ...prev, currentLink: link }))
        return link
      })
    },
    [withLoading],
  )

  const update = useCallback(
    async (code: string, req: UpdateLinkRequest): Promise<DynamicLink | null> => {
      return withLoading(async () => {
        const link = await updateLink(code, req)
        setState((prev) => ({ ...prev, currentLink: link }))
        return link
      })
    },
    [withLoading],
  )

  const disable = useCallback(
    async (code: string): Promise<DynamicLink | null> => {
      return withLoading(async () => {
        const link = await disableLink(code)
        setState((prev) => ({ ...prev, currentLink: link }))
        return link
      })
    },
    [withLoading],
  )

  const fetchList = useCallback(
    async (limit = 20, cursor?: string): Promise<void> => {
      await withLoading(async () => {
        const result = await listLinks(limit, cursor)
        setState((prev) => ({ ...prev, links: result.links }))
        return result
      })
    },
    [withLoading],
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
