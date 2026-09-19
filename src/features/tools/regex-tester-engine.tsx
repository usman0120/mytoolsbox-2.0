"use client";

import { useState } from "react";
import { Regex, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { testRegex } from "@/features/tools/regex-tester";

export function RegexTesterEngine() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof testRegex> | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = () => {
    setResult(testRegex(pattern, text, flags));
  };

  const handleCopy = async () => {
    if (result?.data) {
      await navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-3">
          <Label className="text-sm mb-1.5 block">Pattern</Label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 rounded-md border bg-muted text-muted-foreground font-mono text-sm">/</span>
            <Input
              placeholder="e.g. [A-Z]+"
              className="font-mono"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
            <span className="flex items-center px-3 rounded-md border bg-muted text-muted-foreground font-mono text-sm">/</span>
          </div>
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Flags</Label>
          <Input
            placeholder="g"
            className="font-mono"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-sm mb-1.5 block">Test String</Label>
        <Textarea
          placeholder="Enter text to test against..."
          className="min-h-[120px] font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <Button onClick={handleTest} className="w-full gap-2" disabled={!pattern.trim() || !text.trim()}>
        <Regex className="h-4 w-4" /> Test Regex
      </Button>

      {result && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-sm">
              {result.status === "success" ? result.message : "Error"}
            </Label>
            {result.data != null && (
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          {result.status === "error" ? (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{result.message}</div>
          ) : result.data ? (
            <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-64">
              {JSON.stringify(result.data as string[], null, 2)}
            </pre>
          ) : (
            <div className="p-4 rounded-lg bg-muted text-sm text-center text-muted-foreground">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}