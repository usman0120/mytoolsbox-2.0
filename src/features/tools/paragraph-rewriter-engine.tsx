"use client";

import { useState, useCallback } from "react";
import {
  FileText, Download, Copy, Check, Trash2, Loader2,
  Sparkles, RefreshCw, Type, AlignLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const STORAGE_KEY_INPUT = "mytoolsbox-paragraph-rewriter-input";
const STORAGE_KEY_OUTPUT = "mytoolsbox-paragraph-rewriter-output";

function loadInput(): string {
  try { return localStorage.getItem(STORAGE_KEY_INPUT) || ""; } catch { return ""; }
}

function saveInput(text: string) { localStorage.setItem(STORAGE_KEY_INPUT, text); }

type RewriteStyle = "fluent" | "formal" | "casual" | "creative" | "simplified" | "persuasive";

const STYLE_DESCRIPTIONS: Record<RewriteStyle, string> = {
  fluent: "Improve flow and readability while preserving meaning",
  formal: "Convert to professional, business-appropriate language",
  casual: "Make it conversational and friendly",
  creative: "Add vivid language and engaging expressions",
  simplified: "Make it clearer and easier to understand",
  persuasive: "Make it more compelling and convincing",
};

function rewriteText(text: string, style: RewriteStyle): string {
  if (!text.trim()) return "";

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];

  const rewritten = sentences.map((sentence) => {
    const trimmed = sentence.trim();
    if (!trimmed) return "";

    switch (style) {
      case "fluent":
        // Improve transitions and flow
        return trimmed
          .replace(/\b(but|however)\b/gi, "however,")
          .replace(/\b(also|in addition)\b/gi, "additionally,")
          .replace(/\b(so|therefore)\b/gi, "therefore,")
          .replace(/\b(because|since)\b/gi, "as")
          .replace(/\bvery\s+(\w+)\b/gi, (_, word) => {
            const intensifiers: Record<string, string> = { good: "excellent", bad: "terrible", big: "substantial", small: "minimal", important: "crucial", happy: "delighted", sad: "devastated", hard: "challenging", easy: "effortless" };
            return intensifiers[word.toLowerCase()] || word;
          });

      case "formal":
        return trimmed
          .replace(/\b(get|got)\b/gi, "obtain")
          .replace(/\b(start|begin)\b/gi, "commence")
          .replace(/\b(end|finish)\b/gi, "conclude")
          .replace(/\b(help)\b/gi, "assist")
          .replace(/\b(need)\b/gi, "require")
          .replace(/\b(show)\b/gi, "demonstrate")
          .replace(/\b(tell)\b/gi, "inform")
          .replace(/\b(ask)\b/gi, "inquire")
          .replace(/\b(buy)\b/gi, "purchase")
          .replace(/\b(use)\b/gi, "utilize")
          .replace(/\b(give)\b/gi, "provide")
          .replace(/\b(want)\b/gi, "desire")
          .replace(/\b(about)\b/gi, "regarding")
          .replace(/\b(I think|I believe)\b/gi, "It is my assessment that")
          .replace(/\b(a lot of|lots of)\b/gi, "a significant number of");

      case "casual":
        return trimmed
          .replace(/\b(obtain|acquire)\b/gi, "get")
          .replace(/\b(commence|initiate)\b/gi, "start")
          .replace(/\b(conclude|terminate)\b/gi, "end")
          .replace(/\b(assist|facilitate)\b/gi, "help")
          .replace(/\b(require|necessitate)\b/gi, "need")
          .replace(/\b(demonstrate|illustrate)\b/gi, "show")
          .replace(/\b(utilize|employ)\b/gi, "use")
          .replace(/\b(regarding|concerning)\b/gi, "about")
          .replace(/\b(however|nevertheless)\b/gi, "but")
          .replace(/\b(additionally|furthermore)\b/gi, "also")
          .replace(/\b(therefore|consequently)\b/gi, "so");

      case "creative":
        // Add descriptive language
        return trimmed
          .replace(/\b(is|was|are|were)\s+(\w+)\b/gi, (_, verb, adj) => `${verb} remarkably ${adj}`)
          .replace(/\b(good|nice|great)\b/gi, () => ["exceptional", "remarkable", "outstanding", "superb"][Math.floor(Math.random() * 4)])
          .replace(/\b(bad|poor)\b/gi, () => ["dismal", "lackluster", "subpar"][Math.floor(Math.random() * 3)])
          .replace(/\b(important)\b/gi, () => ["pivotal", "paramount", "indispensable"][Math.floor(Math.random() * 3)]);

      case "simplified":
        // Shorten and clarify
        return trimmed
          .replace(/\b(in order to)\b/gi, "to")
          .replace(/\b(due to the fact that)\b/gi, "because")
          .replace(/\b(at this point in time)\b/gi, "now")
          .replace(/\b(in the event that)\b/gi, "if")
          .replace(/\b(with regard to|in reference to)\b/gi, "about")
          .replace(/\b(a majority of)\b/gi, "most")
          .replace(/\b(a number of)\b/gi, "several")
          .replace(/\b(despite the fact that)\b/gi, "although")
          .replace(/\b(in the near future)\b/gi, "soon")
          .replace(/\b(has the capability to)\b/gi, "can")
          .replace(/\b(it is possible that)\b/gi, "maybe");

      case "persuasive":
        return trimmed
          .replace(/\b(maybe|perhaps|possibly)\b/gi, "certainly")
          .replace(/\b(might|could)\b/gi, "will")
          .replace(/\b(good|nice)\b/gi, "exceptional")
          .replace(/\b(should)\b/gi, "must")
          .replace(/\b(consider)\b/gi, "strongly consider")
          .replace(/\b(important)\b/gi, "essential")
          .replace(/\b(benefit)\b/gi, "significant advantage")
          .replace(/\b(help)\b/gi, "empower")
          .replace(/\b(try)\b/gi, "commit to");

      default:
        return trimmed;
    }
  });

  return rewritten.filter(Boolean).join(" ");
}

export function ParagraphRewriterEngine() {
  const [input, setInput] = useState(() => loadInput());
  const [output, setOutput] = useState("");
  const [style, setStyle] = useState<RewriteStyle>("fluent");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    saveInput(value);
  }, []);

  const handleRewrite = useCallback(async () => {
    if (!input.trim()) {
      toast.error("Please enter some text to rewrite.");
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
    const result = rewriteText(input, style);
    setOutput(result);
    setIsProcessing(false);
    toast.success(`Text rewritten in ${style} style!`);
  }, [input, style]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied!");
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rewritten-text-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    localStorage.removeItem(STORAGE_KEY_INPUT);
    toast.success("Cleared.");
  }, []);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1">
            <Sparkles className="h-3 w-3" /> Rewriter
          </Badge>
          <span className="text-xs text-muted-foreground">{wordCount} words</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 h-7" disabled={!output}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1 h-7 text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="text-sm font-medium">Original Text</Label>
          <Textarea
            placeholder="Paste or type text to rewrite..."
            className="min-h-37.5"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Rewrite Style</Label>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "fluent" as const, icon: RefreshCw, label: "Fluent" },
            { value: "formal" as const, icon: FileText, label: "Formal" },
            { value: "casual" as const, icon: Type, label: "Casual" },
            { value: "creative" as const, icon: Sparkles, label: "Creative" },
            { value: "simplified" as const, icon: AlignLeft, label: "Simplified" },
            { value: "persuasive" as const, icon: Sparkles, label: "Persuasive" },
          ]).map(({ value, icon: Icon, label: lbl }) => (
            <Button
              key={value}
              variant={style === value ? "default" : "outline"}
              size="sm"
              onClick={() => setStyle(value)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" /> {lbl}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{STYLE_DESCRIPTIONS[style]}</p>
      </div>

      <Button onClick={handleRewrite} disabled={!input.trim() || isProcessing} className="w-full gap-2">
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {isProcessing ? "Rewriting..." : "Rewrite Text"}
      </Button>

      {output && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Rewritten Text</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{outputWordCount} words</span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 h-7">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}