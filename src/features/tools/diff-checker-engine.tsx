"use client";

import { useState } from "react";
import { GitCompare, Copy, Check, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { computeDiff, DiffMode } from "@/features/tools/diff-checker";

export function DiffCheckerEngine() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [mode, setMode] = useState<DiffMode>("lines");
  const [result, setResult] = useState<ReturnType<typeof computeDiff> | null>(null);

  const handleCompare = () => {
    setResult(computeDiff(text1, text2, mode));
  };

  const handleSwap = () => {
    setText1(text2);
    setText2(text1);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["lines", "words", "chars"] as const).map((m) => (
          <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => { setMode(m); setResult(null); }}>
            By {m}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm mb-1.5 block">Original</Label>
          <Textarea
            placeholder="Paste original text..."
            className="min-h-37.5 font-mono text-sm"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Modified</Label>
          <Textarea
            placeholder="Paste modified text..."
            className="min-h-37.5 font-mono text-sm"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCompare} className="flex-1 gap-2" disabled={!text1 || !text2}>
          <GitCompare className="h-4 w-4" /> Compare
        </Button>
        <Button variant="outline" size="icon" onClick={handleSwap}>
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      {result && (
        <div>
          <Label className="text-sm mb-1.5 block">Diff Result</Label>
          <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap">
            {result.map((part, i) => (
              <span
                key={i}
                className={
                  part.type === "added"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    : part.type === "removed"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                    : ""
                }
              >
                {part.value}
              </span>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}