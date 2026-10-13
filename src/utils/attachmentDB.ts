/**
 * 附件 IndexedDB 存储（零依赖）
 * =========================================================
 * 纯静态站点（COS/GitHub Pages）没有后端上传接口，
 * 验收附件（现场照片 / 盖章资料）的文件本体存 IndexedDB，
 * zustand(localStorage) 里只存元数据 + idb:// 引用键。
 *
 * - 容量：通常数百 MB 起，远大于 localStorage 的 ~5MB
 * - 范围：仅当前浏览器本机；清浏览器数据会丢，换设备不可见
 * - 降级：idb 不可用时 isAttachmentDbSupported() 返回 false，
 *   调用方改用压缩后的 base64 dataURL 存元数据
 * =========================================================
 */

const DB_NAME = 'wms-attachment-db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

/** 能力探测：IndexedDB 是否可用（隐私模式/老浏览器可能不可用） */
export async function isAttachmentDbSupported(): Promise<boolean> {
  const db = await openDb();
  return db !== null;
}

function txPromise<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then((db) => new Promise<T>((resolve, reject) => {
    if (!db) {
      reject(new Error('IndexedDB 不可用'));
      return;
    }
    const tx = db.transaction(STORE_NAME, mode);
    const req = run(tx.objectStore(STORE_NAME));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB 操作失败'));
  }));
}

/** 存入附件文件（key 即附件 id） */
export function putAttachmentBlob(id: string, blob: Blob): Promise<IDBValidKey> {
  return txPromise('readwrite', (store) => store.put(blob, id));
}

/** 读取附件文件 */
export function getAttachmentBlob(id: string): Promise<Blob | null> {
  return txPromise<Blob | null>('readonly', (store) => store.get(id) as IDBRequest<Blob | null>);
}

/** 删除单个附件文件 */
export function deleteAttachmentBlob(id: string): Promise<void> {
  return deleteAttachmentBlobs([id]);
}

/** 批量删除附件文件（删除验收单时级联清理） */
export async function deleteAttachmentBlobs(ids: string[]): Promise<void> {
  const db = await openDb();
  if (!db || ids.length === 0) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    ids.forEach((id) => {
      try { store.delete(id); } catch { /* 忽略单个失败 */ }
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
