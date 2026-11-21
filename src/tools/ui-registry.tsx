"use client";

// Lazy UI loaders keyed by manifest id. Each tool's UI is code-split and loads after first paint.
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { EngineBoundary, EngineLoading, EngineUnavailable } from "@/components/common/engine-state";

const ui = <P extends object>(loader: () => Promise<ComponentType<P>>) =>
  dynamic(loader, { loading: () => <EngineLoading /> }) as ComponentType<Record<string, unknown>>;

const UI: Record<string, ComponentType<Record<string, unknown>>> = {
  "docs.compare-pdf": ui(() => import("./docs/compare-pdf/ui").then((m) => m.PDFCompareEngine)),
  "docs.compress-pdf": ui(() => import("./docs/compress-pdf/ui").then((m) => m.PDFCompressorEngine)),
  "docs.csv-to-excel": ui(() => import("./docs/csv-to-excel/ui").then((m) => m.CSVToExcelEngine)),
  "docs.jpg-to-pdf": ui(() => import("./docs/jpg-to-pdf/ui").then((m) => m.ImagesToPDFEngine)),
  "docs.merge-pdf": ui(() => import("./docs/merge-pdf/ui").then((m) => m.PDFMergerEngine)),
  "docs.pdf-to-jpg": ui(() => import("./docs/pdf-to-jpg/ui").then((m) => m.PDFToImagesEngine)),
  "docs.pdf-to-markdown": ui(() => import("./docs/pdf-to-markdown/ui").then((m) => m.PDFToMarkdownEngine)),
  "docs.pdf-to-powerpoint": ui(() => import("./docs/pdf-to-powerpoint/ui").then((m) => m.PDFToPPTConverterEngine)),
  "docs.pdf-to-text": ui(() => import("./docs/pdf-to-text/ui").then((m) => m.PDFToTextEngine)),
  "docs.pdf-to-word": ui(() => import("./docs/pdf-to-word/ui").then((m) => m.PDFToOfficeConverterEngine)),
  "docs.powerpoint-to-pdf": ui(() => import("./docs/powerpoint-to-pdf/ui").then((m) => m.PPTToPDFEngine)),
  "docs.rotate-pdf": ui(() => import("./docs/rotate-pdf/ui").then((m) => m.RotatePdfEngine)),
  "docs.sign-pdf": ui(() => import("./docs/sign-pdf/ui").then((m) => m.PDFSignEngine)),
  "docs.split-pdf": ui(() => import("./docs/split-pdf/ui").then((m) => m.PDFSplitterEngine)),
  "docs.text-to-pdf": ui(() => import("./docs/text-to-pdf/ui").then((m) => m.TextToPDFEngine)),
  "docs.text-to-word": ui(() => import("./docs/text-to-word/ui").then((m) => m.TxtToDocxEngine)),
  "docs.watermark-pdf": ui(() => import("./docs/watermark-pdf/ui").then((m) => m.PDFWatermarkEngine)),
  "docs.word-to-pdf": ui(() => import("./docs/word-to-pdf/ui").then((m) => m.WordToPDFConverterEngine)),
};

export function ToolUi({ id, name }: { id: string; name: string }) {
  const Ui = UI[id];
  if (!Ui) return <EngineUnavailable name={name} />;
  return (
    <EngineBoundary key={id} name={name}>
      <Ui />
    </EngineBoundary>
  );
}

export const toolUiIds = Object.keys(UI);
