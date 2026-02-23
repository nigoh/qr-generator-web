import React from 'react';
import { useQRStore } from '@/store/qrStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { QRSettings } from '@/types/qr.types';

type DotStyle = QRSettings['dotStyle'];

const DOT_STYLES: {
  value: DotStyle;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'square',
    label: '四角形',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <rect x="1" y="1" width="14" height="14" />
      </svg>
    ),
  },
  {
    value: 'circle',
    label: '円形',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="8" cy="8" r="7" />
      </svg>
    ),
  },
  {
    value: 'rounded',
    label: '角丸',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <rect x="1" y="1" width="14" height="14" rx="4" ry="4" />
      </svg>
    ),
  },
  {
    value: 'diamond',
    label: 'ダイヤ',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <polygon points="8,1 15,8 8,15 1,8" />
      </svg>
    ),
  },
];

export const DotStyleSelector: React.FC = () => {
  const { dotStyle, setDotStyle } = useQRStore();

  return (
    <TooltipProvider>
      <div
        className="flex flex-col gap-1.5"
        role="group"
        aria-label="ドットスタイル"
      >
        {DOT_STYLES.map(({ value, label, icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setDotStyle(value)}
                aria-label={label}
                aria-pressed={dotStyle === value}
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                  dotStyle === value
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                )}
              >
                <span className="w-4 h-4 block">{icon}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={4}>
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
