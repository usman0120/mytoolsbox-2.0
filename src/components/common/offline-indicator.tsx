"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus, useOfflineQueue } from "@/hooks/use-offline";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// OfflineIndicator — subtle banner shown when offline
// ---------------------------------------------------------------------------

export function OfflineIndicator() {
  const { isOnline, wasOnline } = useOnlineStatus();
  const [visible, setVisible] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setShowReconnected(false);
    } else if (!wasOnline && isOnline) {
      // Just reconnected — show success briefly
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOnline]);

  if (!visible && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
        "shadow-lg transition-all duration-300",
        !isOnline &&
          "bg-destructive text-destructive-foreground animate-in slide-in-from-bottom-2",
        showReconnected &&
          "bg-green-600 text-white animate-in slide-in-from-bottom-2"
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You&apos;re offline. Some features may be limited.</span>
        </>
      ) : showReconnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Back online!</span>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OfflineQueueIndicator — shows pending queued actions
// ---------------------------------------------------------------------------

export function OfflineQueueIndicator() {
  const { queueSize, isOnline } = useOfflineQueue();

  if (queueSize === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-16 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
        "bg-muted text-muted-foreground shadow-lg",
        isOnline && "bg-blue-600 text-white"
      )}
    >
      {isOnline ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing {queueSize} pending action{queueSize > 1 ? "s" : ""}…</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>
            {queueSize} action{queueSize > 1 ? "s" : ""} queued for when
            you&apos;re back online
          </span>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OfflineToolBadge — shown on tool cards that work offline
// ---------------------------------------------------------------------------

export function OfflineToolBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        className
      )}
    >
      <Wifi className="h-3 w-3" />
      Works offline
    </span>
  );
}