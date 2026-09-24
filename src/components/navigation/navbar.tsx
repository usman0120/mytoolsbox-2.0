"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t, localizePath } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const getNavLabel = (href: string, fallback: string) => {
    switch (href) {
      case "/tools": return t("nav_tools");
      case "/apps": return t("nav_apps");
      case "/ai": return t("nav_ai");
      case "/hubs": return t("nav_hubs");
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
  if (shouldOpenSignIn && !signInOpen) {
    setSignInOpen(true);
  }

  const isAIActive = pathname.startsWith("/ai");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 transition-shadow duration-300",
        scrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto flex h-15 items-center justify-between px-4">
        {/* Logo — Enlarged & Sharp */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/25 group-hover:scale-105 transition-transform shadow-xs">
            <img
              src="/mytoolsbox logo.png"
              alt={SITE_CONFIG.name}
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="font-bold text-base tracking-tight hidden sm:inline-block">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
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
                  <DropdownMenuContent align="center" className="w-56 rounded-2xl p-1.5 text-xs shadow-lg">
                    <DropdownMenuItem className="p-0 cursor-pointer rounded-xl">
                      <Link
                        href={localizePath("/ai")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-xl hover:bg-accent/60"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{t("ai_new_chat")}</div>
                          <div className="text-[10px] text-muted-foreground">Multi-turn AI Assistant</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="p-0 cursor-pointer rounded-xl">
                      <Link
                        href={localizePath("/ai/prompts")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-xl hover:bg-accent/60"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Lightbulb className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{t("ai_prompt_library")}</div>
                          <div className="text-[10px] text-muted-foreground">160+ Curated Templates</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="p-0 cursor-pointer rounded-xl">
                      <Link
                        href={localizePath("/ai/compare")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-xl hover:bg-accent/60"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Cpu className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{t("ai_compare_models")}</div>
                          <div className="text-[10px] text-muted-foreground">Side-by-side Arena</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="p-0 cursor-pointer rounded-xl">
                      <Link
                        href={localizePath("/ai/personas")}
                        className="flex items-center gap-2.5 p-2 w-full rounded-xl hover:bg-accent/60"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Layers className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{t("ai_personas")}</div>
                          <div className="text-[10px] text-muted-foreground">Specialized Engines</div>
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
                    ? "text-foreground font-medium"
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
                className="rounded-xl h-8 text-xs font-medium"
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
              className="md:hidden rounded-xl h-9 w-9"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="right" className="w-80 p-0" aria-label="Mobile navigation">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/25">
                    <img
                      src="/mytoolsbox logo.png"
                      alt={SITE_CONFIG.name}
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <span className="font-bold text-base">{SITE_CONFIG.name}</span>
                </div>

                <div className="mb-3">
                  <SearchCommand variant="navbar" />
                </div>

                <div className="mb-4">
                  <LanguageSwitcher variant="mobile" />
                </div>

                <div className="space-y-1">
                  <Link
                    href="/tools"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    Tools
                  </Link>
                  <Link
                    href="/apps"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    Apps
                  </Link>

                  {/* AI Mobile Submenu */}
                  <div className="py-2 border-y border-border/50 my-2 space-y-1">
                    <div className="px-3 text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      AI Suite
                    </div>
                    <Link
                      href="/ai"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-violet-500" />
                      Chat Workspace
                    </Link>
                    <Link
                      href="/ai/prompts"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      Prompt Library (160+)
                    </Link>
                    <Link
                      href="/ai/compare"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <Cpu className="h-3.5 w-3.5 text-blue-500" />
                      Compare Models
                    </Link>
                    <Link
                      href="/ai/personas"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted"
                    >
                      <Layers className="h-3.5 w-3.5 text-emerald-500" />
                      Personas & Tools
                    </Link>
                  </div>

                  <Link
                    href="/hubs"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    Hubs
                  </Link>
                  <Link
                    href="/resources"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    Resources
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  {user ? (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground px-3">{user.email}</div>
                      <Link
                        href="/settings"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-3 py-2 text-sm rounded-xl hover:bg-muted"
                      >
                        Settings & Profile
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
                      Sign In
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