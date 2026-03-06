import type { GameCallbacks } from "./types";

export interface CanvasGameConfig {
  canvas: HTMLCanvasElement;
  callbacks: GameCallbacks;
  soundEnabled?: boolean;
}

export abstract class BaseGame {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected callbacks: GameCallbacks;
  protected soundEnabled: boolean;

  private animationId: number | null = null;
  private lastTimestamp = 0;
  private _running = false;
  private _paused = false;

  constructor(config: CanvasGameConfig) {
    this.canvas = config.canvas;
    const ctx = config.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.callbacks = config.callbacks;
    this.soundEnabled = config.soundEnabled ?? true;
  }

  // ── Subclass contract ────────────────────────────────────────────────────────
  protected abstract onInit(): void;
  protected abstract onUpdate(dt: number): void;
  protected abstract onRender(): void;
  protected abstract onResize(): void;

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  start(): void {
    this._running = true;
    this._paused = false;
    this.lastTimestamp = 0;
    this.onInit();
    this.callbacks.onGameStart();
    this.animationId = requestAnimationFrame(this.tick);
  }

  pause(): void {
    this._paused = true;
  }

  resume(): void {
    if (!this._paused || !this._running) return;
    this._paused = false;
    this.lastTimestamp = 0; // prevent dt spike after pause
    this.animationId = requestAnimationFrame(this.tick);
  }

  destroy(): void {
    this._running = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resize(w: number, h: number): void {
    this.canvas.width = w;
    this.canvas.height = h;
    this.onResize();
    if (this._running && !this._paused) this.onRender();
  }

  get isRunning() { return this._running; }
  get isPaused() { return this._paused; }

  // ── Game loop ────────────────────────────────────────────────────────────────

  private tick = (timestamp: number): void => {
    if (!this._running || this._paused) return;
    const dt = this.lastTimestamp === 0
      ? 0
      : Math.min((timestamp - this.lastTimestamp) / 1000, 0.05); // cap at 50 ms
    this.lastTimestamp = timestamp;
    this.onUpdate(dt);
    this.onRender();
    this.animationId = requestAnimationFrame(this.tick);
  };
}
