"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Wrench,
  Sparkles,
  ArrowLeft,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { searchTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import { ToolDefinition } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

type FilterType = "all" | "tool" | "app";

export function SearchPageClient() {
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
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearFilters = () => {
    setFilter("all");
    setSelectedCategory("all");
  };

  const hasActiveFilters = filter !== "all" || selectedCategory !== "all";

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Search</span>
        </div>
      </div>

      {/* Search header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">Find tools and apps across the entire platform.</p>
      </div>

      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-6 animate-fade-in-up">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="What do you need to do? Compress a PDF, solve math, edit image..."
            className="pl-10 h-12 text-base rounded-xl border-2 focus-visible:border-primary/50"
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
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : f === "tool" ? "Tools" : "Apps"}
            </button>
          ))}
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-8 px-2.5 text-xs rounded-lg border bg-muted text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {query.trim().length >= 2 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4 animate-fade-in-up">
            {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((result, i) => {
                const IconComponent = (Icons as any)[result.item.icon] || Wrench;
                const href = result.type === "tool" ? `/tools/${result.item.slug}` : `/apps/${result.item.slug}`;
                return (
                  <Link key={`${result.type}:${result.item.slug}`} href={href}>
                    <Card
                      className="group card-lift border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-border/50 group-hover:scale-110 transition-transform shrink-0",
                              result.type === "app"
                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                                {result.item.name}
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
                            <p className="text-xs text-muted-foreground truncate">{result.item.shortDescription}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 animate-fade-in-up">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <Search className="h-10 w-10" />
              </div>
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm max-w-sm text-center">
                Try a different search term or browse our categories to find what you need.
              </p>
              <Button variant="outline" className="rounded-xl" onClick={() => router.push("/tools")}>
                Browse all tools
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <Search className="h-10 w-10" />
          </div>
          <p className="text-lg font-medium">Start typing to search</p>
          <p className="text-sm max-w-sm text-center">
            Search across all tools and apps. Try &quot;compress image&quot;, &quot;calculate loan&quot;, or &quot;make flowchart&quot;.
          </p>
        </div>
      )}
    </div>
  );
}