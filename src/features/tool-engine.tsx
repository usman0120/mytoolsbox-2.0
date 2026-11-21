"use client";

import dynamic from "next/dynamic";
import { ToolDefinition } from "@/types";
import { EngineBoundary, EngineLoading, EngineUnavailable } from "@/components/common/engine-state";

// Dynamic imports for all tool engines
const engineMap: Record<string, React.ComponentType<Record<string, unknown>>> = {
  // Document tools
  "pdf-merger": dynamic(() => import("@/tools/docs/merge-pdf/ui").then((m) => ({ default: m.PDFMergerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-splitter": dynamic(() => import("@/tools/docs/split-pdf/ui").then((m) => ({ default: m.PDFSplitterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-compressor": dynamic(() => import("@/tools/docs/compress-pdf/ui").then((m) => ({ default: m.PDFCompressorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-to-images": dynamic(() => import("@/tools/docs/pdf-to-jpg/ui").then((m) => ({ default: m.PDFToImagesEngine })), {
    loading: () => <EngineLoading />,
  }),
  "images-to-pdf": dynamic(() => import("@/tools/docs/jpg-to-pdf/ui").then((m) => ({ default: m.ImagesToPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Image tools
  "image-compressor": dynamic(() => import("@/tools/media/compress-image/ui").then((m) => ({ default: m.ImageCompressorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-resizer": dynamic(() => import("@/tools/media/resize-image/ui").then((m) => ({ default: m.ImageResizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-converter": dynamic(() => import("@/tools/media/convert-image/ui").then((m) => ({ default: m.ImageConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-cropper": dynamic(() => import("@/tools/media/crop-image/ui").then((m) => ({ default: m.ImageCropperEngine })), {
    loading: () => <EngineLoading />,
  }),
  "qr-generator": dynamic(() => import("@/tools/create/qr-code-generator/ui").then((m) => ({ default: m.QRGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Image & Media tools (Phase 5)
  "design-studio": dynamic(() => import("@/tools/create/design/ui").then((m) => ({ default: m.DesignStudioEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-to-text-ocr": dynamic(() => import("@/tools/media/image-to-text/ui").then((m) => ({ default: m.ImageToTextOCREngine })), {
    loading: () => <EngineLoading />,
  }),
  "auto-enhance-photo": dynamic(() => import("@/tools/media/auto-enhance-photo/ui").then((m) => ({ default: m.AutoEnhancePhotoEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Developer tools
  "json-formatter": dynamic(() => import("@/tools/dev/json-formatter/ui").then((m) => ({ default: m.JSONFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "base64-encoder": dynamic(() => import("@/tools/dev/base64-encoder/ui").then((m) => ({ default: m.Base64EncoderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "url-encoder": dynamic(() => import("@/tools/dev/url-encoder/ui").then((m) => ({ default: m.URLEncoderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "regex-tester": dynamic(() => import("@/tools/dev/regex-tester/ui").then((m) => ({ default: m.RegexTesterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "diff-checker": dynamic(() => import("@/tools/dev/diff-checker/ui").then((m) => ({ default: m.DiffCheckerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "uuid-generator": dynamic(() => import("@/tools/dev/uuid-generator/ui").then((m) => ({ default: m.UUIDGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "timestamp-converter": dynamic(() => import("@/tools/dev/timestamp-converter/ui").then((m) => ({ default: m.TimestampConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "cron-helper": dynamic(() => import("@/tools/dev/cron-builder/ui").then((m) => ({ default: m.CronHelperEngine })), {
    loading: () => <EngineLoading />,
  }),
  "html-formatter": dynamic(() => import("@/tools/dev/html-formatter/ui").then((m) => ({ default: m.HTMLFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "css-formatter": dynamic(() => import("@/tools/dev/css-formatter/ui").then((m) => ({ default: m.CSSFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "color-converter": dynamic(() => import("@/tools/dev/color-converter/ui").then((m) => ({ default: m.ColorConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "http-status": dynamic(() => import("@/tools/dev/http-status-codes/ui").then((m) => ({ default: m.HTTPStatusEngine })), {
    loading: () => <EngineLoading />,
  }),
  "mime-types": dynamic(() => import("@/tools/dev/mime-types/ui").then((m) => ({ default: m.MimeTypesEngine })), {
    loading: () => <EngineLoading />,
  }),
  "user-agent-parser": dynamic(() => import("@/tools/dev/user-agent-parser/ui").then((m) => ({ default: m.UserAgentParserEngine })), {
    loading: () => <EngineLoading />,
  }),
  "api-request-builder": dynamic(() => import("@/tools/dev/api-request-tester/ui").then((m) => ({ default: m.APIRequestBuilderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-regex-builder": dynamic(() => import("@/tools/dev/ai-regex-builder/ui").then((m) => ({ default: m.AIRegexBuilderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-sql-assistant": dynamic(() => import("@/tools/dev/ai-sql-assistant/ui").then((m) => ({ default: m.AISQLAssistantEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-doc-generator": dynamic(() => import("@/tools/dev/code-doc-generator/ui").then((m) => ({ default: m.AIDocumentationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-error-explainer": dynamic(() => import("@/tools/dev/error-explainer/ui").then((m) => ({ default: m.AIErrorExplainerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-api-doc-generator": dynamic(() => import("@/tools/dev/api-doc-generator/ui").then((m) => ({ default: m.AIAPIDocumentationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Writing tools
  "word-counter": dynamic(() => import("@/tools/work/word-counter/ui").then((m) => ({ default: m.WordCounterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "case-converter": dynamic(() => import("@/tools/work/case-converter/ui").then((m) => ({ default: m.CaseConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "text-cleaner": dynamic(() => import("@/tools/work/text-cleaner/ui").then((m) => ({ default: m.TextCleanerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "lorem-ipsum": dynamic(() => import("@/tools/dev/lorem-ipsum/ui").then((m) => ({ default: m.LoremIpsumEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Calculator tools
  "percentage-calculator": dynamic(() => import("@/tools/calc/percentage-calculator/ui").then((m) => ({ default: m.PercentageCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "age-calculator": dynamic(() => import("@/tools/calc/age-calculator/ui").then((m) => ({ default: m.AgeCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "bmi-calculator": dynamic(() => import("@/tools/calc/bmi-calculator/ui").then((m) => ({ default: m.BMICalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "loan-calculator": dynamic(() => import("@/tools/calc/loan-calculator/ui").then((m) => ({ default: m.LoanCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "unit-converter": dynamic(() => import("@/tools/calc/unit-converter/ui").then((m) => ({ default: m.UnitConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Productivity tools
  "kanban-board": dynamic(() => import("@/tools/work/kanban-board/ui").then((m) => ({ default: m.KanbanBoardEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pomodoro-timer": dynamic(() => import("@/tools/study/pomodoro-timer/ui").then((m) => ({ default: m.PomodoroTimerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "notes-app": dynamic(() => import("@/tools/work/notepad/ui").then((m) => ({ default: m.NotesAppEngine })), {
    loading: () => <EngineLoading />,
  }),
  "stopwatch": dynamic(() => import("@/tools/work/stopwatch/ui").then((m) => ({ default: m.StopwatchEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Design tools
  "color-palette": dynamic(() => import("@/tools/create/color-palette-generator/ui").then((m) => ({ default: m.ColorPaletteEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Security tools
  "password-generator": dynamic(() => import("@/tools/dev/password-generator/ui").then((m) => ({ default: m.PasswordGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Academic tools
  "scientific-calculator": dynamic(() => import("@/tools/calc/scientific-calculator/ui").then((m) => ({ default: m.ScientificCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "matrix-calculator": dynamic(() => import("@/tools/calc/matrix-calculator/ui").then((m) => ({ default: m.MatrixCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "equation-solver": dynamic(() => import("@/tools/study/equation-solver/ui").then((m) => ({ default: m.EquationSolverEngine })), {
    loading: () => <EngineLoading />,
  }),
  "statistics-calculator": dynamic(() => import("@/tools/calc/statistics-calculator/ui").then((m) => ({ default: m.StatisticsCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "study-timer": dynamic(() => import("@/tools/study/study-timer/ui").then((m) => ({ default: m.StudyTimerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "gpa-calculator": dynamic(() => import("@/tools/study/gpa-calculator/ui").then((m) => ({ default: m.GPACalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "citation-generator": dynamic(() => import("@/tools/study/citation-generator/ui").then((m) => ({ default: m.CitationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),

  // Business Hub
  "quotation-generator": dynamic(() => import("@/tools/work/quotation-generator/ui").then((m) => ({ default: m.QuotationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "profit-calculator": dynamic(() => import("@/tools/calc/profit-calculator/ui").then((m) => ({ default: m.ProfitCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "margin-calculator": dynamic(() => import("@/tools/calc/margin-calculator/ui").then((m) => ({ default: m.MarginCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "tax-calculator": dynamic(() => import("@/tools/calc/tax-calculator/ui").then((m) => ({ default: m.TaxCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "salary-calculator": dynamic(() => import("@/tools/calc/salary-calculator/ui").then((m) => ({ default: m.SalaryCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "roi-calculator": dynamic(() => import("@/tools/calc/roi-calculator/ui").then((m) => ({ default: m.ROICalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "break-even-calculator": dynamic(() => import("@/tools/calc/break-even-calculator/ui").then((m) => ({ default: m.BreakEvenCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "business-name-generator": dynamic(() => import("@/tools/work/business-name-generator/ui").then((m) => ({ default: m.BusinessNameGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "proposal-generator": dynamic(() => import("@/tools/work/proposal-generator/ui").then((m) => ({ default: m.ProposalGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "contract-generator": dynamic(() => import("@/tools/work/contract-generator/ui").then((m) => ({ default: m.ContractGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "social-media-content-generator": dynamic(() => import("@/tools/work/social-media-post-generator/ui").then((m) => ({ default: m.SocialMediaContentGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Additional developer tools
  "json-validator": dynamic(() => import("@/tools/dev/json-validator/ui").then((m) => ({ default: m.JSONValidatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "hash-generator": dynamic(() => import("@/tools/dev/hash-generator/ui").then((m) => ({ default: m.HashGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "jwt-decoder": dynamic(() => import("@/tools/dev/jwt-decoder/ui").then((m) => ({ default: m.JWTDecoderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "sql-formatter": dynamic(() => import("@/tools/dev/sql-formatter/ui").then((m) => ({ default: m.SQLFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Media tools
  "barcode-generator": dynamic(() => import("@/tools/create/barcode-generator/ui").then((m) => ({ default: m.BarcodeGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "currency-converter": dynamic(() => import("@/tools/calc/currency-converter/ui").then((m) => ({ default: m.CurrencyConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "random-generator": dynamic(() => import("@/tools/dev/random-generator/ui").then((m) => ({ default: m.RandomGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "text-to-speech": dynamic(() => import("@/tools/media/text-to-speech/ui").then((m) => ({ default: m.TextToSpeechEngine })), {
    loading: () => <EngineLoading />,
  }),
  "video-to-gif": dynamic(() => import("@/tools/media/video-to-gif/ui").then((m) => ({ default: m.VideoToGifEngine })), {
    loading: () => <EngineLoading />,
  }),
  "screen-recorder": dynamic(() => import("@/tools/media/screen-recorder/ui").then((m) => ({ default: m.ScreenRecorderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "markdown-preview": dynamic(() => import("@/tools/dev/markdown-editor/ui").then((m) => ({ default: m.MarkdownPreviewEngine })), {
    loading: () => <EngineLoading />,
  }),
  "color-contrast": dynamic(() => import("@/tools/dev/color-contrast-checker/ui").then((m) => ({ default: m.ColorContrastEngine })), {
    loading: () => <EngineLoading />,
  }),
  "grammar-checker": dynamic(() => import("@/tools/work/grammar-checker/ui").then((m) => ({ default: m.GrammarCheckerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "paraphrase-tool": dynamic(() => import("@/tools/work/paraphraser/ui").then((m) => ({ default: m.ParaphraseToolEngine })), {
    loading: () => <EngineLoading />,
  }),
  // File Conversion & Document Tools (Phase 4)
  "pdf-to-office-converter": dynamic(() => import("@/tools/docs/pdf-to-word/ui").then((m) => ({ default: m.PDFToOfficeConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "word-to-pdf-converter": dynamic(() => import("@/tools/docs/word-to-pdf/ui").then((m) => ({ default: m.WordToPDFConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-to-ppt-converter": dynamic(() => import("@/tools/docs/pdf-to-powerpoint/ui").then((m) => ({ default: m.PDFToPPTConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Media & Audio tools (Phase 6)
  "mp4-mp3-converter": dynamic(() => import("@/tools/media/mp4-to-mp3/ui").then((m) => ({ default: m.MP4MP3ConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "audio-cutter": dynamic(() => import("@/tools/media/audio-cutter/ui").then((m) => ({ default: m.AudioCutterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "audio-converter": dynamic(() => import("@/tools/media/audio-converter/ui").then((m) => ({ default: m.AudioConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "video-compressor": dynamic(() => import("@/tools/media/compress-video/ui").then((m) => ({ default: m.VideoCompressorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "merge-videos": dynamic(() => import("@/tools/media/merge-videos/ui").then((m) => ({ default: m.MergeVideosEngine })), {
    loading: () => <EngineLoading />,
  }),
  "extract-audio-from-video": dynamic(() => import("@/tools/media/extract-audio/ui").then((m) => ({ default: m.ExtractAudioFromVideoEngine })), {
    loading: () => <EngineLoading />,
  }),
  "video-resizer": dynamic(() => import("@/tools/media/resize-video/ui").then((m) => ({ default: m.VideoResizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Text & Writing tools (Phase 6)
  "text-summarizer": dynamic(() => import("@/tools/work/summarizer/ui").then((m) => ({ default: m.TextSummarizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "speech-to-text": dynamic(() => import("@/tools/media/speech-to-text/ui").then((m) => ({ default: m.SpeechToTextEngine })), {
    loading: () => <EngineLoading />,
  }),
  "text-annotator": dynamic(() => import("@/tools/work/text-annotator/ui").then((m) => ({ default: m.TextAnnotatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Study & Academic tools (Phase 6)
  "equation-to-latex-converter": dynamic(() => import("@/tools/study/latex-equation-editor/ui").then((m) => ({ default: m.EquationToLatexConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-highlighter-notes": dynamic(() => import("@/tools/study/pdf-highlighter/ui").then((m) => ({ default: m.PDFHighlighterNotesEngine })), {
    loading: () => <EngineLoading />,
  }),
  "flashcard-creator": dynamic(() => import("@/tools/study/flashcards/ui").then((m) => ({ default: m.FlashcardCreatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Image Manipulation Tools (Phase 2)
  "image-rotator": dynamic(() => import("@/tools/media/rotate-image/ui").then((m) => ({ default: m.ImageRotatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-watermarker": dynamic(() => import("@/tools/media/watermark-image/ui").then((m) => ({ default: m.ImageWatermarkerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "background-remover": dynamic(() => import("@/tools/media/remove-background/ui").then((m) => ({ default: m.BackgroundRemoverEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-grayscale": dynamic(() => import("@/tools/media/grayscale-image/ui").then((m) => ({ default: m.ImageGrayscaleEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-blur-sharpen": dynamic(() => import("@/tools/media/blur-sharpen-image/ui").then((m) => ({ default: m.ImageBlurSharpenEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-text-overlay": dynamic(() => import("@/tools/media/add-text-to-image/ui").then((m) => ({ default: m.ImageTextOverlayEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Document Conversion Tools (Phase 2)
  "text-to-pdf": dynamic(() => import("@/tools/docs/text-to-pdf/ui").then((m) => ({ default: m.TextToPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  "csv-to-excel": dynamic(() => import("@/tools/docs/csv-to-excel/ui").then((m) => ({ default: m.CSVToExcelEngine })), {
    loading: () => <EngineLoading />,
  }),
  "txt-to-docx": dynamic(() => import("@/tools/docs/text-to-word/ui").then((m) => ({ default: m.TxtToDocxEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ppt-to-pdf": dynamic(() => import("@/tools/docs/powerpoint-to-pdf/ui").then((m) => ({ default: m.PPTToPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  // New Productivity & AI Tools
  "todo-list": dynamic(() => import("@/tools/work/todo-list/ui").then((m) => ({ default: m.TodoListEngine })), {
    loading: () => <EngineLoading />,
  }),
  "file-organizer": dynamic(() => import("@/tools/work/file-organizer/ui").then((m) => ({ default: m.FileOrganizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "daily-planner": dynamic(() => import("@/tools/work/daily-planner/ui").then((m) => ({ default: m.DailyPlannerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "countdown-timer": dynamic(() => import("@/tools/work/countdown-timer/ui").then((m) => ({ default: m.CountdownTimerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-text-generator": dynamic(() => import("@/tools/ai/writer/ui").then((m) => ({ default: m.AITextGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "barcode-scanner": dynamic(() => import("@/tools/create/barcode-scanner/ui").then((m) => ({ default: m.BarcodeScannerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "cover-letter-generator": dynamic(() => import("@/tools/work/cover-letter-generator/ui").then((m) => ({ default: m.CoverLetterGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
};

export const toolEngineSlugs = Object.keys(engineMap);

interface ToolEngineProps {
  tool: ToolDefinition;
}

export function ToolEngine({ tool }: ToolEngineProps) {
  const Engine = engineMap[tool.slug];

  if (!Engine) return <EngineUnavailable name={tool.name} />;

  return <EngineBoundary key={tool.slug} name={tool.name}><Engine /></EngineBoundary>;
}
