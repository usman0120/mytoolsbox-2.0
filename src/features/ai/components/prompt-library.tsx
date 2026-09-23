"use client";

import { useState, useMemo } from "react";
import { useChatStore } from "../chat-store";
import { PROMPTS_DATASET, PROMPT_CATEGORIES } from "../prompt-library-data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Star,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Code,
  Pencil,
  TrendingUp,
  Layers,
  Calculator,
  BookOpen,
  CheckSquare,
  Megaphone,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { PromptTemplate } from "../types";

interface PromptLibraryProps {
  onUsePrompt: (promptText: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  coding: Code,
  writing: Pencil,
  business: TrendingUp,
  product: Layers,
  "data-math": Calculator,
  education: BookOpen,
  productivity: CheckSquare,
  marketing: Megaphone,
};

export function PromptLibrary({ onUsePrompt }: PromptLibraryProps) {
  const { favoritePromptIds, toggleFavoritePrompt } = useChatStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return PROMPTS_DATASET.filter((p) => {
      // Category filter
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
        return false;
      }

      // Favorite filter
      if (onlyFavorites && !favoritePromptIds.includes(p.id)) {
        return false;
      }

      // Search query filter
      if (!q) return true;

      const titleMatch = p.title.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      const promptMatch = p.prompt.toLowerCase().includes(q);
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));

      return titleMatch || descMatch || promptMatch || tagMatch;
    });
  }, [selectedCategory, searchQuery, onlyFavorites, favoritePromptIds]);

  const handleCopy = async (id: string, text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy prompt");
    }
  };

  const handleUse = (promptText: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onUsePrompt(promptText);
    toast.success("Prompt loaded into Chat!");
    setSelectedPrompt(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-violet-500/10 via-background to-amber-500/10 border border-border/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Curated Prompt Library</h2>
              <Badge variant="secondary" className="rounded-full text-xs font-mono">
                {PROMPTS_DATASET.length}+ Prompts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Battle-tested, professional prompt templates across software engineering, content, startups, product management, and mathematics. Click any prompt to use it instantly in chat.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 160+ prompts or tags..."
              className="h-10 pl-9 pr-8 text-xs rounded-xl bg-background/80 border-border/70 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 pb-1 scrollbar-none border-t border-border/40 mt-4">
          <Button
            variant={selectedCategory === "all" && !onlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setOnlyFavorites(false);
            }}
            className="h-8 px-3 rounded-full text-xs shrink-0 gap-1.5"
          >
            <Filter className="h-3 w-3" />
            All ({PROMPTS_DATASET.length})
          </Button>

          {/* Favorites Filter */}
          <Button
            variant={onlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className="h-8 px-3 rounded-full text-xs shrink-0 gap-1.5 text-amber-600 dark:text-amber-400"
          >
            <Star className={`h-3 w-3 ${onlyFavorites ? "fill-current" : ""}`} />
            Starred ({favoritePromptIds.length})
          </Button>

          {PROMPT_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Sparkles;
            const count = PROMPTS_DATASET.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id && !onlyFavorites;

            return (
              <Button
                key={cat.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOnlyFavorites(false);
                }}
                className="h-8 px-3 rounded-full text-xs shrink-0 gap-1.5"
              >
                <Icon className="h-3.5 w-3.5 opacity-80" />
                {cat.name} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
          <Search className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-semibold text-sm">No prompts found</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search query or switching to another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((p) => {
            const isFav = favoritePromptIds.includes(p.id);
            const isCopied = copiedId === p.id;
            const Icon = CATEGORY_ICONS[p.categoryId] || Sparkles;

            return (
              <Card
                key={p.id}
                onClick={() => setSelectedPrompt(p)}
                className="group relative flex flex-col justify-between border-border/50 hover:border-primary/40 bg-card/70 hover:bg-card/95 transition-all card-lift cursor-pointer rounded-2xl overflow-hidden p-5 shadow-xs"
              >
                <div>
                  {/* Top card bar: Category icon, Star, Copy */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 rounded-md text-muted-foreground">
                        {p.categoryId}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavoritePrompt(p.id)}
                        className={`h-7 w-7 rounded-md ${
                          isFav ? "text-amber-500 fill-amber-500" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={isFav ? "Remove star" : "Star prompt"}
                      >
                        <Star className={`h-3.5 w-3.5 ${isFav ? "fill-amber-500" : ""}`} />
                      </Button>

                      {/* Copy Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleCopy(p.id, p.prompt, e)}
                        className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                        title="Copy prompt"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1.5 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                    {p.description}
                  </p>
                </div>

                {/* Footer: Tags & Use CTA */}
                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Use in Chat Button */}
                  <Button
                    onClick={(e) => handleUse(p.prompt, e)}
                    size="sm"
                    className="w-full rounded-xl text-xs gap-1.5 h-8 font-medium shadow-xs group-hover:shadow-sm"
                  >
                    <span>Use in Chat</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Prompt Preview Modal */}
      <Dialog open={!!selectedPrompt} onOpenChange={(open) => !open && setSelectedPrompt(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-6">
          {selectedPrompt && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs uppercase tracking-wider font-mono">
                    {selectedPrompt.categoryId}
                  </Badge>
                  {selectedPrompt.suggestedModel && (
                    <Badge variant="secondary" className="text-xs font-mono">
                      Suggested: {selectedPrompt.suggestedModel}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-lg font-bold">
                  {selectedPrompt.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedPrompt.description}
                </DialogDescription>
              </DialogHeader>

              {/* Full Prompt Content */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-all">
                {selectedPrompt.prompt}
              </div>

              {/* Placeholders Guide */}
              {selectedPrompt.placeholders && selectedPrompt.placeholders.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Placeholders to customize:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrompt.placeholders.map((ph, i) => (
                      <Badge key={i} variant="outline" className="text-[11px] font-mono bg-primary/5 text-primary border-primary/20">
                        {ph}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(selectedPrompt.id, selectedPrompt.prompt)}
                  className="rounded-xl text-xs gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Prompt
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUse(selectedPrompt.prompt)}
                  className="rounded-xl text-xs gap-1.5 shadow-sm"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Use in Chat Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
