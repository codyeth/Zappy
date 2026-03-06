"use client";

import type { Game } from "@/lib/types";
import GameCard from "@/components/game-card/GameCard";

interface HeroSectionProps {
  /** First game = big left card. Games 2-7 = 3×2 right grid. */
  games: Game[];
  onComingSoonClick: (title: string) => void;
}

export default function HeroSection({ games, onComingSoonClick }: HeroSectionProps) {
  const [bigCard, ...rest] = games;
  const gridCards = rest.slice(0, 6);

  return (
    <>
      {/* ── Desktop / tablet: big card + 3×2 grid ─────────────────────── */}
      <div className="hidden md:flex gap-3 h-[360px]">
        {/* Left: big card (40%) */}
        <div className="w-[40%] shrink-0 h-full">
          {bigCard && (
            <GameCard
              game={bigCard}
              variant="hero-large"
              onComingSoonClick={onComingSoonClick}
            />
          )}
        </div>

        {/* Right: 3×2 grid (60%) */}
        <div className="flex-1 h-full grid grid-cols-3 grid-rows-2 gap-3">
          {gridCards.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              variant="hero-small"
              onComingSoonClick={onComingSoonClick}
            />
          ))}
        </div>
      </div>

      {/* ── Mobile: 2-column grid of top 4 ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {games.slice(0, 4).map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onComingSoonClick={onComingSoonClick}
          />
        ))}
      </div>
    </>
  );
}
