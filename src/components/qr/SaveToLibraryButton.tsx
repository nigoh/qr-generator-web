import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '../ui/button';
import { NameDialog } from '../library/NameDialog';
import { useQRLibrary } from '../../hooks/useQRLibrary';
import { useQRStore } from '../../store/qrStore';
import { toast } from '../../hooks/useToast';

interface SaveToLibraryButtonProps {
  disabled?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  /** アイコンのみのコンパクト表示（モバイルのアクションバー用） */
  compact?: boolean;
}

const defaultName = (url: string): string => {
  const trimmed = url.trim();
  if (trimmed) return trimmed.slice(0, 60);
  const iso = new Date().toISOString().slice(0, 19);
  return `qr_${iso.replaceAll('-', '').replaceAll(':', '').replace('T', '')}`;
};

/**
 * 現在のQRをローカルDB（ライブラリ）に名前を付けて保存するボタン。
 * 名前入力ダイアログを内包する。
 */
export const SaveToLibraryButton: React.FC<SaveToLibraryButtonProps> = ({
  disabled = false,
  className,
  variant = 'secondary',
  compact = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { save } = useQRLibrary();
  const url = useQRStore((s) => s.url);

  const handleConfirm = async (name: string) => {
    try {
      await save(name);
      toast.success('ライブラリに保存しました');
    } catch (error) {
      console.error('Save to library failed:', error);
      toast.error('ライブラリへの保存に失敗しました');
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setDialogOpen(true)}
        disabled={disabled}
        variant={variant}
        className={className}
        aria-label={compact ? 'ライブラリに保存' : undefined}
      >
        <Bookmark className={compact ? 'h-5 w-5' : 'mr-2 h-4 w-4'} aria-hidden="true" />
        {!compact && 'ライブラリに保存'}
      </Button>

      <NameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="ライブラリに保存"
        description="このQRコードに名前を付けてブラウザ内に保存します。"
        initialName={defaultName(url)}
        confirmLabel="保存"
        onConfirm={handleConfirm}
      />
    </>
  );
};
