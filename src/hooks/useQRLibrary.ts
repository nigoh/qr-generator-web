import { useCallback } from 'react';
import { useQRStore } from '../store/qrStore';
import { useQRLibraryStore } from '../store/qrLibraryStore';
import * as qrDatabase from '../db/qrDatabase';
import { generateQRCode } from '../utils/qrGenerator';

/** サムネイルの一辺(px) */
const THUMBNAIL_SIZE = 256;

/** 生成済みのQR canvas から縮小したPNGサムネイル(Blob)を作る */
const createThumbnail = (source: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const thumb = document.createElement('canvas');
    thumb.width = THUMBNAIL_SIZE;
    thumb.height = THUMBNAIL_SIZE;
    const ctx = thumb.getContext('2d');
    if (!ctx) {
      reject(new Error('サムネイルの生成に失敗しました'));
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(source, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
    thumb.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('サムネイルの生成に失敗しました'));
    }, 'image/png');
  });

/**
 * 保存済みQRライブラリへのアクセスを提供するフック。
 * 一覧（items）はストアから購読し、保存・読み込みの手続きをここで組み立てる。
 */
export function useQRLibrary() {
  const items = useQRLibraryStore((s) => s.items);
  const isLoading = useQRLibraryStore((s) => s.isLoading);
  const refresh = useQRLibraryStore((s) => s.refresh);
  const remove = useQRLibraryStore((s) => s.remove);
  const rename = useQRLibraryStore((s) => s.rename);

  /** 現在の設定でQRを生成し、名前を付けてライブラリに保存する */
  const save = useCallback(
    async (name: string) => {
      const qr = useQRStore.getState();
      const settings = qr.getQRSettings();

      // ダウンロードと同じく、オフスクリーンcanvasに再生成してサムネイル化する
      const canvas = document.createElement('canvas');
      await generateQRCode(
        qr.url,
        { ...settings, logoFile: qr.logoFile, logoSettings: qr.logoSettings },
        canvas
      );
      const thumbnail = await createThumbnail(canvas);

      await qrDatabase.saveQR({
        name,
        settings,
        logoSettings: qr.logoSettings,
        logoBlob: qr.logoFile ?? null,
        logoName: qr.logoFile?.name ?? null,
        logoType: qr.logoFile?.type ?? null,
        thumbnail,
      });
      await refresh();
    },
    [refresh]
  );

  /** 保存済みQRを現在の設定に復元する（プレビューは自動で再生成される） */
  const load = useCallback(async (id: string) => {
    const saved = await qrDatabase.getQR(id);
    if (!saved) return;
    const logoFile = saved.logoBlob
      ? new File([saved.logoBlob], saved.logoName ?? 'logo', {
          type: saved.logoType ?? saved.logoBlob.type,
        })
      : null;
    useQRStore.getState().applySettings(saved.settings, saved.logoSettings, logoFile);
  }, []);

  return { items, isLoading, refresh, remove, rename, save, load };
}
