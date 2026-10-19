"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { Loader2, Settings, Heart, Clock, Wrench, Sparkles } from "lucide-react";

export function DashboardPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t, localizePath } = useI18n();

  useEffect(() => {
    if (!loading && !user) {
      router.push(localizePath("/?signin=true"));
    }
  }, [loading, user, router, localizePath]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const cards = [
    {
      title: t("dash_settings_title", "Settings"),
      description: t("dash_settings_desc", "Manage your profile, preferences, and account security."),
      icon: Settings,
      href: "/settings",
    },
    {
      title: t("dash_favorites_title", "Favorites"),
      description: t("dash_favorites_desc", "Quick access to your saved tools and apps."),
      icon: Heart,
      href: "/favorites",
    },
    {
      title: t("dash_history_title", "History"),
      description: t("dash_history_desc", "View your recent tool usage and past activities."),
      icon: Clock,
      href: "/history",
    },
    {
      title: t("dash_all_tools_title", "All Tools"),
      description: t("dash_all_tools_desc", "Browse our complete catalog of 130+ privacy-first tools."),
      icon: Wrench,
      href: "/tools",
    },
    {
      title: t("dash_ai_title", "AI Studio"),
      description: t("dash_ai_desc", "Chat with AI assistants, compare models, and browse curated prompts."),
      icon: Sparkles,
      href: "/ai",
    },
  ];

  return (
    <PageShell className="max-w-3xl">
      <ToolHeader title={`${t("dash_welcome", "Welcome")}${user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}`} />

      <div className="divide-y border-y">
        {cards.map((card) => (
          <Link key={card.href} href={localizePath(card.href)} className="flex items-start gap-3 py-4 hover:text-primary">
            <card.icon className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-medium">{card.title}</h2>
              {card.href !== "/tools" && <p className="text-sm text-muted-foreground">{card.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}