"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import GameCard from "@/components/game-card/GameCard";
import { useToast } from "@/components/ui/Toast";
import type { Category, Game } from "@/lib/types";

type SortKey = "popular" | "new" | "top" | "az";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most Played" },
  { key: "new",     label: "Newest" },
  { key: "top",     label: "Top Rated" },
  { key: "az",      label: "A – Z" },
];

interface Props {
  category: Category;
  games: Game[];
}

export default function CategoryPageClient({ category, games }: Props) {
  const [sort, setSort] = useState<SortKey>("popular");
  const [showPlayable, setShowPlayable] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const sorted = useMemo(() => {
    const list = showPlayable ? games.filter((g) => g.isPlayable) : [...games];
    switch (sort) {
      case "popular": list.sort((a, b) => b.playCount - a.playCount);   break;
      case "new":     list.sort((a, b) => {
        // Real games (isPlayable) come first as "newest"
        if (a.isPlayable !== b.isPlayable) return a.isPlayable ? -1 : 1;
        return 0;
      }); break;
      case "top":     list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "az":      list.sort((a, b) => a.title.localeCompare(b.title));     break;
    }
    return list;
  }, [games, sort, showPlayable]);

  const playableCount = games.filter((g) => g.isPlayable).length;

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-500 transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="font-medium text-gray-900">{category.label} Games</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{category.label} Games</h1>
            <p className="text-sm text-gray-500">
              {games.length} games
              {playableCount > 0 && ` · ${playableCount} playable now`}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Playable filter */}
            <button
              onClick={() => setShowPlayable((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                showPlayable
                  ? "bg-red-500 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Playable only
            </button>

            {/* Sort */}
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    sort === key
                      ? "bg-red-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {sorted.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onComingSoonClick={(title) =>
                  showToast(`${title} — coming soon!`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50">
            <p className="font-semibold text-gray-400">No games found</p>
            <button
              onClick={() => setShowPlayable(false)}
              className="text-sm text-red-500 hover:underline"
            >
              Show all games
            </button>
          </div>
        )}

      </div>
      <ToastContainer />
    </AppLayout>
  );
}
