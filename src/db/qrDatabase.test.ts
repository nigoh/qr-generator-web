import { afterEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import * as qrDatabase from './qrDatabase';
import type { QRSettings, LogoSettings } from '../types/qr.types';

const baseSettings: QRSettings = {
  url: 'https://example.com',
  errorCorrection: 'H',
  fgColor: '#111827',
  bgColor: '#F9FAFB',
  dotStyle: 'square',
  boxSize: 10,
  border: 4,
};

const logoSettings: LogoSettings = { size: 20, padding: 4, radius: 100 };

const makeThumb = (text = 'thumb') => new Blob([text], { type: 'image/png' });

const makeInput = (overrides: Partial<Parameters<typeof qrDatabase.saveQR>[0]> = {}) => ({
  name: 'テストQR',
  settings: baseSettings,
  logoSettings,
  logoBlob: null,
  logoName: null,
  logoType: null,
  thumbnail: makeThumb(),
  ...overrides,
});

afterEach(() => {
  // 各テスト間で IndexedDB を完全にリセットする
  globalThis.indexedDB = new IDBFactory();
});

describe('qrDatabase', () => {
  it('saveQR で新規保存し getQR で取得できる', async () => {
    const saved = await qrDatabase.saveQR(makeInput());
    expect(saved.id).toBeTruthy();
    expect(saved.createdAt).toBeGreaterThan(0);

    const fetched = await qrDatabase.getQR(saved.id);
    expect(fetched?.name).toBe('テストQR');
    expect(fetched?.settings.url).toBe('https://example.com');
  });

  it('listQRs は createdAt の降順（新しい順）で返す', async () => {
    const first = await qrDatabase.saveQR(makeInput({ name: '古い' }));
    // createdAt は Date.now() ベースなので差をつける
    await new Promise((r) => setTimeout(r, 5));
    const second = await qrDatabase.saveQR(makeInput({ name: '新しい' }));

    const list = await qrDatabase.listQRs();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(second.id);
    expect(list[1].id).toBe(first.id);
  });

  it('deleteQR で削除できる', async () => {
    const saved = await qrDatabase.saveQR(makeInput());
    await qrDatabase.deleteQR(saved.id);
    expect(await qrDatabase.getQR(saved.id)).toBeUndefined();
    expect(await qrDatabase.listQRs()).toHaveLength(0);
  });

  it('renameQR は名前と updatedAt を更新し createdAt は保持する', async () => {
    const saved = await qrDatabase.saveQR(makeInput({ name: '旧名' }));
    await new Promise((r) => setTimeout(r, 5));
    const renamed = await qrDatabase.renameQR(saved.id, '新名');

    expect(renamed.name).toBe('新名');
    expect(renamed.createdAt).toBe(saved.createdAt);
    expect(renamed.updatedAt).toBeGreaterThanOrEqual(saved.updatedAt);
  });

  it('存在しない id の renameQR はエラーになる', async () => {
    await expect(qrDatabase.renameQR('missing', 'x')).rejects.toThrow();
  });

  it('id を指定した saveQR は既存レコードを上書きし createdAt を保持する', async () => {
    const saved = await qrDatabase.saveQR(makeInput({ name: '初回' }));
    const updated = await qrDatabase.saveQR(makeInput({ id: saved.id, name: '更新後' }));

    expect(updated.id).toBe(saved.id);
    expect(updated.createdAt).toBe(saved.createdAt);
    expect((await qrDatabase.listQRs())).toHaveLength(1);
  });

  it('ロゴのメタデータ（名前・型）と各フィールドが保存・取得できる', async () => {
    // 注: fake-indexeddb + jsdom では Blob のバイナリ忠実な復元ができない
    // （実ブラウザの IndexedDB は Blob をそのまま保存できる）。
    // ここでは File 復元に必要なメタデータと各フィールドの永続化を検証する。
    const logoBlob = new Blob(['logo-bytes'], { type: 'image/png' });
    const saved = await qrDatabase.saveQR(
      makeInput({ logoBlob, logoName: 'logo.png', logoType: 'image/png' })
    );

    const fetched = await qrDatabase.getQR(saved.id);
    expect(fetched).toBeDefined();
    expect(fetched?.logoName).toBe('logo.png');
    expect(fetched?.logoType).toBe('image/png');
    expect(fetched?.logoSettings).toEqual(logoSettings);
    expect(fetched?.settings).toEqual(baseSettings);
    expect(fetched?.logoBlob).not.toBeNull();
    expect(fetched?.thumbnail).toBeDefined();
  });
});
