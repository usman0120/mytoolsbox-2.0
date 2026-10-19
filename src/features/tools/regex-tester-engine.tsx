"use client";

import { useState, useTransition, useMemo, useSyncExternalStore } from "react";
import {
  Regex,
  Copy,
  Check,
  Code2,
  Replace,
  Sparkles,
  Info,
  Clock,
  ListFilter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  testRegexAdvanced,
  RegexMatchItem,
  generateRegexCode,
} from "@/features/tools/regex-tester";
import { toast } from "sonner";

const PRESET_PATTERNS = [
  { name: "Email Address", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "gi" },
  { name: "URL / Link", pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_\\+.~#?&//=]*", flags: "g" },
  { name: "IPv4 Address", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g" },
  { name: "HEX Color", pattern: "#(?:[0-9a-fA-F]{3,4}){1,2}\\b", flags: "g" },
  { name: "ISO 8601 Date", pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b", flags: "g" },
  { name: "UUID v4", pattern: "\\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\b", flags: "gi" },
  { name: "Phone Number", pattern: "\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}", flags: "g" },
];

const subscribeToHydration = () => () => {};

export function RegexTesterEngine() {
  const isClient = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState(
    "Contact support at help@mytoolsbox.me or admin@google.com for queries.\nPhone: +1-800-555-0199."
  );
  const [replacement, setReplacement] = useState("[hidden-email]");
  const [activeTab, setActiveTab] = useState<"matches" | "replace" | "code">("matches");
  const [copied, setCopied] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, "") : prev + flag));
  };

  const result = useMemo(() => {
    if (!pattern.trim()) return null;
    return testRegexAdvanced(pattern, text, flags, replacement);
  }, [pattern, text, flags, replacement]);

  const handleCopy = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  // Build highlighted markup
  const highlightedMarkup = useMemo(() => {
    if (!result?.data?.matches || result.data.matches.length === 0) {
      return text;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    result.data.matches.forEach((m, idx) => {
      if (m.index > lastIndex) {
        segments.push(text.substring(lastIndex, m.index));
      }
      segments.push(
        <mark
          key={idx}
          className="bg-primary/20 text-primary font-bold px-0.5 rounded border border-primary/40 inline"
          title={`Match #${idx + 1} at [${m.index}, ${m.endIndex}]`}
        >
          {m.text}
        </mark>
      );
      lastIndex = m.endIndex;
    });

    if (lastIndex < text.length) {
      segments.push(text.substring(lastIndex));
    }

    return segments;
  }, [text, result]);

  return (
    <div className="space-y-5">
      {/* Pattern Input & Flag Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Regex className="h-4 w-4 text-primary" /> Regular Expression
          </Label>
          <div className="flex items-center gap-1">
            {(["g", "i", "m", "s", "u"] as const).map((flag) => {
              const active = flags.includes(flag);
              const descriptions: Record<string, string> = {
                g: "Global (match all)",
                i: "Case-insensitive",
                m: "Multiline (^ and $ match lines)",
                s: "DotAll (. matches newline)",
                u: "Unicode",
              };
              return (
                <button
                  key={flag}
                  type="button"
                  title={descriptions[flag]}
                  onClick={() => toggleFlag(flag)}
                  className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:border-border"
                  }`}
                >
                  {flag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-md border bg-background px-3 py-1 font-mono text-sm focus-within:ring-2 focus-within:ring-ring">
          <span className="text-muted-foreground font-bold">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Type regex pattern (e.g. [A-Za-z0-9]+)..."
            className="flex-1 bg-transparent py-1 outline-none font-mono text-sm"
          />
          <span className="text-muted-foreground font-bold">/{flags}</span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground mr-1">Presets:</span>
          {PRESET_PATTERNS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPattern(p.pattern);
                setFlags(p.flags);
              }}
              className="text-[11px] px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors border"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Test String */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Test String</Label>
          <div className="flex items-center gap-2">
            {result?.data && (
              <Badge variant={result.data.matchCount > 0 ? "default" : "secondary"} className="text-xs">
                {result.data.matchCount} {result.data.matchCount === 1 ? "match" : "matches"}
              </Badge>
            )}
            {isClient && result?.data?.executionTimeMs !== undefined && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {result.data.executionTimeMs} ms
              </span>
            )}
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type test string here..."
          className="min-h-32 font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Error state */}
      {result?.status === "error" && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {/* Highlighted Visual Overlay */}
      {result?.status === "success" && text && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Interactive Match Highlight</Label>
          <div className="p-3.5 rounded-lg border bg-muted/30 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all max-h-48 overflow-y-auto select-text">
            {highlightedMarkup}
          </div>
        </div>
      )}

      {/* Tabs: Matches Breakdown / Replace / Code Snippet */}
      <div className="space-y-3 pt-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "matches" | "replace" | "code")}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="matches" className="text-xs gap-1.5">
              <ListFilter className="h-3.5 w-3.5" /> Matches ({result?.data?.matchCount ?? 0})
            </TabsTrigger>
            <TabsTrigger value="replace" className="text-xs gap-1.5">
              <Replace className="h-3.5 w-3.5" /> Replace / Substitute
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs gap-1.5">
              <Code2 className="h-3.5 w-3.5" /> Code Snippets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-2 pt-2">
            {!result?.data || result.data.matches.length === 0 ? (
              <div className="p-6 text-center border rounded-lg bg-muted/20 text-muted-foreground text-xs">
                No matches found with this pattern and test string.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden divide-y text-xs max-h-60 overflow-y-auto">
                <div className="grid grid-cols-12 gap-2 bg-muted/60 p-2 font-semibold text-muted-foreground">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-2">Span [start-end]</div>
                  <div className="col-span-5">Matched String</div>
                  <div className="col-span-4">Capturing Groups</div>
                </div>
                {result.data.matches.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-muted/30 font-mono">
                    <div className="col-span-1 text-center text-muted-foreground">{idx + 1}</div>
                    <div className="col-span-2 text-muted-foreground">
                      [{m.index}, {m.endIndex}]
                    </div>
                    <div className="col-span-5 font-semibold text-primary truncate" title={m.text}>
                      {m.text}
                    </div>
                    <div className="col-span-4 text-muted-foreground">
                      {m.groups.length > 0 ? (
                        m.groups.map((g, gi) => (
                          <span key={gi} className="inline-block bg-muted px-1.5 py-0.5 rounded mr-1 text-[11px]">
                            {g.name ? `${g.name}: ` : `$${g.index}: `}
                            <strong>{g.value}</strong>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] italic">None</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="replace" className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Replacement Pattern</Label>
              <Input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="e.g. [REDACTED] or $1-$2"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Supports standard tokens: <code className="bg-muted px-1 rounded">$1</code>,{" "}
                <code className="bg-muted px-1 rounded">$2</code> for captured groups,{" "}
                <code className="bg-muted px-1 rounded">$&amp;</code> for entire matched string.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Substitution Result</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={() => handleCopy(result?.data?.replacedText || "", "replaced")}
                >
                  {copied === "replaced" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  Copy Replaced
                </Button>
              </div>
              <Textarea
                readOnly
                value={result?.data?.replacedText || ""}
                className="min-h-24 font-mono text-xs bg-muted/40"
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(["js", "python", "go", "php"] as const).map((lang) => {
                const code = generateRegexCode(pattern, flags, lang);
                const title = {
                  js: "JavaScript / TypeScript",
                  python: "Python (re module)",
                  go: "Go (regexp)",
                  php: "PHP (preg_match_all)",
                }[lang];

                return (
                  <div key={lang} className="border rounded-lg p-3 bg-muted/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => handleCopy(code, lang)}
                      >
                        {copied === lang ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </Button>
                    </div>
                    <pre className="p-2 rounded bg-muted font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {code}
                    </pre>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}