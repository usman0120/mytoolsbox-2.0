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
  type Timestamp,
} from "firebase/firestore";
import type { ChatConversation, ChatMessage } from "./types";

const COLLECTION = "ai_conversations";

function getDb() {
  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firestore not available");
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

export async function fetchConversations(
  userId: string
): Promise<ChatConversation[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(100)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => deserializeConversation(d.data()));
}

export async function fetchConversation(
  conversationId: string
): Promise<ChatConversation | null> {
  const db = getDb();
  const ref = doc(db, COLLECTION, conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return deserializeConversation(snap.data());
}

export async function saveConversation(
  userId: string,
  conversation: ChatConversation
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, conversation.id);
  await setDoc(ref, {
    ...serializeConversation(conversation),
    userId,
    _serverUpdatedAt: serverTimestamp(),
  });
}

export async function updateConversation(
  conversationId: string,
  updates: Partial<ChatConversation>
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, conversationId);
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

  await updateDoc(ref, data);
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, conversationId);
  await deleteDoc(ref);
}

export async function deleteAllConversations(userId: string): Promise<void> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
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