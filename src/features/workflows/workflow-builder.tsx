// ---------------------------------------------------------------------------
// Workflow Builder — Create custom workflow pipelines
// ---------------------------------------------------------------------------
// Allows users to chain tools together by selecting compatible input/output
// types. Provides a visual drag-and-drop-like interface for building pipelines.
// ---------------------------------------------------------------------------

"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowRight,
  Save,
  Play,
  Sparkles,
  Search,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkflowPipeline } from "@/features/workflows/workflow-components";
import { saveWorkflow } from "@/lib/workflow/history";
import type { WorkflowDefinition, WorkflowStep } from "@/types/workflow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BuilderStep {
  id: string;
  toolSlug: string;
  label: string;
  productType: "tool" | "app" | "ai";
  inputTypes: string[];
  outputTypes: string[];
  config?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Available tools for the builder (simplified — in production, load from registry)
// ---------------------------------------------------------------------------

const AVAILABLE_TOOLS: Array<{
  slug: string;
  name: string;
  productType: "tool" | "app" | "ai";
  inputTypes: string[];
  outputTypes: string[];
  category: string;
}> = [
  // Text tools
  { slug: "text-cleaner", name: "Text Cleaner", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "writing" },
  { slug: "word-counter", name: "Word Counter", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["application/json"], category: "writing" },
  { slug: "case-converter", name: "Case Converter", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "writing" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "writing" },
  // Developer tools
  { slug: "json-formatter", name: "JSON Formatter", productType: "tool", inputTypes: ["application/json", "text/plain"], outputTypes: ["application/json"], category: "developer" },
  { slug: "json-validator", name: "JSON Validator", productType: "tool", inputTypes: ["application/json", "text/plain"], outputTypes: ["application/json"], category: "developer" },
  { slug: "base64-encoder", name: "Base64 Encoder", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "developer" },
  { slug: "url-encoder", name: "URL Encoder", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "developer" },
  { slug: "html-formatter", name: "HTML Formatter", productType: "tool", inputTypes: ["text/html", "text/plain"], outputTypes: ["text/html"], category: "developer" },
  { slug: "css-formatter", name: "CSS Formatter", productType: "tool", inputTypes: ["text/css", "text/plain"], outputTypes: ["text/css"], category: "developer" },
  { slug: "sql-formatter", name: "SQL Formatter", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "developer" },
  { slug: "uuid-generator", name: "UUID Generator", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "developer" },
  { slug: "hash-generator", name: "Hash Generator", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "developer" },
  { slug: "timestamp-converter", name: "Timestamp Converter", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["application/json"], category: "developer" },
  { slug: "jwt-decoder", name: "JWT Decoder", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["application/json"], category: "developer" },
  { slug: "regex-tester", name: "Regex Tester", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["application/json"], category: "developer" },
  { slug: "diff-checker", name: "Diff Checker", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["application/json"], category: "developer" },
  { slug: "cron-helper", name: "Cron Helper", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["application/json"], category: "developer" },
  // AI tools
  { slug: "ai-text-summarizer", name: "AI Summarizer", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "ai" },
  { slug: "ai-notes-generator", name: "AI Notes Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown", "application/pdf"], category: "ai" },
  { slug: "ai-quiz-generator", name: "AI Quiz Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["application/json"], category: "ai" },
  { slug: "ai-regex-builder", name: "AI Regex Builder", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "ai" },
  { slug: "ai-sql-assistant", name: "AI SQL Assistant", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "ai" },
  { slug: "ai-doc-generator", name: "AI Doc Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"], category: "ai" },
  { slug: "ai-error-explainer", name: "AI Error Explainer", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "ai" },
  // Document tools
  { slug: "markdown-to-pdf", name: "Markdown to PDF", productType: "tool", inputTypes: ["text/markdown", "text/plain"], outputTypes: ["application/pdf"], category: "documents" },
];

// Group tools by category
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TOOLS_BY_CATEGORY = AVAILABLE_TOOLS.reduce(
  (acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  },
  {} as Record<string, typeof AVAILABLE_TOOLS>
);

const CATEGORY_LABELS: Record<string, string> = {
  writing: "Writing",
  developer: "Developer",
  ai: "AI",
  documents: "Documents",
};

// ---------------------------------------------------------------------------
// WorkflowBuilder Component
// ---------------------------------------------------------------------------

interface WorkflowBuilderProps {
  className?: string;
  onSave?: (workflow: WorkflowDefinition) => void;
  onRun?: (workflow: WorkflowDefinition) => void;
}

export function WorkflowBuilder({ className, onSave, onRun }: WorkflowBuilderProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [icon, setIcon] = useState("Workflow");
  const [steps, setSteps] = useState<BuilderStep[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Filter tools by search
  const filteredTools = useMemo(() => {
    if (!searchQuery && !selectedCategory) return AVAILABLE_TOOLS;
    return AVAILABLE_TOOLS.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Add a step to the pipeline
  const addStep = useCallback(
    (tool: (typeof AVAILABLE_TOOLS)[0]) => {
      const step: BuilderStep = {
        id: `step-${Date.now()}-${tool.slug}`,
        toolSlug: tool.slug,
        label: tool.name,
        productType: tool.productType,
        inputTypes: tool.inputTypes,
        outputTypes: tool.outputTypes,
      };
      setSteps((prev) => [...prev, step]);
    },
    []
  );

  // Remove a step
  const removeStep = useCallback((stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  }, []);

  // Move a step up/down
  const moveStep = useCallback((stepId: string, direction: "up" | "down") => {
    setSteps((prev) => {
      const index = prev.findIndex((s) => s.id === stepId);
      if (index === -1) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newSteps = [...prev];
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      return newSteps;
    });
  }, []);

  // Build a WorkflowDefinition from the current state
  const buildDefinition = useCallback((): WorkflowDefinition | null => {
    if (steps.length === 0) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const workflowSteps: WorkflowStep[] = steps.map((s, i) => ({
      id: s.id,
      toolSlug: s.toolSlug,
      label: s.label,
      productType: s.productType,
      inputTypes: s.inputTypes,
      outputTypes: s.outputTypes,
      requiresAuth: s.productType === "ai",
      requiresPro: false,
      config: s.config,
    }));

    return {
      id: `custom-${Date.now()}`,
      name: name || "Untitled Workflow",
      shortDescription: shortDescription || "Custom workflow pipeline",
      description: description || "A custom workflow built with the workflow builder.",
      icon: icon || "Workflow",
      steps: workflowSteps,
      inputType: steps[0]?.inputTypes[0] ?? "text/plain",
      outputType: steps[steps.length - 1]?.outputTypes[0] ?? "text/plain",
      categories: ["custom"],
      keywords: [],
      estimatedTime: `${steps.length * 3}-${steps.length * 10}s`,
    };
  }, [steps, name, description, shortDescription, icon]);

  // Handle save
  const handleSave = useCallback(() => {
    const def = buildDefinition();
    if (!def) return;

    saveWorkflow({
      id: def.id,
      definition: def,
      savedAt: Date.now(),
      customName: name || undefined,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave?.(def);
  }, [buildDefinition, name, onSave]);

  // Handle run
  const handleRun = useCallback(() => {
    const def = buildDefinition();
    if (!def) return;
    onRun?.(def);
  }, [buildDefinition, onRun]);

  // Preview definition for pipeline visualization
  const previewDefinition = useMemo(() => buildDefinition(), [buildDefinition]);

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Left: Tool Palette */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              Available Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={!selectedCategory ? "default" : "outline"}
                className="cursor-pointer text-[10px] h-5 px-1.5"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  className="cursor-pointer text-[10px] h-5 px-1.5"
                  onClick={() => setSelectedCategory(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>

            {/* Tool list */}
            <ScrollArea className="h-100">
              <div className="space-y-1 pr-2">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.slug}
                    onClick={() => addStep(tool)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                      "hover:bg-muted/60 border border-transparent hover:border-border/60",
                      "text-xs"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px]",
                        tool.productType === "ai" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                        tool.productType === "app" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        tool.productType === "tool" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}
                    >
                      {tool.productType === "ai" ? "AI" : tool.productType === "app" ? "Ap" : "To"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tool.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {tool.inputTypes[0]} → {tool.outputTypes[0]}
                      </p>
                    </div>
                    <Plus className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                {filteredTools.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No tools found
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Center: Pipeline Builder */}
      <div className="lg:col-span-2 space-y-6">
        {/* Workflow metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="My Custom Workflow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Icon (Lucide)</Label>
                <Input
                  placeholder="Workflow"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Short Description</Label>
              <Input
                placeholder="Brief description for cards..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Full Description</Label>
              <Textarea
                placeholder="Describe what this workflow does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-15 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pipeline steps */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Pipeline ({steps.length} {steps.length === 1 ? "step" : "steps"})
              </CardTitle>
              {steps.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSteps([])}
                  className="h-7 text-xs text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {steps.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-border/60">
                <Wand2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No steps yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Click tools from the palette to add them to your pipeline
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-card/50 group"
                  >
                    {/* Drag handle */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveStep(step.id, "up")}
                        disabled={index === 0}
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move step up"
                      >
                        <ChevronDown className="h-3 w-3 rotate-180 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => moveStep(step.id, "down")}
                        disabled={index === steps.length - 1}
                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move step down"
                      >
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Step number */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </div>

                    {/* Step info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{step.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {step.productType === "ai" ? "AI" : step.productType === "app" ? "App" : "Tool"}
                        {" · "}
                        {step.inputTypes[0]} → {step.outputTypes[0]}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeStep(step.id)}
                      className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                      aria-label={`Remove ${step.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Connector arrows between steps */}
                {steps.length > 1 && (
                  <div className="flex items-center justify-center gap-1 py-1">
                    {steps.slice(0, -1).map((_, i) => (
                      <div key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-[10px] text-muted-foreground/40">···</span>}
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {previewDefinition && steps.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowPipeline workflow={previewDefinition} />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {steps.length > 0 && (
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} variant="outline" className="gap-2" disabled={!name}>
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Workflow"}
            </Button>
            <Button onClick={handleRun} className="gap-2">
              <Play className="h-4 w-4" />
              Run Workflow
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}