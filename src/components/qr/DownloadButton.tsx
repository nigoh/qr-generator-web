import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQRStore } from '../../store/qrStore';
import { generateQRCode, generateQRSVG } from '../../utils/qrGenerator';
import { Button } from '../ui/button';
import { Download, Copy, Share2, CheckCircle2 } from 'lucide-react';

export const DownloadButton: React.FC = () => {
  const qrStore = useQRStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const getTimestamp = () => {
    const iso = new Date().toISOString().slice(0, 19);
    return iso.replaceAll('-', '').replaceAll(':', '').replace('T', '');
  };

  const handleDownload = async (format: 'png' | 'jpg' = 'png') => {
    if (!qrStore.url.trim()) {
      toast.error('QRコードに埋め込むテキストを入力してください');
      return;
    }

    setIsDownloading(true);
    try {
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

      const link = document.createElement('a');
      link.download = `qr_${getTimestamp()}.${format}`;

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
      toast.error('ダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!qrStore.url.trim()) {
      toast.error('QRコードに埋め込むテキストを入力してください');
      return;
    }

    setCopySuccess(false);
    try {
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

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('画像の生成に失敗しました');
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
          console.error('Clipboard copy failed:', error);
          toast.error('クリップボードへのコピーに失敗しました');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('コピーに失敗しました');
    }
  };

  const handleDownloadSVG = async () => {
    if (!qrStore.url.trim()) {
      toast.error('QRコードに埋め込むテキストを入力してください');
      return;
    }

    setIsDownloading(true);
    try {
      const settings = qrStore.getQRSettings();
      const svgContent = await generateQRSVG(qrStore.url, settings);
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `qr_${getTimestamp()}.svg`;
      link.href = url;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('SVG download failed:', error);
      toast.error('SVGのダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!qrStore.url.trim()) return;

    try {
      const canvas = document.createElement('canvas');
      const settings = qrStore.getQRSettings();
      await generateQRCode(
        qrStore.url,
        { ...settings, logoFile: qrStore.logoFile, logoSettings: qrStore.logoSettings },
        canvas
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (blob && navigator.share) {
        const file = new File([blob], `qr_${getTimestamp()}.png`, { type: 'image/png' });
        await navigator.share({
          title: 'QRコード',
          text: qrStore.url,
          files: [file],
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  const isDisabled = !qrStore.url.trim();
  const supportsShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="space-y-4">
      {/* メインダウンロードボタン群 */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleDownload('png')}
          disabled={isDisabled || isDownloading}
          className="w-full min-h-[44px]"
          size="default"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? '生成中...' : 'PNG保存'}
        </Button>

        <Button
          onClick={() => handleDownload('jpg')}
          disabled={isDisabled || isDownloading}
          variant="outline"
          className="w-full min-h-[44px]"
          size="default"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? '生成中...' : 'JPG保存'}
        </Button>
      </div>

      {/* SVGダウンロード */}
      <Button
        onClick={handleDownloadSVG}
        disabled={isDisabled || isDownloading}
        variant="outline"
        className="w-full min-h-[44px]"
        size="default"
      >
        <Download className="w-4 h-4 mr-2" />
        {isDownloading ? '生成中...' : 'SVG保存（印刷・拡大対応）'}
      </Button>

      {/* アクションボタン群 */}
      <div className="grid grid-cols-2 gap-3">
        {/* クリップボードコピー */}
        <Button
          onClick={handleCopyToClipboard}
          disabled={isDisabled || isDownloading}
          variant="secondary"
          className="w-full min-h-[44px]"
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
              画像をコピー
            </>
          )}
        </Button>

        {/* 共有ボタン（Web Share API） */}
        {supportsShare && (
          <Button
            onClick={handleShare}
            disabled={isDisabled}
            variant="secondary"
            className="w-full min-h-[44px]"
            size="default"
          >
            <Share2 className="w-4 h-4 mr-2" />
            共有する
          </Button>
        )}
      </div>

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
            <span className="text-gray-600">SVG:</span>
            <span className="ml-1 text-gray-800 font-medium">無限拡大</span>
          </div>
          <div>
            <span className="text-gray-600">解像度:</span>
            <span className="ml-1 text-gray-800 font-medium">
              {qrStore.boxSize * (25 + qrStore.border * 2)}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
