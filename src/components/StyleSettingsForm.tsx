import React from 'react';
import { useQRStore } from '../store/qrStore';
import { ColorPicker } from './ui/ColorPicker';
import { Button } from './ui';
import { Label } from './ui';
import { getContrastRatio, getQRColorPresets } from '../utils/colorUtils';

export const StyleSettingsForm: React.FC = () => {
  const {
    fgColor,
    bgColor,
    fgGradientEnd,
    setFgColor,
    setBgColor,
    setFgGradientEnd,
  } = useQRStore();
  const presets = getQRColorPresets();
  const contrast = getContrastRatio(fgColor, bgColor);
  const gradientEnabled = fgGradientEnd !== '';

  const handleGradientToggle = () => {
    if (gradientEnabled) {
      setFgGradientEnd('');
    } else {
      // デフォルトのグラデーション終端色（紫系）
      setFgGradientEnd('#6366f1');
    }
  };

  return (
    <div className="space-y-6">
      {/* 色設定 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 前景色（ドット） */}
        <ColorPicker
          label="ドットの色（開始色）"
          value={fgColor}
          onChange={setFgColor}
        />
        
        {/* 背景色 */}
        <ColorPicker
          label="背景色"
          value={bgColor}
          onChange={setBgColor}
        />
      </div>

      {/* グラデーション設定 */}
      <div className="space-y-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <Label className="cursor-pointer select-none" htmlFor="gradient-toggle">
            グラデーション
          </Label>
          <button
            id="gradient-toggle"
            type="button"
            role="switch"
            aria-checked={gradientEnabled}
            onClick={handleGradientToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              gradientEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                gradientEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {gradientEnabled && (
          <div className="space-y-2">
            <ColorPicker
              label="グラデーション終端色"
              value={fgGradientEnd}
              onChange={setFgGradientEnd}
            />
            <div
              className="h-6 w-full rounded border border-gray-300"
              style={{
                background: `linear-gradient(to right, ${fgColor}, ${fgGradientEnd})`,
              }}
              aria-label="グラデーションプレビュー"
            />
            <p className="text-xs text-gray-500">
              左上から右下へのグラデーションがQRコード全体に適用されます。
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>カラープリセット</Label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => {
                setFgColor(preset.fg);
                setBgColor(preset.bg);
              }}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* カラープレビュー */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">カラープレビュー</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {gradientEnabled ? (
              <div
                className="w-6 h-6 border border-gray-300 rounded"
                style={{ background: `linear-gradient(135deg, ${fgColor}, ${fgGradientEnd})` }}
              />
            ) : (
              <div 
                className="w-6 h-6 border border-gray-300 rounded"
                style={{ backgroundColor: fgColor }}
              />
            )}
            <span className="text-sm text-gray-600">ドット</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 border border-gray-300 rounded"
              style={{ backgroundColor: bgColor }}
            />
            <span className="text-sm text-gray-600">背景</span>
          </div>
          <div className="flex-1" />
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span>コントラスト比: <strong className={contrast >= 4.5 ? 'text-green-700' : contrast >= 3 ? 'text-yellow-700' : 'text-red-700'}>{contrast.toFixed(2)}:1</strong></span>
            {contrast >= 4.5 ? (
              <span className="text-green-700 font-medium">✓ WCAG AA</span>
            ) : contrast >= 3 ? (
              <span className="text-yellow-700 font-medium">△ AA不足</span>
            ) : (
              <span className="text-red-700 font-medium">✗ 不十分</span>
            )}
          </div>
        </div>
        
        {contrast < 4.5 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <span aria-hidden="true">⚠️</span>{' '}
            {contrast < 3
              ? 'コントラスト比が低すぎます。QRコードが読み取れない可能性があります。'
              : 'WCAG AA基準（4.5:1）を下回っています。読み取りにくい場合があります。'}
          </div>
        )}
      </div>
    </div>
  );
};
