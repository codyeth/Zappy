import type { MetadataRoute } from "next";
import { REAL_GAMES } from "@/data/games";
import { CATEGORIES } from "@/data/categories";

const BASE =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://zappy.games").replace(/\/$/, "") +
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  ];

  const gamePages: MetadataRoute.Sitemap = REAL_GAMES.map((g) => ({
    url: `${BASE}/game/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...gamePages, ...categoryPages];
}
