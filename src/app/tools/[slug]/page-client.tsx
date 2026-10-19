"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  Heart,
  Share2,
  Check,
  Copy,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpDisclosure, ToolHeader } from "@/components/common/workload-layouts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      text: `${tool.name}: ${tool.shortDescription}`,
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

  const embedTitle = `${tool.name} - MyToolsBox`.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
  const embedCode = `<iframe src="${SITE_CONFIG.url}/tools/${tool.slug}" width="100%" height="650" style="border:0;" title="${embedTitle}"></iframe>\n<p>Powered by <a href="${SITE_CONFIG.url}/tools/${tool.slug}" target="_blank" rel="noopener">MyToolsBox</a></p>`;

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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
      {/* 1. Hierarchical Silo Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3">
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

      <ToolHeader
        title={localizedName}
        icon={<IconComponent className="h-5 w-5" />}
        badges={tool.requiresPro ? (
          <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
            <Star className="h-3 w-3" /> Pro
          </Badge>
        ) : undefined}
        actions={
          <>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/70 hover:bg-muted/50" onClick={handleFavorite}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorited} title={favorited ? "Remove favorite" : "Save favorite"}>
              <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/70 hover:bg-muted/50" onClick={handleShare}
              aria-label="Share this tool" title="Share tool">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
            </Button>
            <Dialog>
              <DialogTrigger render={<Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/70 hover:bg-muted/50" />}
                aria-label="Embed this tool" title="Embed tool">
                <Code2 className="h-4 w-4" />
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("embed_title")}</DialogTitle>
                  <DialogDescription>{t("embed_desc")}</DialogDescription>
                </DialogHeader>
                <pre className="max-h-48 max-w-full overflow-auto rounded-xl border bg-muted/20 p-3 text-xs font-mono whitespace-pre-wrap break-all">{embedCode}</pre>
                <Button variant="outline" onClick={copyEmbedSnippet} className="gap-2 rounded-xl">
                  {embedCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  {embedCopied ? t("action_copied") : t("embed_copy_btn")}
                </Button>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <section aria-label={`${localizedName} Workspace`} className="workspace min-w-0">
        <ToolEngine tool={tool} />
      </section>

      {tool.faq && tool.faq.length > 0 && (
        <HelpDisclosure title={t("faq_title")}>
          <dl className="divide-y divide-border/50">
            {tool.faq.map((item) => (
              <div key={item.question} className="py-3 first:pt-0 last:pb-0">
                <dt className="font-semibold text-foreground wrap-break-word">{item.question}</dt>
                <dd className="mt-1 text-muted-foreground wrap-break-word leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </HelpDisclosure>
      )}

      {relatedTools.length > 0 && (
        <nav aria-label={t("related_tools_title", "Related tools")} className="mt-5 border-t py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <h2 className="font-medium">{t("related_tools_title", "Related tools")}</h2>
            {relatedTools.map((related) => (
              <Link key={related.id} href={localizePath(`/tools/${related.slug}`)} className="text-primary hover:underline wrap-break-word">
                {getToolName(related.slug, related.name)}
              </Link>
            ))}
            <Link href={localizePath(`/tools?category=${tool.category}`)} className="text-muted-foreground hover:underline">
              {t("action_all_tools", "View All")}
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}