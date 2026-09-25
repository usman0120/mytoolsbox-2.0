import type { MetadataRoute } from "next";
import { getActiveTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import { getActiveHubs } from "@/content/hubs/registry";
import { RESOURCE_GUIDES } from "@/features/resources/resources-data";
import { BLOG_POSTS } from "@/content/blog/blogs-data";
import { CATEGORIES, SITE_CONFIG, SUPPORTED_LOCALES } from "@/lib/constants";

function buildLanguageAlternates(path: string) {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const languages: Record<string, string> = {
    "x-default": `${SITE_CONFIG.url}${cleanPath}`,
    en: `${SITE_CONFIG.url}${cleanPath}`,
  };
  SUPPORTED_LOCALES.forEach((locale) => {
    if (locale.code !== "en") {
      languages[locale.hreflang] = `${SITE_CONFIG.url}/${locale.code}${cleanPath}`;
    }
  });
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  // 1. Static Core Platform Pages
  const staticPaths = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/tools", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/apps", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/ai", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/hubs", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/blog", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/resources", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/search", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
    alternates: {
      languages: buildLanguageAlternates(item.path),
    },
  }));

  // 2. Category Cluster & Silo Landing URLs
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/tools?category=${cat.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
    alternates: {
      languages: buildLanguageAlternates(`/tools?category=${cat.id}`),
    },
  }));

  // 3. Topic Hub Pillar Pages
  const hubPages: MetadataRoute.Sitemap = getActiveHubs().map((hub) => ({
    url: `${baseUrl}/hubs/${hub.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
    alternates: {
      languages: buildLanguageAlternates(`/hubs/${hub.slug}`),
    },
  }));

  // 4. Resource Learning & Guide Pages
  const resourcePages: MetadataRoute.Sitemap = RESOURCE_GUIDES.map((guide) => ({
    url: `${baseUrl}/resources/${guide.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
    alternates: {
      languages: buildLanguageAlternates(`/resources/${guide.slug}`),
    },
  }));

  // 5. High-Intent Tool Pages (Canonical English)
  const activeTools = getActiveTools();
  const toolPages: MetadataRoute.Sitemap = activeTools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
    alternates: {
      languages: buildLanguageAlternates(`/tools/${tool.slug}`),
    },
  }));

  // 6. Localized High-Demand Tool Pages (Spanish, Urdu, French, German, Portuguese, Hindi, Arabic)
  const localizedToolPages: MetadataRoute.Sitemap = [];
  SUPPORTED_LOCALES.filter((l) => l.code !== "en").forEach((loc) => {
    activeTools.forEach((tool) => {
      localizedToolPages.push({
        url: `${baseUrl}/${loc.code}/tools/${tool.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: buildLanguageAlternates(`/tools/${tool.slug}`),
        },
      });
    });
  });

  // 7. Interactive Web App Pages
  const appPages: MetadataRoute.Sitemap = getActiveApps().map((app) => ({
    url: `${baseUrl}/apps/${app.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
    alternates: {
      languages: buildLanguageAlternates(`/apps/${app.slug}`),
    },
  }));

  // 8. Blog & High-Intent Guide Pages
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.isoDate),
    changeFrequency: "weekly" as const,
    priority: 0.85,
    alternates: {
      languages: buildLanguageAlternates(`/blog/${post.slug}`),
    },
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...hubPages,
    ...resourcePages,
    ...blogPages,
    ...toolPages,
    ...localizedToolPages,
    ...appPages,
  ];
}