import type { MetadataRoute } from "next";
import { SITE_CONFIG, CATEGORIES } from "@/lib/constants";
import { getActiveTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import { getActiveHubs } from "@/content/hubs/registry";
import { BLOG_POSTS } from "@/content/blog/blogs-data";
import { RESOURCE_GUIDES } from "@/features/resources/resources-data";
import { SPACES } from "@/spaces";
import { WORKFLOW_PRESETS } from "@/flows/presets";
import { TOOL_MANIFESTS, manifestsInSpace, toolUrl } from "@/tools/registry";
import { LEGACY_APP_PATHS, LEGACY_TOOL_PATHS } from "@/config/legacy-tool-paths";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({ url: SITE_CONFIG.url + path, lastModified: now, changeFrequency: "weekly", priority });
  return [
    page("", 1), page("/tools", 0.95), page("/apps", 0.95), page("/flows", 0.95),
    ...["hubs", "blog", "resources", "about", "contact", "privacy", "terms"].map((path) => page(`/${path}`)),
    ...CATEGORIES.map((category) => page(`/tools?category=${category.id}`)),
    ...SPACES.filter((s) => manifestsInSpace(s.id).length).flatMap((s) => [
      page(`/${s.slug}`, 0.95),
      ...s.categories.filter((c) => manifestsInSpace(s.id).some((t) => t.category === c.id)).map((c) => page(`/${s.slug}/c/${c.id}`, 0.7)),
    ]),
    ...WORKFLOW_PRESETS.map((f) => page(`/flows/${f.id}`, 0.8)),
    ...TOOL_MANIFESTS.filter((m) => m.status !== "soon").map((m) => page(toolUrl(m), 0.9)),
    ...getActiveTools().filter((tool) => !Object.hasOwn(LEGACY_TOOL_PATHS, tool.slug)).map((tool) => page(`/tools/${tool.slug}`, 0.85)),
    ...getActiveApps().filter((app) => !Object.hasOwn(LEGACY_APP_PATHS, app.slug)).map((app) => page(`/apps/${app.slug}`, 0.85)),
    ...getActiveHubs().map((hub) => page(`/hubs/${hub.slug}`)),
    ...RESOURCE_GUIDES.map((guide) => page(`/resources/${guide.slug}`)),
    ...BLOG_POSTS.map((post) => ({ ...page(`/blog/${post.slug}`), lastModified: new Date(post.isoDate) })),
  ];
}
