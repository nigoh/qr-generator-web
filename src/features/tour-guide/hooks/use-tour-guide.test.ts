import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { useTourGuide } from "./use-tour-guide"
import type { TourStep } from "../types"

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "ようこそ",
    description: "ツアーの概要を説明します",
  },
  {
    id: "settings",
    title: "設定項目",
    description: "基本設定を確認しましょう",
  },
  {
    id: "download",
    title: "ダウンロード",
    description: "結果を保存しましょう",
  },
]

describe("useTourGuide", () => {
  beforeEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear()
    }
  })

  it("starts and completes the tour", () => {
    const { result } = renderHook(() => useTourGuide(tourSteps))

    expect(result.current.isActive).toBeFalsy()
    expect(result.current.hasCompleted).toBeFalsy()

    act(() => {
      result.current.start()
    })

    expect(result.current.isActive).toBeTruthy()
    expect(result.current.activeStep?.id).toBe("welcome")

    act(() => {
      result.current.next()
    })

    expect(result.current.activeStep?.id).toBe("settings")
    expect(result.current.completedStepIds.length).toBe(1)

    act(() => {
      result.current.next()
      result.current.next()
    })

    expect(result.current.isActive).toBeFalsy()
    expect(result.current.hasCompleted).toBeTruthy()
    expect(result.current.completedStepIds.length).toBe(3)
  })

  it("allows skipping steps when enabled", () => {
    const { result } = renderHook(() => useTourGuide(tourSteps))

    act(() => {
      result.current.start()
    })

    expect(result.current.canSkipCurrentStep).toBeTruthy()

    act(() => {
      result.current.skip()
    })

    expect(result.current.skippedStepIds.length).toBe(1)
    expect(result.current.activeStep?.id).toBe("settings")
  })

  it("replays from the beginning", () => {
    const { result } = renderHook(() => useTourGuide(tourSteps))

    act(() => {
      result.current.start()
      result.current.next()
      result.current.next()
      result.current.next()
    })

    expect(result.current.hasCompleted).toBeTruthy()

    act(() => {
      result.current.replay()
    })

    expect(result.current.isActive).toBeTruthy()
    expect(result.current.activeStep?.id).toBe("welcome")
    expect(result.current.completedStepIds.length).toBe(0)
    expect(result.current.skippedStepIds.length).toBe(0)
  })
})
