// ---------------------------------------------------------------------------
// Chat Persistence Service – Firestore-backed conversation storage
// ---------------------------------------------------------------------------

import {
  getFirebaseFirestore,
} from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import type { ChatConversation, ChatMessage } from "./types";

const TOP_COLLECTION = "ai_conversations";

function getDb() {
  const db = getFirebaseFirestore();
  if (!db) return null;
  return db;
}

function serializeConversation(
  conv: ChatConversation
): Record<string, unknown> {
  return {
    id: conv.id,
    title: conv.title,
    messages: conv.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      provider: m.provider ?? null,
      model: m.model ?? null,
      usage: m.usage ?? null,
      timestamp: m.timestamp,
    })),
    provider: conv.provider,
    model: conv.model ?? null,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    isPinned: conv.isPinned ?? false,
    isArchived: conv.isArchived ?? false,
  };
}

function deserializeConversation(
  data: Record<string, unknown>
): ChatConversation {
  const messages = (data.messages as Array<Record<string, unknown>>)?.map(
    (m) =>
      ({
        id: m.id as string,
        role: m.role as ChatMessage["role"],
        content: m.content as string,
        provider: m.provider as string | undefined,
        model: m.model as string | undefined,
        usage: m.usage as ChatMessage["usage"],
        timestamp: m.timestamp as number,
      } satisfies ChatMessage)
  ) ?? [];

  return {
    id: data.id as string,
    title: data.title as string,
    messages,
    provider: data.provider as string,
    model: data.model as string | undefined,
    createdAt: data.createdAt as number,
    updatedAt: data.updatedAt as number,
    isPinned: data.isPinned as boolean,
    isArchived: data.isArchived as boolean,
  };
}

// ---------------------------------------------------------------------------
// CRUD Operations
// ---------------------------------------------------------------------------

/**
 * Fetch all conversations for a user.
 * Queries primary subcollection `users/{userId}/ai_conversations`,
 * and falls back to top-level `ai_conversations` collection if needed.
 */
export async function fetchConversations(
  userId: string
): Promise<ChatConversation[]> {
  const db = getDb();
  if (!db || !userId) return [];

  try {
    const subCol = collection(db, "users", userId, "ai_conversations");
    const qSub = query(subCol, orderBy("updatedAt", "desc"), limit(100));
    const snapshot = await getDocs(qSub);
    return snapshot.docs.map((d) => deserializeConversation(d.data()));
  } catch (err) {
    console.warn("Subcollection fetch note:", err);
    return [];
  }
}

/**
 * Real-time listener for user's conversations.
 * Updates instantly whenever a chat is modified, created, or deleted across tabs/devices.
 */
export function subscribeConversations(
  userId: string,
  callback: (conversations: ChatConversation[]) => void
): () => void {
  const db = getDb();
  if (!db || !userId) return () => {};

  try {
    const subCol = collection(db, "users", userId, "ai_conversations");
    const q = query(subCol, orderBy("updatedAt", "desc"), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const convs = snapshot.docs.map((d) => deserializeConversation(d.data()));
        callback(convs);
      },
      (error) => {
        console.warn("Conversations real-time subscription note:", error);
      }
    );
  } catch {
    return () => {};
  }
}

export async function fetchConversation(
  userId: string,
  conversationId: string
): Promise<ChatConversation | null> {
  const db = getDb();
  if (!db) return null;

  try {
    // Try subcollection
    const subRef = doc(db, "users", userId, "ai_conversations", conversationId);
    const snap = await getDoc(subRef);
    if (snap.exists()) return deserializeConversation(snap.data());
  } catch {}

  try {
    // Try top-level
    const topRef = doc(db, TOP_COLLECTION, conversationId);
    const snap = await getDoc(topRef);
    if (snap.exists()) return deserializeConversation(snap.data());
  } catch {}

  return null;
}

export async function saveConversation(
  userId: string,
  conversation: ChatConversation
): Promise<void> {
  const db = getDb();
  if (!db || !userId || !conversation?.id) return;

  const data = {
    ...serializeConversation(conversation),
    userId,
    _serverUpdatedAt: serverTimestamp(),
  };

  // 1. Write to users/{userId}/ai_conversations (user-scoped, matching firestore security rules)
  try {
    const subRef = doc(db, "users", userId, "ai_conversations", conversation.id);
    await setDoc(subRef, data);
  } catch (err) {
    console.warn("Firestore subcollection save note:", err);
  }

  // 2. Also write to top-level collection for backwards compatibility
  try {
    const topRef = doc(db, TOP_COLLECTION, conversation.id);
    await setDoc(topRef, data);
  } catch {
    // Best effort
  }
}

export async function updateConversation(
  userIdOrConvId: string,
  convIdOrUpdates: string | Partial<ChatConversation>,
  maybeUpdates?: Partial<ChatConversation>
): Promise<void> {
  const db = getDb();
  if (!db) return;

  let userId: string | null = null;
  let conversationId: string = "";
  let updates: Partial<ChatConversation> = {};

  if (typeof convIdOrUpdates === "string" && maybeUpdates) {
    userId = userIdOrConvId;
    conversationId = convIdOrUpdates;
    updates = maybeUpdates;
  } else if (typeof convIdOrUpdates === "object") {
    conversationId = userIdOrConvId;
    updates = convIdOrUpdates;
  }

  const data: Record<string, unknown> = {};
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.messages !== undefined) {
    data.messages = updates.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      provider: m.provider ?? null,
      model: m.model ?? null,
      usage: m.usage ?? null,
      timestamp: m.timestamp,
    }));
  }
  if (updates.provider !== undefined) data.provider = updates.provider;
  if (updates.model !== undefined) data.model = updates.model;
  if (updates.isPinned !== undefined) data.isPinned = updates.isPinned;
  if (updates.isArchived !== undefined) data.isArchived = updates.isArchived;
  data.updatedAt = updates.updatedAt ?? Date.now();
  data._serverUpdatedAt = serverTimestamp();

  if (userId) {
    try {
      const subRef = doc(db, "users", userId, "ai_conversations", conversationId);
      await updateDoc(subRef, data);
    } catch {}
  }

  try {
    const topRef = doc(db, TOP_COLLECTION, conversationId);
    await updateDoc(topRef, data);
  } catch {}
}

export async function deleteConversation(
  userIdOrConvId: string,
  maybeConvId?: string
): Promise<void> {
  const db = getDb();
  const conversationId = maybeConvId ?? userIdOrConvId;
  const userId = maybeConvId ? userIdOrConvId : null;

  if (db && userId) {
    try {
      await deleteDoc(doc(db, "users", userId, "ai_conversations", conversationId));
    } catch {}
  }

  if (db) {
    try {
      await deleteDoc(doc(db, TOP_COLLECTION, conversationId));
    } catch {}
  }

  // Also call server API to delete with session cookie
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          conversation: { id: conversationId },
        }),
      });
    } catch {}
  }
}

export async function deleteAllConversations(userId: string): Promise<void> {
  const db = getDb();
  if (db && userId) {
    try {
      const subCol = collection(db, "users", userId, "ai_conversations");
      const snapshot = await getDocs(subCol);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch {}

    try {
      const q = query(
        collection(db, TOP_COLLECTION),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch {}
  }

  // Also call server API to clear all
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear",
        }),
      });
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createNewConversation(
  provider: string = "auto",
  model: string = "auto"
): ChatConversation {
  return {
    id: generateConversationId(),
    title: "New Chat",
    messages: [],
    provider,
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPinned: false,
    isArchived: false,
  };
}