import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { useToastStore, type ToastItem } from '../../hooks/useToast';

const VARIANT_STYLES: Record<ToastItem['variant'], { container: string; icon: React.ReactNode }> = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />,
  },
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const variant = VARIANT_STYLES[toast.variant];
  return (
    <div
      className={clsx(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-md',
        variant.container
      )}
    >
      {variant.icon}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-0.5 opacity-70 transition-colors hover:bg-black/5 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
        aria-label="通知を閉じる"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

/**
 * アクセシブルなトースト通知の表示領域。
 * 成功/情報は role="status"(polite)、エラーは role="alert"(assertive) の
 * ライブリージョンで読み上げられる。App に一度だけマウントする。
 */
export const Toaster: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  const errors = toasts.filter((t) => t.variant === 'error');
  const others = toasts.filter((t) => t.variant !== 'error');

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      <div role="alert" aria-live="assertive" className="flex w-full flex-col items-center gap-2">
        {errors.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
      <div role="status" aria-live="polite" className="flex w-full flex-col items-center gap-2">
        {others.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
};
