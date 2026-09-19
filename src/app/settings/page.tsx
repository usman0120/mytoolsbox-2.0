import { Metadata } from "next";
import { SettingsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Settings - MyToolsBox",
  description: "Manage your account settings, preferences, and profile.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}