import React, { useEffect, useId, useState } from 'react';
import { Download, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import type { SavedQR } from '../../types/qr.types';

interface QRLibraryCardProps {
  item: SavedQR;
  onLoad: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * 保存済みQR 1件分のカード。サムネイルの ObjectURL を自身で管理する。
 */
export const QRLibraryCard: React.FC<QRLibraryCardProps> = ({
  item,
  onLoad,
  onRename,
  onDelete,
}) => {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const nameId = useId();

  useEffect(() => {
    const url = URL.createObjectURL(item.thumbnail);
    setThumbUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [item.thumbnail]);

  return (
    <article
      aria-labelledby={nameId}
      className="flex flex-col rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
    >
      <div className="flex justify-center rounded-md bg-gray-50 p-2">
        {thumbUrl && (
          <img
            src={thumbUrl}
            alt={`${item.name} のQRコードサムネイル`}
            className="h-28 w-28 object-contain"
          />
        )}
      </div>

      <h3 id={nameId} className="mt-2 truncate text-sm font-medium text-gray-900" title={item.name}>
        {item.name}
      </h3>
      <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>

      <div className="mt-3 flex items-center gap-1.5">
        <Button type="button" size="sm" onClick={onLoad} className="flex-1" aria-label={`「${item.name}」を読み込む`}>
          <Download className="mr-1 h-4 w-4" aria-hidden="true" />
          読み込む
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRename}
          aria-label={`「${item.name}」の名前を変更`}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDelete}
          aria-label={`「${item.name}」を削除`}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
};
