import { ToolDefinition } from "@/types";

// Lazy-load engine components per tool slug
export function getToolEngine(slug: string): string {
  // Returns the import path for the tool's engine component
  const engineMap: Record<string, string> = {
    "pdf-merger": "documents/pdf-merger-engine",
    "pdf-splitter": "documents/pdf-splitter-engine",
    "pdf-compressor": "documents/pdf-compressor-engine",
    "pdf-to-images": "documents/pdf-to-images-engine",
    "images-to-pdf": "documents/images-to-pdf-engine",
    "image-compressor": "images/image-compressor-engine",
    "image-resizer": "images/image-resizer-engine",
    "image-converter": "images/image-converter-engine",
    "image-cropper": "images/image-cropper-engine",
    "qr-generator": "images/qr-generator-engine",
    "json-formatter": "tools/json-formatter-engine",
    "json-validator": "tools/json-validator-engine",
    "base64-encoder": "tools/base64-encoder-engine",
    "url-encoder": "tools/url-encoder-engine",
    "regex-tester": "tools/regex-tester-engine",
    "percentage-calculator": "calculators/percentage-calculator-engine",
    "age-calculator": "calculators/age-calculator-engine",
    "bmi-calculator": "calculators/bmi-calculator-engine",
    "loan-calculator": "calculators/loan-calculator-engine",
    "unit-converter": "calculators/unit-converter-engine",
    "word-counter": "tools/word-counter-engine",
    "case-converter": "tools/case-converter-engine",
    "text-cleaner": "tools/text-cleaner-engine",
    "lorem-ipsum": "tools/lorem-ipsum-engine",
    "diff-checker": "tools/diff-checker-engine",
    "kanban-board": "tools/kanban-board-engine",
    "pomodoro-timer": "tools/pomodoro-timer-engine",
    "notes-app": "tools/notes-app-engine",
    "stopwatch": "tools/stopwatch-engine",
    "color-palette": "tools/color-palette-engine",
    "password-generator": "tools/password-generator-engine",
  };

  return engineMap[slug] || "";
}