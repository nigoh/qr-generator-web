import React, { useState } from 'react';
import { useQRStore } from '../../store/qrStore';
import { generateQRCode } from '../../utils/qrGenerator';
import { Download, Copy, Share2, CheckCircle2, Settings } from 'lucide-react';
import { Button } from '../ui/button';

interface StickyActionBarProps {
  onOpenSettings?: () => void;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({ onOpenSettings }) => {
  const qrStore = useQRStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isDisabled = !qrStore.url.trim();

  const handleDownloadPNG = async () => {
    if (isDisabled) return;
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const settings = qrStore.getQRSettings();
      await generateQRCode(
        qrStore.url,
        { ...settings, logoFile: qrStore.logoFile, logoSettings: qrStore.logoSettings },
        canvas
      );

      const link = document.createElement('a');
      const iso = new Date().toISOString().slice(0, 19);
      const timestamp = iso.replaceAll('-', '').replaceAll(':', '').replace('T', '');
      link.download = `qr_${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (isDisabled) return;
    try {
      const canvas = document.createElement('canvas');
      const settings = qrStore.getQRSettings();
      await generateQRCode(
        qrStore.url,
        { ...settings, logoFile: qrStore.logoFile, logoSettings: qrStore.logoSettings },
        canvas
      );
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch {
          // Fallback: copy text
          await navigator.clipboard.writeText(qrStore.url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleShare = async () => {
    if (isDisabled) return;
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
        const iso = new Date().toISOString().slice(0, 19);
        const timestamp = iso.replaceAll('-', '').replaceAll(':', '').replace('T', '');
        const file = new File([blob], `qr_${timestamp}.png`, { type: 'image/png' });

        await navigator.share({
          title: 'QRコード',
          text: qrStore.url,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'QRコード',
          text: qrStore.url,
        });
      }
    } catch (error) {
      // User cancelled share or share not supported
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  const supportsShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.1)] xl:hidden">
      <div className="flex items-center justify-center gap-2 px-3 py-2.5 max-w-lg mx-auto">
        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="default"
          className="min-h-[44px] px-3"
          aria-label="設定を開く"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleDownloadPNG}
          disabled={isDisabled || isDownloading}
          size="default"
          className="flex-1 min-h-[44px] text-sm"
        >
          <Download className="w-4 h-4 mr-1.5" />
          {isDownloading ? '保存中...' : '保存'}
        </Button>

        <Button
          onClick={handleCopy}
          disabled={isDisabled}
          variant="outline"
          size="default"
          className="flex-1 min-h-[44px] text-sm"
        >
          {copySuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
              完了！
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5" />
              コピー
            </>
          )}
        </Button>

        {supportsShare && (
          <Button
            onClick={handleShare}
            disabled={isDisabled}
            variant="outline"
            size="default"
            className="flex-1 min-h-[44px] text-sm"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            共有
          </Button>
        )}
      </div>
    </div>
  );
};
