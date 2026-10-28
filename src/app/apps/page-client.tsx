"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { Layout, Search, X, ArrowRight, Grid3X3, List } from "lucide-react";
import { getActiveApps } from "@/content/apps/registry";
import { UI_COPY } from "@/lib/ui-copy";
import * as Icons from "lucide-react";

export function AppsPageClient() {
  const { t, categoryName: getCategoryName } = UI_COPY;
  const viewLabels = { grid: "Grid view", list: "List view" };
  const apps = getActiveApps();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredApps = searchQuery.trim()
    ? apps.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : apps;

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border/50">
        <span className="text-xs font-bold tracking-widest text-primary uppercase">
          WEB APPLICATIONS
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
          Standalone Apps & <span className="font-editorial italic font-normal text-primary">Workspaces.</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Full-fidelity standalone productivity tools that execute completely in your browser.
        </p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            aria-label={t("apps_search_placeholder", "Search apps...")}
            placeholder={t("apps_search_placeholder", "Search apps...")}
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
            className="h-11 w-11 rounded-xl border-border/70"
            aria-label={viewLabels.grid}
            title={viewLabels.grid}
            aria-pressed={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="h-11 w-11 rounded-xl border-border/70"
            aria-label={viewLabels.list}
            title={viewLabels.list}
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" role="status">
        {filteredApps.length} {t("tools_results_count", "apps available")}
      </p>
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 rounded-2xl border border-dashed border-border/80 bg-card/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
            <Search className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-foreground">{t("apps_no_results", "No apps found")}</p>
          <p className="text-xs text-muted-foreground">Try a different search term</p>
          <Button variant="outline" className="rounded-xl mt-2 text-xs" onClick={() => setSearchQuery("")}>
            {t("action_clear_all", "Clear search")}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => {
            const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[app.icon] || Icons.Layout;
            return (
              <Link key={app.id} href={`/apps/${app.slug}`} className="group">
                <div className="h-full p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex gap-1.5">
                        {app.status === "beta" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                            Beta
                          </span>
                        )}
                        {app.status === "coming-soon" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/60">
                            Soon
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">
                      {app.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {app.shortDescription}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-primary">
                    <span>Open workspace</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredApps.map((app) => {
            const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[app.icon] || Icons.Layout;
            const localizedCat = getCategoryName(app.category, app.category);
            return (
              <Link
                key={app.id}
                href={`/apps/${app.slug}`}
                className="group flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                  <IconComponent className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{app.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{app.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60 capitalize">
                    {localizedCat}
                  </span>
                  {app.status === "beta" && (
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
