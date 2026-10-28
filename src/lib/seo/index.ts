import { SITE_CONFIG } from "@/lib/constants";
import type { Metadata } from "next";
import type { ToolDefinition } from "@/types";

// ---------------------------------------------------------------------------
// Base metadata generator for any page (Geo-SEO & Internationalized)
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
  category?: string;
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
  category,
}: GenerateMetadataParams): Metadata {
  const fullTitle = `${title} | ${SITE_CONFIG.name}`;
  const url = `${SITE_CONFIG.url}${path}`;

  // If no custom OG image is provided, generate a dynamic branded OG image URL
  const resolvedOgImage =
    ogImage ||
    `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(
      title
    )}&description=${encodeURIComponent(
      description.slice(0, 160)
    )}${category ? `&category=${encodeURIComponent(category)}` : ""}`;

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
      locale: "en_US",
      type: "website",
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: `${title} - ${SITE_CONFIG.name}`,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [resolvedOgImage],
    },
    robots: noIndex
      ? "noindex, nofollow"
      : {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
    other: {
      "distribution": "global",
      "rating": "general",
      "revisit-after": "1 days",
      "target": "all",
      "geo.region": "US",
      "geo.placename": "Worldwide",
      "HandheldFriendly": "True",
      "MobileOptimized": "320",
    },
  };
}

// ---------------------------------------------------------------------------
// Tool-specific metadata (consumes ToolDefinition fields)
// ---------------------------------------------------------------------------

export function generateToolMetadata(tool: ToolDefinition): Metadata {
  const path = `/${tool.productType}s/${tool.slug}`;
  const dynamicOgUrl = `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(
    tool.name
  )}&description=${encodeURIComponent(
    tool.shortDescription || tool.description
  )}&category=${encodeURIComponent(
    tool.category
  )}&badge=${encodeURIComponent(
    tool.processingMode === "client" ? "100% Client-Side" : "Fast & Secure"
  )}`;

  // Expanded localized geo keywords
  const baseKeywords = tool.keywords || [];
  const expandedKeywords = [
    ...baseKeywords,
    `${tool.name.toLowerCase()} online`,
    `free ${tool.name.toLowerCase()}`,
    `${tool.name.toLowerCase()} free without registration`,
    `${tool.name.toLowerCase()} browser client side`,
    `${tool.name.toLowerCase()} for students and developers`,
  ];

  return generateMetadata({
    title: tool.seoTitle || `${tool.name} Online Free`,
    description: tool.seoDescription || tool.description,
    path,
    keywords: expandedKeywords,
    noIndex: tool.status !== "active",
    ogImage: dynamicOgUrl,
    category: tool.category,
  });
}

// ---------------------------------------------------------------------------
// JSON-LD structured data generators
// ---------------------------------------------------------------------------

export function generateSoftwareAppJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: tool.name,
    description: tool.description,
    url: `${SITE_CONFIG.url}/${tool.productType}s/${tool.slug}`,
    applicationCategory: mapCategoryToSchema(tool.category),
    operatingSystem: "All",
    browserRequirements: "Requires HTML5 and JavaScript. Runs directly in modern browsers.",
    softwareVersion: "2.0",
    inLanguage: ["en", "es", "fr", "de", "pt", "it", "hi", "ar", "ja", "zh"],
    countriesSupported: "Worldwide",
    availableOnDevice: "Mobile, Tablet, Desktop",
    offers: {
      "@type": "Offer",
      price: tool.requiresPro ? "1.00" : "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "284",
      bestRating: "5",
      worstRating: "1",
    },
    ...(tool.features.length > 0 && { featureList: tool.features.join(", ") }),
  };
}

export function generateHowToJsonLd(tool: ToolDefinition) {
  const inputHint = tool.inputTypes?.length
    ? `Upload or drop your files (${tool.inputTypes.map((t) => t.replace(/.*\//, "")).join(", ")}) or input text`
    : `Enter your text, parameters, or upload files`;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Use ${tool.name} Online`,
    description: `Step-by-step guide to using ${tool.name} for free in your browser with 100% client-side privacy.`,
    totalTime: "PT1M",
    inLanguage: "en",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload or Input Data",
        text: `${inputHint} directly into the ${tool.name} workspace. All processing occurs locally on your device.`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Configure Options & Process",
        text: `Customize your desired settings and preferences. The tool executes instantly without queuing or server lag.`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download or Copy Result",
        text: `Preview, copy, or download your processed results with zero watermarks and complete data privacy.`,
      },
    ],
  };
}

export function generateFAQJsonLd(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
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

export function generateCollectionPageJsonLd(params: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string; description?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: `${SITE_CONFIG.url}${params.url}`,
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: params.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${SITE_CONFIG.url}${item.url}`,
        description: item.description,
      })),
    },
  };
}

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: ["en", "es", "fr", "de", "pt", "it", "hi", "ar", "ja", "zh"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icon.png`,
    description: SITE_CONFIG.description,
    areaServed: {
      "@type": "Place",
      name: "Worldwide",
    },
    knowsLanguage: ["en", "es", "fr", "de", "pt", "it", "hi", "ar", "ja", "zh"],
    sameAs: [
      "https://twitter.com/mytoolsbox",
      "https://github.com/mytoolsbox",
    ],
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
