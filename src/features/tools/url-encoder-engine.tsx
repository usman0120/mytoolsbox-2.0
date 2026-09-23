"use client";

import { useState, useTransition, useId } from "react";
import {
  Link as LinkIcon,
  Copy,
  Check,
  ArrowLeftRight,
  Plus,
  Trash2,
  Sliders,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  encodeURL,
  decodeURL,
  parseURL,
  rebuildURL,
  URLEncodeMode,
  ParsedURLComponent,
} from "@/features/tools/url-encoder";
import { toast } from "sonner";

export function URLEncoderEngine() {
  const [activeTab, setActiveTab] = useState<"quick" | "param-editor">("quick");

  // Quick mode states
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeMode, setEncodeMode] = useState<URLEncodeMode>("component");
  const [isFormDecode, setIsFormDecode] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ changedCount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // URL & Query Params Editor state
  const [urlInput, setUrlInput] = useState("");
  const [parsed, setParsed] = useState<ParsedURLComponent | null>(null);
  const [rebuiltUrl, setRebuiltUrl] = useState("");

  const [, startTransition] = useTransition();

  const handleProcessQuick = (
    text: string,
    currMode = mode,
    currEncodeMode = encodeMode,
    currFormDecode = isFormDecode
  ) => {
    setInput(text);
    if (!text.trim()) {
      setOutput("");
      setError(null);
      setStats(null);
      return;
    }

    startTransition(() => {
      const res =
        currMode === "encode"
          ? encodeURL(text, currEncodeMode)
          : decodeURL(text, currFormDecode);

      if (res.status === "error") {
        setError(res.error || "Failed");
        setOutput("");
        setStats(null);
      } else if (res.data) {
        setError(null);
        setOutput(res.data.output);
        setStats({ changedCount: res.data.changedCount });
      }
    });
  };

  const handleSwap = () => {
    const nextMode = mode === "encode" ? "decode" : "encode";
    setMode(nextMode);
    handleProcessQuick(output, nextMode);
  };

  const handleCopy = async (val = output) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  // URL Decomposer logic
  const handleParseURLInput = (raw: string) => {
    setUrlInput(raw);
    const p = parseURL(raw);
    if (p) {
      setParsed(p);
      setRebuiltUrl(rebuildURL(p));
    } else {
      setParsed(null);
      setRebuiltUrl("");
    }
  };

  const updateParam = (id: string, field: "key" | "value" | "enabled", val: string | boolean) => {
    if (!parsed) return;
    const updated = {
      ...parsed,
      queryParams: parsed.queryParams.map((p) =>
        p.id === id ? { ...p, [field]: val } : p
      ),
    };
    setParsed(updated);
    setRebuiltUrl(rebuildURL(updated));
  };

  const addParam = () => {
    if (!parsed) return;
    const updated = {
      ...parsed,
      queryParams: [
        ...parsed.queryParams,
        { id: Math.random().toString(36).substring(2, 9), key: "", value: "", enabled: true },
      ],
    };
    setParsed(updated);
    setRebuiltUrl(rebuildURL(updated));
  };

  const removeParam = (id: string) => {
    if (!parsed) return;
    const updated = {
      ...parsed,
      queryParams: parsed.queryParams.filter((p) => p.id !== id),
    };
    setParsed(updated);
    setRebuiltUrl(rebuildURL(updated));
  };

  const loadSampleURL = (sample: string) => {
    handleParseURLInput(sample);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "quick" | "param-editor")}>
          <TabsList>
            <TabsTrigger value="quick" className="gap-1.5">
              <LinkIcon className="h-4 w-4" /> Quick Encode / Decode
            </TabsTrigger>
            <TabsTrigger value="param-editor" className="gap-1.5">
              <Sliders className="h-4 w-4" /> Query Parameters Editor
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "quick" && (
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "encode" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("encode");
                handleProcessQuick(input, "encode");
              }}
            >
              Encode
            </Button>
            <Button
              variant={mode === "decode" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("decode");
                handleProcessQuick(input, "decode");
              }}
            >
              Decode
            </Button>
          </div>
        )}
      </div>

      {activeTab === "quick" ? (
        <div className="space-y-4">
          {/* Settings Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg text-xs">
            {mode === "encode" ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-muted-foreground mr-1">Standard:</span>
                {(
                  [
                    { id: "component", label: "Component (encodeURIComponent)" },
                    { id: "rfc3986", label: "RFC 3986 (Strict !'()*)" },
                    { id: "full", label: "Full URL (encodeURI)" },
                    { id: "form", label: "Form Data (+ for spaces)" },
                  ] as const
                ).map((opt) => (
                  <Button
                    key={opt.id}
                    variant={encodeMode === opt.id ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEncodeMode(opt.id);
                      handleProcessQuick(input, mode, opt.id);
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="formDecode"
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  checked={isFormDecode}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsFormDecode(checked);
                    handleProcessQuick(input, mode, encodeMode, checked);
                  }}
                />
                <label htmlFor="formDecode" className="cursor-pointer font-medium">
                  Treat + as spaces (application/x-www-form-urlencoded)
                </label>
              </div>
            )}

            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs ml-auto"
              onClick={() =>
                handleProcessQuick(
                  "https://example.com/api/v1/search?query=react 19 & nextjs 15&category=developer tools#section-2"
                )
              }
            >
              Load Sample URL
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  {mode === "encode" ? "Raw Text / URL to Encode" : "Encoded String to Decode"}
                </Label>
                {input && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handleProcessQuick("")}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Textarea
                placeholder={
                  mode === "encode"
                    ? "Enter URL, query strings, or text with spaces, &, ?, =..."
                    : "Enter URL-encoded text (e.g. hello%20world%21)..."
                }
                className="min-h-56 font-mono text-xs leading-relaxed"
                value={input}
                onChange={(e) => handleProcessQuick(e.target.value)}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{input.length} characters</span>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  {mode === "encode" ? "URL Encoded Result" : "Decoded Output"}
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleSwap}
                    disabled={!output}
                  >
                    <ArrowLeftRight className="h-3 w-3" /> Swap
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleCopy()}
                    disabled={!output}
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {error ? (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm min-h-56 flex flex-col justify-center items-center text-center">
                  <p className="font-medium">{error}</p>
                </div>
              ) : (
                <Textarea
                  readOnly
                  value={output}
                  placeholder="Encoded or decoded output appears here immediately..."
                  className="min-h-56 font-mono text-xs leading-relaxed bg-muted/40 cursor-text"
                />
              )}

              {stats && !error && mode === "encode" && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Percent sequences: {stats.changedCount}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Length: {output.length} chars
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* URL & Query Parameter Table Editor */
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Enter Full URL to Parse and Edit</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    loadSampleURL(
                      "https://api.github.com/repos/owner/repo/pulls?state=all&per_page=50&sort=created&direction=desc#results"
                    )
                  }
                >
                  GitHub API Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    loadSampleURL(
                      "https://auth.provider.com/oauth/authorize?client_id=12345&redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback&response_type=code&scope=read+write+email"
                    )
                  }
                >
                  OAuth Sample
                </Button>
              </div>
            </div>
            <Input
              value={urlInput}
              onChange={(e) => handleParseURLInput(e.target.value)}
              placeholder="https://example.com/search?q=hello&filter=active&page=1"
              className="font-mono text-xs"
            />
          </div>

          {parsed ? (
            <div className="space-y-4">
              {/* Components breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block">Protocol</span>
                  <span className="font-mono font-medium">{parsed.protocol || "(none)"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Hostname</span>
                  <span className="font-mono font-medium">{parsed.host || "(none)"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Path</span>
                  <span className="font-mono font-medium">{parsed.pathname || "/"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Hash / Anchor</span>
                  <span className="font-mono font-medium">{parsed.hash || "(none)"}</span>
                </div>
              </div>

              {/* Parameters Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold">Query Parameters</Label>
                    <Badge variant="secondary" className="text-xs">
                      {parsed.queryParams.length}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addParam}>
                    <Plus className="h-3.5 w-3.5" /> Add Param
                  </Button>
                </div>

                {parsed.queryParams.length === 0 ? (
                  <div className="p-6 text-center border rounded-lg bg-muted/20 text-muted-foreground text-xs">
                    No query parameters found in this URL. Click &quot;Add Param&quot; to add one.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden divide-y text-xs">
                    <div className="grid grid-cols-12 gap-2 bg-muted/60 p-2.5 font-semibold text-muted-foreground">
                      <div className="col-span-1 text-center">Active</div>
                      <div className="col-span-5">Key / Name</div>
                      <div className="col-span-5">Value</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>
                    {parsed.queryParams.map((p) => (
                      <div key={p.id} className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-muted/20">
                        <div className="col-span-1 flex justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                            checked={p.enabled}
                            onChange={(e) => updateParam(p.id, "enabled", e.target.checked)}
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            value={p.key}
                            onChange={(e) => updateParam(p.id, "key", e.target.value)}
                            placeholder="param_name"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            value={p.value}
                            onChange={(e) => updateParam(p.id, "value", e.target.value)}
                            placeholder="param_value"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeParam(p.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rebuilt URL Result */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Rebuilt URL</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleCopy(rebuiltUrl)}
                    >
                      <Copy className="h-3 w-3" /> Copy URL
                    </Button>
                    {rebuiltUrl.startsWith("http") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => window.open(rebuiltUrl, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" /> Open
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  readOnly
                  value={rebuiltUrl}
                  className="min-h-24 font-mono text-xs break-all bg-muted/40"
                />
              </div>
            </div>
          ) : (
            urlInput && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-xs">
                Could not parse URL. Please verify the URL format (e.g. https://example.com/path?key=value).
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}