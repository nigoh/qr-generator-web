import React from 'react';
import { useQRStore } from '../store/qrStore';
import { ColorPicker } from './ui/ColorPicker';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui';
import { Label } from './ui';
import { getContrastRatio, getQRColorPresets } from '../utils/colorUtils';

const DOT_STYLE_OPTIONS = [
  { value: 'square', label: '四角形（標準）' },
  { value: 'circle', label: '円形' },
  { value: 'rounded', label: '角丸四角形' },
  { value: 'diamond', label: 'ダイヤモンド' },
];

export const StyleSettingsForm: React.FC = () => {
  const {
    fgColor,
    bgColor,
    dotStyle,
    setFgColor,
    setBgColor,
    setDotStyle,
  } = useQRStore();
  const presets = getQRColorPresets();
  const contrast = getContrastRatio(fgColor, bgColor);

  return (
    <div className="space-y-6">
      {/* 色設定 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 前景色（ドット） */}
        <ColorPicker
          label="ドットの色"
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

      {/* ドットスタイル */}
      <div className="space-y-2">
        <Label htmlFor="dot-style">ドットの形状</Label>
        <Select
          value={dotStyle}
          onValueChange={(value) => setDotStyle(value as 'square' | 'circle' | 'rounded' | 'diamond')}
        >
          <SelectTrigger>
            <SelectValue placeholder="ドットの形状を選択" />
          </SelectTrigger>
          <SelectContent>
            {DOT_STYLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <p className="text-xs text-gray-500">
        ドットの形状を変更すると、QRコードの見た目が変わります。
        読み取り精度を重視する場合は「四角形（標準）」を推奨します。
      </p>

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
            <div 
              className="w-6 h-6 border border-gray-300 rounded"
              style={{ backgroundColor: fgColor }}
            />
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
          <div className="text-xs text-gray-500">
            コントラスト比: {contrast.toFixed(2)}:1
          </div>
        </div>
        
        {contrast < 3 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            ⚠️ コントラスト比が低いため、QRコードが読み取りにくい可能性があります。
          </div>
        )}
      </div>
    </div>
  );
};
