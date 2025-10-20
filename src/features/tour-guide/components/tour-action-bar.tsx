import { ArrowLeft, ArrowRight, RotateCcw, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TourActionBarProps {
  isActive: boolean
  isLastStep: boolean
  canGoPrev: boolean
  canGoNext: boolean
  canSkip: boolean
  hasCompleted: boolean
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
  onReplay: () => void
  onClose: () => void
}

export function TourActionBar({
  isActive,
  isLastStep,
  canGoPrev,
  canGoNext,
  canSkip,
  hasCompleted,
  onPrev,
  onNext,
  onSkip,
  onReplay,
  onClose,
}: TourActionBarProps) {
  const primaryLabel = isLastStep ? "完了する" : "次のステップへ"

  return (
    <footer
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label={hasCompleted ? "ツアーを閉じる" : "ツアーを終了"}
        >
          閉じる
        </Button>

        {isActive ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={!canGoPrev}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            前へ
          </Button>
        ) : null}

        {isActive ? (
          <Button
            type="button"
            onClick={onNext}
            size="sm"
            disabled={!canGoNext}
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        ) : (
          <Button type="button" onClick={onReplay} size="sm" variant="default">
            <RotateCcw className="h-4 w-4" aria-hidden />
            もう一度見る
          </Button>
        )}

        {isActive && canSkip ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSkip}
          >
            <SkipForward className="h-4 w-4" aria-hidden />
            スキップ
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">
        ショートカット: Enter/スペースで次へ、← → キーで前後、Escで終了、Sでスキップ。
      </p>
    </footer>
  )
}
