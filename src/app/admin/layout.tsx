import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const accessError = await checkAdminAccess({ headers: { get: () => null } }, await cookies());
  if (accessError === 401) redirect("/?signin=true&next=%2Fadmin");
  if (accessError === 403) redirect("/access-denied");
  if (accessError === 503) throw new Error("Admin authentication verification is temporarily unavailable.");
  return children;
}
