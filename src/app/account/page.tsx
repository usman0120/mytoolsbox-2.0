import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account — MyToolsBox",
  description: "Manage your MyToolsBox account, upgrade from guest, or view your subscription.",
};

export default function AccountPage() {
  return <AccountPageClient />;
}

// Must be a separate client component because we use useAuth
import { AccountPageClient } from "./page-client";