import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "../i18n";

export type MediaPost = CollectionEntry<"media">;

export function mediaSlug(id: string): string {
  return id.split("/").pop() ?? id;
}

export function formatMediaDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export async function getMediaPosts(lang: Lang): Promise<MediaPost[]> {
  const posts = await getCollection("media", ({ data }) => {
    if (data.lang !== lang) return false;
    if (import.meta.env.PROD && data.draft) return false;
    return true;
  });

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}
