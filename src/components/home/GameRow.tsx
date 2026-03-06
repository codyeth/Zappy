"use client";

import { useRef, useState, useEffect, useCallback, type ElementType } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/types";
import GameCard from "@/components/game-card/GameCard";

interface GameRowProps {
  title: string;
  /** Lucide icon component to show before title */
  icon?: ElementType;
  games: Game[];
  viewMoreHref?: string;
  onComingSoonClick: (title: string) => void;
}

const SCROLL_AMOUNT = 600;

export default function GameRow({
  title,
  icon: Icon,
  games,
  viewMoreHref,
  onComingSoonClick,
}: GameRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    // Re-check after fonts/images load
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  if (games.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[17px] font-bold text-gray-900">
          {Icon && <Icon size={18} className="text-red-500 shrink-0" />}
          {title}
        </h2>

        <div className="flex items-center gap-2">
          {viewMoreHref && (
            <Link
              href={viewMoreHref}
              className="mr-1 text-sm font-medium text-red-500 hover:text-red-600 hover:underline"
            >
              View more
            </Link>
          )}

          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
              canScrollLeft
                ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                : "border-gray-100 bg-gray-50 text-gray-300 cursor-default"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
              canScrollRight
                ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                : "border-gray-100 bg-gray-50 text-gray-300 cursor-default"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
      >
        {games.map((game) => (
          <div key={game.id} className="w-[180px] shrink-0">
            <GameCard game={game} onComingSoonClick={onComingSoonClick} />
          </div>
        ))}
      </div>
    </section>
  );
}
