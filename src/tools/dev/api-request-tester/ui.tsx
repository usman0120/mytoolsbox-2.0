"use client";

import { useState, useMemo } from "react";
import {
  Send,
  Copy,
  Check,
  Trash2,
  Plus,
  Clock,
  Terminal,
  Code2,
  Globe,
  Sliders,
  FileText,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  sendAPIRequest,
  generateCurl,
  parseCurl,
  HTTP_METHODS,
  CONTENT_TYPES,
  API_PRESETS,
  type APIResponse,
} from "@/features/tools/api-request";
import { toast } from "sonner";

interface HeaderRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export function APIRequestBuilderEngine() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [activeReqTab, setActiveReqTab] = useState<"params" | "headers" | "auth" | "body" | "curl">("headers");

  // Headers list
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>([
    { id: "1", key: "Accept", value: "application/json", enabled: true },
  ]);

  // Auth state
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic">("none");
  const [bearerToken, setBearerToken] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");

  // Body state
  const [body, setBody] = useState("");
  const [contentType, setContentType] = useState("application/json");

  // Response state
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // cURL import state
  const [curlImportText, setCurlImportText] = useState("");

  const buildEffectiveHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    headerRows
      .filter((r) => r.enabled && r.key.trim())
      .forEach((r) => {
        headers[r.key.trim()] = r.value.trim();
      });

    if (authType === "bearer" && bearerToken.trim()) {
      headers["Authorization"] = `Bearer ${bearerToken.trim()}`;
    } else if (authType === "basic" && (basicUser || basicPass)) {
      if (typeof window !== "undefined") {
        const credentials = window.btoa(`${basicUser}:${basicPass}`);
        headers["Authorization"] = `Basic ${credentials}`;
      }
    }

    return headers;
  };

  const handleSend = async () => {
    setError("");
    setResponse(null);
    setLoading(true);

    const headers = buildEffectiveHeaders();
    const r = await sendAPIRequest({ method, url, headers, body, contentType });
    setLoading(false);

    if (r.status === "error") {
      setError(r.error || "Request failed");
    } else if (r.data) {
      setResponse(r.data);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleLoadPreset = (preset: typeof API_PRESETS[0]) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setHeaderRows(
      Object.entries(preset.headers).map(([k, v], i) => ({
        id: String(i),
        key: k,
        value: v,
        enabled: true,
      }))
    );
    setBody(preset.body);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const handleImportCurl = () => {
    if (!curlImportText.trim()) return;
    const parsed = parseCurl(curlImportText);
    if (!parsed) {
      toast.error("Could not parse cURL command.");
      return;
    }
    setMethod(parsed.method);
    setUrl(parsed.url);
    setHeaderRows(
      Object.entries(parsed.headers).map(([k, v], i) => ({
        id: String(i),
        key: k,
        value: v,
        enabled: true,
      }))
    );
    if (parsed.body) {
      setBody(parsed.body);
    }
    toast.success("Successfully imported cURL command!");
  };

  const generatedCurl = useMemo(() => {
    return generateCurl({
      method,
      url,
      headers: buildEffectiveHeaders(),
      body,
    });
  }, [method, url, headerRows, authType, bearerToken, basicUser, basicPass, body]);

  const addHeaderRow = () => {
    setHeaderRows((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), key: "", value: "", enabled: true },
    ]);
  };

  const updateHeaderRow = (id: string, field: "key" | "value" | "enabled", val: string | boolean) => {
    setHeaderRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const removeHeaderRow = (id: string) => {
    setHeaderRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Presets Row */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground mr-1">Presets:</span>
        {API_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handleLoadPreset(p)}
            className="px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 border text-[11px] font-medium transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Request Bar */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="h-10 text-xs font-bold border rounded-lg px-3 bg-background shrink-0"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <Input
          placeholder="https://api.example.com/endpoint"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 font-mono text-xs h-10"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <Button onClick={handleSend} disabled={loading} className="gap-1.5 h-10 shrink-0 px-5 text-xs">
          {loading ? (
            <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Send Request
        </Button>
      </div>

      {/* Request Configuration Tabs */}
      <div className="space-y-3">
        <Tabs value={activeReqTab} onValueChange={(v) => setActiveReqTab(v as any)}>
          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger value="headers" className="text-xs gap-1">
              <Sliders className="h-3.5 w-3.5" /> Headers ({headerRows.filter((r) => r.enabled && r.key).length})
            </TabsTrigger>
            <TabsTrigger value="auth" className="text-xs gap-1">
              <Key className="h-3.5 w-3.5" /> Auth
            </TabsTrigger>
            <TabsTrigger value="body" className="text-xs gap-1">
              <FileText className="h-3.5 w-3.5" /> Body
            </TabsTrigger>
            <TabsTrigger value="curl" className="text-xs gap-1">
              <Terminal className="h-3.5 w-3.5" /> cURL
            </TabsTrigger>
          </TabsList>

          {/* Headers Editor Tab */}
          <TabsContent value="headers" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">HTTP Request Headers</Label>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addHeaderRow}>
                <Plus className="h-3 w-3" /> Add Header
              </Button>
            </div>

            <div className="border rounded-xl divide-y text-xs overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-muted/50 p-2 font-semibold text-muted-foreground">
                <div className="col-span-1 text-center">Active</div>
                <div className="col-span-5">Header Key</div>
                <div className="col-span-5">Value</div>
                <div className="col-span-1 text-center">Delete</div>
              </div>
              {headerRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-muted/20">
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => updateHeaderRow(row.id, "enabled", e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      value={row.key}
                      onChange={(e) => updateHeaderRow(row.id, "key", e.target.value)}
                      placeholder="e.g. Content-Type, Authorization"
                      className="h-7 font-mono text-xs"
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      value={row.value}
                      onChange={(e) => updateHeaderRow(row.id, "value", e.target.value)}
                      placeholder="e.g. application/json"
                      className="h-7 font-mono text-xs"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeHeaderRow(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Auth Tab */}
          <TabsContent value="auth" className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Label className="text-xs font-semibold">Authentication Type:</Label>
              <div className="flex gap-1.5">
                {(["none", "bearer", "basic"] as const).map((t) => (
                  <Button
                    key={t}
                    variant={authType === t ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs capitalize"
                    onClick={() => setAuthType(t)}
                  >
                    {t === "none" ? "No Auth" : t === "bearer" ? "Bearer Token" : "Basic Auth"}
                  </Button>
                ))}
              </div>
            </div>

            {authType === "bearer" && (
              <div className="space-y-1.5 max-w-md">
                <Label className="text-xs">Token / JWT</Label>
                <Input
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="font-mono text-xs h-8"
                />
              </div>
            )}

            {authType === "basic" && (
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <div className="space-y-1">
                  <Label className="text-xs">Username</Label>
                  <Input
                    value={basicUser}
                    onChange={(e) => setBasicUser(e.target.value)}
                    placeholder="admin"
                    className="font-mono text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Password</Label>
                  <Input
                    type="password"
                    value={basicPass}
                    onChange={(e) => setBasicPass(e.target.value)}
                    placeholder="••••••••"
                    className="font-mono text-xs h-8"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Body Tab */}
          <TabsContent value="body" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">Request Payload</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Content-Type:</span>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-background"
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{\n  "title": "New item",\n  "completed": false\n}'
              className="min-h-36 font-mono text-xs leading-relaxed"
            />
          </TabsContent>

          {/* cURL Import / Export Tab */}
          <TabsContent value="curl" className="space-y-3 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">Equivalent cURL Command</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleCopy(generatedCurl, "curl")}
                >
                  {copiedKey === "curl" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  Copy cURL
                </Button>
              </div>
              <pre className="p-3 rounded-xl border bg-muted/30 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                {generatedCurl}
              </pre>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold">Import from cURL Command</Label>
              <div className="flex gap-2">
                <Input
                  value={curlImportText}
                  onChange={(e) => setCurlImportText(e.target.value)}
                  placeholder="Paste curl -X POST ... command here"
                  className="font-mono text-xs"
                />
                <Button variant="secondary" size="sm" onClick={handleImportCurl} className="h-9 text-xs">
                  Import
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Response Panel */}
      {response && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <Badge variant={response.status < 300 ? "default" : response.status < 500 ? "outline" : "destructive"}>
                  {response.status} {response.statusText}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" /> {response.time}ms
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {response.size.toLocaleString()} bytes
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleCopy(response.body, "resp-body")}
                >
                  {copiedKey === "resp-body" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  Copy Body
                </Button>
              </div>
            </div>

            {/* Response Body */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Response Payload</Label>
              <pre className="p-3 rounded-xl border bg-muted/40 font-mono text-xs overflow-x-auto max-h-72 whitespace-pre-wrap">
                {response.body}
              </pre>
            </div>

            {/* Response Headers */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Response Headers</Label>
              <pre className="p-3 rounded-xl border bg-muted/20 font-mono text-[11px] overflow-x-auto max-h-36 whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}