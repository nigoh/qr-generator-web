import { afterEach, beforeEach, vi } from "vitest"

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.clear()
  }
})
