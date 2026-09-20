// ---------------------------------------------------------------------------
// Workflow Engine Types
// ---------------------------------------------------------------------------
// A workflow is a chain of tools/apps connected by compatible input/output
// types. Users don't need to understand the internals — they just describe
// what they want and the engine figures out the pipeline.
// ---------------------------------------------------------------------------

import type { ToolDefinition, ProductType } from "./tool";

// ---------------------------------------------------------------------------
// Workflow Step — a single node in the pipeline
// ---------------------------------------------------------------------------

export interface WorkflowStep {
  /** Unique ID for this step instance */
  id: string;
  /** Reference to the tool/app slug */
  toolSlug: string;
  /** Human-readable label for this step */
  label: string;
  /** Product type (tool, app, ai) */
  productType: ProductType;
  /** Expected input MIME types */
  inputTypes: string[];
  /** Expected output MIME types */
  outputTypes: string[];
  /** Step-specific configuration */
  config?: Record<string, unknown>;
  /** Whether this step requires authentication */
  requiresAuth: boolean;
  /** Whether this step requires Pro subscription */
  requiresPro: boolean;
}

// ---------------------------------------------------------------------------
// Workflow Definition — a complete pipeline
// ---------------------------------------------------------------------------

export interface WorkflowDefinition {
  /** Unique workflow ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Short description for cards */
  shortDescription: string;
  /** Detailed description */
  description: string;
  /** Icon (Lucide icon name) */
  icon: string;
  /** Ordered steps in the pipeline */
  steps: WorkflowStep[];
  /** Starting input type (what the user provides) */
  inputType: string;
  /** Final output type (what the user receives) */
  outputType: string;
  /** Categories this workflow belongs to */
  categories: string[];
  /** Keywords for search */
  keywords: string[];
  /** Whether this is a featured/promoted workflow */
  featured?: boolean;
  /** Estimated time to complete (human readable) */
  estimatedTime?: string;
}

// ---------------------------------------------------------------------------
// Workflow Execution State
// ---------------------------------------------------------------------------

export type WorkflowStepStatus =
  | "idle"
  | "processing"
  | "completed"
  | "error"
  | "skipped";

export interface WorkflowStepState {
  stepId: string;
  status: WorkflowStepStatus;
  progress?: number; // 0-100
  output?: unknown;
  error?: string;
}

export interface WorkflowExecutionState {
  workflowId: string;
  currentStepIndex: number;
  steps: WorkflowStepState[];
  overallStatus: "idle" | "running" | "completed" | "failed" | "cancelled";
  startedAt?: number;
  completedAt?: number;
}

// ---------------------------------------------------------------------------
// Workflow Compatibility — determines if two tools can be chained
// ---------------------------------------------------------------------------

export interface CompatibilityRule {
  /** Source tool slug */
  sourceSlug: string;
  /** Target tool slug */
  targetSlug: string;
  /** Why these tools work well together */
  description: string;
}

// ---------------------------------------------------------------------------
// Workflow Registry Entry
// ---------------------------------------------------------------------------

export interface WorkflowRegistryEntry {
  definition: WorkflowDefinition;
  /** Pre-computed compatibility map for quick lookup */
  compatibleInputs: Map<string, string[]>; // outputType → tool slugs that accept it
}