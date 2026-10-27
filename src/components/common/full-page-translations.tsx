"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { PageTranslator, type TextCatalog } from "@/lib/i18n/page-translator";

const cache = new Map<string, { translations: TextCatalog; complete: boolean }>();
export function FullPageTranslations() {
  const { locale } = useI18n();
  const [status, setStatus] = useState<{ locale: string; complete: boolean } | null>(null);
  useEffect(() => {
    if (locale === "en") { document.documentElement.dataset.translationStatus = "ready"; return; }
    let active = true;
    let translator: PageTranslator | undefined;
    const controller = new AbortController();
    document.documentElement.dataset.translationStatus = "loading";
    const fallback: TextCatalog = {};
    for (const [key, source] of Object.entries(TRANSLATIONS.en)) {
      const text = TRANSLATIONS[locale][key as keyof typeof TRANSLATIONS.en];
      if (typeof source === "string" && typeof text === "string") fallback[source.replace(/\s+/g, " ").trim()] = text;
    }
    const nativeLabels = new Set(Object.entries(TRANSLATIONS[locale]).filter(([key, text]) => text !== TRANSLATIONS.en[key as keyof typeof TRANSLATIONS.en]).map(([, text]) => text.replace(/\s+/g, " ").trim()));
    const apply = (translations: TextCatalog, complete: boolean) => {
      if (!active) return;
      const catalog: TextCatalog = { ...fallback, ...translations };
      for (const source of nativeLabels) delete catalog[source];
      translator = new PageTranslator(document.body, catalog);
      document.documentElement.dataset.translationStatus = complete ? "ready" : "partial";
      setStatus({ locale, complete });
    };
    const existing = cache.get(locale);
    if (existing) queueMicrotask(() => apply(existing.translations, existing.complete));
    else void fetch(`/i18n/${locale}.json`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Translation catalog unavailable");
      const data = await response.json();
      const translations = data.translations ?? data;
      if (!translations || typeof translations !== "object" || Object.values(translations).some((text) => typeof text !== "string")) throw new Error("Invalid catalog");
      const complete = data.coverage?.missing === 0;
      // A partial catalog may still be generating. Don't pin it in memory and
      // prevent a subsequent language switch from loading completed coverage.
      if (complete) cache.set(locale, { translations, complete });
      apply(translations, complete);
    }).catch(() => { if (active) apply({}, false); });
    return () => { active = false; controller.abort(); translator?.dispose(); };
  }, [locale]);
  if (locale === "en" || status?.locale !== locale || status.complete) return null;
  return <p role="status" className="border-b bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">Some page text is not yet available in this language. English is shown for missing translations.</p>;
}
