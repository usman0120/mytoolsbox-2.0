"use client";

import { useState } from "react";
import { FileType, Search, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { lookupMimeType, searchMimeTypes, MIME_TYPES, getMimeCategories } from "@/features/tools/mime-types";

export function MimeTypesEngine() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = () => {
    setError("");
    setSelected(null);
    if (!query.trim()) {
      setResults(Object.values(MIME_TYPES));
      return;
    }
    // Try exact extension lookup
    const r = lookupMimeType(query);
    if (r.status === "success") {
      setSelected(r.data);
      setResults(null);
      return;
    }
    const sr = searchMimeTypes(query);
    if (sr.status === "success") {
      setResults(sr.data as any[]);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const filteredResults = results?.filter((s) =>
    category ? s.category === category : true
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Search by extension or MIME type</Label>
          <Input
            placeholder="e.g. .pdf, image/png, 'json'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSearch} size="sm" className="gap-1.5">
            <Search className="h-3.5 w-3.5" /> Search
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 flex-wrap">
        <Badge
          variant={category === "" ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => setCategory("")}
        >
          All
        </Badge>
        {getMimeCategories().map((cat) => (
          <Badge
            key={cat}
            variant={category === cat ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setCategory(category === cat ? "" : cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Selected detail */}
      {selected && (
        <Card className="animate-fade-in-up">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-mono">{selected.extension}</Badge>
                <span className="font-semibold font-mono text-sm">{selected.mimeType}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => handleCopy(selected.mimeType, "detail")}
              >
                {copied === "detail" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{selected.description}</p>
            <Badge variant="outline" className="text-[10px]">{selected.category}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Results list */}
      {filteredResults && filteredResults.length > 0 && (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filteredResults.map((s) => (
            <Card
              key={s.extension}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelected(s)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="secondary" className="font-mono shrink-0">{s.extension}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-mono truncate">{s.mimeType}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}