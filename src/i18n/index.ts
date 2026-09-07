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

export function getContactPath(lang: Lang): string {
  return lang === "en" ? "/en/contact/" : "/contact/";
}

export function getMediaPath(lang: Lang): string {
  return lang === "en" ? "/en/media/" : "/media/";
}

export function getMediaArticlePath(lang: Lang, slug: string): string {
  return `${getMediaPath(lang)}${slug}/`;
}

export function getAlternateLang(lang: Lang): Lang {
  return lang === "ja" ? "en" : "ja";
}

function stripLangPrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

export function getAlternatePath(lang: Lang, pathname = ""): string {
  const alt = getAlternateLang(lang);
  const path = stripLangPrefix(pathname);

  if (path.startsWith("/contact")) {
    return getContactPath(alt);
  }

  const mediaArticle = path.match(/^\/media\/([^/]+)\/?$/);
  if (mediaArticle?.[1]) {
    return getMediaArticlePath(alt, mediaArticle[1]);
  }

  if (path.startsWith("/media")) {
    return getMediaPath(alt);
  }

  return getHomePath(alt);
}
