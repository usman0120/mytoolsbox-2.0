"use client";

import { useEffect, useState } from "react";
import {
  Lightbulb,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  generateBusinessName,
  BUSINESS_INDUSTRIES,
  NamingStyle,
} from "@/features/tools/business-name-generator";
import { toast } from "sonner";

export function BusinessNameGeneratorEngine() {
  const [industry, setIndustry] = useState<string>("Tech & AI");
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState<NamingStyle>("all");
  const [names, setNames] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const initialization = setTimeout(() => {
      setNames(generateBusinessName("Tech & AI", 16, "", "all"));
    }, 0);
    return () => clearTimeout(initialization);
  }, []);

  const handleGenerate = () => {
    const generated = generateBusinessName(
      industry === "any" ? undefined : industry,
      16,
      keyword,
      style
    );
    setNames(generated);
    setCopied(null);
    toast.success(`Generated ${generated.length} brand name ideas!`);
  };

  const handleCopy = async (name: string) => {
    await navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`Copied "${name}" to clipboard!`);
  };

  const toggleFavorite = (name: string) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleExportFavorites = () => {
    if (favorites.length === 0) return;
    const blob = new Blob([favorites.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `favorite-brand-names-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded favorites list!");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-semibold mb-1 block">Industry</Label>
            <Select value={industry} onValueChange={(v) => setIndustry(v || "Tech & AI")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Industries</SelectItem>
                {Object.keys(BUSINESS_INDUSTRIES).map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">
              Core Keyword (Optional)
            </Label>
            <Input
              placeholder="e.g. Green, Nexus, Spark..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Naming Structure</Label>
            <Select value={style} onValueChange={(v) => setStyle(v as NamingStyle)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mix of All Styles</SelectItem>
                <SelectItem value="compound">Modern Compound (e.g. NovaTech)</SelectItem>
                <SelectItem value="corporate">Corporate Two-Word (e.g. Tech Capital)</SelectItem>
                <SelectItem value="minimal">Minimal One-Word (e.g. Noviq)</SelectItem>
                <SelectItem value="blended">Prefix + Word (e.g. Nova Cloud)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleGenerate} className="w-full gap-2 font-medium">
          <Sparkles className="h-4 w-4" /> Generate 16 New Brand Names
        </Button>
      </div>

      {/* Bookmarked / Saved Names */}
      {favorites.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 mb-3">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <BookmarkCheck className="h-4 w-4" /> Saved Shortlist ({favorites.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportFavorites}
              className="h-7 text-xs gap-1 border-amber-500/30 hover:bg-amber-500/10"
            >
              <Download className="h-3 w-3" /> Export Shortlist
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => (
              <Badge
                key={fav}
                variant="secondary"
                className="gap-1.5 py-1 px-2.5 text-xs bg-card border cursor-pointer hover:border-amber-500"
                onClick={() => handleCopy(fav)}
              >
                <span>{fav}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(fav);
                  }}
                  className="hover:text-destructive text-muted-foreground ml-1"
                >
                  ×
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Name Cards Grid */}
      {names.length > 0 && (
        <Card className="shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Generated Business Names
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleGenerate} className="gap-1.5 h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh List
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {names.map((name, i) => {
                const isFav = favorites.includes(name);
                const domainQuery = name.replace(/\s+/g, "").toLowerCase();

                return (
                  <div
                    key={i}
                    className="flex flex-col justify-between p-3 rounded-xl border bg-card hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-sm tracking-tight">{name}</span>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-amber-500"
                          onClick={() => toggleFavorite(name)}
                          title={isFav ? "Remove from shortlist" : "Save to shortlist"}
                        >
                          {isFav ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(name)}
                          title="Copy name"
                        >
                          {copied === name ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                      <a
                        href={`https://www.namecheap.com/domains/registration/results/?domain=${domainQuery}.com`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary flex items-center gap-1 hover:underline"
                        title="Check .com domain availability"
                      >
                        {domainQuery}.com <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}