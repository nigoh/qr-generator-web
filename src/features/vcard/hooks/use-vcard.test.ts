import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useVCard } from "./use-vcard"
import * as api from "@/features/vcard/services/vcard-api"
import type { VCardRecord } from "@/features/vcard/services/vcard-api"

const mockRecord: VCardRecord = {
  id: "vc-1",
  user_id: "user-1",
  label: "仕事用",
  data: {
    lastName: "山田",
    firstName: "太郎",
    lastNameKana: "やまだ",
    firstNameKana: "たろう",
    company: "テスト株式会社",
    title: "エンジニア",
    phone: "090-0000-0000",
    email: "yamada@example.com",
    url: "https://example.com",
    address: "東京都",
    note: "",
  },
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

describe("useVCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // 初回一覧取得をデフォルトでモック
    vi.spyOn(api, "listVCards").mockResolvedValue({ vcards: [] })
  })

  it("starts with empty vcards", async () => {
    const { result } = renderHook(() => useVCard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.vcards).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it("loads vcards on mount", async () => {
    vi.spyOn(api, "listVCards").mockResolvedValue({ vcards: [mockRecord] })
    const { result } = renderHook(() => useVCard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.vcards).toHaveLength(1)
    expect(result.current.vcards[0].label).toBe("仕事用")
  })

  it("creates a vcard and appends to list", async () => {
    vi.spyOn(api, "createVCard").mockResolvedValue(mockRecord)
    const { result } = renderHook(() => useVCard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.create("仕事用", mockRecord.data)
    })

    expect(result.current.vcards).toHaveLength(1)
    expect(result.current.vcards[0].id).toBe("vc-1")
  })

  it("updates a vcard in list", async () => {
    vi.spyOn(api, "listVCards").mockResolvedValue({ vcards: [mockRecord] })
    const updated = { ...mockRecord, label: "プライベート" }
    vi.spyOn(api, "updateVCard").mockResolvedValue(updated)
    const { result } = renderHook(() => useVCard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update("vc-1", "プライベート", mockRecord.data)
    })

    expect(result.current.vcards[0].label).toBe("プライベート")
  })

  it("removes a vcard from list", async () => {
    vi.spyOn(api, "listVCards").mockResolvedValue({ vcards: [mockRecord] })
    vi.spyOn(api, "deleteVCard").mockResolvedValue(undefined)
    const { result } = renderHook(() => useVCard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let success = false
    await act(async () => {
      success = await result.current.remove("vc-1")
    })

    expect(success).toBe(true)
    expect(result.current.vcards).toHaveLength(0)
  })

  it("sets error on API failure", async () => {
    vi.spyOn(api, "createVCard").mockRejectedValue(new Error("HTTP 403"))
    const { result } = renderHook(() => useVCard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.create("test", mockRecord.data)
    })

    expect(result.current.error).toBe("HTTP 403")
  })

  it("clearError resets error state", async () => {
    vi.spyOn(api, "createVCard").mockRejectedValue(new Error("fail"))
    const { result } = renderHook(() => useVCard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.create("test", mockRecord.data)
    })
    expect(result.current.error).toBeTruthy()

    act(() => result.current.clearError())
    expect(result.current.error).toBeNull()
  })
})
