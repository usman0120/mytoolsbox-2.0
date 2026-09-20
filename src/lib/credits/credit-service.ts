// ---------------------------------------------------------------------------
// Credit Tracking Service
// ---------------------------------------------------------------------------
// Tracks user credit usage in Firestore. Credits reset monthly based on
// the user's subscription tier.
// ---------------------------------------------------------------------------

import { getFirebaseFirestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import type { SubscriptionTier } from "@/lib/ai/credits";
import { SUBSCRIPTION_PLANS, getCreditCost, type CreditOperation } from "@/lib/ai/credits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserCreditState {
  userId: string;
  tier: SubscriptionTier;
  totalCredits: number;       // Monthly allocation
  usedCredits: number;        // Used this period
  periodStart: string;        // ISO date of period start (e.g. "2026-09-01")
  periodEnd: string;          // ISO date of period end (e.g. "2026-10-01")
  lastUpdated: number;        // Timestamp
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function getCreditDocPath(userId: string): string {
  return `users/${userId}/credits/current`;
}

// ---------------------------------------------------------------------------
// Credit Operations
// ---------------------------------------------------------------------------

/**
 * Get the current credit state for a user.
 * If no state exists, creates one based on their subscription tier.
 */
export async function getUserCredits(userId: string): Promise<UserCreditState> {
  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, getCreditDocPath(userId));
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as UserCreditState;

    // Check if we need to reset for a new period
    const { start } = getCurrentPeriod();
    if (data.periodStart !== start) {
      // New period — reset credits
      const plan = SUBSCRIPTION_PLANS[data.tier];
      const newState: UserCreditState = {
        ...data,
        totalCredits: plan.monthlyCredits,
        usedCredits: 0,
        periodStart: start,
        periodEnd: getCurrentPeriod().end,
        lastUpdated: Date.now(),
      };
      await setDoc(docRef, newState);
      return newState;
    }

    return data;
  }

  // No credit state yet — create default (free_account if signed in)
  const plan = SUBSCRIPTION_PLANS["free_account"];
  const { start, end } = getCurrentPeriod();
  const newState: UserCreditState = {
    userId,
    tier: "free_account",
    totalCredits: plan.monthlyCredits,
    usedCredits: 0,
    periodStart: start,
    periodEnd: end,
    lastUpdated: Date.now(),
  };
  await setDoc(docRef, newState);
  return newState;
}

/**
 * Check if a user has enough credits for an operation.
 */
export async function checkCredits(
  userId: string,
  operation: CreditOperation
): Promise<{ allowed: boolean; remaining: number; required: number }> {
  const state = await getUserCredits(userId);
  const required = getCreditCost(operation);
  const remaining = state.totalCredits - state.usedCredits;

  return {
    allowed: remaining >= required,
    remaining,
    required,
  };
}

/**
 * Deduct credits for an operation. Returns the new remaining balance.
 * Throws if insufficient credits.
 */
export async function deductCredits(
  userId: string,
  operation: CreditOperation
): Promise<{ remaining: number; used: number }> {
  const state = await getUserCredits(userId);
  const cost = getCreditCost(operation);
  const remaining = state.totalCredits - state.usedCredits;

  if (remaining < cost) {
    throw new Error(
      `Insufficient credits: need ${cost}, have ${remaining}. ` +
      `Upgrade to Pro for more credits.`
    );
  }

  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, getCreditDocPath(userId));

  await updateDoc(docRef, {
    usedCredits: increment(cost),
    lastUpdated: Date.now(),
  });

  return {
    remaining: remaining - cost,
    used: state.usedCredits + cost,
  };
}

/**
 * Get the user's subscription tier.
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const state = await getUserCredits(userId);
  return state.tier;
}

/**
 * Upgrade a user's subscription tier.
 */
export async function upgradeUserTier(
  userId: string,
  newTier: SubscriptionTier
): Promise<UserCreditState> {
  const db = getFirebaseFirestore();
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, getCreditDocPath(userId));
  const plan = SUBSCRIPTION_PLANS[newTier];
  const { start, end } = getCurrentPeriod();

  const newState: UserCreditState = {
    userId,
    tier: newTier,
    totalCredits: plan.monthlyCredits,
    usedCredits: 0,
    periodStart: start,
    periodEnd: end,
    lastUpdated: Date.now(),
  };

  await setDoc(docRef, newState);
  return newState;
}

/**
 * Get remaining credits for a user.
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const state = await getUserCredits(userId);
  return Math.max(0, state.totalCredits - state.usedCredits);
}