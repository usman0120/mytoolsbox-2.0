"use client";

import { useAuth } from "@/lib/auth";
import { useCredits } from "@/lib/credits";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Settings,
  Heart,
  Clock,
  Sparkles,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { isAdminIdentity } from "@/lib/auth/admin-policy";

export function UserMenu() {
  const { user, isAnonymous, logOut } = useAuth();
  const { remaining, total, daysRemaining, loading: creditsLoading } = useCredits();
  const router = useRouter();
  const { t, localizePath } = useI18n();

  if (!user) return null;

  const displayName = user.displayName ?? (isAnonymous ? t("auth_guest_title") : "My account");
  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : isAnonymous
      ? "G"
      : user.email?.slice(0, 2).toUpperCase() ?? "U";

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success(t("auth_signout"));
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const percentage = total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Open account menu" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL ?? undefined} alt="Account avatar" />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg">
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold leading-none text-foreground">
              {displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate max-w-[220px]">
              {user.email ?? (isAnonymous ? t("auth_guest_title") : "")}
            </p>
          </div>
        </DropdownMenuLabel>

        {/* AI Credits Card */}
        <div className="my-1.5 rounded-lg border border-border/60 bg-muted/40 p-2.5">
          {isAnonymous ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("auth_guest_title")}</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {t("auth_guest_desc")}
              </p>
              <button
                type="button"
                onClick={() => router.push(localizePath("/settings?tab=account"))}
                className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                {t("auth_signin")} / {t("auth_signup")}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {t("footer_ai_suite")}
                </span>
                <span className="font-semibold text-primary">
                  {creditsLoading ? "..." : `${remaining.toLocaleString()} / ${total.toLocaleString()}`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{t("auth_resets_in").replace("{days}", String(daysRemaining))}</span>
              </div>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push(localizePath("/settings?tab=favorites"))}>
          <Heart className="mr-2 h-4 w-4" />
          {t("auth_favorites")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(localizePath("/settings?tab=history"))}>
          <Clock className="mr-2 h-4 w-4" />
          {t("auth_history")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(localizePath("/settings"))}>
          <Settings className="mr-2 h-4 w-4" />
          {t("auth_settings")}
        </DropdownMenuItem>

        {isAdminIdentity(user) && <DropdownMenuItem onClick={() => router.push(localizePath("/admin"))}>
          <Shield className="mr-2 h-4 w-4" />Admin panel
        </DropdownMenuItem>}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("auth_signout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
