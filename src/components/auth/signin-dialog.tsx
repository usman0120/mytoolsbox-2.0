"use client";

import { useState, useRef, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { safeReturnPath } from "@/lib/auth/auth-navigation";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Heart, History } from "lucide-react";
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

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = useId();
  const { isAnonymous, upgradeGuestToGoogle, upgradeGuestToEmail, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, resetPassword } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<"google" | "guest" | "email" | "reset" | null>(null);
  const isLoading = pending !== null;
  const busy = useRef(false);
  const [authError, setAuthError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [resetSent, setResetSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const beginRequest = (action: NonNullable<typeof pending>) => {
    if (busy.current) return false;
    busy.current = true;
    setPending(action);
    setAuthError("");
    return true;
  };
  const finishRequest = () => { busy.current = false; setPending(null); };
  const completeSignIn = () => {
    resetForm();
    onOpenChange(false);
    const next = safeReturnPath(searchParams.get("next"), window.location.origin);
    if (next) router.push(next);
    else if (searchParams.has("signin")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("signin"); params.delete("next");
      router.replace(`${window.location.pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
    }
    router.refresh();
  };

  const validateFields = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (mode !== "reset") {
      if (!password) {
        errors.password = "Password is required.";
      } else if (mode === "signup" && password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
      }
    }
    if (mode === "signup" && password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) document.getElementById(`${id}-${mode}-${errors.email ? "email" : errors.password ? "password" : "confirm"}`)?.focus();
    return Object.keys(errors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    if (!beginRequest("google")) return;
    try {
      if (isAnonymous && mode === "signup") await upgradeGuestToGoogle();
      else await signInWithGoogle();
      toast.success("Signed in successfully!");
      completeSignIn();
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      finishRequest();
    }
  };

  const handleGuestSignIn = async () => {
    if (!beginRequest("guest")) return;
    try {
      await signInAsGuest();
      toast.success("Signed in as guest! You can create an account anytime.");
      completeSignIn();
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      finishRequest();
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    if (!beginRequest("email")) return;
    try {
      if (mode === "signup") {
        if (isAnonymous) await upgradeGuestToEmail(email.trim(), password);
        else await signUpWithEmail(email.trim(), password);
        toast.success("Account created! Welcome to MyToolsBox.");
      } else {
        await signInWithEmail(email.trim(), password);
        toast.success("Signed in successfully!");
      }
      completeSignIn();
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      finishRequest();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields() || !beginRequest("reset")) return;
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (error) {
      // Do not disclose whether an email has an account.
      if (error && typeof error === "object" && "code" in error && error.code === "auth/user-not-found") setResetSent(true);
      else setAuthError(getAuthErrorMessage(error));
    } finally {
      finishRequest();
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthError("");
    setShowPassword(false);
    setMode("signin");
    setResetSent(false);
    setFieldErrors({});
  };

  const switchMode = (next: "signin" | "signup" | "reset") => {
    if (busy.current) return;
    setMode(next);
    setFieldErrors({});
    setResetSent(false);
    setPassword("");
    setConfirmPassword("");
    setAuthError("");
    setShowPassword(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (busy.current) return;
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent showCloseButton={!isLoading} aria-busy={isLoading} className="sm:max-w-[460px] max-h-[calc(100dvh-2rem)] p-0 gap-0 overflow-y-auto rounded-3xl border-border/70 bg-background shadow-2xl">
        {/* Header */}
        <div className="px-7 pt-8 pb-6 border-b border-border/50 bg-linear-to-br from-primary/10 via-primary/5 to-background text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo className="h-14" eager />
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "reset" && "Reset your password"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {mode === "signin" && "Sign in to access your tools, history, and favorites."}
            {mode === "signup" && "Create a free account to save your work and preferences."}
            {mode === "reset" && "Enter your email and we'll send you a reset link."}
          </DialogDescription>
          {mode !== "reset" && <div className="mt-4 flex justify-center gap-5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Heart className="size-3.5" />Saved favorites</span><span className="inline-flex items-center gap-1.5"><History className="size-3.5" />Your activity</span></div>}
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {authError && <div role="alert" className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><p>{authError}</p></div>}
          {isLoading && <p role="status" className="sr-only">{pending === "reset" ? "Sending reset link" : "Signing in"}…</p>}

          {/* Reset Password Sent State */}
          {mode === "reset" && resetSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold">Check your inbox</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                If an account exists for <strong>{email.trim()}</strong>, you’ll receive a reset link. Check your spam folder too.
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
                <Label htmlFor={`${id}-reset-email`} className="text-xs font-medium">Email address</Label>
                <Input
                  id={`${id}-reset-email`}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                  disabled={isLoading}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
                  className={cn("h-10 text-sm rounded-xl", fieldErrors.email && "border-destructive")}
                />
                {fieldErrors.email && (
                  <p id={`${id}-email-error`} className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-10 rounded-xl text-xs font-medium" disabled={isLoading}>
                {pending === "reset" && <Loader2 className="h-4 w-4 animate-spin" />}{pending === "reset" ? "Sending link…" : "Send Reset Link"}
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
                  {pending === "google" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="h-4 w-4" />
                  )}
                  Continue with Google
                </Button>

                {!isAnonymous && <Button
                  variant="outline"
                  className="w-full h-10 rounded-xl text-xs font-medium gap-2 border-border/70 hover:bg-muted/50 text-muted-foreground"
                  onClick={handleGuestSignIn}
                  disabled={isLoading}
                  type="button"
                >
                  {pending === "guest" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("auth_guest")}
                </Button>}
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
                  disabled={isLoading}
                  aria-pressed={mode === "signin"}
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
                  disabled={isLoading}
                  aria-pressed={mode === "signup"}
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
                  <Label htmlFor={`${id}-${mode}-email`} className="text-xs font-medium">
                    Email address
                  </Label>
                  <Input
                    id={`${id}-${mode}-email`}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                    disabled={isLoading}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
                    className={cn("h-10 text-sm rounded-xl", fieldErrors.email && "border-destructive")}
                  />
                  {fieldErrors.email && (
                    <p id={`${id}-email-error`} className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${id}-${mode}-password`} className="text-xs font-medium">
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
                      id={`${id}-${mode}-password`}
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                      disabled={isLoading}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? `${id}-password-error` : mode === "signup" ? `${id}-password-hint` : undefined}
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
                    <p id={`${id}-password-error`} className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                </div>

                {mode === "signup" && <div className="space-y-1.5">
                  <p id={`${id}-password-hint`} className="text-xs leading-5 text-muted-foreground">At least 6 characters. A longer, unique password is safer.</p>
                  <Label htmlFor={`${id}-signup-confirm`} className="text-xs font-medium">Confirm password</Label>
                  <Input id={`${id}-signup-confirm`} type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword}
                    onChange={(event) => { setConfirmPassword(event.target.value); setFieldErrors((previous) => ({ ...previous, confirmPassword: undefined })); }}
                    disabled={isLoading} aria-invalid={!!fieldErrors.confirmPassword} aria-describedby={fieldErrors.confirmPassword ? `${id}-confirm-error` : undefined} className="h-10 rounded-xl" />
                  {fieldErrors.confirmPassword && <p id={`${id}-confirm-error`} className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
                </div>}
                {isAnonymous && <p className="text-xs leading-5 text-muted-foreground">{mode === "signup" ? "Creating an account keeps the favorites and history in your current guest session." : "Signing in switches to that account. Guest favorites and history are not transferred. Choose Sign up to keep your current guest workspace."}</p>}
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-semibold"
                  disabled={isLoading}
                >
                  {pending === "email" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{mode === "signup" ? "Creating account…" : "Signing in…"}</>
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
