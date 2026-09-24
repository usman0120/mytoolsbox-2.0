import type { Metadata } from "next";
import { AppsPageClient } from "./page-client";
import { getActiveApps } from "@/content/apps/registry";
import {
  generateMetadata as generateSEOMetadata,
  generateCollectionPageJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Interactive Web Apps & Utilities - Free In-Browser Applications",
  description:
    "Collection of interactive web applications for productivity, creativity, education, and daily tasks. Free, responsive, and client-side.",
  path: "/apps",
  keywords: [
    "free web apps",
    "online productivity apps",
    "browser utilities",
    "interactive web tools",
    "free mini applications",
  ],
});

export default function AppsPage() {
  const apps = getActiveApps();

  const collectionLd = generateCollectionPageJsonLd({
    name: "Interactive Web Apps & Utilities",
    description:
      "Collection of interactive web applications for productivity, creativity, education, and daily tasks.",
    url: "/apps",
    items: apps.map((a) => ({
      name: a.name,
      url: `/apps/${a.slug}`,
      description: a.shortDescription || a.description,
    })),
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Apps", url: "/apps" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <AppsPageClient />
    </>
  );
}