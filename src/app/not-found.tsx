"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Home, Wrench, Search } from "lucide-react";

export default function NotFound() {
  const { t, localizePath } = useI18n();

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center min-h-[65vh]">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 ring-1 ring-primary/20">
        <Wrench className="h-10 w-10" />
      </div>

      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
        404 — {t("not_found_title", "Page Not Found")}
      </h1>

      <p className="text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
        {t("not_found_desc", "The page you are looking for doesn't exist or has been moved.")}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={localizePath("/")}>
          <Button size="lg" className="rounded-xl gap-2 font-medium">
            <Home className="h-4 w-4" />
            {t("not_found_btn", "Back to Home")}
          </Button>
        </Link>
        <Link href={localizePath("/tools")}>
          <Button variant="outline" size="lg" className="rounded-xl gap-2">
            <Search className="h-4 w-4" />
            {t("nav_tools", "Explore Tools")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
