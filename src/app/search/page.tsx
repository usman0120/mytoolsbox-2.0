import { Metadata } from "next";
import { SearchPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Search - MyToolsBox",
  description: "Search across all tools and apps on MyToolsBox.",
};

export default function SearchPage() {
  return <SearchPageClient />;
}