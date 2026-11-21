import { LEGACY_APP_PATHS, LEGACY_TOOL_PATHS } from "@/config/legacy-tool-paths";

/** Maps any stored tool reference (old catalog slug or new manifest id) to a manifest id. */
export function toManifestId(id: string): string | null {
  if (/^[a-z]+\.[a-z0-9-]+$/.test(id)) return id;
  const path = (Object.hasOwn(LEGACY_TOOL_PATHS, id) ? LEGACY_TOOL_PATHS[id] : undefined) ?? (Object.hasOwn(LEGACY_APP_PATHS, id) ? LEGACY_APP_PATHS[id] : undefined);
  if (!path) return null;
  const [, space, slug] = path.split("/");
  return space && slug ? `${space}.${slug}` : null;
}

/** URL for a manifest id (`docs.merge-pdf` → `/docs/merge-pdf`). */
export const idToPath = (id: string) => `/${id.replace(".", "/")}`;
