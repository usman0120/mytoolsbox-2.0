"use client";

// Local file store behind the File Tray (blueprint section 5.2). Blobs live in IndexedDB in this
// browser only; nothing is synced or uploaded. Items expire after 24 hours unless pinned.

export interface TrayItem {
  id: string;
  name: string;
  mime: string;
  size: number;
  /** Manifest id of the tool that produced it, or "upload" for files the user added. */
  origin: string;
  kind: "input" | "result";
  createdAt: number;
  pinned: boolean;
}

interface Row extends TrayItem {
  blob: Blob;
}

const DB = "mytoolsbox-tray";
const STORE = "files";
const TTL = 24 * 60 * 60 * 1000;
/** Soft cap; the browser's own quota may be lower. */
export const TRAY_SOFT_CAP = 2 * 1024 ** 3;
const MAX_ITEM = 500 * 1024 ** 2;

let dbPromise: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Local storage is not available in this browser."));
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error ?? new Error("Couldn't open local storage."));
    };
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return db().then(
    (d) =>
      new Promise((resolve, reject) => {
        const t = d.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        t.oncomplete = () => resolve(req ? req.result : undefined);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error ?? new Error("Storage transaction aborted."));
      }),
  );
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
/** Subscribe to tray changes in this tab and other tabs. */
export function subscribeTray(fn: () => void): () => void {
  listeners.add(fn);
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(DB) : null;
  if (channel) channel.onmessage = fn;
  return () => {
    listeners.delete(fn);
    channel?.close();
  };
}
function broadcast() {
  emit();
  if (typeof BroadcastChannel !== "undefined") {
    const c = new BroadcastChannel(DB);
    c.postMessage("changed");
    c.close();
  }
}

const strip = ({ blob: _blob, ...item }: Row): TrayItem => item;

export async function listTray(): Promise<TrayItem[]> {
  const rows = ((await tx<Row[]>("readonly", (s) => s.getAll())) ?? []) as Row[];
  const now = Date.now();
  const expired = rows.filter((r) => !r.pinned && now - r.createdAt > TTL);
  if (expired.length) await tx("readwrite", (s) => void expired.forEach((r) => s.delete(r.id)));
  return rows.filter((r) => !expired.includes(r)).map(strip).sort((a, b) => b.createdAt - a.createdAt);
}

export async function addToTray(file: Blob & { name?: string }, meta: { origin: string; kind: TrayItem["kind"]; name?: string }): Promise<TrayItem | null> {
  if (file.size === 0 || file.size > MAX_ITEM) return null;
  const name = meta.name ?? file.name ?? "file";
  // Skip exact duplicates added within the last minute (e.g. the same file picked twice).
  const existing = await listTray();
  const dup = existing.find((i) => i.name === name && i.size === file.size && Date.now() - i.createdAt < 60_000);
  if (dup) return dup;
  const row: Row = {
    id: crypto.randomUUID(),
    name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    origin: meta.origin,
    kind: meta.kind,
    createdAt: Date.now(),
    pinned: false,
    blob: file,
  };
  await tx("readwrite", (s) => s.put(row));
  broadcast();
  return strip(row);
}

export async function getTrayFile(id: string): Promise<File | null> {
  const row = (await tx<Row>("readonly", (s) => s.get(id))) as Row | undefined;
  return row ? new File([row.blob], row.name, { type: row.mime, lastModified: row.createdAt }) : null;
}

export async function removeFromTray(ids: string[]): Promise<void> {
  await tx("readwrite", (s) => void ids.forEach((id) => s.delete(id)));
  broadcast();
}

export async function setPinned(ids: string[], pinned: boolean): Promise<void> {
  await tx("readwrite", (s) => {
    for (const id of ids) {
      const req = s.get(id);
      req.onsuccess = () => req.result && s.put({ ...req.result, pinned });
    }
  });
  broadcast();
}

export async function clearTray(keepPinned = true): Promise<void> {
  const items = await listTray();
  await removeFromTray(items.filter((i) => !keepPinned || !i.pinned).map((i) => i.id));
}

export function trayUsage(items: TrayItem[]): number {
  return items.reduce((sum, i) => sum + i.size, 0);
}
