// ---------------------------------------------------------------------------
// Workflow Engine — Pipeline builder & compatibility resolver
// ---------------------------------------------------------------------------
// The engine takes a user's intent ("Turn this PDF into summarized study notes")
// and resolves it into a chain of compatible tools.
//
// Architecture:
//   1. Compatibility graph — which tools can feed into which
//   2. Path resolver — find the shortest chain from input to output
//   3. Pipeline executor — run steps sequentially, passing output → input
// ---------------------------------------------------------------------------

import type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowStepState,
  WorkflowExecutionState,
  CompatibilityRule,
} from "@/types/workflow";
import type { ToolDefinition } from "@/types/tool";

// ---------------------------------------------------------------------------
// Compatibility Graph
// ---------------------------------------------------------------------------

class CompatibilityGraph {
  // Map of output MIME type → set of tool slugs that accept it as input
  private acceptors = new Map<string, Set<string>>();
  // Map of tool slug → its ToolDefinition
  private tools = new Map<string, ToolDefinition>();

  constructor(toolRegistry: ToolDefinition[], rules: CompatibilityRule[]) {
    // Index all tools
    for (const tool of toolRegistry) {
      this.tools.set(tool.slug, tool);
    }

    // Build acceptor map from tool definitions
    for (const tool of toolRegistry) {
      for (const inputType of tool.inputTypes) {
        if (!this.acceptors.has(inputType)) {
          this.acceptors.set(inputType, new Set());
        }
        this.acceptors.get(inputType)!.add(tool.slug);
      }
    }

    // Apply explicit compatibility rules (override/augment)
    for (const rule of rules) {
      // Ensure the target accepts the source's output types
      const sourceTool = this.tools.get(rule.sourceSlug);
      if (!sourceTool) continue;

      for (const outputType of sourceTool.outputTypes) {
        if (!this.acceptors.has(outputType)) {
          this.acceptors.set(outputType, new Set());
        }
        this.acceptors.get(outputType)!.add(rule.targetSlug);
      }
    }
  }

  /** Get all tools that can accept a given output type */
  getAcceptors(outputType: string): string[] {
    return Array.from(this.acceptors.get(outputType) ?? []);
  }

  /** Check if tool A's output can feed into tool B's input */
  canChain(sourceSlug: string, targetSlug: string): boolean {
    const source = this.tools.get(sourceSlug);
    const target = this.tools.get(targetSlug);
    if (!source || !target) return false;

    return source.outputTypes.some((outType) =>
      target.inputTypes.includes(outType)
    );
  }

  /** Get a tool definition by slug */
  getTool(slug: string): ToolDefinition | undefined {
    return this.tools.get(slug);
  }

  /** Get all registered tool slugs */
  getAllSlugs(): string[] {
    return Array.from(this.tools.keys());
  }
}

// ---------------------------------------------------------------------------
// Path Resolver — BFS to find shortest chain
// ---------------------------------------------------------------------------

interface ResolvedPath {
  steps: WorkflowStep[];
  totalSteps: number;
}

function resolvePath(
  graph: CompatibilityGraph,
  startSlug: string,
  targetOutputType: string,
  maxDepth = 6
): ResolvedPath | null {
  // BFS to find shortest path from startSlug to a tool that outputs targetOutputType
  interface QueueItem {
    slug: string;
    path: string[];
  }

  const visited = new Set<string>();
  const queue: QueueItem[] = [{ slug: startSlug, path: [startSlug] }];
  visited.add(startSlug);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.path.length > maxDepth) continue;

    const tool = graph.getTool(current.slug);
    if (!tool) continue;

    // Check if current tool already outputs the target
    if (tool.outputTypes.includes(targetOutputType)) {
      return buildStepChain(graph, current.path);
    }

    // Explore next tools
    for (const outputType of tool.outputTypes) {
      const acceptors = graph.getAcceptors(outputType);
      for (const acceptor of acceptors) {
        if (!visited.has(acceptor)) {
          visited.add(acceptor);
          queue.push({
            slug: acceptor,
            path: [...current.path, acceptor],
          });
        }
      }
    }
  }

  return null;
}

function buildStepChain(
  graph: CompatibilityGraph,
  slugs: string[]
): ResolvedPath {
  const steps: WorkflowStep[] = slugs.map((slug, index) => {
    const tool = graph.getTool(slug)!;
    return {
      id: `step-${index}-${slug}`,
      toolSlug: slug,
      label: tool.name,
      productType: tool.productType,
      inputTypes: tool.inputTypes,
      outputTypes: tool.outputTypes,
      requiresAuth: tool.requiresAuth,
      requiresPro: tool.requiresPro,
    };
  });

  return { steps, totalSteps: steps.length };
}

// ---------------------------------------------------------------------------
// Pipeline Executor
// ---------------------------------------------------------------------------

export type StepExecutor = (
  step: WorkflowStep,
  input: unknown,
  signal?: AbortSignal
) => Promise<unknown>;

export interface PipelineOptions {
  onStepChange?: (state: WorkflowExecutionState) => void;
  signal?: AbortSignal;
}

export async function executePipeline(
  workflow: WorkflowDefinition,
  initialInput: unknown,
  executor: StepExecutor,
  options: PipelineOptions = {}
): Promise<WorkflowExecutionState> {
  const { onStepChange, signal } = options;

  const stepStates: WorkflowStepState[] = workflow.steps.map((step) => ({
    stepId: step.id,
    status: "idle" as const,
  }));

  const state: WorkflowExecutionState = {
    workflowId: workflow.id,
    currentStepIndex: 0,
    steps: stepStates,
    overallStatus: "running",
    startedAt: Date.now(),
  };

  let currentInput = initialInput;

  for (let i = 0; i < workflow.steps.length; i++) {
    // Check for abort
    if (signal?.aborted) {
      state.overallStatus = "cancelled";
      state.completedAt = Date.now();
      onStepChange?.({ ...state });
      return state;
    }

    const step = workflow.steps[i];
    state.currentStepIndex = i;
    state.steps[i] = { ...state.steps[i], status: "processing", progress: 0 };
    onStepChange?.({ ...state, steps: [...state.steps] });

    try {
      const output = await executor(step, currentInput, signal);
      state.steps[i] = {
        ...state.steps[i],
        status: "completed",
        progress: 100,
        output,
      };
      currentInput = output;
    } catch (err) {
      state.steps[i] = {
        ...state.steps[i],
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      };
      state.overallStatus = "failed";
      state.completedAt = Date.now();
      onStepChange?.({ ...state, steps: [...state.steps] });
      return state;
    }

    onStepChange?.({ ...state, steps: [...state.steps] });
  }

  state.overallStatus = "completed";
  state.completedAt = Date.now();
  onStepChange?.({ ...state, steps: [...state.steps] });

  return state;
}

// ---------------------------------------------------------------------------
// Workflow Engine (public API)
// ---------------------------------------------------------------------------

export class WorkflowEngine {
  private graph: CompatibilityGraph;

  constructor(toolRegistry: ToolDefinition[], rules: CompatibilityRule[] = []) {
    this.graph = new CompatibilityGraph(toolRegistry, rules);
  }

  /** Find a chain of tools from startSlug to desired output type */
  findPath(
    startSlug: string,
    targetOutputType: string,
    maxDepth = 6
  ): ResolvedPath | null {
    return resolvePath(this.graph, startSlug, targetOutputType, maxDepth);
  }

  /** Check if two tools can be chained */
  canChain(sourceSlug: string, targetSlug: string): boolean {
    return this.graph.canChain(sourceSlug, targetSlug);
  }

  /** Get all tools that can follow a given tool */
  getNextTools(slug: string): ToolDefinition[] {
    const tool = this.graph.getTool(slug);
    if (!tool) return [];

    const nextSlugs = new Set<string>();
    for (const outputType of tool.outputTypes) {
      for (const acceptor of this.graph.getAcceptors(outputType)) {
        nextSlugs.add(acceptor);
      }
    }

    return Array.from(nextSlugs)
      .map((s) => this.graph.getTool(s))
      .filter(Boolean) as ToolDefinition[];
  }

  /** Get all tools that can feed into a given tool */
  getPreviousTools(slug: string): ToolDefinition[] {
    const tool = this.graph.getTool(slug);
    if (!tool) return [];

    const prevSlugs = new Set<string>();
    for (const inputType of tool.inputTypes) {
      for (const otherSlug of this.graph.getAllSlugs()) {
        const other = this.graph.getTool(otherSlug);
        if (other && other.outputTypes.includes(inputType)) {
          prevSlugs.add(otherSlug);
        }
      }
    }

    return Array.from(prevSlugs)
      .map((s) => this.graph.getTool(s))
      .filter(Boolean) as ToolDefinition[];
  }

  /** Build a WorkflowDefinition from a resolved path */
  buildWorkflow(
    id: string,
    name: string,
    description: string,
    shortDescription: string,
    icon: string,
    path: ResolvedPath,
    categories: string[] = [],
    keywords: string[] = []
  ): WorkflowDefinition {
    const firstStep = path.steps[0];
    const lastStep = path.steps[path.steps.length - 1];

    return {
      id,
      name,
      shortDescription,
      description,
      icon,
      steps: path.steps,
      inputType: firstStep.inputTypes[0] ?? "*/*",
      outputType: lastStep.outputTypes[0] ?? "*/*",
      categories,
      keywords,
      estimatedTime: `${path.totalSteps * 5}-${path.totalSteps * 15}s`,
    };
  }

  /** Get the underlying graph (for debugging) */
  getGraph(): CompatibilityGraph {
    return this.graph;
  }
}