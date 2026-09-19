import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppBySlug, getActiveApps } from "@/content/apps/registry";
import {
  generateToolMetadata,
  generateSoftwareAppJsonLd,
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

  // Build JSON-LD structured data
  const jsonLd = {
    ...generateSoftwareAppJsonLd(app),
    ...(app.faq.length > 0 && { mainEntity: generateFAQJsonLd(app.faq)?.mainEntity }),
  };

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Apps", url: "/apps" },
    { name: app.name, url: `/apps/${app.slug}` },
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
      <AppPageClient app={app} />
    </>
  );
}