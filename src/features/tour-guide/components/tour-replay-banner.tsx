import { CalendarCheck2, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TourReplayBannerProps {
  lastCompletedAt: number | null
  onStart: () => void
}

export function TourReplayBanner({ lastCompletedAt, onStart }: TourReplayBannerProps) {
  const completedText = lastCompletedAt
    ? new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(lastCompletedAt))
    : null

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900">
      <div className="flex items-start gap-3">
        <CalendarCheck2 className="mt-1 h-5 w-5" aria-hidden />
        <div>
          <p className="text-sm font-semibold">ツアーを再体験できます</p>
          <p className="text-xs leading-relaxed">
            {completedText
              ? `前回の完走日時: ${completedText}`
              : "一度ツアーを完了しました。もう一度おさらいしてみませんか？"}
          </p>
        </div>
      </div>
      <div>
        <Button onClick={onStart} size="sm">
          <PlayCircle className="h-4 w-4" aria-hidden />
          ツアーを開始
        </Button>
      </div>
    </section>
  )
}
