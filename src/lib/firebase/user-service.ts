import {
  doc, setDoc, getDoc, updateDoc, collection, addDoc,
  getDocs, deleteDoc, query, orderBy, limit, where,
  serverTimestamp, Timestamp, deleteField,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/config";
import type {
  UserPreferences, FavoriteItem, HistoryItem, UserProfile,
  UsageRecord, SavedItem, FeedbackItem, FeedbackStatus,
} from "@/types/user";
import { DEFAULT_PREFERENCES, DEFAULT_PROFILE } from "@/types/user";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function db(): Firestore | null {
  return getFirebaseFirestore();
}

function requireDb(): Firestore {
  const firestore = db();
  if (!firestore) throw new Error("Account storage is temporarily unavailable");
  return firestore;
}

function uid(): string | null {
  // We get the current user's UID from the auth context at call time.
  // This is passed in by the caller to keep this service pure.
  return null; // placeholder — actual UID comes from callers
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, "users", userId, "profile", "main"));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const firestore = requireDb();
  const ref = doc(firestore, "users", userId, "profile", "main");
  const existing = await getUserProfile(userId);
  if (existing) {
    // Firestore rejects undefined. Explicitly remove lifecycle timestamps when
    // cancelling deletion or reactivating instead of sending undefined values.
    const updates = Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, value === undefined ? deleteField() : value]));
    await updateDoc(ref, { ...updates, updatedAt: Date.now() });
  } else {
    await setDoc(ref, {
      ...DEFAULT_PROFILE,
      ...Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== undefined)),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const firestore = db();
  if (!firestore) return DEFAULT_PREFERENCES;
  const snap = await getDoc(doc(firestore, "users", userId, "preferences", "main"));
  if (!snap.exists()) return DEFAULT_PREFERENCES;
  return { ...DEFAULT_PREFERENCES, ...snap.data() } as UserPreferences;
}

export async function saveUserPreferences(
  userId: string,
  prefs: Partial<UserPreferences>,
): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  const ref = doc(firestore, "users", userId, "preferences", "main");
  const existing = await getUserPreferences(userId);
  await setDoc(ref, { ...existing, ...prefs });
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export async function getFavorites(userId: string): Promise<FavoriteItem[]> {
  const firestore = requireDb();
  const col = collection(firestore, "users", userId, "favorites");
  const q = query(col, orderBy("addedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FavoriteItem));
}

export async function addFavorite(userId: string, item: Omit<FavoriteItem, "id" | "addedAt">): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  // Check for duplicates
  const col = collection(firestore, "users", userId, "favorites");
  const existing = query(col, where("toolId", "==", item.toolId));
  const snap = await getDocs(existing);
  if (!snap.empty) return; // already favorited

  await addDoc(col, { ...item, addedAt: Date.now() });
}

export async function removeFavorite(userId: string, favoriteId: string): Promise<void> {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "users", userId, "favorites", favoriteId));
}

export async function isFavorited(userId: string, toolId: string): Promise<boolean> {
  const firestore = db();
  if (!firestore) return false;
  const col = collection(firestore, "users", userId, "favorites");
  const q = query(col, where("toolId", "==", toolId));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export async function getHistory(
  userId: string,
  maxResults = 50,
): Promise<HistoryItem[]> {
  const firestore = requireDb();
  const col = collection(firestore, "users", userId, "history");
  const q = query(col, orderBy("timestamp", "desc"), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HistoryItem));
}

export async function addHistoryEntry(
  userId: string,
  entry: Omit<HistoryItem, "id" | "timestamp">,
): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  const col = collection(firestore, "users", userId, "history");
  await addDoc(col, { ...entry, timestamp: Date.now() });
}

export async function clearHistory(userId: string): Promise<void> {
  const firestore = requireDb();
  const col = collection(firestore, "users", userId, "history");
  const snap = await getDocs(col);
  const batch = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(batch);
}

export async function removeHistoryEntry(userId: string, historyId: string): Promise<void> {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "users", userId, "history", historyId));
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

export async function getUsage(
  userId: string,
  period: string,
): Promise<UsageRecord | null> {
  const firestore = db();
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, "users", userId, "usage", period));
  if (!snap.exists()) return null;
  return snap.data() as UsageRecord;
}

export async function incrementUsage(
  userId: string,
  period: string,
  increment: Partial<Omit<UsageRecord, "period">>,
): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  const ref = doc(firestore, "users", userId, "usage", period);
  const existing = await getUsage(userId, period);
  if (existing) {
    await updateDoc(ref, {
      toolCount: existing.toolCount + (increment.toolCount ?? 0),
      aiCalls: existing.aiCalls + (increment.aiCalls ?? 0),
      fileUploadsMB: existing.fileUploadsMB + (increment.fileUploadsMB ?? 0),
    });
  } else {
    await setDoc(ref, {
      period,
      toolCount: increment.toolCount ?? 0,
      aiCalls: increment.aiCalls ?? 0,
      fileUploadsMB: increment.fileUploadsMB ?? 0,
    });
  }
}

// ---------------------------------------------------------------------------
// Saved Items
// ---------------------------------------------------------------------------

export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  const firestore = db();
  if (!firestore) return [];
  const col = collection(firestore, "users", userId, "saved");
  const q = query(col, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedItem));
}

export async function saveItem(
  userId: string,
  item: Omit<SavedItem, "id" | "createdAt">,
): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  const col = collection(firestore, "users", userId, "saved");
  await addDoc(col, { ...item, createdAt: Date.now() });
}

export async function removeSavedItem(userId: string, savedId: string): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  await deleteDoc(doc(firestore, "users", userId, "saved", savedId));
}

// ---------------------------------------------------------------------------
// Feedback / Contact form submissions
// ---------------------------------------------------------------------------

export async function submitFeedback(
  item: Omit<FeedbackItem, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<string> {
  const firestore = db();
  if (!firestore) throw new Error("Firestore not available");
  const col = collection(firestore, "feedback");
  const docRef = await addDoc(col, {
    ...item,
    status: "new",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return docRef.id;
}

export async function getFeedback(): Promise<FeedbackItem[]> {
  const firestore = db();
  if (!firestore) return [];
  const col = collection(firestore, "feedback");
  const q = query(col, orderBy("createdAt", "desc"), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FeedbackItem));
}

export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  const ref = doc(firestore, "feedback", feedbackId);
  await updateDoc(ref, { status, updatedAt: Date.now() });
}

export async function deleteFeedback(feedbackId: string): Promise<void> {
  const firestore = db();
  if (!firestore) return;
  await deleteDoc(doc(firestore, "feedback", feedbackId));
}

// ---------------------------------------------------------------------------
// Account Lifecycle (Disable & 30-Day Deletion Grace Period)
// ---------------------------------------------------------------------------

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Schedule account deletion with a 30-day recovery window.
 * The user can log in anytime within 30 days to cancel deletion.
 */
export async function scheduleAccountDeletion(userId: string): Promise<{ deletionScheduledAt: number }> {
  const now = Date.now();
  const scheduledTime = now + THIRTY_DAYS_MS;

  await saveUserProfile(userId, {
    status: "pending_deletion",
    deletionRequestedAt: now,
    deletionScheduledAt: scheduledTime,
  });

  return { deletionScheduledAt: scheduledTime };
}

/**
 * Cancel a pending deletion request and restore the account to active.
 */
export async function cancelAccountDeletion(userId: string): Promise<void> {
  await saveUserProfile(userId, {
    status: "active",
    deletionRequestedAt: undefined,
    deletionScheduledAt: undefined,
  });
}

/**
 * Temporarily disable an account. Data remains intact; re-activates on next login.
 */
export async function disableAccount(userId: string): Promise<void> {
  await saveUserProfile(userId, {
    status: "disabled",
    disabledAt: Date.now(),
  });
}

/**
 * Reactivate a disabled account.
 */
export async function reactivateAccount(userId: string): Promise<void> {
  await saveUserProfile(userId, {
    status: "active",
    disabledAt: undefined,
    deletionRequestedAt: undefined,
    deletionScheduledAt: undefined,
  });
}
