import React, { useEffect, useId, useRef, useState } from 'react';
import { ModalDialog } from '../ui/ModalDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface NameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  initialName: string;
  confirmLabel: string;
  onConfirm: (name: string) => void;
}

/**
 * 名前入力用の共通ダイアログ（ライブラリへの保存・名前変更で再利用）。
 */
export const NameDialog: React.FC<NameDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  initialName,
  confirmLabel,
  onConfirm,
}) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // 開くたびに初期値へリセットし、入力欄へフォーカスする
  useEffect(() => {
    if (open) {
      setName(initialName);
      // Radix のフォーカストラップ確定後にフォーカス＆全選択する
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [open, initialName]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    onOpenChange(false);
  };

  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirm();
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            名前
          </label>
          <Input
            id={inputId}
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 会社サイト用QR"
            maxLength={100}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
};
