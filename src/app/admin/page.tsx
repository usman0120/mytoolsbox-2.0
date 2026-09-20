import { Metadata } from "next";
import { AdminPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Admin Dashboard - MyToolsBox",
  description: "Admin dashboard for MyToolsBox management.",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return <AdminPageClient />;
}