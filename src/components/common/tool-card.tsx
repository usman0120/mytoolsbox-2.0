"use client";

import Link from "next/link";
import { ToolDefinition } from "@/types";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const { t, getToolName, localizePath } = useI18n();
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] || Icons.Wrench;
  const displayName = getToolName(tool.slug, tool.name);
  const href = localizePath(`/${tool.productType}s/${tool.slug}`);

  return (
    <Link href={href} className="block group h-full">
      <div
        className={cn(
          "h-full p-4 sm:p-5 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between",
          className
        )}
      >
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
              <IconComponent className="h-4.5 w-4.5" />
            </div>
            <div className="flex gap-1.5 shrink-0">
              {tool.status === "beta" && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                  {t("badge_beta")}
                </span>
              )}
              {tool.status === "coming-soon" && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/60">
                  {t("badge_soon")}
                </span>
              )}
            </div>
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors wrap-break-word">
            {displayName}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
            {tool.shortDescription}
          </p>
        </div>
        {tool.requiresAuth && (
          <div className="mt-3 pt-2.5 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground font-medium">
              {t("badge_account_required")}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}