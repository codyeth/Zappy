import { BaseGame, type CanvasGameConfig } from "@/lib/game-engine/BaseGame";

const COLS = 10;
const ROWS = 20;

type PK = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
const ALL_PIECES: PK[] = ["I", "O", "T", "S", "Z", "J", "L"];

// [row, col] offsets from piece origin (top-left of bounding box)
const SHAPES: Record<PK, [number, number][][]> = {
  I: [
    [[0,0],[0,1],[0,2],[0,3]],
    [[0,0],[1,0],[2,0],[3,0]],
    [[0,0],[0,1],[0,2],[0,3]],
    [[0,0],[1,0],[2,0],[3,0]],
  ],
  O: [
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[0,1],[1,0],[1,1]],
  ],
  T: [
    [[0,1],[1,0],[1,1],[1,2]],
    [[0,0],[1,0],[1,1],[2,0]],
    [[0,0],[0,1],[0,2],[1,1]],
    [[0,1],[1,0],[1,1],[2,1]],
  ],
  S: [
    [[0,1],[0,2],[1,0],[1,1]],
    [[0,0],[1,0],[1,1],[2,1]],
    [[0,1],[0,2],[1,0],[1,1]],
    [[0,0],[1,0],[1,1],[2,1]],
  ],
  Z: [
    [[0,0],[0,1],[1,1],[1,2]],
    [[0,1],[1,0],[1,1],[2,0]],
    [[0,0],[0,1],[1,1],[1,2]],
    [[0,1],[1,0],[1,1],[2,0]],
  ],
  J: [
    [[0,0],[1,0],[1,1],[1,2]],
    [[0,0],[0,1],[1,0],[2,0]],
    [[0,0],[0,1],[0,2],[1,2]],
    [[0,1],[1,1],[2,0],[2,1]],
  ],
  L: [
    [[0,2],[1,0],[1,1],[1,2]],
    [[0,0],[1,0],[2,0],[2,1]],
    [[0,0],[0,1],[0,2],[1,0]],
    [[0,0],[0,1],[1,1],[2,1]],
  ],
};

// Vivid piece colors (Zappy red accent + bright palette)
const COLORS: Record<PK, string> = {
  I: "#06B6D4",
  O: "#EAB308",
  T: "#A855F7",
  S: "#22C55E",
  Z: "#EF4444",
  J: "#3B82F6",
  L: "#F97316",
};

interface ActivePiece {
  type: PK;
  rot: number;
  row: number;
  col: number;
}

export class TetrisEngine extends BaseGame {
  private board: (string | null)[][] = [];
  private current: ActivePiece | null = null;
  private nextType: PK = "I";
  private holdType: PK | null = null;
  private canHold = true;
  private score = 0;
  private lines = 0;
  private level = 1;
  private phase: "playing" | "over" = "playing";
  private dropTimer = 0;
  private dropInterval = 0.8; // seconds

  // Line clear flash (rows to clear, timer in seconds)
  private clearFlashRows: number[] = [];
  private clearFlashT = 0;
  private static readonly FLASH_DURATION = 0.12;

  // Rendering layout
  private cellSize = 28;
  private boardX = 0;
  private boardY = 0;
  private panelX = 0;

  constructor(config: CanvasGameConfig) {
    super(config);
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  protected onInit(): void {
    this.board = Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
    this.nextType = this.randPiece();
    this.holdType = null;
    this.canHold = true;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.phase = "playing";
    this.dropTimer = 0;
    this.dropInterval = 0.8;
    this.calcLayout();
    this.spawnPiece();
  }

  private randPiece(): PK {
    return ALL_PIECES[Math.floor(Math.random() * ALL_PIECES.length)];
  }

  private calcLayout(): void {
    const { width: w, height: h } = this.canvas;
    const panelW = Math.min(150, w * 0.22);
    const avail = w - panelW - 16;
    this.cellSize = Math.floor(Math.min(h * 0.9 / ROWS, avail * 0.9 / COLS));
    const boardW = this.cellSize * COLS;
    const boardH = this.cellSize * ROWS;
    this.boardX = Math.floor((avail - boardW) / 2);
    this.boardY = Math.floor((h - boardH) / 2);
    this.panelX = this.boardX + boardW + 12;
  }

  protected onResize(): void {
    this.calcLayout();
  }

  // ── Piece management ────────────────────────────────────────────────────────

  private spawnPiece(): void {
    const type = this.nextType;
    this.nextType = this.randPiece();
    this.current = { type, rot: 0, row: 0, col: 3 };
    if (!this.isValid(this.current)) {
      this.phase = "over";
      this.callbacks.onGameOver(this.score);
      this.current = null;
    }
  }

  private cells(p: ActivePiece): [number, number][] {
    return SHAPES[p.type][p.rot].map(([dr, dc]) => [p.row + dr, p.col + dc]);
  }

  private isValid(p: ActivePiece): boolean {
    return this.cells(p).every(
      ([r, c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS && !this.board[r][c]
    );
  }

  private lockPiece(): void {
    if (!this.current) return;
    const color = COLORS[this.current.type];
    for (const [r, c] of this.cells(this.current)) {
      if (r >= 0) this.board[r][c] = color;
    }
    this.current = null;
    this.canHold = true;
    this.clearLines();
    if (this.phase === "playing" && !this.clearFlashRows.length) this.spawnPiece();
  }

  private clearLines(): void {
    const toClear: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every((c) => c !== null)) toClear.push(r);
    }
    if (!toClear.length) return;

    // Start flash; actual collapse happens in onUpdate when flash ends
    this.clearFlashRows = toClear.slice();
    this.clearFlashT = 0;
  }

  private applyLineClearAndSpawn(): void {
    if (!this.clearFlashRows.length) return;
    const toClear = this.clearFlashRows.slice().sort((a, b) => b - a);

    for (const r of toClear) this.board.splice(r, 1);
    for (let i = 0; i < toClear.length; i++) this.board.unshift(Array(COLS).fill(null));

    const pts = [0, 100, 300, 500, 800][toClear.length] ?? 800;
    this.score += pts * this.level;
    this.lines += toClear.length;
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
      this.callbacks.onLevelUp?.(this.level);
    }
    this.dropInterval = Math.max(0.08, 0.8 - (this.level - 1) * 0.07);
    this.callbacks.onScoreUpdate(this.score);

    this.clearFlashRows = [];
    this.clearFlashT = 0;
    if (this.phase === "playing") this.spawnPiece();
  }

  private ghostRow(): number {
    if (!this.current) return 0;
    let ghost = { ...this.current };
    for (;;) {
      const next = { ...ghost, row: ghost.row + 1 };
      if (!this.isValid(next)) break;
      ghost = next;
    }
    return ghost.row;
  }

  // ── Public controls ─────────────────────────────────────────────────────────

  moveLeft(): void {
    if (!this.current || this.phase !== "playing") return;
    const next = { ...this.current, col: this.current.col - 1 };
    if (this.isValid(next)) this.current = next;
  }

  moveRight(): void {
    if (!this.current || this.phase !== "playing") return;
    const next = { ...this.current, col: this.current.col + 1 };
    if (this.isValid(next)) this.current = next;
  }

  rotate(): void {
    if (!this.current || this.phase !== "playing") return;
    const next: ActivePiece = { ...this.current, rot: (this.current.rot + 1) % 4 };
    if (this.isValid(next)) { this.current = next; return; }
    for (const kick of [-1, 1, -2, 2]) {
      const kicked = { ...next, col: next.col + kick };
      if (this.isValid(kicked)) { this.current = kicked; return; }
    }
  }

  softDrop(): void {
    if (!this.current || this.phase !== "playing") return;
    const next = { ...this.current, row: this.current.row + 1 };
    if (this.isValid(next)) {
      this.current = next;
      this.score += 1;
    } else {
      this.lockPiece();
    }
    this.dropTimer = 0;
  }

  hardDrop(): void {
    if (!this.current || this.phase !== "playing") return;
    const gr = this.ghostRow();
    this.score += (gr - this.current.row) * 2;
    this.current = { ...this.current, row: gr };
    this.lockPiece();
    this.dropTimer = 0;
  }

  holdPiece(): void {
    if (!this.current || !this.canHold || this.phase !== "playing") return;
    const curType = this.current.type;
    if (this.holdType) {
      this.current = { type: this.holdType, rot: 0, row: 0, col: 3 };
      if (!this.isValid(this.current)) {
        this.phase = "over";
        this.callbacks.onGameOver(this.score);
        this.current = null;
        return;
      }
    } else {
      this.spawnPiece();
    }
    this.holdType = curType;
    this.canHold = false;
  }

  restart(): void {
    this.onInit();
    this.callbacks.onGameStart();
  }

  isOver(): boolean { return this.phase === "over"; }

  // ── Game loop ───────────────────────────────────────────────────────────────

  protected onUpdate(dt: number): void {
    if (this.clearFlashRows.length > 0) {
      this.clearFlashT += dt;
      if (this.clearFlashT >= TetrisEngine.FLASH_DURATION) this.applyLineClearAndSpawn();
      return;
    }
    if (this.phase !== "playing" || !this.current) return;
    this.dropTimer += dt;
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      const next = { ...this.current, row: this.current.row + 1 };
      if (this.isValid(next)) {
        this.current = next;
      } else {
        this.lockPiece();
      }
    }
  }

  protected onRender(): void {
    const { ctx, canvas } = this;
    const { cellSize: cs, boardX: bx, boardY: by, panelX: px } = this;

    // Background
    ctx.fillStyle = "#1A1A2E";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Board background
    ctx.fillStyle = "#0F3460";
    ctx.fillRect(bx, by, COLS * cs, ROWS * cs);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(bx, by + r * cs); ctx.lineTo(bx + COLS * cs, by + r * cs); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(bx + c * cs, by); ctx.lineTo(bx + c * cs, by + ROWS * cs); ctx.stroke();
    }

    // Locked cells (flash rows drawn as white overlay below)
    const flashSet = new Set(this.clearFlashRows);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = this.board[r][c];
        if (color && !flashSet.has(r)) this.drawBlock(bx + c * cs, by + r * cs, cs, color);
      }
    }

    // Line clear flash
    if (this.clearFlashRows.length > 0) {
      const t = this.clearFlashT / TetrisEngine.FLASH_DURATION;
      ctx.fillStyle = t < 0.5 ? "#FFFFFF" : "rgba(255,255,255,0.7)";
      for (const r of this.clearFlashRows) {
        ctx.fillRect(bx, by + r * cs, COLS * cs, cs);
      }
    }

    // Ghost piece
    if (this.current && this.phase === "playing") {
      const gr = this.ghostRow();
      const color = COLORS[this.current.type];
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (const [dr, dc] of SHAPES[this.current.type][this.current.rot]) {
        const r = gr + dr; const c = this.current.col + dc;
        if (r >= 0) ctx.strokeRect(bx + c * cs + 1.5, by + r * cs + 1.5, cs - 3, cs - 3);
      }
    }

    // Current piece
    if (this.current) {
      const color = COLORS[this.current.type];
      for (const [dr, dc] of SHAPES[this.current.type][this.current.rot]) {
        const r = this.current.row + dr; const c = this.current.col + dc;
        if (r >= 0) this.drawBlock(bx + c * cs, by + r * cs, cs, color);
      }
    }

    // Board border
    ctx.strokeStyle = "#16213E";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, COLS * cs, ROWS * cs);

    // Right panel
    this.drawPanel(px, by, canvas.width - px - 8, ROWS * cs);

    // Game over overlay + red Restart button
    if (this.phase === "over") {
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(bx, by, COLS * cs, ROWS * cs);
      ctx.textAlign = "center";
      const cx = bx + (COLS * cs) / 2;
      ctx.fillStyle = "#EF4444";
      ctx.font = `bold ${cs * 1.1}px sans-serif`;
      ctx.fillText("GAME", cx, by + ROWS * cs * 0.38);
      ctx.fillText("OVER", cx, by + ROWS * cs * 0.48);
      const btnY = by + ROWS * cs * 0.62;
      const btnW = COLS * cs * 0.45;
      const btnH = cs * 1.4;
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.roundRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.max(12, cs * 0.5)}px sans-serif`;
      ctx.fillText("Restart", cx, btnY + 4);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `${Math.max(9, cs * 0.36)}px sans-serif`;
      ctx.fillText("Space or tap", cx, by + ROWS * cs * 0.78);
    }
  }

  private drawBlock(x: number, y: number, s: number, color: string): void {
    const { ctx } = this;
    const p = 1;
    ctx.fillStyle = color;
    ctx.fillRect(x + p, y + p, s - p * 2, s - p * 2);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(x + p, y + p, s - p * 2, 3);
    ctx.fillRect(x + p, y + p, 3, s - p * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + p, y + s - p - 3, s - p * 2, 3);
    ctx.fillRect(x + s - p - 3, y + p, 3, s - p * 2);
  }

  private drawPanel(x: number, y: number, w: number, h: number): void {
    const { ctx } = this;
    const { cellSize: cs } = this;
    if (w < 50) return;

    const small = Math.min(cs * 0.8, w / 5);
    let py = y;

    const drawPreview = (type: PK | null, label: string) => {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = `bold ${Math.max(9, cs * 0.42)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(label, x, py + 12);
      py += 16;

      const boxH = small * 2.5;
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(x, py, w, boxH);

      if (type) {
        const shape = SHAPES[type][0];
        const maxR = Math.max(...shape.map(([r]) => r));
        const maxC = Math.max(...shape.map(([, c]) => c));
        const ox = x + (w - (maxC + 1) * small) / 2;
        const oy = py + (boxH - (maxR + 1) * small) / 2;
        for (const [dr, dc] of shape) {
          this.drawBlock(ox + dc * small, oy + dr * small, small, COLORS[type]);
        }
      }
      py += boxH + 14;
    };

    drawPreview(this.nextType, "NEXT");
    drawPreview(this.holdType, "HOLD");

    const statSize = Math.max(9, cs * 0.45);
    ctx.font = `bold ${statSize}px sans-serif`;
    ctx.textAlign = "left";
    for (const { label, value } of [
      { label: "SCORE", value: this.score.toLocaleString() },
      { label: "LINES", value: String(this.lines) },
      { label: "LEVEL", value: String(this.level) },
    ]) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = `bold ${statSize}px sans-serif`;
      ctx.fillText(label, x, py);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${statSize * 1.6}px sans-serif`;
      ctx.fillText(value, x, py + statSize * 1.8);
      py += statSize * 3.5;
    }

    // Controls hint at bottom
    const remaining = y + h - py;
    if (remaining > 40) {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = `${Math.max(8, cs * 0.36)}px sans-serif`;
      const hints = ["← → Move", "↑ Rotate", "↓ Soft drop", "Space Hard drop", "C Hold"];
      let hy = y + h - hints.length * (Math.max(8, cs * 0.36) + 4);
      for (const hint of hints) {
        ctx.fillText(hint, x, hy);
        hy += Math.max(8, cs * 0.36) + 4;
      }
    }
  }
}
