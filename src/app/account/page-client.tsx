"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpCircle, Shield, Zap, Clock, Heart, History, Cloud,
  Sparkles, FileUp, Loader2, CheckCircle2, LogIn, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { SignInDialog } from "@/components/auth/signin-dialog";

export function AccountPageClient() {
  const { user, loading: authLoading, isAnonymous } = useAuth();
  const router = useRouter();
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
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to manage your account and unlock more features.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Please log in first</h3>
            <p className="text-muted-foreground mb-4">
              Create an account or sign in to save favorites, track history, and access your settings across devices.
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

  const isPro = false; // TODO: wire to subscription check

  const guestFeatures = [
    { icon: Calculator, label: "Calculators & converters" },
    { icon: FileUp, label: "Image & PDF tools" },
    { icon: Sparkles, label: "Basic AI features" },
    { icon: Cloud, label: "Browser-based processing" },
  ];

  const accountFeatures = [
    { icon: Heart, label: "Save favorites" },
    { icon: History, label: "Tool usage history" },
    { icon: Clock, label: "Saved results & templates" },
    { icon: Shield, label: "Cross-device access" },
  ];

  const proFeatures = [
    { icon: Zap, label: "Higher AI limits" },
    { icon: FileUp, label: "Larger file sizes" },
    { icon: Sparkles, label: "Specialized AI models" },
    { icon: Shield, label: "Premium apps & tools" },
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1">
          {isAnonymous
            ? "You're using a guest account. Upgrade to unlock more features."
            : "Manage your account and subscription."}
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            {isAnonymous
              ? "Guest accounts have access to basic tools and features."
              : isPro
                ? "You're on the Pro plan with full access."
                : "You're on the free account plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isPro ? "default" : "secondary"} className="text-sm px-3 py-1">
              {isAnonymous ? "Guest" : isPro ? "Pro" : "Free"}
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
                Upgrade to full account
              </Button>
            )}
          </div>

          {/* Feature comparison */}
          <div className="grid gap-6 md:grid-cols-3 pt-4">
            {/* Guest */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Guest
              </h3>
              <ul className="space-y-2">
                {guestFeatures.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    <f.icon className="h-4 w-4 text-muted-foreground" />
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Account
              </h3>
              <ul className="space-y-2">
                {accountFeatures.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Pro
              </h3>
              <ul className="space-y-2">
                {proFeatures.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                    {f.label}
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
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user.email ?? "No email (guest account)"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Provider</p>
              <p className="text-sm text-muted-foreground">
                {isAnonymous
                  ? "Anonymous"
                  : user.providerData[0]?.providerId === "google.com"
                    ? "Google"
                    : user.providerData[0]?.providerId === "password"
                      ? "Email & Password"
                      : user.providerData[0]?.providerId ?? "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Account created</p>
              <p className="text-sm text-muted-foreground">
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Last sign in</p>
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
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/favorites")}
          >
            <Heart className="mr-2 h-4 w-4" />
            View favorites
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/history")}
          >
            <History className="mr-2 h-4 w-4" />
            View history
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/settings")}
          >
            <Shield className="mr-2 h-4 w-4" />
            Account settings
          </Button>
        </CardContent>
      </Card>

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
}

// Need to import Calculator icon
import { Calculator } from "lucide-react";