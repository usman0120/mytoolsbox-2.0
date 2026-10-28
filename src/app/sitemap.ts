import type { MetadataRoute } from "next";
import { SITE_CONFIG, CATEGORIES } from "@/lib/constants";
import { getActiveTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import { getActiveHubs } from "@/content/hubs/registry";
import { BLOG_POSTS } from "@/content/blog/blogs-data";
import { RESOURCE_GUIDES } from "@/features/resources/resources-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({ url: SITE_CONFIG.url + path, lastModified: now, changeFrequency: "weekly", priority });
  return [
    page("", 1), page("/tools", 0.95), page("/apps", 0.95), page("/workflows", 0.95),
    ...["hubs", "blog", "resources", "search", "about", "contact", "privacy", "terms"].map((path) => page(`/${path}`)),
    ...CATEGORIES.map((category) => page(`/tools?category=${category.id}`)),
    ...getActiveTools().map((tool) => page(`/tools/${tool.slug}`, 0.85)),
    ...getActiveApps().map((app) => page(`/apps/${app.slug}`, 0.85)),
    ...getActiveHubs().map((hub) => page(`/hubs/${hub.slug}`)),
    ...RESOURCE_GUIDES.map((guide) => page(`/resources/${guide.slug}`)),
    ...BLOG_POSTS.map((post) => ({ ...page(`/blog/${post.slug}`), lastModified: new Date(post.isoDate) })),
  ];
}
