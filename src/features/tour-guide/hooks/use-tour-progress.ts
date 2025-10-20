import { useMemo } from "react"
import type {
  TourGuideProgressSnapshot,
  TourStep,
  TourStepId,
} from "@/features/tour-guide/types"

interface UseTourProgressInput {
  steps: TourStep[]
  completedStepIds: TourStepId[]
  skippedStepIds: TourStepId[]
}

export function useTourProgress({
  steps,
  completedStepIds,
  skippedStepIds,
}: UseTourProgressInput): TourGuideProgressSnapshot {
  return useMemo(() => {
    const totalSteps = steps.length
    const completedSet = new Set(completedStepIds)
    const skippedSet = new Set(skippedStepIds)

    const completedSteps = Math.min(completedSet.size, totalSteps)
    const skippedSteps = Math.min(skippedSet.size, totalSteps)
    const ratio = totalSteps === 0 ? 0 : completedSteps / totalSteps

    return {
      totalSteps,
      completedSteps,
      skippedSteps,
      ratio,
      isFinished: completedSteps + skippedSteps >= totalSteps && totalSteps > 0,
    }
  }, [steps, completedStepIds, skippedStepIds])
}
