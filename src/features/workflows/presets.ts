import { OPERATIONS, type Workflow, type WorkflowStep, type OptionValue } from "./model";
type Recipe = [string, string, string, Workflow["input"], string, Array<string | [string, Record<string, OptionValue>]>];
const recipes: Recipe[] = [
  ["pdf-images-200kb", "PDF → images under 200 KB", "PDF", "pdf", "Render pages, verify each JPEG is below 200,000 bytes, and download one ZIP.", ["pdf-render", "image-compress", "zip"]],
  ["pdf-png-pack", "PDF → high-resolution PNG pack", "PDF", "pdf", "Export page images with lossless PNG encoding; large PDFs may produce large archives.", [["pdf-render", { dpi: 200, format: "png" }], "rename", "zip"]],
  ["pdf-preview-pack", "PDF → compact web previews", "PDF", "pdf", "Resize pages to 640-pixel previews and keep each JPEG under 100 KB.", ["pdf-render", ["image-resize", { width: 640, height: 640 }], ["image-compress", { maxKB: 100 }], "zip"]],
  ["pdf-grayscale-pack", "PDF → grayscale image pack", "PDF", "pdf", "Create grayscale page images with a verified 200 KB target.", ["pdf-render", "image-grayscale", "image-compress", "zip"]],
  ["pdf-first-page", "PDF → first-page preview", "PDF", "pdf", "Get a lightweight JPEG cover preview from each PDF.", [["pdf-render", { pages: "1" }], ["image-compress", { maxKB: 150 }], "zip"]],
  ["pdf-merge-preview", "Merge PDFs → image previews", "PDF", "pdf", "Combine documents in order, then render and package the page previews.", ["pdf-merge", "pdf-render", "image-compress", "zip"]],
  ["pdf-page-files", "PDF → individual page files", "PDF", "pdf", "Split into separate PDFs, rename them consistently and package them.", ["pdf-split", ["rename", { prefix: "page-" }], "zip"]],
  ["pdf-selected-draft", "Selected pages → draft PDF", "PDF", "pdf", "Keep selected pages and apply a visible DRAFT watermark. The default selection is page 1.", ["pdf-extract", "pdf-watermark", "zip"]],
  ["pdf-merge-draft", "Merge PDFs → draft watermark", "PDF", "pdf", "Combine documents, add a DRAFT watermark, and generate a checksum manifest.", ["pdf-merge", "pdf-watermark", "checksum", "zip"]],
  ["pdf-verified-pack", "PDF verification archive", "PDF", "pdf", "Rename PDFs and include a SHA-256 manifest for downloaded-file verification.", [["rename", { prefix: "document-" }], "checksum", "zip"]],
  ["pdf-scan-rebuild", "PDF → compact rasterized PDF", "PDF", "pdf", "Render, compress and rebuild pages. This rasterizes searchable text; output is not guaranteed smaller.", ["pdf-render", ["image-compress", { maxKB: 250 }], "images-pdf"]],
  ["pdf-proof-images", "PDF → watermarked proof images", "PDF", "pdf", "Create PREVIEW images, then compress each below 200 KB.", ["pdf-render", "image-watermark", "image-compress", "zip"]],
  ["image-email-pack", "Images → email-ready pack", "Images", "image", "Resize images and verify each JPEG is under 200 KB.", ["image-resize", "image-compress", "zip"]],
  ["image-webp-pack", "Images → WebP web assets", "Images", "image", "Create 1600-pixel web assets with a 250 KB WebP target. Requires WebP encoding support.", ["image-resize", ["image-compress", { format: "webp", maxKB: 250 }], "zip"]],
  ["image-thumbnail-pack", "Images → square thumbnails", "Images", "image", "Center-crop square 400-pixel thumbnails and package verified small JPEGs.", [["image-crop", { width: 400, height: 400 }], ["image-compress", { maxKB: 100 }], "zip"]],
  ["image-social-square", "Images → square social posts", "Images", "image", "Create 1080 × 1080 JPEGs with a 400 KB target.", ["image-crop", ["image-compress", { maxKB: 400 }], "zip"]],
  ["image-social-wide", "Images → wide social banners", "Images", "image", "Center-crop 1200 × 630 banners and compress below 300 KB.", [["image-crop", { width: 1200, height: 630 }], ["image-compress", { maxKB: 300 }], "zip"]],
  ["image-social-story", "Images → portrait stories", "Images", "image", "Center-crop 1080 × 1920 portrait images with a 500 KB target.", [["image-crop", { width: 1080, height: 1920 }], ["image-compress", { maxKB: 500 }], "zip"]],
  ["image-grayscale", "Images → monochrome pack", "Images", "image", "Resize, convert to grayscale, and compress below 200 KB.", ["image-resize", "image-grayscale", "image-compress", "zip"]],
  ["image-proof", "Images → protected previews", "Images", "image", "Add a pixel watermark before size-target compression.", ["image-resize", "image-watermark", "image-compress", "zip"]],
  ["image-png-normalize", "Images → normalized PNGs", "Images", "image", "Resize and re-encode as PNG without copying source EXIF/GPS metadata.", ["image-resize", ["image-convert", { format: "png" }], "zip"]],
  ["image-rotate-pack", "Images → rotated JPEG pack", "Images", "image", "Rotate clockwise, then create verified compact JPEGs.", ["image-rotate", "image-compress", "zip"]],
  ["photos-letter-pdf", "Photos → US Letter PDF", "Images", "image", "Resize and compress photos, then combine them in order on Letter-size pages.", ["image-resize", ["image-compress", { maxKB: 300 }], "images-pdf"]],
  ["photos-fit-pdf", "Photos → fitted-page PDF", "Images", "image", "Create a PDF with pages fitted to the compressed images.", ["image-resize", "image-compress", ["images-pdf", { pageSize: "fit", margin: 0 }]]],
  ["images-verified", "Images → checksum delivery pack", "Images", "image", "Produce email-ready images with a SHA-256 verification manifest.", ["image-resize", "image-compress", "checksum", "zip"]],
  ["text-clean-pack", "Text → clean file pack", "Text", "text", "Normalize line endings, trim whitespace, and package clean text files.", ["text-clean", "zip"]],
  ["text-unique-lines", "Text → unique sorted lines", "Text", "text", "Clean, deduplicate and naturally sort lists.", ["text-clean", "text-dedupe", "text-sort", "zip"]],
  ["text-title-report", "Text → title-case analysis", "Text", "text", "Clean text, apply title case and produce a JSON report including the processed text.", ["text-clean", ["text-case", { mode: "title" }], "text-stats", "zip"]],
  ["text-analysis", "Text → comprehensive analysis", "Text", "text", "Create word, character, line and reading-time reports with processed text included.", ["text-clean", "text-stats", "zip"]],
  ["text-uppercase", "Text → uppercase delivery", "Text", "text", "Clean text and convert it to uppercase without re-uploading.", ["text-clean", ["text-case", { mode: "upper" }], "zip"]],
  ["csv-json-pack", "CSV → formatted JSON", "Data", "csv", "Parse quoted CSV, preserve string values, sort JSON keys and package results.", ["csv-json", ["json-format", { sortKeys: true }], "zip"]],
  ["csv-safe-delivery", "CSV → spreadsheet-safe delivery", "Data", "csv", "Validate CSV via JSON, then export quoted CSV with formula-like cells escaped.", ["csv-json", "json-csv", "zip"]],
  ["json-compact", "JSON → compact verified archive", "Data", "json", "Validate and minify JSON, include checksums, and download an archive.", [["json-format", { indent: "0" }], "checksum", "zip"]],
  ["json-sorted", "JSON → canonical key ordering", "Data", "json", "Format JSON with sorted object keys and four-space indentation; array order is preserved.", [["json-format", { indent: "4", sortKeys: true }], "zip"]],
  ["json-csv-delivery", "JSON → safe CSV files", "Data", "json", "Convert flat JSON records into spreadsheet-safe CSV with consistent file names.", ["json-csv", ["rename", { prefix: "dataset-" }], "zip"]],
  ["files-verified", "Files → verified delivery archive", "Files", "files", "Rename files and generate a SHA-256 manifest without changing their content.", ["rename", "checksum", "zip"]],
];
export const WORKFLOW_PRESETS: Workflow[] = recipes.map(([id, name, category, input, description, steps]) => ({
  version: 1, id, name, description, category, input,
  steps: steps.map((entry, index): WorkflowStep => {
    const [operation, overrides]: [string, Record<string, OptionValue>] = typeof entry === "string" ? [entry, {}] : entry;
    const definition = OPERATIONS.find((item) => item.id === operation)!;
    return { id: `${id}-${index}`, operation, options: { ...Object.fromEntries(definition.fields.map((field) => [field.key, field.value])), ...overrides } };
  }),
}));
