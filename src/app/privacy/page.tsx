import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { PrivacyPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Privacy Policy — MyToolsBox",
  description: `How ${SITE_CONFIG.name} handles your data — our commitment to client-side privacy, zero server uploads, and data protection.`,
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}