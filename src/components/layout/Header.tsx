import type { ReactNode } from "react"
import { Compass, Github, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface HeaderProps {
  isTourGuideOpen?: boolean
  onOpenTourGuide?: () => void
  onCloseTourGuide?: () => void
  extraActions?: ReactNode
}

export const Header: React.FC<HeaderProps> = ({
  isTourGuideOpen = false,
  onOpenTourGuide,
  onCloseTourGuide,
  extraActions,
}) => {
  const handleTourToggle = () => {
    if (isTourGuideOpen) {
      onCloseTourGuide?.()
      return
    }
    onOpenTourGuide?.()
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto max-w-full px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <QrCode className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
                QR Studio
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                カスタムQRコードを、美しく。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {extraActions}
            <Button
              variant={isTourGuideOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={handleTourToggle}
            >
              <Compass className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">
                {isTourGuideOpen ? "ツールに戻る" : "ツアー"}
              </span>
            </Button>
            <a
              href="https://github.com/nigoh"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
