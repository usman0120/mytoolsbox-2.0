import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/config/site";
import { SPACES } from "@/spaces";
import { WORKFLOW_PRESETS } from "@/flows/presets";
import { GUIDES } from "@/content/guides";
import { TOOL_MANIFESTS, manifestsInSpace, toolUrl } from "@/tools/registry";

/** Canonical pages only: Spaces, categories, tools, Flows, guides and static pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority = 0.7, lastModified = now): MetadataRoute.Sitemap[number] => ({
    url: SITE_CONFIG.url + path,
    lastModified,
    changeFrequency: "weekly",
    priority,
  });
  return [
    page("", 1),
    page("/tools", 0.8),
    page("/flows", 0.9),
    page("/guides", 0.8),
    ...["about", "contact", "privacy", "terms"].map((p) => page(`/${p}`, 0.4)),
    ...SPACES.filter((s) => manifestsInSpace(s.id).length).flatMap((s) => [
      page(`/${s.slug}`, 0.95),
      ...s.categories.filter((c) => manifestsInSpace(s.id).some((t) => t.category === c.id)).map((c) => page(`/${s.slug}/c/${c.id}`, 0.7)),
    ]),
    ...TOOL_MANIFESTS.filter((m) => m.status !== "soon").map((m) => page(toolUrl(m), 0.9)),
    ...WORKFLOW_PRESETS.map((f) => page(`/flows/${f.id}`, 0.8)),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.7, g.date ? new Date(g.date) : now)),
  ];
}
