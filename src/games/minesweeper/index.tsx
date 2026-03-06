"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Flag, RefreshCw, Clock, Bomb } from "lucide-react";
import type { GameComponentProps } from "@/components/game/types";

// ── Config ───────────────────────────────────────────────────────────────────

const CONFIGS = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard:   { rows: 16, cols: 30, mines: 99 },
} as const;
const DIFF_MULTIPLIER: Record<keyof typeof CONFIGS, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};
type Difficulty = keyof typeof CONFIGS;

function computeScore(elapsed: number, difficulty: Difficulty): number {
  const mult = DIFF_MULTIPLIER[difficulty];
  const base = Math.max(0, 5000 - elapsed * 15);
  return Math.max(0, Math.floor(base * mult));
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighbors: number;
}

type Board = Cell[][];
type Phase = "idle" | "playing" | "won" | "lost";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false, revealed: false, flagged: false, neighbors: 0,
    }))
  );
}

function placeMines(board: Board, safeR: number, safeC: number, count: number): Board {
  const rows = board.length;
  const cols = board[0].length;
  const next = board.map((row) => row.map((cell) => ({ ...cell })));

  let placed = 0;
  while (placed < count) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (next[r][c].mine) continue;
    // Don't place on the first-click cell or its 8 neighbors
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    next[r][c].mine = true;
    placed++;
  }

  // Count neighbors
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (next[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && next[nr][nc].mine) count++;
        }
      }
      next[r][c].neighbors = count;
    }
  }
  return next;
}

function floodReveal(board: Board, r: number, c: number): Board {
  const rows = board.length; const cols = board[0].length;
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[r, c]];

  while (queue.length) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = next[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.neighbors === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) queue.push([cr + dr, cc + dc]);
        }
      }
    }
  }
  return next;
}

function revealAll(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell, revealed: true })));
}

function checkWin(board: Board): boolean {
  return board.every((row) =>
    row.every((cell) => cell.mine || cell.revealed)
  );
}

// ── Number colors ─────────────────────────────────────────────────────────────

const NUM_COLORS = [
  "", "#2563EB", "#16A34A", "#DC2626", "#7C3AED",
  "#B45309", "#0891B2", "#111827", "#6B7280",
];

// ── Component ────────────────────────────────────────────────────────────────

export default function MinesweeperGame({ callbacks, paused }: GameComponentProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard]     = useState<Board>(() => makeBoard(9, 9));
  const [phase, setPhase]     = useState<Phase>("idle");
  const [mineCount, setMineCount] = useState(10);
  const [flagCount, setFlagCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<{ timer: ReturnType<typeof setTimeout>; r: number; c: number } | null>(null);
  const longPressFiredRef = useRef(false);
  const touchHandledRef = useRef(false);

  // Announce start once
  useEffect(() => {
    if (!started) { callbacks.onGameStart(); setStarted(true); }
  }, [callbacks, started]);

  // Timer
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        if (!paused) setElapsed((e) => e + 1);
      }, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, paused]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const newGame = useCallback((diff: Difficulty = difficulty) => {
    const cfg = CONFIGS[diff];
    setDifficulty(diff);
    setBoard(makeBoard(cfg.rows, cfg.cols));
    setPhase("idle");
    setMineCount(cfg.mines);
    setFlagCount(0);
    setElapsed(0);
    setStarted(false);
  }, [difficulty]);

  const reveal = useCallback((r: number, c: number) => {
    if (paused) return;

    setBoard((prev) => {
      const cell = prev[r][c];
      if (cell.revealed || cell.flagged) return prev;

      let next = prev;

      // First click: place mines, then reveal
      if (phase === "idle") {
        const cfg = CONFIGS[difficulty];
        next = placeMines(prev, r, c, cfg.mines);
        setPhase("playing");
        callbacks.onGameStart();
        setStarted(true);
      }

      if (next[r][c].mine) {
        // Hit a mine
        const revealed = revealAll(next);
        setPhase("lost");
        callbacks.onGameOver(0);
        return revealed;
      }

      const afterReveal = floodReveal(next, r, c);

      if (checkWin(afterReveal)) {
        setPhase("won");
        callbacks.onGameOver(computeScore(elapsed, difficulty));
      }

      return afterReveal;
    });
  }, [paused, phase, difficulty, elapsed, callbacks]);

  const toggleFlag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (paused || phase === "won" || phase === "lost") return;
    setBoard((prev) => {
      const cell = prev[r][c];
      if (cell.revealed) return prev;
      const next = prev.map((row) => row.map((cl) => ({ ...cl })));
      next[r][c].flagged = !cell.flagged;
      setFlagCount((f) => cell.flagged ? f - 1 : f + 1);
      return next;
    });
  }, [paused, phase]);

  const handleTouchStart = useCallback((_e: React.TouchEvent, r: number, c: number) => {
    if (paused || phase === "won" || phase === "lost") return;
    longPressFiredRef.current = false;
    const timer = setTimeout(() => {
      longPressFiredRef.current = true;
    }, 500);
    longPressRef.current = { timer, r, c };
  }, [paused, phase]);

  const handleTouchEnd = useCallback((_e: React.TouchEvent, r: number, c: number) => {
    const cur = longPressRef.current;
    longPressRef.current = null;
    if (cur) clearTimeout(cur.timer);
    if (paused || phase === "won" || phase === "lost") return;
    touchHandledRef.current = true;
    if (cur && longPressFiredRef.current && cur.r === r && cur.c === c) {
      toggleFlag({ preventDefault: () => {} } as React.MouseEvent, r, c);
    } else if (cur && cur.r === r && cur.c === c) {
      reveal(r, c);
    }
    setTimeout(() => { touchHandledRef.current = false; }, 150);
  }, [paused, phase, toggleFlag, reveal]);

  // ── Chord (reveal neighbors when flagged count matches) ───────────────────
  const chord = useCallback((r: number, c: number) => {
    if (paused) return;
    setBoard((prev) => {
      const cell = prev[r][c];
      if (!cell.revealed || cell.neighbors === 0) return prev;
      const rows = prev.length; const cols = prev[0].length;
      let flagged = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && prev[nr][nc].flagged) flagged++;
        }
      }
      if (flagged !== cell.neighbors) return prev;
      let next = prev;
      // Check if any unflagged mine would be hit
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (!prev[nr][nc].flagged && !prev[nr][nc].revealed && prev[nr][nc].mine) {
            const revealed = revealAll(next);
            setPhase("lost");
            callbacks.onGameOver(0);
            return revealed;
          }
        }
      }
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !prev[nr][nc].flagged && !prev[nr][nc].revealed) {
            next = floodReveal(next, nr, nc);
          }
        }
      }
      if (checkWin(next)) {
        setPhase("won");
        callbacks.onGameOver(computeScore(elapsed, difficulty));
      }
      return next;
    });
  }, [paused, elapsed, difficulty, callbacks]);

  // ── Render ────────────────────────────────────────────────────────────────

  const remaining = mineCount - flagCount;

  return (
    <div className="flex h-full w-full select-none items-center justify-center overflow-auto bg-gray-100 p-2">
      <div className="flex flex-col gap-2" style={{ maxWidth: "100%", maxHeight: "100%" }}>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-2 shadow-sm">
          {/* Mine counter */}
          <div className="flex items-center gap-1.5 text-red-500 font-bold tabular-nums text-lg min-w-[48px]">
            <Bomb size={16} />
            {String(remaining).padStart(3, "0")}
          </div>

          {/* Difficulty selector */}
          <div className="flex gap-1">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => newGame(d)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                  difficulty === d
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Restart */}
          <button
            onClick={() => newGame(difficulty)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
            title="New game"
          >
            <RefreshCw size={14} />
          </button>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-gray-700 font-bold tabular-nums text-lg min-w-[48px] justify-end">
            <Clock size={16} />
            {String(Math.min(999, elapsed)).padStart(3, "0")}
          </div>
        </div>

        {/* Board */}
        <div
          className="rounded-xl bg-white p-2 shadow-sm overflow-auto"
          style={{ maxWidth: "100%", maxHeight: "calc(100% - 60px)" }}
        >
          <table className="border-collapse" style={{ tableLayout: "fixed" }}>
            <tbody>
              {board.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => {
                    let bg = "bg-gray-300 hover:bg-gray-200 active:bg-gray-400";
                    let content: React.ReactNode = null;
                    let color = "";

                    if (cell.revealed) {
                      bg = "bg-gray-100";
                      if (cell.mine) {
                        bg = "bg-red-200";
                        content = <Bomb size={14} className="text-red-600 mx-auto" />;
                      } else if (cell.neighbors > 0) {
                        color = NUM_COLORS[cell.neighbors];
                        content = <span style={{ color }} className="font-bold text-sm leading-none">{cell.neighbors}</span>;
                      }
                    } else if (cell.flagged) {
                      content = <Flag size={13} className="text-red-500 mx-auto" />;
                    }

                    return (
                      <td
                        key={c}
                        className={`w-7 h-7 cursor-pointer text-center align-middle border border-gray-400/30 transition-colors select-none touch-none ${bg} ${
                          !cell.revealed ? "shadow-[inset_1px_1px_0_rgba(255,255,255,0.8),inset_-1px_-1px_0_rgba(0,0,0,0.15)]" : ""
                        }`}
                        onClick={() => {
                          if (touchHandledRef.current) return;
                          if (cell.revealed) chord(r, c);
                          else reveal(r, c);
                        }}
                        onContextMenu={(e) => toggleFlag(e, r, c)}
                        onTouchStart={(e) => handleTouchStart(e, r, c)}
                        onTouchEnd={(e) => handleTouchEnd(e, r, c)}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Win / Lose overlay message */}
        {(phase === "won" || phase === "lost") && (
          <div className={`rounded-xl px-4 py-2.5 text-center font-bold text-white shadow-sm ${
            phase === "won" ? "bg-green-500" : "bg-red-500"
          }`}>
            {phase === "won"
              ? `You won! Time: ${elapsed}s`
              : "Boom! Better luck next time."}
            <button
              onClick={() => newGame(difficulty)}
              className="ml-3 rounded-lg bg-white/20 px-3 py-0.5 text-sm hover:bg-white/30"
            >
              Play again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
