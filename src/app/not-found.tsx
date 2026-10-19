"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { Home, Wrench, Search } from "lucide-react";

export default function NotFound() {
  const { t, localizePath } = useI18n();

  return (
    <PageShell className="max-w-3xl">
      <ToolHeader icon={<Wrench className="h-5 w-5" />} title={`404: ${t("not_found_title", "Page Not Found")}`} description={t("not_found_desc", "The page you are looking for doesn't exist or has been moved.")} />

      <div className="flex flex-wrap items-center gap-3">
        <Link href={localizePath("/")} className={buttonVariants()}>
            <Home className="h-4 w-4" />
            {t("not_found_btn", "Back to Home")}
        </Link>
        <Link href={localizePath("/tools")} className={buttonVariants({ variant: "outline" })}>
            <Search className="h-4 w-4" />
            {t("nav_tools", "Explore Tools")}
        </Link>
      </div>
    </PageShell>
  );
}
