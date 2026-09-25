import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { AboutPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE_CONFIG.name} — our mission, team, and why we build free online tools for everyone.`,
};

export default function AboutPage() {
  return <AboutPageClient />;
}