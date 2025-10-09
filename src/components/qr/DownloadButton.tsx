import React, { useState } from 'react';
import { useQRStore } from '../../store/qrStore';
import { generateQRCode } from '../../utils/qrGenerator';
import { Button } from '../ui/button';
import { Download, Copy, CheckCircle2 } from 'lucide-react';

export const DownloadButton: React.FC = () => {
  const qrStore = useQRStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownload = async (format: 'png' | 'jpg' = 'png') => {
    if (!qrStore.url.trim()) {
      alert('QRコードに埋め込むテキストを入力してください');
      return;
    }

    setIsDownloading(true);
    try {
      // 非表示のキャンバスでQRコードを生成
      const canvas = document.createElement('canvas');
      const settings = qrStore.getQRSettings();

      await generateQRCode(
        qrStore.url,
        {
          ...settings,
          logoFile: qrStore.logoFile,
          logoSettings: qrStore.logoSettings,
        },
        canvas
      );

      // ダウンロード
      const link = document.createElement('a');
      const iso = new Date().toISOString().slice(0, 19);
      const timestamp = iso.replaceAll('-', '').replaceAll(':', '').replace('T', '');
      link.download = `qrcode_${timestamp}.${format}`;

      if (format === 'jpg') {
        link.href = canvas.toDataURL('image/jpeg', 0.95);
      } else {
        link.href = canvas.toDataURL('image/png');
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('ダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!qrStore.url.trim()) {
      alert('QRコードに埋め込むテキストを入力してください');
      return;
    }

    setCopySuccess(false);
    try {
      // 非表示のキャンバスでQRコードを生成
      const canvas = document.createElement('canvas');
      const settings = qrStore.getQRSettings();

      await generateQRCode(
        qrStore.url,
        {
          ...settings,
          logoFile: qrStore.logoFile,
          logoSettings: qrStore.logoSettings,
        },
        canvas
      );

      // クリップボードに画像をコピー
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('画像の生成に失敗しました');
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000); // 2秒後にリセット
        } catch (error) {
          console.error('Clipboard copy failed:', error);
          alert('クリップボードへのコピーに失敗しました');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('コピーに失敗しました');
    }
  };

  const isDisabled = !qrStore.url.trim();

  return (
    <div className="space-y-4">
      {/* メインダウンロードボタン群 */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleDownload('png')}
          disabled={isDisabled || isDownloading}
          className="w-full"
          size="default"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? '生成中...' : 'PNG形式'}
        </Button>

        <Button
          onClick={() => handleDownload('jpg')}
          disabled={isDisabled || isDownloading}
          variant="outline"
          className="w-full"
          size="default"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? '生成中...' : 'JPG形式'}
        </Button>
      </div>

      {/* クリップボードコピー */}
      <Button
        onClick={handleCopyToClipboard}
        disabled={isDisabled || isDownloading}
        variant="secondary"
        className="w-full"
        size="default"
      >
        {copySuccess ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
            コピー完了！
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            クリップボードにコピー
          </>
        )}
      </Button>

      {/* 出力情報カード */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-3">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-sm font-semibold text-gray-800">出力情報</h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">PNG:</span>
            <span className="ml-1 text-gray-800 font-medium">透明背景</span>
          </div>
          <div>
            <span className="text-gray-600">JPG:</span>
            <span className="ml-1 text-gray-800 font-medium">小サイズ</span>
          </div>
          <div>
            <span className="text-gray-600">解像度:</span>
            <span className="ml-1 text-gray-800 font-medium">
              {qrStore.boxSize * (25 + qrStore.border * 2)}px
            </span>
          </div>
          <div>
            <span className="text-gray-600">用途:</span>
            <span className="ml-1 text-gray-800 font-medium">印刷・Web</span>
          </div>
        </div>
      </div>
    </div>
  );
};
