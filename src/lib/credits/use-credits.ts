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
  const { user, isAnonymous } = useAuth();
  const [remaining, setRemaining] = useState<number>(() => {
    if (typeof window !== "undefined" && user?.uid) {
      const cached = localStorage.getItem(`mytoolsbox_credits_${user.uid}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (typeof parsed.remaining === "number") return parsed.remaining;
        } catch {
          // Fall through
        }
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
    if (!user || isAnonymous) {
      setRemaining(0);
      setTotal(1000);
      setUsed(0);
      setLoading(false);
      return;
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

        setRemaining(rem);
        setTotal(tot);
        setUsed(us);
        setTier(tr);
        setDaysRemaining(days);
        setPeriodEnd(pEnd);

        // Also sync to cloud Firestore
        syncCreditsToFirestore(user.uid, rem, us).catch(() => {});

        // Cache in localStorage
        if (typeof window !== "undefined" && user.uid) {
          localStorage.setItem(
            `mytoolsbox_credits_${user.uid}`,
            JSON.stringify({
              remaining: rem,
              total: tot,
              used: us,
              tier: tr,
              daysRemaining: days,
              periodEnd: pEnd,
              timestamp: Date.now(),
            })
          );
        }
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
