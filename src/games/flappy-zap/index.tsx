"use client";

import { useRef, useEffect, useCallback } from "react";
import CanvasGame from "@/components/game/CanvasGame";
import type { GameComponentProps } from "@/components/game/types";
import type { CanvasGameConfig } from "@/lib/game-engine/BaseGame";
import { FlappyEngine } from "./FlappyEngine";

export default function FlappyZapGame({ callbacks, soundEnabled, paused }: GameComponentProps) {
  const engineRef = useRef<FlappyEngine | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { wrapperRef.current?.focus(); }, []);

  const createGame = useCallback(
    (config: CanvasGameConfig) => {
      const engine = new FlappyEngine(config);
      engineRef.current = engine;
      return engine;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleAction = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    if (eng.isOver()) eng.restart();
    else eng.flap();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      handleAction();
    }
  }, [handleAction]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleAction}
      onTouchEnd={(e) => { e.preventDefault(); handleAction(); }}
    >
      <CanvasGame
        createGame={createGame}
        callbacks={callbacks}
        soundEnabled={soundEnabled}
        paused={paused}
        className="w-full h-full"
      />
    </div>
  );
}
