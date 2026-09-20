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
  // Image & Media tools (Phase 5)
  "photopea": dynamic(() => import("@/features/images/photopea-engine").then((m) => ({ default: m.PhotopeaEngine })), {
    loading: () => <EngineLoading />,
  }),
  "awesome-screenshot": dynamic(() => import("@/features/images/awesome-screenshot-engine").then((m) => ({ default: m.AwesomeScreenshotEngine })), {
    loading: () => <EngineLoading />,
  }),
  "snagit": dynamic(() => import("@/features/images/snagit-engine").then((m) => ({ default: m.SnagitEngine })), {
    loading: () => <EngineLoading />,
  }),
  "canva": dynamic(() => import("@/features/images/canva-engine").then((m) => ({ default: m.CanvaEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-to-text-ocr": dynamic(() => import("@/features/images/image-to-text-ocr-engine").then((m) => ({ default: m.ImageToTextOCREngine })), {
    loading: () => <EngineLoading />,
  }),
  "runway": dynamic(() => import("@/features/images/runway-engine").then((m) => ({ default: m.RunwayEngine })), {
    loading: () => <EngineLoading />,
  }),
  "julius-ai": dynamic(() => import("@/features/images/julius-ai-engine").then((m) => ({ default: m.JuliusAIEngine })), {
    loading: () => <EngineLoading />,
  }),
  "softcolor-auto-enhance": dynamic(() => import("@/features/images/softcolor-auto-enhance-engine").then((m) => ({ default: m.SoftColorAutoEnhanceEngine })), {
    loading: () => <EngineLoading />,
  }),
  "photolemur": dynamic(() => import("@/features/images/photolemur-engine").then((m) => ({ default: m.PhotolemurEngine })), {
    loading: () => <EngineLoading />,
  }),
  "perfectly-clear": dynamic(() => import("@/features/images/perfectly-clear-engine").then((m) => ({ default: m.PerfectlyClearEngine })), {
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

  // Business Hub
  "invoice-generator": dynamic(() => import("@/features/tools/invoice-generator-engine").then((m) => ({ default: m.InvoiceGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "quotation-generator": dynamic(() => import("@/features/tools/quotation-generator-engine").then((m) => ({ default: m.QuotationGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "profit-calculator": dynamic(() => import("@/features/tools/profit-calculator-engine").then((m) => ({ default: m.ProfitCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "margin-calculator": dynamic(() => import("@/features/tools/margin-calculator-engine").then((m) => ({ default: m.MarginCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "tax-calculator": dynamic(() => import("@/features/tools/tax-calculator-engine").then((m) => ({ default: m.TaxCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "salary-calculator": dynamic(() => import("@/features/tools/salary-calculator-engine").then((m) => ({ default: m.SalaryCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "roi-calculator": dynamic(() => import("@/features/tools/roi-calculator-engine").then((m) => ({ default: m.ROICalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "break-even-calculator": dynamic(() => import("@/features/tools/break-even-calculator-engine").then((m) => ({ default: m.BreakEvenCalculatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "business-name-generator": dynamic(() => import("@/features/tools/business-name-generator-engine").then((m) => ({ default: m.BusinessNameGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "proposal-generator": dynamic(() => import("@/features/tools/proposal-generator-engine").then((m) => ({ default: m.ProposalGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "contract-generator": dynamic(() => import("@/features/tools/contract-generator-engine").then((m) => ({ default: m.ContractGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "social-media-content-generator": dynamic(() => import("@/features/tools/social-media-content-generator-engine").then((m) => ({ default: m.SocialMediaContentGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Additional developer tools
  "json-validator": dynamic(() => import("@/features/tools/json-validator-engine").then((m) => ({ default: m.JSONValidatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "hash-generator": dynamic(() => import("@/features/tools/hash-generator-engine").then((m) => ({ default: m.HashGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "jwt-decoder": dynamic(() => import("@/features/tools/jwt-decoder-engine").then((m) => ({ default: m.JWTDecoderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "sql-formatter": dynamic(() => import("@/features/tools/sql-formatter-engine").then((m) => ({ default: m.SQLFormatterEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Media tools
  "barcode-generator": dynamic(() => import("@/features/tools/barcode-generator-engine").then((m) => ({ default: m.BarcodeGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "currency-converter": dynamic(() => import("@/features/tools/currency-converter-engine").then((m) => ({ default: m.CurrencyConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "random-generator": dynamic(() => import("@/features/tools/random-generator-engine").then((m) => ({ default: m.RandomGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "url-shortener": dynamic(() => import("@/features/tools/url-shortener-engine").then((m) => ({ default: m.URLShortenerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "mp3-cutter": dynamic(() => import("@/features/tools/mp3-cutter-engine").then((m) => ({ default: m.MP3CutterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "text-to-speech": dynamic(() => import("@/features/tools/text-to-speech-engine").then((m) => ({ default: m.TextToSpeechEngine })), {
    loading: () => <EngineLoading />,
  }),
  "video-to-gif": dynamic(() => import("@/features/tools/video-to-gif-engine").then((m) => ({ default: m.VideoToGifEngine })), {
    loading: () => <EngineLoading />,
  }),
  "screen-recorder": dynamic(() => import("@/features/tools/screen-recorder-engine").then((m) => ({ default: m.ScreenRecorderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "markdown-preview": dynamic(() => import("@/features/tools/markdown-preview-engine").then((m) => ({ default: m.MarkdownPreviewEngine })), {
    loading: () => <EngineLoading />,
  }),
  "color-contrast": dynamic(() => import("@/features/tools/color-contrast-engine").then((m) => ({ default: m.ColorContrastEngine })), {
    loading: () => <EngineLoading />,
  }),
  "grammar-checker": dynamic(() => import("@/features/tools/grammar-checker-engine").then((m) => ({ default: m.GrammarCheckerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "paraphrase-tool": dynamic(() => import("@/features/tools/paraphrase-tool-engine").then((m) => ({ default: m.ParaphraseToolEngine })), {
    loading: () => <EngineLoading />,
  }),
  // File Conversion & Document Tools (Phase 4)
  "pdf-to-office-converter": dynamic(() => import("@/features/documents/pdf-to-office-converter-engine").then((m) => ({ default: m.PDFToOfficeConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "word-to-pdf-converter": dynamic(() => import("@/features/documents/word-to-pdf-converter-engine").then((m) => ({ default: m.WordToPDFConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "jpg-to-pdf-merger": dynamic(() => import("@/features/documents/jpg-to-pdf-merger-engine").then((m) => ({ default: m.JPGToPDFMergerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-to-ppt-converter": dynamic(() => import("@/features/documents/pdf-to-ppt-converter-engine").then((m) => ({ default: m.PDFToPPTConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "onlyoffice-editor": dynamic(() => import("@/features/documents/onlyoffice-editor-engine").then((m) => ({ default: m.ONLYOFFICEEditorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "soda-pdf": dynamic(() => import("@/features/documents/soda-pdf-engine").then((m) => ({ default: m.SodaPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdfelement": dynamic(() => import("@/features/documents/pdfelement-engine").then((m) => ({ default: m.PDFElementEngine })), {
    loading: () => <EngineLoading />,
  }),
  "nitro-pro": dynamic(() => import("@/features/documents/nitro-pro-engine").then((m) => ({ default: m.NitroProEngine })), {
    loading: () => <EngineLoading />,
  }),
  "foxit-pdf": dynamic(() => import("@/features/documents/foxit-pdf-engine").then((m) => ({ default: m.FoxitPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  "smallpdf": dynamic(() => import("@/features/documents/smallpdf-engine").then((m) => ({ default: m.SmallPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  "rfp-monkey": dynamic(() => import("@/features/tools/rfp-monkey-engine").then((m) => ({ default: m.RFPMonkeyEngine })), {
    loading: () => <EngineLoading />,
  }),
  "online-notepad": dynamic(() => import("@/features/tools/online-notepad-engine").then((m) => ({ default: m.OnlineNotepadEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Media & Audio tools (Phase 6)
  "mp4-mp3-converter": dynamic(() => import("@/features/tools/mp4-mp3-converter-engine").then((m) => ({ default: m.MP4MP3ConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "audio-cutter": dynamic(() => import("@/features/tools/audio-cutter-engine").then((m) => ({ default: m.AudioCutterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "audio-converter": dynamic(() => import("@/features/tools/audio-converter-engine").then((m) => ({ default: m.AudioConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "video-compressor": dynamic(() => import("@/features/tools/video-compressor-engine").then((m) => ({ default: m.VideoCompressorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "video-to-gif-maker": dynamic(() => import("@/features/tools/video-to-gif-maker-engine").then((m) => ({ default: m.VideoToGifMakerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "merge-videos": dynamic(() => import("@/features/tools/merge-videos-engine").then((m) => ({ default: m.MergeVideosEngine })), {
    loading: () => <EngineLoading />,
  }),
  "extract-audio-from-video": dynamic(() => import("@/features/tools/extract-audio-from-video-engine").then((m) => ({ default: m.ExtractAudioFromVideoEngine })), {
    loading: () => <EngineLoading />,
  }),
  "video-resizer": dynamic(() => import("@/features/tools/video-resizer-engine").then((m) => ({ default: m.VideoResizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Text & Writing tools (Phase 6)
  "text-summarizer": dynamic(() => import("@/features/tools/text-summarizer-engine").then((m) => ({ default: m.TextSummarizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "speech-to-text": dynamic(() => import("@/features/tools/speech-to-text-engine").then((m) => ({ default: m.SpeechToTextEngine })), {
    loading: () => <EngineLoading />,
  }),
  "plagiarism-checker": dynamic(() => import("@/features/tools/plagiarism-checker-engine").then((m) => ({ default: m.PlagiarismCheckerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "text-annotator": dynamic(() => import("@/features/tools/text-annotator-engine").then((m) => ({ default: m.TextAnnotatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Study & Academic tools (Phase 6)
  "equation-to-latex-converter": dynamic(() => import("@/features/tools/equation-to-latex-converter-engine").then((m) => ({ default: m.EquationToLatexConverterEngine })), {
    loading: () => <EngineLoading />,
  }),
  "pdf-highlighter-notes": dynamic(() => import("@/features/tools/pdf-highlighter-notes-engine").then((m) => ({ default: m.PDFHighlighterNotesEngine })), {
    loading: () => <EngineLoading />,
  }),
  "flashcard-creator": dynamic(() => import("@/features/tools/flashcard-creator-engine").then((m) => ({ default: m.FlashcardCreatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "quiz-maker": dynamic(() => import("@/features/tools/quiz-maker-engine").then((m) => ({ default: m.QuizMakerEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Image Manipulation Tools (Phase 2)
  "image-rotator": dynamic(() => import("@/features/images/image-rotator-engine").then((m) => ({ default: m.ImageRotatorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-watermarker": dynamic(() => import("@/features/images/image-watermarker-engine").then((m) => ({ default: m.ImageWatermarkerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "background-remover": dynamic(() => import("@/features/images/background-remover-engine").then((m) => ({ default: m.BackgroundRemoverEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-grayscale": dynamic(() => import("@/features/images/image-grayscale-engine").then((m) => ({ default: m.ImageGrayscaleEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-blur-sharpen": dynamic(() => import("@/features/images/image-blur-sharpen-engine").then((m) => ({ default: m.ImageBlurSharpenEngine })), {
    loading: () => <EngineLoading />,
  }),
  "image-text-overlay": dynamic(() => import("@/features/images/image-text-overlay-engine").then((m) => ({ default: m.ImageTextOverlayEngine })), {
    loading: () => <EngineLoading />,
  }),
  // Document Conversion Tools (Phase 2)
  "text-to-pdf": dynamic(() => import("@/features/documents/text-to-pdf-engine").then((m) => ({ default: m.TextToPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  "csv-to-excel": dynamic(() => import("@/features/documents/csv-to-excel-engine").then((m) => ({ default: m.CSVToExcelEngine })), {
    loading: () => <EngineLoading />,
  }),
  "txt-to-docx": dynamic(() => import("@/features/documents/txt-to-docx-engine").then((m) => ({ default: m.TxtToDocxEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ppt-to-pdf": dynamic(() => import("@/features/documents/ppt-to-pdf-engine").then((m) => ({ default: m.PPTToPDFEngine })), {
    loading: () => <EngineLoading />,
  }),
  // New Productivity & AI Tools
  "todo-list": dynamic(() => import("@/features/tools/todo-list-engine").then((m) => ({ default: m.TodoListEngine })), {
    loading: () => <EngineLoading />,
  }),
  "habit-tracker": dynamic(() => import("@/features/tools/habit-tracker-engine").then((m) => ({ default: m.HabitTrackerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "file-organizer": dynamic(() => import("@/features/tools/file-organizer-engine").then((m) => ({ default: m.FileOrganizerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "daily-planner": dynamic(() => import("@/features/tools/daily-planner-engine").then((m) => ({ default: m.DailyPlannerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "countdown-timer": dynamic(() => import("@/features/tools/countdown-timer-engine").then((m) => ({ default: m.CountdownTimerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-image-generator": dynamic(() => import("@/features/tools/ai-image-generator-engine").then((m) => ({ default: m.AIImageGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-text-generator": dynamic(() => import("@/features/tools/ai-text-generator-engine").then((m) => ({ default: m.AITextGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-resume-maker": dynamic(() => import("@/features/tools/ai-resume-maker-engine").then((m) => ({ default: m.AIResumeMakerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-summary-tool": dynamic(() => import("@/features/tools/ai-summary-tool-engine").then((m) => ({ default: m.AISummaryToolEngine })), {
    loading: () => <EngineLoading />,
  }),
  "ai-presentation-maker": dynamic(() => import("@/features/tools/ai-presentation-maker-engine").then((m) => ({ default: m.AIPresentationMakerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "barcode-scanner": dynamic(() => import("@/features/tools/barcode-scanner-engine").then((m) => ({ default: m.BarcodeScannerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "resume-builder": dynamic(() => import("@/features/tools/resume-builder-engine").then((m) => ({ default: m.ResumeBuilderEngine })), {
    loading: () => <EngineLoading />,
  }),
  "cv-maker": dynamic(() => import("@/features/tools/cv-maker-engine").then((m) => ({ default: m.CVMakerEngine })), {
    loading: () => <EngineLoading />,
  }),
  "cover-letter-generator": dynamic(() => import("@/features/tools/cover-letter-generator-engine").then((m) => ({ default: m.CoverLetterGeneratorEngine })), {
    loading: () => <EngineLoading />,
  }),
  "paragraph-rewriter": dynamic(() => import("@/features/tools/paragraph-rewriter-engine").then((m) => ({ default: m.ParagraphRewriterEngine })), {
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