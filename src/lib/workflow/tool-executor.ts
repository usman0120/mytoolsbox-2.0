// ---------------------------------------------------------------------------
// Workflow Tool Executor — Maps tool slugs to their logic functions
// ---------------------------------------------------------------------------
// This is the bridge between the workflow pipeline engine and the actual
// tool implementations. Each tool's pure logic function is imported and
// wrapped with the StepExecutor interface.
// ---------------------------------------------------------------------------

import type { StepExecutor } from "@/lib/workflow/engine";
import type { WorkflowStep } from "@/types/workflow";

// ---------------------------------------------------------------------------
// Tool logic imports (pure functions, not React components)
// ---------------------------------------------------------------------------

import { cleanText } from "@/features/tools/text-cleaner";
import { formatJSON, minifyJSON, validateJSON } from "@/features/tools/json-formatter";
import { encodeBase64, decodeBase64 } from "@/features/tools/base64-encoder";
import { encodeURL, decodeURL } from "@/features/tools/url-encoder";
import { formatHTML } from "@/features/tools/html-formatter";
import { formatCSS } from "@/features/tools/css-formatter";
import { formatSQL } from "@/lib/ai/services/sql-formatter";
import { generateUUID } from "@/features/tools/uuid-generator";
import { generateHash } from "@/features/tools/hash-generator";
import type { HashAlgorithm } from "@/features/tools/hash-generator";
import { convertCase } from "@/features/tools/case-converter";
import type { CaseType } from "@/features/tools/case-converter";
import { countWords } from "@/features/tools/word-counter";
import { generateLoremIpsum } from "@/features/tools/lorem-ipsum";
import { convertTimestamp } from "@/features/tools/timestamp-converter";
import { parseUserAgent } from "@/features/tools/user-agent-parser";
import { lookupStatus } from "@/features/tools/http-status";
import { lookupMimeType } from "@/features/tools/mime-types";
import { decodeJWT } from "@/features/tools/jwt-decoder";
import { testRegex } from "@/features/tools/regex-tester";
import { computeDiff } from "@/features/tools/diff-checker";
import { validateCron } from "@/features/tools/cron-helper";

// ---------------------------------------------------------------------------
// Executor registry — maps tool slugs to their execution functions
// ---------------------------------------------------------------------------

type ToolExecutorFn = (input: unknown, config?: Record<string, unknown>) => Promise<unknown> | unknown;

const toolExecutors: Record<string, ToolExecutorFn> = {
  // Text / Writing tools
  "text-cleaner": async (input) => {
    const text = extractString(input);
    return { result: cleanText(text), mimeType: "text/plain" };
  },
  "word-counter": async (input) => {
    const text = extractString(input);
    return { result: countWords(text), mimeType: "application/json" };
  },
  "case-converter": async (input, config) => {
    const text = extractString(input);
    const mode = (config?.mode as CaseType) ?? "lower";
    return { result: convertCase(text, mode), mimeType: "text/plain" };
  },
  "lorem-ipsum": async (input, config) => {
    const paragraphs = (config?.paragraphs as number) ?? 3;
    return { result: generateLoremIpsum(paragraphs), mimeType: "text/plain" };
  },

  // Developer tools
  "json-formatter": async (input) => {
    const text = extractString(input);
    return { result: formatJSON(text), mimeType: "application/json" };
  },
  "json-validator": async (input) => {
    const text = extractString(input);
    return { result: validateJSON(text), mimeType: "application/json" };
  },
  "base64-encoder": async (input, config) => {
    const text = extractString(input);
    const mode = (config?.mode as string) ?? "encode";
    return {
      result: mode === "decode" ? decodeBase64(text) : encodeBase64(text),
      mimeType: "text/plain",
    };
  },
  "url-encoder": async (input, config) => {
    const text = extractString(input);
    const mode = (config?.mode as string) ?? "encode";
    return {
      result: mode === "decode" ? decodeURL(text) : encodeURL(text),
      mimeType: "text/plain",
    };
  },
  "html-formatter": async (input) => {
    const text = extractString(input);
    return { result: formatHTML(text), mimeType: "text/html" };
  },
  "css-formatter": async (input) => {
    const text = extractString(input);
    return { result: formatCSS(text), mimeType: "text/css" };
  },
  "sql-formatter": async (input) => {
    const text = extractString(input);
    const result = await formatSQL({ sql: text, action: "format" });
    return { result: result.result, mimeType: "text/plain" };
  },
  "uuid-generator": async () => {
    return { result: generateUUID(), mimeType: "text/plain" };
  },
  "hash-generator": async (input, config) => {
    const text = extractString(input);
    const algo = (config?.algorithm as HashAlgorithm) ?? "SHA-256";
    return { result: await generateHash(text, algo), mimeType: "text/plain" };
  },
  "timestamp-converter": async (input) => {
    const text = extractString(input);
    return { result: convertTimestamp(text, "iso"), mimeType: "application/json" };
  },
  "user-agent-parser": async (input) => {
    const text = extractString(input);
    return { result: parseUserAgent(text), mimeType: "application/json" };
  },
  "http-status": async (input) => {
    const text = extractString(input);
    const code = parseInt(text, 10);
    return { result: lookupStatus(isNaN(code) ? 200 : code), mimeType: "application/json" };
  },
  "mime-types": async (input) => {
    const text = extractString(input);
    return { result: lookupMimeType(text), mimeType: "application/json" };
  },
  "jwt-decoder": async (input) => {
    const text = extractString(input);
    return { result: decodeJWT(text), mimeType: "application/json" };
  },
  "regex-tester": async (input, config) => {
    const text = extractString(input);
    const pattern = (config?.pattern as string) ?? "";
    return { result: testRegex(pattern, text), mimeType: "application/json" };
  },
  "diff-checker": async (input) => {
    const data = input as { left: string; right: string };
    return { result: computeDiff(data.left, data.right), mimeType: "application/json" };
  },
  "cron-helper": async (input) => {
    const text = extractString(input);
    return { result: validateCron(text), mimeType: "application/json" };
  },

  // Calculator tools
  "percentage-calculator": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "age-calculator": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "bmi-calculator": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "loan-calculator": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "unit-converter": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "scientific-calculator": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "equation-solver": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "statistics-calculator": async (input) => {
    return { result: input, mimeType: "application/json" };
  },
  "matrix-calculator": async (input) => {
    return { result: input, mimeType: "application/json" };
  },

  // AI tools (pass-through — actual AI processing happens server-side)
  "ai-text-summarizer": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/plain", _aiHint: "summarize" };
  },
  "ai-notes-generator": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/markdown", _aiHint: "study-notes" };
  },
  "ai-quiz-generator": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "application/json", _aiHint: "quiz" };
  },
  "ai-project-ideas": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/plain", _aiHint: "project-ideas" };
  },
  "ai-planning": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/plain", _aiHint: "planning" };
  },
  "ai-diagram-generator": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "image/svg+xml", _aiHint: "diagram" };
  },
  "ai-regex-builder": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/plain", _aiHint: "regex" };
  },
  "ai-sql-assistant": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/plain", _aiHint: "sql" };
  },
  "ai-doc-generator": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/markdown", _aiHint: "documentation" };
  },
  "ai-error-explainer": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/plain", _aiHint: "error-explanation" };
  },

  // Document tools (pass-through — actual processing is file-based)
  "pdf-to-text": async (input) => {
    return { result: input, mimeType: "text/plain", _docHint: "pdf-extract" };
  },
  "markdown-to-pdf": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "application/pdf", _docHint: "markdown-to-pdf" };
  },
  "presentation-maker": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "application/pdf", _docHint: "presentation" };
  },
  "image-to-text": async (input) => {
    return { result: input, mimeType: "text/plain", _imgHint: "ocr" };
  },
  "math-solver": async (input) => {
    const text = extractString(input);
    return { result: text, mimeType: "text/plain", _mathHint: "solve" };
  },
};

// ---------------------------------------------------------------------------
// Create a StepExecutor from the registry
// ---------------------------------------------------------------------------

export function createToolExecutor(
  options: {
    onProgress?: (stepId: string, progress: number) => void;
    signal?: AbortSignal;
  } = {}
): StepExecutor {
  const { onProgress, signal } = options;

  return async (step: WorkflowStep, input: unknown, abortSignal?: AbortSignal) => {
    const execSignal = abortSignal ?? signal;

    // Check for abort
    if (execSignal?.aborted) {
      throw new Error("Workflow cancelled");
    }

    const executor = toolExecutors[step.toolSlug];
    if (!executor) {
      // Unknown tool — pass through
      console.warn(`No executor found for tool: ${step.toolSlug}`);
      return { result: input, mimeType: "text/plain", _passthrough: true };
    }

    // Report progress
    onProgress?.(step.id, 10);

    // Simulate processing delay for visual feedback (100-500ms)
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

    onProgress?.(step.id, 50);

    try {
      const result = await executor(input, step.config);
      onProgress?.(step.id, 100);
      return result;
    } catch (err) {
      onProgress?.(step.id, 0);
      throw err;
    }
  };
}

// ---------------------------------------------------------------------------
// Check if a tool has a registered executor
// ---------------------------------------------------------------------------

export function hasExecutor(toolSlug: string): boolean {
  return toolSlug in toolExecutors;
}

// ---------------------------------------------------------------------------
// Get all registered tool slugs
// ---------------------------------------------------------------------------

export function getRegisteredToolSlugs(): string[] {
  return Object.keys(toolExecutors);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractString(input: unknown): string {
  if (typeof input === "string") return input;
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (typeof obj.result === "string") return obj.result;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.content === "string") return obj.content;
    return JSON.stringify(obj);
  }
  return String(input ?? "");
}