import { isSupportedLocale, type LocaleCode } from "./config";

export function localePath(path: string, locale: LocaleCode): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, "https://mytoolsbox.invalid");
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments[0] && isSupportedLocale(segments[0])) segments.shift();
  url.searchParams.delete("lang");
  const base = segments.length ? `/${segments.join("/")}` : "";
  return (locale === "en" ? base || "/" : `/${locale}${base}`) + url.search + url.hash;
}
