"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getHistory, clearHistory, removeHistoryEntry } from "@/lib/firebase/user-service";
import type { HistoryItem } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { Clock, Trash2, Loader2, History, LogIn } from "lucide-react";
import { toast } from "sonner";
import { SignInDialog } from "@/components/auth/signin-dialog";
import { useI18n } from "@/lib/i18n";

export function HistoryPageClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, localizePath, getToolName, getCategoryName: getCatNameI18n } = useI18n();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const errorRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/?signin=true");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });
    getHistory(user.uid)
      .then((items) => {
        if (!cancelled) {
          errorRef.current = false;
          setHistory(items);
        }
      })
      .catch(() => { if (!cancelled) errorRef.current = true; })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  // Show error toast outside the setState flow
  useEffect(() => {
    if (!loading && errorRef.current) {
      toast.error("Failed to load history");
      errorRef.current = false;
    }
  }, [loading]);

  const handleClearAll = async () => {
    if (!user) return;
    try {
      await clearHistory(user.uid);
      setHistory([]);
      toast.success(t("hist_cleared"));
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const handleRemove = async (item: HistoryItem) => {
    if (!user) return;
    try {
      await removeHistoryEntry(user.uid, item.id);
      setHistory((prev) => prev.filter((h) => h.id !== item.id));
      toast.success("Entry removed");
    } catch {
      toast.error("Failed to remove entry");
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <PageShell className="max-w-3xl">
        <ToolHeader title={t("hist_title")} />
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("auth_login_required")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("auth_login_desc")}
            </p>
            <Button onClick={() => setShowSignIn(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              {t("auth_signin")}
            </Button>
          </CardContent>
        </Card>
        <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      </PageShell>
    );
  }

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getItemHref = (item: HistoryItem) =>
    localizePath(`/${item.productType === "app" ? "apps" : "tools"}/${item.toolSlug}`);

  return (
    <PageShell className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <ToolHeader title={t("hist_title")} className="mb-1" />
          <p className="text-muted-foreground">
            {history.length === 0
              ? t("hist_empty")
              : `${history.length} ${t("hist_title").toLowerCase()}`}
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <Trash2 className="mr-2 h-4 w-4" /> {t("hist_clear")}
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("hist_empty")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("hist_subtitle")}
            </p>
            <Button onClick={() => router.push(localizePath("/tools"))}>
              {t("fav_browse")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y border-y">
          {history.map((item) => (
            <div key={item.id} className="group">
              <div className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={getItemHref(item)}
                        className="font-medium text-sm hover:text-primary transition-colors wrap-break-word"
                      >
                        {getToolName(item.toolSlug, item.toolName)}
                      </Link>
                      <span className="text-xs text-muted-foreground capitalize shrink-0">
                        {item.action}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>
                        {getCatNameI18n(item.category, item.category)}
                      </span>
                      <span>{formatTime(item.timestamp)}</span>
                      {item.details && (
                        <span className="truncate">· {item.details}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${t("fav_remove", "Remove")} ${getToolName(item.toolSlug, item.toolName)}`}
                  title={t("fav_remove", "Remove")}
                  onClick={() => handleRemove(item)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}