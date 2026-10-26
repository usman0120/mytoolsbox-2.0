"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getUserProfile,
  scheduleAccountDeletion,
  cancelAccountDeletion,
  disableAccount,
  reactivateAccount,
  getFavorites,
  removeFavorite,
  getHistory,
  clearHistory,
  removeHistoryEntry,
} from "@/lib/firebase/user-service";
import type { UserProfile, FavoriteItem, HistoryItem } from "@/types/user";
import { DEFAULT_PROFILE } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Loader2,
  Trash2,
  LogIn,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Ban,
  Mail,
  Calendar,
  Heart,
  History,
  ExternalLink,
  Search,
  LogOut,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SignInDialog } from "@/components/auth/signin-dialog";
import { useI18n } from "@/lib/i18n";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

interface SettingsPageClientProps {
  initialTab?: "account" | "history" | "favorites";
}

export function SettingsPageClient({ initialTab }: SettingsPageClientProps) {
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, localizePath, getToolName } = useI18n();

  // Determine active tab from URL query params or prop
  const urlTab = searchParams.get("tab");
  const defaultTab = (urlTab === "history" || urlTab === "favorites" || urlTab === "account")
    ? urlTab
    : (initialTab ?? "account");

  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Sync state if URL search params change
  useEffect(() => {
    if (urlTab === "history" || urlTab === "favorites" || urlTab === "account") {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoriteSearch, setFavoriteSearch] = useState("");

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // Deletion & Disable Modals
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load user profile & status
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getUserProfile(user.uid)
      .then((prof) => {
        if (cancelled) return;
        setCurrentTime(Date.now());
        if (prof) {
          setProfile(prof);
        } else {
          setProfile(DEFAULT_PROFILE);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Load Favorites
  const loadFavorites = useCallback(async () => {
    if (!user) return;
    setFavoritesLoading(true);
    try {
      const items = await getFavorites(user.uid);
      setFavorites(items);
    } catch {
      toast.error("Failed to load saved favorites");
    } finally {
      setFavoritesLoading(false);
    }
  }, [user]);

  // Load History
  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const items = await getHistory(user.uid);
      setHistory(items);
    } catch {
      toast.error("Failed to load activity history");
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "favorites") {
      loadFavorites();
    } else if (activeTab === "history") {
      loadHistory();
    }
  }, [user, activeTab, loadFavorites, loadHistory]);

  // Remove Favorite
  const handleRemoveFavorite = async (item: FavoriteItem) => {
    if (!user) return;
    try {
      await removeFavorite(user.uid, item.id);
      setFavorites((prev) => prev.filter((f) => f.id !== item.id));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed to remove favorite");
    }
  };

  // Clear History
  const handleClearHistory = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await clearHistory(user.uid);
      setHistory([]);
      setShowClearHistoryDialog(false);
      toast.success("Activity history cleared");
    } catch {
      toast.error("Failed to clear history");
    } finally {
      setActionLoading(false);
    }
  };

  // Remove History Entry
  const handleRemoveHistoryEntry = async (item: HistoryItem) => {
    if (!user) return;
    try {
      await removeHistoryEntry(user.uid, item.id);
      setHistory((prev) => prev.filter((h) => h.id !== item.id));
      toast.success("Entry removed");
    } catch {
      toast.error("Failed to remove entry");
    }
  };

  // Request 30-Day Deletion
  const handleRequestDeletion = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const { deletionScheduledAt } = await scheduleAccountDeletion(user.uid);
      const deletionRequestedAt = Date.now();
      setCurrentTime(deletionRequestedAt);
      setProfile((prev) => ({
        ...prev,
        status: "pending_deletion",
        deletionRequestedAt,
        deletionScheduledAt,
      }));
      setShowDeleteDialog(false);
      toast.warning(
        "Account deletion scheduled. You have 30 days to log in and cancel.",
        { duration: 6000 }
      );
    } catch {
      toast.error("Failed to schedule account deletion");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Deletion & Reactivate
  const handleCancelDeletion = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await cancelAccountDeletion(user.uid);
      setProfile((prev) => ({
        ...prev,
        status: "active",
        deletionRequestedAt: undefined,
        deletionScheduledAt: undefined,
      }));
      toast.success("Account deletion cancelled! Your account is active.");
    } catch {
      toast.error("Failed to cancel account deletion");
    } finally {
      setActionLoading(false);
    }
  };

  // Disable Account
  const handleDisableAccount = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await disableAccount(user.uid);
      setProfile((prev) => ({
        ...prev,
        status: "disabled",
        disabledAt: Date.now(),
      }));
      setShowDisableDialog(false);
      toast.info("Account disabled. You can reactivate anytime by logging in.");
    } catch {
      toast.error("Failed to disable account");
    } finally {
      setActionLoading(false);
    }
  };

  // Reactivate Disabled Account
  const handleReactivateAccount = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await reactivateAccount(user.uid);
      setProfile((prev) => ({
        ...prev,
        status: "active",
        disabledAt: undefined,
      }));
      toast.success("Welcome back! Your account has been reactivated.");
    } catch {
      toast.error("Failed to reactivate account");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Filtered lists
  const filteredFavorites = useMemo(() => {
    if (!favoriteSearch.trim()) return favorites;
    const query = favoriteSearch.toLowerCase();
    return favorites.filter((f) =>
      f.toolName.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)
    );
  }, [favorites, favoriteSearch]);

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    const query = historySearch.toLowerCase();
    return history.filter((h) =>
      h.toolName.toLowerCase().includes(query) ||
      h.action.toLowerCase().includes(query) ||
      (h.details && h.details.toLowerCase().includes(query))
    );
  }, [history, historySearch]);

  if (authLoading || (user && !loaded)) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <PageShell className="max-w-2xl">
        <ToolHeader title="Settings & Account" />
        <section className="border-t py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to access your settings</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            Manage your account status, view your saved favorites, and review your activity history.
          </p>
          <Button onClick={() => setShowSignIn(true)} className="rounded-xl px-6 text-xs font-medium">
            <LogIn className="mr-2 h-4 w-4" />
            {t("auth_signin")}
          </Button>
        </section>
        <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      </PageShell>
    );
  }

  const isPendingDeletion = profile.status === "pending_deletion";
  const isDisabled = profile.status === "disabled";

  // Calculate days remaining in 30-day grace period
  const daysRemaining = profile.deletionScheduledAt
    ? Math.max(0, Math.ceil((profile.deletionScheduledAt - currentTime) / (1000 * 60 * 60 * 24)))
    : 30;

  return (
    <PageShell className="max-w-4xl space-y-6">
      {/* Top Banner Alert if Pending Deletion */}
      {isPendingDeletion && (
        <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                Account Scheduled for Permanent Deletion
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Your account will be permanently erased in <strong>{daysRemaining} days</strong>.
                You can cancel this request at any time during this 30-day window.
              </p>
            </div>
          </div>
          <Button
            onClick={handleCancelDeletion}
            disabled={actionLoading}
            size="sm"
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1.5 shadow-sm text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Cancel Deletion & Reactivate
          </Button>
        </div>
      )}

      {/* Top Banner Alert if Disabled */}
      {isDisabled && (
        <div className="p-4 md:p-5 rounded-2xl bg-zinc-500/10 border border-zinc-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Ban className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Account is Currently Disabled</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Your account is inactive. Your tools, favorites, and history are preserved safely.
              </p>
            </div>
          </div>
          <Button
            onClick={handleReactivateAccount}
            disabled={actionLoading}
            size="sm"
            className="rounded-xl gap-1.5 text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Reactivate Account
          </Button>
        </div>
      )}

      {/* Page Header */}
      <ToolHeader
        title="Settings & Workspace"
        description="Manage your account preferences, saved favorite tools, and activity history."
      />

      {/* Consolidated Tabs: Account, History, Favorites */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          router.replace(`/settings?tab=${val}`, { scroll: false });
        }}
        className="space-y-6"
      >
        <TabsList className="rounded-xl p-1 bg-muted/50 border border-border/60">
          <TabsTrigger value="account" className="rounded-lg gap-2 text-xs font-medium py-1.5 px-4 cursor-pointer">
            <Shield className="h-3.5 w-3.5" />
            Account
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-2 text-xs font-medium py-1.5 px-4 cursor-pointer">
            <History className="h-3.5 w-3.5" />
            History ({history.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="rounded-lg gap-2 text-xs font-medium py-1.5 px-4 cursor-pointer">
            <Heart className="h-3.5 w-3.5" />
            Favorites ({favorites.length})
          </TabsTrigger>
        </TabsList>

        {/* ==========================================
            TAB 1: ACCOUNT (Profile tab deleted completely, UID removed)
           ========================================== */}
        <TabsContent value="account" className="space-y-6 focus-visible:outline-hidden">
          {/* Account Details Card (NO User ID / UID) */}
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Account Information</CardTitle>
              <CardDescription className="text-xs">
                Essential identification and active session status.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>Email Address</span>
                  </div>
                  <div className="font-mono text-xs font-semibold truncate text-foreground">
                    {user.email ?? "Guest User"}
                  </div>
                </div>

                {/* Account Status */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span>Account Status</span>
                    </div>
                    <span className="text-xs font-medium capitalize text-foreground">
                      {isPendingDeletion
                        ? "Pending Deletion"
                        : isDisabled
                        ? "Disabled"
                        : "Active & Good Standing"}
                    </span>
                  </div>
                  <Badge
                    variant={isPendingDeletion ? "destructive" : isDisabled ? "secondary" : "outline"}
                    className="capitalize font-mono text-[10px]"
                  >
                    {profile.status ?? "active"}
                  </Badge>
                </div>
              </div>

              {/* Sign In Method & Session Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Authenticated via {user.providerData[0]?.providerId === "google.com" ? "Google Account" : "Secure Auth"}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-xl text-xs h-8 px-3 border-border/70 text-foreground hover:bg-muted"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Lifecycle Actions: Disable & 30-Day Deletion */}
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5 overflow-hidden shadow-xs">
            <CardHeader className="pb-3 border-b border-destructive/20">
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Account Management & Danger Zone
              </CardTitle>
              <CardDescription className="text-xs">
                Options to temporarily disable your account or request permanent deletion with a 30-day recovery window.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* Disable Account Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/40">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-xs text-foreground">
                    {isDisabled ? "Reactivate Account" : "Disable Account"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    Temporarily pause your account. Your saved tools, history, and preferences are safely preserved.
                    You can log back in at any time to re-enable it.
                  </p>
                </div>
                {isDisabled ? (
                  <Button
                    onClick={handleReactivateAccount}
                    disabled={actionLoading}
                    size="sm"
                    className="rounded-xl shrink-0 text-xs"
                  >
                    Reactivate Account
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDisableDialog(true)}
                    className="rounded-xl shrink-0 text-xs border-border/80"
                  >
                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                    Disable Account
                  </Button>
                )}
              </div>

              {/* 30-Day Permanent Deletion Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-xs text-destructive">
                    {isPendingDeletion ? "Pending Deletion Active" : "Request Permanent Account Deletion"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    {isPendingDeletion
                      ? `Your account is scheduled to be permanently wiped on ${new Date(
                          profile.deletionScheduledAt!
                        ).toLocaleDateString()}. You have ${daysRemaining} days remaining to reactivate it.`
                      : "Account deletion initiates a 30-day grace period. If you change your mind, simply sign in within 30 days to cancel deletion. After 30 days, all your data is permanently erased."}
                  </p>
                </div>

                {isPendingDeletion ? (
                  <Button
                    onClick={handleCancelDeletion}
                    disabled={actionLoading}
                    size="sm"
                    className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs gap-1.5 shadow-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Cancel Deletion
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="rounded-xl shrink-0 text-xs gap-1.5 shadow-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account (30 Days)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            TAB 2: HISTORY
           ========================================== */}
        <TabsContent value="history" className="space-y-5 focus-visible:outline-hidden">
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Activity History</CardTitle>
                <CardDescription className="text-xs">
                  Review the tools and applications you have recently executed in your browser.
                </CardDescription>
              </div>
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearHistoryDialog(true)}
                  className="rounded-xl text-xs text-destructive hover:text-destructive border-border/70 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Clear All History
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {history.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search activity history..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-background/60"
                  />
                </div>
              )}

              {historyLoading ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mx-auto mb-3">
                    <History className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">No Activity Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4 leading-relaxed">
                    As you use tools and apps, your actions will be organized here for easy recall.
                  </p>
                  <Link href={localizePath("/tools")}>
                    <Button size="sm" className="rounded-xl text-xs">
                      Explore Tools
                    </Button>
                  </Link>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching entries found for &ldquo;{historySearch}&rdquo;
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredHistory.map((item) => {
                    const href = localizePath(`/${item.productType === "app" ? "apps" : "tools"}/${item.toolSlug}`);
                    return (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-3 group hover:bg-muted/20 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={href}
                                className="font-semibold text-xs text-foreground hover:text-primary transition-colors truncate"
                              >
                                {item.toolName}
                              </Link>
                              <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
                                {item.action}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span>{new Date(item.timestamp).toLocaleString()}</span>
                              {item.details && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[200px]">{item.details}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Link href={href}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHistoryEntry(item)}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            TAB 3: FAVORITES
           ========================================== */}
        <TabsContent value="favorites" className="space-y-5 focus-visible:outline-hidden">
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Saved Favorites</CardTitle>
              <CardDescription className="text-xs">
                Quick access to the tools and utilities you bookmark most often.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {favorites.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search saved favorites..."
                    value={favoriteSearch}
                    onChange={(e) => setFavoriteSearch(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-background/60"
                  />
                </div>
              )}

              {favoritesLoading ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">No Saved Favorites</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4 leading-relaxed">
                    Bookmark your favorite utilities from any tool page to launch them instantly from here.
                  </p>
                  <Link href={localizePath("/tools")}>
                    <Button size="sm" className="rounded-xl text-xs">
                      Browse All Tools
                    </Button>
                  </Link>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching favorites found for &ldquo;{favoriteSearch}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredFavorites.map((item) => {
                    const href = localizePath(`/${item.productType === "app" ? "apps" : "tools"}/${item.toolSlug}`);
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <Badge variant="outline" className="text-[10px] capitalize font-mono px-1.5 py-0">
                              {item.category}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFavorite(item)}
                              className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Link href={href} className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors block">
                            {item.toolName}
                          </Link>
                        </div>

                        <Link href={href} className="w-full">
                          <Button variant="outline" size="sm" className="w-full h-7 rounded-lg text-[11px] font-medium gap-1">
                            Launch Tool <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clear History Confirmation Dialog */}
      <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold">Clear All Activity History?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1 leading-relaxed">
              This will permanently delete all your logged tool executions and recent activity history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearHistoryDialog(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearHistory}
              disabled={actionLoading}
              className="rounded-xl text-xs"
            >
              {actionLoading && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deletion Confirmation Dialog (30 Days Notice) */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-2">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold">Schedule Account Deletion?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Your account will enter a <strong>30-day grace period</strong> before any data is permanently erased.
              <br /><br />
              If you change your mind, simply <strong>sign in anytime within 30 days</strong> to immediately cancel the deletion request and reactivate your account. After 30 days, all your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-xl text-xs"
            >
              Nevermind
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRequestDeletion}
              disabled={actionLoading}
              className="rounded-xl text-xs font-medium"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Confirm & Schedule (30 Days)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Account Confirmation Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2">
              <Ban className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold">Temporarily Disable Account?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Disabling your account deactivates your profile and pauses active sessions. Your history, favorites, and saved settings will remain completely safe. You can reactivate anytime simply by logging back in.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDisableDialog(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisableAccount}
              disabled={actionLoading}
              size="sm"
              className="rounded-xl text-xs font-medium"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Disable Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
