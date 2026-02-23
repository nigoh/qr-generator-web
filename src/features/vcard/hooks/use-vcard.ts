import { useCallback, useEffect, useState } from "react"
import {
  createVCard,
  deleteVCard,
  listVCards,
  updateVCard,
  type VCardRecord,
} from "@/features/vcard/services/vcard-api"
import type { VCardData } from "@/features/vcard/types"

interface UseVCardState {
  vcards: VCardRecord[]
  isLoading: boolean
  error: string | null
}

interface UseVCardResult extends UseVCardState {
  create: (label: string, data: VCardData) => Promise<VCardRecord | null>
  update: (id: string, label: string, data: VCardData) => Promise<VCardRecord | null>
  remove: (id: string) => Promise<boolean>
  clearError: () => void
}

export function useVCard(): UseVCardResult {
  const [state, setState] = useState<UseVCardState>({
    vcards: [],
    isLoading: false,
    error: null,
  })

  const run = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setState((p) => ({ ...p, isLoading: true, error: null }))
      try {
        const result = await fn()
        setState((p) => ({ ...p, isLoading: false }))
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "不明なエラーが発生しました"
        setState((p) => ({ ...p, isLoading: false, error: message }))
        return null
      }
    },
    [],
  )

  // 初回マウント時に一覧取得
  useEffect(() => {
    void run(async () => {
      const res = await listVCards()
      setState((p) => ({ ...p, vcards: res.vcards }))
      return res
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const create = useCallback(
    (label: string, data: VCardData) =>
      run(async () => {
        const record = await createVCard(label, data)
        setState((p) => ({ ...p, vcards: [...p.vcards, record] }))
        return record
      }),
    [run],
  )

  const update = useCallback(
    (id: string, label: string, data: VCardData) =>
      run(async () => {
        const record = await updateVCard(id, label, data)
        setState((p) => ({
          ...p,
          vcards: p.vcards.map((v) => (v.id === id ? record : v)),
        }))
        return record
      }),
    [run],
  )

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await run(async () => {
        await deleteVCard(id)
        setState((p) => ({ ...p, vcards: p.vcards.filter((v) => v.id !== id) }))
        return true
      })
      return result === true
    },
    [run],
  )

  const clearError = useCallback(() => {
    setState((p) => ({ ...p, error: null }))
  }, [])

  return { ...state, create, update, remove, clearError }
}
