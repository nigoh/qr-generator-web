import React, { useEffect, useState } from 'react';
import { Library } from 'lucide-react';
import { useQRLibrary } from '../../hooks/useQRLibrary';
import { toast } from '../../hooks/useToast';
import type { SavedQR } from '../../types/qr.types';
import { QRLibraryCard } from './QRLibraryCard';
import { NameDialog } from './NameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface QRLibraryProps {
  /** 項目を読み込んだ後に呼ばれる（ダイアログを閉じる用途） */
  onLoaded?: () => void;
}

/**
 * 保存済みQRコードの一覧表示。読み込み・名前変更・削除を提供する。
 */
export const QRLibrary: React.FC<QRLibraryProps> = ({ onLoaded }) => {
  const { items, isLoading, refresh, remove, rename, load } = useQRLibrary();
  const [renameTarget, setRenameTarget] = useState<SavedQR | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedQR | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLoad = async (item: SavedQR) => {
    await load(item.id);
    toast.success(`「${item.name}」を読み込みました`);
    onLoaded?.();
  };

  const handleRename = async (name: string) => {
    if (!renameTarget) return;
    try {
      await rename(renameTarget.id, name);
      toast.success('名前を変更しました');
    } catch (error) {
      console.error('Rename failed:', error);
      toast.error('名前の変更に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      toast.success('削除しました');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('削除に失敗しました');
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <p role="status" className="py-8 text-center text-sm text-gray-500">
        読み込み中...
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center gap-2 py-10 text-center">
        <Library className="h-10 w-10 text-gray-300" aria-hidden="true" />
        <p className="text-sm text-gray-500">保存されたQRコードはありません</p>
        <p className="text-xs text-gray-400">
          設定したQRコードは「ライブラリに保存」から保存できます。
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <QRLibraryCard
              item={item}
              onLoad={() => handleLoad(item)}
              onRename={() => setRenameTarget(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          </li>
        ))}
      </ul>

      <NameDialog
        open={renameTarget !== null}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title="名前を変更"
        initialName={renameTarget?.name ?? ''}
        confirmLabel="変更"
        onConfirm={handleRename}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        name={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
      />
    </>
  );
};
