// Tiny IndexedDB key-value store for editor autosave (projects can hold images, too big for localStorage).

const DB = "mytoolsbox-editors";
const STORE = "kv";
let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function kvGet<T>(key: string): Promise<T | undefined> {
  return run<T | undefined>("readonly", (s) => s.get(key)).catch(() => undefined);
}

export function kvSet(key: string, value: unknown): Promise<void> {
  return run<void>("readwrite", (s) => s.put(value, key)).catch(() => undefined);
}

export function kvDelete(key: string): Promise<void> {
  return run<void>("readwrite", (s) => s.delete(key)).catch(() => undefined);
}
