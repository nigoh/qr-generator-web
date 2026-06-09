import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** aria-describedby に紐づく説明文（省略時は説明なし） */
  description?: string;
  children: React.ReactNode;
  /** Content の追加クラス（最大幅の上書きなど） */
  className?: string;
}

/**
 * 中央配置のレスポンシブなモーダルダイアログ。
 * フォーカストラップ・Escクローズ・フォーカス復帰は Radix が担保する。
 * 共有 dialog.tsx は全画面表示のため、小さなプロンプトや
 * ギャラリー用にこちらを用いる。
 */
export const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        // 説明文が無い場合は Radix の「説明が無い」警告を抑止する。
        // 説明文がある場合は Radix が自動で aria-describedby を紐付ける。
        {...(description ? {} : { 'aria-describedby': undefined })}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-xl focus:outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="text-lg font-bold text-gray-900">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-1 text-sm text-gray-500">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className="shrink-0 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);
