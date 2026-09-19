import type { Metadata } from "next";
import { HubsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Hubs - Curated Resource Collections",
  description:
    "Curated collections of tools, guides, and resources organized by profession and interest.",
};

export default function HubsPage() {
  return <HubsPageClient />;
}