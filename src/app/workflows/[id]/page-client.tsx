// ---------------------------------------------------------------------------
// Workflow Detail Page — View and run a specific workflow
// ---------------------------------------------------------------------------

"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/common/workload-layouts";
import { WorkflowDetail, WorkflowPipeline } from "@/features/workflows/workflow-components";
import { getWorkflowById } from "@/lib/workflow/registry";
import { executePipeline } from "@/lib/workflow/engine";
import type { WorkflowExecutionState, WorkflowStep } from "@/types/workflow";
import type { StepExecutor } from "@/lib/workflow/engine";

export function WorkflowDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const workflow = getWorkflowById(workflowId);

  const [executionState, setExecutionState] = useState<WorkflowExecutionState | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleStepChange = useCallback((state: WorkflowExecutionState) => {
    setExecutionState({ ...state, steps: [...state.steps] });
  }, []);

  const handleStart = useCallback(async () => {
    if (!workflow || isRunning) return;

    setIsRunning(true);

    // Mock executor — in production, this would call actual tool engines
    const executor: StepExecutor = async (step, input, signal) => {
      // Simulate processing time
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 1000 + Math.random() * 1500);
        signal?.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new Error("Cancelled"));
        });
      });

      return { result: `Processed by ${step.label}`, input };
    };

    try {
      await executePipeline(workflow, { type: workflow.inputType }, executor, {
        onStepChange: handleStepChange,
      });
    } catch {
      // Error already handled in state
    } finally {
      setIsRunning(false);
    }
  }, [workflow, isRunning, handleStepChange]);

  const handleReset = useCallback(() => {
    setExecutionState(null);
  }, []);

  if (!workflow) {
    return (
      <PageShell>
        <div className="text-center py-16">
          <h1 className="text-xl font-bold mb-2">Workflow not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The workflow you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button variant="outline" onClick={() => router.push("/workflows")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
        </div>
      </PageShell>
    );
  }

  const isCompleted = executionState?.overallStatus === "completed";
  const isFailed = executionState?.overallStatus === "failed";

  return (
    <PageShell>
      {/* Back button */}
      <button
        onClick={() => router.push("/workflows")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workflows
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Detail */}
        <div className="lg:col-span-2">
          <WorkflowDetail workflow={workflow} />
        </div>

        {/* Right: Execution panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <h2 className="text-sm font-semibold mb-4">Run Workflow</h2>

              {!executionState && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    This will chain {workflow.steps.length} tools together to process your input.
                  </p>
                  <Button
                    onClick={handleStart}
                    disabled={isRunning}
                    className="w-full"
                    aria-label={`Run ${workflow.name} workflow`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Workflow
                  </Button>
                </div>
              )}

              {executionState && (
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isCompleted
                          ? "bg-success"
                          : isFailed
                          ? "bg-destructive"
                          : "bg-brand animate-pulse"
                      }`}
                    />
                    <span className="text-xs font-medium capitalize">
                      {executionState.overallStatus}
                    </span>
                  </div>

                  {/* Pipeline */}
                  <WorkflowPipeline
                    workflow={workflow}
                    currentStepIndex={executionState.currentStepIndex}
                    stepStates={executionState.steps}
                  />

                  {/* Actions */}
                  {(isCompleted || isFailed) && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="w-full"
                      aria-label="Reset workflow"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Run Again
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="rounded-xl border bg-muted/20 p-4">
              <h3 className="text-xs font-semibold mb-2">How it works</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each step feeds its output into the next tool. You don&apos;t need to manually
                download and re-upload between steps — the platform handles it automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}