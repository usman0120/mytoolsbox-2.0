"use client";

import { useState } from "react";
import {
  Send,
  Copy,
  Check,
  Clock,
  KeyRound,
  History,
  ShieldCheck,
  FileCode,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  sendWebhook,
  generateWebhookPayload,
  WEBHOOK_TEMPLATES,
  type WebhookResponse,
} from "@/features/tools/webhook-tester";
import { toast } from "sonner";

export function WebhookTesterEngine() {
  const [url, setUrl] = useState("https://httpbin.org/post");
  const [body, setBody] = useState(() => generateWebhookPayload("github"));
  const [contentType, setContentType] = useState("application/json");
  const [template, setTemplate] = useState("github");

  // HMAC Secret Signing
  const [enableSecret, setEnableSecret] = useState(false);
  const [secret, setSecret] = useState("whsec_sampleSecretKey123");
  const [sigType, setSigType] = useState<"x-hub-signature-256" | "stripe-signature">("x-hub-signature-256");

  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<WebhookResponse[]>([]);

  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    setBody(generateWebhookPayload(val));
    if (val === "stripe") {
      setSigType("stripe-signature");
    } else {
      setSigType("x-hub-signature-256");
    }
  };

  const handleSend = async () => {
    setError("");
    setResponse(null);
    setLoading(true);

    const r = await sendWebhook({
      url,
      method: "POST",
      headers: {},
      body,
      contentType,
      secret: enableSecret ? secret : undefined,
      signatureHeader: enableSecret ? sigType : undefined,
    });

    setLoading(false);
    if (r.status === "error") {
      setError(r.error || "Webhook dispatch failed");
    } else if (r.data) {
      setResponse(r.data);
      setHistory((prev) => [r.data!, ...prev].slice(0, 10));
      toast.success(`Webhook delivered! Status: ${r.data.status}`);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      {/* Target URL */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Target Webhook Receiver URL</Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://your-domain.com/api/webhooks/stripe or https://hooks.slack.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 font-mono text-xs h-10"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} disabled={loading} className="gap-1.5 h-10 px-5 text-xs shrink-0">
            {loading ? (
              <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Trigger Webhook
          </Button>
        </div>
      </div>

      {/* Template selector & HMAC Signature Option */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground font-semibold">Payload Preset:</span>
          {WEBHOOK_TEMPLATES.map((t) => (
            <Button
              key={t.value}
              variant={template === t.value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleTemplateChange(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <Button
          variant={enableSecret ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs gap-1.5 ml-auto"
          onClick={() => setEnableSecret(!enableSecret)}
        >
          <KeyRound className="h-3 w-3" />
          {enableSecret ? "HMAC Signing: Enabled" : "Add HMAC Secret"}
        </Button>
      </div>

      {/* HMAC Secret Config Panel */}
      {enableSecret && (
        <Card className="bg-muted/20 border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> HMAC-SHA256 Signature Generator
              </span>
              <span className="text-[11px] text-muted-foreground">Calculates cryptographic hash automatically</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Webhook Secret Key</Label>
                <Input
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="font-mono text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Signature Header Format</Label>
                <select
                  value={sigType}
                  onChange={(e) => setSigType(e.target.value as any)}
                  className="w-full text-xs border rounded-md px-2 py-1.5 bg-background font-mono"
                >
                  <option value="x-hub-signature-256">X-Hub-Signature-256 (GitHub / Standard)</option>
                  <option value="stripe-signature">Stripe-Signature (t=timestamp,v1=hash)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Payload Editor */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground">JSON Webhook Payload</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground"
            onClick={() => handleCopy(body, "body-copy")}
          >
            {copiedKey === "body-copy" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            Copy JSON
          </Button>
        </div>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-52 font-mono text-xs leading-relaxed"
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Response Panel */}
      {response && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <Badge variant={response.status < 300 ? "default" : "destructive"}>
                  {response.status} {response.statusText}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" /> {response.time}ms
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  Delivered at {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleCopy(response.body, "resp-body")}
              >
                {copiedKey === "resp-body" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                Copy Response
              </Button>
            </div>

            <pre className="p-3 rounded-xl border bg-muted/40 font-mono text-xs overflow-x-auto max-h-56 whitespace-pre-wrap">
              {response.body || "(Empty response body)"}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Dispatch History */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" /> Recent Deliveries ({history.length})
          </span>
          <div className="border rounded-xl divide-y text-xs overflow-hidden">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 hover:bg-muted/30 cursor-pointer"
                onClick={() => setResponse(h)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={h.status < 300 ? "default" : "destructive"} className="text-[10px]">
                    {h.status}
                  </Badge>
                  <span className="font-mono text-muted-foreground">{h.time}ms</span>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}