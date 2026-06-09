import React, { useCallback, useState } from "react"
import { FileText, Image, Library, Palette } from "lucide-react"
import { Footer, Header } from "@/components/layout"
import { UrlInput } from "@/components/forms/UrlInput"
import { StyleSettingsForm } from "@/components/StyleSettingsForm"
import { LogoSettingsForm } from "@/components/LogoSettingsForm"
import { BasicSettingsForm } from "@/components/BasicSettingsForm"
import { QRPreview } from "@/components/qr/QRPreview"
import { DownloadButton } from "@/components/qr/DownloadButton"
import { ResetButton } from "@/components/qr/ResetButton"
import { StickyActionBar } from "@/components/qr/StickyActionBar"
import { SettingsDialog } from "@/components/SettingsDialog"
import { QRLibraryDialog } from "@/components/library/QRLibraryDialog"
import { CollapsibleSection } from "@/components/ui/CollapsibleSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/Toaster"
import { TourGuidePage } from "@/pages/tour-guide/tour-guide-page"
import { TourIntroBanner, useFirstVisit } from "@/features/tour-guide"

const QRGeneratorApp: React.FC = () => {
  const [isTourGuideOpen, setIsTourGuideOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const { isFirstVisit, dismiss: dismissFirstVisit } = useFirstVisit()

  const handleOpenTourGuide = useCallback(() => {
    setIsTourGuideOpen(true)
  }, [])

  const handleCloseTourGuide = useCallback(() => {
    setIsTourGuideOpen(false)
  }, [])

  const introBanner =
    !isTourGuideOpen && isFirstVisit ? (
      <TourIntroBanner
        onStart={handleOpenTourGuide}
        onDismiss={dismissFirstVisit}
      />
    ) : null

  const libraryButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsLibraryOpen(true)}
    >
      <Library className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
      <span className="hidden sm:inline">ライブラリ</span>
    </Button>
  )

  return (
    <div className="h-screen h-dvh flex flex-col overflow-hidden bg-background xl:min-h-screen xl:h-auto xl:overflow-auto">
      {/* スキップリンク（キーボード利用者向け） */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow focus:ring-2 focus:ring-blue-500"
      >
        メインコンテンツへスキップ
      </a>

      {/* ヘッダー */}
      <div className="shrink-0 xl:fixed xl:top-0 xl:left-0 xl:right-0 xl:z-50">
        <Header
          isTourGuideOpen={isTourGuideOpen}
          onOpenTourGuide={handleOpenTourGuide}
          onCloseTourGuide={handleCloseTourGuide}
          extraActions={!isTourGuideOpen ? libraryButton : undefined}
        />
      </div>

      {/* メインコンテンツ */}
      <main id="main-content" tabIndex={-1} className="flex-1 min-h-0 focus:outline-none xl:pt-16 xl:pb-20">
        {isTourGuideOpen ? (
          <div className="h-full overflow-auto mx-auto w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
            <TourGuidePage onClose={handleCloseTourGuide} />
          </div>
        ) : (
          <>
            {/* モバイル: スクロール不要の1画面レイアウト */}
            <div className="flex flex-col h-full xl:hidden">
              {introBanner && (
                <div className="shrink-0 px-3 pt-3">{introBanner}</div>
              )}
              {/* URL入力エリア（コンパクト表示） */}
              <div className="shrink-0 px-3 pt-3 pb-2">
                <UrlInput compact />
              </div>

              {/* QRプレビュー（残りスペースを使う） */}
              <div className="flex-1 min-h-0 flex items-center justify-center px-3 pb-2">
                <div className="w-full max-w-xs" data-tour="qr-preview">
                  <QRPreview />
                </div>
              </div>
            </div>

            {/* デスクトップ: 2カラムレイアウト（従来通り） */}
            <div className="hidden xl:block mx-auto w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
              {introBanner && <div className="pt-4">{introBanner}</div>}
              <div className="min-h-[calc(100vh-144px)] flex flex-col gap-4 py-4 lg:gap-6 xl:flex-row">
                {/* 設定エリア */}
                <section aria-label="QRコード設定" className="order-1 w-full xl:w-3/5">
                  <Card className="flex min-h-full flex-col rounded-2xl border shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg font-bold sm:text-xl">
                          QRコード設定
                        </CardTitle>
                        <ResetButton />
                      </div>
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
                        data-tour="basic-settings"
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
                        data-tour="style-settings"
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
                        data-tour="logo-settings"
                      >
                        <LogoSettingsForm />
                      </CollapsibleSection>
                    </CardContent>
                  </Card>
                </section>

                {/* プレビューエリア */}
                <section aria-label="QRコードプレビュー" className="order-2 w-full xl:w-2/5">
                  <div className="sticky top-20">
                    <Card className="rounded-2xl border shadow-lg shadow-zinc-900/5">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-center text-lg font-bold sm:text-xl">
                          QRコードプレビュー
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
                        <div className="w-full max-w-sm" data-tour="qr-preview">
                          <QRPreview />
                        </div>
                        <div className="w-full max-w-sm" data-tour="download-button">
                          <DownloadButton />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      {/* モバイル用: 固定アクションバー（設定/保存/コピー/共有） */}
      <StickyActionBar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* 設定ダイアログ（モバイル用） */}
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* 保存済みQRライブラリ */}
      <QRLibraryDialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen} />

      {/* 固定フッター（デスクトップのみ表示） */}
      <div className="fixed bottom-0 left-0 right-0 z-50 hidden xl:block">
        <Footer />
      </div>

      {/* トースト通知（アクセシブルなライブリージョン） */}
      <Toaster />
    </div>
  );
};

export default QRGeneratorApp;
