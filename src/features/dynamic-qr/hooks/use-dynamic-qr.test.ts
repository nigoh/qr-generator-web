import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useDynamicQR } from "./use-dynamic-qr"
import * as api from "@/features/dynamic-qr/services/dynamic-qr-api"
import type { CreateLinkResponse, DynamicLink } from "@/features/dynamic-qr/types"

const mockCreated: CreateLinkResponse = {
  code: "abc123",
  redirect_url: "https://qr.example.com/r/abc123",
  expires_at: null,
}

const mockLink: DynamicLink = {
  code: "abc123",
  target_url: "https://example.com",
  status: "active",
  expires_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  note: null,
}

describe("useDynamicQR", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("starts with empty state", () => {
    const { result } = renderHook(() => useDynamicQR())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.lastCreated).toBeNull()
    expect(result.current.currentLink).toBeNull()
    expect(result.current.links).toEqual([])
  })

  it("creates a link and stores lastCreated", async () => {
    vi.spyOn(api, "createLink").mockResolvedValue(mockCreated)
    const { result } = renderHook(() => useDynamicQR())

    let response: CreateLinkResponse | null = null
    await act(async () => {
      response = await result.current.create({
        target_url: "https://example.com",
      })
    })

    expect(response).toEqual(mockCreated)
    expect(result.current.lastCreated).toEqual(mockCreated)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("sets error when create fails", async () => {
    vi.spyOn(api, "createLink").mockRejectedValue(new Error("HTTP 500"))
    const { result } = renderHook(() => useDynamicQR())

    await act(async () => {
      await result.current.create({ target_url: "https://example.com" })
    })

    expect(result.current.error).toBe("HTTP 500")
    expect(result.current.lastCreated).toBeNull()
  })

  it("returns null and sets error on network failure", async () => {
    vi.spyOn(api, "createLink").mockRejectedValue(new Error("fetch failed"))
    const { result } = renderHook(() => useDynamicQR())

    let response: CreateLinkResponse | null = null
    await act(async () => {
      response = await result.current.create({ target_url: "https://example.com" })
    })

    expect(response).toBeNull()
    expect(result.current.error).toBe("fetch failed")
  })

  it("fetches and stores currentLink", async () => {
    vi.spyOn(api, "getLink").mockResolvedValue(mockLink)
    const { result } = renderHook(() => useDynamicQR())

    await act(async () => {
      await result.current.fetch("abc123")
    })

    expect(result.current.currentLink).toEqual(mockLink)
  })

  it("disables a link", async () => {
    const disabled = { ...mockLink, status: "disabled" as const }
    vi.spyOn(api, "disableLink").mockResolvedValue(disabled)
    const { result } = renderHook(() => useDynamicQR())

    await act(async () => {
      await result.current.disable("abc123")
    })

    expect(result.current.currentLink?.status).toBe("disabled")
  })

  it("clearError resets error state", async () => {
    vi.spyOn(api, "createLink").mockRejectedValue(new Error("fail"))
    const { result } = renderHook(() => useDynamicQR())

    await act(async () => {
      await result.current.create({ target_url: "https://example.com" })
    })
    expect(result.current.error).toBeTruthy()

    act(() => {
      result.current.clearError()
    })
    expect(result.current.error).toBeNull()
  })
})
