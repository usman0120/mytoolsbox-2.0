"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Zap,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
  Wrench,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import { ToolDefinition } from "@/types";
import { cn } from "@/lib/utils";
import { UI_COPY } from "@/lib/ui-copy";
import * as Icons from "lucide-react";

// ---------- Intent-based search helpers ----------

interface SearchResult {
  type: "tool" | "app";
  item: ToolDefinition;
  score: number;
}

const INTENT_KEYWORDS: Record<string, string[]> = {
  compress: ["compress", "reduce size", "shrink", "smaller", "optimize"],
  convert: ["convert", "change", "transform", "to pdf", "to jpg", "to png", "to mp3"],
  merge: ["merge", "combine", "join", "together", "into one"],
  split: ["split", "separate", "divide", "extract", "cut"],
  generate: ["generate", "create", "make", "build", "produce"],
  calculate: ["calculate", "compute", "solve", "find", "how much", "what is"],
  edit: ["edit", "modify", "crop", "resize", "trim", "adjust"],
  format: ["format", "beautify", "prettify", "clean", "validate"],
  encode: ["encode", "decode", "encrypt", "decrypt", "hash"],
  analyze: ["analyze", "check", "test", "inspect", "review"],
  plan: ["plan", "organize", "track", "schedule", "manage"],
  design: ["design", "draw", "diagram", "flowchart", "palette", "color"],
  study: ["study", "learn", "quiz", "exam", "gpa", "citation", "research"],
  write: ["write", "text", "word", "grammar", "paraphrase", "rewrite"],
  secure: ["password", "secure", "hash", "encrypt", "jwt", "token"],
  qr: ["qr", "barcode", "scan"],
  timer: ["timer", "stopwatch", "pomodoro", "focus", "countdown"],
  budget: ["budget", "money", "expense", "finance", "loan", "currency"],
  math: ["math", "equation", "algebra", "calculus", "solve"],
  image: ["image", "photo", "picture", "jpg", "png", "webp"],
  pdf: ["pdf", "document"],
  video: ["video", "screen record", "gif", "mp4"],
  audio: ["audio", "mp3", "sound", "speech", "voice"],
};

function computeIntentScore(query: string, item: ToolDefinition): number {
  const q = query.toLowerCase();
  let score = 0;

  // Exact name match
  if (item.name.toLowerCase().includes(q)) score += 50;
  if (item.name.toLowerCase() === q) score += 30;

  // Short description match
  if (item.shortDescription.toLowerCase().includes(q)) score += 30;

  // Description match
  if (item.description.toLowerCase().includes(q)) score += 20;

  // Keyword match
  for (const kw of item.keywords) {
    if (kw.includes(q) || q.includes(kw)) {
      score += 25;
      break;
    }
  }

  // Category match
  if (item.category.toLowerCase().includes(q)) score += 15;

  // Intent-based matching
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (q.includes(kw)) {
        // Check if this tool matches the intent
        const toolText = `${item.name} ${item.shortDescription} ${item.description} ${item.keywords.join(" ")} ${item.category}`.toLowerCase();
        if (toolText.includes(intent) || item.keywords.some(k => k.includes(intent))) {
          score += 20;
        }
        break;
      }
    }
  }

  // Feature match
  for (const feature of item.features) {
    if (feature.toLowerCase().includes(q)) {
      score += 15;
      break;
    }
  }

  return score;
}

function searchAll(query: string): SearchResult[] {
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

  const results: SearchResult[] = [
    ...tools.map((t) => ({ type: "tool" as const, item: t, score: computeIntentScore(query, t) })),
    ...apps.map((a) => ({ type: "app" as const, item: a, score: computeIntentScore(query, a) })),
  ];

  // Deduplicate by slug+type
  const seen = new Set<string>();
  const deduped: SearchResult[] = [];
  for (const r of results) {
    const key = `${r.type}:${r.item.slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r);
    }
  }

  // Sort by score descending
  deduped.sort((a, b) => b.score - a.score);
  return deduped.slice(0, 8);
}

// ---------- Component ----------

interface SearchCommandProps {
  className?: string;
  variant?: "hero" | "navbar";
  onClose?: () => void;
}

export function SearchCommand({ className, variant = "hero", onClose }: SearchCommandProps) {
  const router = useRouter();
  const { t, toolName: getToolName } = UI_COPY;
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute search results during render
  const results = query.length >= 2 ? searchAll(query) : [];
  // Reset selectedIndex when results change
  const [prevResultsLen, setPrevResultsLen] = useState(0);
  if (results.length !== prevResultsLen) {
    setPrevResultsLen(results.length);
    setSelectedIndex(0);
  }

  // Click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      const path = result.type === "tool" ? `/tools/${result.item.slug}` : `/apps/${result.item.slug}`;
      router.push(path);
      setIsOpen(false);
      setQuery("");
      onClose?.();
    },
    [router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      onClose?.();
      return;
    }

    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setQuery("");
        onClose?.();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < results.length) {
        navigateToResult(results[selectedIndex]);
      } else {
        // "See all results" selected
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setQuery("");
        onClose?.();
      }
    }
  };

  const isNavbar = variant === "navbar";

  return (
    <div ref={containerRef} className={cn("relative", isNavbar ? "w-40 lg:w-56" : "w-full max-w-xl mx-auto", className)}>
      <div className="relative group">
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors",
            isNavbar ? "h-3.5 w-3.5 left-2.5" : "h-5 w-5"
          )}
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder={
            isNavbar
              ? t("nav_search_placeholder", "Search tools...")
              : t("hero_subtitle", "What do you need to do? Compress a PDF, solve math, edit image...")
          }
          className={cn(
            "rounded-xl border-2 focus-visible:border-primary/50 transition-all",
            isNavbar
              ? "pl-8 pr-2 h-8 text-sm border-border/60 bg-muted/40 focus-visible:bg-background"
              : "pl-10 h-12 text-base"
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
              isNavbar ? "right-1.5" : "right-3"
            )}
          >
            <X className={isNavbar ? "h-3 w-3" : "h-4 w-4"} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 w-full bg-popover border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200",
            isNavbar && "w-80 right-0"
          )}
        >
          {results.length > 0 ? (
            <>
              <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
                {results.map((result, i) => {
                  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[result.item.icon] || Wrench;
                  const isSelected = i === selectedIndex;
                  const displayName = result.type === "tool" ? getToolName(result.item.slug, result.item.name) : result.item.name;
                  return (
                    <button
                      key={`${result.type}:${result.item.slug}`}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        isSelected ? "bg-accent" : "hover:bg-accent/50"
                      )}
                      onClick={() => navigateToResult(result)}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                          result.type === "app"
                            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{displayName}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-4 rounded-full shrink-0",
                              result.type === "app" && "border-violet-500/30 text-violet-600 dark:text-violet-400"
                            )}
                          >
                            {result.type === "app" ? t("badge_app", "App") : t("badge_tool", "Tool")}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{result.item.shortDescription}</div>
                      </div>
                      {isSelected && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                className={cn(
                  "border-t px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors",
                  selectedIndex === results.length ? "bg-accent" : "hover:bg-accent/50"
                )}
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  setIsOpen(false);
                  setQuery("");
                  onClose?.();
                }}
                onMouseEnter={() => setSelectedIndex(results.length)}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">
                  {t("search_see_all", "See all results for")} &quot;{query}&quot;
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mx-auto mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">{t("search_no_results", "No results found")} &quot;{query}&quot;</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("search_try_different", "Try a different search term or browse categories")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
