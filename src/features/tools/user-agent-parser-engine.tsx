"use client";

import { useState } from "react";
import { Monitor, Copy, Check, Search, Smartphone, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { parseUserAgent, type ParsedUA } from "@/features/tools/user-agent-parser";

export function UserAgentParserEngine() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ParsedUA | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const handleParse = () => {
    setError("");
    const r = parseUserAgent(input);
    if (r.status === "error") {
      setError(r.error || "Error");
      setResult(null);
    } else {
      setResult(r.data as ParsedUA);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handlePasteMyUA = async () => {
    setInput(navigator.userAgent);
    setTimeout(() => handleParse(), 50);
  };

  const DeviceIcon = result?.device?.type === "Mobile"
    ? Smartphone
    : result?.device?.type === "Tablet"
    ? MonitorSmartphone
    : Monitor;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">User-Agent String</Label>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handlePasteMyUA}>
            Use My UA
          </Button>
        </div>
        <Textarea
          placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-20 font-mono text-xs"
        />
      </div>

      <Button onClick={handleParse} className="w-full gap-2">
        <Search className="h-4 w-4" /> Parse User-Agent
      </Button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Device Type */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <DeviceIcon className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">{result.device.type}</p>
              <p className="text-xs text-muted-foreground">
                {result.device.vendor} {result.device.model}
              </p>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Browser", value: `${result.browser.name} ${result.browser.version}`, key: "browser" },
              { label: "OS", value: `${result.os.name} ${result.os.version}`, key: "os" },
              { label: "Engine", value: `${result.engine.name} ${result.engine.version}`, key: "engine" },
              { label: "Device", value: result.device.type, key: "device" },
            ].map((item) => (
              <Card key={item.key}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium truncate">{item.value}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleCopy(item.value, item.key)}
                  >
                    {copied === item.key ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Raw */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-muted-foreground">Raw UA</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleCopy(result.raw, "raw")}
                >
                  {copied === "raw" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs font-mono break-all text-muted-foreground">{result.raw}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}