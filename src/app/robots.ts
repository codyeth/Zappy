import type { MetadataRoute } from "next";

const BASE =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://zappy.games").replace(/\/$/, "") +
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/profile/", "/auth/"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
