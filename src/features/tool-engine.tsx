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