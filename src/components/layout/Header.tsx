import type { ReactNode } from "react"
import { Github, LogIn, LogOut, QrCode, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/features/auth"

export interface HeaderProps {
  extraActions?: ReactNode
}

export const Header: React.FC<HeaderProps> = ({
  extraActions,
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      {/* スキップナビゲーション（キーボードユーザー向け） */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        メインコンテンツへスキップ
      </a>
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
            <TooltipProvider>
              {user ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/dynamic-qr")}>
                        時限QR
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>時限QRコード管理</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/vcard")}>
                        vCard
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>vCard管理</TooltipContent>
                  </Tooltip>
                  <Separator orientation="vertical" className="h-6" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 px-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.avatar_url ?? undefined} alt={user.name ?? ""} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm font-medium">
                          {user.name ?? user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        ログアウト
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => navigate("/login")}>
                  <LogIn className="mr-2 h-4 w-4" />
                  ログイン
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/nigoh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>GitHubリポジトリ</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  )
}
