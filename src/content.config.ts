import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const media = defineCollection({
  loader: glob({ base: "./src/content/media", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lang: z.enum(["ja", "en"]),
    keywords: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    badge: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { media };
