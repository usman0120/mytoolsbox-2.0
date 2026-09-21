// ---------------------------------------------------------------------------
// Workflow History & Saved Workflows
// ---------------------------------------------------------------------------
// Persists workflow run history and user-saved workflows in localStorage.
// In production, this would sync with Firestore for cross-device access.
// ---------------------------------------------------------------------------

import type { WorkflowDefinition, WorkflowExecutionState } from "@/types/workflow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkflowRunRecord {
  /** Unique run ID */
  id: string;
  /** Workflow that was run */
  workflowId: string;
  workflowName: string;
  /** Execution state snapshot */
  state: WorkflowExecutionState;
  /** When the run started */
  startedAt: number;
  /** When the run completed */
  completedAt?: number;
  /** Overall status */
  status: "completed" | "failed" | "cancelled";
}

export interface SavedWorkflow {
  /** Unique saved workflow ID */
  id: string;
  /** The workflow definition */
  definition: WorkflowDefinition;
  /** When it was saved */
  savedAt: number;
  /** User-given name (can differ from definition name) */
  customName?: string;
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const HISTORY_KEY = "mytoolsbox_workflow_history";
const SAVED_KEY = "mytoolsbox_saved_workflows";
const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// ---------------------------------------------------------------------------
// Workflow Run History
// ---------------------------------------------------------------------------

export function getWorkflowHistory(): WorkflowRunRecord[] {
  return readStore<WorkflowRunRecord[]>(HISTORY_KEY, []);
}

export function addWorkflowRun(run: WorkflowRunRecord): void {
  const history = getWorkflowHistory();
  history.unshift(run);
  // Keep only the most recent runs
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  writeStore(HISTORY_KEY, history);
}

export function clearWorkflowHistory(): void {
  writeStore(HISTORY_KEY, []);
}

export function getWorkflowRunById(id: string): WorkflowRunRecord | undefined {
  return getWorkflowHistory().find((r) => r.id === id);
}

// ---------------------------------------------------------------------------
// Saved Workflows
// ---------------------------------------------------------------------------

export function getSavedWorkflows(): SavedWorkflow[] {
  return readStore<SavedWorkflow[]>(SAVED_KEY, []);
}

export function saveWorkflow(workflow: SavedWorkflow): void {
  const saved = getSavedWorkflows();
  // Replace if already exists
  const existingIndex = saved.findIndex((s) => s.id === workflow.id);
  if (existingIndex >= 0) {
    saved[existingIndex] = workflow;
  } else {
    saved.unshift(workflow);
  }
  writeStore(SAVED_KEY, saved);
}

export function removeSavedWorkflow(id: string): void {
  const saved = getSavedWorkflows().filter((s) => s.id !== id);
  writeStore(SAVED_KEY, saved);
}

export function getSavedWorkflowById(id: string): SavedWorkflow | undefined {
  return getSavedWorkflows().find((s) => s.id === id);
}