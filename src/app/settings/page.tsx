import { Metadata } from "next";
import { Suspense } from "react";
import { SettingsPageClient } from "./page-client";
import { PageSkeleton } from "@/components/common/loading-skeleton";

export const metadata: Metadata = {
  title: "Settings - MyToolsBox",
  description: "Manage your account, history, and saved favorites.",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton label="Loading settings" />}>
      <SettingsPageClient />
    </Suspense>
  );
}
