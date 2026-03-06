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
  return {
    title: `${cat.label} Games — Zappy`,
    description: `Play ${count} free ${cat.label.toLowerCase()} games online at Zappy.`,
  };
}

export default function CategoryPage({ params }: Props) {
  const cat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!cat) notFound();

  const games = getGamesByCategory(params.slug as CategorySlug);

  return <CategoryPageClient category={cat} games={games} />;
}
