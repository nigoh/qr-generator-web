import React from 'react';
import { ModalDialog } from '../ui/ModalDialog';
import { QRLibrary } from './QRLibrary';

interface QRLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 保存済みQRコードのライブラリをモーダルで表示する。
 * 項目を読み込むと自動的に閉じてプレビューを確認できる。
 */
export const QRLibraryDialog: React.FC<QRLibraryDialogProps> = ({ open, onOpenChange }) => (
  <ModalDialog
    open={open}
    onOpenChange={onOpenChange}
    title="保存したQRコード"
    description="ブラウザ内に保存したQRコードを読み込み・管理できます。"
    className="max-w-2xl"
  >
    <QRLibrary onLoaded={() => onOpenChange(false)} />
  </ModalDialog>
);
