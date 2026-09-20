"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getHistory, clearHistory, removeHistoryEntry } from "@/lib/firebase/user-service";
import type { HistoryItem } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Trash2, Loader2, ExternalLink, History, LogIn } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";
import { SignInDialog } from "@/components/auth/signin-dialog";

export function HistoryPageClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/?signin=true");
    }
  }, [authLoading, user, router]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getHistory(user.uid);
      setHistory(items);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearAll = async () => {
    if (!user) return;
    try {
      await clearHistory(user.uid);
      setHistory([]);
      toast.success("History cleared");
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
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">Your tool usage history</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Please log in first</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to save and view your tool usage history across sessions.
            </p>
            <Button onClick={() => setShowSignIn(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
        <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      </div>
    );
  }

  const getCategoryName = (catId: string) =>
    CATEGORIES.find((c) => c.id === catId)?.name ?? catId;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">
            {history.length === 0
              ? "No recent activity."
              : `${history.length} recent entr${history.length !== 1 ? "ies" : "y"}`}
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No history yet</h3>
            <p className="text-muted-foreground mb-4">
              Your tool usage will appear here as you use MyToolsBox.
            </p>
            <Button onClick={() => router.push("/tools")}>
              Explore Tools
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <Card key={item.id} className="group">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tools/${item.toolSlug}`}
                        className="font-medium text-sm hover:text-primary transition-colors truncate"
                      >
                        {item.toolName}
                      </Link>
                      <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                        {item.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px]">
                        {getCategoryName(item.category)}
                      </span>
                      <span>{formatTime(item.timestamp)}</span>
                      {item.details && (
                        <span className="truncate">· {item.details}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push(`/tools/${item.toolSlug}`)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}