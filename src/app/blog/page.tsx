import type { Metadata } from "next";
import { BlogPageClient } from "./page-client";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog & Guides - Tutorials, Digital Workflows & Web Tools | MyToolsBox",
  description:
    "Explore practical guides, performance deep-dives, and tutorials for web development, PDF workflows, image optimization, developer utilities, and digital productivity.",
  keywords: [
    "web development guides",
    "pdf guides online",
    "image compression tutorial",
    "json formatter guide",
    "free developer utilities",
    "productivity workflows",
    "browser tools guides",
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
  openGraph: {
    title: "Blog & Guides - MyToolsBox",
    description:
      "Practical tips, deep dives, and how-to guides for tools, web development, and digital workflows.",
    url: `${SITE_CONFIG.url}/blog`,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "MyToolsBox Blog & Guides",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Guides - MyToolsBox",
    description:
      "Practical tips, deep dives, and how-to guides for tools, web development, and digital workflows.",
    images: ["https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=1200&q=80"],
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
