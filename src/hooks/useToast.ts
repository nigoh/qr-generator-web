import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, variant: ToastVariant) => void;
  removeToast: (id: string) => void;
}

/** トーストが自動的に消えるまでの時間(ms) */
const AUTO_DISMISS_MS = 4000;

const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, variant) => {
    const id = createId();
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    if (typeof window !== 'undefined') {
      window.setTimeout(() => get().removeToast(id), AUTO_DISMISS_MS);
    }
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * 命令的にトーストを表示するためのヘルパー。
 * イベントハンドラ内（Reactフック外）からも呼び出せる。
 * 表示内容は Toaster の aria-live リージョンでスクリーンリーダーに通知される。
 */
export const toast = {
  success: (message: string) => useToastStore.getState().addToast(message, 'success'),
  error: (message: string) => useToastStore.getState().addToast(message, 'error'),
  info: (message: string) => useToastStore.getState().addToast(message, 'info'),
};
