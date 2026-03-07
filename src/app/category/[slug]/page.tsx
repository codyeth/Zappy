import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES } from "@/data/categories";
import { getGamesByCategory } from "@/data/games";
import type { CategorySlug } from "@/lib/types";
import CategoryPageClient from "./CategoryPageClient";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!cat) return {};
  const count = getGamesByCategory(params.slug as CategorySlug).length;
  const baseUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://zappy.games").replace(/\/$/, "") +
    (process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  const url = `${baseUrl}/category/${params.slug}`;
  const title = `${cat.label} Games — Zappy`;
  const description = `Play ${count} free ${cat.label.toLowerCase()} games online at Zappy.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Zappy",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

export default function CategoryPage({ params }: Props) {
  const cat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  const games = getGamesByCategory(params.slug as CategorySlug);

  return <CategoryPageClient category={cat} games={games} />;
}
