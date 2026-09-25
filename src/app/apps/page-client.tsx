"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layout, Search, X, ArrowRight, Grid3X3, List } from "lucide-react";
import { getActiveApps } from "@/content/apps/registry";
import { useI18n } from "@/lib/i18n";
import * as Icons from "lucide-react";

export function AppsPageClient() {
  const { t, localizePath, getCategoryName } = useI18n();
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
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20 shadow-sm">
            <Layout className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("apps_page_title", "Apps")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("apps_page_subtitle", "Multi-step mini applications for productivity, creativity, and daily tasks")}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("apps_search_placeholder", "Search apps...")}
            className="pl-10 h-11 rounded-xl border-border/60 focus-visible:ring-primary/30 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4 animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
            <Search className="h-10 w-10" />
          </div>
          <p className="text-lg font-medium">{t("apps_no_results", "No apps found")}</p>
          <p className="text-sm">Try a different search term</p>
          <Button variant="outline" className="rounded-xl mt-2" onClick={() => setSearchQuery("")}>
            {t("action_clear_all", "Clear search")}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app, i) => {
            const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[app.icon] || Icons.Layout;
            return (
              <Link key={app.id} href={localizePath(`/apps/${app.slug}`)}>
                <Card
                  className="group card-lift cursor-pointer h-full border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20 group-hover:scale-110 transition-transform shrink-0">
                        <IconComponent className="h-6 w-6 text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{app.name}</h3>
                          {app.status === "beta" && (
                            <Badge className="text-[10px] h-4 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 rounded-full">
                              Beta
                            </Badge>
                          )}
                          {app.status === "coming-soon" && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full">Soon</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{app.shortDescription}</p>
                        <div className="flex flex-wrap gap-1">
                          {app.features.slice(0, 3).map((f) => (
                            <Badge key={f} variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">{f}</Badge>
                          ))}
                          {app.features.length > 3 && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full">+{app.features.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredApps.map((app, i) => {
            const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[app.icon] || Icons.Layout;
            const localizedCat = getCategoryName(app.category, app.category);
            return (
              <Link
                key={app.id}
                href={localizePath(`/apps/${app.slug}`)}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card hover:bg-accent/30 transition-all duration-200 card-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20 group-hover:scale-110 transition-transform shrink-0">
                  <IconComponent className="h-5 w-5 text-cyan-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{app.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{app.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] capitalize">{localizedCat}</Badge>
                  {app.status === "beta" && (
                    <Badge className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Beta</Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}