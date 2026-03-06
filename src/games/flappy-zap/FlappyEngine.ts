import { BaseGame, type CanvasGameConfig } from "@/lib/game-engine/BaseGame";

const GRAVITY    = 1800; // px / s²
const FLAP_VY    = -500; // px / s  (upward)
const PIPE_W     = 56;
const CAP_H      = 16;
const CAP_EXTRA  = 10;
const BASE_SPEED = 200; // px / s
const GAP_START  = 150;
const GAP_MIN    = 100;
const GAP_SHRINK_PER_10 = 5;

interface Pipe {
  x: number;
  gapY: number; // top of gap
  scored: boolean;
}

interface Cloud {
  x: number;
  y: number;
  scale: number;
}

export class FlappyEngine extends BaseGame {
  private birdY    = 0;
  private birdVY   = 0;
  private birdR    = 18;
  private gapH     = GAP_START;
  private groundH  = 40;

  private pipes: Pipe[]  = [];
  private pipeSpeed      = BASE_SPEED;
  private pipeTimer      = 0;
  private pipeInterval   = 1.8; // seconds

  private clouds: Cloud[] = [];
  private cloudSpeed = BASE_SPEED * 0.35; // parallax

  private score   = 0;
  private phase: "waiting" | "playing" | "over" = "waiting";
  private flashT  = 0; // death flash timer (seconds)

  constructor(config: CanvasGameConfig) {
    super(config);
  }

  // ── Public controls ─────────────────────────────────────────────────────────

  flap(): void {
    if (this.phase === "over") return;
    if (this.phase === "waiting") this.phase = "playing";
    this.birdVY = FLAP_VY;
  }

  restart(): void {
    this.onInit();
    this.callbacks.onGameStart();
  }

  isOver(): boolean { return this.phase === "over"; }
  isWaiting(): boolean { return this.phase === "waiting"; }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  protected onInit(): void {
    const { width: w, height: h } = this.canvas;
    this.groundH  = Math.max(30, h * 0.07);
    this.birdR    = Math.max(14, Math.min(22, h * 0.036));
    this.gapH     = GAP_START;
    this.birdY    = (h - this.groundH) / 2;
    this.birdVY   = 0;
    this.pipes    = [];
    this.pipeSpeed  = BASE_SPEED;
    this.pipeTimer  = 0;
    this.score      = 0;
    this.phase      = "waiting";
    this.flashT     = 0;
    this.clouds = [
      { x: w * 0.2, y: h * 0.15, scale: 1 },
      { x: w * 0.5, y: h * 0.22, scale: 0.8 },
      { x: w * 0.75, y: h * 0.12, scale: 1.1 },
    ];
  }

  protected onResize(): void {
    this.onInit();
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  protected onUpdate(dt: number): void {
    if (this.phase === "waiting") return;
    if (this.phase === "over") {
      this.flashT = Math.max(0, this.flashT - dt);
      return;
    }

    const { width: w, height: h } = this.canvas;
    const floorY = h - this.groundH;
    const birdX  = w * 0.22;

    // Gravity
    this.birdVY += GRAVITY * dt;
    this.birdY  += this.birdVY * dt;

    // Spawn pipes
    this.pipeTimer += dt;
    if (this.pipeTimer >= this.pipeInterval) {
      this.pipeTimer = 0;
      const margin = this.gapH * 0.6;
      const gapY = margin + Math.random() * (floorY - margin * 2 - this.gapH);
      this.pipes.push({ x: w + PIPE_W, gapY, scored: false });
    }

    // Move pipes
    const dist = this.pipeSpeed * dt;
    for (const p of this.pipes) p.x -= dist;
    this.pipes = this.pipes.filter((p) => p.x > -PIPE_W * 2);

    // Clouds parallax
    for (const c of this.clouds) {
      c.x -= this.cloudSpeed * dt;
      if (c.x < -80) c.x = w + 60;
    }

    // Score + collision
    const br = this.birdR - 2;
    for (const pipe of this.pipes) {
      const { x, gapY } = pipe;
      const gapBot = gapY + this.gapH;

      // Score when bird passes pipe leading edge
      if (!pipe.scored && x + PIPE_W < birdX) {
        pipe.scored = true;
        this.score++;
        this.callbacks.onScoreUpdate(this.score);
        this.pipeSpeed = Math.min(380, BASE_SPEED + this.score * 5);
        this.gapH = Math.max(GAP_MIN, GAP_START - Math.floor(this.score / 10) * GAP_SHRINK_PER_10);
      }

      // AABB vs circle — approximate
      const nearX = Math.max(x - CAP_EXTRA / 2, Math.min(birdX, x + PIPE_W + CAP_EXTRA / 2));
      const inPipeX = birdX + br > x - CAP_EXTRA / 2 && birdX - br < x + PIPE_W + CAP_EXTRA / 2;
      if (inPipeX && (this.birdY - br < gapY || this.birdY + br > gapBot)) {
        void nearX; // suppress unused warning
        this.die();
        return;
      }
    }

    // Floor / ceiling
    if (this.birdY + this.birdR > floorY || this.birdY - this.birdR < 0) {
      this.die();
    }
  }

  private die(): void {
    this.phase  = "over";
    this.flashT = 0.25;
    this.callbacks.onGameOver(this.score);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  protected onRender(): void {
    const { ctx, canvas } = this;
    const { width: w, height: h } = canvas;
    const floorY = h - this.groundH;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, floorY);
    sky.addColorStop(0, "#7DD3FC");
    sky.addColorStop(1, "#BAE6FD");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, floorY);

    // Clouds (parallax)
    for (const c of this.clouds) {
      this.drawCloud(c.x, c.y, c.scale);
    }

    // Distant hills (decorative)
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 3; i++) {
      const cx = w * (0.15 + i * 0.35);
      ctx.beginPath();
      ctx.ellipse(cx, floorY, w * 0.18, h * 0.14, 0, Math.PI, 0);
      ctx.fill();
    }

    // Pipes
    for (const pipe of this.pipes) {
      this.drawPipe(pipe.x, pipe.gapY, pipe.gapY + this.gapH, floorY);
    }

    // Ground
    ctx.fillStyle = "#66BB6A";
    ctx.fillRect(0, floorY, w, this.groundH);
    ctx.fillStyle = "#43A047";
    ctx.fillRect(0, floorY, w, 4);

    // Flash
    if (this.flashT > 0) {
      ctx.fillStyle = `rgba(255,255,255,${(this.flashT / 0.25) * 0.55})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Bird
    const birdX = w * 0.22;
    this.drawBird(birdX, this.birdY);

    // Score
    const scoreSize = Math.max(20, h * 0.065);
    ctx.font = `bold ${scoreSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillText(String(this.score), w / 2 + 2, scoreSize * 1.4 + 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(String(this.score), w / 2, scoreSize * 1.4);

    // Waiting overlay — "Tap to Start"
    if (this.phase === "waiting") {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.floor(h * 0.065)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Flappy Zap", w / 2, h * 0.35);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `${Math.floor(h * 0.042)}px sans-serif`;
      ctx.fillText("Tap to Start", w / 2, h * 0.48);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = `${Math.floor(h * 0.032)}px sans-serif`;
      ctx.fillText("or Space / Click on desktop", w / 2, h * 0.56);
    }

    // Game over overlay
    if (this.phase === "over") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#EF4444";
      ctx.font = `bold ${Math.floor(h * 0.07)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", w / 2, h * 0.38);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${Math.floor(h * 0.042)}px sans-serif`;
      ctx.fillText(`Score: ${this.score}`, w / 2, h * 0.48);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = `${Math.floor(h * 0.034)}px sans-serif`;
      ctx.fillText("Click or Space to play again", w / 2, h * 0.58);
    }
  }

  private drawPipe(x: number, gapTop: number, gapBot: number, floorY: number): void {
    const { ctx } = this;
    const pw = PIPE_W;
    const capW = pw + CAP_EXTRA;
    const capX = x - CAP_EXTRA / 2;

    // Top pipe
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x, 0, pw, gapTop - CAP_H);
    ctx.fillStyle = "#388E3C";
    ctx.fillRect(capX, gapTop - CAP_H, capW, CAP_H);
    // highlight
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x + 5, 0, 6, gapTop - CAP_H);

    // Bottom pipe
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x, gapBot + CAP_H, pw, floorY - gapBot - CAP_H);
    ctx.fillStyle = "#388E3C";
    ctx.fillRect(capX, gapBot, capW, CAP_H);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x + 5, gapBot + CAP_H, 6, floorY - gapBot - CAP_H);
  }

  private drawCloud(x: number, y: number, scale: number): void {
    const { ctx } = this;
    const s = 22 * scale;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(x, y, s * 0.9, 0, Math.PI * 2);
    ctx.arc(x + s * 0.85, y + s * 0.1, s * 0.7, 0, Math.PI * 2);
    ctx.arc(x + s * 1.6, y - s * 0.05, s * 0.75, 0, Math.PI * 2);
    ctx.arc(x + s * 0.75, y - s * 0.2, s * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBird(x: number, y: number): void {
    const { ctx } = this;
    const r = this.birdR;
    const tilt = Math.max(-0.5, Math.min(1.3, this.birdVY / 600));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);

    // Zappy bird: red mascot (#EF4444 / #DC2626)
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = "#EF4444";
    ctx.fill();
    ctx.strokeStyle = "#DC2626";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wing (darker red)
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, r * 0.25, r * 0.48, r * 0.2, -0.25, 0, Math.PI * 2);
    ctx.fillStyle = "#DC2626";
    ctx.fill();

    // Eye white
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.2, r * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.42, -r * 0.2, r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "#1F2937";
    ctx.fill();

    // Small beak (orange-red)
    ctx.beginPath();
    ctx.moveTo(r * 0.65, r * 0.06);
    ctx.lineTo(r * 1.15, r * 0.18);
    ctx.lineTo(r * 0.65, r * 0.3);
    ctx.closePath();
    ctx.fillStyle = "#F97316";
    ctx.fill();

    ctx.restore();
  }
}
