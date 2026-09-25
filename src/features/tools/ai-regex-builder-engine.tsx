"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  Regex,
  Play,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
} from "lucide-react";
import { buildRegex, type RegexBuilderOutput } from "@/lib/ai/services/regex-builder";
import { useCredits } from "@/lib/credits/use-credits";
import { toast } from "sonner";

interface OfflineRegexRule {
  keywords: string[];
  pattern: string;
  flags: string;
  explanation: string;
  sampleMatches: string[];
  sampleNonMatches: string[];
}

const OFFLINE_RULES: OfflineRegexRule[] = [
  {
    keywords: ["email", "e-mail", "mail address"],
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "gi",
    explanation: "Matches standard RFC 5322 compatible email addresses (username + @ + domain + TLD of at least 2 chars).",
    sampleMatches: ["alex.smith@example.com", "dev+test@sub.domain.org"],
    sampleNonMatches: ["plainaddress", "@missinguser.com", "user@.com"],
  },
  {
    keywords: ["url", "link", "web address", "http", "https"],
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    flags: "gi",
    explanation: "Matches HTTP and HTTPS URLs including port, path, query parameters, and fragments.",
    sampleMatches: ["https://example.com/api/v1?query=test#hash", "http://sub.domain.co.uk"],
    sampleNonMatches: ["ftp://files", "not a url", "http:/incomplete"],
  },
  {
    keywords: ["password", "strong password", "auth"],
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: "",
    explanation: "Positive lookaheads ensure at least one lowercase letter, one uppercase letter, one digit, one special character, and minimum 8 characters.",
    sampleMatches: ["SecureP@ss123", "Str0ng!Pass"],
    sampleNonMatches: ["weakpass", "NoSpecial1", "Short1!"],
  },
  {
    keywords: ["uuid", "guid", "v4"],
    pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}",
    flags: "gi",
    explanation: "Matches standard RFC 4122 / RFC 9562 UUIDs including version nibble and variant check.",
    sampleMatches: ["c73bcdcc-6660-4e0f-9b63-293e705b60cb"],
    sampleNonMatches: ["not-a-uuid", "12345"],
  },
  {
    keywords: ["ip", "ipv4", "ip address"],
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    explanation: "Matches valid IPv4 addresses in dotted-decimal format (0.0.0.0 to 255.255.255.255).",
    sampleMatches: ["192.168.1.1", "10.0.0.254", "127.0.0.1"],
    sampleNonMatches: ["999.999.999.999", "192.168.1", "300.0.0.1"],
  },
  {
    keywords: ["slug", "kebab", "url slug"],
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    flags: "",
    explanation: "Matches URL-friendly kebab-case slugs (lowercase alphanumeric separated by single hyphens).",
    sampleMatches: ["my-blog-post-title", "nextjs-15-update"],
    sampleNonMatches: ["Invalid_Slug", "-leading-hyphen", "trailing-hyphen-"],
  },
  {
    keywords: ["hex", "color", "hex color"],
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: "gi",
    explanation: "Matches 3-digit (#fff) or 6-digit (#3b82f6) hexadecimal CSS color codes.",
    sampleMatches: ["#3b82f6", "#FFF", "#000000"],
    sampleNonMatches: ["#12345", "blue", "123456"],
  },
  {
    keywords: ["phone", "telephone", "mobile"],
    pattern: "\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}",
    flags: "g",
    explanation: "Matches international and domestic telephone numbers with country codes and separators.",
    sampleMatches: ["+1 (555) 123-4567", "+44 20 7946 0958", "0800-555-1234"],
    sampleNonMatches: ["123", "abc-defg"],
  },
  {
    keywords: ["date", "iso date", "yyyy-mm-dd"],
    pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    explanation: "Matches ISO 8601 calendar dates in YYYY-MM-DD format with month and day bounds.",
    sampleMatches: ["2025-05-15", "1999-12-31"],
    sampleNonMatches: ["2025-13-40", "15-05-2025"],
  },
  {
    keywords: ["html", "tag", "html tag"],
    pattern: "<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>|<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*\\/>",
    flags: "gi",
    explanation: "Matches opening and closing HTML tag pairs or self-closing void tags.",
    sampleMatches: ["<div class=\"btn\">Click</div>", "<img src=\"avatar.png\" />"],
    sampleNonMatches: ["Plain text", "x < y and y > z"],
  },
  {
    keywords: ["semver", "version", "versioning"],
    pattern: "v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?",
    flags: "g",
    explanation: "Strict Semantic Versioning specification 2.0.0 (MAJOR.MINOR.PATCH-prerelease+build).",
    sampleMatches: ["v1.0.0", "2.14.3-beta.1", "0.3.0+build.123"],
    sampleNonMatches: ["1.0", "v01.2.3"],
  },
];

function ruleBasedRegexBuild(description: string, preferredFlags = "gi", testCases: string[] = []): RegexBuilderOutput {
  const descLower = description.toLowerCase();

  let matchedRule: OfflineRegexRule | null = null;
  for (const rule of OFFLINE_RULES) {
    if (rule.keywords.some((kw) => descLower.includes(kw))) {
      matchedRule = rule;
      break;
    }
  }

  const pattern = matchedRule ? matchedRule.pattern : "[A-Za-z0-9_-]+";
  const flags = matchedRule ? matchedRule.flags : preferredFlags;
  const explanation = matchedRule
    ? matchedRule.explanation
    : `Synthesized alphanumeric token pattern for "${description}". Connect an AI provider for advanced natural language regex synthesis.`;

  // Evaluate test cases
  const allTests = testCases.filter(Boolean).length > 0
    ? testCases.filter(Boolean)
    : matchedRule
    ? [...matchedRule.sampleMatches, ...matchedRule.sampleNonMatches]
    : [];

  const testResults = allTests.map((tc) => {
    try {
      const re = new RegExp(pattern, flags);
      const matches = tc.match(re);
      return {
        input: tc,
        matches: matches ? Array.from(matches) : [],
        success: Boolean(matches && matches.length > 0),
      };
    } catch {
      return { input: tc, matches: [], success: false };
    }
  });

  return {
    pattern,
    explanation,
    flags,
    testResults,
  };
}

export function AIRegexBuilderEngine() {
  const [description, setDescription] = useState("Match valid email addresses with domain validation");
  const [testCases, setTestCases] = useState<string[]>([
    "support@mytoolsbox.me",
    "invalid-email-address",
    "user+alias@gmail.com",
  ]);
  const [flags, setFlags] = useState("gi");
  const [result, setResult] = useState<RegexBuilderOutput>(() =>
    ruleBasedRegexBuild("email", "gi", [
      "support@mytoolsbox.me",
      "invalid-email-address",
      "user+alias@gmail.com",
    ])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [interactiveTest, setInteractiveTest] = useState("Contact us at hello@world.com or visit my site");
  const { refresh } = useCredits();

  const handleBuild = useCallback(async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const r = await buildRegex({
        description: description.trim(),
        testCases: testCases.filter(Boolean),
        flags,
      });
      setResult(r);
      toast.success("Regex pattern generated!");
      await refresh();
    } catch {
      setResult(ruleBasedRegexBuild(description.trim(), flags, testCases));
      setError("AI provider unavailable. Generated from comprehensive rule engine.");
    }
    setIsLoading(false);
  }, [description, testCases, flags, refresh]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
    toast.success("Copied to clipboard!");
  };

  const interactiveMatches = useMemo(() => {
    if (!result?.pattern || !interactiveTest) return [];
    try {
      const regex = new RegExp(result.pattern, result.flags || flags);
      const m = interactiveTest.match(regex);
      return m ? Array.from(m) : [];
    } catch {
      return [];
    }
  }, [result, interactiveTest, flags]);

  return (
    <div className="space-y-5">
      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Regex className="h-4 w-4 text-primary" /> Describe Your Match Requirements
          </Label>
          <div className="flex items-center gap-1.5">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] gap-1">
              <Sparkles className="h-3 w-3" /> AI Active
            </Badge>
          </div>
        </div>
        <Textarea
          placeholder="e.g. Match strong passwords with at least 8 characters, 1 uppercase, 1 digit, and 1 symbol..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 text-xs font-mono"
        />

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground mr-1">Examples:</span>
          {[
            "Validate email addresses",
            "Match URLs and web links",
            "Strong password policy",
            "RFC UUID v4 identifier",
            "IPv4 dotted decimal",
            "Kebab-case URL slug",
            "HEX color codes",
            "Semantic Versioning (SemVer)",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setDescription(prompt);
                setResult(ruleBasedRegexBuild(prompt, flags, testCases));
              }}
              className="px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 border text-[11px] font-medium transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground">Test Cases (Automatic Verification)</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={() => setTestCases([...testCases, ""])}
          >
            <Plus className="h-3 w-3" /> Add Test
          </Button>
        </div>

        <div className="space-y-1.5">
          {testCases.map((tc, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder={`Sample string ${i + 1} (e.g. valid or invalid test case)`}
                value={tc}
                onChange={(e) => {
                  const next = [...testCases];
                  next[i] = e.target.value;
                  setTestCases(next);
                }}
                className="font-mono text-xs h-8"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setTestCases(testCases.filter((_, j) => j !== i))}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-32">
          <Label className="text-xs text-muted-foreground">Flags</Label>
          <Input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="font-mono text-xs h-9"
            placeholder="gi"
          />
        </div>
        <div className="flex-1 flex items-end">
          <Button onClick={handleBuild} disabled={isLoading} className="w-full gap-2 h-9 text-xs">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Regular Expression
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {/* Result Presentation */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Pattern Card */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">Generated Regular Expression</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleCopy(`/${result.pattern}/${result.flags || flags}`, "pattern")}
                >
                  {copied === "pattern" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Pattern
                </Button>
              </div>
              <pre className="p-3 rounded-xl bg-background border font-mono text-xs text-primary font-bold overflow-x-auto select-all">
                /{result.pattern}/{result.flags || flags}
              </pre>
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Pattern Breakdown & Logic
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {result.explanation}
              </p>
            </CardContent>
          </Card>

          {/* Automatic Test Case Results */}
          {result.testResults && result.testResults.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground block">
                Test Case Evaluations ({result.testResults.length})
              </span>
              <div className="border rounded-xl divide-y text-xs overflow-hidden">
                {result.testResults.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 hover:bg-muted/20">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-mono text-xs truncate">&ldquo;{t.input}&rdquo;</span>
                    </div>
                    <Badge variant={t.success ? "default" : "secondary"} className="text-[10px]">
                      {t.success ? `Matched (${t.matches.length})` : "No Match"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Playground Sandbox */}
          <Card className="bg-muted/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5 text-primary" /> Live Test Playground
                </span>
                <Badge variant="outline" className="text-xs">
                  {interactiveMatches.length} {interactiveMatches.length === 1 ? "match" : "matches"}
                </Badge>
              </div>
              <Input
                value={interactiveTest}
                onChange={(e) => setInteractiveTest(e.target.value)}
                placeholder="Type any test sentence..."
                className="font-mono text-xs"
              />
              {interactiveMatches.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {interactiveMatches.map((m, i) => (
                    <Badge key={i} variant="secondary" className="font-mono text-[11px] text-primary">
                      {m}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}