// Server-side builder for the search index (used by /search-index.json and /search).
import { TOOL_MANIFESTS, toolUrl } from "./registry";
import type { SearchDoc } from "./search";

export function buildSearchDocs(): SearchDoc[] {
  return TOOL_MANIFESTS.filter((m) => m.status !== "soon").map((m) => ({
    id: m.id,
    name: m.name,
    url: toolUrl(m),
    space: m.space,
    tagline: m.tagline,
    terms: [m.name, m.tagline, ...m.keywords, ...m.synonyms, ...m.jobs].join(" ").toLowerCase(),
    ai: m.engine === "ai",
  }));
}
