"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Wrench, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/common/tool-card";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { getActiveTools, searchTools } from "@/content/tools/registry";
import { CATEGORIES } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { VIEW_MODE_LABELS } from "@/lib/i18n/translations";
import * as Icons from "lucide-react";

export function ToolsPageClient() {
  const { t, getToolName, getCategoryName, localizePath, locale } = useI18n();
  const viewLabels = VIEW_MODE_LABELS[locale];
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const allTools = getActiveTools();

  const filteredTools = useMemo(() => {
    let tools = allTools;

    if (searchQuery.trim()) {
      tools = searchTools(searchQuery.trim());
    }

    if (activeCategory) {
      tools = tools.filter((t) => t.category === activeCategory);
    }

    return tools;
  }, [allTools, searchQuery, activeCategory]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCategory);
  const activeCategoryName = activeCategoryObj ? getCategoryName(activeCategoryObj.id, activeCategoryObj.name) : "";

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border/50">
        <span className="text-xs font-bold tracking-widest text-primary uppercase">
          DIRECTORY
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
          All Tools & <span className="font-editorial italic font-normal text-primary">Utilities.</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Explore over 50+ privacy-first tools running client-side in your browser.
        </p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            aria-label={t("tools_search_placeholder", "Search tools...")}
            placeholder={t("tools_search_placeholder", "Search tools...")}
            className="pl-10 pr-12 h-11 rounded-xl border-border/70 focus-visible:ring-primary/30 bg-background text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              aria-label={t("action_clear_all", "Clear search")}
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            aria-label={viewLabels.grid}
            title={viewLabels.grid}
            aria-pressed={viewMode === "grid"}
            className="h-11 w-11 rounded-xl border-border/70"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            aria-label={viewLabels.list}
            title={viewLabels.list}
            aria-pressed={viewMode === "list"}
            className="h-11 w-11 rounded-xl border-border/70"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-1.5 mb-6" role="group" aria-label={t("tools_all_categories", "Categories")}>
        <button
          aria-pressed={activeCategory === ""}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border ${
            activeCategory === ""
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border/70 hover:bg-muted/50 hover:text-foreground"
          }`}
          onClick={() => setActiveCategory("")}
        >
          {t("tools_all_categories", "All Categories")}
        </button>
        {CATEGORIES.map((cat) => {
          const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[cat.icon] || Icons.Folder;
          const count = allTools.filter((t) => t.category === cat.id).length;
          const localizedName = getCategoryName(cat.id, cat.name);
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border/70 hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => setActiveCategory(isSelected ? "" : cat.id)}
            >
              <IconComponent className="h-3 w-3" />
              <span>{localizedName}</span>
              <span className={`text-[10px] ${isSelected ? "opacity-80" : "opacity-50"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Active filter indicator */}
      {activeCategory && activeCategoryName && (
        <div className="flex items-center gap-2 mb-5 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t("tools_filtered_by", "Filtered by:")}</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border/60">
            {activeCategoryName}
            <button aria-label={t("action_clear_all", "Clear category filter")} onClick={() => setActiveCategory("")} className="hover:text-primary transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
          <span className="text-muted-foreground ml-auto">
            {filteredTools.length} {t("tools_results_count", "results")}
          </span>
        </div>
      )}

      {/* Results */}
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" role="status">
        {filteredTools.length} {t("tools_results_count", "tools available")}
      </p>
      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 rounded-2xl border border-dashed border-border/80 bg-card/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
            <Search className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-foreground">{t("tools_no_results", "No tools found")}</p>
          <p className="text-xs text-muted-foreground max-w-sm text-center">Try a different search term or category filter</p>
          <Button
            variant="outline"
            className="rounded-xl mt-2 text-xs"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("");
            }}
          >
            {t("action_clear_all", "Clear all filters")}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredTools.map((tool) => {
            const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] || Icons.Wrench;
            const localizedToolName = getToolName(tool.slug, tool.name);
            const localizedCatName = getCategoryName(tool.category, tool.category);
            return (
              <Link
                key={tool.id}
                href={localizePath(`/${tool.productType}s/${tool.slug}`)}
                className="group flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                  <IconComponent className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{localizedToolName}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{tool.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60 capitalize">
                    {localizedCatName}
                  </span>
                  {tool.status === "beta" && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/60">
                      Beta
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}