import React from 'react';
import { useQRStore } from '../store/qrStore';
import { Label } from './ui';
import { Textarea } from './ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui';
import { Slider } from './ui';
import { CollapsibleSection } from './ui/CollapsibleSection';

const ERROR_CORRECTION_OPTIONS = [
  { value: 'L', label: 'L (低: ~7%)' },
  { value: 'M', label: 'M (中: ~15%)' },
  { value: 'Q', label: 'Q (高: ~25%)' },
  { value: 'H', label: 'H (最高: ~30%)' },
];

export const BasicSettingsForm: React.FC = () => {
  const {
    url,
    errorCorrection,
    boxSize,
    border,
    setUrl,
    setErrorCorrection,
    setBoxSize,
    setBorder,
  } = useQRStore();

  return (
    <CollapsibleSection title="基本設定" defaultOpen={true}>
      <div className="space-y-6">
        {/* テキスト入力 */}
        <div className="space-y-2">
          <Label htmlFor="qr-text">QRコードに埋め込むテキスト</Label>
          <Textarea
            id="qr-text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URLやテキストを入力してください"
            className="min-h-[100px]"
            required
          />
          <p className="text-xs text-gray-500">
            文字数: {url.length} | 推奨: URL、メール、電話番号、プレーンテキスト
          </p>
        </div>

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
          <div className="flex justify-between items-center">
            <Label>QRコードモジュールサイズ</Label>
            <span className="text-sm text-gray-500">{boxSize}px</span>
          </div>
          <Slider
            value={[boxSize]}
            onValueChange={(value) => setBoxSize(value[0])}
            min={5}
            max={20}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            QRコードの各ドット（モジュール）のサイズです。
            大きくするとQRコード全体のサイズが大きくなります。
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
    </CollapsibleSection>
  );
};
