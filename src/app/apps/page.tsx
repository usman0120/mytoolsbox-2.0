import type { Metadata } from "next";
import { AppsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Apps - Mini Applications & Utilities",
  description:
    "Collection of mini web applications for productivity, creativity, and daily tasks. All free and browser-based.",
};

export default function AppsPage() {
  return <AppsPageClient />;
}