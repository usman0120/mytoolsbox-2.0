"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  MessageSquare,
  Lightbulb,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { SignInDialog } from "@/components/auth/signin-dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SearchCommand } from "@/components/common/search-command";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { t, localizePath } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInRequested, setSignInRequested] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const getNavLabel = (href: string, fallback: string) => {
    switch (href) {
      case "/tools": return t("nav_tools");
      case "/apps": return t("nav_apps");
      case "/ai": return t("nav_ai");
      case "/hubs": return t("nav_hubs");
      case "/blog": return "Blog";
      case "/resources": return t("nav_resources");
      default: return fallback;
    }
  };

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-open sign-in dialog when redirected from proxy
  const shouldOpenSignIn = searchParams.get("signin") === "true";
  if (shouldOpenSignIn !== signInRequested) {
    setSignInRequested(shouldOpenSignIn);
    if (shouldOpenSignIn) setSignInOpen(true);
  }

  const isAIActive = pathname.startsWith("/ai");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 transition-shadow duration-300",
        scrolled && "shadow-sm"
      )}
    >
      <div className="mx-auto flex h-[var(--shell-header-height)] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo — Refined editorial badge */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs tracking-tight shadow-xs group-hover:opacity-90 transition-opacity">
            tb.
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground hidden sm:inline-block">
            {SITE_CONFIG.name}
          </span>
          <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-border/80 text-muted-foreground bg-muted/40">
            PRO
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const localizedHref = localizePath(item.href);
            const label = getNavLabel(item.href, item.label);

            // Handle AI specially with a dropdown menu
            if (item.href === "/ai") {
              return (
                <DropdownMenu key="ai-dropdown">
                  <DropdownMenuTrigger
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-accent/60 outline-none select-none cursor-pointer",
                      isAIActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{t("nav_ai")}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                    {isAIActive && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full" />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56 rounded-xl p-1.5 text-sm shadow-md border-border/70">
                    <DropdownMenuItem className="p-0 cursor-pointer rounded-lg">
                      <Link
                        href={localizePath("/ai")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-lg hover:bg-accent/60 transition-colors"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-xs">{t("ai_new_chat")}</div>
                          <div className="text-[10px] text-muted-foreground">{t("nav_ai_chat_sub")}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="p-0 cursor-pointer rounded-lg">
                      <Link
                        href={localizePath("/ai/prompts")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-lg hover:bg-accent/60 transition-colors"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Lightbulb className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-xs">{t("ai_prompt_library")}</div>
                          <div className="text-[10px] text-muted-foreground">{t("nav_ai_prompts_sub")}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="p-0 cursor-pointer rounded-lg">
                      <Link
                        href={localizePath("/ai/compare")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-lg hover:bg-accent/60 transition-colors"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Cpu className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-xs">{t("ai_compare_models")}</div>
                          <div className="text-[10px] text-muted-foreground">{t("nav_ai_compare_sub")}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="p-0 cursor-pointer rounded-lg">
                      <Link
                        href={localizePath("/ai/personas")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-lg hover:bg-accent/60 transition-colors"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Layers className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-xs">{t("ai_personas")}</div>
                          <div className="text-[10px] text-muted-foreground">{t("nav_ai_personas_sub")}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={localizedHref}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-accent/60",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Search + Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <SearchCommand variant="navbar" />
          </div>
          <LanguageSwitcher variant="navbar" />
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
                className="rounded-lg h-8 px-3 text-xs font-medium border-border/80 hover:bg-muted/50"
                onClick={() => setSignInOpen(true)}
              >
                {t("nav_signin")}
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-lg h-10 w-10"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="right" className="w-80 max-w-full overflow-y-auto p-0" aria-label="Mobile navigation">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs tracking-tight shadow-xs">
                    tb.
                  </div>
                  <span className="font-semibold text-base">{SITE_CONFIG.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-border/80 text-muted-foreground bg-muted/40">
                    PRO
                  </span>
                </div>

                <div className="mb-3">
                  <SearchCommand variant="navbar" />
                </div>

                <div className="mb-4">
                  <LanguageSwitcher variant="mobile" />
                </div>

                <div className="space-y-1">
                  <Link
                    href={localizePath("/tools")}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    {t("nav_tools")}
                  </Link>
                  <Link
                    href={localizePath("/apps")}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    {t("nav_apps")}
                  </Link>

                  {/* AI Mobile Submenu */}
                  <div className="py-2 border-y border-border/50 my-2 space-y-1">
                    <div className="px-3 text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      {t("footer_ai_suite")}
                    </div>
                    <Link
                      href={localizePath("/ai")}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-violet-500" />
                      {t("ai_new_chat")}
                    </Link>
                    <Link
                      href={localizePath("/ai/prompts")}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      {t("ai_prompt_library")}
                    </Link>
                    <Link
                      href={localizePath("/ai/compare")}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <Cpu className="h-3.5 w-3.5 text-blue-500" />
                      {t("ai_compare_models")}
                    </Link>
                    <Link
                      href={localizePath("/ai/personas")}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <Layers className="h-3.5 w-3.5 text-emerald-500" />
                      {t("ai_personas")}
                    </Link>
                  </div>

                  <Link
                    href={localizePath("/hubs")}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    {t("nav_hubs")}
                  </Link>
                  <Link
                    href={localizePath("/blog")}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    <span>Blog & Guides</span>
                  </Link>
                  <Link
                    href={localizePath("/resources")}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    {t("nav_resources")}
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  {user ? (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground px-3">{user.email}</div>
                      <Link
                        href={localizePath("/settings")}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-3 py-2 text-sm rounded-xl hover:bg-muted"
                      >
                        {t("nav_settings_profile")}
                      </Link>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileOpen(false);
                        setSignInOpen(true);
                      }}
                      className="w-full rounded-xl text-xs"
                    >
                      {t("nav_signin")}
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