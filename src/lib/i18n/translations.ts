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

export const VIEW_MODE_LABELS: Record<LocaleCode, { grid: string; list: string }> = {
  en: { grid: "Grid view", list: "List view" },
  es: { grid: "Vista de cuadrícula", list: "Vista de lista" },
  ur: { grid: "گرڈ منظر", list: "فہرست منظر" },
  fr: { grid: "Vue en grille", list: "Vue en liste" },
  de: { grid: "Rasteransicht", list: "Listenansicht" },
  pt: { grid: "Visualização em grade", list: "Visualização em lista" },
  hi: { grid: "ग्रिड दृश्य", list: "सूची दृश्य" },
  ar: { grid: "عرض الشبكة", list: "عرض القائمة" },
};

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
