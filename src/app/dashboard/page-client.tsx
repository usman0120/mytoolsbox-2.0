"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Heart, Clock, Wrench, Sparkles } from "lucide-react";

export function DashboardPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?signin=true");
    }
  }, [loading, user, router]);

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
      title: "Settings",
      description: "Manage your profile, preferences, and account.",
      icon: Settings,
      href: "/settings",
    },
    {
      title: "Favorites",
      description: "Quick access to your saved tools.",
      icon: Heart,
      href: "/favorites",
    },
    {
      title: "History",
      description: "View your recent tool usage.",
      icon: Clock,
      href: "/history",
    },
    {
      title: "All Tools",
      description: "Browse the complete tools catalog.",
      icon: Wrench,
      href: "/tools",
    },
    {
      title: "AI Chat",
      description: "Chat with AI assistants.",
      icon: Sparkles,
      href: "/ai",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Your MyToolsBox dashboard — access your tools, favorites, and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
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