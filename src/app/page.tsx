import type { Metadata } from "next";
import { getPopularTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import {
  generateMetadata as generateSEOMetadata,
  generateWebSiteJsonLd,
  generateOrganizationJsonLd,
} from "@/lib/seo";
import { HomeClient } from "./home-client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Free Online Tools & Daily Utilities - 100% Private In-Browser",
  description:
    "Over 150+ free, fast, and secure online tools for documents, images, coding, writing, mathematics, and daily tasks. 100% client-side with zero data uploads.",
  path: "",
  keywords: [
    "online tools",
    "free online tools",
    "pdf merger free",
    "compress image online",
    "json formatter",
    "qr code generator",
    "percentage calculator",
    "word counter",
    "client-side tools",
    "private web utilities",
    "browser tools without upload",
    "free developer utilities",
  ],
});

export default function Home() {
  const popularTools = getPopularTools(8);
  const featuredApps = getActiveApps().slice(0, 6);
  const websiteLd = generateWebSiteJsonLd();
  const organizationLd = generateOrganizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <HomeClient popularTools={popularTools} featuredApps={featuredApps} />
    </>
  );
}
