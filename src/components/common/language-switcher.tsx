"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useI18n, LOCALES, SUPPORTED_LOCALE_CODES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "navbar" | "footer" | "mobile";
  className?: string;
}

export function LanguageSwitcher({ variant = "navbar", className }: LanguageSwitcherProps) {
  const { locale, setLocale, config } = useI18n();

  const triggerClasses =
    variant === "navbar"
      ? cn(
          "inline-flex items-center justify-center h-8 px-2.5 rounded-xl text-xs font-medium gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none outline-none border border-transparent hover:border-border/40",
          className
        )
      : variant === "mobile"
      ? cn(
          "flex items-center justify-between w-full rounded-xl h-10 px-3 text-xs font-medium border border-border/60 hover:bg-muted text-foreground transition-colors cursor-pointer select-none outline-none",
          className
        )
      : cn(
          "inline-flex items-center justify-center h-8 px-2.5 rounded-xl text-xs font-medium gap-1.5 border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none outline-none",
          className
        );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClasses} aria-label="Select language">
        {variant === "navbar" ? (
          <>
            <span className="text-sm leading-none">{config.flag}</span>
            <span className="hidden lg:inline-block">{config.nativeName}</span>
            <Globe className="h-3.5 w-3.5 opacity-60" />
          </>
        ) : variant === "mobile" ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-base">{config.flag}</span>
              <span className="font-semibold text-foreground">{config.nativeName}</span>
              <span className="text-muted-foreground text-[11px]">({config.name})</span>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </>
        ) : (
          <>
            <Globe className="h-3.5 w-3.5" />
            <span className="text-sm leading-none">{config.flag}</span>
            <span>{config.nativeName}</span>
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={variant === "navbar" ? "end" : "start"}
        className="w-52 rounded-2xl p-1.5 shadow-xl border border-border/60 backdrop-blur-md bg-background/95 z-50"
      >
        <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Language / زبان منتخب کریں
        </div>

        {SUPPORTED_LOCALE_CODES.map((code) => {
          const loc = LOCALES[code];
          const isSelected = locale === code;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLocale(code)}
              className={cn(
                "flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none">{loc.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium leading-tight">{loc.nativeName}</span>
                  <span className="text-[10px] text-muted-foreground">{loc.name}</span>
                </div>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
