import React, { useState } from 'react';
import { useQRStore } from '../../store/qrStore';
import { Input, Label, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { VCardForm } from '../../features/vcard/components/VCardForm';
import { Link, Contact, MapPin, MessageSquare, Calendar, Mail, Phone, Wifi } from 'lucide-react';

interface UrlInputProps {
  compact?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ compact = false }) => {
  const { url, setUrl } = useQRStore();
  const [activeTab, setActiveTab] = useState('url');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  // 入力がURL形式かどうかを判定
  const looksLikeUrl = /^https?:\/\//i.test(url.trim());

  // コンパクトモード: モバイルメイン画面用（入力フィールドのみ）
  if (compact) {
    return (
      <div data-tour="url-input">
        <Input
          id="url-input"
          type="text"
          inputMode={looksLikeUrl || !url ? 'url' : 'text'}
          autoComplete="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="URLまたはテキストを入力"
          className="w-full text-base"
          required
          aria-label="URL または テキスト"
        />
      </div>
    );
  }

  // フルモード: デスクトップおよび設定ダイアログ用
  return (
    <div className="space-y-4" data-tour="url-input">
      <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="url" className="flex items-center gap-1.5 min-h-[44px]">
            <Link className="h-4 w-4" />
            URL / テキスト
          </TabsTrigger>
          <TabsTrigger value="vcard" className="flex items-center gap-1.5 min-h-[44px]">
            <Contact className="h-4 w-4" />
            名刺（vCard）
          </TabsTrigger>
        </TabsList>

        {/* URL / テキスト タブ */}
        <TabsContent value="url" className="mt-0 space-y-4">
          <div>
            <Label htmlFor="url-input-full">
              URL または テキスト
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="url-input-full"
              type="text"
              inputMode={looksLikeUrl || !url ? 'url' : 'text'}
              autoComplete="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com または 任意のテキスト"
              className="w-full text-base"
              required
              aria-describedby="url-input-help"
            />
            {!url.trim() && (
              <p className="text-xs text-amber-600 mt-1" role="alert">
                テキストを入力するとQRコードが自動生成されます
              </p>
            )}
            <p id="url-input-help" className="text-xs text-gray-500 mt-1">
              WebサイトのURL、SNSアカウント、連絡先情報、Wi-Fi設定など、任意のテキストをQRコードに変換できます
            </p>
          </div>

          {/* 用途プリセットボタン */}
          <div>
            <Label className="text-xs text-gray-600 mb-1.5 block">用途プリセット</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] sm:min-h-0"
                onClick={() => setUrl('https://www.google.com')}
              >
                <Link className="h-3.5 w-3.5 mr-1" />
                URL
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] sm:min-h-0"
                onClick={() => setUrl('mailto:info@example.com')}
              >
                <Mail className="h-3.5 w-3.5 mr-1" />
                メール
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] sm:min-h-0"
                onClick={() => setUrl('tel:+81-90-1234-5678')}
              >
                <Phone className="h-3.5 w-3.5 mr-1" />
                電話番号
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] sm:min-h-0"
                onClick={() =>
                  setUrl('WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;')
                }
              >
                <Wifi className="h-3.5 w-3.5 mr-1" />
                Wi-Fi
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] sm:min-h-0"
                onClick={() =>
                  setUrl('smsto:+81901234567:こんにちは！')
                }
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                SMS
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] sm:min-h-0"
                onClick={() =>
                  setUrl('geo:35.6812,139.7671?q=東京タワー')
                }
              >
                <MapPin className="h-3.5 w-3.5 mr-1" />
                地図
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] sm:min-h-0"
                onClick={() =>
                  setUrl(
                    'BEGIN:VEVENT\nSUMMARY:会議\nDTSTART:20260301T100000\nDTEND:20260301T110000\nLOCATION:会議室A\nEND:VEVENT'
                  )
                }
              >
                <Calendar className="h-3.5 w-3.5 mr-1" />
                イベント
              </Button>
            </div>
          </div>

          {/* 文字数表示・バリデーション */}
          {url && (
            <div className="text-xs text-gray-500 flex justify-between">
              <span>文字数: {url.length}</span>
              <span
                className={url.length > 2000 ? 'text-red-500' : 'text-green-600'}
              >
                {url.length > 2000
                  ? '⚠️ 長すぎます（推奨: 2000文字以下）'
                  : '✓ 適切な長さです'}
              </span>
            </div>
          )}
        </TabsContent>

        {/* 名刺（vCard）タブ */}
        <TabsContent value="vcard" className="mt-0">
          <VCardForm onChange={setUrl} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
