// Registry of tool manifests (blueprint section 11). Metadata only; engines load on demand.
// M3 fills this from per-tool folders: src/tools/{space}/{slug}/manifest.ts
import type { ToolManifest } from "./types";

export const TOOL_MANIFESTS: ToolManifest[] = [];

export function getManifest(space: string, slug: string): ToolManifest | undefined {
  return TOOL_MANIFESTS.find((m) => m.space === space && m.slug === slug);
}

export function manifestsInSpace(space: string): ToolManifest[] {
  return TOOL_MANIFESTS.filter((m) => m.space === space && m.status !== "soon");
}
