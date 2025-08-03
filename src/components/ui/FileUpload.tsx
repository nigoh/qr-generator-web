import React, { useRef } from 'react';
import clsx from 'clsx';

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  preview?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onChange,
  className,
  disabled = false,
  multiple = false,
  preview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
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
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* ファイル選択エリア */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
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
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        multiple={multiple}
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
      <p className="text-xs text-gray-500">
        対応形式: PNG, JPG, GIF, SVG （推奨: 正方形で透明背景のPNG）
      </p>
    </div>
  );
};
