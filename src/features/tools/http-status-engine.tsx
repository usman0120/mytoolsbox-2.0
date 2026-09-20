"use client";

import { useState } from "react";
import { Search, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { lookupStatus, searchStatuses, HTTP_STATUS_CODES } from "@/features/tools/http-status";

type HttpStatusEntry = { code: number; name: string; description: string; category: string };

const CATEGORIES = ["1xx", "2xx", "3xx", "4xx", "5xx"];

export function HTTPStatusEngine() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HttpStatusEntry[] | null>(null);
  const [selected, setSelected] = useState<HttpStatusEntry | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = () => {
    setError("");
    setSelected(null);
    if (!query.trim()) {
      // Show all
      setResults(Object.values(HTTP_STATUS_CODES));
      return;
    }
    // Try exact lookup first
    const num = parseInt(query);
    if (!isNaN(num)) {
      const r = lookupStatus(num);
      if (r.status === "success") {
        setSelected(r.data as HttpStatusEntry);
        setResults(null);
        return;
      }
    }
    const r = searchStatuses(query);
    if (r.status === "success") {
      setResults(r.data as HttpStatusEntry[]);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const filteredResults = results?.filter((s) =>
    category ? s.category.startsWith(category) : true
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Search by code or keyword</Label>
          <Input
            placeholder="e.g. 404, 500, 'not found', 'server error'"
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
        {CATEGORIES.map((cat) => (
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
                <Badge
                  variant={selected.code < 300 ? "default" : selected.code < 400 ? "secondary" : "destructive"}
                >
                  {selected.code}
                </Badge>
                <span className="font-semibold">{selected.name}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => handleCopy(`${selected.code} ${selected.name}`, "detail")}
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
        <div className="space-y-1 max-h-100 overflow-y-auto">
          {filteredResults.map((s) => (
            <Card
              key={s.code}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelected(s)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant={s.code < 300 ? "default" : s.code < 400 ? "secondary" : s.code < 500 ? "outline" : "destructive"}
                    className="shrink-0"
                  >
                    {s.code}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
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