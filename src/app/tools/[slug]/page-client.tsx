"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Zap,
  Info,
  Clock,
  Users,
  Tag,
  ChevronRight,
  Star,
  Heart,
  Share2,
  Check,
  Copy,
  Code2,
  Sparkles,
  Lock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Download,
  Upload,
  Globe,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToolCard } from "@/components/common/tool-card";
import { ToolEngine } from "@/features/tool-engine";
import { ToolDefinition } from "@/types";
import { getToolBySlug, getToolsByCategory } from "@/content/tools/registry";
import { SITE_CONFIG } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { addFavorite, getFavorites, removeFavorite, isFavorited, addHistoryEntry } from "@/lib/firebase/user-service";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ToolPageClientProps {
  tool: ToolDefinition;
}

export function ToolPageClient({ tool }: ToolPageClientProps) {
  const { user } = useAuth();
  const { t, getToolName, getCategoryName, localizePath } = useI18n();
  const localizedName = getToolName(tool.slug, tool.name);
  const [favorited, setFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [historyRecorded, setHistoryRecorded] = useState(false);

  const IconComponent =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] ||
    Icons.Wrench;

  // Resolve related sibling tools safely
  const relatedTools = useMemo(() => {
    if (!tool.relatedTools || tool.relatedTools.length === 0) {
      return getToolsByCategory(tool.category)
        .filter((t) => t.slug !== tool.slug)
        .slice(0, 4);
    }
    const resolved = tool.relatedTools
      .map((slug) => getToolBySlug(slug))
      .filter(Boolean) as ToolDefinition[];
    if (resolved.length < 3) {
      const categorySiblings = getToolsByCategory(tool.category).filter(
        (t) => t.slug !== tool.slug && !resolved.some((r) => r.slug === t.slug)
      );
      return [...resolved, ...categorySiblings].slice(0, 4);
    }
    return resolved;
  }, [tool]);

  // Check favorite status
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    isFavorited(user.uid, tool.id)
      .then((fav) => {
        if (!cancelled) setFavorited(fav);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load favorite status");
      });
    return () => {
      cancelled = true;
    };
  }, [user, tool.id]);

  // Record history entry
  useEffect(() => {
    if (!user || historyRecorded) return;
    addHistoryEntry(user.uid, {
      toolId: tool.id,
      toolName: tool.name,
      toolSlug: tool.slug,
      category: tool.category,
      productType: "tool",
      action: "viewed",
      details: `Opened ${tool.name}`,
    }).then(() => setHistoryRecorded(true));
  }, [user, tool, historyRecorded]);

  const handleFavorite = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }
    try {
      if (favorited) {
        const favorites = await getFavorites(user.uid);
        const favorite = favorites.find((item) => item.toolId === tool.id);
        if (!favorite) {
          setFavorited(false);
          return;
        }
        await removeFavorite(user.uid, favorite.id);
        setFavorited(false);
        toast.success(`Removed "${tool.name}" from favorites`);
        trackEvent("tool_favorited", { toolId: tool.id, action: "remove" });
      } else {
        await addFavorite(user.uid, {
          toolId: tool.id,
          toolName: tool.name,
          toolSlug: tool.slug,
          category: tool.category,
          productType: "tool",
        });
        setFavorited(true);
        toast.success(`Added "${tool.name}" to favorites`);
        trackEvent("tool_favorited", { toolId: tool.id, action: "add" });
      }
    } catch {
      toast.error("Failed to update favorites");
    }
  }, [user, favorited, tool]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : `${SITE_CONFIG.url}/tools/${tool.slug}`;
    const shareData = {
      title: `${tool.name} - MyToolsBox`,
      text: `Try ${tool.name} for free on MyToolsBox: ${tool.shortDescription}`,
      url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        trackEvent("tool_shared", { toolId: tool.id, method: "native" });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        trackEvent("tool_shared", { toolId: tool.id, method: "copy" });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        trackEvent("tool_shared", { toolId: tool.id, method: "copy" });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to share");
      }
    }
  }, [tool]);

  const embedCode = `<iframe src="${SITE_CONFIG.url}/tools/${tool.slug}" width="100%" height="650" style="border:1px solid #cbd5e1;border-radius:12px;" title="${tool.name} - MyToolsBox"></iframe>\n<p style="font-size:12px;color:#64748b;margin-top:6px;">Powered by <a href="${SITE_CONFIG.url}/tools/${tool.slug}" target="_blank" rel="noopener">MyToolsBox Free Online Tools</a></p>`;

  const copyEmbedSnippet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      toast.success("Embed HTML code copied!");
      setTimeout(() => setEmbedCopied(false), 2500);
    } catch {
      toast.error("Failed to copy embed code");
    }
  }, [embedCode]);

  // Category title display helper
  const localizedCategoryTitle = getCategoryName(
    tool.category,
    tool.category.charAt(0).toUpperCase() + tool.category.slice(1)
  );
  const categoryTitle = localizedCategoryTitle;

  // Default fallback FAQs for E-E-A-T trust if tool has fewer than 2
  const displayFaqs = useMemo(() => {
    const list = [...(tool.faq || [])];
    if (list.length < 2) {
      list.push({
        question: `Is ${tool.name} completely free to use?`,
        answer: `Yes, ${tool.name} on MyToolsBox is 100% free with no hidden subscriptions, watermarks, or account registration needed.`,
      });
      list.push({
        question: "Are my files or sensitive data safe?",
        answer: `${tool.name} operates entirely within your web browser sandbox. Your data is processed in local client memory and is never uploaded or saved to any external servers.`,
      });
    }
    return list;
  }, [tool]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 1. Hierarchical Silo Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 animate-fade-in-up">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <li>
            <Link href={localizePath("/")} className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link href={localizePath("/tools")} className="hover:text-foreground transition-colors">
              {t("nav_tools", "Tools")}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link
              href={localizePath(`/tools?category=${tool.category}`)}
              className="hover:text-foreground capitalize transition-colors"
            >
              {localizedCategoryTitle}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="text-foreground font-medium truncate" aria-current="page">
            {localizedName}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* 1. H1 Header + Targeted Keyword + Privacy Badges */}
          <div className="animate-fade-in-up space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shadow-sm shrink-0">
                <IconComponent className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                  {localizedName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <Badge variant="secondary" className="text-xs font-semibold capitalize rounded-full">
                    {tool.category}
                  </Badge>

                  {tool.processingMode === "client" && (
                    <Badge
                      variant="outline"
                      className="text-xs gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      {t("badge_client_side")}
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className="text-xs gap-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {t("badge_instant")}
                  </Badge>

                  {tool.requiresPro && (
                    <Badge className="text-xs gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      <Star className="h-3 w-3 fill-current" />
                      Pro
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-border/60 hover:bg-accent/80"
                  onClick={handleFavorite}
                  aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                  title={favorited ? "Remove favorite" : "Save favorite"}
                >
                  <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-border/60 hover:bg-accent/80"
                  onClick={handleShare}
                  aria-label="Share this tool"
                  title="Share tool"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* 2. Above-the-fold Interactive Tool Engine */}
          <section aria-label={`${tool.name} Workspace`}>
            <Card className="border-border/60 shadow-xs overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <ToolEngine tool={tool} />
              </CardContent>
            </Card>
          </section>

          {/* 3. Numbered Tutorial: "How to use in 3 Easy Steps" */}
          <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                {t("how_to_use_title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/60 relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      1
                    </span>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{t("step_1_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t("step_1_desc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/60 relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      2
                    </span>
                    <Sliders className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{t("step_2_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t("step_2_desc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/60 relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      3
                    </span>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{t("step_3_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t("step_3_desc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 4. Key Features & Benefits */}
          <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                {t("features_title")}
              </h2>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {tool.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm p-2.5 rounded-lg bg-accent/25 hover:bg-accent/40 transition-colors"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-foreground font-medium">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-sm p-2.5 rounded-lg bg-accent/25 hover:bg-accent/40 transition-colors">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-foreground font-medium">No account or signup required</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm p-2.5 rounded-lg bg-accent/25 hover:bg-accent/40 transition-colors">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-foreground font-medium">Unlimited free executions & zero watermarks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 5. Common Use Cases */}
          <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Who Uses {tool.name}?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Sparkles className="h-4 w-4" /> Students & Academics
                  </div>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Easily format coursework, prepare submissions, and complete research assignments quickly without downloading bloated desktop apps.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Code2 className="h-4 w-4" /> Developers & Engineers
                  </div>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Fast syntax processing, format verification, and local execution with instant feedback right from your browser console.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <FileCheck className="h-4 w-4" /> Business & Office Teams
                  </div>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Process contracts, invoices, and sensitive documents securely with complete compliance and zero risk of corporate data leaks.
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Globe className="h-4 w-4" /> Daily Problem Solvers
                  </div>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Anyone who needs a dependable, ad-light utility to get tasks done immediately without subscriptions or hidden paywalls.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 6. Why Client-Side Privacy Matters (E-E-A-T Trust Section) */}
          <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Card className="border-emerald-500/20 bg-linear-to-br from-emerald-500/5 via-card to-card overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl">
                      {t("privacy_title")}
                    </CardTitle>
                    <CardDescription>
                      {t("privacy_subtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  {t("privacy_p1")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                    <div className="font-semibold text-foreground text-xs mb-1">{t("badge_no_upload")}</div>
                    <div className="text-xs">Your files never touch an external hard drive or cloud database.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                    <div className="font-semibold text-foreground text-xs mb-1">{t("badge_instant")}</div>
                    <div className="text-xs">No upload queuing or server throttling — execution runs at CPU speed.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                    <div className="font-semibold text-foreground text-xs mb-1">{t("badge_private")}</div>
                    <div className="text-xs">Strict compliance since zero personally identifiable data is captured.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 7. Frequently Asked Questions (PAA Snippets) */}
          {displayFaqs.length > 0 && (
            <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  {t("faq_title")}
                </h2>
              </div>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  {displayFaqs.map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <h3 className="font-semibold text-base text-foreground flex items-start gap-2">
                        <span className="text-primary font-bold">Q:</span>
                        {item.question}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                        {item.answer}
                      </p>
                      {i < displayFaqs.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* Sidebar / Contextual Silo Linking & Embed Widget */}
        <aside className="space-y-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          {/* About & Trust Indicators */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tool Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs">
                    {tool.processingMode === "client" ? "100% In-Browser" : "Cloud Powered"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tool.processingMode === "client"
                      ? "Files never leave this computer"
                      : "Encrypted server execution"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-xs">No Registration</p>
                  <p className="text-xs text-muted-foreground">Instant access without logging in</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <Link
                    href={localizePath(`/tools?category=${tool.category}`)}
                    className="font-semibold text-xs capitalize hover:text-primary transition-colors block"
                  >
                    {localizedCategoryTitle} Cluster
                  </Link>
                  <p className="text-xs text-muted-foreground">View all category utilities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embed on Your Website (High Authority Backlink Driver) */}
          <Card className="border-border/50 bg-accent/15">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                {t("embed_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("embed_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <pre className="p-2.5 rounded-lg bg-background text-[11px] font-mono text-muted-foreground overflow-x-auto border border-border/50 max-h-24">
                  {embedCode}
                </pre>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs font-semibold"
                onClick={copyEmbedSnippet}
              >
                {embedCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    {t("action_copied")}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {t("embed_copy_btn")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sibling Related Tools (Topic Silo) */}
          {relatedTools.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("related_tools_title", `Related ${categoryTitle} Tools`)}</CardTitle>
                <Link
                  href={localizePath(`/tools?category=${tool.category}`)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {t("action_all_tools", "View All")}
                </Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {relatedTools.map((rt) => (
                  <ToolCard key={rt.id} tool={rt} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Category Pillar Hub Link */}
          <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 space-y-2 text-center">
              <p className="font-semibold text-sm">Looking for more {categoryTitle} solutions?</p>
              <p className="text-xs text-muted-foreground">
                Browse our curated directory of browser-powered tools and apps.
              </p>
              <Link href={localizePath(`/tools?category=${tool.category}`)} className="block pt-1">
                <Button size="sm" variant="default" className="w-full text-xs font-medium">
                  Explore {categoryTitle} Hub <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}