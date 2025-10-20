export type TourStepId = string

export interface TourStep {
  id: TourStepId
  title: string
  description: string
  targetSelector?: string
  ctaLabel?: string
  allowSkip?: boolean
  tips?: string[]
}

export interface TourGuideSettings {
  allowSkip: boolean
  autoProgress: boolean
  showProgress: boolean
  focusOnTarget: boolean
}

export interface TourGuideState {
  isActive: boolean
  currentStepIndex: number
  completedStepIds: TourStepId[]
  skippedStepIds: TourStepId[]
  startedAt: number | null
  endedAt: number | null
  userDismissed: boolean
}

export interface TourGuideUserState {
  lastCompletedAt: number | null
  lastStepId: TourStepId | null
  completedStepIds: TourStepId[]
  skippedStepIds: TourStepId[]
  dismissedAt: number | null
}

export interface TourGuideProgressSnapshot {
  totalSteps: number
  completedSteps: number
  skippedSteps: number
  ratio: number
  isFinished: boolean
}

export interface TourGuideAnalyticsEvent {
  type:
    | "start"
    | "step:next"
    | "step:prev"
    | "skip"
    | "complete"
    | "dismiss"
    | "replay"
  stepId?: TourStepId
  timestamp: number
  metadata?: Record<string, unknown>
}
