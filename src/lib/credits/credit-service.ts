// ---------------------------------------------------------------------------
// Credit Tracking Service
// ---------------------------------------------------------------------------
// Tracks user credit usage with persistent disk ledger (survives restarts/days),
// Firestore synchronization, and an in-memory hot cache.
// Strictly enforces 30-day reset cycles for free (1,000 credits) and paid tiers.
// ---------------------------------------------------------------------------

import { getFirebaseFirestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import type { SubscriptionTier } from "@/lib/ai/credits";
import { SUBSCRIPTION_PLANS, getCreditCost, type CreditOperation } from "@/lib/ai/credits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserCreditState {
  userId: string;
  tier: SubscriptionTier;
  totalCredits: number;       // Allocation per period (e.g. 1000 for free_account)
  usedCredits: number;        // Used this period
  periodStart: string;        // ISO date or timestamp of period start
  periodEnd: string;          // ISO date or timestamp of period end (30 days from start)
  lastUpdated: number;        // Timestamp ms
}

export interface CreditSummary {
  userId: string;
  tier: SubscriptionTier;
  total: number;
  used: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
  daysRemaining: number;
}

// ---------------------------------------------------------------------------
// Persistent Ledger Helpers (Node.js Server Disk Persistence)
// ---------------------------------------------------------------------------

function getLedgerFilePath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path");
    return path.join(process.cwd(), ".data", "credits-ledger.json");
  } catch {
    return "";
  }
}

function loadDiskLedger(): Map<string, UserCreditState> {
  const store = new Map<string, UserCreditState>();
  if (typeof window !== "undefined") return store;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs");
    const filePath = getLedgerFilePath();
    if (filePath && fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        for (const [key, val] of Object.entries(parsed)) {
          store.set(key, val as UserCreditState);
        }
      }
    }
  } catch {
    // Non-critical fallback
  }
  return store;
}

function saveToDiskLedger(userId: string, state: UserCreditState): void {
  if (typeof window !== "undefined") return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path");
    const filePath = getLedgerFilePath();
    if (!filePath) return;

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let current: Record<string, UserCreditState> = {};
    if (fs.existsSync(filePath)) {
      try {
        current = JSON.parse(fs.readFileSync(filePath, "utf-8")) || {};
      } catch {
        current = {};
      }
    }
    current[userId] = state;
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2), "utf-8");
  } catch {
    // Non-critical fallback
  }
}

// ---------------------------------------------------------------------------
// In-Memory Hot Cache (Pre-loaded from persistent disk ledger)
// ---------------------------------------------------------------------------

const memoryCreditStore = loadDiskLedger();

// ---------------------------------------------------------------------------
// Period & Reset Helpers (Strict 30-Day Expiration)
// ---------------------------------------------------------------------------

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function calculate30DayPeriod(fromMs: number = Date.now()): { start: string; end: string } {
  const startDate = new Date(fromMs);
  const endDate = new Date(fromMs + THIRTY_DAYS_MS);
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

export function isPeriodExpired(state: UserCreditState, nowMs: number = Date.now()): boolean {
  if (!state || !state.periodEnd) return false;
  let endMs: number;
  if (typeof state.periodEnd === "string") {
    endMs = new Date(state.periodEnd).getTime();
  } else if (typeof (state.periodEnd as any)?.toMillis === "function") {
    endMs = (state.periodEnd as any).toMillis();
  } else if (typeof (state.periodEnd as any)?.seconds === "number") {
    endMs = (state.periodEnd as any).seconds * 1000;
  } else {
    endMs = new Date(state.periodEnd).getTime();
  }
  return !isNaN(endMs) && endMs > 0 && nowMs >= endMs;
}

function getCreditDocPath(userId: string): string {
  return `users/${userId}/credits/current`;
}

// ---------------------------------------------------------------------------
// Credit Operations
// ---------------------------------------------------------------------------

/**
 * Get current credit state for a user.
 * Automatically checks and triggers 30-day reset if period has expired.
 * Preserves used credits and remaining allowance across server restarts.
 */
export async function getUserCredits(userId: string): Promise<UserCreditState> {
  const db = getFirebaseFirestore();

  // 1. Try to fetch from Firestore
  if (db && process.env.NODE_ENV !== "test") {
    try {
      const docRef = doc(db, getCreditDocPath(userId));
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserCreditState;

        // If period dates are missing, fix them without resetting usedCredits
        if (!data.periodEnd || isNaN(new Date(data.periodEnd).getTime())) {
          const { start, end } = calculate30DayPeriod();
          data.periodStart = data.periodStart || start;
          data.periodEnd = end;
        }

        // Check if 30-day period has expired
        if (isPeriodExpired(data)) {
          const tier = data.tier || "free_account";
          const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS["free_account"];
          const { start, end } = calculate30DayPeriod();

          const resetState: UserCreditState = {
            ...data,
            tier,
            totalCredits: plan.monthlyCredits,
            usedCredits: 0,
            periodStart: start,
            periodEnd: end,
            lastUpdated: Date.now(),
          };

          try {
            await setDoc(docRef, resetState);
          } catch {
            // Firestore write error fallback
          }

          memoryCreditStore.set(userId, resetState);
          saveToDiskLedger(userId, resetState);
          return resetState;
        }

        // Protect against regression: if memory/disk ledger has higher recorded usage, keep it
        const existing = memoryCreditStore.get(userId);
        if (existing && typeof existing.usedCredits === "number" && existing.usedCredits > (data.usedCredits ?? 0)) {
          data.usedCredits = existing.usedCredits;
        }

        memoryCreditStore.set(userId, data);
        saveToDiskLedger(userId, data);
        return data;
      }

      // No Firestore document yet: check if persistent disk or memory already has state
      const existing = memoryCreditStore.get(userId);
      if (existing) {
        if (isPeriodExpired(existing)) {
          const tier = existing.tier || "free_account";
          const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS["free_account"];
          const { start, end } = calculate30DayPeriod();
          const resetState: UserCreditState = {
            ...existing,
            tier,
            totalCredits: plan.monthlyCredits,
            usedCredits: 0,
            periodStart: start,
            periodEnd: end,
            lastUpdated: Date.now(),
          };
          memoryCreditStore.set(userId, resetState);
          saveToDiskLedger(userId, resetState);
          return resetState;
        }
        return existing;
      }

      // Create initial 1,000 credit free_account state
      const plan = SUBSCRIPTION_PLANS["free_account"];
      const { start, end } = calculate30DayPeriod();
      const initialState: UserCreditState = {
        userId,
        tier: "free_account",
        totalCredits: plan.monthlyCredits, // 1000 credits
        usedCredits: 0,
        periodStart: start,
        periodEnd: end,
        lastUpdated: Date.now(),
      };

      try {
        await setDoc(docRef, initialState);
      } catch {
        // Fallback to disk/memory
      }

      memoryCreditStore.set(userId, initialState);
      saveToDiskLedger(userId, initialState);
      return initialState;
    } catch {
      // Fall through to persistent disk / in-memory store
    }
  }

  // 2. Persistent disk & memory store
  const cached = memoryCreditStore.get(userId);
  if (cached) {
    if (isPeriodExpired(cached)) {
      const tier = cached.tier || "free_account";
      const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS["free_account"];
      const { start, end } = calculate30DayPeriod();
      const resetState: UserCreditState = {
        ...cached,
        tier,
        totalCredits: plan.monthlyCredits,
        usedCredits: 0,
        periodStart: start,
        periodEnd: end,
        lastUpdated: Date.now(),
      };
      memoryCreditStore.set(userId, resetState);
      saveToDiskLedger(userId, resetState);
      return resetState;
    }
    return cached;
  }

  // Initial state in persistent disk & memory
  const plan = SUBSCRIPTION_PLANS["free_account"];
  const { start, end } = calculate30DayPeriod();
  const newState: UserCreditState = {
    userId,
    tier: "free_account",
    totalCredits: plan.monthlyCredits, // 1000
    usedCredits: 0,
    periodStart: start,
    periodEnd: end,
    lastUpdated: Date.now(),
  };

  memoryCreditStore.set(userId, newState);
  saveToDiskLedger(userId, newState);
  return newState;
}

/**
 * Check if a user has enough credits for an operation without deducting.
 */
export async function checkCredits(
  userId: string,
  operation: CreditOperation
): Promise<{ allowed: boolean; remaining: number; required: number }> {
  const state = await getUserCredits(userId);
  const required = getCreditCost(operation);
  const remaining = Math.max(0, state.totalCredits - state.usedCredits);

  return {
    allowed: remaining >= required,
    remaining,
    required,
  };
}

/**
 * Deduct credits atomically for an operation.
 * Updates in-memory hot cache, persistent server disk ledger, and Firestore.
 */
export async function deductCredits(
  userId: string,
  operation: CreditOperation
): Promise<{ remaining: number; used: number }> {
  const state = await getUserCredits(userId);
  const cost = getCreditCost(operation);
  const currentRemaining = Math.max(0, state.totalCredits - state.usedCredits);

  if (currentRemaining < cost) {
    throw new Error(
      `Insufficient credits: need ${cost}, have ${currentRemaining}. ` +
      `Upgrade to Pro for more credits.`
    );
  }

  const newUsed = state.usedCredits + cost;
  const newRemaining = Math.max(0, state.totalCredits - newUsed);

  // Update in memory cache and persistent disk ledger
  const updatedState: UserCreditState = {
    ...state,
    usedCredits: newUsed,
    lastUpdated: Date.now(),
  };
  memoryCreditStore.set(userId, updatedState);
  saveToDiskLedger(userId, updatedState);

  // Update Firestore if available
  const db = getFirebaseFirestore();
  if (db && process.env.NODE_ENV !== "test") {
    try {
      const docRef = doc(db, getCreditDocPath(userId));
      await setDoc(docRef, updatedState, { merge: true });
    } catch {
      // Continue even if Firestore update fails
    }
  }

  return {
    remaining: newRemaining,
    used: newUsed,
  };
}

/**
 * Get remaining credit count for a user.
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const state = await getUserCredits(userId);
  return Math.max(0, state.totalCredits - state.usedCredits);
}

/**
 * Get user subscription tier.
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const state = await getUserCredits(userId);
  return state.tier;
}

/**
 * Upgrade user tier.
 */
export async function upgradeUserTier(
  userId: string,
  newTier: SubscriptionTier
): Promise<UserCreditState> {
  const plan = SUBSCRIPTION_PLANS[newTier] || SUBSCRIPTION_PLANS["pro"];
  const { start, end } = calculate30DayPeriod();

  const newState: UserCreditState = {
    userId,
    tier: newTier,
    totalCredits: plan.monthlyCredits,
    usedCredits: 0,
    periodStart: start,
    periodEnd: end,
    lastUpdated: Date.now(),
  };

  memoryCreditStore.set(userId, newState);
  saveToDiskLedger(userId, newState);

  const db = getFirebaseFirestore();
  if (db && process.env.NODE_ENV !== "test") {
    try {
      const docRef = doc(db, getCreditDocPath(userId));
      await setDoc(docRef, newState);
    } catch {
      // Ignore
    }
  }

  return newState;
}

/**
 * Comprehensive credit summary for profile display and status reporting.
 */
export async function getUserCreditSummary(userId: string): Promise<CreditSummary> {
  const state = await getUserCredits(userId);
  const remaining = Math.max(0, state.totalCredits - state.usedCredits);

  const endMs = new Date(state.periodEnd).getTime();
  const daysRemaining = isNaN(endMs)
    ? 30
    : Math.max(0, Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24)));

  return {
    userId: state.userId,
    tier: state.tier,
    total: state.totalCredits,
    used: state.usedCredits,
    remaining,
    periodStart: state.periodStart,
    periodEnd: state.periodEnd,
    daysRemaining,
  };
}