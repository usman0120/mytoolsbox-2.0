"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  saveUserProfile,
  scheduleAccountDeletion,
  cancelAccountDeletion,
  disableAccount,
  reactivateAccount,
} from "@/lib/firebase/user-service";
import type { UserProfile } from "@/types/user";
import { DEFAULT_PROFILE } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  User,
  Shield,
  Loader2,
  Save,
  Trash2,
  LogIn,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Ban,
  Mail,
  Fingerprint,
  Calendar,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SignInDialog } from "@/components/auth/signin-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

export function SettingsPageClient() {
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const { t, localizePath } = useI18n();

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // Deletion & Disable Modals
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load user profile
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const prof = await getUserProfile(user.uid);
      setCurrentTime(Date.now());
      if (prof) {
        setProfile(prof);
      } else {
        setProfile({
          ...DEFAULT_PROFILE,
          displayName: user.displayName ?? "",
        });
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserProfile(user.uid, profile);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [user, profile]);

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
        <ToolHeader title={t("settings_title")} />
        <section className="border-t py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("auth_login_required")}</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            {t("auth_login_desc")}
          </p>
          <Button onClick={() => setShowSignIn(true)} className="rounded-xl px-6">
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

  const initials = (profile.displayName || user.displayName || user.email || "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageShell className="max-w-4xl space-y-5">
      {/* Top Banner Alert if Pending Deletion */}
      {isPendingDeletion && (
        <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                Account Scheduled for Permanent Deletion
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your account will be permanently erased in <strong>{daysRemaining} days</strong>.
                You can cancel this request at any time during this 30-day window.
              </p>
            </div>
          </div>
          <Button
            onClick={handleCancelDeletion}
            disabled={actionLoading}
            size="sm"
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1.5 shadow-sm"
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
              <p className="text-xs text-muted-foreground mt-0.5">
                Your account is inactive. Your tools, favorites, and history are preserved safely.
              </p>
            </div>
          </div>
          <Button
            onClick={handleReactivateAccount}
            disabled={actionLoading}
            size="sm"
            className="rounded-xl gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Reactivate Account
          </Button>
        </div>
      )}

      {/* Page Header */}
      <ToolHeader title={t("settings_title")} />

      {/* Clean Tabs: Only Profile and Account */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="rounded-lg p-1 bg-muted/40 border border-border/50">
          <TabsTrigger value="profile" className="rounded-xl gap-2 text-xs font-medium py-1.5 px-4">
            <User className="h-3.5 w-3.5" />
            {t("settings_tab_profile")}
          </TabsTrigger>
          <TabsTrigger value="account" className="rounded-xl gap-2 text-xs font-medium py-1.5 px-4">
            <Shield className="h-3.5 w-3.5" />
            {t("settings_tab_account")}
          </TabsTrigger>
        </TabsList>

        {/* ==========================================
            TAB 1: PROFILE
           ========================================== */}
        <TabsContent value="profile" className="space-y-6 focus-visible:outline-hidden">
          <Card className="rounded-lg border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Public Profile</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Avatar Card */}
              <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                  <AvatarImage src={user.photoURL ?? undefined} />
                  <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">
                    {profile.displayName || user.displayName || "User"}
                  </h3>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="outline" className="mt-1.5 text-[10px] font-mono capitalize">
                    {profile.status ?? "active"}
                  </Badge>
                </div>
              </div>

              {/* Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs font-medium">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    placeholder="Enter your name"
                    className="h-11 rounded-md text-base bg-background/60"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs font-medium flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    Location / Country
                  </Label>
                  <Input
                    id="location"
                    value={profile.location ?? ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. New York, USA or Remote"
                    className="h-11 rounded-md text-base bg-background/60"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="A short description about yourself, your profession, or interests..."
                  rows={3}
                  className="rounded-md text-base bg-background/60 leading-relaxed resize-y"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-xs font-medium flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  Website / Social Link
                </Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yourwebsite.com or https://github.com/..."
                  className="h-11 rounded-md text-base bg-background/60"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-md h-11 px-4 text-sm font-medium gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {t("settings_save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            TAB 2: ACCOUNT & SECURITY
           ========================================== */}
        <TabsContent value="account" className="space-y-6 focus-visible:outline-hidden">
          {/* Account Details Card */}
          <Card className="rounded-lg border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription className="text-xs">
                Essential identification and sign-in credentials for your account.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>Email Address</span>
                  </div>
                  <div className="font-mono text-xs font-semibold truncate">{user.email ?? "Guest"}</div>
                </div>

                {/* User ID */}
                <div className="py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Fingerprint className="h-3.5 w-3.5 text-primary" />
                    <span>User ID (UID)</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate">{user.uid}</div>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-t text-sm">
                <div>
                  <span className="font-medium text-foreground block">Account Status</span>
                  <span className="text-muted-foreground">
                    {isPendingDeletion
                      ? "Pending permanent deletion (30-day grace period)"
                      : isDisabled
                      ? "Temporarily deactivated"
                      : "Active and in good standing"}
                  </span>
                </div>
                <Badge
                  variant={isPendingDeletion ? "destructive" : isDisabled ? "secondary" : "outline"}
                  className="capitalize font-mono text-[10px]"
                >
                  {profile.status ?? "active"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Lifecycle Actions: Disable & 30-Day Deletion */}
          <Card className="rounded-lg border-destructive/30 bg-destructive/5 overflow-hidden">
            <CardHeader className="pb-3 border-b border-destructive/20">
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Account Management & Danger Zone
              </CardTitle>
              <CardDescription className="text-xs">
                Options to temporarily disable or request permanent account deletion with a 30-day recovery guarantee.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* Disable Account Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/40">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-xs">
                    {isDisabled ? "Reactivate Account" : "Disable Account"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    Temporarily deactivate your account. Your saved tools, history, and favorites are preserved.
                    You can log back in at any time to re-enable it.
                  </p>
                </div>
                {isDisabled ? (
                  <Button
                    onClick={handleReactivateAccount}
                    disabled={actionLoading}
                    size="sm"
                    className="rounded-xl shrink-0"
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
                    {isPendingDeletion ? "Pending Deletion Active" : "Request Account Deletion (30 Days)"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    {isPendingDeletion
                      ? `Your account is scheduled to be permanently wiped on ${new Date(
                          profile.deletionScheduledAt!
                        ).toLocaleDateString()}. You have ${daysRemaining} days remaining to reactivate it.`
                      : "Account deletion initiates a 30-day grace period. If you change your mind, simply sign in within 30 days to cancel deletion. After 30 days, your data is permanently deleted."}
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
                    Delete Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deletion Confirmation Dialog (30 Days Notice) */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Schedule Account Deletion?
            </DialogTitle>
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
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <Ban className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Temporarily Disable Account?
            </DialogTitle>
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