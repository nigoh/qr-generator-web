import React, { useEffect, useRef, useState } from 'react';
import { useQRStore } from '../store/qrStore';
import { generateQRCode } from '../utils/qrGenerator';
import { Button } from './ui/button';

export const QRPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState({ width: 0, height: 0 });
  
  const qrStore = useQRStore();

  // QRコード生成
  const generatePreview = async () => {
    if (!canvasRef.current || !qrStore.url.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const settings = qrStore.getQRSettings();
      const canvas = await generateQRCode(
        qrStore.url,
        {
          ...settings,
          logoFile: qrStore.logoFile,
          logoSettings: qrStore.logoSettings,
        },
        canvasRef.current
      );
      
      setQrSize({
        width: canvas.width,
        height: canvas.height,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'QRコードの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // ダウンロード処理
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // 設定変更時の自動更新
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 300); // デバウンス

    return () => clearTimeout(timeoutId);
  }, [
    qrStore.url,
    qrStore.errorCorrection,
    qrStore.fgColor,
    qrStore.bgColor,
    qrStore.dotStyle,
    qrStore.boxSize,
    qrStore.border,
    qrStore.logoFile,
    qrStore.logoSettings,
  ]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">QRコードプレビュー</h2>
        <div className="flex items-center space-x-3">
          <Button
            onClick={generatePreview}
            disabled={isGenerating || !qrStore.url.trim()}
            variant="outline"
            size="sm"
          >
            {isGenerating ? '生成中...' : '更新'}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating || !qrStore.url.trim() || !!error}
            variant="default"
            size="sm"
          >
            ダウンロード
          </Button>
        </div>
      </div>

      {/* QRコード表示エリア */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="p-6">
          {!qrStore.url.trim() ? (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 text-sm">
                  QRコードに埋め込むテキストを入力してください
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm font-medium">エラーが発生しました</p>
                <p className="text-red-500 text-xs mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="relative">
                {isGenerating && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border border-gray-300 rounded shadow-sm"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* QRコード情報 */}
        {qrSize.width > 0 && !error && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>サイズ: {qrSize.width} × {qrSize.height}px</span>
                <span>エラー訂正: {qrStore.errorCorrection}</span>
                <span>文字数: {qrStore.url.length}</span>
              </div>
              {qrStore.logoFile && (
                <span className="text-blue-600">ロゴ付き</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 使用方法 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 使用方法</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 左側の設定を調整すると、リアルタイムでプレビューが更新されます</li>
          <li>• 「ダウンロード」ボタンでPNG形式の画像として保存できます</li>
          <li>• モバイルデバイスでも読み取りテストを行うことをお勧めします</li>
          <li>• 印刷する場合は、十分なサイズ（最低2cm×2cm）で出力してください</li>
        </ul>
      </div>
    </div>
  );
};
