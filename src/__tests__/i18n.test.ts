import { describe, it, expect } from "vitest";
import {
  LOCALES,
  SUPPORTED_LOCALE_CODES,
  DEFAULT_LOCALE,
  isSupportedLocale,
} from "@/lib/i18n/config";
import {
  TRANSLATIONS,
  LOCALIZED_TOOL_NAMES,
} from "@/lib/i18n/translations";

describe("i18n Multi-Language System", () => {
  it("supports exactly 8 high-demand global SEO languages", () => {
    expect(SUPPORTED_LOCALE_CODES).toHaveLength(8);
    expect(SUPPORTED_LOCALE_CODES).toEqual(["en", "es", "ur", "fr", "de", "pt", "hi", "ar"]);
  });

  it("has English as the default locale", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("properly flags RTL languages for Urdu and Arabic", () => {
    expect(LOCALES.ur.dir).toBe("rtl");
    expect(LOCALES.ar.dir).toBe("rtl");

    expect(LOCALES.en.dir).toBe("ltr");
    expect(LOCALES.es.dir).toBe("ltr");
    expect(LOCALES.fr.dir).toBe("ltr");
    expect(LOCALES.de.dir).toBe("ltr");
    expect(LOCALES.pt.dir).toBe("ltr");
    expect(LOCALES.hi.dir).toBe("ltr");
  });

  it("verifies isSupportedLocale correctly validates inputs", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("es")).toBe(true);
    expect(isSupportedLocale("ur")).toBe(true);
    expect(isSupportedLocale("ar")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(true);
    expect(isSupportedLocale("de")).toBe(true);
    expect(isSupportedLocale("pt")).toBe(true);
    expect(isSupportedLocale("hi")).toBe(true);
    expect(isSupportedLocale("xyz")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });

  it("provides comprehensive translations for all 8 languages", () => {
    for (const code of SUPPORTED_LOCALE_CODES) {
      const dict = TRANSLATIONS[code];
      expect(dict).toBeDefined();
      expect(dict.nav_tools).toBeTruthy();
      expect(dict.nav_apps).toBeTruthy();
      expect(dict.nav_ai).toBeTruthy();
      expect(dict.hero_title).toBeTruthy();
      expect(dict.hero_tag).toBeTruthy();
      expect(dict.badge_client_side).toBeTruthy();
      expect(dict.how_to_use_title).toBeTruthy();
      expect(dict.privacy_title).toBeTruthy();
      expect(dict.faq_title).toBeTruthy();
      expect(dict.audience_title).toBeTruthy();
      expect(dict.ai_suite_title).toBeTruthy();
      expect(dict.feature_privacy_title).toBeTruthy();
      expect(dict.feature_privacy_desc).toBeTruthy();
      expect(dict.use_cases_title).toBeTruthy();
      expect(dict.spec_specs_title).toBeTruthy();
      expect(dict.engine_loading).toBeTruthy();
      expect(dict.account_title).toBeTruthy();
      expect(dict.dash_welcome).toBeTruthy();
      expect(dict.resources_title).toBeTruthy();
      expect(dict.ai_subnav_title).toBeTruthy();
      expect(dict.status_offline).toBeTruthy();
      expect(dict.privacy_page_title).toBeTruthy();
      expect(dict.terms_page_title).toBeTruthy();
      expect(dict.not_found_title).toBeTruthy();
    }
  });

  it("contains high-intent localized tool names", () => {
    const popularSlugs = [
      "pdf-merger",
      "image-compressor",
      "json-formatter",
      "qr-generator",
      "word-counter",
      "percentage-calculator",
    ];

    for (const slug of popularSlugs) {
      const toolMap = LOCALIZED_TOOL_NAMES[slug];
      expect(toolMap).toBeDefined();
      for (const code of SUPPORTED_LOCALE_CODES) {
        expect(toolMap[code]).toBeTruthy();
      }
    }

    // Explicit check for requested languages: Spanish, English, Urdu
    expect(LOCALIZED_TOOL_NAMES["pdf-merger"]["es"]).toBe("Unir PDF");
    expect(LOCALIZED_TOOL_NAMES["pdf-merger"]["en"]).toBe("PDF Merger");
    expect(LOCALIZED_TOOL_NAMES["pdf-merger"]["ur"]).toBe("پی ڈی ایف جوڑیں");
    expect(LOCALIZED_TOOL_NAMES["image-compressor"]["es"]).toBe("Comprimir Imagen");
    expect(LOCALIZED_TOOL_NAMES["image-compressor"]["ur"]).toBe("تصویر کا سائز کم کریں");
  });
});
