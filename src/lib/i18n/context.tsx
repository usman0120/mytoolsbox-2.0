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

  // Initialize from URL, cookie, or storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check URL path prefix (e.g. /es/tools/pdf-merger or /ur)
    const pathname = window.location.pathname;
    const pathPrefix = pathname.split("/")[1];
    if (pathPrefix && isSupportedLocale(pathPrefix)) {
      setLocaleState(pathPrefix);
      return;
    }

    // 2. Check query parameter ?lang=es
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get("lang");
    if (langParam && isSupportedLocale(langParam)) {
      setLocaleState(langParam);
      return;
    }

    // 3. Check localStorage
    try {
      const saved = localStorage.getItem(LOCALE_COOKIE_KEY);
      if (saved && isSupportedLocale(saved)) {
        setLocaleState(saved);
        return;
      }
    } catch {
      // storage unavailable
    }

    // 4. Check cookie
    const cookies = document.cookie.split(";");
    for (const c of cookies) {
      const [name, val] = c.trim().split("=");
      if (name === LOCALE_COOKIE_KEY && val && isSupportedLocale(val)) {
        setLocaleState(val);
        return;
      }
    }
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
      document.cookie = `${LOCALE_COOKIE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }

    // Update browser URL smoothly without full reload
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const segments = pathname.split("/").filter(Boolean);
      const search = window.location.search;
      let newPath = pathname;

      if (segments.length > 0 && isSupportedLocale(segments[0])) {
        if (newLocale === DEFAULT_LOCALE) {
          newPath = "/" + segments.slice(1).join("/");
          if (newPath === "") newPath = "/";
        } else {
          newPath = `/${newLocale}/` + segments.slice(1).join("/");
        }
      } else if (newLocale !== DEFAULT_LOCALE) {
        newPath = `/${newLocale}${pathname === "/" ? "" : pathname}`;
      }

      window.history.replaceState({}, "", `${newPath}${search}`);
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
      const clean = path ? (path.startsWith("/") ? path : `/${path}`) : "/";
      if (locale === DEFAULT_LOCALE) return clean;
      const segments = clean.split("/").filter(Boolean);
      if (segments.length > 0 && isSupportedLocale(segments[0])) {
        return `/${locale}/${segments.slice(1).join("/")}`;
      }
      return `/${locale}${clean === "/" ? "" : clean}`;
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
