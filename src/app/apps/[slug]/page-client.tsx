"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield, Zap, Info, Users, Tag, ChevronRight, Heart, Share2,
  Star, Sparkles, Check, Maximize2, Minimize2, ArrowUpRight,
  HelpCircle, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AppEngine } from "@/features/app-engine";
import { ToolDefinition } from "@/types";
import { useAuth } from "@/lib/auth";
import { useCredits } from "@/lib/credits/use-credits";
import { addFavorite, getFavorites, removeFavorite, isFavorited, addHistoryEntry } from "@/lib/firebase/user-service";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import * as Icons from "lucide-react";

interface AppPageClientProps {
  app: ToolDefinition;
}

export function AppPageClient({ app }: AppPageClientProps) {
  const { user } = useAuth();
  const { remaining, refresh } = useCredits();
  const isLow = remaining < 100;
  const [favorited, setFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [historyRecorded, setHistoryRecorded] = useState(false);

  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[app.icon] || Icons.Layout;

  // Check if app is favorited
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    isFavorited(user.uid, app.id)
      .then((fav) => {
        if (!cancelled) setFavorited(fav);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load favorite status");
      });
    return () => { cancelled = true; };
  }, [user, app.id]);

  // Record history entry when app page is opened
  useEffect(() => {
    if (!user || historyRecorded) return;
    addHistoryEntry(user.uid, {
      toolId: app.id,
      toolName: app.name,
      toolSlug: app.slug,
      category: app.category,
      productType: "app",
      action: "viewed",
      details: `Opened ${app.name}`,
    }).then(() => setHistoryRecorded(true));
  }, [user, app, historyRecorded]);

  const handleFavorite = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }
    try {
      if (favorited) {
        const favorites = await getFavorites(user.uid);
        const favorite = favorites.find((item) => item.toolId === app.id);
        if (!favorite) {
          setFavorited(false);
          return;
        }
        await removeFavorite(user.uid, favorite.id);
        setFavorited(false);
        toast.success(`Removed "${app.name}" from favorites`);
        trackEvent("tool_favorited", { toolId: app.id, action: "remove" });
      } else {
        await addFavorite(user.uid, {
          toolId: app.id,
          toolName: app.name,
          toolSlug: app.slug,
          category: app.category,
          productType: "app",
        });
        setFavorited(true);
        toast.success(`Added "${app.name}" to favorites`);
        trackEvent("tool_favorited", { toolId: app.id, action: "add" });
      }
    } catch {
      toast.error("Failed to update favorites");
    }
  }, [user, favorited, app]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: `${app.name} - MyToolsBox`,
      text: `Explore ${app.name} on MyToolsBox: ${app.shortDescription}`,
      url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        trackEvent("tool_shared", { toolId: app.id, method: "native" });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        trackEvent("tool_shared", { toolId: app.id, method: "copy" });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        trackEvent("tool_shared", { toolId: app.id, method: "copy" });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to share");
      }
    }
  }, [app]);

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 bg-background overflow-y-auto p-4 md:p-8" : "container mx-auto px-4 py-8"}`}>
      {/* Top Breadcrumb & Platform Meta */}
      {!isFullscreen && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/apps" className="hover:text-foreground transition-colors">Apps</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate">{app.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
              <Sparkles className="h-3 w-3 text-cyan-500" />
              <span>AI Credits: <strong className={isLow ? "text-amber-500" : "text-cyan-500"}>{remaining}</strong></span>
            </Badge>
          </div>
        </div>
      )}

      {/* Standalone Platform Header Bar */}
      <div className="mb-6 p-4 md:p-6 rounded-2xl bg-card border border-border/60 shadow-xs backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20 shadow-sm shrink-0">
            <IconComponent className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{app.name}</h1>
              <Badge className="text-[10px] gap-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                <Sparkles className="h-3 w-3" />
                Standalone Platform
              </Badge>
              {app.requiresPro && (
                <Badge className="text-[10px] gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  <Star className="h-3 w-3 fill-current" />
                  Pro
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {app.shortDescription || app.description}
            </p>
          </div>
        </div>

        {/* Platform Command Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-9"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio Mode"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Studio" : "Studio Canvas"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={handleFavorite}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={handleShare}
            aria-label="Share this app"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Full-Width Platform Workspace Canvas */}
      <Card className="border-border/60 shadow-sm overflow-hidden mb-8">
        <CardContent className="p-4 md:p-8">
          <AppEngine app={app} />
        </CardContent>
      </Card>

      {/* Platform Specification & Knowledge Hub */}
      {!isFullscreen && (
        <Tabs defaultValue="features" className="w-full space-y-4">
          <TabsList className="grid grid-cols-3 max-w-md h-9 bg-muted/60 p-0.5">
            <TabsTrigger value="features" className="text-xs gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Capabilities
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Architecture
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-xs gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> FAQs
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  Included Platform Features & Tools
                </CardTitle>
                <CardDescription>
                  Comprehensive capabilities built into this standalone platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {app.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border/40 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specs & Architecture Tab */}
          <TabsContent value="specs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 mb-2">
                    <Shield className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">Zero-Leak Local Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Calculations, session tracking, algorithms, and documents are rendered directly in your client browser memory without telemetry tracking.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">Centralized AI Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Optional AI consultations and deep analyses draw from your 1,000 monthly credits with automatic 30-day reset cycles.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">Audience & Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {app.audiences.map((audience) => (
                      <Badge key={audience} variant="secondary" className="text-[10px] capitalize">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faq">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-cyan-500" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.faq.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-card border border-border/40">
                    <h4 className="text-xs font-semibold text-foreground mb-1">{item.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}