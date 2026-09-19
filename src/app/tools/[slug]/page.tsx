import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, getActiveTools } from "@/content/tools/registry";
import {
  generateToolMetadata,
  generateSoftwareAppJsonLd,
  generateFAQJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";
import { ToolPageClient } from "./page-client";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// Static params — pre-render all active tool pages at build time
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getActiveTools().map((tool) => ({ slug: tool.slug }));
}

// ---------------------------------------------------------------------------
// Dynamic metadata per tool
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return generateToolMetadata(tool);
}

// ---------------------------------------------------------------------------
// Page component with JSON-LD structured data
// ---------------------------------------------------------------------------

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  // Build JSON-LD structured data
  const jsonLd = {
    ...generateSoftwareAppJsonLd(tool),
    ...(tool.faq.length > 0 && { mainEntity: generateFAQJsonLd(tool.faq)?.mainEntity }),
  };

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Tools", url: "/tools" },
    { name: tool.name, url: `/tools/${tool.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ToolPageClient tool={tool} />
    </>
  );
}