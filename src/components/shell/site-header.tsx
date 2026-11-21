"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Inbox, Search } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/lib/auth";
import { SITE_CONFIG } from "@/config/site";
import { SPACES } from "@/spaces";
import { cn } from "@/lib/utils";
import { SpaceChip } from "./space-glyph";
import { useShell } from "./shell-store";
import { spaceHref } from "./space-links";

const SignInDialog = dynamic(() => import("@/components/auth/signin-dialog").then((m) => m.SignInDialog));

function SpacesMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          open && "bg-muted text-foreground",
        )}
      >
        Spaces
        <ChevronDown className={cn("size-3.5 transition-transform duration-150", open && "rotate-180")} />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-[560px] gap-0 p-2">
        <div className="grid grid-cols-2 gap-1">
          {SPACES.map((s) => (
            <Link
              key={s.id}
              href={spaceHref(s.id)}
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
            >
              <SpaceChip space={s.id} color={s.color} />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{s.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{s.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between border-t px-2.5 pt-2.5 pb-1 text-xs text-muted-foreground">
          <span>Every tool runs in your browser unless it says AI.</span>
          <Link href="/tools" onClick={() => setOpen(false)} className="font-medium text-foreground hover:underline">
            All tools
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SiteHeader() {
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const setAsk = useShell((s) => s.setAsk);
  const setTray = useShell((s) => s.setTray);
  const signInOpen = useShell((s) => s.signInOpen);
  const setSignIn = useShell((s) => s.setSignIn);
  const [isMac, setIsMac] = useState(false);

  // ?signin=true deep link (used by old protected-page redirects and emails)
  const wantsSignIn = params.get("signin") === "true";
  useEffect(() => {
    if (wantsSignIn) setSignIn(true);
  }, [wantsSignIn, setSignIn]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-[var(--shell-header-height)] max-w-[1400px] items-center gap-2 px-4 md:px-6 lg:px-8">
        <Link href="/" aria-label={`${SITE_CONFIG.name} home`} className="mr-1 flex shrink-0 items-center gap-2">
          <BrandLogo eager className="h-7" />
          <span className="font-heading text-[15px] font-semibold tracking-tight max-[380px]:hidden">{SITE_CONFIG.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center md:flex">
          <SpacesMenu />
          <Link href="/flows" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Flows
          </Link>
          <Link href="/apps" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            AI Studio
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setAsk(true)}
          className="ml-auto flex h-9 min-w-0 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground md:w-72 lg:w-80"
          aria-label="Ask: search tools and actions"
        >
          <Search className="size-4 shrink-0" />
          <span className="hidden truncate md:inline">What do you need to do?</span>
          <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-px font-mono text-[10px] md:inline">{isMac ? "⌘" : "Ctrl"} K</kbd>
        </button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Open File Tray" onClick={() => setTray(true)}>
            <Inbox className="size-[18px]" />
          </Button>
          <ThemeToggle />
          <div className="hidden md:block">
            {loading ? (
              <div aria-label="Loading account" className="size-8 rounded-full bg-muted motion-safe:animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Button size="sm" variant="outline" className="ml-1" onClick={() => setSignIn(true)}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
      {signInOpen && <SignInDialog open={signInOpen} onOpenChange={setSignIn} />}
    </header>
  );
}
