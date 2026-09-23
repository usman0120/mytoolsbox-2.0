"use client";

import { useState } from "react";
import { FileText, Copy, Check, Download, RefreshCw, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateLoremIpsum,
  LoremTheme,
  LoremUnit,
} from "@/features/tools/lorem-ipsum";
import { toast } from "sonner";

export function LoremIpsumEngine() {
  const [theme, setTheme] = useState<LoremTheme>("classic");
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState(3);
  const [sentences, setSentences] = useState(5);
  const [words, setWords] = useState(10);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [htmlTags, setHtmlTags] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const text = generateLoremIpsum(count, sentences, words, {
      theme,
      unit,
      count,
      sentencesPerParagraph: sentences,
      wordsPerSentence: words,
      startWithLorem,
      htmlTags,
    });
    setOutput(text);
    toast.success("Generated placeholder text!");
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = htmlTags ? "html" : "txt";
    const mime = htmlTags ? "text/html;charset=utf-8" : "text/plain;charset=utf-8";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lorem-ipsum-${theme}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded .${ext} file!`);
  };

  const wordCount = output ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        {/* Themes */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Vocabulary Theme
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "classic", label: "Classic Cicero", sub: "Standard Latin" },
              { id: "tech", label: "Tech & Dev", sub: "Kubernetes, APIs, React" },
              { id: "business", label: "Corporate", sub: "Synergy, KPIs, Agile" },
              { id: "hipster", label: "Hipster & Artisan", sub: "Cold-brew, Vinyl, Craft" },
            ].map((t) => (
              <Button
                key={t.id}
                variant={theme === t.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(t.id as LoremTheme)}
                className="flex flex-col h-auto py-2 items-start text-left"
              >
                <span className="font-semibold text-xs">{t.label}</span>
                <span className="text-[10px] opacity-70 truncate w-full">{t.sub}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Units */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Generation Unit
          </Label>
          <div className="flex flex-wrap gap-2">
            {(["paragraphs", "sentences", "words", "list"] as LoremUnit[]).map((u) => (
              <Button
                key={u}
                variant={unit === u ? "default" : "outline"}
                size="sm"
                onClick={() => setUnit(u)}
                className="capitalize text-xs h-8"
              >
                {u}
              </Button>
            ))}
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <Label className="text-xs font-medium mb-1 block">
              Count of {unit.charAt(0).toUpperCase() + unit.slice(1)}
            </Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
              className="h-9"
            />
          </div>

          {unit === "paragraphs" && (
            <>
              <div>
                <Label className="text-xs font-medium mb-1 block">Sentences per Paragraph</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={sentences}
                  onChange={(e) => setSentences(Math.max(1, Number(e.target.value) || 1))}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">Words per Sentence</Label>
                <Input
                  type="number"
                  min={3}
                  max={40}
                  value={words}
                  onChange={(e) => setWords(Math.max(3, Number(e.target.value) || 3))}
                  className="h-9"
                />
              </div>
            </>
          )}
        </div>

        {/* Formatting Checkboxes */}
        <div className="flex flex-wrap gap-4 pt-2 border-t">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded"
            />
            Start with &quot;Lorem ipsum dolor sit amet...&quot;
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={htmlTags}
              onChange={(e) => setHtmlTags(e.target.checked)}
              className="rounded"
            />
            Wrap with HTML tags (&lt;p&gt;, &lt;li&gt;, &lt;ul&gt;)
          </label>
        </div>

        <Button onClick={handleGenerate} className="w-full gap-2 font-medium">
          <RefreshCw className="h-4 w-4" /> Generate Lorem Ipsum Text
        </Button>
      </div>

      {/* Output Display */}
      {output && (
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Generated Output</Label>
              <span className="text-xs text-muted-foreground ml-2 font-mono">
                {wordCount} words • {charCount} chars
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 h-7 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 h-7 text-xs">
                <Download className="h-3.5 w-3.5" /> Save
              </Button>
            </div>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-80 whitespace-pre-wrap leading-relaxed">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}