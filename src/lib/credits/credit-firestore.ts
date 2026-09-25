// ---------------------------------------------------------------------------
// Client-Side Firestore Credit Synchronization Service
// ---------------------------------------------------------------------------
// Synchronizes credit balances in real time via Firestore across domains
// (e.g. localhost:3000 <-> mytoolsbox.me) and across active browser sessions.
// ---------------------------------------------------------------------------

import { getFirebaseFirestore } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";
import type { UserCreditState, CreditSummary } from "./credit-service";
import { calculate30DayPeriod, isPeriodExpired } from "./credit-service";

function getDocPath(userId: string): string {
  return `users/${userId}/credits/current`;
}

/**
 * Real-time listener for user credits in Firestore.
 * Automatically synchronizes credits across localhost and production.
 */
export function subscribeUserCredits(
  userId: string,
  callback: (summary: CreditSummary) => void
): () => void {
  if (typeof window === "undefined" || !userId) return () => {};

  const db = getFirebaseFirestore();
  if (!db) return () => {};

  try {
    const docRef = doc(db, getDocPath(userId));

    return onSnapshot(
      docRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserCreditState;

          // If period dates are missing, fix them without resetting usedCredits
          let periodStart = data.periodStart;
          let periodEnd = data.periodEnd;
          if (!periodEnd) {
            const p = calculate30DayPeriod();
            periodStart = periodStart || p.start;
            periodEnd = p.end;
            data.periodStart = periodStart;
            data.periodEnd = periodEnd;
          }

          // Check if 30-day reset is due
          if (isPeriodExpired(data)) {
            const { start, end } = calculate30DayPeriod();
            const resetState: UserCreditState = {
              ...data,
              totalCredits: data.totalCredits || 1000,
              usedCredits: 0,
              periodStart: start,
              periodEnd: end,
              lastUpdated: Date.now(),
            };

            try {
              await setDoc(docRef, resetState);
            } catch (e) {
              console.warn("Credit reset save note:", e);
            }

            callback({
              userId,
              tier: resetState.tier,
              total: resetState.totalCredits,
              used: 0,
              remaining: resetState.totalCredits,
              periodStart: start,
              periodEnd: end,
              daysRemaining: 30,
            });
            return;
          }

          const total = data.totalCredits ?? 1000;
          let used = data.usedCredits ?? 0;

          // Prevent regression: if local storage already recorded higher usage from a recent operation, preserve it
          if (typeof window !== "undefined") {
            try {
              const cached = localStorage.getItem(`mytoolsbox_credits_${userId}`);
              if (cached) {
                const parsed = JSON.parse(cached);
                if (typeof parsed.used === "number" && parsed.used > used) {
                  used = parsed.used;
                  // Asynchronously sync the higher usage back to Firestore
                  updateDoc(docRef, { usedCredits: used, lastUpdated: Date.now() }).catch(() => {});
                }
              }
            } catch {}
          }

          const remaining = Math.max(0, total - used);
          let endMs = new Date(periodEnd).getTime();
          if (isNaN(endMs)) endMs = Date.now() + 30 * 24 * 60 * 60 * 1000;
          const daysRemaining = Math.max(0, Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24)));

          // Always update localStorage with the real values
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                `mytoolsbox_credits_${userId}`,
                JSON.stringify({
                  remaining,
                  total,
                  used,
                  tier: data.tier || "free_account",
                  periodEnd,
                  daysRemaining,
                  timestamp: Date.now(),
                })
              );
            } catch {}
          }

          callback({
            userId,
            tier: data.tier || "free_account",
            total,
            used,
            remaining,
            periodStart,
            periodEnd,
            daysRemaining,
          });
        } else {
          // Document does not exist in Firestore yet.
          // Check if client has local cache from previous sessions to preserve existing usage.
          let initialUsed = 0;
          try {
            const cached = localStorage.getItem(`mytoolsbox_credits_${userId}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (typeof parsed.used === "number" && parsed.used > 0) {
                initialUsed = parsed.used;
              }
            }
          } catch {}

          const { start, end } = calculate30DayPeriod();
          const initialState: UserCreditState = {
            userId,
            tier: "free_account",
            totalCredits: 1000,
            usedCredits: initialUsed,
            periodStart: start,
            periodEnd: end,
            lastUpdated: Date.now(),
          };

          try {
            await setDoc(docRef, initialState);
          } catch (e) {
            console.warn("Initial credits doc write note:", e);
          }

          callback({
            userId,
            tier: "free_account",
            total: 1000,
            used: initialUsed,
            remaining: Math.max(0, 1000 - initialUsed),
            periodStart: start,
            periodEnd: end,
            daysRemaining: 30,
          });
        }
      },
      (error) => {
        console.warn("Firestore credits subscription note:", error);
      }
    );
  } catch (err) {
    console.warn("Credits subscribe error:", err);
    return () => {};
  }
}

/**
 * Deduct credits directly on client Firestore document when completing AI operations.
 */
export async function deductCreditsInFirestore(
  userId: string,
  cost: number
): Promise<void> {
  if (typeof window === "undefined" || !userId || cost <= 0) return;

  const db = getFirebaseFirestore();
  if (!db) return;

  try {
    const docRef = doc(db, getDocPath(userId));
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await updateDoc(docRef, {
        usedCredits: increment(cost),
        lastUpdated: Date.now(),
      });
    } else {
      const { start, end } = calculate30DayPeriod();
      await setDoc(docRef, {
        userId,
        tier: "free_account",
        totalCredits: 1000,
        usedCredits: cost,
        periodStart: start,
        periodEnd: end,
        lastUpdated: Date.now(),
      });
    }
  } catch (err) {
    console.warn("Firestore client deduct credits note:", err);
  }
}

/**
 * Update credit state in Firestore directly.
 */
export async function syncCreditsToFirestore(
  userId: string,
  creditsRemaining: number,
  creditsUsed?: number
): Promise<void> {
  if (typeof window === "undefined" || !userId) return;

  const db = getFirebaseFirestore();
  if (!db) return;

  try {
    const docRef = doc(db, getDocPath(userId));
    const snap = await getDoc(docRef);
    let finalTotal = 1000;
    let finalUsed = 0;
    let periodStart: string;
    let periodEnd: string;

    if (snap.exists()) {
      const data = snap.data() as UserCreditState;
      finalTotal = data.totalCredits || 1000;
      finalUsed = typeof creditsUsed === "number" ? creditsUsed : Math.max(data.usedCredits ?? 0, finalTotal - creditsRemaining);
      periodStart = data.periodStart;
      periodEnd = data.periodEnd;
      if (!periodEnd) {
        const p = calculate30DayPeriod();
        periodStart = p.start;
        periodEnd = p.end;
      }

      await updateDoc(docRef, {
        usedCredits: finalUsed,
        totalCredits: finalTotal,
        periodStart,
        periodEnd,
        lastUpdated: Date.now(),
      });
    } else {
      const { start, end } = calculate30DayPeriod();
      periodStart = start;
      periodEnd = end;
      finalUsed = typeof creditsUsed === "number" ? creditsUsed : Math.max(0, 1000 - creditsRemaining);
      await setDoc(docRef, {
        userId,
        tier: "free_account",
        totalCredits: 1000,
        usedCredits: finalUsed,
        periodStart: start,
        periodEnd: end,
        lastUpdated: Date.now(),
      });
    }

    const finalRemaining = Math.max(0, finalTotal - finalUsed);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `mytoolsbox_credits_${userId}`,
          JSON.stringify({
            remaining: finalRemaining,
            total: finalTotal,
            used: finalUsed,
            tier: "free_account",
            periodStart,
            periodEnd,
            timestamp: Date.now(),
          })
        );
      } catch {}

      window.dispatchEvent(
        new CustomEvent("credits-updated", {
          detail: { remaining: finalRemaining, used: finalUsed },
        })
      );
    }
  } catch (err) {
    console.warn("Firestore sync credits note:", err);
  }
}
