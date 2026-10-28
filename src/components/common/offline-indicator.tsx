"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus, useOfflineQueue } from "@/hooks/use-offline";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UI_COPY } from "@/lib/ui-copy";

// ---------------------------------------------------------------------------
// OfflineIndicator — subtle banner shown when offline
// ---------------------------------------------------------------------------

export function OfflineIndicator() {
  const { isOnline, wasOnline } = useOnlineStatus();
  const [reconnectTimer, setReconnectTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { t } = UI_COPY;

  // Compute visibility during render
  const visible = !isOnline;
  const showReconnected = !wasOnline && isOnline;

  // Manage reconnection timer
  if (showReconnected && !reconnectTimer) {
    const timer = setTimeout(() => {
      setReconnectTimer(null);
    }, 3000);
    setReconnectTimer(timer);
  }
  if (!showReconnected && reconnectTimer) {
    clearTimeout(reconnectTimer);
    setReconnectTimer(null);
  }

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
          <span>{t("status_offline", "You're offline. Some features may be limited.")}</span>
        </>
      ) : showReconnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>{t("status_back_online", "Back online!")}</span>
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
  const { t } = UI_COPY;

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
          <span>{t("status_syncing", "Syncing pending actions...")}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>
            {queueSize} {queueSize > 1 ? "actions" : "action"} queued
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
  const { t } = UI_COPY;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        className
      )}
    >
      <Wifi className="h-3 w-3" />
      {t("status_works_offline", "Works offline")}
    </span>
  );
}
