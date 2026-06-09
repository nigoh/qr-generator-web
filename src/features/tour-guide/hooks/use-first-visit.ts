import { useCallback, useState } from "react"
import {
  loadTourUserState,
  persistTourUserState,
} from "@/features/tour-guide/services/tour-storage"

interface UseFirstVisitResult {
  /** ツアー未体験かつ未dismissの初回訪問かどうか */
  isFirstVisit: boolean
  /** 案内を閉じる（以後は表示しない） */
  dismiss: () => void
}

/**
 * 初回訪問かどうかを判定するフック。
 * ツアーの完了・スキップ・dismiss のいずれの履歴も無い場合のみ「初回」とみなす。
 * 状態は tour-guide の localStorage（dismissedAt）に記録するため、
 * リロードやツアー導線と整合する。
 */
export function useFirstVisit(): UseFirstVisitResult {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    const state = loadTourUserState()
    return (
      state.lastCompletedAt == null &&
      state.dismissedAt == null &&
      state.completedStepIds.length === 0 &&
      state.skippedStepIds.length === 0
    )
  })

  const dismiss = useCallback(() => {
    setIsFirstVisit(false)
    const state = loadTourUserState()
    persistTourUserState({ ...state, dismissedAt: Date.now() })
  }, [])

  return { isFirstVisit, dismiss }
}
