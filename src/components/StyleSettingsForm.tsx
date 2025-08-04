import React from 'react';
import { useQRStore } from '../store/qrStore';
import { ColorPicker } from './ui/ColorPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui';
import { Label } from './ui';

const DOT_STYLE_OPTIONS = [
  { value: 'square', label: '四角形（標準）' },
  { value: 'circle', label: '円形' },
  { value: 'rounded', label: '角丸四角形' },
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
          onValueChange={(value) => setDotStyle(value as 'square' | 'circle' | 'rounded')}
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
            コントラスト比: {calculateContrast(fgColor, bgColor).toFixed(2)}:1
          </div>
        </div>
        
        {calculateContrast(fgColor, bgColor) < 3 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            ⚠️ コントラスト比が低いため、QRコードが読み取りにくい可能性があります。
          </div>
        )}
      </div>
    </div>
  );
};

// コントラスト比計算関数
function calculateContrast(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const getRGB = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * getRGB(r) + 0.7152 * getRGB(g) + 0.0722 * getRGB(b);
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}
