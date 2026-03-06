"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RefreshCw,
  Maximize,
  Minimize,
  Heart,
  Share2,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import GameCard from "@/components/game-card/GameCard";
import Leaderboard from "./Leaderboard";
import Confetti from "./Confetti";
import type { Game } from "@/lib/types";
import type { GameCallbacks } from "@/lib/game-engine/types";
import type { GameComponentType } from "./types";
import { ALL_GAMES } from "@/data/games";

// ── Game component registry ───────────────────────────────────────────────────
const GAME_LOADERS: Record<string, () => Promise<{ default: GameComponentType }>> = {
  "gold-miner":  () => import("@/games/gold-miner"),
  "puzzle-2048": () => import("@/games/puzzle-2048"),
  "tetris":      () => import("@/games/tetris"),
  "flappy-zap":  () => import("@/games/flappy-zap"),
  "minesweeper": () => import("@/games/minesweeper"),
};

// ── Coming Soon view ──────────────────────────────────────────────────────────

function ComingSoonView({ game }: { game: Game }) {
  const playable = ALL_GAMES.filter((g) => g.isPlayable && g.id !== game.id).slice(0, 4);

  return (
    <AppLayout>
      <div className="mx-auto max-w-[680px] space-y-6 py-8 text-center">
        <div
          className="mx-auto flex h-48 w-full max-w-[400px] items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-lg"
          style={{ background: game.thumbnailGradient }}
        >
          {game.title}
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{game.title}</h1>
          <p className="mt-1.5 text-sm text-gray-500">{game.description}</p>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-5">
          <p className="text-lg font-bold text-red-500">Coming Soon</p>
          <p className="mt-1 text-sm text-gray-500">This game is under development. Check back soon!</p>
        </div>

        {playable.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-500">Browse other games</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {playable.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 font-bold text-white transition-colors hover:bg-red-600"
            >
              Browse all games
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const ICON_BTN = "flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-red-200 hover:text-red-500";

export default function GamePageClient({ game }: { game: Game }) {
  const [GameComponent, setGameComponent] = useState<GameComponentType | null>(null);
  const [score, setScore]               = useState(0);
  const [level, setLevel]               = useState(1);
  const [isPaused, setIsPaused]         = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStatus, setGameStatus]     = useState<"loading" | "playing" | "over">("loading");
  const [tab, setTab]                   = useState<"about" | "leaderboard" | "comments">("about");
  const [liked, setLiked]               = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [myBest, setMyBest]             = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const lastFinalScore                  = useRef(0);
  const canvasWrapRef                   = useRef<HTMLDivElement>(null);

  // Load best from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`zappy-best-${game.slug}`);
    if (stored) setMyBest(parseInt(stored, 10));
  }, [game.slug]);

  // New high score → confetti
  useEffect(() => {
    if (gameStatus !== "over") return;
    const fs = lastFinalScore.current;
    if (fs <= 0) return;
    const prev = parseInt(localStorage.getItem(`zappy-best-${game.slug}`) ?? "0", 10);
    if (fs > prev) {
      localStorage.setItem(`zappy-best-${game.slug}`, String(fs));
      setMyBest(fs);
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  // Stable callbacks
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callbacks = useMemo<GameCallbacks>(() => ({
    onScoreUpdate: (s) => setScore(s),
    onGameStart:   ()  => { setScore(0); setLevel(1); setGameStatus("playing"); },
    onGameOver:    (fs) => { lastFinalScore.current = fs; setGameStatus("over"); },
    onLevelUp:     (l) => setLevel(l),
  }), []);

  // Dynamic game import
  useEffect(() => {
    const loader = GAME_LOADERS[game.slug];
    if (loader) loader().then((mod) => setGameComponent(() => mod.default));
  }, [game.slug]);

  // Fullscreen change
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const handleFullscreen = () => {
    const el = canvasWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: game.title, url });
      else await navigator.clipboard.writeText(url);
    } catch { /* cancelled */ }
  };

  // Non-playable → Coming Soon
  if (!game.isPlayable) return <ComingSoonView game={game} />;

  // Related games for sidebar
  const related = (() => {
    const sameCategory = ALL_GAMES.filter(
      (g) => g.isPlayable && g.category === game.category && g.id !== game.id
    );
    const others = ALL_GAMES.filter(
      (g) => g.isPlayable && g.category !== game.category && g.id !== game.id
    );
    return [...sameCategory, ...others].slice(0, 6);
  })();

  return (
    <AppLayout>
      {showConfetti && <Confetti />}

      <div className="mx-auto max-w-[1240px] space-y-3">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          <Link href="/" className="transition-colors hover:text-red-500">Home</Link>
          <ChevronRight size={12} />
          <Link href={`/category/${game.category}`} className="capitalize transition-colors hover:text-red-500">
            {game.category}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate font-medium text-gray-600">{game.title}</span>
        </nav>

        {/* Main layout */}
        <div className="flex items-start gap-5">

          {/* Left: toolbar + canvas + tabs */}
          <div className="min-w-0 flex-1 space-y-3">

            {/* Toolbar */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
              <Link href="/" className="flex shrink-0 items-center text-gray-400 transition-colors hover:text-gray-600">
                <ChevronLeft size={18} />
              </Link>

              <h1 className="flex-1 truncate font-bold text-gray-900">{game.title}</h1>

              {gameStatus === "playing" && level > 1 && (
                <span className="shrink-0 rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-500">
                  LV {level}
                </span>
              )}
              <span className="min-w-[64px] shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-center text-sm font-semibold text-gray-700 tabular-nums">
                {score.toLocaleString()}
              </span>

              <div className="h-5 w-px shrink-0 bg-gray-200" />

              {/* Game controls */}
              <button onClick={() => setIsPaused((p) => !p)} title={isPaused ? "Resume" : "Pause"} className={ICON_BTN}>
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
              <button onClick={() => setSoundEnabled((s) => !s)} title={soundEnabled ? "Mute" : "Unmute"} className={ICON_BTN}>
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <Link href={`/game/${game.slug}`} title="Restart" className={ICON_BTN}>
                <RefreshCw size={15} />
              </Link>

              <div className="h-5 w-px shrink-0 bg-gray-200" />

              {/* Meta controls */}
              <button onClick={handleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} className={ICON_BTN}>
                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
              </button>
              <button
                onClick={() => setLiked((l) => !l)}
                title={liked ? "Unlike" : "Like"}
                className={`${ICON_BTN} ${liked ? "!border-red-200 !text-red-500" : ""}`}
              >
                <Heart size={15} className={liked ? "fill-red-500" : ""} />
              </button>
              <button onClick={handleShare} title="Share" className={ICON_BTN}>
                <Share2 size={15} />
              </button>
            </div>

            {/* Canvas */}
            <div
              ref={canvasWrapRef}
              className="relative w-full overflow-hidden rounded-2xl bg-white shadow-sm"
              style={{ aspectRatio: "16/10" }}
            >
              {GameComponent ? (
                <GameComponent callbacks={callbacks} soundEnabled={soundEnabled} paused={isPaused} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  <p className="text-sm text-gray-400">Loading {game.title}…</p>
                </div>
              )}

              {isPaused && GameComponent && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/60">
                  <p className="text-3xl font-extrabold text-white">Paused</p>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-7 py-3 font-bold text-white transition-colors hover:bg-red-600"
                  >
                    <Play size={18} className="fill-white" />
                    Resume
                  </button>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex border-b border-gray-100">
                {(["about", "leaderboard", "comments"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-5 py-3 text-sm font-semibold capitalize transition-colors ${
                      tab === t
                        ? "border-b-2 border-red-500 text-red-500"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === "about" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">About</p>
                      <p className="text-sm leading-relaxed text-gray-600">{game.description}</p>
                    </div>
                    {game.instructions && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Controls</p>
                        <p className="text-sm leading-relaxed text-gray-600">{game.instructions}</p>
                      </div>
                    )}
                  </div>
                )}
                {tab === "leaderboard" && <Leaderboard game={game} myBest={myBest} />}
                {tab === "comments" && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Comments coming soon — sign in to join the conversation.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar — desktop only */}
          <aside className="hidden w-[256px] shrink-0 flex-col gap-4 lg:flex">

            {related.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">More Games</p>
                <div className="space-y-1.5">
                  {related.map((g) => (
                    <Link
                      key={g.id}
                      href={`/game/${g.slug}`}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <div
                        className="h-11 w-[68px] shrink-0 rounded-lg"
                        style={{ background: g.thumbnailGradient }}
                      />
                      <span className="line-clamp-2 text-xs font-medium text-gray-700 leading-tight">{g.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ad placeholder */}
            <div className="flex h-[260px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-300">Advertisement</p>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
