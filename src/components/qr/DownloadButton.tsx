import React, { useState } from 'react';
import { useQRStore } from '../../store/qrStore';
import { generateQRCode, generateQRSVG } from '../../utils/qrGenerator';
import { Button } from '../ui/button';
import { SaveToLibraryButton } from './SaveToLibraryButton';
import { Download, Copy, Share2, CheckCircle2, Image as ImageIcon, FileCode } from 'lucide-react';
import { toast } from '../../hooks/useToast';

/** プレビュー下のサブアクション用アイコンタイル（縦並びアイコン＋ラベル）。 */
const ActionTile: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}> = ({ onClick, disabled, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border border-input bg-card text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
  >
    {icon}
    <span>{label}</span>
  </button>
);

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
      toast.success(`${format.toUpperCase()}画像をダウンロードしました`);
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
          toast.success('QRコード画像をコピーしました');
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
      toast.success('SVG画像をダウンロードしました');
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
        toast.success('共有しました');
      }
    } catch (error) {
      // ユーザーが共有をキャンセルした場合（AbortError）は通知しない
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error('共有に失敗しました');
      }
    }
  };

  const isDisabled = !qrStore.url.trim();
  const supportsShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="space-y-4">
      {/* メイン: PNGダウンロード */}
      <Button
        onClick={() => handleDownload('png')}
        disabled={isDisabled || isDownloading}
        size="lg"
        className="w-full min-h-[48px] text-[15px]"
      >
        <Download className="h-5 w-5" />
        {isDownloading ? '生成中...' : 'PNGでダウンロード'}
      </Button>

      {/* サブアクション（アイコンタイル） */}
      <div className={`grid gap-2.5 ${supportsShare ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <ActionTile
          onClick={() => handleDownload('jpg')}
          disabled={isDisabled || isDownloading}
          icon={<ImageIcon className="h-5 w-5" />}
          label="JPG"
        />
        <ActionTile
          onClick={handleDownloadSVG}
          disabled={isDisabled || isDownloading}
          icon={<FileCode className="h-5 w-5" />}
          label="SVG"
        />
        <ActionTile
          onClick={handleCopyToClipboard}
          disabled={isDisabled || isDownloading}
          icon={copySuccess ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
          label={copySuccess ? '完了' : 'コピー'}
        />
        {supportsShare && (
          <ActionTile
            onClick={handleShare}
            disabled={isDisabled}
            icon={<Share2 className="h-5 w-5" />}
            label="共有"
          />
        )}
      </div>

      {/* ライブラリ保存 */}
      <SaveToLibraryButton
        disabled={isDisabled}
        variant="ghost"
        className="w-full min-h-[44px] bg-accent text-accent-foreground hover:bg-accent/70"
      />

      {/* 出力情報カード */}
      <div className="bg-muted/60 border border-border rounded-xl p-3">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
