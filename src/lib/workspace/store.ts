"use client";

// Workspace data (blueprint sections 5.3 and 14). Signed in: one users/{uid} document holds profile,
// preferences and favorites (one read per session); history, saved items and Flows are subcollections.
// Signed out: favorites and history live in localStorage and are merged into the account on sign-in.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { create } from "zustand";
import { getFirebaseFirestore } from "@/lib/firebase";
import type { SpaceId } from "@/spaces";
import { toManifestId } from "./ids";

export interface Prefs {
  theme: "system" | "light" | "dark";
  units: "metric" | "imperial";
  defaultSpace: SpaceId | "";
  aiTone: "simple" | "standard" | "detailed";
}

export interface UserDoc {
  schemaVersion: 3;
  displayName: string;
  photoURL: string;
  createdAt: number;
  prefs: Prefs;
  favorites: string[];
  pinnedFlows: string[];
}

export interface HistoryEntry {
  id: string;
  toolId: string;
  at: number;
}

export interface SavedItem {
  id: string;
  kind: "ai" | "text" | "calc" | "design" | "diagram";
  title: string;
  toolId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_PREFS: Prefs = { theme: "system", units: "metric", defaultSpace: "", aiTone: "standard" };
export const MAX_FAVORITES = 100;
const MAX_HISTORY = 200;
const MAX_ITEM_BYTES = 500 * 1024;

const LOCAL_FAV = "mtb.favorites.v1";
const LOCAL_HISTORY = "mtb.history.v1";

const db = (): Firestore => {
  const f = getFirebaseFirestore();
  if (!f) throw new Error("Account storage isn't available right now.");
  return f;
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked or full: keep working in memory
  }
}

const unique = (ids: (string | null)[]) => [...new Set(ids.filter((x): x is string => !!x))];

/**
 * Creates or upgrades users/{uid}: copies favorites, preferences and saved items from the old
 * per-subcollection layout (schema 2), maps old tool ids to manifest ids, and merges this
 * browser's signed-out favorites. Old documents are left in place for the compatibility window.
 */
export async function ensureUserDoc(user: { uid: string; displayName: string | null; photoURL: string | null }): Promise<UserDoc> {
  const ref = doc(db(), "users", user.uid);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data() as Partial<UserDoc>) : null;
  const localFavorites = readLocal<string[]>(LOCAL_FAV, []);

  if (existing?.schemaVersion === 3) {
    const merged = unique([...(existing.favorites ?? []), ...localFavorites]).slice(0, MAX_FAVORITES);
    if (localFavorites.length && merged.length !== (existing.favorites ?? []).length) await setDoc(ref, { favorites: merged }, { merge: true });
    await flushLocalHistory(user.uid);
    writeLocal(LOCAL_FAV, []);
    return { ...(existing as UserDoc), prefs: { ...DEFAULT_PREFS, ...existing.prefs }, favorites: merged };
  }

  // One-time migration from the schema-2 layout.
  const [oldFavs, oldPrefs, oldSaved] = await Promise.all([
    getDocs(collection(db(), "users", user.uid, "favorites")).catch(() => null),
    getDoc(doc(db(), "users", user.uid, "preferences", "main")).catch(() => null),
    getDocs(collection(db(), "users", user.uid, "saved")).catch(() => null),
  ]);
  const favorites = unique([
    ...(oldFavs?.docs.map((d) => toManifestId(String(d.data().toolId ?? d.data().toolSlug ?? ""))) ?? []),
    ...localFavorites.map(toManifestId),
  ]).slice(0, MAX_FAVORITES);
  const theme = oldPrefs?.exists() ? (oldPrefs.data().theme as Prefs["theme"] | undefined) : undefined;
  const next: UserDoc = {
    schemaVersion: 3,
    displayName: (user.displayName ?? "").slice(0, 80),
    photoURL: (user.photoURL ?? "").slice(0, 500),
    createdAt: existing?.createdAt ?? Date.now(),
    prefs: { ...DEFAULT_PREFS, ...(theme && ["system", "light", "dark"].includes(theme) ? { theme } : {}) },
    favorites,
    pinnedFlows: [],
  };
  await setDoc(ref, next);

  if (oldSaved?.size) {
    const batch = writeBatch(db());
    for (const d of oldSaved.docs.slice(0, 200)) {
      const data = d.data();
      const content = typeof data.resultData === "string" ? data.resultData : JSON.stringify(data.resultData ?? "");
      if (new Blob([content]).size > MAX_ITEM_BYTES) continue;
      batch.set(doc(db(), "users", user.uid, "items", d.id), {
        kind: "text",
        title: String(data.title ?? "Saved result").slice(0, 200),
        toolId: toManifestId(String(data.toolId ?? data.toolSlug ?? "")) ?? "",
        content,
        createdAt: Number(data.createdAt) || Date.now(),
        updatedAt: Date.now(),
      });
    }
    await batch.commit();
  }
  await flushLocalHistory(user.uid);
  writeLocal(LOCAL_FAV, []);
  return next;
}

async function flushLocalHistory(uid: string) {
  const local = readLocal<HistoryEntry[]>(LOCAL_HISTORY, []);
  if (!local.length) return;
  const batch = writeBatch(db());
  for (const h of local.slice(0, 50)) batch.set(doc(collection(db(), "users", uid, "history")), { toolId: h.toolId, at: h.at });
  await batch.commit();
  writeLocal(LOCAL_HISTORY, []);
}

// ---------------------------------------------------------------------------
// Client state
// ---------------------------------------------------------------------------

interface WorkspaceState {
  uid: string | null;
  ready: boolean;
  error: string | null;
  doc: UserDoc | null;
  favorites: string[];
  load: (user: { uid: string; displayName: string | null; photoURL: string | null } | null) => Promise<void>;
  toggleFavorite: (id: string) => Promise<boolean>;
  setPrefs: (patch: Partial<Prefs>) => Promise<void>;
  recordVisit: (id: string) => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  uid: null,
  ready: false,
  error: null,
  doc: null,
  favorites: [],

  async load(user) {
    if (!user) {
      set({ uid: null, doc: null, ready: true, error: null, favorites: readLocal<string[]>(LOCAL_FAV, []) });
      return;
    }
    set({ uid: user.uid, ready: false, error: null });
    try {
      const d = await ensureUserDoc(user);
      if (get().uid === user.uid) set({ doc: d, favorites: d.favorites, ready: true });
    } catch (e) {
      if (get().uid === user.uid) set({ ready: true, error: e instanceof Error ? e.message : "Couldn't load your workspace." });
    }
  },

  async toggleFavorite(id) {
    const { uid, favorites } = get();
    const on = !favorites.includes(id);
    if (on && favorites.length >= MAX_FAVORITES) throw new Error(`You can keep up to ${MAX_FAVORITES} favorites.`);
    const next = on ? [id, ...favorites] : favorites.filter((f) => f !== id);
    set({ favorites: next });
    try {
      if (uid) await setDoc(doc(db(), "users", uid), { favorites: next }, { merge: true });
      else writeLocal(LOCAL_FAV, next);
    } catch (e) {
      set({ favorites });
      throw e;
    }
    return on;
  },

  async setPrefs(patch) {
    const { uid, doc: d } = get();
    if (!uid || !d) return;
    const prefs = { ...d.prefs, ...patch };
    await setDoc(doc(db(), "users", uid), { prefs }, { merge: true });
    set({ doc: { ...d, prefs } });
  },

  recordVisit(id) {
    const { uid } = get();
    const entry = { toolId: id, at: Date.now() };
    if (!uid) {
      const local = readLocal<HistoryEntry[]>(LOCAL_HISTORY, []).filter((h) => h.toolId !== id);
      writeLocal(LOCAL_HISTORY, [{ id: String(entry.at), ...entry }, ...local].slice(0, 50));
      return;
    }
    void addDoc(collection(db(), "users", uid, "history"), entry)
      .then(() => {
        // Keep the last 200 entries; trim occasionally to save writes.
        if (Math.random() < 0.05) void trimHistory(uid);
      })
      .catch(() => {});
  },
}));

async function trimHistory(uid: string) {
  const snap = await getDocs(query(collection(db(), "users", uid, "history"), orderBy("at", "desc"), limit(MAX_HISTORY + 100)));
  const extra = snap.docs.slice(MAX_HISTORY);
  if (!extra.length) return;
  const batch = writeBatch(db());
  extra.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ---------------------------------------------------------------------------
// Lists for the Workspace page
// ---------------------------------------------------------------------------

export async function listHistory(uid: string | null, max = 50): Promise<HistoryEntry[]> {
  if (!uid) return readLocal<HistoryEntry[]>(LOCAL_HISTORY, []);
  const snap = await getDocs(query(collection(db(), "users", uid, "history"), orderBy("at", "desc"), limit(max)));
  return snap.docs.flatMap((d) => {
    const data = d.data();
    // Schema-2 entries stored `toolId` as an old slug and `timestamp` instead of `at`.
    const toolId = toManifestId(String(data.toolId ?? data.toolSlug ?? ""));
    const at = Number(data.at ?? data.timestamp) || 0;
    return toolId ? [{ id: d.id, toolId, at }] : [];
  });
}

export async function clearAllHistory(uid: string | null): Promise<void> {
  if (!uid) {
    writeLocal(LOCAL_HISTORY, []);
    return;
  }
  for (;;) {
    const snap = await getDocs(query(collection(db(), "users", uid, "history"), limit(400)));
    if (snap.empty) return;
    const batch = writeBatch(db());
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export async function listItems(uid: string): Promise<SavedItem[]> {
  const snap = await getDocs(query(collection(db(), "users", uid, "items"), orderBy("updatedAt", "desc"), limit(100)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedItem, "id">) }));
}

export async function saveItem(uid: string, item: Pick<SavedItem, "kind" | "title" | "toolId" | "content">): Promise<string> {
  if (new Blob([item.content]).size > MAX_ITEM_BYTES) throw new Error("That result is too large to save to your account (500 KB max).");
  const now = Date.now();
  const ref = await addDoc(collection(db(), "users", uid, "items"), { ...item, title: item.title.slice(0, 200), createdAt: now, updatedAt: now });
  return ref.id;
}

export async function getItem(uid: string, id: string): Promise<SavedItem | null> {
  const snap = await getDoc(doc(db(), "users", uid, "items", id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<SavedItem, "id">) } : null;
}

/** Overwrites the content of an item saved earlier (editors save to the same item again). */
export async function updateItem(uid: string, id: string, patch: Pick<SavedItem, "title" | "content">): Promise<void> {
  if (new Blob([patch.content]).size > MAX_ITEM_BYTES) throw new Error("That result is too large to save to your account (500 KB max).");
  await setDoc(doc(db(), "users", uid, "items", id), { title: patch.title.slice(0, 200), content: patch.content, updatedAt: Date.now() }, { merge: true });
}

export async function deleteItem(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), "users", uid, "items", id));
}

// ---------------------------------------------------------------------------
// Data export and account deletion (blueprint section 15)
// ---------------------------------------------------------------------------

const SUBCOLLECTIONS = ["history", "items", "flows", "collections"];
const LEGACY_SUBCOLLECTIONS = ["favorites", "profile", "preferences", "saved", "usage", "credits", "ai_conversations"];

export async function exportAccountData(uid: string): Promise<Blob> {
  const user = await getDoc(doc(db(), "users", uid));
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString(), user: user.exists() ? user.data() : null };
  for (const name of SUBCOLLECTIONS) {
    const snap = await getDocs(collection(db(), "users", uid, name)).catch(() => null);
    out[name] = snap?.docs.map((d) => ({ id: d.id, ...d.data() })) ?? [];
  }
  return new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
}

/** Deletes every document the user owns. The caller then deletes the Firebase Auth user. */
export async function deleteAccountData(uid: string): Promise<void> {
  for (const name of [...SUBCOLLECTIONS, ...LEGACY_SUBCOLLECTIONS]) {
    for (;;) {
      const snap = await getDocs(query(collection(db(), "users", uid, name), limit(400))).catch(() => null);
      if (!snap || snap.empty) break;
      const batch = writeBatch(db());
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }
  await deleteDoc(doc(db(), "users", uid));
  writeLocal(LOCAL_FAV, []);
  writeLocal(LOCAL_HISTORY, []);
}
