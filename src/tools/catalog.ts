// Compact, serialisable tool list for client features (File Tray "Send to…", Continue with…).
// Built on the server from the manifests so the client never ships full manifest copy.
import type { CatalogEntry } from "@/runtime/ports";
import { TOOL_MANIFESTS, toolUrl } from "./registry";
import type { PortType, ToolManifest } from "./types";

/** Popular file tools first, so "Send to…" lists the most useful next steps at the top. */
const PRIORITY = [
  "media.compress-image", "media.resize-image", "media.convert-image", "media.crop-image", "docs.jpg-to-pdf",
  "docs.compress-pdf", "docs.merge-pdf", "docs.pdf-to-jpg", "docs.split-pdf", "media.video-to-gif", "media.compress-video",
];

// A generic "any-file" port limited by an accept list (e.g. .pptx only) is not a wildcard.
const fileInputs = (m: ToolManifest): PortType[] =>
  m.template === "file" ? [...new Set(m.input.filter((p) => !(p.type === "any-file" && p.accept?.length)).map((p) => p.type))] : [];

export function compactCatalog(): CatalogEntry[] {
  return TOOL_MANIFESTS.filter((m) => m.status !== "soon" && fileInputs(m).length > 0)
    .map((m) => ({ id: m.id, name: m.name, url: toolUrl(m), accepts: fileInputs(m) }))
    .sort((a, b) => {
      const pa = PRIORITY.indexOf(a.id), pb = PRIORITY.indexOf(b.id);
      return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    });
}
