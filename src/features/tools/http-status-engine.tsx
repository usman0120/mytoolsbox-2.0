"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  ChevronRight,
  Code2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HTTP_STATUS_CODES, HttpStatusDetail } from "@/features/tools/http-status";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "all", label: "All Status Codes" },
  { id: "1xx", label: "1xx Informational" },
  { id: "2xx", label: "2xx Success" },
  { id: "3xx", label: "3xx Redirection" },
  { id: "4xx", label: "4xx Client Errors" },
  { id: "5xx", label: "5xx Server Errors" },
];

export function HTTPStatusEngine() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedCode, setSelectedCode] = useState<HttpStatusDetail>(HTTP_STATUS_CODES[200]);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "code">("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live filtering
  const filteredList = useMemo(() => {
    const q = query.toLowerCase().trim();
    return Object.values(HTTP_STATUS_CODES).filter((item) => {
      const matchCat =
        selectedCat === "all" ||
        item.category.toLowerCase().startsWith(selectedCat.toLowerCase());

      const matchQuery =
        !q ||
        String(item.code).includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [query, selectedCat]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadgeVariant = (code: number) => {
    if (code < 300) return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
    if (code < 400) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    if (code < 500) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    return "bg-destructive/10 text-destructive border-destructive/30";
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search status code (e.g. 404, 500, Unauthorized, Gateway, Rate limit)..."
            className="pl-9 h-11 text-sm font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCat === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCat(cat.id)}
              className="h-7 text-xs px-2.5 rounded-full"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Grid: Detail View + List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Selected Code Details Panel */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-black px-3 py-1 rounded-xl border ${getStatusBadgeVariant(selectedCode.code)}`}>
                    {selectedCode.code}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCode.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{selectedCode.category}</span>
                      {selectedCode.rfc && (
                        <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {selectedCode.rfc}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => handleCopy(`${selectedCode.code} ${selectedCode.name}`, "head")}
                >
                  {copiedKey === "head" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/90 leading-relaxed">
                {selectedCode.description}
              </p>

              {/* Detail Tabs: Overview vs Server Code */}
              <Tabs value={activeDetailTab} onValueChange={(v) => setActiveDetailTab(v as "overview" | "code")}>
                <TabsList className="grid grid-cols-2 h-8">
                  <TabsTrigger value="overview" className="text-xs gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Troubleshooting
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs gap-1">
                    <Code2 className="h-3.5 w-3.5" /> Server Code Snippets
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-3 pt-3">
                  {selectedCode.causes && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Common Causes
                      </span>
                      <ul className="text-xs space-y-1 text-muted-foreground pl-4 list-disc">
                        {selectedCode.causes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCode.solutions && (
                    <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 space-y-1.5">
                      <span className="text-xs font-bold text-green-700 dark:text-green-300 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5" /> Recommended Fixes
                      </span>
                      <ul className="text-xs space-y-1 text-muted-foreground pl-4 list-disc">
                        {selectedCode.solutions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!selectedCode.causes && !selectedCode.solutions && (
                    <div className="p-4 rounded-xl border bg-muted/20 text-xs text-muted-foreground">
                      Standard protocol status code. Typically handled automatically by HTTP clients and server frameworks.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="code" className="space-y-3 pt-3">
                  {selectedCode.snippets ? (
                    <div className="space-y-2.5">
                      {[
                        { lang: "Next.js (App Router)", code: selectedCode.snippets.nextjs, key: "next" },
                        { lang: "Express.js", code: selectedCode.snippets.express, key: "express" },
                        { lang: "Python FastAPI", code: selectedCode.snippets.fastapi, key: "fastapi" },
                        { lang: "Go (net/http)", code: selectedCode.snippets.go, key: "go" },
                      ].map((snip) => (
                        <div key={snip.key} className="border rounded-lg p-2.5 bg-muted/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{snip.lang}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs gap-1"
                              onClick={() => handleCopy(snip.code, snip.key)}
                            >
                              {copiedKey === snip.key ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              Copy
                            </Button>
                          </div>
                          <pre className="p-2 rounded bg-muted font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                            {snip.code}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border bg-muted/20 text-xs text-muted-foreground">
                      Code snippets for this status can be standardly emitted via{" "}
                      <code className="bg-muted px-1 rounded">res.status({selectedCode.code})</code> or{" "}
                      <code className="bg-muted px-1 rounded">NextResponse.json(..., &#123; status: {selectedCode.code} &#125;)</code>.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Status Catalog List */}
        <div className="lg:col-span-5 space-y-1.5 max-h-140 overflow-y-auto pr-1">
          <Label className="text-xs font-semibold text-muted-foreground block mb-1">
            Status Codes ({filteredList.length})
          </Label>

          {filteredList.map((item) => {
            const isSelected = selectedCode.code === item.code;
            return (
              <div
                key={item.code}
                onClick={() => setSelectedCode(item)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card hover:bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border shrink-0 ${getStatusBadgeVariant(item.code)}`}>
                    {item.code}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground"}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}