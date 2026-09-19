import { SITE_CONFIG } from "@/lib/constants";
import type { Metadata } from "next";
import type { ToolDefinition } from "@/types";

// ---------------------------------------------------------------------------
// Base metadata generator for any page
// ---------------------------------------------------------------------------

interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  ogImage?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateMetadata({
  title,
  description,
  path,
  noIndex = false,
  ogImage,
  keywords,
  publishedTime,
  modifiedTime,
}: GenerateMetadataParams): Metadata {
  const fullTitle = `${title} | ${SITE_CONFIG.name}`;
  const url = `${SITE_CONFIG.url}${path}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(", "),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      type: "website",
      ...(ogImage && {
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    robots: noIndex ? "noindex, nofollow" : "index, follow",
  };
}

// ---------------------------------------------------------------------------
// Tool-specific metadata (consumes ToolDefinition fields)
// ---------------------------------------------------------------------------

export function generateToolMetadata(tool: ToolDefinition): Metadata {
  const path = `/${tool.productType}s/${tool.slug}`;
  return generateMetadata({
    title: tool.seoTitle,
    description: tool.seoDescription,
    path,
    keywords: tool.keywords,
    noIndex: tool.status !== "active",
  });
}

// ---------------------------------------------------------------------------
// JSON-LD structured data generators
// ---------------------------------------------------------------------------

export function generateSoftwareAppJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: mapCategoryToSchema(tool.category),
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: tool.requiresPro ? "1.00" : "0",
      priceCurrency: "USD",
    },
    ...(tool.features.length > 0 && { featureList: tool.features.join(", ") }),
  };
}

export function generateFAQJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapCategoryToSchema(category: string): string {
  const map: Record<string, string> = {
    documents: "BusinessApplication",
    images: "MultimediaApplication",
    video: "MultimediaApplication",
    audio: "MultimediaApplication",
    writing: "BusinessApplication",
    calculators: "EducationalApplication",
    developer: "DeveloperApplication",
    academic: "EducationalApplication",
    productivity: "BusinessApplication",
    design: "DesignApplication",
    security: "SecurityApplication",
    misc: "UtilityApplication",
  };
  return map[category] ?? "WebApplication";
}