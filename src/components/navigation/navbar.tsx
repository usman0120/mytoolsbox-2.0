"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SignInDialog } from "@/components/auth/signin-dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SearchCommand } from "@/components/common/search-command";

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-open sign-in dialog when redirected from proxy
  const shouldOpenSignIn = searchParams.get("signin") === "true";
  if (shouldOpenSignIn && !signInOpen) {
    setSignInOpen(true);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 transition-shadow duration-300",
        scrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20 group-hover:scale-105 transition-transform">
            <img
              src="/mytoolsbox logo.png"
              alt={SITE_CONFIG.name}
              className="h-5 w-5 object-contain"
            />
          </div>
          <span className="font-semibold text-sm hidden sm:inline-block">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-accent/60",
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search + Auth */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <SearchCommand variant="navbar" />
          </div>
          <ThemeToggle />
          {/* Desktop Auth */}
          <div className="hidden sm:flex items-center">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-8 text-xs font-medium"
                onClick={() => setSignInOpen(true)}
              >
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg h-9 w-9"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="right" className="w-72 p-0" aria-label="Mobile navigation">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
                    <img
                      src="/mytoolsbox logo.png"
                      alt={SITE_CONFIG.name}
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                  <span className="font-semibold text-sm">{SITE_CONFIG.name}</span>
                </div>
                <div className="mb-4">
                  <SearchCommand variant="navbar" onClose={() => setMobileOpen(false)} />
                </div>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-accent/60",
                        isActive
                          ? "font-medium bg-accent/60 text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="mt-4 pt-4 border-t border-border/50">
                  {loading ? (
                    <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
                  ) : user ? (
                    <div className="flex items-center gap-3 px-3 py-2">
                      <UserMenu />
                      <span className="text-sm font-medium truncate">
                        {user.displayName ?? user.email}
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full rounded-lg"
                      onClick={() => {
                        setMobileOpen(false);
                        setSignInOpen(true);
                      }}
                    >
                      Sign in
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </header>
  );
}