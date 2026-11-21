// Metadata and structured data for Space, category and tool pages (blueprint section 16).
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";
import type { Space } from "@/spaces";
import type { ToolManifest } from "@/tools/types";

const abs = (path: string) => `${SITE_CONFIG.url}${path}`;
const og = (title: string, description: string, category?: string) =>
  `/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description.slice(0, 160))}${category ? `&category=${encodeURIComponent(category)}` : ""}`;

export function pageMetadata({ title, description, path, category }: { title: string; description: string; path: string; category?: string }): Metadata {
  const image = og(title, description, category);
  return {
    title,
    description,
    alternates: { canonical: abs(path) },
    openGraph: { title, description, url: abs(path), siteName: SITE_CONFIG.name, type: "website", images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function toolMetadata(tool: ToolManifest, space: Space): Metadata {
  return pageMetadata({ title: tool.seo.title, description: tool.seo.description, path: `/${tool.space}/${tool.slug}`, category: space.name });
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: abs(item.path) })),
  };
}

export function faqLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function toolLd(tool: ToolManifest) {
  const graph: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      description: tool.seo.description,
      url: abs(`/${tool.space}/${tool.slug}`),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (runs in the browser)",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ];
  if (tool.howTo) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: tool.seo.h1,
      step: tool.howTo.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
    });
  }
  return graph;
}

/** Serialises JSON-LD safely for a <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
