import type { Metadata } from "next";
import { getPopularTools } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import {
  generateMetadata as generateSEOMetadata,
  generateWebSiteJsonLd,
  generateOrganizationJsonLd,
} from "@/lib/seo";
import { HomeClient } from "./home-client";
import { WORKFLOW_PRESETS } from "@/features/workflows/presets";

export const metadata: Metadata = generateSEOMetadata({
  title: "Tools, Apps & Connected Workflows",
  description:
    "Tools for everyday tasks, apps for deeper work, and local workflows that connect the steps. Upload once, process PDF, image, text and data files, and download the finished result.",
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
      <HomeClient popularTools={popularTools} featuredApps={featuredApps} workflowCount={WORKFLOW_PRESETS.length} featuredWorkflows={WORKFLOW_PRESETS.filter((workflow) => ["pdf-images-200kb", "image-email-pack", "files-verified"].includes(workflow.id)).map(({ id, name, description }) => ({ id, name, description }))} />
    </>
  );
}
