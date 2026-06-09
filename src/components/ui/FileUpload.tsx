import React, { useId, useRef } from 'react';
import clsx from 'clsx';

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  preview?: string | null;
  /** 受け付ける最大ファイルサイズ(バイト)。超過時は onChange を呼ばず onError を通知する。 */
  maxSizeBytes?: number;
  /** バリデーションエラー時のメッセージ通知（トースト表示などに利用） */
  onError?: (message: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onChange,
  className,
  disabled = false,
  multiple = false,
  preview,
  maxSizeBytes,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reactId = useId();
  const inputId = `${reactId}-file`;
  const helpId = `${reactId}-help`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && maxSizeBytes && file.size > maxSizeBytes) {
      const limitMB = Math.round(maxSizeBytes / (1024 * 1024));
      onError?.(`ファイルサイズが大きすぎます（上限 ${limitMB}MB）。別の画像を選択してください。`);
      // 同じファイルを再選択できるよう入力値をリセットする
      e.target.value = '';
      return;
    }
    onChange(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  return (
    <div className={clsx('flex flex-col space-y-3', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* ファイル選択エリア */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          aria-label={`${label}：ファイルを選択`}
          aria-describedby={helpId}
          className={clsx(
            'px-4 py-2 border border-gray-300 rounded-md text-sm font-medium',
            'bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            'transition-colors duration-200'
          )}
        >
          ファイルを選択
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            aria-label={`${label}：選択したファイルをクリア`}
            className={clsx(
              'px-3 py-2 border border-red-300 rounded-md text-sm font-medium',
              'bg-white text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            クリア
          </button>
        )}
      </div>

      {/* 隠れたファイル入力 */}
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        multiple={multiple}
        aria-label={label}
        aria-describedby={helpId}
        className="hidden"
      />
      
      {/* プレビューエリア */}
      {preview && (
        <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center space-x-3">
            <img
              src={preview}
              alt="プレビュー"
              className="w-16 h-16 object-contain border border-gray-300 rounded bg-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate">
                ロゴ画像が選択されました
              </p>
              <p className="text-xs text-gray-400">
                サイズ調整や位置調整は下記の設定で行えます
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* ヘルプテキスト */}
      <p id={helpId} className="text-xs text-gray-500">
        対応形式: PNG, JPG, GIF, SVG （推奨: 正方形で透明背景のPNG）
        {maxSizeBytes
          ? `／最大 ${Math.round(maxSizeBytes / (1024 * 1024))}MB`
          : ''}
      </p>
    </div>
  );
};
