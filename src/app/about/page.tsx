import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { AboutPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE_CONFIG.name}: focused tools, dedicated apps and private local workflows that connect the steps of everyday work.`,
};

export default function AboutPage() {
  return <AboutPageClient />;
}
