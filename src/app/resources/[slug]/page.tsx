import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESOURCE_GUIDES, getGuideBySlug } from "@/features/resources/resources-data";
import { ResourceGuidePageClient } from "./page-client";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return RESOURCE_GUIDES.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide Not Found - MyToolsBox",
    };
  }

  return {
    title: `${guide.title} - MyToolsBox Resources`,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return <ResourceGuidePageClient guide={guide} />;
}
