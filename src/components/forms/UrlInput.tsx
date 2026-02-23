import React, { useState } from 'react';
import { useQRStore } from '../../store/qrStore';
import { Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { VCardForm } from '../../features/vcard/components/VCardForm';
import { Link, Contact } from 'lucide-react';

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

          {/* 文字数表示・バリデーション */}
          {url && (
            <div className="text-xs text-gray-500 flex justify-between" aria-live="polite">
              <span>文字数: {url.length}</span>
              {url.length > 2000 ? (
                <span className="text-red-500" role="status">
                  <span aria-hidden="true">⚠️</span>{' '}
                  長すぎます（推奨: 2000文字以下）
                </span>
              ) : (
                <span className="text-green-600" role="status">
                  <span aria-hidden="true">✓</span>{' '}
                  適切な長さです
                </span>
              )}
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
