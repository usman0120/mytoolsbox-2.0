import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ensurePdfJsLoaded } from "@/features/documents/pdf-to-images";
import { extractPdfPages } from "@/lib/documents/pdf-text-extractor";

vi.mock("@/features/documents/pdf-to-images", () => ({
  ensurePdfJsLoaded: vi.fn(),
}));

const createObjectURL = vi.fn(() => "blob:test-pdf");
const revokeObjectURL = vi.fn();
const getDocument = vi.fn();
const getPage = vi.fn();
const arrayBuffer = vi.fn(async () => new ArrayBuffer(8));
const file = { name: "report.pdf", arrayBuffer } as unknown as File;

describe("extractPdfPages", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    createObjectURL.mockReturnValue("blob:test-pdf");
    arrayBuffer.mockResolvedValue(new ArrayBuffer(8));
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.stubGlobal("window", { pdfjsLib: { getDocument } });
    vi.mocked(ensurePdfJsLoaded).mockResolvedValue(true);
    getDocument.mockReturnValue({
      promise: Promise.resolve({ numPages: 2, getPage }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects instead of fabricating content when PDF.js cannot load", async () => {
    vi.mocked(ensurePdfJsLoaded).mockResolvedValue(false);

    await expect(extractPdfPages(file)).rejects.toThrow("PDF.js is unavailable");
    expect(getDocument).not.toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:test-pdf");
  });

  it("rejects when the loader reports success without the PDF.js global", async () => {
    vi.stubGlobal("window", {});

    await expect(extractPdfPages(file)).rejects.toThrow("PDF.js is unavailable");
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:test-pdf");
  });

  it("propagates loader errors and releases the object URL", async () => {
    const cause = new Error("Script blocked");
    vi.mocked(ensurePdfJsLoaded).mockRejectedValue(cause);

    await expect(extractPdfPages(file)).rejects.toMatchObject({
      message: "Unable to extract PDF text. Script blocked",
      cause,
    });
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:test-pdf");
  });

  it("propagates parsing errors instead of returning page metadata", async () => {
    const cause = new Error("Invalid PDF");
    getDocument.mockReturnValue({ promise: Promise.reject(cause) });

    await expect(extractPdfPages(file)).rejects.toMatchObject({
      message: "Unable to extract PDF text. Invalid PDF",
      cause,
    });
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:test-pdf");
  });

  it("rejects a later page failure without returning partial content", async () => {
    getPage.mockResolvedValueOnce({
      getTextContent: vi.fn().mockResolvedValue({ items: [{ str: "Real text" }] }),
    }).mockResolvedValueOnce({
      getTextContent: vi.fn().mockRejectedValue(new Error("Page extraction failed")),
    });

    await expect(extractPdfPages(file)).rejects.toThrow(
      "Unable to extract PDF text. Page extraction failed",
    );
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:test-pdf");
  });

  it("preserves real text, line grouping, page order, and empty pages", async () => {
    getPage.mockResolvedValueOnce({
      getTextContent: vi.fn().mockResolvedValue({
        items: [
          { str: "Hello", transform: [1, 0, 0, 1, 0, 100] },
          { str: "world", transform: [1, 0, 0, 1, 0, 100] },
          { str: "", transform: [1, 0, 0, 1, 0, 90] },
          { str: "Second line", transform: [1, 0, 0, 1, 0, 80] },
        ],
      }),
    }).mockResolvedValueOnce({
      getTextContent: vi.fn().mockResolvedValue({ items: [] }),
    });

    await expect(extractPdfPages(file)).resolves.toEqual([
      { pageNumber: 1, text: "Hello world\nSecond line", lines: ["Hello world", "Second line"] },
      { pageNumber: 2, text: "", lines: [] },
    ]);
    expect(getDocument).toHaveBeenCalledWith("blob:test-pdf");
    expect(getPage.mock.calls).toEqual([[1], [2]]);
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:test-pdf");
  });
});