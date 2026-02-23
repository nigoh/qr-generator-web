import React, { useState } from "react"
import { HashRouter, Route, Routes } from "react-router-dom"
import { FileText, Image, Palette } from "lucide-react"
import { Footer, Header } from "@/components/layout"
import { UrlInput } from "@/components/forms/UrlInput"
import { StyleSettingsForm } from "@/components/StyleSettingsForm"
import { LogoSettingsForm } from "@/components/LogoSettingsForm"
import { BasicSettingsForm } from "@/components/BasicSettingsForm"
import { QRPreview } from "@/components/qr/QRPreview"
import { DownloadButton } from "@/components/qr/DownloadButton"
import { StickyActionBar } from "@/components/qr/StickyActionBar"
import { MobileSettingsSheet } from "@/components/qr/MobileSettingsSheet"
import { QuickColorBar } from "@/components/qr/QuickColorBar"
import { QuickLogoPanel } from "@/components/qr/QuickLogoPanel"
import { DotStyleSelector } from "@/components/qr/DotStyleSelector"
import { SettingsDialog } from "@/components/SettingsDialog"
import { CollapsibleSection } from "@/components/ui/CollapsibleSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicQRPage } from "@/pages/dynamic-qr/dynamic-qr-page"
import { LoginPage } from "@/pages/auth/login-page"
import { VCardPage } from "@/pages/vcard/vcard-page"
import { AuthProvider, ProtectedRoute } from "@/features/auth"
import { Toaster } from "@/components/ui/sonner"

const QRGeneratorApp: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="h-safe-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 xl:min-h-screen xl:h-auto xl:overflow-auto">
      {/* ヘッダー */}
      <div className="shrink-0 xl:fixed xl:top-0 xl:left-0 xl:right-0 xl:z-50">
        <Header />
      </div>

      {/* メインコンテンツ */}
      <div id="main-content" className="flex-1 min-h-0 xl:pt-16 xl:pb-20">
        <>
          {/* モバイル: スクロール可能な1カラムレイアウト */}
          <div className="h-full overflow-y-auto xl:hidden">
              {/* QRプレビュー + ドットスタイルボタン */}
              <div className="flex items-start gap-2.5 w-full max-w-sm mx-auto justify-center px-3 pt-3 pb-2">
                <div className="flex-1 min-w-0">
                  <QRPreview />
                </div>
                <div className="shrink-0">
                  <DotStyleSelector />
                </div>
              </div>

              {/* URL入力 */}
              <div className="px-3 pb-2">
                <UrlInput compact />
              </div>

              {/* ロゴパネル */}
              <QuickLogoPanel />

              {/* クイックカラーバー */}
              <QuickColorBar />
          </div>

          {/* デスクトップ: 2カラムレイアウト（従来通り） */}
          <div className="hidden xl:block mx-auto w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="min-h-[calc(100vh-144px)] flex flex-col gap-4 py-4 lg:gap-6 xl:flex-row">
              {/* 設定エリア */}
              <div className="order-1 w-full xl:w-3/5">
                <Card className="flex min-h-full flex-col border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold sm:text-xl">
                      QRコード設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 sm:space-y-6">
                    <CollapsibleSection
                      title={
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          基本設定
                        </div>
                      }
                      defaultOpen
                    >
                      <div className="space-y-4">
                        <UrlInput />
                        <BasicSettingsForm />
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title={
                        <div className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          スタイル設定
                        </div>
                      }
                      defaultOpen
                    >
                      <StyleSettingsForm />
                    </CollapsibleSection>

                    <CollapsibleSection
                      title={
                        <div className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          ロゴ埋め込み
                        </div>
                      }
                    >
                      <LogoSettingsForm />
                    </CollapsibleSection>
                  </CardContent>
                </Card>
              </div>

              {/* プレビューエリア */}
              <div className="order-2 w-full xl:w-2/5">
                <div className="sticky top-20">
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-center text-lg font-bold sm:text-xl">
                        QRコードプレビュー
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
                      <div className="w-full max-w-sm">
                        <QRPreview />
                      </div>
                      <div className="w-full max-w-sm">
                        <DownloadButton />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>

      {/* モバイル用: 固定アクションバー（設定/保存/コピー/共有） */}
      <StickyActionBar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* 設定ボトムシート（モバイル用） */}
      <MobileSettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* 設定ダイアログ（デスクトップ用） */}
      <div className="hidden xl:block">
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>

      {/* 固定フッター（デスクトップのみ表示） */}
      <div className="fixed bottom-0 left-0 right-0 z-50 hidden xl:block">
        <Footer />
      </div>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<QRGeneratorApp />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dynamic-qr"
            element={
              <ProtectedRoute>
                <DynamicQRPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vcard"
            element={
              <ProtectedRoute>
                <VCardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </HashRouter>
  )
}

export default App
