// ---------------------------------------------------------------------------
// Workflow UI Components
// ---------------------------------------------------------------------------
// Components for displaying and interacting with workflow pipelines.
// ---------------------------------------------------------------------------

"use client";

import { cn } from "@/lib/utils";
import type { WorkflowDefinition, WorkflowStep, WorkflowStepState } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { VisuallyHidden } from "@/components/common/accessibility";

// ---------------------------------------------------------------------------
// WorkflowCard — displays a workflow in a grid
// ---------------------------------------------------------------------------

interface WorkflowCardProps {
  workflow: WorkflowDefinition;
  className?: string;
  onClick?: () => void;
}

export function WorkflowCard({ workflow, className, onClick }: WorkflowCardProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[workflow.icon] || Icons.Workflow;

  return (
    <Card
      className={cn(
        "card-lift cursor-pointer h-full border-border/60 hover:border-brand/25 transition-all duration-200 group",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-brand-muted group-hover:text-brand transition-colors duration-200">
            <IconComponent className="h-4.5 w-4.5" />
          </div>
          {workflow.featured && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-brand/10 text-brand border-brand/20">
              Featured
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-medium mt-2.5">
          {workflow.name}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2 leading-relaxed">
          {workflow.shortDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Icons.ArrowRight className="h-3 w-3" />
          <span>{workflow.steps.length} steps</span>
          {workflow.estimatedTime && (
            <>
              <span className="text-border">·</span>
              <Icons.Clock className="h-3 w-3" />
              <span>{workflow.estimatedTime}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// WorkflowPipeline — visual pipeline display
// ---------------------------------------------------------------------------

interface WorkflowPipelineProps {
  workflow: WorkflowDefinition;
  currentStepIndex?: number;
  stepStates?: WorkflowStepState[];
  className?: string;
}

export function WorkflowPipeline({
  workflow,
  currentStepIndex = -1,
  stepStates,
  className,
}: WorkflowPipelineProps) {
  return (
    <div className={cn("flex flex-col items-center gap-0", className)}>
      <VisuallyHidden as="h2">
        Workflow pipeline: {workflow.name} — {workflow.steps.length} steps
      </VisuallyHidden>
      <ol
        className="flex flex-col items-center gap-0 w-full max-w-md"
        aria-label={`${workflow.name} pipeline steps`}
      >
        {workflow.steps.map((step, index) => {
          const state = stepStates?.[index];
          const isActive = index === currentStepIndex;
          const isCompleted = state?.status === "completed";
          const isError = state?.status === "error";
          const isProcessing = state?.status === "processing";

          return (
            <li key={step.id} className="flex flex-col items-center w-full">
              <PipelineStep
                step={step}
                index={index}
                isActive={isActive}
                isCompleted={isCompleted}
                isError={isError}
                isProcessing={isProcessing}
                progress={state?.progress}
              />
              {index < workflow.steps.length - 1 && <PipelineConnector isCompleted={isCompleted} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PipelineStep — individual step in the pipeline
// ---------------------------------------------------------------------------

interface PipelineStepProps {
  step: WorkflowStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isError: boolean;
  isProcessing: boolean;
  progress?: number;
}

function PipelineStep({
  step,
  index,
  isActive,
  isCompleted,
  isError,
  isProcessing,
  progress,
}: PipelineStepProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[getStepIcon(step)] || Icons.ChevronRight;

  return (
    <div
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-200",
        isActive && "border-brand/40 bg-brand-muted/30 shadow-xs",
        isCompleted && "border-success/30 bg-success/5",
        isError && "border-destructive/30 bg-destructive/5",
        !isActive && !isCompleted && !isError && "border-border/40 bg-card/50"
      )}
      role="listitem"
      aria-current={isActive ? "step" : undefined}
      aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? " (completed)" : ""}${isError ? " (error)" : ""}${isProcessing ? " (processing)" : ""}`}
    >
      {/* Step indicator */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-medium transition-colors",
          isCompleted && "bg-success text-success-foreground",
          isError && "bg-destructive text-destructive-foreground",
          isProcessing && "bg-brand text-brand-foreground animate-pulse",
          isActive && !isProcessing && "bg-brand text-brand-foreground",
          !isActive && !isCompleted && !isError && !isProcessing && "bg-muted text-muted-foreground"
        )}
        aria-hidden="true"
      >
        {isCompleted ? (
          <Icons.Check className="h-4 w-4" />
        ) : isError ? (
          <Icons.X className="h-4 w-4" />
        ) : isProcessing ? (
          <Icons.Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          index + 1
        )}
      </div>

      {/* Step info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCompleted && "text-success",
            isError && "text-destructive",
            isActive && "text-brand"
          )}
        >
          {step.label}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {step.productType === "ai" ? "AI" : step.productType === "app" ? "App" : "Tool"}
          {step.requiresAuth && " · Account required"}
        </p>
      </div>

      {/* Progress bar for processing step */}
      {isProcessing && progress !== undefined && (
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${progress}% complete`}>
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PipelineConnector — arrow between steps
// ---------------------------------------------------------------------------

function PipelineConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div className="flex flex-col items-center py-1" aria-hidden="true">
      <div
        className={cn(
          "w-px h-6 transition-colors",
          isCompleted ? "bg-success/40" : "bg-border/60"
        )}
      />
      <Icons.ChevronDown
        className={cn(
          "h-3 w-3 -mt-1 transition-colors",
          isCompleted ? "text-success/60" : "text-muted-foreground/40"
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// WorkflowDetail — full workflow detail view
// ---------------------------------------------------------------------------

interface WorkflowDetailProps {
  workflow: WorkflowDefinition;
  onStart?: () => void;
  className?: string;
}

export function WorkflowDetail({ workflow, className }: WorkflowDetailProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[workflow.icon] || Icons.Workflow;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-brand ring-1 ring-brand/20">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground">{workflow.shortDescription}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
      </div>

      {/* Pipeline visualization */}
      <div>
        <h2 className="text-sm font-semibold mb-4">Pipeline</h2>
        <WorkflowPipeline workflow={workflow} />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2">
        {workflow.categories.map((cat) => (
          <Badge key={cat} variant="outline" className="text-[11px]">
            {cat}
          </Badge>
        ))}
        {workflow.estimatedTime && (
          <Badge variant="secondary" className="text-[11px] gap-1">
            <Icons.Clock className="h-3 w-3" />
            {workflow.estimatedTime}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStepIcon(step: WorkflowStep): string {
  switch (step.productType) {
    case "ai":
      return "Sparkles";
    case "app":
      return "Layout";
    default:
      return "Wrench";
  }
}

// ---------------------------------------------------------------------------
// WorkflowRunCard — displays a past workflow run in history
// ---------------------------------------------------------------------------

interface WorkflowRunCardProps {
  run: {
    id: string;
    workflowId: string;
    workflowName: string;
    status: "completed" | "failed" | "cancelled";
    startedAt: number;
    completedAt?: number;
  };
  className?: string;
  onClick?: () => void;
}

export function WorkflowRunCard({ run, className, onClick }: WorkflowRunCardProps) {
  const duration = run.completedAt
    ? `${((run.completedAt - run.startedAt) / 1000).toFixed(1)}s`
    : "—";

  return (
    <Card
      className={cn(
        "card-lift cursor-pointer h-full border-border/60 hover:border-brand/25 transition-all duration-200",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">{run.workflowName}</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 px-1.5",
              run.status === "completed" && "border-success/30 text-success bg-success/5",
              run.status === "failed" && "border-destructive/30 text-destructive bg-destructive/5",
              run.status === "cancelled" && "border-muted-foreground/30 text-muted-foreground"
            )}
          >
            {run.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Icons.Clock className="h-3 w-3" />
          <span>{new Date(run.startedAt).toLocaleDateString()}</span>
          <span className="text-border">·</span>
          <span>{duration}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// WorkflowHistoryList — displays a list of past workflow runs
// ---------------------------------------------------------------------------

interface WorkflowHistoryListProps {
  runs: Array<{
    id: string;
    workflowId: string;
    workflowName: string;
    status: "completed" | "failed" | "cancelled";
    startedAt: number;
    completedAt?: number;
  }>;
  onRunClick?: (runId: string) => void;
  onClear?: () => void;
  className?: string;
}

export function WorkflowHistoryList({
  runs,
  onRunClick,
  onClear,
  className,
}: WorkflowHistoryListProps) {
  if (runs.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Icons.History className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No workflow runs yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Run a workflow to see it here
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Icons.History className="h-4 w-4 text-muted-foreground" />
          Recent Runs
        </h3>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear history
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {runs.slice(0, 6).map((run) => (
          <WorkflowRunCard
            key={run.id}
            run={run}
            onClick={() => onRunClick?.(run.id)}
          />
        ))}
      </div>
    </div>
  );
}