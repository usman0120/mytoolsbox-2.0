"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OfflineState {
  /** Whether the browser is currently offline */
  isOnline: boolean;
  /** Whether the browser was online and then went offline (for UI transitions) */
  wasOnline: boolean;
  /** When the connection was last checked (timestamp) */
  lastChecked: number;
}

// ---------------------------------------------------------------------------
// Tools that work offline (no server/AI required)
// ---------------------------------------------------------------------------

const OFFLINE_CAPABLE_TOOL_PATTERNS = [
  "/tools/calculator",
  "/tools/json",
  "/tools/text",
  "/tools/qr",
  "/tools/unit-converter",
  "/tools/color",
  "/tools/base64",
  "/tools/regex",
  "/tools/markdown",
  "/tools/diff",
  "/calculators",
  "/converters",
];

/**
 * Check if a given path can work offline.
 * Calculators, JSON tools, text tools, image resizing, QR codes,
 * and unit converters all work client-side.
 */
export function canWorkOffline(pathname: string): boolean {
  return OFFLINE_CAPABLE_TOOL_PATTERNS.some((pattern) =>
    pathname.startsWith(pattern)
  );
}

// ---------------------------------------------------------------------------
// Hook: useOnlineStatus
// ---------------------------------------------------------------------------

export function useOnlineStatus(): OfflineState {
  const [state, setState] = useState<OfflineState>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    wasOnline: true,
    lastChecked: Date.now(),
  }));

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setState((prev) => ({
        isOnline: true,
        wasOnline: prev.isOnline ? true : false,
        lastChecked: Date.now(),
      }));
    };

    const handleOffline = () => {
      setState((prev) => ({
        isOnline: false,
        wasOnline: prev.isOnline,
        lastChecked: Date.now(),
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic check (some browsers don't fire events reliably)
    const interval = setInterval(() => {
      setState((prev) => {
        const nowOnline = navigator.onLine;
        if (prev.isOnline !== nowOnline) {
          return {
            isOnline: nowOnline,
            wasOnline: prev.isOnline,
            lastChecked: Date.now(),
          };
        }
        return { ...prev, lastChecked: Date.now() };
      });
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return state;
}

// ---------------------------------------------------------------------------
// Hook: useOfflineCapable
// ---------------------------------------------------------------------------

export function useOfflineCapable(pathname: string): {
  isOfflineCapable: boolean;
  offlineMessage: string | null;
} {
  const { isOnline } = useOnlineStatus();
  const isOfflineCapable = canWorkOffline(pathname);

  if (isOnline) {
    return { isOfflineCapable: true, offlineMessage: null };
  }

  if (isOfflineCapable) {
    return {
      isOfflineCapable: true,
      offlineMessage: "You're offline. This tool still works locally.",
    };
  }

  return {
    isOfflineCapable: false,
    offlineMessage:
      "You're offline. This feature requires an internet connection.",
  };
}

// ---------------------------------------------------------------------------
// Hook: useOfflineQueue
// ---------------------------------------------------------------------------
// Queues actions to be replayed when back online.
// ---------------------------------------------------------------------------

interface QueuedAction {
  id: string;
  action: () => Promise<void>;
  description: string;
  createdAt: number;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const { isOnline } = useOnlineStatus();

  // Replay queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const replay = async () => {
        for (const item of [...queue]) {
          try {
            await item.action();
            setQueue((prev) => prev.filter((q) => q.id !== item.id));
          } catch {
            // Leave in queue for next online event
          }
        }
      };
      replay();
    }
  }, [isOnline, queue]);

  const enqueue = useCallback((action: QueuedAction) => {
    setQueue((prev) => [...prev, action]);
  }, []);

  const dequeue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    isOnline,
    enqueue,
    dequeue,
    clearQueue,
    queueSize: queue.length,
  };
}