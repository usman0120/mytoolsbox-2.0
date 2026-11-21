"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getDeviceId } from "./device-id";
import type { AiQuota } from "./router";

async function fetchQuota(): Promise<AiQuota | null> {
  try {
    const headers: Record<string, string> = { "x-device-id": getDeviceId() };
    const token = await getFirebaseAuth()?.currentUser?.getIdToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch("/api/ai/quota", { headers, cache: "no-store" });
    return res.ok ? ((await res.json()) as AiQuota) : null;
  } catch {
    // Offline or server unavailable: keep the last known value.
    return null;
  }
}

/** Today's free AI allowance for the current visitor. Updates after every AI call. */
export function useAiQuota() {
  const { user } = useAuth();
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await fetchQuota();
    if (next) setQuota(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchQuota().then((next) => {
      if (!active) return;
      if (next) setQuota(next);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    const onUpdate = (e: Event) => setQuota((e as CustomEvent<AiQuota>).detail);
    window.addEventListener("ai-quota-updated", onUpdate);
    return () => window.removeEventListener("ai-quota-updated", onUpdate);
  }, []);

  return { quota, remaining: quota?.remaining ?? null, limit: quota?.limit ?? null, loading, refresh };
}
