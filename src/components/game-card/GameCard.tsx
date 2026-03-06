"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game, BadgeType } from "@/lib/types";
import PlaceholderThumbnail from "./PlaceholderThumbnail";

const BADGE_CONFIG: Record<BadgeType, { label: string; className: string }> = {
  top: { label: "TOP", className: "bg-yellow-500" },
  hot: { label: "HOT", className: "bg-red-500" },
  new: { label: "NEW", className: "bg-green-500" },
  updated: { label: "UPDATED", className: "bg-blue-500" },
};

interface GameCardProps {
  game: Game;
  /** "default" = normal scrollable card, "hero-large" = hero left card, "hero-small" = hero grid card */
  variant?: "default" | "hero-large" | "hero-small";
  className?: string;
  onComingSoonClick?: (title: string) => void;
}

export default function GameCard({
  game,
  variant = "default",
  className,
  onComingSoonClick,
}: GameCardProps) {
  const isLarge = variant === "hero-large";
  const isSmall = variant === "hero-small";
  const isHero = isLarge || isSmall;

  const thumbnail = (
    <div
      className={cn("relative w-full overflow-hidden", isHero ? "flex-1 min-h-0" : undefined)}
      style={!isHero ? { aspectRatio: "16/10" } : undefined}
    >
      {/* Thumbnail: real image or gradient placeholder */}
      {game.thumbnailUrl ? (
        <Image
          src={game.thumbnailUrl}
          alt={game.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 240px"
        />
      ) : (
        <PlaceholderThumbnail
          title={game.title}
          gradient={game.thumbnailGradient}
          className="absolute inset-0"
        />
      )}

      {/* Badge */}
      {game.badge && (
        <span
          className={cn(
            "absolute top-2 left-2 z-10",
            "px-2 py-0.5 rounded-full",
            "text-[11px] font-bold text-white",
            BADGE_CONFIG[game.badge].className
          )}
        >
          {BADGE_CONFIG[game.badge].label}
        </span>
      )}

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100",
          game.isPlayable
            ? "bg-black/20 flex items-center justify-center"
            : "bg-black/30 flex items-center justify-center"
        )}
      >
        {game.isPlayable ? (
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <Play size={20} className="text-white fill-white ml-0.5" />
          </div>
        ) : (
          <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1.5 rounded-full">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );

  const title = (
    <div className="px-3 py-2">
      <p
        className={cn(
          "font-medium text-gray-800 truncate",
          isLarge ? "text-base" : "text-sm"
        )}
      >
        {game.title}
      </p>
      {isLarge && (
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {game.description}
        </p>
      )}
    </div>
  );

  const cardClass = cn(
    "group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden",
    "transition-all duration-200",
    game.isPlayable
      ? "hover:shadow-lg hover:scale-[1.03] cursor-pointer"
      : "hover:shadow-md cursor-pointer",
    isHero && "h-full flex flex-col",
    className
  );

  if (game.isPlayable) {
    return (
      <Link href={`/game/${game.slug}`} className={cardClass}>
        {thumbnail}
        {title}
      </Link>
    );
  }

  return (
    <button
      className={cn(cardClass, "text-left w-full")}
      onClick={() => onComingSoonClick?.(game.title)}
    >
      {thumbnail}
      {title}
    </button>
  );
}
