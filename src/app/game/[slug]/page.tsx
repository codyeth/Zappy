import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGameBySlug, REAL_GAMES } from "@/data/games";
import { CATEGORIES } from "@/data/categories";
import GamePageClient from "@/components/game/GamePageClient";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return REAL_GAMES.map((g) => ({ slug: g.slug }));
}

const BASE =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://zappy.games").replace(/\/$/, "") +
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = getGameBySlug(params.slug);
  if (!game) return {};

  const url = `${BASE}/game/${game.slug}`;

  return {
    title: `${game.title} — Zappy`,
    description: game.description,
    openGraph: {
      title: `${game.title} — Play Free Online`,
      description: game.description,
      url,
      type: "website",
      siteName: "Zappy",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} — Zappy`,
      description: game.description,
    },
    alternates: { canonical: url },
  };
}

// JSON-LD VideoGame + BreadcrumbList
function JsonLd({ game }: { game: NonNullable<ReturnType<typeof getGameBySlug>> }) {
  const gameUrl = `${BASE}/game/${game.slug}`;
  const catLabel = CATEGORIES.find((c) => c.slug === game.category)?.label ?? game.category;
  const videoGame = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    genre: game.category,
    url: gameUrl,
    applicationCategory: "GameApplication",
    operatingSystem: "Web Browser",
    ...(game.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: game.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: game.playCount,
      },
    }),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: catLabel, item: `${BASE}/category/${game.category}` },
      { "@type": "ListItem", position: 3, name: game.title, item: gameUrl },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoGame) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

export default function GamePage({ params }: Props) {
  const game = getGameBySlug(params.slug);
  if (!game) notFound();

  return (
    <>
      <JsonLd game={game} />
      <GamePageClient game={game} />
    </>
  );
}
