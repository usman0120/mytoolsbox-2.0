import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { PrivacyPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Privacy Policy — MyToolsBox",
  description: `How ${SITE_CONFIG.name} handles data in local workflows, online AI apps and account services. Review processing requirements before submitting sensitive information.`,
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
