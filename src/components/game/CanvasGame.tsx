"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { BaseGame, CanvasGameConfig } from "@/lib/game-engine/BaseGame";
import type { GameCallbacks } from "@/lib/game-engine/types";

interface CanvasGameProps {
  createGame: (config: CanvasGameConfig) => BaseGame;
  callbacks: GameCallbacks;
  soundEnabled: boolean;
  paused: boolean;
  onReady?: (game: BaseGame) => void;
  className?: string;
}

export default function CanvasGame({
  createGame,
  callbacks,
  soundEnabled,
  paused,
  onReady,
  className,
}: CanvasGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<BaseGame | null>(null);

  // Mount: create + start game
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 500;
    canvas.width = w;
    canvas.height = h;

    const game = createGame({ canvas, callbacks, soundEnabled });
    gameRef.current = game;
    onReady?.(game);
    game.start();

    const ro = new ResizeObserver(() => {
      if (!gameRef.current || !container) return;
      gameRef.current.resize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      game.destroy();
    };
    // callbacks & soundEnabled intentionally omitted — game captures them at construction
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync pause state
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (paused) game.pause();
    else game.resume();
  }, [paused]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full", className)}
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
