"use client";

import {
  TrendingUp,
  Sparkles,
  Flame,
  PuzzleIcon,
  Sword,
  Gamepad2,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import HeroSection from "@/components/home/HeroSection";
import GameRow from "@/components/home/GameRow";
import { useToast } from "@/components/ui/Toast";
import {
  ALL_GAMES,
  REAL_GAMES,
  PLACEHOLDER_GAMES,
  getFeaturedGames,
} from "@/data/games";

// ─── Static data (computed once at module level) ───────────────────────────────

/** 1 big card + 6 grid cards for the hero section */
const heroGames = getFeaturedGames(7);

/** Hot & top picks across all games */
const featuredGames = [
  ...REAL_GAMES,
  ...PLACEHOLDER_GAMES.filter((g) => g.badge === "hot" || g.badge === "top"),
].slice(0, 16);

/** All games with "new" badge */
const newGames = ALL_GAMES.filter((g) => g.badge === "new").slice(0, 16);

/** All games sorted by playCount descending */
const popularGames = [...ALL_GAMES]
  .sort((a, b) => b.playCount - a.playCount)
  .slice(0, 16);

const puzzleGames = ALL_GAMES.filter((g) => g.category === "puzzle");
const actionGames = ALL_GAMES.filter((g) => g.category === "action");
const casualGames = ALL_GAMES.filter((g) => g.category === "casual");

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { showToast, ToastContainer } = useToast();

  const handleComingSoon = (title: string) => {
    showToast(`${title} — Coming soon!`);
  };

  return (
    <AppLayout>
      <ToastContainer />

      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Featured Hero */}
        <HeroSection games={heroGames} onComingSoonClick={handleComingSoon} />

        {/* Featured row */}
        <GameRow
          title="Featured"
          icon={Flame}
          games={featuredGames}
          viewMoreHref="/popular"
          onComingSoonClick={handleComingSoon}
        />

        {/* New Games row */}
        <GameRow
          title="New Games"
          icon={Sparkles}
          games={newGames}
          viewMoreHref="/new"
          onComingSoonClick={handleComingSoon}
        />

        {/* Most Popular row */}
        <GameRow
          title="Most Popular"
          icon={TrendingUp}
          games={popularGames}
          viewMoreHref="/popular"
          onComingSoonClick={handleComingSoon}
        />

        {/* Puzzle row */}
        <GameRow
          title="Puzzle"
          icon={PuzzleIcon}
          games={puzzleGames}
          viewMoreHref="/category/puzzle"
          onComingSoonClick={handleComingSoon}
        />

        {/* Action row */}
        <GameRow
          title="Action"
          icon={Sword}
          games={actionGames}
          viewMoreHref="/category/action"
          onComingSoonClick={handleComingSoon}
        />

        {/* Casual row */}
        <GameRow
          title="Casual"
          icon={Gamepad2}
          games={casualGames}
          viewMoreHref="/category/casual"
          onComingSoonClick={handleComingSoon}
        />
      </div>
    </AppLayout>
  );
}
