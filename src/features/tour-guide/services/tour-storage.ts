import type { TourGuideUserState, TourStepId } from "@/features/tour-guide/types"

const STORAGE_KEY = "qr-generator-web:tour-guide"

const defaultUserState: TourGuideUserState = {
  lastCompletedAt: null,
  lastStepId: null,
  completedStepIds: [],
  skippedStepIds: [],
  dismissedAt: null,
}

export function getDefaultUserState(): TourGuideUserState {
  return { ...defaultUserState }
}

export function loadTourUserState(): TourGuideUserState {
  if (typeof window === "undefined") {
    return getDefaultUserState()
  }

  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY)
    if (!serialized) {
      return getDefaultUserState()
    }

    const parsed = JSON.parse(serialized) as Partial<TourGuideUserState>

    return {
      lastCompletedAt: parsed.lastCompletedAt ?? null,
      lastStepId: parsed.lastStepId ?? null,
      completedStepIds: Array.isArray(parsed.completedStepIds)
        ? sanitizeStepIds(parsed.completedStepIds)
        : [],
      skippedStepIds: Array.isArray(parsed.skippedStepIds)
        ? sanitizeStepIds(parsed.skippedStepIds)
        : [],
      dismissedAt: parsed.dismissedAt ?? null,
    }
  } catch (error) {
    console.warn("[tour-storage] failed to parse stored state", error)
    return getDefaultUserState()
  }
}

export function persistTourUserState(state: TourGuideUserState) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn("[tour-storage] failed to persist state", error)
  }
}

export function clearTourUserState() {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn("[tour-storage] failed to clear state", error)
  }
}

function sanitizeStepIds(stepIds: unknown[]): TourStepId[] {
  return stepIds.filter((id): id is TourStepId => typeof id === "string")
}
