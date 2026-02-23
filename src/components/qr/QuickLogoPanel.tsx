import React, { useRef, useState } from 'react';
import { ImagePlus, Settings2, X } from 'lucide-react';
import { useQRStore } from '@/store/qrStore';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const LOGO_PRESETS = [
  { label: '円形 S', settings: { size: 20, padding: 4, radius: 100 } },
  { label: '角丸 M', settings: { size: 25, padding: 6, radius: 20 } },
  { label: '四角 L', settings: { size: 30, padding: 8, radius: 0 } },
  { label: '小さめ', settings: { size: 15, padding: 2, radius: 50 } },
] as const;

export const QuickLogoPanel: React.FC = () => {
  const { logoFile, logoSettings, setLogoFile, updateLogoSettings } =
    useQRStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    e.target.value = '';
  };

  const handleClear = () => {
    setLogoFile(null);
    setPreview(null);
    setIsEditOpen(false);
  };

  return (
    <div className="px-3 py-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-label="ロゴ画像を選択"
      />

      {!logoFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
        >
          <ImagePlus className="w-4 h-4 shrink-0" aria-hidden="true" />
          ロゴを追加
        </button>
      ) : (
        <div className="space-y-2">
          {/* ファイル行 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            {preview && (
              <img
                src={preview}
                alt="ロゴ"
                className="w-8 h-8 object-contain shrink-0"
                style={{ borderRadius: `${logoSettings.radius}%` }}
              />
            )}
            <span className="flex-1 text-sm text-gray-700 truncate min-w-0">
              {logoFile.name}
            </span>
            <button
              type="button"
              onClick={() => setIsEditOpen(!isEditOpen)}
              aria-label="ロゴ設定を編集"
              aria-expanded={isEditOpen}
              className={cn(
                'shrink-0 p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                isEditOpen
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              aria-label="ロゴを削除"
              className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* 編集パネル */}
          {isEditOpen && (
            <div className="space-y-3 p-3 bg-white border border-gray-200 rounded-lg max-h-52 overflow-y-auto">
              {/* プリセット */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  プリセット
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {LOGO_PRESETS.map(({ label, settings }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => updateLogoSettings(settings)}
                      className="px-1 py-1.5 text-xs border border-gray-200 rounded-md bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* サイズ */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">
                    サイズ
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {logoSettings.size}%
                  </span>
                </div>
                <Slider
                  value={[logoSettings.size]}
                  onValueChange={([v]) => updateLogoSettings({ size: v })}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>

              {/* 余白 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">
                    余白
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {logoSettings.padding}px
                  </span>
                </div>
                <Slider
                  value={[logoSettings.padding]}
                  onValueChange={([v]) => updateLogoSettings({ padding: v })}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>

              {/* 角丸 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">
                    角丸
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {logoSettings.radius}%
                  </span>
                </div>
                <Slider
                  value={[logoSettings.radius]}
                  onValueChange={([v]) => updateLogoSettings({ radius: v })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
