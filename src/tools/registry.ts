// Registry of tool manifests (blueprint section 11). Metadata only; engines load on demand.
// Each Space folder exports its manifests: src/tools/{space}/{slug}/manifest.ts
import type { ToolManifest } from "./types";
import { DOCS_TOOLS } from "./docs";

export const TOOL_MANIFESTS: ToolManifest[] = [...DOCS_TOOLS];

export function getManifestById(id: string): ToolManifest | undefined {
  return TOOL_MANIFESTS.find((m) => m.id === id);
}

export function toolUrl(m: Pick<ToolManifest, "space" | "slug">): string {
  return `/${m.space}/${m.slug}`;
}

export function getManifest(space: string, slug: string): ToolManifest | undefined {
  return TOOL_MANIFESTS.find((m) => m.space === space && m.slug === slug);
}

export function manifestsInSpace(space: string): ToolManifest[] {
  return TOOL_MANIFESTS.filter((m) => m.space === space && m.status !== "soon");
}
