import type { MetadataRoute } from "next";
import { getActiveTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import { getActiveHubs } from "@/content/hubs/registry";
import { RESOURCE_GUIDES } from "@/features/resources/resources-data";
import { workflowRegistry } from "@/lib/workflow/registry";
import { CATEGORIES, SITE_CONFIG } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  // 1. Static Core Platform Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/apps`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/workflows`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/ai`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/hubs`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. Category Cluster & Silo Landing URLs
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/tools?category=${cat.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // 3. Topic Hub Pillar Pages
  const hubPages: MetadataRoute.Sitemap = getActiveHubs().map((hub) => ({
    url: `${baseUrl}/hubs/${hub.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // 4. Resource Learning & Guide Pages
  const resourcePages: MetadataRoute.Sitemap = RESOURCE_GUIDES.map((guide) => ({
    url: `${baseUrl}/resources/${guide.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // 5. Multi-tool Workflow Pipeline Pages
  const workflowPages: MetadataRoute.Sitemap = workflowRegistry.map((wf) => ({
    url: `${baseUrl}/workflows/${wf.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 6. High-Intent Tool Pages
  const toolPages: MetadataRoute.Sitemap = getActiveTools().map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // 7. Interactive Web App Pages
  const appPages: MetadataRoute.Sitemap = getActiveApps().map((app) => ({
    url: `${baseUrl}/apps/${app.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...hubPages,
    ...resourcePages,
    ...workflowPages,
    ...toolPages,
    ...appPages,
  ];
}