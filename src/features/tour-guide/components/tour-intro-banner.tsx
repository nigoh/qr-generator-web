import { QrCode, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TourIntroBannerProps {
  /** 「ツアーを見る」を押したとき */
  onStart: () => void
  /** 閉じる／開始のいずれでも呼ばれ、以後の表示を抑止する */
  onDismiss: () => void
}

/**
 * 初回訪問者向けのさりげない案内バナー。
 * 自動でフルツアーは開かず、ツアーへの導線だけを提示する。
 */
export function TourIntroBanner({ onStart, onDismiss }: TourIntroBannerProps) {
  const handleStart = () => {
    onDismiss()
    onStart()
  }

  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 shadow-sm"
    >
      <QrCode className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        初めてですか？使い方をツアーで確認できます。
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="shrink-0"
        onClick={handleStart}
      >
        ツアーを見る
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="shrink-0"
        onClick={onDismiss}
        aria-label="案内を閉じる"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
