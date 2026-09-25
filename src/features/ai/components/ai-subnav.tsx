"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignInDialog } from "@/components/auth/signin-dialog";
import {
  MessageSquare,
  Lightbulb,
  Cpu,
  Sparkles,
  Coins,
  LogIn,
} from "lucide-react";

interface AISubnavProps {
  title?: string;
  subtitle?: string;
}

export function AISubnav({
  title,
  subtitle,
}: AISubnavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t, localizePath } = useI18n();
  const [showSignIn, setShowSignIn] = useState(false);

  const displayTitle = title ?? t("ai_subnav_title", "AI Intelligence Studio");
  const displaySubtitle = subtitle ?? t("ai_subnav_subtitle", "High-performance AI chat, real-time model comparisons, and curated prompts powered by Google Gemini and Groq.");

  const aiNavItems = [
    {
      href: "/ai",
      label: t("ai_new_chat", "Chat Workspace"),
      icon: MessageSquare,
      badge: null,
    },
    {
      href: "/ai/prompts",
      label: t("ai_prompt_library", "Prompt Library"),
      icon: Lightbulb,
      badge: "160+",
    },
    {
      href: "/ai/compare",
      label: t("ai_compare_models", "Compare Models"),
      icon: Cpu,
      badge: "Arena",
    },
    {
      href: "/ai/personas",
      label: t("ai_personas", "Personas & Tools"),
      icon: Sparkles,
      badge: null,
    },
  ];

  return (
    <div className="space-y-5 mb-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/15 to-purple-500/15 ring-1 ring-violet-500/25 shadow-xs shrink-0">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                {displayTitle}
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border-primary/30 text-primary bg-primary/5"
              >
                {t("ai_subnav_badge", "Production Ready")}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Auth CTA if guest */}
        {!user && (
          <div className="flex items-center gap-2.5 bg-muted/40 border border-border/60 rounded-2xl p-2 px-3 shrink-0 self-start md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span>{t("ai_subnav_free_credits", "Get 1,000 free monthly credits")}</span>
            </div>
            <Button
              size="sm"
              onClick={() => setShowSignIn(true)}
              className="rounded-xl h-7 px-3 text-xs gap-1.5 shadow-xs font-medium"
            >
              <LogIn className="h-3 w-3" />
              {t("auth_signin", "Sign In")}
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Pills */}
      <nav aria-label="AI Navigation" className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/50">
        {aiNavItems.map((item) => {
          const localizedHref = localizePath(item.href);
          const isActive = pathname === item.href || pathname === localizedHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={localizedHref}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign in dialog */}
      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
}
