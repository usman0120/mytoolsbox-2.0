"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { SignInDialog } from "@/components/auth/signin-dialog";
import {
  MessageSquare,
  Lightbulb,
  Cpu,
  Sparkles,
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

  const displayTitle = title ?? t("nav_ai", "AI");

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
      badge: null,
    },
    {
      href: "/ai/compare",
      label: t("ai_compare_models", "Compare Models"),
      icon: Cpu,
      badge: null,
    },
    {
      href: "/ai/personas",
      label: t("ai_personas", "Personas & Tools"),
      icon: Sparkles,
      badge: null,
    },
  ];

  return (
    <div className="space-y-3 mb-4">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">
                {displayTitle}
              </h1>
            </div>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>

        {/* Auth CTA if guest */}
        {!user && (
          <div className="shrink-0 self-start md:self-auto">
            <Button
              size="sm"
              onClick={() => setShowSignIn(true)}
              className="rounded-md h-9 px-3 text-sm gap-1.5"
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
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
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
