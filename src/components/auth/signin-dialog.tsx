"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LogIn, Mail, Loader2, User } from "lucide-react";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, resetPassword } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign in with Google"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest();
      toast.success("Signed in as guest! You can upgrade your account later.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign in as guest"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        toast.success("Account created successfully!");
      } else {
        await signInWithEmail(email, password);
        toast.success("Signed in successfully!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email);
      toast.success("Password reset email sent!");
      setMode("signin");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setMode("signin");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create an account"}
            {mode === "reset" && "Reset your password"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin" && "Sign in to access all tools and features"}
            {mode === "signup" && "Sign up to get started with MyToolsBox"}
            {mode === "reset" &&
              "Enter your email to receive a password reset link"}
          </DialogDescription>
        </DialogHeader>

        {mode === "reset" ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setMode("signin")}
            >
              Back to sign in
            </Button>
          </form>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleGuestSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <User className="mr-2 h-4 w-4" />
              )}
              Continue as guest
            </Button>

            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                or continue with email
              </span>
            </div>

            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "signin" | "signup")}
            >
              <TabsList className="w-full">
                <TabsTrigger value="signin" className="flex-1">
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Sign up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleEmailAuth} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Mail className="mr-2 h-4 w-4" />
                    Sign in
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => setMode("reset")}
                  >
                    Forgot password?
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleEmailAuth} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Mail className="mr-2 h-4 w-4" />
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}