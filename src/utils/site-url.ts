import { siteConfig } from "../config/site";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

/** SNS向けメタタグ用。本番では常に HTTPS の origin を返す */
export function getSiteOrigin(
  siteHref?: string | URL | null,
  buildSite?: string,
): string {
  const raw = siteHref?.toString() ?? buildSite ?? siteConfig.defaultSiteUrl;

  const url = new URL(raw.endsWith("/") ? raw : `${raw}/`);

  if (!LOCAL_HOSTS.has(url.hostname) && url.protocol === "http:") {
    url.protocol = "https:";
  }

  return url.origin;
}

export function toAbsoluteUrl(path: string, origin: string): string {
  return new URL(path, origin).href;
}
