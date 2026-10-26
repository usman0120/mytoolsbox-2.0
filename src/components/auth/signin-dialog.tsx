"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Google G SVG Icon (official color mark)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// Map Firebase / generic auth errors to user-friendly messages
function getAuthErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("auth/user-not-found") || msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("auth/email-already-in-use")) {
    return "This email is already registered. Try signing in instead.";
  }
  if (msg.includes("auth/weak-password")) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("auth/too-many-requests")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  if (msg.includes("auth/network-request-failed")) {
    return "Network error. Please check your connection and try again.";
  }
  if (msg.includes("auth/popup-closed-by-user") || msg.includes("auth/cancelled-popup-request")) {
    return "Sign-in was cancelled. Please try again.";
  }
  if (msg.includes("auth/account-exists-with-different-credential")) {
    return "An account already exists with this email using a different sign-in method.";
  }
  return "Something went wrong. Please try again.";
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const { t } = useI18n();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, resetPassword } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [resetSent, setResetSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateFields = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (mode !== "reset") {
      if (!password) {
        errors.password = "Password is required.";
      } else if (mode === "signup" && password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest();
      toast.success("Signed in as guest! You can create an account anytime.");
      onOpenChange(false);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    setIsLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        toast.success("Account created! Welcome to MyToolsBox.");
      } else {
        await signInWithEmail(email, password);
        toast.success("Signed in successfully!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string } = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
    if (errors.email) { setFieldErrors(errors); return; }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setMode("signin");
    setResetSent(false);
    setFieldErrors({});
  };

  const switchMode = (next: "signin" | "signup" | "reset") => {
    setMode(next);
    setFieldErrors({});
    setResetSent(false);
    setPassword("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl border-border/70 shadow-xl">
        {/* Header */}
        <div className="px-6 pt-7 pb-5 border-b border-border/50 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="MyToolsBox"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "reset" && "Reset your password"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {mode === "signin" && "Sign in to access your tools, history, and favorites."}
            {mode === "signup" && "Create a free account to save your work and preferences."}
            {mode === "reset" && "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Reset Password Sent State */}
          {mode === "reset" && resetSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold">Check your inbox</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchMode("signin")}
                className="rounded-xl text-xs mt-2"
              >
                Back to Sign In
              </Button>
            </div>
          ) : mode === "reset" ? (
            /* Reset Form */
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-xs font-medium">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                  disabled={isLoading}
                  aria-invalid={!!fieldErrors.email}
                  className={cn("h-10 text-sm rounded-xl", fieldErrors.email && "border-destructive")}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-destructive">{fieldErrors.email}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-10 rounded-xl text-xs font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </button>
            </form>
          ) : (
            /* Sign In / Sign Up */
            <>
              {/* OAuth Providers */}
              <div className="space-y-2.5">
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-xl text-xs font-medium gap-2.5 border-border/70 hover:bg-muted/50"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="h-4 w-4" />
                  )}
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-10 rounded-xl text-xs font-medium gap-2 border-border/70 hover:bg-muted/50 text-muted-foreground"
                  onClick={handleGuestSignIn}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("auth_guest")}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-1">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[11px] text-muted-foreground">
                  or continue with email
                </span>
              </div>

              {/* Tab toggle */}
              <div className="flex rounded-xl border border-border/60 p-1 gap-1 bg-muted/30">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors",
                    mode === "signin"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("auth_signin")}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors",
                    mode === "signup"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("auth_signup")}
                </button>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3" noValidate>
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor={`${mode}-email`} className="text-xs font-medium">
                    Email address
                  </Label>
                  <Input
                    id={`${mode}-email`}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                    disabled={isLoading}
                    aria-invalid={!!fieldErrors.email}
                    className={cn("h-10 text-sm rounded-xl", fieldErrors.email && "border-destructive")}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-destructive">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${mode}-password`} className="text-xs font-medium">
                      Password
                    </Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => switchMode("reset")}
                        className="text-[11px] text-primary hover:underline"
                      >
                        {t("auth_forgot_pwd")}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id={`${mode}-password`}
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                      disabled={isLoading}
                      aria-invalid={!!fieldErrors.password}
                      className={cn("h-10 text-sm rounded-xl pr-10", fieldErrors.password && "border-destructive")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-destructive">{fieldErrors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl text-xs font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === "signup" ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer note */}
        {mode !== "reset" && !resetSent && (
          <div className="px-6 pb-5 text-center">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-foreground hover:underline">Terms</a>
              {" "}and{" "}
              <a href="/privacy" className="text-foreground hover:underline">Privacy Policy</a>.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
