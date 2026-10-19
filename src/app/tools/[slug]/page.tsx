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
// Page component with comprehensive JSON-LD structured data
// ---------------------------------------------------------------------------

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  const helpFaqs = tool.slug === "json-formatter" ? [
    { question: "Which JSON operations are available?", answer: "Format with 2 spaces, 4 spaces, or tabs; sort object keys; minify; attempt repair; convert to YAML or CSV; or query a path. Copy or download the result after processing." },
    { question: "What happens with invalid JSON?", answer: "A parsing error is shown instead of a successful result. Repair attempts to correct common syntax problems; review its output before using it." },
  ] : tool.slug === "percentage-calculator" ? [
    { question: "Which percentage calculations are available?", answer: "Calculate a percentage of a number, a part as a percentage of a whole, percentage change, an increase or discount, or a fraction as a percentage. Results update when the inputs change." },
    { question: "Can I calculate with a zero denominator?", answer: "A zero whole or denominator, or a zero starting value for percentage change, is undefined. Enter a nonzero value to calculate a result." },
  ] : tool.faq;
  const visibleTool = { ...tool, faq: helpFaqs };
  const applicationFacts = generateSoftwareAppJsonLd(tool);
  const softwareAppLd = {
    "@context": applicationFacts["@context"],
    "@type": applicationFacts["@type"],
    name: tool.name,
    url: applicationFacts.url,
    applicationCategory: applicationFacts.applicationCategory,
    operatingSystem: applicationFacts.operatingSystem,
  };
  const faqLd = helpFaqs?.length ? generateFAQJsonLd(helpFaqs) : null;

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
      <ToolPageClient tool={visibleTool} />
    </>
  );
}