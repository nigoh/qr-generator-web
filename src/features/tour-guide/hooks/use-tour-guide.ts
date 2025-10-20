import { useCallback, useEffect, useMemo, useState } from "react"
import {
  consoleTourAnalyticsClient,
  logTourEvent,
} from "@/features/tour-guide/services/tour-analytics"
import {
  getDefaultUserState,
  loadTourUserState,
  persistTourUserState,
} from "@/features/tour-guide/services/tour-storage"
import type {
  TourGuideSettings,
  TourGuideState,
  TourGuideUserState,
  TourStep,
  TourStepId,
} from "@/features/tour-guide/types"

interface UseTourGuideOptions {
  settings?: Partial<TourGuideSettings>
  onStart?: (state: TourGuideState) => void
  onComplete?: (state: TourGuideState) => void
  onDismiss?: (state: TourGuideState) => void
}

interface UseTourGuideResult {
  isActive: boolean
  hasCompleted: boolean
  allowSkip: boolean
  canSkipCurrentStep: boolean
  canGoPrev: boolean
  canGoNext: boolean
  currentStepIndex: number
  totalSteps: number
  activeStep: TourStep | null
  completedStepIds: TourStepId[]
  skippedStepIds: TourStepId[]
  startedAt: number | null
  endedAt: number | null
  userState: TourGuideUserState
  showReplayBanner: boolean
  targetRect: DOMRect | null
  start: () => void
  replay: () => void
  next: () => void
  prev: () => void
  skip: () => void
  end: () => void
  goToStep: (stepId: TourStepId) => void
}

const defaultSettings: TourGuideSettings = {
  allowSkip: true,
  autoProgress: false,
  showProgress: true,
  focusOnTarget: true,
}

function createInitialState(
  steps: TourStep[],
  userState: TourGuideUserState,
): TourGuideState {
  const lastStepIndex = userState.lastStepId
    ? steps.findIndex((step) => step.id === userState.lastStepId)
    : 0

  return {
    isActive: false,
    currentStepIndex: lastStepIndex < 0 ? 0 : lastStepIndex,
    completedStepIds: uniqueIds(userState.completedStepIds),
    skippedStepIds: uniqueIds(userState.skippedStepIds),
    startedAt: null,
    endedAt: userState.lastCompletedAt,
    userDismissed: Boolean(userState.dismissedAt),
  }
}

function uniqueIds(ids: TourStepId[]): TourStepId[] {
  return Array.from(new Set(ids))
}

export function useTourGuide(
  steps: TourStep[],
  options?: UseTourGuideOptions,
): UseTourGuideResult {
  const { settings, onStart, onComplete, onDismiss } = options ?? {}

  const resolvedSettings = useMemo(
    () => ({ ...defaultSettings, ...settings }),
    [settings],
  )

  const [userState, setUserState] = useState<TourGuideUserState>(() => {
    const stored = loadTourUserState()
    return stored ?? getDefaultUserState()
  })

  const [guideState, setGuideState] = useState<TourGuideState>(() =>
    createInitialState(steps, userState ?? getDefaultUserState()),
  )

  const updateUserState = useCallback(
    (updater: TourGuideUserState | ((prev: TourGuideUserState) => TourGuideUserState)) => {
      setUserState((prev) => {
        const nextState =
          typeof updater === "function" ? updater(prev) : updater
        persistTourUserState(nextState)
        return nextState
      })
    },
    [],
  )

  const activeStep = guideState.isActive
    ? steps[guideState.currentStepIndex] ?? null
    : null

  const allowSkipForCurrent = useMemo(() => {
    if (!guideState.isActive || !resolvedSettings.allowSkip) {
      return false
    }
    return activeStep?.allowSkip ?? true
  }, [guideState.isActive, resolvedSettings.allowSkip, activeStep])

  const start = useCallback(() => {
    if (steps.length === 0) {
      return
    }
    const timestamp = Date.now()
    const nextState: TourGuideState = {
      isActive: true,
      currentStepIndex: 0,
      completedStepIds: [],
      skippedStepIds: [],
      startedAt: timestamp,
      endedAt: null,
      userDismissed: false,
    }

    setGuideState(nextState)
    updateUserState(() => ({
      lastCompletedAt: null,
      lastStepId: steps[0]?.id ?? null,
      completedStepIds: [],
      skippedStepIds: [],
      dismissedAt: null,
    }))

    logTourEvent(
      { type: "start", stepId: steps[0]?.id, timestamp },
      consoleTourAnalyticsClient,
    )
    onStart?.(nextState)
  }, [onStart, steps, updateUserState])

  const replay = useCallback(() => {
    if (steps.length === 0) {
      return
    }
    const timestamp = Date.now()
    const resetState: TourGuideState = {
      isActive: true,
      currentStepIndex: 0,
      completedStepIds: [],
      skippedStepIds: [],
      startedAt: timestamp,
      endedAt: null,
      userDismissed: false,
    }
    setGuideState(resetState)
    updateUserState((prev) => ({
      ...prev,
      lastCompletedAt: null,
      lastStepId: steps[0]?.id ?? null,
      completedStepIds: [],
      skippedStepIds: [],
      dismissedAt: null,
    }))
    logTourEvent(
      { type: "replay", stepId: steps[0]?.id, timestamp },
      consoleTourAnalyticsClient,
    )
  }, [steps, updateUserState])

  const next = useCallback(() => {
    if (!guideState.isActive) {
      return
    }

    setGuideState((prev) => {
      const timestamp = Date.now()
      const current = steps[prev.currentStepIndex]
      const completed = uniqueIds([
        ...prev.completedStepIds,
        current?.id ?? "",
      ].filter(Boolean) as TourStepId[])
      const isLastStep = prev.currentStepIndex >= steps.length - 1
      const nextState: TourGuideState = isLastStep
        ? {
            ...prev,
            completedStepIds: completed,
            isActive: false,
            endedAt: timestamp,
          }
        : {
            ...prev,
            completedStepIds: completed,
            currentStepIndex: Math.min(
              prev.currentStepIndex + 1,
              steps.length - 1,
            ),
          }

      updateUserState((prevUser) => ({
        ...prevUser,
        lastCompletedAt: isLastStep ? timestamp : prevUser.lastCompletedAt,
        lastStepId: steps[nextState.currentStepIndex]?.id ?? null,
        completedStepIds: completed,
        skippedStepIds: uniqueIds(nextState.skippedStepIds),
        dismissedAt: prevUser.dismissedAt,
      }))

      logTourEvent(
        {
          type: isLastStep ? "complete" : "step:next",
          stepId: current?.id,
          timestamp,
        },
        consoleTourAnalyticsClient,
      )

      if (isLastStep) {
        onComplete?.(nextState)
      }

      return nextState
    })
  }, [guideState.isActive, onComplete, steps, updateUserState])

  const prev = useCallback(() => {
    if (!guideState.isActive || guideState.currentStepIndex === 0) {
      return
    }

    const targetIndex = Math.max(guideState.currentStepIndex - 1, 0)
    const timestamp = Date.now()

    setGuideState((prevState) => ({
      ...prevState,
      currentStepIndex: targetIndex,
    }))

    updateUserState((prevUser) => ({
      ...prevUser,
      lastStepId: steps[targetIndex]?.id ?? prevUser.lastStepId,
    }))

    logTourEvent(
      { type: "step:prev", stepId: steps[targetIndex]?.id, timestamp },
      consoleTourAnalyticsClient,
    )
  }, [guideState.currentStepIndex, guideState.isActive, steps, updateUserState])

  const skip = useCallback(() => {
    if (!guideState.isActive || !allowSkipForCurrent) {
      return
    }

    setGuideState((prev) => {
      const timestamp = Date.now()
      const current = steps[prev.currentStepIndex]
      if (!current) {
        return prev
      }

      const skipped = uniqueIds([...prev.skippedStepIds, current.id])
      const isLastStep = prev.currentStepIndex >= steps.length - 1
      const nextState: TourGuideState = isLastStep
        ? {
            ...prev,
            skippedStepIds: skipped,
            isActive: false,
            endedAt: prev.endedAt,
          }
        : {
            ...prev,
            skippedStepIds: skipped,
            currentStepIndex: Math.min(
              prev.currentStepIndex + 1,
              steps.length - 1,
            ),
          }

      updateUserState((prevUser) => ({
        ...prevUser,
        lastCompletedAt: prevUser.lastCompletedAt,
        lastStepId: steps[nextState.currentStepIndex]?.id ?? null,
        completedStepIds: uniqueIds(nextState.completedStepIds),
        skippedStepIds: skipped,
        dismissedAt: prevUser.dismissedAt,
      }))

      logTourEvent(
        {
          type: isLastStep ? "complete" : "skip",
          stepId: current.id,
          timestamp,
        },
        consoleTourAnalyticsClient,
      )

      if (isLastStep) {
        onComplete?.(nextState)
      }

      return nextState
    })
  }, [allowSkipForCurrent, guideState.isActive, onComplete, steps, updateUserState])

  const end = useCallback(() => {
    if (!guideState.isActive && guideState.userDismissed) {
      return
    }

    const timestamp = Date.now()
    setGuideState((prev) => ({
      ...prev,
      isActive: false,
      userDismissed: true,
    }))

    updateUserState((prevUser) => ({
      ...prevUser,
      dismissedAt: timestamp,
    }))

    logTourEvent(
      {
        type: "dismiss",
        stepId: steps[guideState.currentStepIndex]?.id,
        timestamp,
      },
      consoleTourAnalyticsClient,
    )

    onDismiss?.({
      ...guideState,
      isActive: false,
      userDismissed: true,
    })
  }, [guideState, onDismiss, steps, updateUserState])

  const goToStep = useCallback(
    (stepId: TourStepId) => {
      const targetIndex = steps.findIndex((step) => step.id === stepId)
      if (targetIndex === -1) {
        return
      }

      setGuideState((prev) => ({
        ...prev,
        isActive: true,
        userDismissed: false,
        currentStepIndex: targetIndex,
      }))

      updateUserState((prevUser) => ({
        ...prevUser,
        lastStepId: stepId,
        dismissedAt: null,
      }))
    },
    [steps, updateUserState],
  )

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!guideState.isActive || !resolvedSettings.focusOnTarget) {
      setTargetRect(null)
      return
    }

    if (!activeStep?.targetSelector || typeof document === "undefined") {
      setTargetRect(null)
      return
    }

    const element = document.querySelector(activeStep.targetSelector)
    if (!(element instanceof HTMLElement)) {
      setTargetRect(null)
      return
    }

    let frame = 0

    const updateRect = () => {
      if (frame) {
        cancelAnimationFrame(frame)
      }
      frame = requestAnimationFrame(() => {
        setTargetRect(element.getBoundingClientRect())
      })
    }

    updateRect()

    const handleResize = () => updateRect()
    const handleScroll = () => updateRect()

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, true)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll, true)
      if (frame) {
        cancelAnimationFrame(frame)
      }
    }
  }, [activeStep?.targetSelector, guideState.isActive, resolvedSettings.focusOnTarget])

  useEffect(() => {
    if (!guideState.isActive) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        end()
        return
      }

      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault()
        next()
        return
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        prev()
        return
      }

      if (event.key === "Tab" && !allowSkipForCurrent) {
        // allow default tab behaviour
        return
      }

      if (event.key === "s" && allowSkipForCurrent) {
        event.preventDefault()
        skip()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [allowSkipForCurrent, end, guideState.isActive, next, prev, skip])

  const hasCompleted = guideState.completedStepIds.length >= steps.length
    || guideState.endedAt !== null

  return {
    isActive: guideState.isActive,
    hasCompleted,
    allowSkip: resolvedSettings.allowSkip,
    canSkipCurrentStep: allowSkipForCurrent,
    canGoPrev: guideState.isActive && guideState.currentStepIndex > 0,
    canGoNext: guideState.isActive,
    currentStepIndex: guideState.currentStepIndex,
    totalSteps: steps.length,
    activeStep,
    completedStepIds: guideState.completedStepIds,
    skippedStepIds: guideState.skippedStepIds,
    startedAt: guideState.startedAt,
    endedAt: guideState.endedAt,
    userState,
    showReplayBanner: !guideState.isActive && userState.lastCompletedAt !== null,
    targetRect,
    start,
    replay,
    next,
    prev,
    skip,
    end,
    goToStep,
  }
}
