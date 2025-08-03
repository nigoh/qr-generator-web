import React from 'react';
import { useQRStore } from '../../store/qrStore';
import { isValidHexColor } from '../../utils/colorUtils';

export const ColorPicker: React.FC = () => {
  const { fgColor, bgColor, setFgColor, setBgColor } = useQRStore();

  const handleFgColorChange = (color: string) => {
    if (isValidHexColor(color)) {
      setFgColor(color);
    }
  };

  const handleBgColorChange = (color: string) => {
    if (isValidHexColor(color)) {
      setBgColor(color);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">色設定</h3>

      {/* 前景色 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          前景色（QRコード）
        </label>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm cursor-pointer"
            style={{ backgroundColor: fgColor }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = fgColor;
              input.onchange = (e) =>
                handleFgColorChange((e.target as HTMLInputElement).value);
              input.click();
            }}
          />
          <input
            type="color"
            value={fgColor}
            onChange={(e) => handleFgColorChange(e.target.value)}
            className="w-12 h-10 rounded-md cursor-pointer border-0 bg-transparent"
          />
          <input
            type="text"
            value={fgColor}
            onChange={(e) => handleFgColorChange(e.target.value)}
            className="font-mono text-sm w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* 背景色 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">背景色</label>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm cursor-pointer"
            style={{ backgroundColor: bgColor }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = bgColor;
              input.onchange = (e) =>
                handleBgColorChange((e.target as HTMLInputElement).value);
              input.click();
            }}
          />
          <input
            type="color"
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value)}
            className="w-12 h-10 rounded-md cursor-pointer border-0 bg-transparent"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value)}
            className="font-mono text-sm w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* カラープリセット */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">プリセット</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'ブラック', fg: '#000000', bg: '#ffffff' },
            { name: 'ブルー', fg: '#1e40af', bg: '#ffffff' },
            { name: 'グリーン', fg: '#166534', bg: '#ffffff' },
            { name: 'レッド', fg: '#dc2626', bg: '#ffffff' },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setFgColor(preset.fg);
                setBgColor(preset.bg);
              }}
              className="flex items-center space-x-2 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: preset.fg }}
              />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* コントラスト警告 */}
      {fgColor === bgColor && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ 前景色と背景色が同じです。QRコードが読み取れません。
        </div>
      )}
    </div>
  );
};
