import { Metadata } from "next";
import { DashboardPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Dashboard - MyToolsBox",
  description: "Your MyToolsBox dashboard.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}