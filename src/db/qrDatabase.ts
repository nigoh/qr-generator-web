import type { QRSettings, LogoSettings, SavedQR } from '../types/qr.types';

/**
 * 保存済みQRコードを扱う IndexedDB ラッパ。
 * 単一オブジェクトストアに対する最小限の CRUD を Promise で提供する。
 */

const DB_NAME = 'qr-generator-db';
const DB_VERSION = 1;
const STORE = 'savedQRs';

export interface SaveQRInput {
  /** 既存レコードを更新する場合に指定。未指定なら新規作成 */
  id?: string;
  name: string;
  settings: QRSettings;
  logoSettings: LogoSettings;
  logoBlob: Blob | null;
  logoName: string | null;
  logoType: string | null;
  thumbnail: Blob;
}

const isAvailable = (): boolean =>
  typeof indexedDB !== 'undefined' && indexedDB !== null;

const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (!isAvailable()) {
      reject(new Error('IndexedDB はこの環境では利用できません'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('by_createdAt', 'createdAt', { unique: false });
        store.createIndex('by_name', 'name', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB を開けませんでした'));
  });

/** 1つの読み取り/書き込みリクエストを Promise 化する小さなヘルパ */
const runRequest = <T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> =>
  openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      })
  );

/** 新規保存、または id 指定で既存レコードを上書き保存する */
export async function saveQR(input: SaveQRInput): Promise<SavedQR> {
  const existing = input.id ? await getQR(input.id) : undefined;
  const now = Date.now();
  const record: SavedQR = {
    id: input.id ?? createId(),
    name: input.name,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    settings: input.settings,
    logoSettings: input.logoSettings,
    logoBlob: input.logoBlob,
    logoName: input.logoName,
    logoType: input.logoType,
    thumbnail: input.thumbnail,
  };
  await runRequest('readwrite', (store) => store.put(record));
  return record;
}

/** 保存済みQRを新しい順（createdAt 降順）で取得する */
export async function listQRs(): Promise<SavedQR[]> {
  const items = await runRequest<SavedQR[]>('readonly', (store) => store.getAll());
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getQR(id: string): Promise<SavedQR | undefined> {
  return runRequest<SavedQR | undefined>('readonly', (store) => store.get(id));
}

export async function deleteQR(id: string): Promise<void> {
  await runRequest('readwrite', (store) => store.delete(id));
}

/** 名前を変更する。レコードが存在しない場合はエラー */
export async function renameQR(id: string, name: string): Promise<SavedQR> {
  const existing = await getQR(id);
  if (!existing) {
    throw new Error('指定されたQRコードが見つかりません');
  }
  const updated: SavedQR = { ...existing, name, updatedAt: Date.now() };
  await runRequest('readwrite', (store) => store.put(updated));
  return updated;
}
