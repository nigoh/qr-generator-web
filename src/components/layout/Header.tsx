import type { ReactNode } from "react"
import { Github, LogIn, LogOut, QrCode } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth"

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleTourToggle = () => {
    if (isTourGuideOpen) {
      onCloseTourGuide?.()
      return
    }
    onOpenTourGuide?.()
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-full px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                QRコード生成ツール
              </h1>
              <p className="text-xs text-gray-500 sm:text-sm">
                カスタムQRコードを簡単作成
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">QRコード</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {extraActions}
            <Button
              variant={isTourGuideOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={handleTourToggle}
            >
              {isTourGuideOpen ? "ツールに戻る" : "ツアーを見る"}
            </Button>
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dynamic-qr")}
                >
                  時限QR
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/vcard")}
                >
                  vCard
                </Button>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name ?? user.email ?? "ユーザー"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : null}
                <span className="hidden text-sm font-medium text-gray-700 sm:block">
                  {user.name ?? user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  aria-label="ログアウト"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">ログアウト</span>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                aria-label="ログイン"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">ログイン</span>
              </Button>
            )}
            <a
              href="https://github.com/nigoh"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
