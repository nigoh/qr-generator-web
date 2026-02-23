import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { QrCode } from "lucide-react"
import { useAuth, getLoginUrl } from "@/features/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function LoginPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  // ログイン済みならリダイレクト
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dynamic-qr", { replace: true })
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  const handleLogin = (provider: "google" | "github") => {
    window.location.href = getLoginUrl(provider)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardContent className="p-8">
          {/* ロゴ */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
              <p className="mt-1 text-sm text-gray-500">
                時限QR・vCard機能を使用するにはログインが必要です
              </p>
            </div>
          </div>

          {/* ログインボタン */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3"
              onClick={() => handleLogin("google")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.65-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.65-.35-1.36-.35-2.09s.13-1.44.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google でログイン
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
                または
              </span>
            </div>

            <Button
              type="button"
              className="w-full gap-3 bg-gray-900 hover:bg-gray-800"
              onClick={() => handleLogin("github")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-white" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub でログイン
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            静的QRコード生成はログイン不要で利用できます
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
