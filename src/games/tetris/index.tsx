"use client";

import { useRef, useEffect, useCallback } from "react";
import CanvasGame from "@/components/game/CanvasGame";
import type { GameComponentProps } from "@/components/game/types";
import type { CanvasGameConfig } from "@/lib/game-engine/BaseGame";
import { TetrisEngine } from "./TetrisEngine";

const SWIPE_THRESHOLD = 28;

export default function TetrisGame({ callbacks, soundEnabled, paused }: GameComponentProps) {
  const engineRef = useRef<TetrisEngine | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { wrapperRef.current?.focus(); }, []);

  const createGame = useCallback(
    (config: CanvasGameConfig) => {
      const engine = new TetrisEngine(config);
      engineRef.current = engine;
      return engine;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const eng = engineRef.current;
    if (!eng) return;
    switch (e.code) {
      case "ArrowLeft":  e.preventDefault(); eng.moveLeft();   break;
      case "ArrowRight": e.preventDefault(); eng.moveRight();  break;
      case "ArrowUp":    e.preventDefault(); eng.rotate();     break;
      case "ArrowDown":  e.preventDefault(); eng.softDrop();   break;
      case "Space":
        e.preventDefault();
        if (eng.isOver()) eng.restart();
        else eng.hardDrop();
        break;
      case "KeyC": eng.holdPiece(); break;
    }
  }, []);

  const handleClick = useCallback(() => {
    const eng = engineRef.current;
    if (eng?.isOver()) eng.restart();
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const end = e.changedTouches[0];
    if (!start || !end) return;
    const eng = engineRef.current;
    if (!eng) return;

    if (eng.isOver()) {
      eng.restart();
      return;
    }

    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if (adx < SWIPE_THRESHOLD && ady < SWIPE_THRESHOLD) {
      eng.hardDrop();
      return;
    }
    if (adx > ady) {
      if (dx > SWIPE_THRESHOLD) eng.moveRight();
      else if (dx < -SWIPE_THRESHOLD) eng.moveLeft();
    } else {
      if (dy < -SWIPE_THRESHOLD) eng.rotate();
      else if (dy > SWIPE_THRESHOLD) eng.softDrop();
    }
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
