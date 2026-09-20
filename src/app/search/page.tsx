import { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Search - MyToolsBox",
  description: "Search across all tools and apps on MyToolsBox.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10">Loading search...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}