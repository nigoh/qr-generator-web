import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useTourProgress } from "./use-tour-progress"

const demoSteps = [
  { id: "step-1", title: "Step 1", description: "" },
  { id: "step-2", title: "Step 2", description: "" },
  { id: "step-3", title: "Step 3", description: "" },
]

describe("useTourProgress", () => {
  it("calculates ratios based on completed steps", () => {
    const { result, rerender } = renderHook(
      ({ completed }: { completed: string[] }) =>
        useTourProgress({
          steps: demoSteps,
          completedStepIds: completed,
          skippedStepIds: [],
        }),
      {
        initialProps: { completed: ["step-1"] },
      },
    )

    expect(result.current.totalSteps).toBe(3)
    expect(result.current.completedSteps).toBe(1)
    expect(result.current.ratio).toEqual(1 / 3)
    expect(result.current.isFinished).toBe(false)

    rerender({ completed: ["step-1", "step-2", "step-3"] })
    expect(result.current.completedSteps).toBe(3)
    expect(result.current.ratio).toBe(1)
    expect(result.current.isFinished).toBe(true)
  })

  it("handles skipped steps", () => {
    const { result } = renderHook(() =>
      useTourProgress({
        steps: demoSteps,
        completedStepIds: ["step-1"],
        skippedStepIds: ["step-2"],
      }),
    )

    expect(result.current.completedSteps).toBe(1)
    expect(result.current.skippedSteps).toBe(1)
    expect(result.current.isFinished).toBe(false)
  })
})
