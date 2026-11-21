"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Inbox, LayoutGrid, Search, UserRound } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { SPACES } from "@/spaces";
import { cn } from "@/lib/utils";
import { SpaceChip } from "./space-glyph";
import { useShell } from "./shell-store";
import { spaceHref } from "./space-links";

/** Mobile bottom navigation (blueprint UX rule 7): Home, Spaces, Ask, Tray, Me. */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { setAsk, setTray, spacesOpen, setSpaces, setSignIn } = useShell();

  const item = "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors active:text-foreground";

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="flex h-[var(--shell-bottom-nav-height)] items-stretch">
          <Link href="/" className={cn(item, pathname === "/" && "text-foreground")} aria-current={pathname === "/" ? "page" : undefined}>
            <Home className="size-5" />
            Home
          </Link>
          <button type="button" className={cn(item, spacesOpen && "text-foreground")} onClick={() => setSpaces(true)}>
            <LayoutGrid className="size-5" />
            Spaces
          </button>
          <button type="button" className={item} onClick={() => setAsk(true)}>
            <span className="-mt-1 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Search className="size-[18px]" />
            </span>
            Ask
          </button>
          <button type="button" className={item} onClick={() => setTray(true)}>
            <Inbox className="size-5" />
            Tray
          </button>
          <button
            type="button"
            className={cn(item, pathname.startsWith("/settings") && "text-foreground")}
            onClick={() => (user ? router.push("/settings") : setSignIn(true))}
          >
            <UserRound className="size-5" />
            Me
          </button>
        </div>
      </nav>

      <Sheet open={spacesOpen} onOpenChange={setSpaces}>
        <SheetContent side="bottom" className="max-h-[80dvh] gap-0 rounded-t-2xl p-0">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle className="font-heading text-lg">Spaces</SheetTitle>
            <SheetDescription>Pick where your job lives.</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-1 gap-1 overflow-y-auto p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] min-[420px]:grid-cols-2">
            {SPACES.map((s) => (
              <Link
                key={s.id}
                href={spaceHref(s.id)}
                onClick={() => setSpaces(false)}
                className="flex min-h-14 items-center gap-3 rounded-lg p-2.5 active:bg-muted"
              >
                <SpaceChip space={s.id} color={s.color} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{s.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{s.tagline}</span>
                </span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
