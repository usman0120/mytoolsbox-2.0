// The tool contract (blueprint section 11). Every tool, calculator and AI app implements it.
// Manifests are metadata only: no heavy imports, so the registry stays tiny.
import type { z } from "zod";
import type { SpaceId } from "@/spaces";

export type PortType =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "docx"
  | "xlsx"
  | "csv"
  | "zip"
  | "text"
  | "markdown"
  | "json"
  | "code"
  | "table"
  | "number"
  | "mermaid"
  | "design-scene"
  | "any-file";

export const PORT_TYPES: readonly PortType[] = [
  "pdf", "image", "video", "audio", "docx", "xlsx", "csv", "zip", "text", "markdown",
  "json", "code", "table", "number", "mermaid", "design-scene", "any-file",
];

export interface Port {
  type: PortType;
  /** Accepts or produces several items; the next Flow step runs once per item. */
  many?: boolean;
  /** MIME list accepted by the drop zone. */
  accept?: string[];
}

/** What travels between tools and Flow steps. Blobs live in the browser file store. */
export interface Artifact {
  id: string;
  type: PortType;
  name: string;
  mime: string;
  size: number;
  meta?: Record<string, unknown>;
}

/** Minimal file-store interface engines use (implemented by the runtime in M4). */
export interface FileStore {
  read(id: string): Promise<Blob>;
  write(blob: Blob, info: Omit<Artifact, "id" | "size">): Promise<Artifact>;
}

export type ToolTemplate = "file" | "text" | "calculator" | "ai" | "editor";
export type ToolEngineKind = "client" | "ai" | "remote";
export type ToolStatus = "live" | "beta" | "soon";

export interface ToolSeo {
  /** ≤ 60 characters, job phrase first. The layout appends the brand. */
  title: string;
  /** 140–160 characters including the benefit and "free, private, no sign-up". */
  description: string;
  h1: string;
  variants?: { slug: string; title: string; h1: string; presetId: string }[];
}

export interface ToolManifest<O extends z.ZodType = z.ZodType> {
  /** `{space}.{slug}`, e.g. `docs.compress-pdf`. */
  id: string;
  space: SpaceId;
  category: string;
  slug: string;
  name: string;
  tagline: string;
  keywords: string[];
  synonyms: string[];
  /** Plain-language jobs users search for ("reduce pdf size for email"). */
  jobs: string[];
  template: ToolTemplate;
  input: Port[];
  output: Port[];
  /** Zod schema that drives the auto-generated settings UI. */
  options?: O;
  presets?: { id: string; label: string; values: z.infer<O> }[];
  engine: ToolEngineKind;
  aiTask?: string;
  load?: () => Promise<ToolEngine<O>>;
  ui?: () => Promise<{ default: React.ComponentType }>;
  seo: ToolSeo;
  /** Three short "How it works" steps shown under the tool. */
  howTo?: [string, string, string];
  faq: { q: string; a: string }[];
  /** Related tool ids. */
  related: string[];
  /** Old URL slugs (e.g. `/tools/pdf-merger`) that 308-redirect here. */
  legacySlugs?: string[];
  limits?: { maxFileMB?: number; maxFiles?: number };
  status: ToolStatus;
  offline: boolean;
}

export interface ToolRunContext<O extends z.ZodType> {
  inputs: Artifact[];
  options: z.infer<O>;
  store: FileStore;
  progress: (pct: number, note?: string) => void;
  signal: AbortSignal;
}

export interface ToolEngine<O extends z.ZodType = z.ZodType> {
  run(ctx: ToolRunContext<O>): Promise<Artifact[]>;
}

/** Can `next` take the output of `prev`? Powers Flows and "Continue with…". */
export function portsConnect(prev: Port[], next: Port[]): boolean {
  return prev.some((out) =>
    next.some((inp) => inp.type === "any-file" || inp.type === out.type),
  );
}
