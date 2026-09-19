"use client";

import dynamic from "next/dynamic";
import { ToolDefinition } from "@/types";

// Dynamic imports for all tool engines
const engineMap: Record<string, React.ComponentType<any>> = {
  // Document tools
  "pdf-merger": dynamic(() => import("@/features/documents/pdf-merger-engine").then((m) => ({ default: m.PDFMergerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-splitter": dynamic(() => import("@/features/documents/pdf-splitter-engine").then((m) => ({ default: m.PDFSplitterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-compressor": dynamic(() => import("@/features/documents/pdf-compressor-engine").then((m) => ({ default: m.PDFCompressorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-to-images": dynamic(() => import("@/features/documents/pdf-to-images-engine").then((m) => ({ default: m.PDFToImagesEngine })), {
    loading: () => <EngineLoading />,
  }),
  "images-to-pdf": dynamic(() => import("@/features/documents/images-to-pdf-engine").then((m) => ({ default: m.ImagesToPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Image tools
  "image-compressor": dynamic(() => import("@/features/images/image-compressor-engine").then((m) => ({ default: m.ImageCompressorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-resizer": dynamic(() => import("@/features/images/image-resizer-engine").then((m) => ({ default: m.ImageResizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-converter": dynamic(() => import("@/features/images/image-converter-engine").then((m) => ({ default: m.ImageConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-cropper": dynamic(() => import("@/features/images/image-cropper-engine").then((m) => ({ default: m.ImageCropperEngine })), {
    loading: () => <EngineLoading />,
  }),
  "qr-generator": dynamic(() => import("@/features/images/qr-generator-engine").then((m) => ({ default: m.QRGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Developer tools
  "json-formatter": dynamic(() => import("@/features/tools/json-formatter-engine").then((m) => ({ default: m.JSONFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "base64-encoder": dynamic(() => import("@/features/tools/base64-encoder-engine").then((m) => ({ default: m.Base64EncoderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "url-encoder": dynamic(() => import("@/features/tools/url-encoder-engine").then((m) => ({ default: m.URLEncoderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "regex-tester": dynamic(() => import("@/features/tools/regex-tester-engine").then((m) => ({ default: m.RegexTesterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "diff-checker": dynamic(() => import("@/features/tools/diff-checker-engine").then((m) => ({ default: m.DiffCheckerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "uuid-generator": dynamic(() => import("@/features/tools/uuid-generator-engine").then((m) => ({ default: m.UUIDGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "timestamp-converter": dynamic(() => import("@/features/tools/timestamp-converter-engine").then((m) => ({ default: m.TimestampConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "cron-helper": dynamic(() => import("@/features/tools/cron-helper-engine").then((m) => ({ default: m.CronHelperEngine })), {
    loading: () => <EngineLoading />,
  }),
  "html-formatter": dynamic(() => import("@/features/tools/html-formatter-engine").then((m) => ({ default: m.HTMLFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "css-formatter": dynamic(() => import("@/features/tools/css-formatter-engine").then((m) => ({ default: m.CSSFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "color-converter": dynamic(() => import("@/features/tools/color-converter-engine").then((m) => ({ default: m.ColorConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "http-status": dynamic(() => import("@/features/tools/http-status-engine").then((m) => ({ default: m.HTTPStatusEngine })), {
    loading: () => <EngineLoading />,
  }),
  "mime-types": dynamic(() => import("@/features/tools/mime-types-engine").then((m) => ({ default: m.MimeTypesEngine })), {
    loading: () => <EngineLoading />,
  }),
  "user-agent-parser": dynamic(() => import("@/features/tools/user-agent-parser-engine").then((m) => ({ default: m.UserAgentParserEngine })), {
    loading: () => <EngineLoading />,
  }),
  "api-request-builder": dynamic(() => import("@/features/tools/api-request-builder-engine").then((m) => ({ default: m.APIRequestBuilderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "webhook-tester": dynamic(() => import("@/features/tools/webhook-tester-engine").then((m) => ({ default: m.WebhookTesterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-regex-builder": dynamic(() => import("@/features/tools/ai-regex-builder-engine").then((m) => ({ default: m.AIRegexBuilderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-sql-assistant": dynamic(() => import("@/features/tools/ai-sql-assistant-engine").then((m) => ({ default: m.AISQLAssistantEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-doc-generator": dynamic(() => import("@/features/tools/ai-doc-generator-engine").then((m) => ({ default: m.AIDocumentationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-error-explainer": dynamic(() => import("@/features/tools/ai-error-explainer-engine").then((m) => ({ default: m.AIErrorExplainerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-api-doc-generator": dynamic(() => import("@/features/tools/ai-api-doc-generator-engine").then((m) => ({ default: m.AIAPIDocumentationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Writing tools
  "word-counter": dynamic(() => import("@/features/tools/word-counter-engine").then((m) => ({ default: m.WordCounterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "case-converter": dynamic(() => import("@/features/tools/case-converter-engine").then((m) => ({ default: m.CaseConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "text-cleaner": dynamic(() => import("@/features/tools/text-cleaner-engine").then((m) => ({ default: m.TextCleanerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "lorem-ipsum": dynamic(() => import("@/features/tools/lorem-ipsum-engine").then((m) => ({ default: m.LoremIpsumEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Calculator tools
  "percentage-calculator": dynamic(() => import("@/features/tools/percentage-calculator-engine").then((m) => ({ default: m.PercentageCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "age-calculator": dynamic(() => import("@/features/tools/age-calculator-engine").then((m) => ({ default: m.AgeCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "bmi-calculator": dynamic(() => import("@/features/tools/bmi-calculator-engine").then((m) => ({ default: m.BMICalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "loan-calculator": dynamic(() => import("@/features/tools/loan-calculator-engine").then((m) => ({ default: m.LoanCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "unit-converter": dynamic(() => import("@/features/tools/unit-converter-engine").then((m) => ({ default: m.UnitConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Productivity tools
  "kanban-board": dynamic(() => import("@/features/tools/kanban-board-engine").then((m) => ({ default: m.KanbanBoardEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pomodoro-timer": dynamic(() => import("@/features/tools/pomodoro-timer-engine").then((m) => ({ default: m.PomodoroTimerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "notes-app": dynamic(() => import("@/features/tools/notes-app-engine").then((m) => ({ default: m.NotesAppEngine })), {
    loading: () => <EngineLoading />,
  }),
  "stopwatch": dynamic(() => import("@/features/tools/stopwatch-engine").then((m) => ({ default: m.StopwatchEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Design tools
  "color-palette": dynamic(() => import("@/features/tools/color-palette-engine").then((m) => ({ default: m.ColorPaletteEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Security tools
  "password-generator": dynamic(() => import("@/features/tools/password-generator-engine").then((m) => ({ default: m.PasswordGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Academic tools
  "scientific-calculator": dynamic(() => import("@/features/tools/scientific-calculator-engine").then((m) => ({ default: m.ScientificCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "matrix-calculator": dynamic(() => import("@/features/tools/matrix-calculator-engine").then((m) => ({ default: m.MatrixCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "equation-solver": dynamic(() => import("@/features/tools/equation-solver-engine").then((m) => ({ default: m.EquationSolverEngine })), {
    loading: () => <EngineLoading />,
  }),
  "statistics-calculator": dynamic(() => import("@/features/tools/statistics-calculator-engine").then((m) => ({ default: m.StatisticsCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "study-timer": dynamic(() => import("@/features/tools/study-timer-engine").then((m) => ({ default: m.StudyTimerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "quiz-generator": dynamic(() => import("@/features/tools/quiz-generator-engine").then((m) => ({ default: m.QuizGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "flashcard-generator": dynamic(() => import("@/features/tools/flashcard-generator-engine").then((m) => ({ default: m.FlashcardGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "gpa-calculator": dynamic(() => import("@/features/tools/gpa-calculator-engine").then((m) => ({ default: m.GPACalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "citation-generator": dynamic(() => import("@/features/tools/citation-generator-engine").then((m) => ({ default: m.CitationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
};

function EngineLoading() {
  return (
    <div className="text-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Loading tool...</p>
    </div>
  );
}

interface ToolEngineProps {
  tool: ToolDefinition;
}

export function ToolEngine({ tool }: ToolEngineProps) {
  const Engine = engineMap[tool.slug];

  if (!Engine) {
    return (
      <div className="border-2 border-dashed rounded-xl p-8 text-center">
        <p className="font-medium mb-1">Coming Soon</p>
        <p className="text-sm text-muted-foreground">
          The {tool.name} engine is under development. Check back soon!
        </p>
      </div>
    );
  }

  return <Engine />;
}