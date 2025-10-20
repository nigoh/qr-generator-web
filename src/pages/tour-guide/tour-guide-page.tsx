import {
  FeatureContent,
  FeatureHeader,
  FeatureLayout,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  TourActionBar,
  TourHighlightCard,
  TourReplayBanner,
  TourStepList,
  defaultTourSteps,
  useTourGuide,
  useTourProgress,
} from "@/features/tour-guide"
import type { FeatureHeaderButton } from "@/components/layout"

interface TourGuidePageProps {
  onClose: () => void
}

export function TourGuidePage({ onClose }: TourGuidePageProps) {
  const {
    isActive,
    hasCompleted,
    allowSkip,
    canSkipCurrentStep,
    canGoPrev,
    canGoNext,
    currentStepIndex,
    totalSteps,
    activeStep,
    completedStepIds,
    skippedStepIds,
    userState,
    showReplayBanner,
    start,
    replay,
    next,
    prev,
    skip,
    end,
    goToStep,
  } = useTourGuide(defaultTourSteps)

  const progress = useTourProgress({
    steps: defaultTourSteps,
    completedStepIds,
    skippedStepIds,
  })

  const headerButtons: FeatureHeaderButton[] = [
    {
      text: "生成画面に戻る",
      onClick: onClose,
      variant: "outline",
      size: "sm",
    },
  ]

  if (isActive) {
    headerButtons.push({
      text: "ツアーを終了",
      onClick: end,
      variant: "ghost",
      size: "sm",
    })
  } else {
    headerButtons.push({
      text: hasCompleted ? "もう一度見る" : "ツアーを開始",
      onClick: hasCompleted ? replay : start,
      size: "sm",
    })
  }

  const isLastStep = currentStepIndex >= totalSteps - 1

  return (
    <FeatureLayout maxWidth="xl">
      <FeatureHeader
        title="ツアーガイド"
        subtitle="QRコード生成ツールの主要機能を順番に確認しましょう。初めての方はツアー開始、復習したい場合は再生をご利用ください。"
        actions={
          <p className="text-xs text-slate-500">
            進行状況: <span className="font-semibold text-slate-900">{progress.completedSteps}</span>
            <span className="mx-1 text-slate-400">/</span>
            <span>{progress.totalSteps}</span> ステップ 完了
          </p>
        }
        buttons={headerButtons}
        showAddButton={false}
      />

      <div className="space-y-6">
        {showReplayBanner ? (
          <TourReplayBanner
            lastCompletedAt={userState.lastCompletedAt}
            onStart={replay}
          />
        ) : null}

        <FeatureContent variant="transparent" padding="none">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <TourStepList
                steps={defaultTourSteps}
                currentStepId={isActive ? activeStep?.id ?? null : null}
                completedStepIds={completedStepIds}
                skippedStepIds={skippedStepIds}
                onSelectStep={goToStep}
              />
            </div>

            <div className="lg:col-span-8 space-y-4">
              {activeStep ? (
                <TourHighlightCard
                  step={activeStep}
                  isLastStep={isLastStep}
                  hasTarget={Boolean(activeStep.targetSelector)}
                />
              ) : (
                <EmptyStateCard
                  hasCompleted={hasCompleted}
                  onStart={start}
                  onReplay={replay}
                />
              )}

              <TourActionBar
                isActive={isActive}
                isLastStep={isLastStep}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                canSkip={allowSkip && canSkipCurrentStep}
                hasCompleted={hasCompleted}
                onPrev={prev}
                onNext={next}
                onSkip={skip}
                onReplay={replay}
                onClose={onClose}
              />
            </div>
          </div>
        </FeatureContent>
      </div>
    </FeatureLayout>
  )
}

interface EmptyStateCardProps {
  hasCompleted: boolean
  onStart: () => void
  onReplay: () => void
}

function EmptyStateCard({ hasCompleted, onStart, onReplay }: EmptyStateCardProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {hasCompleted ? "ツアーをリプレイできます" : "ツアーを開始しましょう"}
      </h2>
      <p className="max-w-md text-sm text-slate-600">
        {hasCompleted
          ? "前回のツアーを完走済みです。新しいアップデートや操作をもう一度確認しましょう。"
          : "ツアーでは基本操作からダウンロードまでを順番に体験できます。まずは開始ボタンを押してください。"}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={hasCompleted ? onReplay : onStart}>
          {hasCompleted ? "もう一度見る" : "ツアーを開始"}
        </Button>
        {hasCompleted ? (
          <Button variant="ghost" onClick={onStart}>
            新しい設定で開始
          </Button>
        ) : null}
      </div>
    </section>
  )
}
