import type { Metadata } from "next";
import { ResourcesPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Resources - Guides, Templates & FAQs",
  description:
    "Free guides, templates, and frequently asked questions about our tools and services.",
};

export default function ResourcesPage() {
  return <ResourcesPageClient />;
}