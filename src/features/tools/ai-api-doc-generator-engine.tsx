"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  Globe,
  FileCode,
  FileText,
  Code2,
  Server,
  Layers,
} from "lucide-react";
import { generateAPIDocs, type APIDocGeneratorOutput } from "@/lib/ai/services/api-doc-generator";
import { getAvailableProviders } from "@/lib/ai";
import { toast } from "sonner";

function ruleBasedAPIDocGenerate(code: string, format = "markdown"): APIDocGeneratorOutput {
  const lines = code.split("\n");
  const endpoints: APIDocGeneratorOutput["endpoints"] = [];

  // Match Express: app.get('/users/:id', ...) or router.post('/checkout', ...)
  const expressRegex = /(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  let match: RegExpExecArray | null;

  while ((match = expressRegex.exec(code)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];

    // Extract path params e.g. :id or :slug
    const pathParams = (path.match(/:([a-zA-Z0-9_]+)/g) || []).map((p) => ({
      name: p.slice(1),
      in: "path",
      type: "string",
      required: true,
      description: `Unique identifier for ${p.slice(1)}.`,
    }));

    // If POST/PUT, add sample body param
    const bodyParams = (method === "POST" || method === "PUT") ? [
      {
        name: "payload",
        in: "body",
        type: "object",
        required: true,
        description: "Request JSON payload body.",
      },
    ] : [];

    endpoints.push({
      method,
      path,
      summary: `${method} ${path}`,
      description: `Handles ${method} requests for resource at ${path}.`,
      parameters: [...pathParams, ...bodyParams],
      responses: [
        { code: method === "POST" ? 201 : 200, description: "Successful response" },
        { code: 400, description: "Validation Error" },
        { code: 500, description: "Internal Server Error" },
      ],
    });
  }

  // Next.js App Router matcher: export async function GET / POST
  if (endpoints.length === 0) {
    const nextjsMethods = (code.match(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g) || []).map(
      (m) => m.split(/\s+/).pop()!
    );

    if (nextjsMethods.length > 0) {
      nextjsMethods.forEach((m) => {
        endpoints.push({
          method: m,
          path: "/api/resource",
          summary: `${m} Route Handler`,
          description: `Next.js App Router API Route Handler for ${m} operations.`,
          parameters: m === "POST" ? [{ name: "body", in: "body", type: "object", required: true, description: "JSON body" }] : [],
          responses: [
            { code: 200, description: "Success response payload" },
            { code: 401, description: "Unauthorized" },
          ],
        });
      });
    }
  }

  // Default fallback if no endpoints detected
  if (endpoints.length === 0) {
    endpoints.push({
      method: "GET",
      path: "/api/v1/health",
      summary: "Health Check Endpoint",
      description: "Returns service operational health status.",
      parameters: [],
      responses: [{ code: 200, description: "Service is healthy" }],
    });
  }

  // Generate OpenAPI 3.0 JSON specification
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "Generated Service API",
      version: "1.0.0",
      description: "Auto-generated API documentation specification.",
    },
    paths: endpoints.reduce((acc, ep) => {
      const openApiPath = ep.path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
      if (!acc[openApiPath]) acc[openApiPath] = {};
      acc[openApiPath][ep.method.toLowerCase()] = {
        summary: ep.summary,
        description: ep.description,
        parameters: ep.parameters.filter((p) => p.in !== "body").map((p) => ({
          name: p.name,
          in: p.in,
          required: p.required,
          schema: { type: p.type },
          description: p.description,
        })),
        responses: ep.responses.reduce((rAcc, r) => {
          rAcc[r.code] = { description: r.description };
          return rAcc;
        }, {} as Record<number, { description: string }>),
      };
      return acc;
    }, {} as Record<string, any>),
  };

  // Generate Markdown
  let md = `# API Documentation\n\n`;
  md += `## Overview\nAuto-generated documentation containing ${endpoints.length} endpoint(s).\n\n`;
  md += `## Endpoints\n\n`;

  endpoints.forEach((ep) => {
    md += `### \`${ep.method} ${ep.path}\`\n\n`;
    md += `${ep.description}\n\n`;
    if (ep.parameters.length > 0) {
      md += `| Parameter | Location | Type | Required | Description |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      ep.parameters.forEach((p) => {
        md += `| \`${p.name}\` | ${p.in} | \`${p.type}\` | ${p.required ? "Yes" : "No"} | ${p.description} |\n`;
      });
      md += `\n`;
    }
    md += `**Responses:**\n`;
    ep.responses.forEach((r) => {
      md += `- \`${r.code}\`: ${r.description}\n`;
    });
    md += `\n---\n\n`;
  });

  return {
    title: "Generated API Documentation",
    description: `Discovered and documented ${endpoints.length} endpoint(s) across source code.`,
    endpoints,
    markdown: format === "openapi" ? JSON.stringify(openApiSpec, null, 2) : md,
  };
}

const SAMPLE_API_CODE = `const express = require('express');
const app = express();

// Retrieve all user accounts
app.get('/api/v1/users', async (req, res) => {
  res.status(200).json({ users: [] });
});

// Retrieve specific user by ID
app.get('/api/v1/users/:id', async (req, res) => {
  res.status(200).json({ user: { id: req.params.id } });
});

// Create new user profile
app.post('/api/v1/users', async (req, res) => {
  res.status(201).json({ created: true });
});

// Delete user account
app.delete('/api/v1/users/:id', async (req, res) => {
  res.status(200).json({ deleted: true });
});`;

export function AIAPIDocumentationGeneratorEngine() {
  const [code, setCode] = useState(SAMPLE_API_CODE);
  const [language, setLanguage] = useState("javascript");
  const [format, setFormat] = useState<"markdown" | "openapi">("markdown");
  const [result, setResult] = useState<APIDocGeneratorOutput>(() =>
    ruleBasedAPIDocGenerate(SAMPLE_API_CODE, "markdown")
  );
  const [activeTab, setActiveTab] = useState<"visual" | "raw">("visual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleGenerate = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      if (hasAIProvider) {
        const r = await generateAPIDocs({
          code: code.trim(),
          language: language === "auto" ? undefined : language,
          format: format as any,
        });
        setResult(r);
      } else {
        setResult(ruleBasedAPIDocGenerate(code.trim(), format));
      }
    } catch {
      setResult(ruleBasedAPIDocGenerate(code.trim(), format));
      setError("AI service unavailable. Generated schema with code analyzer.");
    }
    setIsLoading(false);
  }, [code, language, format, hasAIProvider]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "POST":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
      case "PUT":
      case "PATCH":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-5">
      {/* Code Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-primary" /> API Route Handler Source Code
          </Label>
          {hasAIProvider && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] gap-1">
              <Sparkles className="h-3 w-3" /> AI Active
            </Badge>
          )}
        </div>
        <Textarea
          placeholder="Paste Express, Next.js, FastAPI, or Gin route handlers..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-36 font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Settings Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Output Format:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="text-xs border rounded-md px-2 py-1 bg-background font-medium"
            >
              <option value="markdown">Markdown Table Documentation</option>
              <option value="openapi">OpenAPI 3.0 / Swagger JSON</option>
            </select>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={isLoading} className="gap-2 h-8 text-xs ml-auto">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Generate API Docs
        </Button>
      </div>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {/* Results Display */}
      {result && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b pb-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="visual" className="text-xs gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Endpoints View ({result.endpoints.length})
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> {format === "openapi" ? "OpenAPI JSON" : "Markdown"}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleCopy(result.markdown || JSON.stringify(result, null, 2), "doc-copy")}
            >
              {copiedKey === "doc-copy" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              Copy All Docs
            </Button>
          </div>

          {activeTab === "visual" ? (
            <div className="space-y-3">
              {result.endpoints.map((ep, i) => (
                <Card key={i} className="border shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded border ${getMethodBadgeVariant(ep.method)}`}>
                          {ep.method}
                        </span>
                        <code className="font-mono font-bold text-sm text-foreground">{ep.path}</code>
                      </div>
                      <span className="text-xs text-muted-foreground">{ep.summary}</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{ep.description}</p>

                    {/* Parameters */}
                    {ep.parameters.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase">Parameters</Label>
                        <div className="border rounded-lg divide-y text-xs overflow-hidden">
                          {ep.parameters.map((p, j) => (
                            <div key={j} className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-muted/20">
                              <div className="col-span-3 font-mono font-semibold text-primary">{p.name}</div>
                              <div className="col-span-2">
                                <Badge variant="outline" className="text-[10px]">{p.in}</Badge>
                              </div>
                              <div className="col-span-2">
                                <Badge variant="secondary" className="font-mono text-[10px]">{p.type}</Badge>
                              </div>
                              <div className="col-span-5 text-muted-foreground">{p.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Responses */}
                    {ep.responses.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] text-muted-foreground font-medium">Responses:</span>
                        {ep.responses.map((r, j) => (
                          <Badge key={j} variant="outline" className="text-[11px] font-mono gap-1">
                            <span className={r.code < 300 ? "text-green-500 font-bold" : "text-destructive font-bold"}>
                              {r.code}
                            </span>
                            <span>{r.description}</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <pre className="p-3.5 rounded-xl bg-muted/40 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all max-h-120">
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