import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHubBySlug, getActiveHubs } from "@/content/hubs/registry";
import { getToolBySlug } from "@/content/tools/registry";
import { getAppBySlug } from "@/content/apps/registry";
import {
  generateMetadata as generateSEOMetadata,
  generateBreadcrumbJsonLd,
  generateCollectionPageJsonLd,
} from "@/lib/seo";
import { HubDetailClient } from "./page-client";

interface HubPageProps {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getActiveHubs().map((hub) => ({ slug: hub.slug }));
}

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: HubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hub = getHubBySlug(slug);
  if (!hub) return {};

  return generateSEOMetadata({
    title: `${hub.name} Hub - Free Online Tools & Resources`,
    description: hub.description,
    path: `/hubs/${hub.slug}`,
    keywords: [hub.name.toLowerCase(), "tools", "resources", "utilities", "free online tools"],
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function HubPage({ params }: HubPageProps) {
  const { slug } = await params;
  const hub = getHubBySlug(slug);

  if (!hub) notFound();

  // Resolve tool and app references
  const tools = hub.toolIds
    .map((id) => getToolBySlug(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getToolBySlug>>[];

  const apps = hub.appIds
    .map((id) => getAppBySlug(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getAppBySlug>>[];

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Hubs", url: "/hubs" },
    { name: hub.name, url: `/hubs/${hub.slug}` },
  ]);

  const collectionLd = generateCollectionPageJsonLd({
    name: `${hub.name} Tools & Resources`,
    description: hub.description,
    url: `/hubs/${hub.slug}`,
    items: [
      ...tools.map((t) => ({ name: t.name, url: `/tools/${t.slug}`, description: t.shortDescription })),
      ...apps.map((a) => ({ name: a.name, url: `/apps/${a.slug}`, description: a.shortDescription })),
    ],
  });

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
      <HubDetailClient slug={slug} hub={hub} tools={tools} apps={apps} />
    </>
  );
}