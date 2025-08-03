import React, { useEffect, useRef, useState } from 'react';
import { useQRStore } from '../../store/qrStore';
import { generateQRCode } from '../../utils/qrGenerator';

export const QRPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState({ width: 0, height: 0 });

  const qrStore = useQRStore();

  // QRコード生成
  const generatePreview = async () => {
    const url = qrStore.url || '';
    if (!canvasRef.current || !url.trim()) return;

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
      setError(
        err instanceof Error ? err.message : 'QRコードの生成に失敗しました'
      );
    } finally {
      setIsGenerating(false);
    }
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
    <div className="space-y-3">
      {/* 生成状態 */}
      {isGenerating && (
        <div className="flex items-center justify-center space-x-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg py-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">QRコードを生成中...</span>
        </div>
      )}

      {/* QRコード表示エリア */}
      <div className="border-2 border-gray-200 rounded-xl bg-white p-6 shadow-inner">
        {!(qrStore.url || '').trim() ? (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-base font-medium text-gray-600 mb-1">
                QRコードを生成しましょう
              </h3>
              <p className="text-gray-500 text-sm">
                右側の設定パネルでURL/テキストを入力してください
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 bg-red-50 border-2 border-dashed border-red-300 rounded-lg">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-base font-medium text-red-600 mb-1">
                エラーが発生しました
              </h3>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                style={{ maxHeight: '300px', maxWidth: '300px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* QRコード情報パネル */}
      {qrSize.width > 0 && !error && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-800">{qrSize.width} × {qrSize.height}</div>
              <div className="text-gray-600">サイズ (px)</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-gray-800">{qrStore.errorCorrection}</div>
              <div className="text-gray-600">エラー訂正</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-gray-800">{(qrStore.url || '').length}</div>
              <div className="text-gray-600">文字数</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">
                {qrStore.logoFile ? 'あり' : 'なし'}
              </div>
              <div className="text-gray-600">ロゴ</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
