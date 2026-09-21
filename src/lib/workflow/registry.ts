// ---------------------------------------------------------------------------
// Workflow Registry — Predefined workflow pipelines
// ---------------------------------------------------------------------------
// These are the "recipes" that make MyToolsBox more than a collection of
// tools. Each workflow chains compatible tools together to accomplish a
// complex task from a simple user intent.
// ---------------------------------------------------------------------------

import type { WorkflowDefinition } from "@/types/workflow";

// ---------------------------------------------------------------------------
// Document Workflows
// ---------------------------------------------------------------------------

export const documentToStudyNotes: WorkflowDefinition = {
  id: "document-to-study-notes",
  name: "Document to Study Notes",
  shortDescription: "Turn any document into summarized study notes",
  description:
    "Upload a PDF or document, extract the text, summarize it with AI, format it as clean notes, and download as PDF.",
  icon: "BookOpen",
  inputType: "application/pdf",
  outputType: "application/pdf",
  categories: ["documents", "academic", "productivity"],
  keywords: ["study", "notes", "summarize", "pdf", "document", "learning"],
  featured: true,
  estimatedTime: "15-30s",
  steps: [
    {
      id: "step-0-pdf-extract",
      toolSlug: "pdf-to-text",
      label: "Extract text from PDF",
      productType: "tool",
      inputTypes: ["application/pdf"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-ai-summarize",
      toolSlug: "ai-text-summarizer",
      label: "AI Summarize",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-2-format-notes",
      toolSlug: "ai-notes-generator",
      label: "Format as study notes",
      productType: "app",
      inputTypes: ["text/plain"],
      outputTypes: ["application/pdf", "text/markdown"],
      requiresAuth: true,
      requiresPro: false,
    },
  ],
};

export const pdfToPresentation: WorkflowDefinition = {
  id: "pdf-to-presentation",
  name: "PDF to Presentation",
  shortDescription: "Convert a document into presentation slides",
  description:
    "Extract content from a PDF, summarize key points, and generate a presentation with slides.",
  icon: "Presentation",
  inputType: "application/pdf",
  outputType: "application/pdf",
  categories: ["documents", "productivity", "business"],
  keywords: ["presentation", "slides", "pdf", "convert", "business"],
  featured: true,
  estimatedTime: "20-40s",
  steps: [
    {
      id: "step-0-extract",
      toolSlug: "pdf-to-text",
      label: "Extract text from PDF",
      productType: "tool",
      inputTypes: ["application/pdf"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-summarize",
      toolSlug: "ai-text-summarizer",
      label: "Extract key points",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-2-presentation",
      toolSlug: "presentation-maker",
      label: "Generate presentation",
      productType: "app",
      inputTypes: ["text/plain"],
      outputTypes: ["application/pdf"],
      requiresAuth: true,
      requiresPro: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Image Workflows
// ---------------------------------------------------------------------------

export const imageToMathSolution: WorkflowDefinition = {
  id: "image-to-math-solution",
  name: "Image to Math Solution",
  shortDescription: "Snap a math problem and get step-by-step solution",
  description:
    "Upload an image of a math problem, extract the problem with OCR, solve it with AI, and get practice questions.",
  icon: "Calculator",
  inputType: "image/*",
  outputType: "text/plain",
  categories: ["images", "academic", "calculators"],
  keywords: ["math", "ocr", "solve", "homework", "practice", "learning"],
  featured: true,
  estimatedTime: "10-20s",
  steps: [
    {
      id: "step-0-ocr",
      toolSlug: "image-to-text",
      label: "Extract text from image",
      productType: "tool",
      inputTypes: ["image/*"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-solve",
      toolSlug: "math-solver",
      label: "Solve math problem",
      productType: "app",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-2-practice",
      toolSlug: "ai-quiz-generator",
      label: "Generate practice questions",
      productType: "app",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Development Workflows
// ---------------------------------------------------------------------------

export const ideaToDiagram: WorkflowDefinition = {
  id: "idea-to-diagram",
  name: "Idea to Diagram",
  shortDescription: "Turn your project idea into a visual diagram",
  description:
    "Describe your project idea, get a structured plan, break it into tasks, create a timeline, and generate a diagram.",
  icon: "GitBranch",
  inputType: "text/plain",
  outputType: "image/png",
  categories: ["developer", "productivity", "design"],
  keywords: ["diagram", "planning", "project", "idea", "architecture", "design"],
  featured: true,
  estimatedTime: "15-25s",
  steps: [
    {
      id: "step-0-ideas",
      toolSlug: "ai-project-ideas",
      label: "Generate project ideas",
      productType: "app",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-1-plan",
      toolSlug: "ai-planning",
      label: "Create project plan",
      productType: "app",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-2-diagram",
      toolSlug: "ai-diagram-generator",
      label: "Generate diagram",
      productType: "app",
      inputTypes: ["text/plain"],
      outputTypes: ["image/png", "image/svg+xml"],
      requiresAuth: true,
      requiresPro: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Writing Workflows
// ---------------------------------------------------------------------------

export const draftToProfessionalDoc: WorkflowDefinition = {
  id: "draft-to-professional-doc",
  name: "Draft to Professional Document",
  shortDescription: "Polish your draft into a professional document",
  description:
    "Take a rough draft, clean up the text, improve grammar, format professionally, and export as PDF.",
  icon: "FileText",
  inputType: "text/plain",
  outputType: "application/pdf",
  categories: ["writing", "productivity", "business"],
  keywords: ["writing", "grammar", "polish", "professional", "document", "export"],
  estimatedTime: "10-20s",
  steps: [
    {
      id: "step-0-clean",
      toolSlug: "text-cleaner",
      label: "Clean up text",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-improve",
      toolSlug: "ai-text-summarizer",
      label: "Improve writing",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-2-format",
      toolSlug: "markdown-to-pdf",
      label: "Format and export PDF",
      productType: "tool",
      inputTypes: ["text/plain", "text/markdown"],
      outputTypes: ["application/pdf"],
      requiresAuth: false,
      requiresPro: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Developer Workflows
// ---------------------------------------------------------------------------

export const jsonPipeline: WorkflowDefinition = {
  id: "json-pipeline",
  name: "JSON Cleanup Pipeline",
  shortDescription: "Validate, format, and minify JSON in one go",
  description:
    "Paste messy JSON, validate the structure, format it nicely, then minify for production use.",
  icon: "Braces",
  inputType: "application/json",
  outputType: "application/json",
  categories: ["developer", "productivity"],
  keywords: ["json", "validate", "format", "minify", "developer", "cleanup"],
  estimatedTime: "1-3s",
  steps: [
    {
      id: "step-0-validate",
      toolSlug: "json-validator",
      label: "Validate JSON",
      productType: "tool",
      inputTypes: ["application/json", "text/plain"],
      outputTypes: ["application/json"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-format",
      toolSlug: "json-formatter",
      label: "Format JSON",
      productType: "tool",
      inputTypes: ["application/json", "text/plain"],
      outputTypes: ["application/json"],
      requiresAuth: false,
      requiresPro: false,
    },
  ],
};

export const textAnalysisPipeline: WorkflowDefinition = {
  id: "text-analysis-pipeline",
  name: "Text Analysis Pipeline",
  shortDescription: "Clean, count, and analyze text",
  description:
    "Clean up messy text, count words and characters, then get AI-powered insights about the content.",
  icon: "FileSearch",
  inputType: "text/plain",
  outputType: "application/json",
  categories: ["writing", "productivity"],
  keywords: ["text", "analysis", "clean", "count", "insights", "writing"],
  estimatedTime: "3-8s",
  steps: [
    {
      id: "step-0-clean",
      toolSlug: "text-cleaner",
      label: "Clean text",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-count",
      toolSlug: "word-counter",
      label: "Count words & characters",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["application/json"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-2-summarize",
      toolSlug: "ai-text-summarizer",
      label: "AI Summary",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
  ],
};

export const encodeDecodePipeline: WorkflowDefinition = {
  id: "encode-decode-pipeline",
  name: "Encode/Decode Pipeline",
  shortDescription: "Chain multiple encoding operations",
  description:
    "Apply multiple encoding transformations in sequence: Base64 encode, then URL encode for safe transmission.",
  icon: "Binary",
  inputType: "text/plain",
  outputType: "text/plain",
  categories: ["developer", "security"],
  keywords: ["encode", "decode", "base64", "url", "transform", "developer"],
  estimatedTime: "1-2s",
  steps: [
    {
      id: "step-0-base64",
      toolSlug: "base64-encoder",
      label: "Base64 Encode",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
      config: { mode: "encode" },
    },
    {
      id: "step-1-url",
      toolSlug: "url-encoder",
      label: "URL Encode",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
      config: { mode: "encode" },
    },
  ],
};

export const codeFormatterPipeline: WorkflowDefinition = {
  id: "code-formatter-pipeline",
  name: "Code Formatter Pipeline",
  shortDescription: "Format HTML, CSS, and JSON together",
  description:
    "Take raw web code and format HTML, CSS, and JSON through a single pipeline.",
  icon: "Code2",
  inputType: "text/html",
  outputType: "text/css",
  categories: ["developer", "design"],
  keywords: ["code", "format", "html", "css", "json", "web", "developer"],
  estimatedTime: "2-5s",
  steps: [
    {
      id: "step-0-html",
      toolSlug: "html-formatter",
      label: "Format HTML",
      productType: "tool",
      inputTypes: ["text/html", "text/plain"],
      outputTypes: ["text/html"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-css",
      toolSlug: "css-formatter",
      label: "Format CSS",
      productType: "tool",
      inputTypes: ["text/css", "text/plain"],
      outputTypes: ["text/css"],
      requiresAuth: false,
      requiresPro: false,
    },
  ],
};

export const devToolkitPipeline: WorkflowDefinition = {
  id: "dev-toolkit-pipeline",
  name: "Developer Toolkit Pipeline",
  shortDescription: "Generate UUID, hash it, and encode as JWT",
  description:
    "Generate a UUID, create a SHA-256 hash, and wrap it in a JWT-like structure for API testing.",
  icon: "Terminal",
  inputType: "text/plain",
  outputType: "application/json",
  categories: ["developer", "security"],
  keywords: ["uuid", "hash", "jwt", "developer", "api", "testing"],
  estimatedTime: "1-3s",
  steps: [
    {
      id: "step-0-uuid",
      toolSlug: "uuid-generator",
      label: "Generate UUID",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-hash",
      toolSlug: "hash-generator",
      label: "Hash with SHA-256",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
      config: { algorithm: "sha256" },
    },
    {
      id: "step-2-jwt",
      toolSlug: "jwt-decoder",
      label: "JWT Decode (verify structure)",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["application/json"],
      requiresAuth: false,
      requiresPro: false,
    },
  ],
};

export const aiWritingAssistant: WorkflowDefinition = {
  id: "ai-writing-assistant",
  name: "AI Writing Assistant",
  shortDescription: "Clean, improve, and format your writing with AI",
  description:
    "Clean up your draft, get AI-powered writing improvements, and generate documentation from the result.",
  icon: "PenLine",
  inputType: "text/plain",
  outputType: "text/markdown",
  categories: ["writing", "ai", "productivity"],
  keywords: ["writing", "ai", "improve", "grammar", "documentation", "polish"],
  featured: true,
  estimatedTime: "5-15s",
  steps: [
    {
      id: "step-0-clean",
      toolSlug: "text-cleaner",
      label: "Clean up text",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-improve",
      toolSlug: "ai-text-summarizer",
      label: "AI Writing Improvement",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-2-docs",
      toolSlug: "ai-doc-generator",
      label: "Generate Documentation",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/markdown"],
      requiresAuth: true,
      requiresPro: false,
    },
  ],
};

export const errorDebuggingPipeline: WorkflowDefinition = {
  id: "error-debugging-pipeline",
  name: "Error Debugging Pipeline",
  shortDescription: "Parse errors, explain them, and suggest fixes",
  description:
    "Paste an error message, get it explained in plain English, and receive AI-generated fix suggestions.",
  icon: "Bug",
  inputType: "text/plain",
  outputType: "text/plain",
  categories: ["developer", "ai"],
  keywords: ["error", "debug", "explain", "fix", "developer", "troubleshoot"],
  featured: true,
  estimatedTime: "3-8s",
  steps: [
    {
      id: "step-0-parse",
      toolSlug: "text-cleaner",
      label: "Clean error text",
      productType: "tool",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: false,
      requiresPro: false,
    },
    {
      id: "step-1-explain",
      toolSlug: "ai-error-explainer",
      label: "AI Error Explanation",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
    {
      id: "step-2-fix",
      toolSlug: "ai-regex-builder",
      label: "AI Fix Suggestions",
      productType: "ai",
      inputTypes: ["text/plain"],
      outputTypes: ["text/plain"],
      requiresAuth: true,
      requiresPro: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// All Workflows
// ---------------------------------------------------------------------------

export const workflowRegistry: WorkflowDefinition[] = [
  documentToStudyNotes,
  pdfToPresentation,
  imageToMathSolution,
  ideaToDiagram,
  draftToProfessionalDoc,
  jsonPipeline,
  textAnalysisPipeline,
  encodeDecodePipeline,
  codeFormatterPipeline,
  devToolkitPipeline,
  aiWritingAssistant,
  errorDebuggingPipeline,
];

/** Look up a workflow by ID */
export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return workflowRegistry.find((w) => w.id === id);
}

/** Get featured workflows */
export function getFeaturedWorkflows(): WorkflowDefinition[] {
  return workflowRegistry.filter((w) => w.featured);
}

/** Get workflows by category */
export function getWorkflowsByCategory(category: string): WorkflowDefinition[] {
  return workflowRegistry.filter((w) => w.categories.includes(category));
}