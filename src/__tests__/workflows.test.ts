import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import { OPERATIONS, validateWorkflow, type Workflow, type WorkflowStep } from "@/features/workflows/model";
import { WORKFLOW_PRESETS } from "@/features/workflows/presets";
import { runWorkflow, parseCsv, parsePages, safeName, uniqueArtifacts } from "@/features/workflows/runner";
import { processWorkflowImage } from "@/features/workflows/image";
import { importWorkflow, readSavedWorkflows, saveWorkflow, removeSavedWorkflow } from "@/features/workflows/storage";

const step = (operation: string, options: WorkflowStep["options"] = {}): WorkflowStep => ({ id: operation, operation, options: { ...Object.fromEntries(OPERATIONS.find((item) => item.id === operation)!.fields.map((field) => [field.key, field.value])), ...options } });
const workflow = (input: Workflow["input"], steps: WorkflowStep[]): Workflow => ({ version: 1, id: "test", name: "Test workflow", description: "", category: "Files", input, steps });
const file = (value: string | Uint8Array, name = "input.txt", type = "text/plain") => new NodeFile([value], name, { type }) as unknown as File;
beforeEach(() => { vi.stubGlobal("Blob", NodeBlob); vi.stubGlobal("crypto", webcrypto); vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network access is not allowed in this test")))); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("workflow definitions and compatibility", () => {
  it.each(WORKFLOW_PRESETS.map((preset) => [preset.name, preset] as const))("validates the executable preset: %s", (_, preset) => {
    expect(validateWorkflow(preset).errors).toEqual([]);
  });
  it("rejects mismatched types and unsupported options", () => {
    expect(validateWorkflow(workflow("pdf", [step("image-compress")])).errors.join(" ")).toContain("cannot accept");
    expect(validateWorkflow(workflow("image", [step("image-resize", { uploadUrl: "https://example.com" })])).errors.join(" ")).toContain("unsupported option");
  });
  it("rejects invalid targets and duplicate step IDs", () => {
    expect(validateWorkflow(workflow("image", [step("image-compress", { maxKB: -1 })])).errors.join(" ")).toContain("allowed range");
    expect(validateWorkflow(workflow("text", [step("text-clean"), step("text-clean")])).errors.join(" ")).toContain("duplicate step ID");
  });
  it("preserves configured PDF page order and rejects out-of-range selections", () => {
    expect(parsePages("3,1-2,3", 4)).toEqual([2, 0, 1]); expect(parsePages("", 2)).toEqual([0, 1]);
    expect(() => parsePages("1-5", 2)).toThrow("exceeds"); expect(() => parsePages("0", 2)).toThrow(); expect(() => parsePages("2-1", 2)).toThrow();
  });
});
describe("local pipeline output contracts", () => {
  it("hands actual processed text to each subsequent step without network calls", async () => {
    const reports = vi.fn();
    const result = await runWorkflow(workflow("text", [step("text-clean"), step("text-dedupe"), step("text-case", { mode: "upper" }), step("text-stats")]), [file("  apple\r\napple\r\n pear  ")], new AbortController().signal, reports);
    const report = JSON.parse(await result[0].blob.text());
    expect(report.text).toBe("APPLE\nPEAR"); expect(report.words).toBe(2); expect(report.characters).toBe(10); expect(result[0].kind).toBe("json");
    expect(reports.mock.calls.filter(([item]) => item.state === "success")).toHaveLength(4); expect(fetch).not.toHaveBeenCalled();
  });
  it("preserves indentation when line trimming is disabled", async () => {
    const result = await runWorkflow(workflow("text", [step("text-clean", { trimLines: false })]), [file("  indented  \r\n next ")], new AbortController().signal, () => {});
    expect(await result[0].blob.text()).toBe("  indented\n next");
  });
  it("parses multiline quoted CSV without losing leading-zero IDs", () => {
    expect(parseCsv('id,note\r\n001,"a,b\nsecond ""line"""')).toEqual([{ id: "001", note: 'a,b\nsecond "line"' }]);
    expect(() => parseCsv('a,a\n1,2')).toThrow("unique"); expect(() => parseCsv('a\n"unclosed')).toThrow("unclosed"); expect(() => parseCsv('a\n"value"junk')).toThrow("Unexpected");
  });
  it("keeps prototype-looking CSV headers as ordinary data", () => {
    const row = parseCsv('__proto__,constructor\nvalue,name')[0];
    expect(Object.hasOwn(row, "__proto__")).toBe(true); expect(row.__proto__).toBe("value"); expect(row.constructor).toBe("name");
  });
  it("creates spreadsheet-safe CSV and fails on nested objects", async () => {
    const output = await runWorkflow(workflow("json", [step("json-csv")]), [file('[{"cell":"=1+1","id":"001"}]', "data.json", "application/json")], new AbortController().signal, () => {});
    expect(await output[0].blob.text()).toContain("'=1+1"); expect(await output[0].blob.text()).toContain('"001"');
    await expect(runWorkflow(workflow("json", [step("json-csv")]), [file('[{"nested":{}}]', "data.json", "application/json")], new AbortController().signal, () => {})).rejects.toThrow("Nested");
  });
  it("packages duplicate names uniquely and retains the actual file contents", async () => {
    const output = await runWorkflow(workflow("text", [step("text-clean"), step("zip")]), [file("one", "same.txt"), file("two", "same.txt")], new AbortController().signal, () => {});
    const { default: JSZip } = await import("jszip"); const zip = await JSZip.loadAsync(await output[0].blob.arrayBuffer());
    expect(Object.keys(zip.files)).toEqual(["same.txt", "same-2.txt"]); expect(await zip.file("same.txt")!.async("string")).toBe("one"); expect(await zip.file("same-2.txt")!.async("string")).toBe("two");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("merges real PDF bytes and passes the PDF to page extraction", async () => {
    const make = async () => { const doc = await PDFDocument.create(); doc.addPage([200, 300]); return file(await doc.save(), "input.pdf", "application/pdf"); };
    const output = await runWorkflow(workflow("pdf", [step("pdf-merge"), step("pdf-extract", { pages: "2" })]), [await make(), await make()], new AbortController().signal, () => {});
    expect((await PDFDocument.load(new Uint8Array(await output[0].blob.arrayBuffer()))).getPageCount()).toBe(1); expect(fetch).not.toHaveBeenCalled();
  });
  it("cancels before processing and preserves the original input", async () => {
    const input = file("original"), controller = new AbortController(); controller.abort();
    await expect(runWorkflow(workflow("text", [step("text-clean")]), [input], controller.signal, () => {})).rejects.toMatchObject({ name: "AbortError" });
    expect(await input.text()).toBe("original");
  });
  it("writes a correct SHA-256 manifest and retains files when requested", async () => {
    const output = await runWorkflow(workflow("text", [step("checksum")]), [file("abc")], new AbortController().signal, () => {});
    expect(output).toHaveLength(2); const manifest = JSON.parse(await output[1].blob.text());
    expect(manifest[0].sha256).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"); expect(manifest[0].bytes).toBe(3);
  });
});
describe("measured image targets and encoder handling", () => {
  const image = () => ({ id: "image", name: "picture.png", kind: "image" as const, blob: new NodeBlob(["fixture"], { type: "image/png" }) as unknown as Blob });
  const setup = (fallback = false) => {
    const close = vi.fn(); vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 1024, height: 1024, close })));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn(), fillRect: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (this: HTMLCanvasElement, callback, type, quality) { callback(new NodeBlob([new Uint8Array(Math.round(this.width * this.height * (quality ?? 0.9) / 2))], { type: fallback ? "image/png" : type }) as unknown as Blob); });
    return close;
  };
  it("checks actual bytes below 200 KB, uses the highest fitting quality, and closes bitmaps", async () => {
    const close = setup(); const result = await processWorkflowImage(image(), step("image-compress"), new AbortController().signal);
    expect(result.blob.size).toBeLessThan(200000); expect(result.blob.size).toBeGreaterThan(190000); expect(result.blob.type).toBe("image/jpeg"); expect(result.name).toBe("picture.jpg"); expect(close).toHaveBeenCalledOnce();
  });
  it("does not fake success when the target cannot be met without resizing", async () => {
    const close = setup(); await expect(processWorkflowImage(image(), step("image-compress", { maxKB: 5, allowResize: false }), new AbortController().signal)).rejects.toThrow("Could not reach"); expect(close).toHaveBeenCalledOnce();
  });
  it("retains already-compliant JPEG bytes without unnecessary re-encoding", async () => {
    const close = setup();
    const blob = new NodeBlob([new Uint8Array([0xff, 0xd8, 0xff, 0, 0])], { type: "image/jpeg" });
    const result = await processWorkflowImage({ ...image(), name: "already.jpg", blob: blob as unknown as Blob }, step("image-compress"), new AbortController().signal);
    expect(result.blob).toBe(blob); expect(HTMLCanvasElement.prototype.toBlob).not.toHaveBeenCalled(); expect(close).toHaveBeenCalledOnce();
  });
  it("rejects the browser silently falling back to PNG for a WebP request", async () => {
    setup(true); await expect(processWorkflowImage(image(), step("image-compress", { format: "webp" }), new AbortController().signal)).rejects.toThrow("not supported");
  });
});
describe("local workflow persistence", () => {
  const storage = () => { const data = new Map<string, string>(); return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } }; };
  it("saves and edits only definitions, not files or Blob URLs", () => {
    const local = storage(), definition = workflow("text", [step("text-clean")]);
    saveWorkflow(definition, local); saveWorkflow({ ...definition, name: "Updated" }, local);
    expect(readSavedWorkflows(local)).toHaveLength(1); expect(readSavedWorkflows(local)[0].workflow.name).toBe("Updated");
    expect(local.getItem("mytoolsbox.workflows.v1")).not.toContain("blob:"); expect(removeSavedWorkflow("test", local)).toEqual([]);
  });
  it("reports quota/storage failures instead of pretending to save", () => {
    expect(() => saveWorkflow(workflow("text", [step("text-clean")]), { getItem: () => null, setItem: () => { throw new Error("quota"); } })).toThrow("quota");
  });
  it("imports valid definitions with fresh IDs and rejects executable or unknown options", () => {
    const definition = workflow("text", [step("text-clean")]); expect(importWorkflow(JSON.stringify(definition)).id).not.toBe(definition.id);
    expect(() => importWorkflow(JSON.stringify(workflow("text", [step("text-clean", { javascript: "alert(1)" })])))).toThrow("unsupported");
  });
  it("sanitizes output names and avoids case-insensitive ZIP collisions", () => {
    expect(safeName("../../private.txt")).not.toContain("/");
    expect(safeName("x".repeat(200) + ".jpg")).toMatch(/\.jpg$/);
    expect(safeName("x".repeat(200) + ".jpg").length).toBeLessThanOrEqual(150);
    const outputs = uniqueArtifacts([{ ...imageFixture(), name: "A.txt" }, { ...imageFixture(), name: "a.txt" }]); expect(outputs.map((item) => item.name)).toEqual(["A.txt", "a-2.txt"]);
  });
});
function imageFixture() { return { id: "file", name: "file.txt", kind: "text" as const, blob: new NodeBlob(["hello"]) as unknown as Blob }; }
