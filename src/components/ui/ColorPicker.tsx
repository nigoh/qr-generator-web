import React, { useId } from 'react';
import clsx from 'clsx';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  className,
  disabled = false,
}) => {
  const reactId = useId();
  const colorInputId = `${reactId}-color`;
  const hexInputId = `${reactId}-hex`;
  const errorId = `${reactId}-error`;
  const isValid = /^#[0-9A-Fa-f]{6}$/.test(value);

  return (
    <div className={clsx('flex flex-col space-y-2', className)}>
      <label htmlFor={colorInputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-center space-x-3">
        {/* カラーピッカー */}
        <div className="relative">
          <input
            id={colorInputId}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-label={`${label}（カラーピッカー）`}
            className={clsx(
              'w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer overflow-hidden',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
            )}
            style={{
              WebkitAppearance: 'none',
              padding: 0,
            }}
          />
        </div>

        {/* カラーコード入力 */}
        <input
          id={hexInputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          aria-label={`${label}（16進数カラーコード）`}
          aria-invalid={!isValid}
          aria-describedby={!isValid ? errorId : undefined}
          className={clsx(
            'flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            'placeholder-gray-400'
          )}
          pattern="^#[0-9A-Fa-f]{6}$"
          maxLength={7}
        />

        {/* プレビュー */}
        <div
          className="w-8 h-8 rounded border-2 border-gray-300"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
      </div>

      {/* 無効な色の場合の警告 */}
      {!isValid && (
        <p id={errorId} role="alert" className="text-xs text-red-500">
          有効な16進カラーコードを入力してください（例: #FF0000）
        </p>
      )}
    </div>
  );
};
