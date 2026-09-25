"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { subscribeUserCredits, syncCreditsToFirestore } from "./credit-firestore";

export interface CreditInfo {
  remaining: number;
  total: number;
  used: number;
  tier: string;
  daysRemaining: number;
  periodEnd?: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCredits(): CreditInfo {
  const { user, isAnonymous, loading: authLoading } = useAuth();
  const [remaining, setRemaining] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        if (user?.uid) {
          const cached = localStorage.getItem(`mytoolsbox_credits_${user.uid}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (typeof parsed.remaining === "number") return parsed.remaining;
          }
        }
        // Fallback: check any recent user credit cache in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("mytoolsbox_credits_")) {
            const val = localStorage.getItem(key);
            if (val) {
              const parsed = JSON.parse(val);
              if (typeof parsed.remaining === "number") return parsed.remaining;
            }
          }
        }
      } catch {
        // Fall through
      }
    }
    return 1000;
  });

  const [total, setTotal] = useState<number>(1000);
  const [used, setUsed] = useState<number>(0);
  const [tier, setTier] = useState<string>("free_account");
  const [daysRemaining, setDaysRemaining] = useState<number>(30);
  const [periodEnd, setPeriodEnd] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Real-time Firestore sync across environments (localhost <-> mytoolsbox.me)
  useEffect(() => {
    // If auth is still initializing, don't prematurely reset
    if (authLoading) return;

    if (!user || isAnonymous) {
      setRemaining(0);
      setTotal(1000);
      setUsed(0);
      setLoading(false);
      return;
    }

    // Immediately restore cached balance for this user
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`mytoolsbox_credits_${user.uid}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (typeof parsed.remaining === "number") setRemaining(parsed.remaining);
          if (typeof parsed.total === "number") setTotal(parsed.total);
          if (typeof parsed.used === "number") setUsed(parsed.used);
          if (parsed.tier) setTier(parsed.tier);
          if (parsed.periodEnd) setPeriodEnd(parsed.periodEnd);
          if (typeof parsed.daysRemaining === "number") setDaysRemaining(parsed.daysRemaining);
          setLoading(false);
        }
      } catch {}
    }

    const unsubscribe = subscribeUserCredits(user.uid, (summary) => {
      setRemaining(summary.remaining);
      setTotal(summary.total);
      setUsed(summary.used);
      setTier(summary.tier);
      setDaysRemaining(summary.daysRemaining);
      setPeriodEnd(summary.periodEnd);
      setLoading(false);
      setError(null);

      // Cache locally for instant next load
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `mytoolsbox_credits_${user.uid}`,
          JSON.stringify({
            remaining: summary.remaining,
            total: summary.total,
            used: summary.used,
            tier: summary.tier,
            daysRemaining: summary.daysRemaining,
            periodEnd: summary.periodEnd,
            timestamp: Date.now(),
          })
        );
      }
    });

    return () => unsubscribe();
  }, [user, isAnonymous]);

  // 2. Fetch credits from server endpoint as complementary check / refresh
  const fetchCredits = useCallback(async () => {
    if (!user || isAnonymous) {
      setRemaining(0);
      setTotal(1000);
      setUsed(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/ai/credits");
      if (res.ok) {
        const data = await res.json();
        const rem = data.remaining ?? 1000;
        const tot = data.total ?? 1000;
        const us = data.used ?? 0;
        const tr = data.tier ?? "free_account";
        const days = data.daysRemaining ?? 30;
        const pEnd = data.periodEnd;

        // Only accept server credits if it doesn't arbitrarily reset real usage
        setRemaining((currentRem) => {
          // If client already has recorded usage (less than 1000), keep the lower remaining
          if (currentRem < 1000 && rem >= 1000) return currentRem;
          return rem;
        });
        setUsed((currentUsed) => {
          if (currentUsed > 0 && us === 0) return currentUsed;
          return us;
        });
        setTotal(tot);
        setTier(tr);
        setDaysRemaining(days);
        if (pEnd) setPeriodEnd(pEnd);
      } else if (res.status === 401) {
        setRemaining(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credits");
    } finally {
      setLoading(false);
    }
  }, [user, isAnonymous]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // 3. Listen to live credit updates broadcasted across components
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ remaining?: number; total?: number; used?: number }>;
      if (typeof customEvent.detail?.remaining === "number") {
        const newRem = customEvent.detail.remaining;
        setRemaining(newRem);
        const newUsed = customEvent.detail?.used;

        if (user?.uid) {
          syncCreditsToFirestore(user.uid, newRem, newUsed).catch(() => {});

          if (typeof window !== "undefined") {
            const cached = localStorage.getItem(`mytoolsbox_credits_${user.uid}`);
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                parsed.remaining = newRem;
                if (typeof newUsed === "number") {
                  parsed.used = newUsed;
                }
                localStorage.setItem(`mytoolsbox_credits_${user.uid}`, JSON.stringify(parsed));
              } catch {
                // Ignore
              }
            }
          }
        }
      }
      if (typeof customEvent.detail?.total === "number") {
        setTotal(customEvent.detail.total);
      }
    };

    window.addEventListener("credits-updated", handleUpdate);
    return () => {
      window.removeEventListener("credits-updated", handleUpdate);
    };
  }, [user]);

  return {
    remaining,
    total,
    used,
    tier,
    daysRemaining,
    periodEnd,
    loading,
    error,
    refresh: fetchCredits,
  };
}
