import React, { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useQRStore } from '@/store/qrStore';

export const QuickLogoUpload: React.FC = () => {
  const { logoFile, setLogoFile } = useQRStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
    // 同じファイルを再選択できるようにリセット
    e.target.value = '';
  };

  const handleClear = () => {
    setLogoFile(null);
    setPreview(null);
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
          aria-label="ロゴ画像を追加"
        >
          <ImagePlus className="w-4 h-4 shrink-0" aria-hidden="true" />
          ロゴを追加
        </button>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          {preview && (
            <img
              src={preview}
              alt="ロゴサムネイル"
              className="w-8 h-8 object-contain rounded shrink-0"
            />
          )}
          <span className="flex-1 text-sm text-gray-700 truncate min-w-0">
            {logoFile.name}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 p-1 rounded text-gray-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
            aria-label="ロゴを削除"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
