import React from 'react';
import { useQRStore } from '../../store/qrStore';
import { Input } from '../ui';
import { Label } from '../ui';
import { Button } from '../ui';

export const UrlInput: React.FC = () => {
  const { url, setUrl } = useQRStore();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <div className="space-y-4" data-tour="url-input">
      <div>
        <Label htmlFor="url-input">
          URL または テキスト
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="url-input"
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://example.com または 任意のテキスト"
          className="w-full"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          WebサイトのURL、SNSアカウント、連絡先情報、Wi-Fi設定など、任意のテキストをQRコードに変換できます
        </p>
      </div>

      {/* サンプルボタン */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setUrl('https://www.google.com')}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setUrl('mailto:info@example.com')}
        >
          メールアドレス
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setUrl('tel:+81-90-1234-5678')}
        >
          電話番号
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setUrl('WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;')
          }
        >
          Wi-Fi設定
        </Button>
      </div>

      {/* 文字数表示 */}
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
    </div>
  );
};
