"use client";

import { useRef, useCallback, useEffect } from "react";
import CanvasGame from "@/components/game/CanvasGame";
import type { GameComponentProps } from "@/components/game/types";
import type { CanvasGameConfig } from "@/lib/game-engine/BaseGame";
import { GoldMinerEngine } from "./GoldMinerEngine";

export default function GoldMinerGame({
  callbacks,
  soundEnabled,
  paused,
}: GameComponentProps) {
  const engineRef = useRef<GoldMinerEngine | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Auto-focus so Space/ArrowDown works immediately without a click
  useEffect(() => {
    wrapperRef.current?.focus();
  }, []);

  const createGame = useCallback(
    (config: CanvasGameConfig) => {
      const engine = new GoldMinerEngine(config);
      engineRef.current = engine;
      return engine;
    },
    [] // stable — never changes
  );

  const handleInput = useCallback(() => {
    engineRef.current?.shoot();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowDown") {
        e.preventDefault();
        engineRef.current?.shoot();
      }
    },
    []
  );

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleInput}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleInput();
      }}
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
