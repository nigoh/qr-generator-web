import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { ModalDialog } from '../ui/ModalDialog';
import { useQRStore } from '../../store/qrStore';
import { toast } from '../../hooks/useToast';

interface ResetButtonProps {
  className?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
}

/**
 * 入力・設定を初期状態に戻すボタン。
 * 誤操作で内容を失わないよう、確認ダイアログを挟む。
 */
export const ResetButton: React.FC<ResetButtonProps> = ({
  className,
  variant = 'ghost',
  size = 'sm',
}) => {
  const [open, setOpen] = useState(false);
  const resetSettings = useQRStore((s) => s.resetSettings);

  const handleConfirm = () => {
    resetSettings();
    setOpen(false);
    toast.success('設定をリセットしました');
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
        リセット
      </Button>

      <ModalDialog
        open={open}
        onOpenChange={setOpen}
        title="設定をリセット"
        description="入力内容とすべての設定が初期状態に戻ります。"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            この操作は取り消せません。リセットしてもよろしいですか？
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirm}>
              リセットする
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  );
};
