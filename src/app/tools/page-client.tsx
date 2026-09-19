"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Wrench, Grid3X3, List, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/common/tool-card";
import { getActiveTools, searchTools } from "@/content/tools/registry";
import { CATEGORIES } from "@/lib/constants";
import * as Icons from "lucide-react";

export function ToolsPageClient() {
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
  }, [searchQuery, activeCategory]);

  const activeCategoryName = CATEGORIES.find((c) => c.id === activeCategory)?.name;
  const activeCategoryIcon = CATEGORIES.find((c) => c.id === activeCategory)?.icon;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10 shadow-sm">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">All Tools</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Browse {allTools.length} free online tools across {CATEGORIES.length} categories
            </p>
          </div>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tools..."
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

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Badge
          variant={activeCategory === "" ? "default" : "outline"}
          className="cursor-pointer px-4 py-2 text-sm rounded-full transition-all duration-200 hover:border-primary/30 font-medium"
          onClick={() => setActiveCategory("")}
        >
          <Grid3X3 className="h-3.5 w-3.5 mr-1.5" />
          All Categories
        </Badge>
        {CATEGORIES.map((cat) => {
          const IconComponent = (Icons as any)[cat.icon] || Icons.Folder;
          const count = allTools.filter((t) => t.category === cat.id).length;
          return (
            <Badge
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm rounded-full transition-all duration-200 hover:border-primary/30 font-medium"
              onClick={() => setActiveCategory(activeCategory === cat.id ? "" : cat.id)}
            >
              <IconComponent className="h-3.5 w-3.5 mr-1.5" />
              {cat.name}
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
            </Badge>
          );
        })}
      </div>

      {/* Active filter indicator */}
      {activeCategory && activeCategoryName && (
        <div className="flex items-center gap-2 mb-6 text-sm">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Filtered by:</span>
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
            {activeCategoryName}
            <button onClick={() => setActiveCategory("")} className="hover:text-foreground transition-colors">
              <X className="h-3 w-3" />
            </button>
          </Badge>
          <span className="text-muted-foreground ml-auto">
            {filteredTools.length} result{filteredTools.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Results */}
      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4 animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
            <Search className="h-10 w-10" />
          </div>
          <p className="text-lg font-medium">No tools found</p>
          <p className="text-sm max-w-sm text-center">Try a different search term or category filter</p>
          <Button
            variant="outline"
            className="rounded-xl mt-2"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("");
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTools.map((tool, i) => (
            <div key={tool.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTools.map((tool, i) => {
            const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;
            return (
              <Link
                key={tool.id}
                href={`/${tool.productType}s/${tool.slug}`}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card hover:bg-accent/30 transition-all duration-200 card-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 group-hover:scale-110 transition-transform shrink-0">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{tool.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] capitalize">{tool.category}</Badge>
                  {tool.status === "beta" && (
                    <Badge className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Beta</Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}