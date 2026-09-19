"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Loader2, Sparkles, Globe, FileText, Code2, BookOpen } from "lucide-react";
import { generateAPIDocs, type APIDocGeneratorOutput } from "@/lib/ai/services/api-doc-generator";
import { getAvailableProviders } from "@/lib/ai";

function basicAPIDocGenerate(code: string): APIDocGeneratorOutput {
  return {
    title: "API Documentation",
    description: "Auto-generated API documentation. Use AI for detailed results.",
    endpoints: [],
    markdown: `# API Documentation\n\nThis is a basic documentation stub. Enable AI for comprehensive API documentation.\n\n## Code\n\n\`\`\`\n${code.slice(0, 500)}${code.length > 500 ? "\n..." : ""}\n\`\`\``,
  };
}

const LANGUAGES = ["auto", "javascript", "typescript", "python", "java", "go", "rust", "ruby", "php", "csharp"];
const FORMATS = ["auto", "openapi", "swagger", "markdown"];

export function AIAPIDocumentationGeneratorEngine() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("auto");
  const [format, setFormat] = useState("auto");
  const [result, setResult] = useState<APIDocGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      if (hasAIProvider) {
        const r = await generateAPIDocs({
          code: input.trim(),
          language: language === "auto" ? undefined : language,
          format: format === "auto" ? undefined : (format as any),
        });
        setResult(r);
      } else {
        setResult(basicAPIDocGenerate(input.trim()));
      }
    } catch {
      setResult(basicAPIDocGenerate(input.trim()));
      setError("AI service unavailable. Showing basic result.");
    }
    setIsLoading(false);
  }, [input, language, format, hasAIProvider]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Paste your API code</Label>
        <Textarea
          placeholder="app.get('/users', (req, res) => { ... })"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORMATS.map((f) => (
              <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
        Generate API Documentation
      </Button>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Title & Description */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-bold text-lg">{result.title}</h3>
              <p className="text-sm text-muted-foreground">{result.description}</p>
            </CardContent>
          </Card>

          {/* Endpoints */}
          {result.endpoints.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Endpoints</p>
              {result.endpoints.map((ep, i) => (
                <Card key={i}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          ep.method === "GET" ? "default" :
                          ep.method === "POST" ? "secondary" :
                          ep.method === "DELETE" ? "destructive" : "outline"
                        }
                        className="font-mono text-xs"
                      >
                        {ep.method}
                      </Badge>
                      <code className="text-sm font-mono">{ep.path}</code>
                    </div>
                    <p className="text-sm font-medium">{ep.summary}</p>
                    <p className="text-xs text-muted-foreground">{ep.description}</p>

                    {/* Parameters */}
                    {ep.parameters.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Parameters</p>
                        {ep.parameters.map((p, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="font-mono text-[10px]">{p.name}</Badge>
                            <span className="text-muted-foreground">{p.in}</span>
                            <Badge variant="secondary" className="text-[10px]">{p.type}</Badge>
                            {p.required && <Badge variant="destructive" className="text-[10px]">required</Badge>}
                            <span className="text-muted-foreground">{p.description}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Responses */}
                    {ep.responses.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Responses</p>
                        {ep.responses.map((r, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs">
                            <Badge variant={r.code < 300 ? "default" : "destructive"} className="text-[10px]">
                              {r.code}
                            </Badge>
                            <span className="text-muted-foreground">{r.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Markdown */}
          {result.markdown && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Markdown Documentation</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1"
                    onClick={() => handleCopy(result.markdown!, "markdown")}
                  >
                    {copied === "markdown" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-[300px] overflow-y-auto">
                  {result.markdown}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}