"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  ShieldCheck,
  FileCheck,
  Columns,
} from "lucide-react";

interface MatchResult {
  sentence: string;
  similarity: number;
  matchType: "exact" | "high" | "moderate" | "unique";
  matchedWith?: string;
}

export function PlagiarismCheckerEngine() {
  const [input, setInput] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [compareMode, setCompareMode] = useState<"self" | "reference">("self");
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(
    () => (input.trim() ? input.trim().split(/\s+/).length : 0),
    [input]
  );

  const handleCheck = useCallback(async () => {
    if (!input.trim()) {
      toast.error("Please enter some text to check.");
      return;
    }

    if (input.trim().length < 30) {
      toast.error("Please enter at least 30 characters for analysis.");
      return;
    }

    setIsChecking(true);

    try {
      const sentences = input
        .replace(/([.!?])\s+/g, "$1|")
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 12);

      const findings: MatchResult[] = [];

      if (compareMode === "reference" && referenceText.trim()) {
        // Compare against reference text
        const refSentences = referenceText
          .replace(/([.!?])\s+/g, "$1|")
          .split("|")
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s.length > 10);

        for (const s of sentences) {
          const sLower = s.toLowerCase();
          const sWords = new Set(sLower.replace(/[^a-z0-9\s]/g, "").split(/\s+/));

          let bestSim = 0;
          let bestMatch = "";

          for (const ref of refSentences) {
            if (sLower === ref) {
              bestSim = 100;
              bestMatch = ref;
              break;
            }
            const refWords = new Set(ref.replace(/[^a-z0-9\s]/g, "").split(/\s+/));
            const intersect = new Set([...sWords].filter((x) => refWords.has(x)));
            const union = new Set([...sWords, ...refWords]);
            const jaccard = union.size > 0 ? (intersect.size / union.size) * 100 : 0;

            if (jaccard > bestSim) {
              bestSim = jaccard;
              bestMatch = ref;
            }
          }

          if (bestSim >= 85) {
            findings.push({
              sentence: s,
              similarity: Math.round(bestSim),
              matchType: bestSim === 100 ? "exact" : "high",
              matchedWith: bestMatch,
            });
          } else if (bestSim >= 50) {
            findings.push({
              sentence: s,
              similarity: Math.round(bestSim),
              matchType: "moderate",
              matchedWith: bestMatch,
            });
          } else {
            findings.push({
              sentence: s,
              similarity: Math.round(bestSim),
              matchType: "unique",
            });
          }
        }
      } else {
        // Self-redundancy check
        for (let i = 0; i < sentences.length; i++) {
          const s = sentences[i];
          const sWords = new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/));
          let maxSim = 0;
          let matched = "";

          for (let j = 0; j < sentences.length; j++) {
            if (i === j) continue;
            const other = sentences[j];
            const otherWords = new Set(other.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/));
            const intersect = new Set([...sWords].filter((x) => otherWords.has(x)));
            const union = new Set([...sWords, ...otherWords]);
            const sim = union.size > 0 ? (intersect.size / union.size) * 100 : 0;

            if (sim > maxSim) {
              maxSim = sim;
              matched = other;
            }
          }

          if (maxSim >= 65) {
            findings.push({
              sentence: s,
              similarity: Math.round(maxSim),
              matchType: maxSim >= 90 ? "exact" : "high",
              matchedWith: matched,
            });
          } else if (maxSim >= 40) {
            findings.push({
              sentence: s,
              similarity: Math.round(maxSim),
              matchType: "moderate",
              matchedWith: matched,
            });
          } else {
            findings.push({
              sentence: s,
              similarity: Math.round(maxSim),
              matchType: "unique",
            });
          }
        }
      }

      setResults(findings);
      toast.success("Plagiarism and uniqueness scan complete!");
    } catch {
      toast.error("Analysis failed. Please check input text.");
    } finally {
      setIsChecking(false);
    }
  }, [input, referenceText, compareMode]);

  const uniquenessScore = useMemo(() => {
    if (!results || results.length === 0) return 100;
    const flagged = results.filter((r) => r.matchType === "exact" || r.matchType === "high");
    return Math.max(0, Math.round(100 - (flagged.length / results.length) * 100));
  }, [results]);

  const handleCopyReport = async () => {
    if (!results) return;
    const report =
      `PLAGIARISM & UNIQUENESS REPORT\n` +
      `Overall Uniqueness Score: ${uniquenessScore}%\n` +
      `Total Sentences Scanned: ${results.length}\n\n` +
      results
        .filter((r) => r.matchType !== "unique")
        .map(
          (r, idx) =>
            `[#${idx + 1}] Similarity: ${r.similarity}% (${r.matchType.toUpperCase()})\n` +
            `Sentence: "${r.sentence}"\n` +
            (r.matchedWith ? `Matched With: "${r.matchedWith}"\n` : "")
        )
        .join("\n");

    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Audit report copied!");
  };

  const handleDownload = () => {
    if (!results) return;
    const report =
      `PLAGIARISM & UNIQUENESS AUDIT REPORT\n` +
      `Generated: ${new Date().toLocaleString()}\n` +
      `Uniqueness Score: ${uniquenessScore}%\n\n` +
      results
        .map(
          (r) =>
            `[${r.matchType.toUpperCase()} - ${r.similarity}%]\n${r.sentence}\n` +
            (r.matchedWith ? `Ref: ${r.matchedWith}\n` : "")
        )
        .join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uniqueness-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded report!");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Scan Mode:</span>
          <Button
            variant={compareMode === "self" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCompareMode("self");
              setResults(null);
            }}
            className="text-xs h-8 gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Self-Redundancy & Fingerprint
          </Button>
          <Button
            variant={compareMode === "reference" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCompareMode("reference");
              setResults(null);
            }}
            className="text-xs h-8 gap-1.5"
          >
            <Columns className="h-3.5 w-3.5" /> Compare Against Source / Reference
          </Button>
        </div>
      </div>

      {/* Input Areas */}
      <div className={`grid grid-cols-1 ${compareMode === "reference" ? "md:grid-cols-2" : ""} gap-4`}>
        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <label className="text-sm font-semibold">Content to Check</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{wordCount} words</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput("");
                  setResults(null);
                }}
                disabled={!input}
                className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your essay, article, or document here to check for uniqueness and overlapping sentences..."
            className="min-h-52 font-mono text-xs leading-relaxed"
          />
        </div>

        {compareMode === "reference" && (
          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b mb-3">
              <label className="text-sm font-semibold">Reference / Source Document</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReferenceText("")}
                disabled={!referenceText}
                className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
            <Textarea
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Paste original source text, competitors article, or published material to check direct overlap..."
              className="min-h-52 font-mono text-xs leading-relaxed"
            />
          </div>
        )}
      </div>

      <Button onClick={handleCheck} disabled={!input.trim() || isChecking} className="w-full gap-2 font-medium">
        {isChecking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Sentence Overlaps...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" /> Run Plagiarism & Uniqueness Scan
          </>
        )}
      </Button>

      {/* Results Card */}
      {results && (
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center h-12 w-12 rounded-xl font-bold text-lg border ${
                  uniquenessScore >= 80
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : uniquenessScore >= 50
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                }`}
              >
                {uniquenessScore}%
              </div>
              <div>
                <span className="text-sm font-semibold block">
                  {uniquenessScore >= 80
                    ? "High Originality Content"
                    : uniquenessScore >= 50
                    ? "Moderate Overlap Detected"
                    : "High Plagiarism / Repetition Risk"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {results.length} sentences analyzed •{" "}
                  {results.filter((r) => r.matchType !== "unique").length} flagged
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={handleCopyReport} className="gap-1.5 h-8 text-xs">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                Copy Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 h-8 text-xs">
                <Download className="h-3.5 w-3.5" /> Download Report
              </Button>
            </div>
          </div>

          {/* Sentence by Sentence Breakdown */}
          <div className="space-y-2">
            {results.map((res, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  res.matchType === "exact"
                    ? "border-rose-500/40 bg-rose-500/5 text-foreground"
                    : res.matchType === "high"
                    ? "border-amber-500/40 bg-amber-500/5 text-foreground"
                    : res.matchType === "moderate"
                    ? "border-sky-500/30 bg-sky-500/5 text-foreground"
                    : "border-border/40 bg-card text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant={
                      res.matchType === "exact"
                        ? "destructive"
                        : res.matchType === "high"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[10px] capitalize font-mono"
                  >
                    {res.similarity}% {res.matchType}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Sentence #{i + 1}
                  </span>
                </div>
                <p className="font-mono text-foreground">{res.sentence}</p>
                {res.matchedWith && (
                  <p className="mt-1 text-[11px] text-muted-foreground border-t pt-1 italic">
                    Matched with: &ldquo;{res.matchedWith}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}