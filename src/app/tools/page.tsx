import { Metadata } from "next";
import { Suspense } from "react";
import { ToolsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse all free online tools - PDF, images, developer tools, calculators, and writing utilities.",
};

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading tools...</div>}>
      <ToolsPageClient />
    </Suspense>
  );
}