import { Metadata } from "next";
import { HistoryPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "History - MyToolsBox",
  description: "Your tool usage history on MyToolsBox.",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}