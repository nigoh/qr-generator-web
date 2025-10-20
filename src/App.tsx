import React, { useCallback, useState } from "react"
import { FileText, Image, Palette } from "lucide-react"
import { Footer, Header } from "@/components/layout"
import { UrlInput } from "@/components/forms/UrlInput"
import { StyleSettingsForm } from "@/components/StyleSettingsForm"
import { LogoSettingsForm } from "@/components/LogoSettingsForm"
import { BasicSettingsForm } from "@/components/BasicSettingsForm"
import { QRPreview } from "@/components/qr/QRPreview"
import { DownloadButton } from "@/components/qr/DownloadButton"
import { CollapsibleSection } from "@/components/ui/CollapsibleSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TourGuidePage } from "@/pages/tour-guide/tour-guide-page"

const QRGeneratorApp: React.FC = () => {
  const [isTourGuideOpen, setIsTourGuideOpen] = useState(false)

  const handleOpenTourGuide = useCallback(() => {
    setIsTourGuideOpen(true)
  }, [])

  const handleCloseTourGuide = useCallback(() => {
    setIsTourGuideOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* 固定ヘッダー */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isTourGuideOpen={isTourGuideOpen}
          onOpenTourGuide={handleOpenTourGuide}
          onCloseTourGuide={handleCloseTourGuide}
        />
      </div>

      {/* メインコンテンツ: ヘッダーとフッターの間 */}
      <div className="pt-16 pb-20">
        {isTourGuideOpen ? (
          <div className="mx-auto w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
            <TourGuidePage onClose={handleCloseTourGuide} />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="min-h-[calc(100vh-144px)] flex flex-col gap-4 py-4 lg:gap-6 xl:flex-row">
              {/* 左側: 設定項目（スクロール可能） */}
              <div className="order-1 w-full xl:order-1 xl:w-3/5">
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
              </div>

              {/* 右側: QRプレビューエリア */}
              <div className="order-2 w-full xl:order-2 xl:w-2/5">
                <div className="sticky top-20">
                  <Card className="border-2 shadow-lg">
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Footer />
      </div>

      {/* ツアーガイドビューはヘッダーのトグルで切り替え */}
    </div>
  );
};

export default QRGeneratorApp;
