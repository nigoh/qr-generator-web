import React from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { UrlInput } from './components/forms/UrlInput';
import { StyleSettingsForm } from './components/StyleSettingsForm';
import { LogoSettingsForm } from './components/LogoSettingsForm';
import { BasicSettingsForm } from './components/BasicSettingsForm';
import { QRPreview } from './components/qr/QRPreview';
import { DownloadButton } from './components/qr/DownloadButton';
import { CollapsibleSection } from './components/ui/CollapsibleSection';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { FileText, Palette, Image } from 'lucide-react';

const QRGeneratorApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* 固定ヘッダー */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* メインコンテンツ: ヘッダーとフッターの間 */}
      <div className="pt-16 pb-20">
        <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="min-h-[calc(100vh-144px)] flex flex-col xl:flex-row gap-4 lg:gap-6 py-4">
            
            {/* 左側: QRプレビューエリア */}
            <div className="w-full xl:w-2/5 order-1 xl:order-1">
              <div className="sticky top-20">
                <Card className="shadow-lg border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-center text-lg sm:text-xl font-bold">
                      QRコードプレビュー
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-center items-center space-y-4 py-6">
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

            {/* 右側: 設定項目（スクロール可能） */}
            <div className="w-full xl:w-3/5 order-2 xl:order-2">
              <Card className="min-h-full flex flex-col border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    QRコード設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 sm:space-y-6">
                  {/* 基本設定 */}
                  <CollapsibleSection 
                    title={
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
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

                  {/* スタイル設定 */}
                  <CollapsibleSection 
                    title={
                      <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        スタイル設定
                      </div>
                    } 
                    defaultOpen
                  >
                    <StyleSettingsForm />
                  </CollapsibleSection>

                  {/* 高度な設定 */}
                  <CollapsibleSection 
                    title={
                      <div className="flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        ロゴ埋め込み
                      </div>
                    }
                  >
                    <LogoSettingsForm />
                  </CollapsibleSection>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Footer />
      </div>
    </div>
  );
};

export default QRGeneratorApp;
