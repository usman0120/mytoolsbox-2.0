import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PDFToOfficeConverterEngine } from "@/features/documents/pdf-to-office-converter-engine";
import { PDFToPPTConverterEngine } from "@/features/documents/pdf-to-ppt-converter-engine";
import { createTextSlides, parsePptxSlides } from "@/lib/documents/openxml-builder";
import JSZip from "jszip";

function readBlob(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function parseExport(blob: Blob) {
  const buffer = await readBlob(blob);
  return parsePptxSlides({ arrayBuffer: async () => buffer } as File);
}

const mocks = vi.hoisted(() => ({ extract: vi.fn(), createUrl: vi.fn(), revokeUrl: vi.fn() }));
vi.mock("@/lib/documents/pdf-text-extractor", () => ({ extractPdfPages: mocks.extract }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  mocks.extract.mockReset();
  mocks.createUrl.mockReset().mockReturnValue("blob:export");
  mocks.revokeUrl.mockReset();
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = mocks.createUrl;
    static revokeObjectURL = mocks.revokeUrl;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Office export identity", () => {
  it("locks format and source changes during conversion and downloads the matching DOCX", async () => {
    let resolvePages!: (pages: { pageNumber: number; text: string; lines: string[] }[]) => void;
    mocks.extract.mockReturnValue(new Promise((resolve) => { resolvePages = resolve; }));
    const { container } = render(<PDFToOfficeConverterEngine />);
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["PDF"], "original.pdf", { type: "application/pdf" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Convert to DOCX" }));
    const excel = screen.getByRole("button", { name: /Excel Spreadsheet/ });
    expect(excel).toBeDisabled();
    expect(screen.getByRole("button", { name: "Change PDF" })).toBeDisabled();
    fireEvent.click(excel);
    fireEvent.click(screen.getByRole("button", { name: "Change PDF" }));
    await act(async () => { resolvePages([{ pageNumber: 1, text: "Actual text", lines: ["Actual text"] }]); });
    const download = await screen.findByRole("button", { name: "Download .docx" });
    expect(mocks.createUrl.mock.calls[0][0].type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("original.docx");
      expect(this.href).toBe("blob:export");
    });
    fireEvent.click(download);
    expect(click).toHaveBeenCalledOnce();
    fireEvent.click(excel);
    expect(screen.queryByRole("button", { name: "Download .docx" })).not.toBeInTheDocument();
    expect(mocks.revokeUrl).toHaveBeenCalledWith("blob:export");
  });
});

describe("Text-only slide exports", () => {
  const lines = ["A long first line " + "text & <content> 😀 ".repeat(40), ...Array.from({ length: 23 }, (_, index) => `Line ${index + 1}: actual PDF text`)];
  const pages = [{ pageNumber: 1, text: lines.join("\n"), lines }, { pageNumber: 2, text: "Last page", lines: ["Last page"] }];

  it("paginates every line and long Unicode text without dropping characters", () => {
    const slides = createTextSlides(pages);
    expect(slides.length).toBeGreaterThan(pages.length);
    expect(slides.flatMap((slide) => slide.bullets).join("")).toBe(pages.flatMap((page) => page.lines).join(""));
    expect(slides.every((slide) => slide.bullets.length <= 6 && slide.bullets.every((text) => Array.from(text).length <= 60))).toBe(true);
    expect(slides.at(-1)?.title).toBe("Page 2");
  });

  it("rejects empty extracted text instead of fabricating slide content", () => {
    expect(() => createTextSlides([{ pageNumber: 1, lines: ["", "  "] }])).toThrow("No extractable text");
  });

  it.each(["office", "ppt"])("exports all PDF text through the %s engine", async (engine) => {
    mocks.extract.mockResolvedValue(pages);
    const { container } = render(engine === "office" ? <PDFToOfficeConverterEngine /> : <PDFToPPTConverterEngine />);
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["PDF"], "source.pdf", { type: "application/pdf" })] },
    });
    if (engine === "office") fireEvent.click(screen.getByRole("button", { name: /PowerPoint Presentation/ }));
    fireEvent.click(screen.getByRole("button", { name: engine === "office" ? "Convert to PPTX" : "Convert to PowerPoint (.pptx)" }));
    expect(screen.getByRole("button", { name: engine === "office" ? "Change PDF" : "Change Document" })).toBeDisabled();
    await screen.findByRole("button", { name: engine === "office" ? "Download .pptx" : "Download .PPTX Presentation" });
    const blob = mocks.createUrl.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.presentationml.presentation");
    const exported = await parseExport(blob);
    expect(exported.flatMap((slide) => slide.bullets).join("")).toBe(pages.flatMap((page) => page.lines).join(""));
  });
});

describe("PPTX presentation order", () => {
  function presentationZip() {
    const zip = new JSZip();
    zip.file("ppt/presentation.xml", `<deck:presentation xmlns:deck="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:rel="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><deck:sldIdLst><deck:sldId id="256" rel:id="second"/><deck:sldId id="257" rel:id="custom"/><deck:sldId id="258" rel:id="first"/></deck:sldIdLst></deck:presentation>`);
    zip.file("ppt/_rels/presentation.xml.rels", `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="first" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/><Relationship Id="second" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/../slides/slide2.xml"/><Relationship Id="custom" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="/ppt/slides/custom.xml"/></Relationships>`);
    for (const [name, title] of [["slide1", "First filename"], ["slide2", "Second filename"], ["custom", "Custom filename"], ["slide99", "Unreferenced"]]) {
      zip.file(`ppt/slides/${name}.xml`, `<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:text="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><text:p><text:r><text:t>${title}</text:t></text:r></text:p><text:p><text:r><text:t> body </text:t></text:r></text:p></p:cSld></p:sld>`);
    }
    return zip;
  }

  async function parseZip(zip: JSZip) {
    const buffer = await zip.generateAsync({ type: "arraybuffer" });
    return parsePptxSlides({ arrayBuffer: async () => buffer } as File);
  }

  it("uses relationship order, resolves relative/root targets, and excludes unreferenced slides", async () => {
    const slides = await parseZip(presentationZip());
    expect(slides.map((slide) => slide.title)).toEqual(["Second filename", "Custom filename", "First filename"]);
    expect(slides.map((slide) => slide.slideNumber)).toEqual([1, 2, 3]);
    expect(slides.every((slide) => slide.bullets[0] === " body " && slide.body?.[0] === " body ")).toBe(true);
  });

  it.each(["ppt/presentation.xml", "ppt/_rels/presentation.xml.rels", "ppt/slides/slide2.xml"])("rejects a missing required part %s", async (part) => {
    const zip = presentationZip();
    zip.remove(part);
    await expect(parseZip(zip)).rejects.toThrow("Invalid PPTX file");
  });

  it("rejects external slide relationships rather than using filename fallback", async () => {
    const zip = presentationZip();
    zip.file("ppt/_rels/presentation.xml.rels", `<Relationships><Relationship Id="second" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" TargetMode="External" Target="https://example.com/slide.xml"/></Relationships>`);
    await expect(parseZip(zip)).rejects.toThrow("slide relationship missing or invalid");
  });

  it("rejects malformed XML rather than returning fabricated slides", async () => {
    const zip = presentationZip();
    zip.file("ppt/slides/slide2.xml", "<broken>");
    await expect(parseZip(zip)).rejects.toThrow("malformed XML");
  });
});