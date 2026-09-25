import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { TermsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Terms of Service — MyToolsBox",
  description: `Terms and conditions for using ${SITE_CONFIG.name} — acceptable use, privacy-first processing, and transparent service terms.`,
};

export default function TermsPage() {
  return <TermsPageClient />;
}