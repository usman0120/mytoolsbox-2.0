import { Metadata } from "next";
import { Suspense } from "react";
import { SettingsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Settings - MyToolsBox",
  description: "Manage your account, history, and saved favorites.",
};

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}
