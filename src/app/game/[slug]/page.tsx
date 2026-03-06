import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGameBySlug, REAL_GAMES } from "@/data/games";
import GamePageClient from "@/components/game/GamePageClient";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return REAL_GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = getGameBySlug(params.slug);
  if (!game) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zappy.games";
  const url = `${baseUrl}/game/${game.slug}`;

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

// JSON-LD VideoGame schema
function JsonLd({ game }: { game: NonNullable<ReturnType<typeof getGameBySlug>> }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zappy.games";
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    genre: game.category,
    url: `${baseUrl}/game/${game.slug}`,
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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
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
