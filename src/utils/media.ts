import { type CollectionEntry, getCollection } from "astro:content";
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

export function formatMediaListDateParts(date: Date): {
  year: string;
  monthDay: string;
} {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { year, monthDay: `${month}.${day}` };
}

export function formatMediaListDate(date: Date): string {
  const { year, monthDay } = formatMediaListDateParts(date);
  return `${year}.${monthDay}`;
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
