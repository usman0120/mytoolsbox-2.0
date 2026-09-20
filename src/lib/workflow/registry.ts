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
// All Workflows
// ---------------------------------------------------------------------------

export const workflowRegistry: WorkflowDefinition[] = [
  documentToStudyNotes,
  pdfToPresentation,
  imageToMathSolution,
  ideaToDiagram,
  draftToProfessionalDoc,
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