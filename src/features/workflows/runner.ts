import { operationById, validateWorkflow, type Artifact, type AssetKind, type Workflow, type WorkflowStep, type StepReport } from "./model";
import { canvasBlob, checkAbort, processWorkflowImage, baseName } from "./image";

export const LIMITS = { inputBytes: 100_000_000, outputBytes: 256_000_000, files: 100, pages: 100, textBytes: 5_000_000 };
export function safeName(name: string) {
  const cleaned = name.replace(/[\x00-\x1f<>:"/\\|?*]/g, "_").replace(/^\.+/, "");
  const extension = cleaned.match(/\.[a-z0-9]{1,10}$/i)?.[0] ?? "";
  return (cleaned.length > 150 ? cleaned.slice(0, 150 - extension.length) + extension : cleaned) || "output";
}
export function uniqueArtifacts(assets: Artifact[]): Artifact[] {
  const used = new Set<string>();
  return assets.map((asset) => {
    const original = safeName(asset.name); let name = original, count = 1;
    while (used.has(name.toLowerCase())) { const ext = original.match(/\.[^.]+$/)?.[0] ?? ""; const suffix = `-${++count}`; name = `${baseName(original).slice(0, 150 - ext.length - suffix.length)}${suffix}${ext}`; }
    used.add(name.toLowerCase()); return { ...asset, name };
  });
}
export function inferKind(file: Pick<File, "type" | "name">): AssetKind {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (/^image\/(png|jpeg|webp|gif|bmp|avif)$/.test(file.type) || /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.name)) return "image";
  if (/\.json$/i.test(file.name) || file.type === "application/json") return "json";
  if (/\.csv$/i.test(file.name) || file.type === "text/csv") return "csv";
  if (/\.(txt|md|log)$/i.test(file.name) || file.type === "text/plain") return "text";
  if (/\.zip$/i.test(file.name)) return "archive";
  return "binary";
}
export function parsePages(value: string, count: number): number[] {
  if (!value.trim()) return Array.from({ length: count }, (_, i) => i);
  const pages = new Set<number>();
  for (const part of value.split(",")) {
    if (!/^\s*\d+(?:\s*-\s*\d+)?\s*$/.test(part)) throw new Error("Invalid page selection. Use 1-3,5.");
    const [start, suppliedEnd] = part.split("-").map((item) => Number(item.trim())); const end = suppliedEnd ?? start;
    if (start < 1 || end < start || end > count) throw new Error(`Page selection exceeds this document's ${count} pages.`);
    for (let page = start; page <= end; page++) pages.add(page - 1);
  }
  return [...pages];
}
export function parseCsv(text: string, delimiter = ","): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false, closedQuote = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (closedQuote && !quoted && char !== delimiter && char !== "\n" && char !== "\r") {
      if (char === " " || char === "\t") continue;
      throw new Error("Unexpected characters after a closing CSV quote.");
    }
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted) { quoted = false; closedQuote = true; }
      else if (!cell) quoted = true;
      else throw new Error("Malformed CSV quote.");
    } else if (char === delimiter && !quoted) { row.push(cell); cell = ""; closedQuote = false; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(cell); if (row.some((value) => value !== "")) rows.push(row); row = []; cell = ""; closedQuote = false;
    } else cell += char;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(cell); if (row.some((value) => value !== "")) rows.push(row);
  if (!rows.length) throw new Error("CSV has no headers.");
  const headers = rows.shift()!.map((header) => header.trim());
  if (headers.some((header) => !header) || new Set(headers).size !== headers.length) throw new Error("CSV headers must be nonempty and unique.");
  if (rows.length > 50000) throw new Error("CSV exceeds the 50,000-row limit.");
  return rows.map((values) => { if (values.length !== headers.length) throw new Error("CSV row length does not match its headers."); return Object.fromEntries(headers.map((header, i) => [header, values[i]])); });
}
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, "en-US")).map(([key, child]) => [key, sortKeys(child)]));
  return value;
}
const jsonBlob = (value: unknown, indent = 2) => new Blob([JSON.stringify(value, null, indent)], { type: "application/json" });
const artifact = (id: string, name: string, kind: AssetKind, blob: Blob): Artifact => ({ id, name, kind, blob });

async function pdfOperation(assets: Artifact[], step: WorkflowStep, signal: AbortSignal, progress: (done: number, total: number) => void): Promise<Artifact[]> {
  if (step.operation === "pdf-render") {
    if (typeof window === "undefined") throw new Error("PDF page rendering requires a browser.");
    const modulePath = "/pdfjs/pdf.min.mjs";
    // Keep the large browser-only PDF runtime out of Next's server/dependency
    // graph. It is still served locally, from the pinned package's build assets.
    const pdfjs = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ modulePath) as typeof import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
    const output: Artifact[] = [];
    for (let assetIndex = 0; assetIndex < assets.length; assetIndex++) {
      const asset = assets[assetIndex];
      checkAbort(signal);
      const task = pdfjs.getDocument({ data: new Uint8Array(await asset.blob.arrayBuffer()), isEvalSupported: false, cMapUrl: "/pdfjs/cmaps/", cMapPacked: true, standardFontDataUrl: "/pdfjs/standard_fonts/", wasmUrl: "/pdfjs/wasm/", useSystemFonts: true });
      const stop = () => { void task.destroy().catch(() => {}); }; signal.addEventListener("abort", stop, { once: true });
      try {
        const doc = await task.promise; if (doc.numPages > LIMITS.pages) throw new Error(`PDF exceeds the ${LIMITS.pages}-page rendering limit.`);
        const pages = parsePages(String(step.options.pages), doc.numPages);
        for (let index = 0; index < pages.length; index++) {
          checkAbort(signal); const page = await doc.getPage(pages[index] + 1);
          const initial = page.getViewport({ scale: Number(step.options.dpi) / 72 });
          const scale = Math.min(1, 4096 / initial.width, 4096 / initial.height, Math.sqrt(16_000_000 / (initial.width * initial.height)));
          const viewport = page.getViewport({ scale: Number(step.options.dpi) / 72 * scale });
          const canvas = document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas is unavailable.");
          try {
            const rendering = page.render({ canvas, canvasContext: ctx, viewport, background: "rgb(255,255,255)" });
            const cancelRender = () => rendering.cancel(); signal.addEventListener("abort", cancelRender, { once: true });
            try { await rendering.promise; } finally { signal.removeEventListener("abort", cancelRender); }
            const format = String(step.options.format); const blob = await canvasBlob(canvas, `image/${format}`, 0.94);
            output.push({ ...artifact(`${asset.id}-${pages[index]}`, `${baseName(asset.name)}-page-${String(pages[index] + 1).padStart(3, "0")}.${format === "jpeg" ? "jpg" : "png"}`, "image", blob), width: canvas.width, height: canvas.height });
            enforceBudget(output); progress(assetIndex + (index + 1) / pages.length, assets.length);
          } finally { canvas.width = canvas.height = 0; page.cleanup(); }
        }
      } finally { signal.removeEventListener("abort", stop); await task.destroy(); }
    }
    return output;
  }
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  if (step.operation === "pdf-merge") {
    const merged = await PDFDocument.create();
    for (let i = 0; i < assets.length; i++) { checkAbort(signal); const doc = await PDFDocument.load(new Uint8Array(await assets[i].blob.arrayBuffer())); if (merged.getPageCount() + doc.getPageCount() > 300) throw new Error("Merged PDF exceeds 300 pages."); (await merged.copyPages(doc, doc.getPageIndices())).forEach((page) => merged.addPage(page)); progress(i + 1, assets.length + 1); }
    return [artifact(step.id, "merged.pdf", "pdf", new Blob([await merged.save() as BlobPart], { type: "application/pdf" }))];
  }
  const output: Artifact[] = [];
  for (let i = 0; i < assets.length; i++) {
    checkAbort(signal); const asset = assets[i]; const doc = await PDFDocument.load(new Uint8Array(await asset.blob.arrayBuffer()));
    if (doc.getPageCount() > 300) throw new Error("PDF exceeds 300 pages.");
    if (step.operation === "pdf-watermark") {
      const font = await doc.embedFont(StandardFonts.Helvetica);
      for (const page of doc.getPages()) { const size = Math.min(40, page.getWidth() / 12); page.drawText(String(step.options.text), { x: page.getWidth() * 0.16, y: page.getHeight() * 0.4, size, font, color: rgb(0.35, 0.35, 0.35), rotate: degrees(35), opacity: Number(step.options.opacity) }); }
      output.push(artifact(asset.id, `${baseName(asset.name)}-watermarked.pdf`, "pdf", new Blob([await doc.save() as BlobPart], { type: "application/pdf" })));
    } else {
      const selections = step.operation === "pdf-split" ? doc.getPageIndices().map((page) => [page]) : [parsePages(String(step.options.pages), doc.getPageCount())];
      for (let index = 0; index < selections.length; index++) { checkAbort(signal); const result = await PDFDocument.create(); (await result.copyPages(doc, selections[index])).forEach((page) => result.addPage(page)); output.push(artifact(`${asset.id}-${index}`, `${baseName(asset.name)}-${step.operation === "pdf-split" ? `page-${index + 1}` : "selected"}.pdf`, "pdf", new Blob([await result.save() as BlobPart], { type: "application/pdf" }))); enforceBudget(output); }
    }
    progress(i + 1, assets.length);
  }
  return output;
}
async function imagesPdf(assets: Artifact[], step: WorkflowStep, signal: AbortSignal, progress: (done: number, total: number) => void): Promise<Artifact[]> {
  const { PDFDocument } = await import("pdf-lib"); const doc = await PDFDocument.create();
  for (let index = 0; index < assets.length; index++) {
    const asset = assets[index];
    checkAbort(signal); const bitmap = await createImageBitmap(asset.blob); const canvas = document.createElement("canvas");
    try {
      canvas.width = bitmap.width; canvas.height = bitmap.height; if (canvas.width * canvas.height > 16_000_000) throw new Error("Resize images below 16 megapixels before creating a PDF.");
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable."); ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0);
      const image = await doc.embedJpg(new Uint8Array(await (await canvasBlob(canvas, "image/jpeg", 0.94)).arrayBuffer())); const margin = Number(step.options.margin);
      const dimensions: [number, number] = step.options.pageSize === "fit" ? [image.width + margin * 2, image.height + margin * 2] : step.options.pageSize === "a4" ? [595.28, 841.89] : [612, 792];
      const page = doc.addPage(dimensions), scale = Math.min((dimensions[0] - margin * 2) / image.width, (dimensions[1] - margin * 2) / image.height);
      page.drawImage(image, { x: (dimensions[0] - image.width * scale) / 2, y: (dimensions[1] - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
    } finally { bitmap.close(); canvas.width = canvas.height = 0; }
    progress(index + 1, assets.length + 1);
  }
  const blob = new Blob([await doc.save() as BlobPart], { type: "application/pdf" }); progress(assets.length + 1, assets.length + 1);
  return [artifact(step.id, "images.pdf", "pdf", blob)];
}
function enforceBudget(assets: Artifact[]) {
  if (assets.length > LIMITS.files || assets.reduce((sum, asset) => sum + asset.blob.size, 0) > LIMITS.outputBytes) throw new Error("Workflow exceeded 100 output files or 256 MB of intermediate data. Use smaller batches.");
}
export async function executeStep(assets: Artifact[], step: WorkflowStep, signal: AbortSignal, progress: (done: number, total: number) => void = () => {}): Promise<Artifact[]> {
  checkAbort(signal);
  if (step.operation.startsWith("pdf-")) return pdfOperation(assets, step, signal, progress);
  if (step.operation === "images-pdf") return imagesPdf(assets, step, signal, progress);
  if (step.operation === "zip") {
    const { default: JSZip } = await import("jszip"); const zip = new JSZip();
    for (const asset of uniqueArtifacts(assets)) { checkAbort(signal); zip.file(asset.name, await asset.blob.arrayBuffer()); }
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, (metadata) => progress(metadata.percent, 100));
    checkAbort(signal); return [artifact(step.id, `${safeName(String(step.options.name))}.zip`, "archive", blob)];
  }
  if (step.operation === "rename") return assets.map((asset, index) => ({ ...asset, name: `${step.options.prefix ? safeName(String(step.options.prefix)) : ""}${step.options.sequence ? String(index + 1).padStart(3, "0") : baseName(asset.name)}${String(step.options.suffix)}${asset.name.match(/\.[^.]+$/)?.[0] ?? ""}` }));
  if (step.operation === "checksum") {
    if (!crypto.subtle) throw new Error("Checksums require HTTPS or localhost and Web Crypto support.");
    const records = [];
    for (const asset of assets) { checkAbort(signal); const hash = await crypto.subtle.digest("SHA-256", await asset.blob.arrayBuffer()); records.push({ file: asset.name, bytes: asset.blob.size, mimeType: asset.blob.type, sha256: [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("") }); }
    const report = artifact(step.id, "sha256-manifest.json", "json", jsonBlob(records)); return step.options.includeFiles ? [...assets, report] : [report];
  }
  const output: Artifact[] = [];
  for (let index = 0; index < assets.length; index++) {
    checkAbort(signal); const asset = assets[index];
    if (step.operation.startsWith("image-")) output.push(await processWorkflowImage(asset, step, signal));
    else {
      if (asset.blob.size > LIMITS.textBytes) throw new Error("Text and data processing is limited to 5 MB per file.");
      let value = await asset.blob.text(); const base = baseName(asset.name); let blob: Blob; let kind: AssetKind = asset.kind, name = asset.name;
      switch (step.operation) {
        case "text-clean": value = value.replace(/\r\n?/g, "\n").split("\n").map((line) => step.options.trimLines ? line.trim() : line.trimEnd()).join("\n"); if (step.options.collapseSpaces) value = value.replace(/[ \t]+/g, " "); break;
        case "text-case": { const lower = value.toLowerCase(); value = step.options.mode === "upper" ? value.toUpperCase() : step.options.mode === "lower" ? lower : step.options.mode === "title" ? lower.replace(/(^|\s)(\S)/g, (_, space: string, char: string) => space + char.toUpperCase()) : lower.replace(/(^|[.!?]\s+)(\S)/g, (_, prefix: string, char: string) => prefix + char.toUpperCase()); break; }
        case "text-dedupe": { const seen = new Set<string>(); value = value.split(/\r\n|\r|\n/).filter((line) => { if (step.options.removeBlank && !line.trim()) return false; const key = step.options.caseSensitive ? line : line.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).join("\n"); break; }
        case "text-sort": { const lines = value.split(/\r\n|\r|\n/); if (lines.length > 50000) throw new Error("Line sorting is limited to 50,000 lines."); value = lines.sort((a, b) => a.localeCompare(b, "en-US", { numeric: true }) * (step.options.descending ? -1 : 1)).join("\n"); break; }
        case "text-replace": value = value.replaceAll(String(step.options.find), () => String(step.options.replace)); break;
        case "text-stats": { const words = value.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []; blob = jsonBlob({ file: asset.name, words: words.length, characters: Array.from(value).length, characterCounting: "Unicode code points", utf16CodeUnits: value.length, charactersWithoutWhitespace: Array.from(value.replace(/\s/g, "")).length, lines: value ? value.split(/\r\n|\n|\r/).length : 0, estimatedReadingMinutes: words.length / Number(step.options.wpm), ...(step.options.includeText ? { text: value } : {}) }); kind = "json"; name = `${base}-analysis.json`; break; }
        case "csv-json": blob = jsonBlob(parseCsv(value, step.options.delimiter === "tab" ? "\t" : String(step.options.delimiter))); kind = "json"; name = `${base}.json`; break;
        case "json-format": { const parsed: unknown = JSON.parse(value); blob = jsonBlob(step.options.sortKeys ? sortKeys(parsed) : parsed, Number(step.options.indent)); name = `${base}.json`; kind = "json"; break; }
        case "json-csv": {
          const data: unknown = JSON.parse(value); if (!Array.isArray(data) || data.length > 50000 || data.some((row) => !row || typeof row !== "object" || Array.isArray(row))) throw new Error("JSON to CSV requires an array of flat objects (maximum 50,000 rows).");
          const headers = [...new Set(data.flatMap((row) => Object.keys(row)))];
          if (!headers.length) throw new Error("JSON records must contain at least one field for CSV export.");
          const escape = (cell: unknown) => { if (cell && typeof cell === "object") throw new Error("Nested objects must be flattened before CSV export."); let text = cell == null ? "" : String(cell); if (step.options.spreadsheetSafe && /^[\s]*[=+@-]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"', '""') + '"'; };
          blob = new Blob([[headers.map(escape).join(","), ...data.map((row) => headers.map((header) => escape(Object.hasOwn(row, header) ? row[header] : "")).join(","))].join("\r\n")], { type: "text/csv" }); kind = "csv"; name = `${base}.csv`; break;
        }
        default: if (!step.operation.startsWith("text-")) throw new Error("Unsupported operation");
      }
      blob ??= new Blob([value], { type: "text/plain" }); output.push(artifact(`${asset.id}-${step.id}`, name, kind, blob));
    }
    enforceBudget(output); progress(index + 1, assets.length);
    await new Promise((resolve) => setTimeout(resolve, 0)); // Yield between actual files, not simulated processing.
  }
  return output;
}
export async function runWorkflow(definition: Workflow, files: File[], signal: AbortSignal, onReport: (report: StepReport, percent: number) => void): Promise<Artifact[]> {
  const validation = validateWorkflow(definition); if (!validation.workflow) throw new Error(validation.errors.join("\n"));
  if (!files.length || files.length > 30 || files.reduce((sum, file) => sum + file.size, 0) > LIMITS.inputBytes) throw new Error("Select 1–30 files totaling no more than 100 MB.");
  let current = uniqueArtifacts(files.map((file, index) => artifact(`input-${index}`, file.name, inferKind(file), file)));
  if (definition.input !== "files" && current.some((file) => file.kind !== definition.input)) throw new Error(`This workflow expects ${definition.input.toUpperCase()} files. SVG/vector files are not supported as image input.`);
  for (let index = 0; index < definition.steps.length; index++) {
    checkAbort(signal); const step = definition.steps[index], operation = operationById(step.operation)!;
    if (current.some((asset) => !operation.accepts.includes(asset.kind))) throw new Error(`${operation.name} received an incompatible file type.`);
    const started = performance.now(); const report: StepReport = { id: step.id, name: operation.name, state: "running", inputCount: current.length };
    onReport(report, index / definition.steps.length * 100);
    try {
      current = uniqueArtifacts(await executeStep(current, step, signal, (done, total) => onReport(report, (index + done / Math.max(1, total)) / definition.steps.length * 100)));
      checkAbort(signal); enforceBudget(current);
      if (!current.length) throw new Error("The operation produced no output.");
      onReport({ ...report, state: "success", outputCount: current.length, bytes: current.reduce((sum, asset) => sum + asset.blob.size, 0), durationMs: performance.now() - started,
        ...(step.operation === "image-compress" ? { targetBytes: Number(step.options.maxKB) * 1000, largestOutputBytes: Math.max(...current.map((asset) => asset.blob.size)) } : {}),
      }, (index + 1) / definition.steps.length * 100);
    } catch (error) { onReport({ ...report, state: "error", error: signal.aborted ? "Canceled" : error instanceof Error ? error.message : "Processing failed", durationMs: performance.now() - started }, index / definition.steps.length * 100); throw error; }
  }
  return current;
}
