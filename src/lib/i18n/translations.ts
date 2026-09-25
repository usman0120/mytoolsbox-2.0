import type { LocaleCode } from "./config";
import type { TranslationDictionary } from "./types";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { ur } from "./locales/ur";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { pt } from "./locales/pt";
import { hi } from "./locales/hi";
import { ar } from "./locales/ar";
import { LOCALIZED_TOOL_NAMES } from "./locales/tool-names";

export type { TranslationDictionary };
export { LOCALIZED_TOOL_NAMES };

export const TRANSLATIONS: Record<LocaleCode, TranslationDictionary> = {
  en,
  es,
  ur,
  fr,
  de,
  pt,
  hi,
  ar,
};
