import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolsPageClient } from "./page-client";
import { getActiveTools } from "@/content/tools/registry";
import {
  generateMetadata as generateSEOMetadata,
  generateCollectionPageJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "All Free Online Tools - Documents, Images, Coding & Calculators",
  description:
    "Explore 150+ free browser-based tools and utilities. Fast client-side processing for PDFs, images, developers, math, text, and daily jobs with zero server uploads.",
  path: "/tools",
  keywords: [
    "all online tools",
    "free web utilities",
    "pdf tools online",
    "image editing tools",
    "developer utilities",
    "online calculators",
    "browser tools list",
    "client-side web tools",
  ],
});

export default function ToolsPage() {
  const tools = getActiveTools();

  const collectionLd = generateCollectionPageJsonLd({
    name: "All Free Online Tools & Utilities",
    description:
      "Explore 150+ free browser-based tools and utilities with 100% client-side privacy.",
    url: "/tools",
    items: tools.map((t) => ({
      name: t.name,
      url: `/tools/${t.slug}`,
      description: t.shortDescription || t.description,
    })),
  });

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Tools", url: "/tools" },
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
      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading tools...</div>}>
        <ToolsPageClient />
      </Suspense>
    </>
  );
}