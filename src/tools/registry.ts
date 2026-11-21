// Registry of tool manifests (blueprint section 11). Metadata only; engines load on demand.
// Each Space folder exports its manifests: src/tools/{space}/{slug}/manifest.ts
import type { ToolManifest } from "./types";
import { DOCS_TOOLS } from "./docs";
import { MEDIA_TOOLS } from "./media";
import { CREATE_TOOLS } from "./create";
import { DEV_TOOLS } from "./dev";
import { STUDY_TOOLS } from "./study";
import { CALC_TOOLS } from "./calc";
import { WORK_TOOLS } from "./work";
import { AI_TOOLS } from "./ai";

export const TOOL_MANIFESTS: ToolManifest[] = [
  ...DOCS_TOOLS,
  ...MEDIA_TOOLS,
  ...CREATE_TOOLS,
  ...DEV_TOOLS,
  ...STUDY_TOOLS,
  ...CALC_TOOLS,
  ...WORK_TOOLS,
  ...AI_TOOLS,
];

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
