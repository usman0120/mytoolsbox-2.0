import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, getActiveTools } from "@/content/tools/registry";
import {
  generateToolMetadata,
  generateSoftwareAppJsonLd,
  generateHowToJsonLd,
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
// Page component with comprehensive JSON-LD structured data
// ---------------------------------------------------------------------------

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  // 1. Software / WebApplication Schema
  const softwareAppLd = generateSoftwareAppJsonLd(tool);

  // 2. HowTo Step Schema (Captures Google Rich How-To Cards)
  const howToLd = generateHowToJsonLd(tool);

  // 3. FAQ Schema (Captures Google "People Also Ask" Rich Results)
  const faqLd = tool.faq && tool.faq.length > 0 ? generateFAQJsonLd(tool.faq) : null;

  // 4. Breadcrumb Schema (Hierarchical Silo: Home > Tools > Category > Tool)
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Tools", url: "/tools" },
    { name: tool.category.charAt(0).toUpperCase() + tool.category.slice(1), url: `/tools?category=${tool.category}` },
    { name: tool.name, url: `/tools/${tool.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ToolPageClient tool={tool} />
    </>
  );
}