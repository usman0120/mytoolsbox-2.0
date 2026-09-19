import type { HubDefinition } from "@/types";

export const hubRegistry: HubDefinition[] = [
  {
    id: "students",
    name: "Students",
    slug: "students",
    description: "Study tools, citation generators, math solvers, quiz makers, and writing aids for academic success.",
    icon: "GraduationCap",
    audiences: ["students"],
    toolIds: [
      "percentage-calculator", "age-calculator", "bmi-calculator", "unit-converter",
      "word-counter", "case-converter", "text-cleaner", "grammar-checker", "paraphrase-tool",
      "citation-generator", "gpa-calculator", "json-formatter", "base64-encoder",
      "qr-generator", "image-compressor", "image-resizer", "image-converter",
      "pdf-merger", "pdf-splitter", "pdf-compressor", "notes-app", "pomodoro-timer",
      "stopwatch", "color-palette", "password-generator", "diff-checker",
      "scientific-calculator", "matrix-calculator", "equation-solver",
      "statistics-calculator", "study-timer", "quiz-generator", "flashcard-generator",
    ],
    appIds: ["math-solver", "study-planner", "research-assistant", "quiz-maker", "ai-quiz-generator", "ai-notes-generator"],
  },
  {
    id: "developers",
    name: "Developers",
    slug: "developers",
    description: "Code formatters, diff checkers, API testers, regex tools, and dev utilities for your workflow.",
    icon: "Code",
    audiences: ["developers"],
    toolIds: [
      "json-formatter", "json-validator", "base64-encoder", "url-encoder",
      "regex-tester", "diff-checker", "markdown-preview", "sql-formatter",
      "color-contrast", "hash-generator", "jwt-decoder", "password-generator",
      "qr-generator", "barcode-generator", "image-compressor", "image-converter",
      "text-cleaner", "case-converter", "word-counter", "lorem-ipsum",
      "url-shortener", "random-generator", "color-palette",
    ],
    appIds: ["diagram-maker", "image-editor"],
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    description: "PDF tools, invoice makers, calculators, converters, and productivity apps for professionals.",
    icon: "Briefcase",
    audiences: ["business"],
    toolIds: [
      "pdf-merger", "pdf-splitter", "pdf-compressor", "pdf-to-images", "images-to-pdf",
      "image-compressor", "image-resizer", "image-converter", "image-cropper",
      "qr-generator", "barcode-generator", "percentage-calculator", "loan-calculator",
      "unit-converter", "currency-converter", "word-counter", "case-converter",
      "url-shortener", "password-generator", "hash-generator", "kanban-board",
      "notes-app", "pomodoro-timer", "stopwatch",
      "invoice-generator", "quotation-generator", "profit-calculator", "margin-calculator",
      "tax-calculator", "salary-calculator", "roi-calculator", "break-even-calculator",
      "business-name-generator", "proposal-generator", "contract-generator",
      "social-media-content-generator",
    ],
    appIds: ["invoice-maker", "presentation-maker", "budget-planner", "certificate-maker", "video-editor"],
  },
  {
    id: "designers",
    name: "Designers",
    slug: "designers",
    description: "Color palette generators, image editors, SVG optimizers, and asset tools for creatives.",
    icon: "Palette",
    audiences: ["designers"],
    toolIds: [
      "color-palette", "color-contrast", "image-compressor", "image-resizer",
      "image-converter", "image-cropper", "qr-generator", "barcode-generator",
      "pdf-to-images", "images-to-pdf", "unit-converter", "text-cleaner",
      "lorem-ipsum", "random-generator",
    ],
    appIds: ["image-editor", "diagram-maker", "ai-diagram-generator", "presentation-maker", "certificate-maker", "video-editor"],
  },
  {
    id: "writers",
    name: "Writers",
    slug: "writers",
    description: "Word counters, grammar tools, text formatters, case converters, and citation tools for wordsmiths.",
    icon: "PenLine",
    audiences: ["writers"],
    toolIds: [
      "word-counter", "case-converter", "text-cleaner", "lorem-ipsum",
      "diff-checker", "grammar-checker", "paraphrase-tool", "citation-generator",
      "markdown-preview", "json-formatter", "base64-encoder", "url-encoder",
      "password-generator", "random-generator", "notes-app",
    ],
    appIds: ["research-assistant", "presentation-maker"],
  },
  {
    id: "researchers",
    name: "Researchers",
    slug: "researchers",
    description: "Data analysis, unit converters, reference managers, research assistants, and scientific calculators.",
    icon: "Microscope",
    audiences: ["researchers"],
    toolIds: [
      "percentage-calculator", "bmi-calculator", "unit-converter", "currency-converter",
      "citation-generator", "gpa-calculator", "json-formatter", "json-validator",
      "regex-tester", "diff-checker", "markdown-preview", "sql-formatter",
      "word-counter", "text-cleaner", "grammar-checker", "paraphrase-tool",
      "pdf-merger", "pdf-compressor", "pdf-to-images", "hash-generator",
      "random-generator", "password-generator",
    ],
    appIds: ["math-solver", "research-assistant", "quiz-maker", "study-planner"],
  },
  {
    id: "farmers",
    name: "Farmers",
    slug: "farmers",
    description: "Unit converters, weather tools, crop calculators, disease analysis, and agricultural planning aids.",
    icon: "Sprout",
    audiences: ["farmers"],
    toolIds: [
      "unit-converter", "percentage-calculator", "currency-converter",
      "bmi-calculator", "qr-generator", "barcode-generator",
      "image-compressor", "image-resizer", "image-converter",
      "pdf-merger", "pdf-compressor", "notes-app", "stopwatch",
      "password-generator", "random-generator",
    ],
    appIds: ["budget-planner"],
  },
  {
    id: "everyone",
    name: "Everyone",
    slug: "everyone",
    description: "Everyday tools for common tasks — no expertise needed. Image tools, calculators, QR codes, and more.",
    icon: "Users",
    audiences: ["everyone"],
    toolIds: [
      "image-compressor", "image-resizer", "image-converter", "image-cropper",
      "qr-generator", "barcode-generator", "percentage-calculator", "age-calculator",
      "bmi-calculator", "loan-calculator", "unit-converter", "currency-converter",
      "word-counter", "case-converter", "text-cleaner", "lorem-ipsum",
      "pdf-merger", "pdf-splitter", "pdf-compressor", "pdf-to-images", "images-to-pdf",
      "password-generator", "hash-generator", "url-shortener", "random-generator",
      "color-palette", "notes-app", "pomodoro-timer", "stopwatch",
      "json-formatter", "base64-encoder", "url-encoder", "diff-checker",
    ],
    appIds: ["image-editor", "habit-tracker", "budget-planner", "video-editor"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getHubBySlug(slug: string): HubDefinition | undefined {
  return hubRegistry.find((h) => h.slug === slug);
}

export function getActiveHubs(): HubDefinition[] {
  return hubRegistry;
}

export function getHubsByAudience(audience: string): HubDefinition[] {
  return hubRegistry.filter((h) => h.audiences.includes(audience as never));
}