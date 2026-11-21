import { z } from "zod";

export const ASSET_KINDS = ["pdf", "image", "text", "json", "csv", "archive", "binary"] as const;
export type AssetKind = typeof ASSET_KINDS[number];
export type InputKind = "pdf" | "image" | "text" | "json" | "csv" | "files";
export type OptionValue = string | number | boolean;
export interface Field { key: string; label: string; type: "number" | "text" | "select" | "boolean"; value: OptionValue; min?: number; max?: number; choices?: string[]; help?: string }
export interface Operation { id: string; name: string; description: string; accepts: readonly AssetKind[]; output: AssetKind | "same" | "manifest"; fields: Field[]; category: "PDF" | "Images" | "Text" | "Data" | "Files" }
const pdf: AssetKind[] = ["pdf"], image: AssetKind[] = ["image"], text: AssetKind[] = ["text"];
const n = (key: string, label: string, value: number, min: number, max: number): Field => ({ key, label, type: "number", value, min, max });
const s = (key: string, label: string, value: string, choices: string[]): Field => ({ key, label, type: "select", value, choices });
const t = (key: string, label: string, value = "", help?: string): Field => ({ key, label, type: "text", value, help });
const b = (key: string, label: string, value: boolean): Field => ({ key, label, type: "boolean", value });
export const OPERATIONS: Operation[] = [
  { id: "pdf-render", name: "PDF to images", category: "PDF", accepts: pdf, output: "image", description: "Render selected pages locally. One image per page; fonts and rendering depend on browser support.", fields: [n("dpi", "Resolution (DPI)", 144, 72, 240), t("pages", "Pages", "", "Leave blank for all pages, or use 1-3,5."), s("format", "Image format", "jpeg", ["jpeg", "png"])] },
  { id: "pdf-merge", name: "Merge PDFs", category: "PDF", accepts: pdf, output: "pdf", description: "Combine documents in the input file order.", fields: [] },
  { id: "pdf-split", name: "Split PDF pages", category: "PDF", accepts: pdf, output: "pdf", description: "Create a separate PDF for each page.", fields: [] },
  { id: "pdf-extract", name: "Extract PDF pages", category: "PDF", accepts: pdf, output: "pdf", description: "Keep a selected range of pages in each document.", fields: [t("pages", "Pages to keep", "1", "Example: 1-3,5. Page numbers must exist.")] },
  { id: "pdf-watermark", name: "Watermark PDFs", category: "PDF", accepts: pdf, output: "pdf", description: "Add a translucent text watermark. Editing invalidates digital signatures; use ASCII watermark text.", fields: [t("text", "Watermark text", "DRAFT"), n("opacity", "Opacity", 0.15, 0.05, 1)] },
  { id: "images-pdf", name: "Images to PDF", category: "PDF", accepts: image, output: "pdf", description: "Combine images into one PDF, preserving input order and aspect ratio.", fields: [s("pageSize", "Page size", "letter", ["letter", "a4", "fit"]), n("margin", "Margin (points)", 24, 0, 72)] },
  { id: "image-resize", name: "Resize images", category: "Images", accepts: image, output: "image", description: "Fit inside a bounding box without upscaling; preserve aspect ratio.", fields: [n("width", "Maximum width (px)", 1600, 32, 4096), n("height", "Maximum height (px)", 1600, 32, 4096)] },
  { id: "image-crop", name: "Center crop", category: "Images", accepts: image, output: "image", description: "Crop to exact dimensions. Small images may be upscaled.", fields: [n("width", "Width (px)", 1080, 32, 4096), n("height", "Height (px)", 1080, 32, 4096)] },
  { id: "image-convert", name: "Convert image format", category: "Images", accepts: image, output: "image", description: "Re-encode images. JPEG flattens transparency onto white; canvas export does not copy EXIF/GPS metadata.", fields: [s("format", "Format", "jpeg", ["jpeg", "png", "webp"]), n("quality", "Quality (JPEG/WebP)", 0.9, 0.2, 1)] },
  { id: "image-compress", name: "Compress to a size target", category: "Images", accepts: image, output: "image", description: "Verify each image is below the byte limit. Keep already-compliant JPEG/WebP bytes, otherwise reduce quality or dimensions. Failure stops the workflow.", fields: [n("maxKB", "Limit (KB; 1 KB = 1,000 bytes)", 200, 5, 20000), s("format", "Format", "jpeg", ["jpeg", "webp"]), b("allowResize", "Allow resizing to meet the target", true), n("minQuality", "Minimum quality", 0.35, 0.1, 0.85)] },
  { id: "image-grayscale", name: "Grayscale images", category: "Images", accepts: image, output: "image", description: "Convert pixels to grayscale and export PNG.", fields: [] },
  { id: "image-watermark", name: "Watermark images", category: "Images", accepts: image, output: "image", description: "Add text to the image pixels, then export PNG.", fields: [t("text", "Watermark text", "PREVIEW"), n("fontSize", "Font size (px)", 32, 8, 160), n("opacity", "Opacity", 0.4, 0.05, 1), s("position", "Position", "center", ["center", "bottom-right"])] },
  { id: "image-rotate", name: "Rotate images", category: "Images", accepts: image, output: "image", description: "Rotate without clipping, with an optional horizontal flip. Export PNG.", fields: [s("angle", "Rotation", "90", ["90", "180", "270"]), b("flip", "Flip horizontally", false)] },
  { id: "text-clean", name: "Clean text", category: "Text", accepts: text, output: "text", description: "Normalize line endings and remove trailing whitespace.", fields: [b("trimLines", "Trim each line", true), b("collapseSpaces", "Collapse repeated spaces", false)] },
  { id: "text-case", name: "Convert text case", category: "Text", accepts: text, output: "text", description: "Apply uppercase, lowercase, title case, or sentence case.", fields: [s("mode", "Case", "lower", ["upper", "lower", "title", "sentence"])] },
  { id: "text-dedupe", name: "Remove duplicate lines", category: "Text", accepts: text, output: "text", description: "Keep the first occurrence of each line.", fields: [b("caseSensitive", "Case-sensitive matching", true), b("removeBlank", "Remove blank lines", true)] },
  { id: "text-sort", name: "Sort lines", category: "Text", accepts: text, output: "text", description: "Natural US English sorting, with numbers in numeric order.", fields: [b("descending", "Descending order", false)] },
  { id: "text-replace", name: "Find and replace", category: "Text", accepts: text, output: "text", description: "Replace all literal matches. No regular expressions or executable code.", fields: [t("find", "Find", "old"), t("replace", "Replace with", "new")] },
  { id: "text-stats", name: "Text analysis report", category: "Text", accepts: text, output: "json", description: "Create a JSON report with word, character, line and reading-time metrics.", fields: [b("includeText", "Include processed text in the report", true), n("wpm", "Reading speed (words/minute)", 200, 100, 500)] },
  { id: "csv-json", name: "CSV to JSON", category: "Data", accepts: ["csv"], output: "json", description: "Parse quoted CSV with headers. Preserve cell values as strings.", fields: [s("delimiter", "Delimiter", ",", [",", ";", "tab"])] },
  { id: "json-format", name: "Format JSON", category: "Data", accepts: ["json"], output: "json", description: "Validate and format JSON, optionally sorting object keys recursively.", fields: [s("indent", "Indentation", "2", ["0", "2", "4"]), b("sortKeys", "Sort object keys", false)] },
  { id: "json-csv", name: "JSON to CSV", category: "Data", accepts: ["json"], output: "csv", description: "Convert an array of flat objects. Spreadsheet-safe mode escapes formula-like cells.", fields: [b("spreadsheetSafe", "Escape spreadsheet formulas", true)] },
  { id: "checksum", name: "SHA-256 manifest", category: "Files", accepts: ASSET_KINDS, output: "manifest", description: "Calculate checksums and include a verification manifest. Original files can be retained.", fields: [b("includeFiles", "Include original outputs", true)] },
  { id: "rename", name: "Rename output files", category: "Files", accepts: ASSET_KINDS, output: "same", description: "Apply safe, consistent names without changing file contents.", fields: [t("prefix", "Prefix", "file-"), t("suffix", "Suffix", ""), b("sequence", "Use sequential numbering", true)] },
  { id: "zip", name: "Package as ZIP", category: "Files", accepts: ASSET_KINDS, output: "archive", description: "Package every current output with unique, safe file names.", fields: [t("name", "ZIP name", "workflow-output")] },
];
export const operationById = (id: string) => OPERATIONS.find((operation) => operation.id === id);
export interface WorkflowStep { id: string; operation: string; options: Record<string, OptionValue> }
export interface Workflow { version: 1; id: string; name: string; description: string; category: string; input: InputKind; steps: WorkflowStep[] }
export interface Artifact { id: string; name: string; kind: AssetKind; blob: Blob; width?: number; height?: number; targetBytes?: number }
export interface StepReport { id: string; name: string; state: "running" | "success" | "error"; inputCount: number; outputCount?: number; bytes?: number; durationMs?: number; error?: string; targetBytes?: number; largestOutputBytes?: number }
export const workflowSchema = z.object({
  version: z.literal(1), id: z.string().min(1).max(100), name: z.string().trim().min(1).max(100), description: z.string().max(800), category: z.string().max(40),
  input: z.enum(["pdf", "image", "text", "json", "csv", "files"]),
  steps: z.array(z.object({ id: z.string().min(1).max(100), operation: z.string().max(40), options: z.record(z.string().max(40), z.union([z.string().max(1000), z.number().finite(), z.boolean()])) }).strict()).min(1).max(16),
}).strict();

export function newStep(operation: string): WorkflowStep {
  const definition = operationById(operation); if (!definition) throw new Error("Unknown operation");
  return { id: crypto.randomUUID(), operation, options: Object.fromEntries(definition.fields.map((field) => [field.key, field.value])) };
}
export function validateWorkflow(value: unknown): { workflow?: Workflow; errors: string[]; outputs: AssetKind[] } {
  const parsed = workflowSchema.safeParse(value);
  if (!parsed.success) return { errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`), outputs: [] };
  const workflow = parsed.data as Workflow; const errors: string[] = [];
  let outputs: AssetKind[] = workflow.input === "files" ? [...ASSET_KINDS] : [workflow.input];
  const ids = new Set<string>();
  workflow.steps.forEach((step, index) => {
    const definition = operationById(step.operation);
    const label = `Step ${index + 1}`;
    if (ids.has(step.id)) errors.push(`${label}: duplicate step ID`); ids.add(step.id);
    if (!definition) { errors.push(`${label}: unknown operation`); return; }
    if (outputs.some((kind) => !definition.accepts.includes(kind))) errors.push(`${label}: ${definition.name} cannot accept ${outputs.join(" + ")}. Add a compatible converter first.`);
    for (const key of Object.keys(step.options)) if (!definition.fields.some((field) => field.key === key)) errors.push(`${label}: unsupported option ${key}`);
    for (const field of definition.fields) {
      const option = step.options[field.key];
      if (typeof option !== typeof field.value) { errors.push(`${label}: ${field.label} is required`); continue; }
      if (typeof option === "number" && (!Number.isFinite(option) || option < (field.min ?? -Infinity) || option > (field.max ?? Infinity))) errors.push(`${label}: ${field.label} is outside its allowed range`);
      if (field.choices && !field.choices.includes(String(option))) errors.push(`${label}: invalid ${field.label}`);
      if (field.type === "text" && typeof option === "string" && option.length > 120) errors.push(`${label}: ${field.label} must be 120 characters or fewer`);
    }
    if (["pdf-render", "pdf-extract"].includes(step.operation) && !/^(?:\s*\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*)?\s*$/.test(String(step.options.pages ?? ""))) errors.push(`${label}: invalid page range`);
    if (step.operation === "pdf-extract" && !String(step.options.pages ?? "").trim()) errors.push(`${label}: select pages to extract`);
    if (["image-watermark", "pdf-watermark"].includes(step.operation) && !String(step.options.text ?? "").trim()) errors.push(`${label}: watermark text is required`);
    if (step.operation === "pdf-watermark" && /[^\x20-\x7e]/.test(String(step.options.text))) errors.push(`${label}: PDF watermark text must use ASCII characters`);
    if (step.operation === "text-replace" && !String(step.options.find ?? "")) errors.push(`${label}: find text cannot be empty`);
    if (definition.output === "manifest") outputs = step.options.includeFiles ? [...new Set([...outputs, "json" as const])] : ["json"];
    else if (definition.output !== "same") outputs = [definition.output];
  });
  return { workflow: errors.length ? undefined : workflow, errors, outputs };
}
