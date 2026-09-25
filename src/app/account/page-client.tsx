"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpCircle, Shield, Zap, Clock, Heart, History, Cloud,
  Sparkles, FileUp, Loader2, CheckCircle2, LogIn, Mail, Calculator
} from "lucide-react";
import { toast } from "sonner";
import { SignInDialog } from "@/components/auth/signin-dialog";

export function AccountPageClient() {
  const { user, loading: authLoading, isAnonymous } = useAuth();
  const router = useRouter();
  const { t, localizePath } = useI18n();
  const [showSignIn, setShowSignIn] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("account_title", "Account")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("auth_login_desc", "Sign in to manage your account and unlock more features.")}
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("auth_login_required", "Please log in first")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("account_guest_notice", "Create an account or sign in to save favorites, track history, and sync your settings across devices.")}
            </p>
            <Button onClick={() => setShowSignIn(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              {t("auth_signin", "Sign In")}
            </Button>
          </CardContent>
        </Card>
        <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      </div>
    );
  }

  const isPro = false;

  const guestFeatures = [
    { icon: Calculator, label: t("cat_calculators", "Calculators & converters") },
    { icon: FileUp, label: t("cat_images", "Image & PDF tools") },
    { icon: Sparkles, label: t("nav_ai", "AI features") },
    { icon: Cloud, label: t("badge_client_side", "Browser-based processing") },
  ];

  const accountFeatures = [
    { icon: Heart, label: t("auth_favorites", "Favorites") },
    { icon: History, label: t("auth_history", "History") },
    { icon: Clock, label: t("resources_tab_templates", "Templates") },
    { icon: Shield, label: t("feature_privacy_title", "Privacy First") },
  ];

  const proFeatures = [
    { icon: Zap, label: t("ai_credits_badge", "Higher AI limits") },
    { icon: FileUp, label: t("badge_pro", "Larger file sizes") },
    { icon: Sparkles, label: t("ai_personas", "Specialized AI models") },
    { icon: Shield, label: t("badge_standalone", "Premium apps & tools") },
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("account_title", "Account")}</h1>
        <p className="text-muted-foreground mt-1">
          {isAnonymous
            ? t("account_guest_sub", "You're using a guest account. Upgrade to unlock more features.")
            : t("account_user_sub", "Manage your account, profile, and subscription.")}
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("account_plan_title", "Current Plan")}
          </CardTitle>
          <CardDescription>
            {isAnonymous
              ? t("account_plan_guest_desc", "Guest accounts have access to basic tools and features.")
              : isPro
                ? t("account_plan_pro_desc", "You're on the Pro plan with full access.")
                : t("account_plan_free_desc", "You're on the free account plan.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isPro ? "default" : "secondary"} className="text-sm px-3 py-1">
              {isAnonymous ? t("auth_guest", "Guest") : isPro ? t("badge_pro", "Pro") : t("badge_free", "Free")}
            </Badge>
            {isAnonymous && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSignIn(true)}
                disabled={upgrading}
              >
                {upgrading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                )}
                {t("account_upgrade_btn", "Upgrade to Full Account")}
              </Button>
            )}
          </div>

          {/* Feature comparison */}
          <div className="grid gap-6 md:grid-cols-3 pt-4">
            {/* Guest */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {t("auth_guest", "Guest")}
              </h3>
              <ul className="space-y-2">
                {guestFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <f.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {t("settings_tab_account", "Account")}
              </h3>
              <ul className="space-y-2">
                {accountFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {t("badge_pro", "Pro")}
              </h3>
              <ul className="space-y-2">
                {proFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("account_details_title", "Account Details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">{t("account_email_label", "Email")}</p>
              <p className="text-sm text-muted-foreground">
                {user.email ?? "No email (guest account)"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("account_provider_label", "Provider")}</p>
              <p className="text-sm text-muted-foreground">
                {isAnonymous
                  ? t("auth_guest", "Anonymous")
                  : user.providerData[0]?.providerId === "google.com"
                    ? "Google"
                    : user.providerData[0]?.providerId === "password"
                      ? "Email & Password"
                      : user.providerData[0]?.providerId ?? "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("account_created_label", "Account Created")}</p>
              <p className="text-sm text-muted-foreground">
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("account_last_signin_label", "Last Sign In")}</p>
              <p className="text-sm text-muted-foreground">
                {user.metadata.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account_quick_links_title", "Quick Links")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(localizePath("/favorites"))}
          >
            <Heart className="mr-2 h-4 w-4" />
            {t("auth_favorites", "Favorites")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(localizePath("/history"))}
          >
            <History className="mr-2 h-4 w-4" />
            {t("auth_history", "History")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(localizePath("/settings"))}
          >
            <Shield className="mr-2 h-4 w-4" />
            {t("auth_settings", "Settings")}
          </Button>
        </CardContent>
      </Card>

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
}