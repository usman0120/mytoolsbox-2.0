// ---------------------------------------------------------------------------
// Workflow Builder — Create custom workflow pipelines
// ---------------------------------------------------------------------------
// Allows users to chain tools together by selecting compatible input/output
// types. Provides a visual drag-and-drop-like interface for building pipelines.
// ---------------------------------------------------------------------------

"use client";

import { useState, useCallback, useMemo } from "react";
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
  CheckCircle2,
  AlertTriangle,
  Layers,
  BookOpen,
  Presentation,
  Network,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
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

interface TemplatePreset {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  iconComponent: React.ComponentType<{ className?: string }>;
  steps: Array<{
    toolSlug: string;
    label: string;
    productType: "tool" | "app" | "ai";
    inputTypes: string[];
    outputTypes: string[];
  }>;
}

// ---------------------------------------------------------------------------
// Available tools for the builder
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
  { slug: "ai-diagram-generator", name: "AI Diagram Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["image/svg+xml"], category: "ai" },
  { slug: "presentation-maker", name: "Presentation Maker", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"], category: "ai" },
  { slug: "ai-project-ideas", name: "AI System Architect", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"], category: "ai" },
  { slug: "ai-planning", name: "AI Action Planner", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"], category: "ai" },
  { slug: "ai-doc-generator", name: "AI Doc Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"], category: "ai" },
  { slug: "ai-error-explainer", name: "AI Error Explainer", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/plain"], category: "ai" },
  { slug: "math-solver", name: "Step-by-Step Math Solver", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/markdown"], category: "developer" },
  // Document tools
  { slug: "pdf-to-text", name: "Document Text Extractor", productType: "tool", inputTypes: ["application/pdf", "text/plain"], outputTypes: ["text/plain"], category: "documents" },
  { slug: "markdown-to-pdf", name: "Markdown to PDF Document", productType: "tool", inputTypes: ["text/markdown", "text/plain"], outputTypes: ["application/pdf"], category: "documents" },
];

const CATEGORY_LABELS: Record<string, string> = {
  writing: "Writing",
  developer: "Developer",
  ai: "AI",
  documents: "Documents",
};

// ---------------------------------------------------------------------------
// Predefined Builder Templates
// ---------------------------------------------------------------------------

const BUILDER_TEMPLATES: TemplatePreset[] = [
  {
    id: "tpl-study-notes",
    name: "Study Guide Pipeline",
    shortDescription: "Text Cleaner → Summarizer → Cornell Notes → Quiz Generator",
    description: "Transforms raw documents or articles into structured study notes and active recall practice quizzes.",
    icon: "GraduationCap",
    iconComponent: BookOpen,
    steps: [
      { toolSlug: "text-cleaner", label: "Text Cleaner", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"] },
      { toolSlug: "ai-text-summarizer", label: "AI Summarizer", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/plain"] },
      { toolSlug: "ai-notes-generator", label: "AI Notes Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown", "application/pdf"] },
      { toolSlug: "ai-quiz-generator", label: "AI Quiz Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["application/json"] },
    ],
  },
  {
    id: "tpl-pitch-deck",
    name: "Slide Pitch Deck",
    shortDescription: "Text Cleaner → AI Summarizer → Presentation Maker",
    description: "Synthesizes long-form proposals or briefs directly into an interactive presentation deck.",
    icon: "Presentation",
    iconComponent: Presentation,
    steps: [
      { toolSlug: "text-cleaner", label: "Text Cleaner", productType: "tool", inputTypes: ["text/plain"], outputTypes: ["text/plain"] },
      { toolSlug: "ai-text-summarizer", label: "AI Summarizer", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/plain"] },
      { toolSlug: "presentation-maker", label: "Presentation Maker", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"] },
    ],
  },
  {
    id: "tpl-idea-architecture",
    name: "Idea to Diagram & Plan",
    shortDescription: "Idea Architect → Action Planner → SVG Diagram",
    description: "Takes a high-level software concept and produces technical architecture, execution roadmap, and SVG vector diagram.",
    icon: "Network",
    iconComponent: Network,
    steps: [
      { toolSlug: "ai-project-ideas", label: "AI System Architect", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"] },
      { toolSlug: "ai-planning", label: "AI Action Planner", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"] },
      { toolSlug: "ai-diagram-generator", label: "AI Diagram Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["image/svg+xml"] },
    ],
  },
  {
    id: "tpl-code-docs",
    name: "API & Code Documenter",
    shortDescription: "JSON Validator → JSON Formatter → AI Doc Generator",
    description: "Validates API specifications or schemas, formats them, and writes comprehensive technical documentation.",
    icon: "Code2",
    iconComponent: Code2,
    steps: [
      { toolSlug: "json-validator", label: "JSON Validator", productType: "tool", inputTypes: ["application/json", "text/plain"], outputTypes: ["application/json"] },
      { toolSlug: "json-formatter", label: "JSON Formatter", productType: "tool", inputTypes: ["application/json", "text/plain"], outputTypes: ["application/json"] },
      { toolSlug: "ai-doc-generator", label: "AI Doc Generator", productType: "ai", inputTypes: ["text/plain"], outputTypes: ["text/markdown"] },
    ],
  },
];

// Helper to test compatibility between two adjacent steps
function checkStepCompatibility(stepA: BuilderStep, stepB: BuilderStep): { compatible: boolean; matchType: string } {
  // Direct overlap
  for (const out of stepA.outputTypes) {
    if (stepB.inputTypes.includes(out)) {
      return { compatible: true, matchType: out };
    }
  }
  // Coercion logic: text/markdown or application/json easily casts to text/plain
  if (stepB.inputTypes.includes("text/plain")) {
    return { compatible: true, matchType: "Auto-cast to text/plain" };
  }
  if (stepA.outputTypes.includes("text/plain")) {
    return { compatible: true, matchType: "Text stream" };
  }
  return { compatible: false, matchType: `${stepA.outputTypes[0]} ≠ ${stepB.inputTypes[0]}` };
}

// ---------------------------------------------------------------------------
// WorkflowBuilder Component
// ---------------------------------------------------------------------------

interface WorkflowBuilderProps {
  className?: string;
  onSave?: (workflow: WorkflowDefinition) => void;
  onRun?: (workflow: WorkflowDefinition) => void;
}

export function WorkflowBuilder({ className, onSave, onRun }: WorkflowBuilderProps) {
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

  // Load a preset template
  const loadPreset = useCallback((preset: TemplatePreset) => {
    setName(preset.name);
    setShortDescription(preset.shortDescription);
    setDescription(preset.description);
    setIcon(preset.icon);
    setSteps(
      preset.steps.map((s, idx) => ({
        id: `step-${Date.now()}-${idx}-${s.toolSlug}`,
        toolSlug: s.toolSlug,
        label: s.label,
        productType: s.productType,
        inputTypes: s.inputTypes,
        outputTypes: s.outputTypes,
      }))
    );
    toast.success(`Loaded template: ${preset.name}`);
  }, []);

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
      toast.success(`Added ${tool.name} to pipeline`);
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

    const workflowSteps: WorkflowStep[] = steps.map((s) => ({
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
      estimatedTime: `${steps.length * 2}-${steps.length * 6}s`,
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
    toast.success("Workflow saved to your local library!");
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
    <div className={cn("space-y-6", className)}>
      {/* Template Presets Bar */}
      <Card className="border-border/60 bg-gradient-to-r from-brand/5 via-transparent to-brand/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand" />
            Quick Pipeline Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BUILDER_TEMPLATES.map((tpl) => {
              const Icon = tpl.iconComponent;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => loadPreset(tpl)}
                  className="flex flex-col text-left p-3 rounded-xl border border-border/60 bg-card hover:border-brand/40 hover:bg-brand/5 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-xs text-foreground group-hover:text-brand transition-colors">
                      {tpl.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {tpl.shortDescription}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <ScrollArea className="h-[460px]">
                <div className="space-y-1 pr-2">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.slug}
                      onClick={() => addStep(tool)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                        "hover:bg-muted/60 border border-transparent hover:border-border/60",
                        "text-xs group"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold",
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
                      <Plus className="h-3 w-3 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-brand transition-all" />
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
                  <Label className="text-xs">Workflow Name</Label>
                  <Input
                    placeholder="My Custom Workflow"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Icon Name</Label>
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
                  placeholder="Brief summary of pipeline..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Detailed Description</Label>
                <Textarea
                  placeholder="Describe the end-to-end functionality of this pipeline..."
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
                    onClick={() => {
                      setSteps([]);
                      toast.info("Cleared all steps");
                    }}
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
                    Pick a quick template above or select tools from the palette
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const nextStep = steps[index + 1];
                    const compat = nextStep ? checkStepCompatibility(step, nextStep) : null;

                    return (
                      <div key={step.id} className="space-y-2">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-card/60 group hover:border-border transition-colors">
                          {/* Re-order controls */}
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
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                            {index + 1}
                          </div>

                          {/* Step info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold truncate">{step.label}</p>
                              <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 uppercase">
                                {step.productType}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Accepts: <span className="font-mono text-foreground/80">{step.inputTypes.join(", ")}</span>
                              {" → Yields: "}
                              <span className="font-mono text-foreground/80">{step.outputTypes.join(", ")}</span>
                            </p>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => {
                              removeStep(step.id);
                              toast.info(`Removed ${step.label}`);
                            }}
                            className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-60 group-hover:opacity-100 transition-all"
                            aria-label={`Remove ${step.label}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Pipeline Connector with Compatibility Badge */}
                        {compat && (
                          <div className="flex items-center justify-center gap-2 py-1 px-4">
                            <div className="h-px flex-1 bg-border/60" />
                            <div
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border shadow-xs",
                                compat.compatible
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              )}
                            >
                              {compat.compatible ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                              <span>{compat.matchType}</span>
                              <ArrowRight className="h-2.5 w-2.5 opacity-60" />
                            </div>
                            <div className="h-px flex-1 bg-border/60" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {previewDefinition && steps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Live Pipeline Preview</CardTitle>
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
                {saved ? "Saved to Library!" : "Save Workflow"}
              </Button>
              <Button onClick={handleRun} className="gap-2">
                <Play className="h-4 w-4" />
                Run Pipeline
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}