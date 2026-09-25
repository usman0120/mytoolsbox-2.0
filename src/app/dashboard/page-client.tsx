"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("dash_welcome", "Welcome")}{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          {t("dash_subtitle", "Your MyToolsBox dashboard — access your tools, favorites, and settings.")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={localizePath(card.href)}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <card.icon className="h-5 w-5 text-primary mb-1" />
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}