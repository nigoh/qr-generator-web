import { create } from 'zustand';
import type { SavedQR } from '../types/qr.types';
import * as qrDatabase from '../db/qrDatabase';

interface QRLibraryState {
  items: SavedQR[];
  isLoading: boolean;
  /** IndexedDB から一覧を再読み込みする */
  refresh: () => Promise<void>;
  /** 1件削除して一覧を更新する */
  remove: (id: string) => Promise<void>;
  /** 名前を変更して一覧を更新する */
  rename: (id: string, name: string) => Promise<void>;
}

/**
 * 保存済みQRコード一覧のリアクティブな状態。
 * 保存（save）と読み込み（load）の手続きは useQRLibrary フックが担う。
 */
export const useQRLibraryStore = create<QRLibraryState>((set, get) => ({
  items: [],
  isLoading: false,
  refresh: async () => {
    set({ isLoading: true });
    try {
      const items = await qrDatabase.listQRs();
      set({ items, isLoading: false });
    } catch (error) {
      console.warn('保存済みQRコードの読み込みに失敗しました:', error);
      set({ isLoading: false });
    }
  },
  remove: async (id) => {
    await qrDatabase.deleteQR(id);
    await get().refresh();
  },
  rename: async (id, name) => {
    await qrDatabase.renameQR(id, name);
    await get().refresh();
  },
}));
