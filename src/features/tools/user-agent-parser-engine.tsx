"use client";

import { useState, useMemo } from "react";
import {
  Monitor,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Bot,
  Tv,
  Gamepad2,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  parseUserAgent,
  SAMPLE_USER_AGENTS,
  ParsedUA,
} from "@/features/tools/user-agent-parser";
import { toast } from "sonner";

export function UserAgentParserEngine() {
  const [input, setInput] = useState(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live parsing
  const result = useMemo(() => {
    return parseUserAgent(input);
  }, [input]);

  const parsed = result.status === "success" && result.data ? result.data : null;

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handlePasteMyUA = () => {
    if (typeof navigator !== "undefined") {
      setInput(navigator.userAgent);
      toast.success("Loaded your browser's current User-Agent!");
    }
  };

  const getDeviceIcon = (type: ParsedUA["device"]["type"]) => {
    switch (type) {
      case "Mobile":
        return <Smartphone className="h-6 w-6 text-primary" />;
      case "Tablet":
        return <Tablet className="h-6 w-6 text-primary" />;
      case "Bot":
        return <Bot className="h-6 w-6 text-amber-500" />;
      case "SmartTV":
        return <Tv className="h-6 w-6 text-purple-500" />;
      case "Console":
        return <Gamepad2 className="h-6 w-6 text-emerald-500" />;
      case "Desktop":
        return <Monitor className="h-6 w-6 text-primary" />;
      default:
        return <HelpCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Input area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">User-Agent String</Label>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handlePasteMyUA}
          >
            <Sparkles className="h-3 w-3 text-primary" /> Use My Browser User-Agent
          </Button>
        </div>

        <Textarea
          placeholder="Paste or type User-Agent header..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-24 font-mono text-xs leading-relaxed"
        />

        {/* Sample presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground mr-1">Presets:</span>
          {SAMPLE_USER_AGENTS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => setInput(sample.ua)}
              className="px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 border text-[11px] font-medium transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {parsed ? (
        <div className="space-y-4">
          {/* Main Hero Header */}
          <div className="p-4 rounded-2xl border bg-muted/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-background border shadow-sm">
                {getDeviceIcon(parsed.device.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground">
                    {parsed.browser.name} {parsed.browser.version}
                  </h3>
                  <Badge variant={parsed.bot?.isBot ? "destructive" : "secondary"}>
                    {parsed.device.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Running on <strong>{parsed.os.name} {parsed.os.version}</strong>
                  {parsed.os.arch && ` (${parsed.os.arch})`}
                </p>
              </div>
            </div>

            {parsed.bot?.isBot && (
              <Badge variant="outline" className="text-xs border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-1 px-3">
                <Bot className="h-3.5 w-3.5" />
                {parsed.bot.name} ({parsed.bot.category})
              </Badge>
            )}
          </div>

          {/* Cards Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Browser */}
            <Card className="bg-muted/10">
              <CardContent className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Browser</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(`${parsed.browser.name} ${parsed.browser.version}`, "browser")}
                  >
                    {copiedKey === "browser" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="font-bold text-sm">{parsed.browser.name}</p>
                <p className="text-xs font-mono text-muted-foreground truncate">v{parsed.browser.version}</p>
              </CardContent>
            </Card>

            {/* Operating System */}
            <Card className="bg-muted/10">
              <CardContent className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Operating System</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(`${parsed.os.name} ${parsed.os.version}`, "os")}
                  >
                    {copiedKey === "os" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="font-bold text-sm">{parsed.os.name}</p>
                <p className="text-xs font-mono text-muted-foreground truncate">{parsed.os.version}</p>
              </CardContent>
            </Card>

            {/* Device / Hardware */}
            <Card className="bg-muted/10">
              <CardContent className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Hardware / Device</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(`${parsed.device.vendor} ${parsed.device.model}`, "device")}
                  >
                    {copiedKey === "device" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="font-bold text-sm">{parsed.device.model}</p>
                <p className="text-xs text-muted-foreground truncate">Vendor: {parsed.device.vendor}</p>
              </CardContent>
            </Card>

            {/* Engine */}
            <Card className="bg-muted/10">
              <CardContent className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Rendering Engine</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(parsed.engine.name, "engine")}
                  >
                    {copiedKey === "engine" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="font-bold text-sm">{parsed.engine.name}</p>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {parsed.engine.version ? `v${parsed.engine.version}` : "Standard"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* JSON Export */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">Structured JSON Representation</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={() => handleCopy(JSON.stringify(parsed, null, 2), "json")}
              >
                {copiedKey === "json" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                Copy JSON
              </Button>
            </div>
            <pre className="p-3 rounded-xl border bg-muted/30 font-mono text-xs overflow-x-auto max-h-48 text-muted-foreground">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-xs">
          {result.error}
        </div>
      )}
    </div>
  );
}