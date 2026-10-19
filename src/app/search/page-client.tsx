"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Wrench,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { searchTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import { ToolDefinition } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

type FilterType = "all" | "tool" | "app";

export function SearchPageClient() {
  const { t, getToolName, getCategoryName, localizePath } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];

    const tools = searchTools(query);
    const apps = getActiveApps().filter((app) => {
      const q = query.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.shortDescription.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.keywords.some((k) => k.includes(q)) ||
        app.category.includes(q)
      );
    });

    let combined: { type: "tool" | "app"; item: ToolDefinition }[] = [
      ...tools.map((t) => ({ type: "tool" as const, item: t })),
      ...apps.map((a) => ({ type: "app" as const, item: a })),
    ];

    // Deduplicate
    const seen = new Set<string>();
    combined = combined.filter((r) => {
      const key = `${r.type}:${r.item.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter by type
    if (filter === "tool") combined = combined.filter((r) => r.type === "tool");
    if (filter === "app") combined = combined.filter((r) => r.type === "app");

    // Filter by category
    if (selectedCategory !== "all") {
      combined = combined.filter((r) => r.item.category === selectedCategory);
    }

    return combined;
  }, [query, filter, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(localizePath(`/search?q=${encodeURIComponent(query.trim())}`));
    }
  };

  const clearFilters = () => {
    setFilter("all");
    setSelectedCategory("all");
  };

  const hasActiveFilters = filter !== "all" || selectedCategory !== "all";

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href={localizePath("/")} className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{t("search_title", "Search")}</span>
        </div>
      </div>

      {/* Search header */}
      <ToolHeader title={t("search_title", "Search Tools & Apps")} />

      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-6 animate-fade-in-up">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            aria-label={t("search_title", "Search Tools & Apps")}
            placeholder={t("search_placeholder", "What do you need to do? Compress a PDF, solve math, edit image...")}
            className="pl-10 h-11 text-base rounded-md focus-visible:border-primary/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-1.5 bg-muted rounded-lg p-1">
          {(["all", "tool", "app"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? t("search_all", "All") : f === "tool" ? t("search_tools_tab", "Tools") : t("search_apps_tab", "Apps")}
            </button>
          ))}
        </div>
        <select
          aria-label={t("tools_all_categories", "Category")}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-8 px-2.5 text-xs rounded-lg border bg-muted text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="all">{t("tools_all_categories", "All categories")}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{getCategoryName(cat.id, cat.name)}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            {t("action_clear_all", "Clear")}
          </button>
        )}
      </div>

      {/* Results */}
      {query.trim().length >= 2 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4 animate-fade-in-up">
            {results.length} {t("tools_results_count", "results")} for &quot;{query}&quot;
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((result, i) => {
                const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[result.item.icon] || Wrench;
                const href = result.type === "tool" ? `/tools/${result.item.slug}` : `/apps/${result.item.slug}`;
                const displayName = result.type === "tool" ? getToolName(result.item.slug, result.item.name) : result.item.name;
                const localizedCat = getCategoryName(result.item.category, result.item.category);
                return (
                  <Link key={`${result.type}:${result.item.slug}`} href={localizePath(href)}>
                    <Card
                      className="group h-full rounded-lg border-border/50 hover:border-primary/30 overflow-hidden"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-md shrink-0",
                              result.type === "app"
                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-sm group-hover:text-primary transition-colors wrap-break-word">
                                {displayName}
                              </h3>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 rounded-full shrink-0",
                                  result.type === "app" && "border-violet-500/30 text-violet-600 dark:text-violet-400"
                                )}
                              >
                                {result.type === "app" ? "App" : "Tool"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {result.item.shortDescription}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] capitalize shrink-0 hidden sm:inline-flex">
                            {localizedCat}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in-up">
              <p className="text-lg font-medium mb-1">{t("search_no_results", "No results found")}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("search_try_again", "Try searching for something else.")}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground animate-fade-in-up">
          <p className="text-sm">Type at least 2 characters to search across all tools and apps.</p>
        </div>
      )}
    </PageShell>
  );
}