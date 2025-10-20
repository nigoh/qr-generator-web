import { CheckCircle2, Circle, PauseCircle, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TourStep, TourStepId } from "@/features/tour-guide/types"

interface TourStepListProps {
  steps: TourStep[]
  currentStepId: TourStepId | null
  completedStepIds: TourStepId[]
  skippedStepIds: TourStepId[]
  onSelectStep?: (stepId: TourStepId) => void
}

type StepStatus = "completed" | "current" | "skipped" | "upcoming"

export function TourStepList({
  steps,
  currentStepId,
  completedStepIds,
  skippedStepIds,
  onSelectStep,
}: TourStepListProps) {
  const completedSet = new Set(completedStepIds)
  const skippedSet = new Set(skippedStepIds)

  return (
    <ol className="space-y-2" aria-label="ツアーステップ一覧">
      {steps.map((step, index) => {
        const status = resolveStatus({
          stepId: step.id,
          currentStepId,
          completedSet,
          skippedSet,
        })

        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onSelectStep?.(step.id)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                status === "current" &&
                  "border-blue-500 bg-blue-50 text-blue-900 shadow-sm",
                status === "completed" &&
                  "border-emerald-300 bg-emerald-50 text-emerald-900",
                status === "skipped" &&
                  "border-amber-300 bg-amber-50 text-amber-900",
                status === "upcoming" && "border-slate-200 bg-white text-slate-700",
              )}
              aria-current={status === "current" ? "step" : undefined}
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={status} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    STEP {index + 1}
                  </p>
                  <p className="text-sm font-semibold">{step.title}</p>
                </div>
              </div>
              {step.description ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {step.description}
                </p>
              ) : null}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

interface ResolveStatusInput {
  stepId: TourStepId
  currentStepId: TourStepId | null
  completedSet: Set<TourStepId>
  skippedSet: Set<TourStepId>
}

function resolveStatus({
  stepId,
  currentStepId,
  completedSet,
  skippedSet,
}: ResolveStatusInput): StepStatus {
  if (stepId === currentStepId) {
    return "current"
  }

  if (completedSet.has(stepId)) {
    return "completed"
  }

  if (skippedSet.has(stepId)) {
    return "skipped"
  }

  return "upcoming"
}

function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
    case "skipped":
      return <PauseCircle className="h-5 w-5 text-amber-500" aria-hidden />
    case "current":
      return <PlayCircle className="h-5 w-5 text-blue-500" aria-hidden />
    default:
      return <Circle className="h-5 w-5 text-slate-400" aria-hidden />
  }
}
