import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppBySlug, getActiveApps } from "@/content/apps/registry";
import {
  generateToolMetadata,
  generateSoftwareAppJsonLd,
  generateHowToJsonLd,
  generateFAQJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";
import { AppPageClient } from "./page-client";

interface AppPageProps {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// Static params — pre-render all active app pages at build time
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getActiveApps().map((app) => ({ slug: app.slug }));
}

// ---------------------------------------------------------------------------
// Dynamic metadata per app
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: AppPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = getAppBySlug(slug);
  if (!app) return {};
  return generateToolMetadata(app);
}

// ---------------------------------------------------------------------------
// Page component with JSON-LD structured data
// ---------------------------------------------------------------------------

export default async function AppPage({ params }: AppPageProps) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) notFound();

  // 1. Software / WebApplication Schema
  const softwareAppLd = generateSoftwareAppJsonLd(app);

  // 2. HowTo Step Schema
  const howToLd = generateHowToJsonLd(app);

  // 3. FAQ Schema
  const faqLd = app.faq && app.faq.length > 0 ? generateFAQJsonLd(app.faq) : null;

  // 4. Breadcrumb Schema
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Apps", url: "/apps" },
    { name: app.category.charAt(0).toUpperCase() + app.category.slice(1), url: `/apps?category=${app.category}` },
    { name: app.name, url: `/apps/${app.slug}` },
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
      <AppPageClient app={app} />
    </>
  );
}