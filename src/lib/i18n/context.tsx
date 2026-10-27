"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  type LocaleCode,
  type LocaleConfig,
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  isSupportedLocale,
} from "./config";
import {
  TRANSLATIONS,
  type TranslationDictionary,
  LOCALIZED_TOOL_NAMES,
} from "./translations";
import { localePath } from "./locale-path";

interface I18nContextType {
  locale: LocaleCode;
  dir: "ltr" | "rtl";
  config: LocaleConfig;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  setLocale: (newLocale: LocaleCode) => void;
  getToolName: (slug: string, defaultName: string) => string;
  getCategoryName: (categoryId: string, defaultName: string) => string;
  localizePath: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  // Initialize once, then follow browser back/forward without remounting inputs.
  useEffect(() => {
    let active = true;
    const initialLocale = () => {
      const prefix = window.location.pathname.split("/")[1];
      if (isSupportedLocale(prefix)) return prefix;
      const query = new URLSearchParams(window.location.search).get("lang");
      if (query && isSupportedLocale(query)) return query;
      try { const saved = localStorage.getItem(LOCALE_COOKIE_KEY); if (saved && isSupportedLocale(saved)) return saved; } catch { /* Storage may be blocked. */ }
      const cookie = document.cookie.split(";").find((item) => item.trim().startsWith(`${LOCALE_COOKIE_KEY}=`))?.split("=")[1];
      return cookie && isSupportedLocale(cookie) ? cookie : DEFAULT_LOCALE;
    };
    queueMicrotask(() => { if (active) setLocaleState(initialLocale()); });
    const onNavigation = () => { const prefix = window.location.pathname.split("/")[1]; setLocaleState(isSupportedLocale(prefix) ? prefix : DEFAULT_LOCALE); };
    window.addEventListener("popstate", onNavigation);
    return () => { active = false; window.removeEventListener("popstate", onNavigation); };
  }, []);

  // Sync html lang and dir attributes whenever locale changes
  useEffect(() => {
    if (typeof document === "undefined") return;
    const config = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
    document.documentElement.lang = config.hreflang;
    document.documentElement.dir = config.dir;

    if (config.dir === "rtl") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: LocaleCode) => {
    if (!isSupportedLocale(newLocale)) return;
    setLocaleState(newLocale);

    try {
      localStorage.setItem(LOCALE_COOKIE_KEY, newLocale);
    } catch {
      // ignore
    }
    document.cookie = `${LOCALE_COOKIE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Update browser URL smoothly without full reload
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", localePath(window.location.pathname + window.location.search + window.location.hash, newLocale));
    }
  }, []);

  const t = useCallback(
    (key: keyof TranslationDictionary, fallback?: string): string => {
      const dict = TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
      const val = dict[key];
      if (val) return val;
      return fallback || TRANSLATIONS[DEFAULT_LOCALE][key] || key;
    },
    [locale]
  );

  const getToolName = useCallback(
    (slug: string, defaultName: string): string => {
      const localized = LOCALIZED_TOOL_NAMES[slug];
      if (localized && localized[locale]) {
        return localized[locale];
      }
      return defaultName;
    },
    [locale]
  );

  const getCategoryName = useCallback(
    (categoryId: string, defaultName: string): string => {
      const key = `cat_${categoryId}` as keyof TranslationDictionary;
      const dict = TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
      if (dict && dict[key]) {
        return dict[key];
      }
      return defaultName;
    },
    [locale]
  );

  const localizePath = useCallback(
    (path: string): string => {
      return localePath(path, locale);
    },
    [locale]
  );

  const currentConfig = useMemo(() => LOCALES[locale] || LOCALES[DEFAULT_LOCALE], [locale]);

  const contextValue = useMemo(
    () => ({
      locale,
      dir: currentConfig.dir,
      config: currentConfig,
      t,
      setLocale,
      getToolName,
      getCategoryName,
      localizePath,
    }),
    [locale, currentConfig, t, setLocale, getToolName, getCategoryName, localizePath]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      dir: "ltr",
      config: LOCALES[DEFAULT_LOCALE],
      t: (key, fallback) => fallback || TRANSLATIONS[DEFAULT_LOCALE][key] || key,
      setLocale: () => {},
      getToolName: (_, name) => name,
      getCategoryName: (_, name) => name,
      localizePath: (path) => path,
    };
  }
  return ctx;
}
