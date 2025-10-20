import { AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TourStep } from "@/features/tour-guide/types"

interface TourHighlightCardProps {
  step: TourStep
  isLastStep: boolean
  hasTarget: boolean
}

export function TourHighlightCard({
  step,
  isLastStep,
  hasTarget,
}: TourHighlightCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-1 h-5 w-5 text-blue-500" aria-hidden />
        <div className="space-y-2">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {isLastStep ? "Final" : "Guide"}
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              {step.title}
            </h2>
          </header>
          <p className="text-sm leading-relaxed text-slate-600">
            {step.description}
          </p>
          {step.tips?.length ? (
            <ul className="mt-3 space-y-2 rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-sm text-blue-900">
              {step.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <AlertCircle className="mt-[2px] h-4 w-4 flex-shrink-0" aria-hidden />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {!hasTarget ? (
            <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              このステップは特定のハイライト要素がありません。説明のみを確認してください。
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
