import { BaseGame } from "@/lib/game-engine/BaseGame";

// ── Types ─────────────────────────────────────────────────────────────────────

type ItemType = "gold-small" | "gold-large" | "stone" | "diamond" | "bomb";
type HookState = "swinging" | "extending" | "retracting";
type Phase = "playing" | "levelup" | "gameover";

interface Item {
  id: number;
  x: number;
  y: number;
  type: ItemType;
  radius: number;
  value: number;
  weight: number; // affects retraction speed
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // seconds remaining
  maxLife: number;
  text: string;
  color: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const ITEM_CFG: Record<ItemType, { radius: number; value: number; weight: number; color: string; highlight: string }> = {
  "gold-small":  { radius: 16, value: 50,   weight: 1.0, color: "#F59E0B", highlight: "#FDE68A" },
  "gold-large":  { radius: 28, value: 200,  weight: 3.0, color: "#D97706", highlight: "#FCD34D" },
  "stone":       { radius: 26, value: 10,   weight: 5.0, color: "#6B7280", highlight: "#9CA3AF" },
  "diamond":     { radius: 15, value: 500,  weight: 0.5, color: "#38BDF8", highlight: "#BAE6FD" },
  "bomb":        { radius: 18, value: -100, weight: 1.0, color: "#EF4444", highlight: "#FCA5A5" },
};

const LEVEL_CFG = [
  { target: 150,  time: 45, itemCount: 12 },
  { target: 350,  time: 50, itemCount: 14 },
  { target: 650,  time: 55, itemCount: 16 },
  { target: 1000, time: 60, itemCount: 18 },
  { target: 1500, time: 65, itemCount: 20 },
];

const SWING_SPEED  = 1.15; // rad/s
const MAX_ANGLE    = Math.PI * 0.44; // ~80°
const EXTEND_SPEED = 420;  // px/s
const RETRACT_BASE = 210;  // px/s (divided by item weight)

// ── Engine ────────────────────────────────────────────────────────────────────

export class GoldMinerEngine extends BaseGame {
  // Layout
  private get groundY()  { return this.canvas.height * 0.2; }
  private get originX()  { return this.canvas.width  / 2; }
  private get originY()  { return this.groundY; }

  // Game state
  private phase: Phase = "playing";
  private score = 0;
  private level = 0;
  private timeLeft = 0;
  private phaseTimer = 0; // timer for levelup/gameover display

  // Hook
  private hookAngle = 0;
  private hookDir   = 1;   // swing direction
  private hookLen   = 0;
  private hookState: HookState = "swinging";
  private grabbed: Item | null = null;

  // Scene
  private items: Item[]     = [];
  private particles: Particle[] = [];
  private earthPatches: Array<{ x: number; y: number; rx: number; ry: number; a: number }> = [];
  private nextId = 0;

  // ── BaseGame implementation ─────────────────────────────────────────────────

  protected onInit(): void {
    this.score      = 0;
    this.level      = 0;
    this.hookAngle  = 0;
    this.hookDir    = 1;
    this.hookLen    = 0;
    this.hookState  = "swinging";
    this.grabbed    = null;
    this.particles  = [];
    this.phase      = "playing";
    this.phaseTimer = 0;
    this.generateEarth();
    this.beginLevel();
  }

  protected onUpdate(dt: number): void {
    if (this.phase === "levelup" || this.phase === "gameover") {
      this.phaseTimer -= dt;
      if (this.phase === "levelup" && this.phaseTimer <= 0) this.beginLevel();
      return;
    }

    // Tick time
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endLevel();
      return;
    }

    // Update particles
    this.particles = this.particles.filter((p) => {
      p.x   += p.vx * dt;
      p.y   += p.vy * dt;
      p.life -= dt;
      return p.life > 0;
    });

    // Hook physics
    this.updateHook(dt);
  }

  protected onRender(): void {
    this.drawBackground();
    this.drawEarth();
    this.drawItems();
    this.drawRopeAndHook();
    this.drawMiner();
    this.drawHUD();
    this.drawParticles();
    if (this.phase !== "playing") this.drawOverlay();
  }

  protected onResize(): void {
    this.generateEarth();
    const cfg = LEVEL_CFG[Math.min(this.level, LEVEL_CFG.length - 1)];
    this.spawnItems(cfg.itemCount);
  }

  // ── Public controls ─────────────────────────────────────────────────────────

  /** Called on click / Space / ArrowDown */
  shoot(): void {
    if (this.phase === "gameover") {
      // restart on click after game over
      this.onInit();
      this.callbacks.onGameStart();
      return;
    }
    if (this.hookState === "swinging" && this.phase === "playing") {
      this.hookState = "extending";
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private beginLevel(): void {
    const cfg = LEVEL_CFG[Math.min(this.level, LEVEL_CFG.length - 1)];
    this.timeLeft  = cfg.time;
    this.hookLen   = 0;
    this.hookState = "swinging";
    this.grabbed   = null;
    this.phase     = "playing";
    this.spawnItems(cfg.itemCount);
    this.callbacks.onLevelUp?.(this.level + 1);
  }

  private endLevel(): void {
    const cfg = LEVEL_CFG[Math.min(this.level, LEVEL_CFG.length - 1)];
    if (this.score >= cfg.target) {
      this.level++;
      if (this.level >= LEVEL_CFG.length) {
        this.phase      = "gameover";
        this.phaseTimer = 999;
        this.callbacks.onGameOver(this.score);
      } else {
        this.phase      = "levelup";
        this.phaseTimer = 1.8;
      }
    } else {
      this.phase      = "gameover";
      this.phaseTimer = 999;
      this.callbacks.onGameOver(this.score);
    }
  }

  private spawnItems(count: number): void {
    const gY   = this.groundY;
    const w    = this.canvas.width;
    const h    = this.canvas.height;
    const pool: ItemType[] = [
      "gold-small", "gold-small", "gold-small",
      "gold-large", "gold-large",
      "stone", "stone",
      "diamond",
      "bomb",
    ];
    this.items = [];
    for (let i = 0; i < count; i++) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      const cfg  = ITEM_CFG[type];
      const margin = cfg.radius + 10;
      this.items.push({
        id:     this.nextId++,
        x:      margin + Math.random() * (w - margin * 2),
        y:      gY + 60 + Math.random() * (h - gY - 120),
        type,
        radius: cfg.radius,
        value:  cfg.value,
        weight: cfg.weight,
      });
    }
  }

  private generateEarth(): void {
    const w = this.canvas.width  || 800;
    const h = this.canvas.height || 500;
    const gY = h * 0.2;
    this.earthPatches = [];
    for (let i = 0; i < 70; i++) {
      this.earthPatches.push({
        x:  Math.random() * w,
        y:  gY + Math.random() * (h - gY),
        rx: 8 + Math.random() * 28,
        ry: 5 + Math.random() * 18,
        a:  Math.random() * Math.PI,
      });
    }
  }

  private updateHook(dt: number): void {
    if (this.hookState === "swinging") {
      this.hookAngle += this.hookDir * SWING_SPEED * dt;
      if (Math.abs(this.hookAngle) >= MAX_ANGLE) {
        this.hookDir *= -1;
        this.hookAngle = Math.sign(this.hookAngle) * MAX_ANGLE;
      }
      return;
    }

    const tipX = this.originX + Math.sin(this.hookAngle) * this.hookLen;
    const tipY = this.originY + Math.cos(this.hookAngle) * this.hookLen;

    if (this.hookState === "extending") {
      this.hookLen += EXTEND_SPEED * dt;

      // Hit item?
      const hit = this.items.find((item) => {
        const dx = tipX - item.x;
        const dy = tipY - item.y;
        return Math.sqrt(dx * dx + dy * dy) < item.radius + 8;
      });
      if (hit) {
        this.grabbed   = hit;
        this.hookState = "retracting";
        return;
      }

      // Out of bounds?
      const maxLen = Math.hypot(this.canvas.width, this.canvas.height) * 1.1;
      if (
        tipX < -20 || tipX > this.canvas.width + 20 ||
        tipY > this.canvas.height + 20 ||
        this.hookLen > maxLen
      ) {
        this.hookState = "retracting";
      }
      return;
    }

    if (this.hookState === "retracting") {
      const speed = RETRACT_BASE / (this.grabbed?.weight ?? 1);
      this.hookLen -= speed * dt;

      // Drag grabbed item with hook
      if (this.grabbed) {
        this.grabbed.x = tipX;
        this.grabbed.y = tipY;
      }

      if (this.hookLen <= 0) {
        this.hookLen = 0;
        if (this.grabbed) {
          this.collectItem(this.grabbed);
          this.grabbed = null;
        }
        this.hookState = "swinging";
      }
    }
  }

  private collectItem(item: Item): void {
    this.items = this.items.filter((i) => i.id !== item.id);
    this.score = Math.max(0, this.score + item.value);
    this.callbacks.onScoreUpdate(this.score);

    // Score pop-up particle
    const sign = item.value >= 0 ? "+" : "";
    this.particles.push({
      x:       this.originX,
      y:       this.originY - 10,
      vx:      (Math.random() - 0.5) * 50,
      vy:      -90 - Math.random() * 30,
      life:    1.4,
      maxLife: 1.4,
      text:    `${sign}$${item.value}`,
      color:   item.value >= 0 ? "#22C55E" : "#EF4444",
    });

    // Check level target reached early
    const cfg = LEVEL_CFG[Math.min(this.level, LEVEL_CFG.length - 1)];
    if (this.score >= cfg.target && this.phase === "playing") {
      this.timeLeft = 0; // trigger endLevel next update
    }
  }

  // ── Rendering ────────────────────────────────────────────────────────────────

  private drawBackground(): void {
    const { ctx, canvas } = this;
    const gY = this.groundY;
    const w  = canvas.width;
    const h  = canvas.height;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, gY);
    sky.addColorStop(0, "#BFDBFE");
    sky.addColorStop(1, "#DBEAFE");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, gY);

    // Underground
    const earth = ctx.createLinearGradient(0, gY, 0, h);
    earth.addColorStop(0,   "#92400E");
    earth.addColorStop(0.4, "#78350F");
    earth.addColorStop(1,   "#451A03");
    ctx.fillStyle = earth;
    ctx.fillRect(0, gY, w, h - gY);

    // Surface strip
    const grass = ctx.createLinearGradient(0, gY - 10, 0, gY + 6);
    grass.addColorStop(0, "#4ADE80");
    grass.addColorStop(1, "#16A34A");
    ctx.fillStyle = grass;
    ctx.fillRect(0, gY - 10, w, 16);
  }

  private drawEarth(): void {
    const { ctx } = this;
    ctx.save();
    this.earthPatches.forEach((p) => {
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.rx, p.ry, p.a, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private drawItems(): void {
    const { ctx } = this;
    this.items.forEach((item) => {
      if (item === this.grabbed) return;
      this.drawItem(ctx, item);
    });
  }

  private drawItem(ctx: CanvasRenderingContext2D, item: Item): void {
    const cfg = ITEM_CFG[item.type];

    // Glow
    const glow = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.radius * 2);
    glow.addColorStop(0,   cfg.color + "50");
    glow.addColorStop(1,   "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Main shape
    ctx.fillStyle = cfg.color;
    ctx.strokeStyle = cfg.highlight;
    ctx.lineWidth = 2;

    ctx.beginPath();
    if (item.type === "diamond") {
      // Diamond ♦
      ctx.moveTo(item.x,                  item.y - item.radius);
      ctx.lineTo(item.x + item.radius * 0.7, item.y);
      ctx.lineTo(item.x,                  item.y + item.radius);
      ctx.lineTo(item.x - item.radius * 0.7, item.y);
      ctx.closePath();
    } else if (item.type === "stone") {
      ctx.ellipse(item.x, item.y, item.radius, item.radius * 0.78, 0.4, 0, Math.PI * 2);
    } else if (item.type === "bomb") {
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    } else {
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Highlight shine
    ctx.fillStyle = cfg.highlight + "80";
    ctx.beginPath();
    ctx.ellipse(
      item.x - item.radius * 0.25,
      item.y - item.radius * 0.3,
      item.radius * 0.35,
      item.radius * 0.2,
      -0.5, 0, Math.PI * 2
    );
    ctx.fill();

    // Value label
    ctx.fillStyle = item.type === "stone" ? "#D1D5DB" : "white";
    ctx.font = `bold ${Math.max(9, item.radius * 0.52)}px sans-serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    const sign = item.value >= 0 ? "$" : "";
    ctx.fillText(`${sign}${item.value}`, item.x, item.y + 1);
  }

  private drawRopeAndHook(): void {
    const { ctx } = this;
    const ox   = this.originX;
    const oy   = this.originY;
    const tipX = ox + Math.sin(this.hookAngle) * this.hookLen;
    const tipY = oy + Math.cos(this.hookAngle) * this.hookLen;

    // Rope
    ctx.strokeStyle = "#B45309";
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Grabbed item on hook
    if (this.grabbed) {
      this.drawItem(ctx, this.grabbed);
    }

    // Hook tip
    ctx.fillStyle   = "#9CA3AF";
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hook claw lines
    ctx.strokeStyle = "#6B7280";
    ctx.lineWidth   = 2;
    const a = this.hookAngle;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + Math.cos(a) * 8 - Math.sin(a) * 4, tipY - Math.sin(a) * 8 - Math.cos(a) * 4);
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - Math.cos(a) * 8 - Math.sin(a) * 4, tipY + Math.sin(a) * 8 - Math.cos(a) * 4);
    ctx.stroke();
  }

  private drawMiner(): void {
    const { ctx } = this;
    const gY = this.groundY;
    const mx = this.originX;
    const my = gY - 2;

    // Legs
    ctx.fillStyle = "#374151";
    ctx.fillRect(mx - 9, my - 6, 7, 14);
    ctx.fillRect(mx + 2,  my - 6, 7, 14);

    // Body
    ctx.fillStyle = "#1D4ED8";
    ctx.fillRect(mx - 11, my - 26, 22, 20);

    // Belt
    ctx.fillStyle = "#92400E";
    ctx.fillRect(mx - 11, my - 10, 22, 4);

    // Head
    ctx.fillStyle = "#FCD34D";
    ctx.beginPath();
    ctx.arc(mx, my - 34, 11, 0, Math.PI * 2);
    ctx.fill();

    // Hard hat
    ctx.fillStyle = "#EF4444";
    ctx.fillRect(mx - 13, my - 44, 26, 8);
    ctx.fillRect(mx - 9,  my - 53, 18, 11);

    // Hat brim highlight
    ctx.fillStyle = "#FCA5A5";
    ctx.fillRect(mx - 13, my - 44, 26, 3);

    // Eyes
    ctx.fillStyle = "#1E3A5F";
    ctx.beginPath();
    ctx.arc(mx - 4, my - 36, 2, 0, Math.PI * 2);
    ctx.arc(mx + 4, my - 36, 2, 0, Math.PI * 2);
    ctx.fill();

    // Arm holding rope
    ctx.strokeStyle = "#FCD34D";
    ctx.lineWidth   = 3;
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.moveTo(mx + 9, my - 20);
    ctx.lineTo(mx + 12, my - 14);
    ctx.stroke();
  }

  private drawHUD(): void {
    const { ctx, canvas } = this;
    const cfg = LEVEL_CFG[Math.min(this.level, LEVEL_CFG.length - 1)];
    const w   = canvas.width;
    const gY  = this.groundY;

    // HUD bar
    const barH = 34;
    const barY = gY - barH - 8;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.roundRect(8, barY, w - 16, barH, 8);
    ctx.fill();

    ctx.textBaseline = "middle";
    const midY = barY + barH / 2;

    // Score
    ctx.fillStyle = "#FBBF24";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`$${this.score}`, 20, midY);

    // Target progress
    const pct = Math.min(this.score / cfg.target, 1);
    const barW = 110;
    const barX = w / 2 - barW / 2;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.roundRect(barX, midY - 5, barW, 10, 5);
    ctx.fill();
    ctx.fillStyle = pct >= 1 ? "#4ADE80" : "#EF4444";
    ctx.beginPath();
    ctx.roundRect(barX, midY - 5, barW * pct, 10, 5);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`$${this.score}/$${cfg.target}`, w / 2, midY + 14);

    // Time
    const timeColor = this.timeLeft < 10 ? "#EF4444" : "white";
    ctx.fillStyle = timeColor;
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.ceil(this.timeLeft)}s`, w - 20, midY);

    // Level badge
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 28, barY - 18, 56, 16, 4);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${this.level + 1}`, w / 2, barY - 10);
  }

  private drawParticles(): void {
    const { ctx } = this;
    ctx.save();
    this.particles.forEach((p) => {
      const alpha = Math.min(1, p.life / (p.maxLife * 0.5));
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle   = p.color;
      ctx.font        = "bold 15px sans-serif";
      ctx.textAlign   = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.restore();
  }

  private drawOverlay(): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    if (this.phase === "levelup") {
      ctx.fillStyle = "#4ADE80";
      ctx.font = `bold ${Math.min(40, w * 0.07)}px sans-serif`;
      ctx.fillText("LEVEL CLEAR!", w / 2, h / 2 - 18);
      ctx.fillStyle = "white";
      ctx.font = `${Math.min(20, w * 0.035)}px sans-serif`;
      ctx.fillText(`Level ${this.level + 1} starting...`, w / 2, h / 2 + 20);
    } else {
      // Game over
      ctx.fillStyle = "#EF4444";
      ctx.font = `bold ${Math.min(38, w * 0.065)}px sans-serif`;
      ctx.fillText("GAME OVER", w / 2, h / 2 - 36);

      ctx.fillStyle = "#FBBF24";
      ctx.font = `bold ${Math.min(24, w * 0.042)}px sans-serif`;
      ctx.fillText(`Final Score: $${this.score}`, w / 2, h / 2 + 10);

      ctx.fillStyle = "#D1D5DB";
      ctx.font = `${Math.min(15, w * 0.027)}px sans-serif`;
      ctx.fillText("Click or tap to play again", w / 2, h / 2 + 52);
    }
  }
}
