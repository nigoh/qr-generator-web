import React from 'react';
import { useQRStore } from '../store/qrStore';
import { Label } from './ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui';
import { Slider } from './ui';

const ERROR_CORRECTION_OPTIONS = [
  { value: 'L', label: 'L (低: ~7%)' },
  { value: 'M', label: 'M (中: ~15%)' },
  { value: 'Q', label: 'Q (高: ~25%)' },
  { value: 'H', label: 'H (最高: ~30%)' },
];

const MODULE_SIZE_OPTIONS = [
  { value: 6, label: 'Small (6px)', description: 'コンパクト・モバイル向け' },
  { value: 9, label: 'Medium (9px)', description: '標準サイズ・バランス型' },
  { value: 12, label: 'Large (12px)', description: '印刷・大画面向け' },
  { value: 15, label: 'Extra Large (15px)', description: '高解像度・看板用' },
];

export const BasicSettingsForm: React.FC = () => {
  const {
    errorCorrection,
    boxSize,
    border,
    setErrorCorrection,
    setBoxSize,
    setBorder,
  } = useQRStore();

  return (
    <div className="space-y-6">
      {/* エラー訂正レベル */}
      <div className="space-y-2">
        <Label>エラー訂正レベル</Label>
        <Select value={errorCorrection} onValueChange={(value) => setErrorCorrection(value as 'L' | 'M' | 'Q' | 'H')}>
          <SelectTrigger>
            <SelectValue placeholder="エラー訂正レベルを選択" />
          </SelectTrigger>
          <SelectContent>
            {ERROR_CORRECTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          エラー訂正レベルが高いほど、QRコードが損傷しても読み取れる可能性が高くなりますが、
          データ密度は低くなります。ロゴを埋め込む場合は「Q」以上を推奨します。
        </p>
      </div>

      {/* ボックスサイズ設定 */}
      <div className="space-y-2">
        <Label>QRコードサイズ</Label>
        <Select 
          value={boxSize.toString()} 
          onValueChange={(value) => setBoxSize(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="サイズを選択" />
          </SelectTrigger>
          <SelectContent>
            {MODULE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          QRコードの各ドット（モジュール）のサイズです。
          用途に応じて適切なサイズを選択してください。
        </p>
      </div>

      {/* ボーダーサイズ */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>クワイエットゾーン（余白）</Label>
          <span className="text-sm text-gray-500">{border}モジュール</span>
        </div>
        <Slider
          value={[border]}
          onValueChange={(value) => setBorder(value[0])}
          min={0}
          max={20}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          QRコード周囲の余白サイズです。規格では最低4モジュールが推奨されています。
          スキャンの安定性を重視する場合は4以上に設定してください。
        </p>
      </div>
    </div>
  );
};
