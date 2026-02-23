import React from 'react';
import { useQRStore } from '@/store/qrStore';
import { getQRColorPresets } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';

export const QuickColorBar: React.FC = () => {
  const { fgColor, bgColor, setFgColor, setBgColor } = useQRStore();
  const presets = getQRColorPresets();

  const isActive = (fg: string, bg: string) =>
    fgColor.toLowerCase() === fg.toLowerCase() &&
    bgColor.toLowerCase() === bg.toLowerCase();

  return (
    <div className="w-full px-3 py-2">
      <p className="text-xs text-gray-500 mb-2">カラープリセット</p>
      <div
        className="flex gap-2.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
        role="group"
        aria-label="カラープリセット"
      >
        {presets.map((preset) => {
          const active = isActive(preset.fg, preset.bg);
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setFgColor(preset.fg);
                setBgColor(preset.bg);
              }}
              aria-label={preset.name}
              aria-pressed={active}
              className={cn(
                'relative shrink-0 flex flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-full',
              )}
            >
              {/* 2色の円（上半分=前景色 / 下半分=背景色） */}
              <div
                className={cn(
                  'w-9 h-9 rounded-full border-2 overflow-hidden transition-shadow',
                  active
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-400 ring-offset-1'
                    : 'border-gray-200 shadow-sm'
                )}
                style={{
                  background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
                }}
              />
              <span className="text-[10px] text-gray-600 leading-none whitespace-nowrap max-w-[44px] overflow-hidden text-ellipsis">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
