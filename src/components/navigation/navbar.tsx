"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, ChevronDown, ArrowUpRight, GitBranch } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NAV_MENUS } from "@/lib/navigation/menus";
import { SITE_CONFIG } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SearchCommand } from "@/components/common/search-command";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const SignInDialog = dynamic(() => import("@/components/auth/signin-dialog").then((module) => module.SignInDialog), { loading: () => <p role="status" className="fixed inset-x-4 top-24 z-50 mx-auto max-w-sm rounded-xl border bg-background p-5 text-center text-sm shadow-lg">Opening sign-in…</p> });

export function Navbar() {
  const pathname = usePathname(), params = useSearchParams();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false), [signInOpen, setSignInOpen] = useState(false), [requested, setRequested] = useState(false), [scrolled, setScrolled] = useState(false);
  const signInRequested = params.get("signin") === "true";
  if (signInRequested !== requested) { setRequested(signInRequested); if (signInRequested) setSignInOpen(true); }
  useEffect(() => { const scroll = () => setScrolled(window.scrollY > 8); window.addEventListener("scroll", scroll, { passive: true }); return () => window.removeEventListener("scroll", scroll); }, []);
  return <header className={cn("sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl", scrolled && "shadow-sm")}>
    <div className="mx-auto flex h-[var(--shell-header-height)] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <Link href="/" aria-label="MyToolsBox home" className="flex shrink-0 items-center gap-2.5"><BrandLogo eager className="h-9" /><span className="hidden text-[15px] font-semibold tracking-tight sm:block">{SITE_CONFIG.name}</span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">{NAV_MENUS.map((menu) => {
        const active = pathname === menu.href || pathname.startsWith(menu.href + "/");
        return <DropdownMenu key={menu.label}><DropdownMenuTrigger className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary", active ? "font-semibold text-primary" : "text-muted-foreground")}>
          {menu.label === "Workflows" && <GitBranch className="size-3.5" />}{menu.label}<ChevronDown className="size-3" />
        </DropdownMenuTrigger><DropdownMenuContent align="center" className="w-[min(720px,calc(100vw-2rem))] rounded-2xl p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between border-b pb-4"><div><p className="text-base font-semibold">{menu.label}</p><p className="mt-1 text-xs text-muted-foreground">{menu.label === "Workflows" ? "Connect local tools. Upload once. Download the result." : menu.label === "Apps" ? "Dedicated workspaces, including AI Chat." : menu.label === "Tools" ? "Focused utilities for everyday tasks." : "Guides, resources and workspaces for your role."}</p></div><DropdownMenuItem render={<Link href={menu.href} />} className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium text-primary">Explore<ArrowUpRight className="size-3.5" /></DropdownMenuItem></div>
          <div className="grid gap-6 sm:grid-cols-2">{menu.sections.map((section) => <div key={section.title}><h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>{section.links.map((link) => <DropdownMenuItem key={link.href} render={<Link href={link.href} />} className="cursor-pointer rounded-lg px-3 py-2 text-sm">{link.label}<ArrowUpRight className="ml-auto size-3 text-muted-foreground" /></DropdownMenuItem>)}</div>)}</div>
        </DropdownMenuContent></DropdownMenu>;
      })}</nav>
      <div className="flex items-center gap-2"><div className="hidden sm:block"><SearchCommand variant="navbar" /></div><ThemeToggle /><div className="hidden sm:block">{loading ? <div aria-label="Loading account" className="size-8 rounded-full bg-muted motion-safe:animate-pulse" /> : user ? <UserMenu /> : <Button variant="outline" size="sm" onClick={() => setSignInOpen(true)}>Sign in</Button>}</div>
        <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Open navigation menu" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></Button>
      </div>
    </div>
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="right" className="w-[360px] max-w-full overflow-y-auto"><SheetHeader><SheetTitle><span className="flex items-center gap-2"><BrandLogo className="h-8" />MyToolsBox</span></SheetTitle></SheetHeader><nav aria-label="Mobile navigation" className="space-y-5 px-4 pb-6"><SearchCommand variant="navbar" />{NAV_MENUS.map((menu) => <section key={menu.label}><h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">{menu.label}</h3><Link onClick={() => setMobileOpen(false)} href={menu.href} className="mb-2 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold">Explore {menu.label}<ArrowUpRight className="size-4" /></Link>{menu.sections.flatMap((section) => section.links).slice(0, 6).map((link) => <Link key={link.href} onClick={() => setMobileOpen(false)} href={link.href} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">{link.label}</Link>)}</section>)}<div className="border-t pt-4">{user ? <Link href="/settings" onClick={() => setMobileOpen(false)} className="block rounded-xl border p-3 text-sm">Account & settings</Link> : <Button className="w-full" onClick={() => { setMobileOpen(false); setSignInOpen(true); }}>Sign in</Button>}</div></nav></SheetContent></Sheet>
    {signInOpen && <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />}
  </header>;
}
