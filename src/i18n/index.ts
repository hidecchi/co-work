import { en } from "./en";
import { ja } from "./ja";
import type { Lang, Translations } from "./types";

export type { Lang, Translations };

export const defaultLang: Lang = "ja";

const translations: Record<Lang, Translations> = { ja, en };

export function useTranslations(lang: Lang): Translations {
  return translations[lang];
}

export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split("/");
  return segment === "en" ? "en" : "ja";
}

export function getHomePath(lang: Lang): string {
  return lang === "en" ? "/en/" : "/";
}

export function getAlternateLang(lang: Lang): Lang {
  return lang === "ja" ? "en" : "ja";
}

export function getAlternatePath(lang: Lang): string {
  return getHomePath(getAlternateLang(lang));
}
