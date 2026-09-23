// ---------------------------------------------------------------------------
// Workflow Detail & Runner Studio — Production-grade execution platform
// ---------------------------------------------------------------------------

"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Play, RotateCcw, Copy, Check, FileText,
  Upload, Sparkles, Download, Printer, ChevronRight, ChevronLeft,
  Eye, Code2, Maximize2, Minimize2, CheckCircle2, AlertCircle,
  HelpCircle, Layers, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkflowDetail, WorkflowPipeline } from "@/features/workflows/workflow-components";
import { getWorkflowById } from "@/lib/workflow/registry";
import { getSavedWorkflowById, addWorkflowRun } from "@/lib/workflow/history";
import { executePipeline } from "@/lib/workflow/engine";
import { createToolExecutor } from "@/lib/workflow/tool-executor";
import type { WorkflowDefinition, WorkflowExecutionState } from "@/types/workflow";
import { toast } from "sonner";

// Preset Sample Data for One-Click Workflow Demonstrations
const WORKFLOW_PRESETS: Record<string, string> = {
  "document-to-study-notes": `Introduction to Quantum Computing & Qubits:
Unlike classical computing which encodes information strictly in binary bits (0 or 1), quantum computation harnesses the principles of quantum superposition and entanglement. A qubit exists in a linear combination of states |0⟩ and |1⟩ represented by complex probability amplitudes.
When multiple qubits entangle, their joint state cannot be factored into independent product states. This enables quantum algorithms like Shor's factoring algorithm and Grover's search algorithm to achieve polynomial or quadratic speedups over classical algorithms.
Key applications include molecular simulation, cryptographic security analysis, financial portfolio optimization, and complex supply chain routing.`,

  "pdf-to-presentation": `Enterprise Cloud Migration & Serverless Architecture Strategy:
Modern organizations are migrating from legacy monolithic on-premise infrastructure toward cloud-native microservices.
1. Problem Context: High operational overhead, fragile manual provisioning, and unpredictable downtime during seasonal traffic spikes.
2. Architecture Solution: Implementing event-driven serverless functions with auto-scaling container clusters managed by Kubernetes.
3. Quantified Outcomes: 40% reduction in cloud infrastructure costs, 99.99% uptime reliability SLA, and P95 latency reduced from 850ms to 120ms.
4. Next Steps: Multi-region failover testing and automated deployment pipeline hardening.`,

  "image-to-math-solution": `Solve the quadratic polynomial equation:
x^2 - 5x + 6 = 0`,

  "idea-to-diagram": `Microservice Architecture for High-Volume Event Ingestion:
Clients send telemetry to the Edge Gateway. The gateway authenticates requests via JWT and publishes events to an Apache Kafka streaming topic. Consumer worker pools process data asynchronously and persist metrics into a PostgreSQL cluster with Redis caching.`,

  "draft-to-professional-doc": `rough draft proposal for automated data pipeline:
we want to make a system that pulls customer feedback from support tickets and formats it into monthly reports. right now people copy paste manually and it takes 15 hours every month. with automation we can save time and eliminate errors.`,

  "json-pipeline": `{"status":"success","meta":{"count":3,"page":1},"items":[{"id":101,"title":"Production Release","active":true},{"id":102,"title":"Performance Audit","active":false},{"id":103,"title":"Security Scan","active":true}]}`,

  "text-analysis-pipeline": `Natural language processing has transitioned rapidly with the advent of transformer architectures. Self-attention mechanisms allow neural models to attend to disparate tokens across long context windows without recurrent bottlenecks. This yields superior syntactic and semantic comprehension.`,

  "encode-decode-pipeline": `Authorization: Bearer secret-token-xyz-12345-mytoolsbox`,

  "code-formatter-pipeline": `<div class="container"><header class="header"><h1>Platform Status</h1></header><main><p>System fully operational.</p></main></div>`,

  "dev-toolkit-pipeline": `API-CLIENT-SESSION-AUTH-TOKEN-2026`,

  "ai-writing-assistant": `The new deployment pipeline uses parallel test runners to verify changes before merging. Developers submit pull requests which trigger unit test verification and security vulnerability scanning automatically.`,

  "error-debugging-pipeline": `TypeError: Cannot read properties of undefined (reading 'map')
    at UserListTable (src/features/users/user-table.tsx:48:22)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486:18)
    at updateFunctionComponent (node_modules/react-dom/cjs/react-dom.development.js:19617:20)`,
};

export function WorkflowDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const workflow: WorkflowDefinition | undefined =
    getWorkflowById(workflowId) ?? getSavedWorkflowById(workflowId)?.definition;

  const [executionState, setExecutionState] = useState<WorkflowExecutionState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState(
    () => WORKFLOW_PRESETS[workflowId] || "Enter custom text or upload a document to process through this pipeline..."
  );
  const [selectedStepOutputIdx, setSelectedStepOutputIdx] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [outputViewMode, setOutputViewMode] = useState<"rendered" | "raw">("rendered");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStepChange = useCallback((state: WorkflowExecutionState) => {
    setExecutionState({ ...state, steps: [...state.steps] });
  }, []);

  const handleStart = useCallback(async () => {
    if (!workflow || isRunning) return;

    if (!inputText.trim()) {
      toast.error("Please provide input text or load a sample preset.");
      return;
    }

    setIsRunning(true);
    setSelectedStepOutputIdx(null);
    setActiveSlideIndex(0);

    const executor = createToolExecutor({
      onProgress: (stepId, progress) => {
        setExecutionState((prev) => {
          if (!prev) return prev;
          const steps = prev.steps.map((s) =>
            s.stepId === stepId ? { ...s, progress } : s
          );
          return { ...prev, steps };
        });
      },
    });

    try {
      const result = await executePipeline(
        workflow,
        { type: workflow.inputType, text: inputText, result: inputText },
        executor,
        { onStepChange: handleStepChange }
      );

      // Save to history
      addWorkflowRun({
        id: `run-${Date.now()}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        state: result,
        startedAt: result.startedAt ?? Date.now(),
        completedAt: result.completedAt,
        status: result.overallStatus === "completed" ? "completed" : "failed",
      });

      if (result.overallStatus === "completed") {
        toast.success(`Workflow "${workflow.name}" completed successfully!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Workflow execution failed");
    } finally {
      setIsRunning(false);
    }
  }, [workflow, isRunning, handleStepChange, inputText]);

  const handleReset = useCallback(() => {
    setExecutionState(null);
    setSelectedStepOutputIdx(null);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      toast.success(`Loaded file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleLoadPreset = () => {
    const preset = WORKFLOW_PRESETS[workflowId];
    if (preset) {
      setInputText(preset);
      toast.success("Loaded workflow sample data!");
    } else {
      setInputText("Sample text payload for automated pipeline execution.");
    }
  };

  const lastStepOutput: unknown = executionState?.steps[executionState.steps.length - 1]?.output;
  const activeInspectedOutput =
    selectedStepOutputIdx !== null
      ? executionState?.steps[selectedStepOutputIdx]?.output
      : lastStepOutput;

  const outputString = useMemo(() => {
    if (!activeInspectedOutput) return "";
    if (typeof activeInspectedOutput === "string") return activeInspectedOutput;
    if (typeof activeInspectedOutput === "object") {
      const obj = activeInspectedOutput as Record<string, unknown>;
      if (typeof obj.result === "string") return obj.result;
      if (typeof obj.text === "string") return obj.text;
      return JSON.stringify(obj, null, 2);
    }
    return String(activeInspectedOutput);
  }, [activeInspectedOutput]);

  const handleCopy = useCallback(async (txt: string) => {
    await navigator.clipboard.writeText(txt);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${workflow?.name || "Workflow Output"}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1, h2, h3 { color: #0f172a; }
            pre { background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13px; overflow-x: auto; }
            @media print { body { max-width: 100%; margin: 0; padding: 20mm; } }
          </style>
        </head>
        <body>
          <h1>${workflow?.name || "Workflow Output"}</h1>
          <div>${outputString.replace(/\n/g, "<br/>")}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }, [workflow, outputString]);

  if (!workflow) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Workflow not found</h1>
        <p className="text-sm text-muted-foreground mb-6">The workflow you requested does not exist.</p>
        <Button variant="outline" onClick={() => router.push("/workflows")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Workflows
        </Button>
      </div>
    );
  }

  const isCompleted = executionState?.overallStatus === "completed";
  const isFailed = executionState?.overallStatus === "failed";

  // Check if output is a Presentation deck
  const isPresentation = Boolean(
    activeInspectedOutput &&
      typeof activeInspectedOutput === "object" &&
      "slides" in (activeInspectedOutput as Record<string, unknown>)
  );
  const slides = isPresentation
    ? ((activeInspectedOutput as Record<string, unknown>).slides as Array<{
        slideNumber: number;
        title: string;
        bullets: string[];
        speakerNotes: string;
      }>)
    : [];

  // Check if output is an SVG diagram
  const isSvg = typeof outputString === "string" && outputString.trim().startsWith("<svg");

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 bg-background overflow-y-auto p-4 md:p-8" : "container mx-auto px-4 py-8"}`}>
      {/* Top Breadcrumb Bar */}
      {!isFullscreen && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => router.push("/workflows")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workflows
          </button>

          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
            <Sparkles className="h-3 w-3 text-cyan-500" />
            <span>Workflow Engine · Production Active</span>
          </Badge>
        </div>
      )}

      {/* Platform Header */}
      <div className="mb-6 p-4 md:p-6 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{workflow.name}</h1>
            <Badge className="text-[10px] gap-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
              <Layers className="h-3 w-3" />
              {workflow.steps.length} Steps Pipeline
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {workflow.description}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-9"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Studio" : "Studio Canvas"}</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Studio & Pipeline Steps */}
        <div className="lg:col-span-5 space-y-6">
          {/* Input Panel */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-500" />
                  Pipeline Input Payload
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleLoadPreset}
                  >
                    Load Sample
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3 w-3" /> Upload File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <CardDescription className="text-xs">
                Feeds into Step 1: <strong>{workflow.steps[0]?.label}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="text-xs font-mono leading-relaxed"
                placeholder="Paste or write input data..."
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleStart}
                  disabled={isRunning}
                  className="flex-1 text-xs gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Play className="h-3.5 w-3.5" />
                  {isRunning ? "Executing Pipeline..." : "Run Complete Workflow"}
                </Button>
                {executionState && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isRunning}
                    size="icon"
                    title="Reset execution"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Visualizer & Step Inspector */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                Pipeline Execution Steps
              </CardTitle>
              <CardDescription className="text-xs">
                Click any completed step to inspect its intermediate output.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <WorkflowPipeline
                workflow={workflow}
                currentStepIndex={executionState?.currentStepIndex ?? -1}
                stepStates={executionState?.steps}
              />

              {/* Step Output Switcher */}
              {executionState && (
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Inspect Intermediate Outputs:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant={selectedStepOutputIdx === null ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7 px-2.5"
                      onClick={() => setSelectedStepOutputIdx(null)}
                    >
                      Final Output (Step {workflow.steps.length})
                    </Button>
                    {workflow.steps.map((st, idx) => (
                      <Button
                        key={st.id}
                        variant={selectedStepOutputIdx === idx ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7 px-2.5"
                        disabled={!executionState.steps[idx]?.output}
                        onClick={() => setSelectedStepOutputIdx(idx)}
                      >
                        Step {idx + 1}: {st.label.slice(0, 16)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output Studio */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/60 shadow-sm h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      {selectedStepOutputIdx !== null
                        ? `Step ${selectedStepOutputIdx + 1} Output: ${workflow.steps[selectedStepOutputIdx]?.label}`
                        : "Final Workflow Artifact"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isCompleted ? "Verified output generated" : isRunning ? "Processing step..." : "Ready for execution"}
                    </CardDescription>
                  </div>

                  {outputString && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => setOutputViewMode(outputViewMode === "rendered" ? "raw" : "rendered")}
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        {outputViewMode === "rendered" ? "Raw Data" : "Rendered"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => handleCopy(outputString)}
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={handlePrint}
                      >
                        <Printer className="h-3.5 w-3.5" /> Print / PDF
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                {!executionState && !isRunning && (
                  <div className="text-center py-16 space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                      <Play className="h-6 w-6 ml-0.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Pipeline Standing By</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Click <strong>Run Complete Workflow</strong> to stream inputs through {workflow.steps.length} sequential tools.
                    </p>
                  </div>
                )}

                {isRunning && (
                  <div className="text-center py-16 space-y-4">
                    <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Executing: {workflow.steps[executionState?.currentStepIndex ?? 0]?.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">Passing data through pipeline...</p>
                  </div>
                )}

                {isFailed && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
                      <AlertCircle className="h-4 w-4" /> Pipeline Step Failed
                    </div>
                    <pre className="text-xs whitespace-pre-wrap text-destructive/90 font-mono">
                      {executionState?.steps.find((s) => s.status === "error")?.error || "Unknown execution error"}
                    </pre>
                  </div>
                )}

                {/* Rendered Outputs */}
                {outputString && outputViewMode === "rendered" && (
                  <div className="space-y-4">
                    {/* Mode 1: Presentation Carousel */}
                    {isPresentation && slides.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Presentation Slide {activeSlideIndex + 1} of {slides.length}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={activeSlideIndex === 0}
                              onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={activeSlideIndex === slides.length - 1}
                              onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-8 rounded-2xl bg-card border-2 border-cyan-500/30 shadow-md min-h-[260px] flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                              Slide #{slides[activeSlideIndex].slideNumber}
                            </span>
                            <h2 className="text-xl font-bold text-foreground mt-1 mb-4">
                              {slides[activeSlideIndex].title}
                            </h2>
                            <ul className="space-y-2 text-xs md:text-sm text-foreground/90">
                              {slides[activeSlideIndex].bullets.map((b, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-cyan-500 font-bold">•</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-muted-foreground italic">
                            Notes: {slides[activeSlideIndex].speakerNotes}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: SVG Vector Diagram */}
                    {isSvg && (
                      <div
                        className="rounded-xl overflow-hidden border border-border/60 shadow-sm"
                        dangerouslySetInnerHTML={{ __html: outputString }}
                      />
                    )}

                    {/* Mode 3: Markdown / Formatted Document */}
                    {!isPresentation && !isSvg && (
                      <div className="p-6 rounded-xl bg-card border border-border/60 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">
                        {outputString}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw View */}
                {outputString && outputViewMode === "raw" && (
                  <pre className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px]">
                    {outputString}
                  </pre>
                )}
              </CardContent>
            </div>

            <div className="p-4 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Pure Client Execution · Instant Reproducibility
              </span>
              <span>MIME: {workflow.outputType}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}