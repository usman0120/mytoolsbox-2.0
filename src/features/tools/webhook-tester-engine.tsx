"use client";

import { useState } from "react";
import { Copy, Check, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendWebhook, generateWebhookPayload, WEBHOOK_TEMPLATES, type WebhookResponse } from "@/features/tools/webhook-tester";

export function WebhookTesterEngine() {
  const [url, setUrl] = useState("");
  const [method] = useState("POST");
  const [body, setBody] = useState("");
  const [contentType, setContentType] = useState("application/json");
  const [template, setTemplate] = useState("custom");
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [history, setHistory] = useState<WebhookResponse[]>([]);

  const handleTemplateChange = (value: string | null) => {
    const val = value || "custom";
    setTemplate(val);
    setBody(generateWebhookPayload(val));
  };

  const handleSend = async () => {
    setError("");
    setResponse(null);
    setLoading(true);
    const r = await sendWebhook({ url, method, headers: {}, body, contentType });
    setLoading(false);
    if (r.status === "error") {
      setError(r.error || "Request failed");
    } else {
      setResponse(r.data as WebhookResponse);
      setHistory((prev) => [r.data as WebhookResponse, ...prev].slice(0, 10));
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      {/* URL */}
      <div className="flex gap-2">
        <Input
          placeholder="https://hooks.slack.com/services/..."
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

      {/* Template + Content Type */}
      <div className="flex gap-2">
        <Select value={template} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEBHOOK_TEMPLATES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={contentType} onValueChange={(v) => setContentType(v ?? "")}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="application/json">application/json</SelectItem>
            <SelectItem value="application/x-www-form-urlencoded">x-www-form-urlencoded</SelectItem>
            <SelectItem value="text/plain">text/plain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payload */}
      <div>
        <Label className="text-xs mb-1 block">Payload</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-37.5 font-mono text-xs"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Response */}
      {response && (
        <div className="space-y-3 animate-fade-in-up">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={response.status < 300 ? "default" : "destructive"}>
              {response.status} {response.statusText}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" /> {response.time}ms
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {new Date(response.timestamp).toLocaleTimeString()}
            </Badge>
          </div>

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
              <pre className="text-xs font-mono max-h-62.5 overflow-y-auto whitespace-pre-wrap">
                {response.body}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2">Recent Requests</p>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs cursor-pointer hover:bg-muted"
                onClick={() => setResponse(h)}
              >
                <Badge variant={h.status < 300 ? "default" : "destructive"} className="text-[10px]">
                  {h.status}
                </Badge>
                <span className="text-muted-foreground">{h.time}ms</span>
                <span className="text-muted-foreground">{new Date(h.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}