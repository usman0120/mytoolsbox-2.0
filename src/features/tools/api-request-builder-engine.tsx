"use client";

import { useState } from "react";
import { Send, Copy, Check, Trash2, Plus, X, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendAPIRequest, formatHeaders, HTTP_METHODS, CONTENT_TYPES, type APIResponse } from "@/features/tools/api-request";

export function APIRequestBuilderEngine() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headersText, setHeadersText] = useState("");
  const [body, setBody] = useState("");
  const [contentType, setContentType] = useState("application/json");
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [showHeaders, setShowHeaders] = useState(false);
  const [showBody, setShowBody] = useState(false);

  const handleSend = async () => {
    setError("");
    setResponse(null);
    setLoading(true);
    const headers = formatHeaders(headersText);
    const r = await sendAPIRequest({ method, url, headers, body, contentType });
    setLoading(false);
    if (r.status === "error") {
      setError(r.error || "Request failed");
    } else {
      setResponse(r.data as APIResponse);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const hasBody = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  return (
    <div className="space-y-4">
      {/* Method + URL */}
      <div className="flex gap-2">
        <Select value={method} onValueChange={(v) => setMethod(v ?? "")}>
          <SelectTrigger className="w-27.5 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="https://api.example.com/endpoint"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 font-mono text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} disabled={loading} className="gap-1.5 shrink-0">
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send
        </Button>
      </div>

      {/* Headers toggle */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setShowHeaders(!showHeaders)}
        >
          {showHeaders ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          Headers
        </Button>
        {showHeaders && (
          <Textarea
            placeholder="Content-Type: application/json&#10;Authorization: Bearer token123"
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            className="mt-1 min-h-20 font-mono text-xs"
          />
        )}
      </div>

      {/* Body toggle */}
      {hasBody && (
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowBody(!showBody)}
            >
              {showBody ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              Body
            </Button>
            {showBody && (
              <Select value={contentType} onValueChange={(v) => setContentType(v ?? "")}>
                <SelectTrigger className="h-7 w-45 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct} className="text-xs">{ct}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {showBody && (
            <Textarea
              placeholder='{"key": "value"}'
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 min-h-25 font-mono text-xs"
            />
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Response */}
      {response && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Status Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={response.status < 300 ? "default" : response.status < 500 ? "outline" : "destructive"}>
              {response.status} {response.statusText}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" /> {response.time}ms
            </Badge>
            <Badge variant="secondary">{response.size} bytes</Badge>
          </div>

          {/* Response Headers */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium">Response Headers</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleCopy(JSON.stringify(response.headers, null, 2), "headers")}
                >
                  {copied === "headers" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <pre className="text-xs font-mono max-h-37.5 overflow-y-auto whitespace-pre-wrap">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Response Body */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium">Response Body</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleCopy(response.body, "body")}
                >
                  {copied === "body" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <pre className="text-xs font-mono max-h-75 overflow-y-auto whitespace-pre-wrap">
                {response.body}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}