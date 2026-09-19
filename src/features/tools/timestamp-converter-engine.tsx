"use client";

import { useState } from "react";
import { Clock, Copy, Check, Calendar, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { convertTimestamp } from "@/features/tools/timestamp-converter";

const FORMATS = [
  { value: "iso", label: "ISO 8601", icon: Globe },
  { value: "unix", label: "Unix (seconds)", icon: Clock },
  { value: "utc", label: "UTC String", icon: Globe },
  { value: "local", label: "Local String", icon: Calendar },
  { value: "relative", label: "Relative", icon: Clock },
] as const;

export function TimestampConverterEngine() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const handleConvert = () => {
    setError("");
    const r = convertTimestamp(input, "iso");
    if (r.status === "error") {
      setError(r.error || "Invalid input");
      setResult(null);
    } else {
      setResult(r.data as Record<string, string>);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handleNow = () => {
    setInput(String(Math.floor(Date.now() / 1000)));
    setTimeout(() => handleConvert(), 50);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Timestamp or Date</Label>
          <Input
            placeholder="e.g. 1700000000 or 2024-01-01T00:00:00Z"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConvert()}
          />
        </div>
        <div className="flex items-end gap-1">
          <Button onClick={handleConvert} size="sm" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Convert
          </Button>
          <Button variant="outline" size="sm" onClick={handleNow}>
            Now
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {result && (
        <div className="space-y-2">
          {FORMATS.map((fmt) => (
            <Card key={fmt.value}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <fmt.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{fmt.label}</p>
                    <p className="text-sm font-mono truncate">{result[fmt.value]}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleCopy(result[fmt.value], fmt.value)}
                >
                  {copiedKey === fmt.value ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}