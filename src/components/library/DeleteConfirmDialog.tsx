import React from 'react';
import { ModalDialog } from '../ui/ModalDialog';
import { Button } from '../ui/button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 削除対象の名前（表示用） */
  name: string;
  onConfirm: () => void;
}

/**
 * ライブラリ項目の削除確認ダイアログ。
 */
export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  name,
  onConfirm,
}) => (
  <ModalDialog
    open={open}
    onOpenChange={onOpenChange}
    title="QRコードを削除"
    description="この操作は取り消せません。"
  >
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        「<span className="font-medium">{name}</span>」を削除してもよろしいですか？
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          キャンセル
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          削除する
        </Button>
      </div>
    </div>
  </ModalDialog>
);
