// ---------------------------------------------------------------------------
// Supported High-Demand Global SEO Locales
// ---------------------------------------------------------------------------

export type LocaleCode = "en" | "es" | "ur" | "fr" | "de" | "pt" | "hi" | "ar";

export interface LocaleConfig {
  code: LocaleCode;
  hreflang: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
  localeString: string; // for OpenGraph / Intl
}

export const DEFAULT_LOCALE: LocaleCode = "en";

export const LOCALES: Record<LocaleCode, LocaleConfig> = {
  en: {
    code: "en",
    hreflang: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    dir: "ltr",
    localeString: "en_US",
  },
  es: {
    code: "es",
    hreflang: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    dir: "ltr",
    localeString: "es_ES",
  },
  ur: {
    code: "ur",
    hreflang: "ur",
    name: "Urdu",
    nativeName: "اردو",
    flag: "🇵🇰",
    dir: "rtl",
    localeString: "ur_PK",
  },
  fr: {
    code: "fr",
    hreflang: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
    localeString: "fr_FR",
  },
  de: {
    code: "de",
    hreflang: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    dir: "ltr",
    localeString: "de_DE",
  },
  pt: {
    code: "pt",
    hreflang: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    dir: "ltr",
    localeString: "pt_BR",
  },
  hi: {
    code: "hi",
    hreflang: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    dir: "ltr",
    localeString: "hi_IN",
  },
  ar: {
    code: "ar",
    hreflang: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
    localeString: "ar_SA",
  },
};

export const SUPPORTED_LOCALE_CODES: LocaleCode[] = Object.keys(LOCALES) as LocaleCode[];

export const LOCALE_COOKIE_KEY = "mytoolsbox_locale";

export function isSupportedLocale(code: string): code is LocaleCode {
  return SUPPORTED_LOCALE_CODES.includes(code as LocaleCode);
}
