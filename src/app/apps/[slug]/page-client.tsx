"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Shield, Zap, Users, ChevronRight, Heart, Share2,
  Star, Sparkles, Check, Maximize2, Minimize2, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppEngine } from "@/features/app-engine";
import { ToolDefinition } from "@/types";
import { useAuth } from "@/lib/auth";
import { addFavorite, getFavorites, removeFavorite, isFavorited, addHistoryEntry } from "@/lib/firebase/user-service";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";

interface AppPageClientProps {
  app: ToolDefinition;
}

export function AppPageClient({ app }: AppPageClientProps) {
  const { t, toolName: getToolName } = UI_COPY;
  const displayName = getToolName(app.slug, app.name);
  const { user } = useAuth();
  const [favoriteStatus, setFavoriteStatus] = useState<{ uid: string; appId: string; value: boolean } | null>(null);
  const favorited = favoriteStatus?.uid === user?.uid && favoriteStatus?.appId === app.id ? favoriteStatus.value : false;
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const historyRecorded = useRef(new Set<string>());
  const workspaceRef = useRef<HTMLDivElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isFullscreen) return;
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const hidden: { element: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement = workspace;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement && !sibling.inert) {
          hidden.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    document.body.style.overflow = "hidden";
    fullscreenButtonRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        setIsFullscreen(false);
      }
      if (event.key !== "Tab" || event.defaultPrevented) return;
      const focusable = Array.from(workspace.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex="0"], iframe'))
        .filter((element) => !element.hasAttribute("disabled") && element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      hidden.forEach(({ element, inert }) => { element.inert = inert; });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isFullscreen]);

  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[app.icon] || Icons.Layout;

  // Check if app is favorited
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    isFavorited(user.uid, app.id)
      .then((fav) => {
        if (!cancelled) setFavoriteStatus({ uid: user.uid, appId: app.id, value: fav });
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load favorite status");
      });
    return () => { cancelled = true; };
  }, [user, app.id]);

  // Record history entry when app page is opened
  useEffect(() => {
    if (!user) return;
    const historyKey = `${user.uid}:${app.id}`;
    if (historyRecorded.current.has(historyKey)) return;
    historyRecorded.current.add(historyKey);
    addHistoryEntry(user.uid, {
      toolId: app.id,
      toolName: app.name,
      toolSlug: app.slug,
      category: app.category,
      productType: "app",
      action: "viewed",
      details: `Opened ${app.name}`,
    }).catch(() => {
      historyRecorded.current.delete(historyKey);
      toast.error("Failed to record app history");
    });
  }, [user, app]);

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
          setFavoriteStatus({ uid: user.uid, appId: app.id, value: false });
          return;
        }
        await removeFavorite(user.uid, favorite.id);
        setFavoriteStatus({ uid: user.uid, appId: app.id, value: false });
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
        setFavoriteStatus({ uid: user.uid, appId: app.id, value: true });
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
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
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
    <div ref={workspaceRef} role={isFullscreen ? "dialog" : undefined} aria-modal={isFullscreen || undefined} aria-label={isFullscreen ? displayName : undefined} className={isFullscreen ? "fixed inset-0 z-50 bg-background overflow-y-auto p-3 md:p-4" : "w-full min-w-0 px-3 py-4 md:px-4"}>
      {/* Top Breadcrumb & Platform Meta */}
      {!isFullscreen && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/apps" className="hover:text-foreground transition-colors">{t("nav_apps")}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate">{displayName}</span>
          </div>
        </div>
      )}

      {/* Standalone Platform Header Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="shrink-0">
            <IconComponent className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold wrap-break-word">{displayName}</h1>
              {app.requiresPro && (
                <Badge className="text-[10px] gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  <Star className="h-3 w-3 fill-current" />
                  {t("badge_pro")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Platform Command Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <Button
            ref={fullscreenButtonRef}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? t("badge_exit_studio") : t("badge_studio_mode")}
            aria-label={isFullscreen ? t("badge_exit_studio") : t("badge_studio_mode")}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={handleFavorite}
            aria-label={favorited ? t("fav_remove") : t("action_favorite")}
            aria-pressed={favorited}
            title={favorited ? t("fav_remove") : t("action_favorite")}
          >
            <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={handleShare}
            aria-label={t("action_share")}
            title={t("action_share")}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Full-Width Platform Workspace Canvas */}
      <section aria-label={displayName} className="min-w-0 mb-6">
          <AppEngine app={app} />
      </section>

      {/* Platform Specification & Knowledge Hub */}
      {!isFullscreen && (
        <details className="border-t border-border/60 pt-3">
        <summary className="cursor-pointer text-sm font-medium">Details</summary>
        <Tabs defaultValue="features" className="w-full space-y-3 mt-3">
          <TabsList className="grid grid-cols-3 max-w-md h-9 bg-muted/60 p-0.5">
            <TabsTrigger value="features" className="text-xs gap-1.5">
              <Zap className="h-3.5 w-3.5" /> {t("apps_capabilities")}
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs gap-1.5">
              <Shield className="h-3.5 w-3.5" /> {t("apps_architecture")}
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-xs gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> {t("apps_faqs")}
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features">
            <section>
              <header className="pb-3">
                <h2 className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  {t("apps_features_title")}
                </h2>
              </header>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {app.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 py-2"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Specs & Architecture Tab */}
          <TabsContent value="specs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <section>
                <header className="pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 mb-2">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm">{t("status_processing", "Processing")}</h2>
                </header>
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {app.processingMode}
                  </p>
                </div>
              </section>

              <section>
                <header className="pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm">{t("apps_architecture")}</h2>
                </header>
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {app.shortDescription}
                  </p>
                </div>
              </section>

              <section>
                <header className="pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm">{t("apps_audience_title")}</h2>
                </header>
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {app.audiences.map((audience) => (
                      <Badge key={audience} variant="secondary" className="text-[10px] capitalize">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faq">
            <section>
              <header className="pb-3">
                <h2 className="text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-cyan-500" />
                  {t("faq_title")}
                </h2>
              </header>
              <div className="space-y-3">
                {app.faq.map((item, idx) => (
                  <div key={idx} className="py-2">
                    <h4 className="text-xs font-semibold text-foreground mb-1">{item.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
        </details>
      )}
    </div>
  );
}
