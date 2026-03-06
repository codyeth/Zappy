"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { createGrid, addTile, slide, hasWon, isGameOver, type Direction } from "./logic";
import type { GameComponentProps } from "@/components/game/types";

// ── Tile colour map ──────────────────────────────────────────────────────────

const TILE: Record<number, { bg: string; fg: string; shadow?: string }> = {
  0:    { bg: "#EDE8E0", fg: "transparent" },
  2:    { bg: "#EEE4DA", fg: "#776E65" },
  4:    { bg: "#EDE0C8", fg: "#776E65" },
  8:    { bg: "#F2B179", fg: "#FFFFFF" },
  16:   { bg: "#F59563", fg: "#FFFFFF" },
  32:   { bg: "#F67C5F", fg: "#FFFFFF" },
  64:   { bg: "#F65E3B", fg: "#FFFFFF" },
  128:  { bg: "#EDCF72", fg: "#FFFFFF", shadow: "0 0 18px 4px rgba(243,215,116,.6)" },
  256:  { bg: "#EDCC61", fg: "#FFFFFF", shadow: "0 0 20px 6px rgba(243,215,116,.7)" },
  512:  { bg: "#EDC850", fg: "#FFFFFF", shadow: "0 0 22px 8px rgba(243,215,116,.8)" },
  1024: { bg: "#EDC53F", fg: "#FFFFFF", shadow: "0 0 26px 10px rgba(243,215,116,.9)" },
  2048: { bg: "#EDC22E", fg: "#FFFFFF", shadow: "0 0 32px 12px rgba(243,215,116,1)" },
};

function getTile(v: number) {
  return TILE[v] ?? { bg: "#3C3A32", fg: "#FFFFFF" };
}

// ── Score box ────────────────────────────────────────────────────────────────

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center rounded-lg bg-red-400 px-3 py-1.5 text-white">
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</span>
      <span className="text-base font-extrabold leading-tight">{value}</span>
    </div>
  );
}

// ── Tile ────────────────────────────────────────────────────────────────────

function Tile({ value }: { value: number }) {
  const style = getTile(value);
  const fontSize =
    value >= 1024 ? "text-lg" : value >= 128 ? "text-xl" : "text-2xl";

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-md font-extrabold transition-all duration-100 ${fontSize}`}
      style={{
        background:  style.bg,
        color:       style.fg,
        boxShadow:   style.shadow ?? "none",
        transform:   value > 0 ? "scale(1)" : "scale(0.95)",
      }}
    >
      {value > 0 ? value : ""}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

type Status = "playing" | "won" | "over";

export default function Game2048({ callbacks, paused }: GameComponentProps) {
  const [grid, setGrid]       = useState(() => createGrid());
  const [score, setScore]     = useState(0);
  const [best, setBest]       = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("zappy-2048-best") ?? "0", 10);
  });
  const [status, setStatus]   = useState<Status>("playing");
  const [started, setStarted] = useState(false);

  // Announce game start once
  useEffect(() => {
    if (!started) {
      callbacks.onGameStart();
      setStarted(true);
    }
  }, [callbacks, started]);

  // ── Move logic ──────────────────────────────────────────────────────────

  const doMove = useCallback(
    (dir: Direction) => {
      if (paused || status !== "playing") return;

      setGrid((prev) => {
        const result = slide(prev, dir);
        if (!result.moved) return prev;

        const newGrid = addTile(result.grid);

        if (result.gained > 0) {
          setScore((s) => {
            const ns = s + result.gained;
            setBest((b) => {
              const nb = Math.max(b, ns);
              localStorage.setItem("zappy-2048-best", String(nb));
              return nb;
            });
            callbacks.onScoreUpdate(ns);
            return ns;
          });
        }

        if (hasWon(newGrid)) {
          setStatus("won");
          setScore((s) => { callbacks.onGameOver(s); return s; });
        } else if (isGameOver(newGrid)) {
          setStatus("over");
          setScore((s) => { callbacks.onGameOver(s); return s; });
        }

        return newGrid;
      });
    },
    [paused, status, callbacks]
  );

  // ── Keyboard input ──────────────────────────────────────────────────────

  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up",  s: "down",  a: "left",  d: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) { e.preventDefault(); doMove(dir); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  // ── Touch / swipe input ─────────────────────────────────────────────────

  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  };

  // ── Restart ─────────────────────────────────────────────────────────────

  const restart = useCallback(() => {
    setGrid(createGrid());
    setScore(0);
    setStatus("playing");
    setStarted(false);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-full w-full select-none items-center justify-center bg-[#FAF8EF] p-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "none" }}
    >
      <div className="flex w-full max-w-[380px] flex-col gap-3">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-extrabold text-[#776E65]">2048</p>
            <p className="text-xs text-[#BBADA0]">Join tiles, get to 2048!</p>
          </div>
          <div className="flex items-end gap-2">
            <ScoreBox label="Score" value={score} />
            <ScoreBox label="Best"  value={best}  />
          </div>
        </div>

        {/* New game button */}
        <button
          onClick={restart}
          className="flex items-center gap-1.5 self-end rounded-lg bg-red-500 px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-red-600 active:bg-red-700"
        >
          <RotateCcw size={13} />
          New Game
        </button>

        {/* Grid */}
        <div className="relative">
          <div
            className="grid grid-cols-4 gap-2 rounded-xl p-2"
            style={{ background: "#BBADA0" }}
          >
            {grid.map((row, r) =>
              row.map((val, c) => <Tile key={`${r}-${c}`} value={val} />)
            )}
          </div>

          {/* Win / Game-over overlay */}
          {status !== "playing" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl"
              style={{ background: "rgba(238,228,218,.73)" }}
            >
              <p
                className="text-4xl font-extrabold"
                style={{ color: status === "won" ? "#F59E0B" : "#EF4444" }}
              >
                {status === "won" ? "You win!" : "Game over!"}
              </p>
              <p className="font-semibold text-[#776E65]">Score: {score}</p>
              <button
                onClick={restart}
                className="rounded-xl bg-red-500 px-6 py-2.5 font-bold text-white transition-colors hover:bg-red-600"
              >
                Play again
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-[#BBADA0]">
          Arrow keys or swipe to move · Merge matching tiles
        </p>
      </div>
    </div>
  );
}
