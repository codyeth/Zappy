export type Grid = number[][];

/** Create empty 4×4 grid with 2 starter tiles */
export function createGrid(): Grid {
  return addTile(addTile(emptyGrid()));
}

function emptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

/** Add a random 2 (90%) or 4 (10%) to an empty cell */
export function addTile(grid: Grid): Grid {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (grid[r][c] === 0) empty.push([r, c]);

  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  return grid.map((row, ri) =>
    row.map((v, ci) => (ri === r && ci === c ? (Math.random() < 0.9 ? 2 : 4) : v))
  );
}

export type Direction = "up" | "down" | "left" | "right";

export interface MoveResult {
  grid: Grid;
  gained: number; // score gained this move
  moved: boolean;
}

/** Slide tiles in `dir`. Returns new grid + score gained + whether anything moved. */
export function slide(grid: Grid, dir: Direction): MoveResult {
  // Normalise: rotate so we always process "left"
  const rotated = rotFor(grid, dir);
  let gained = 0;

  const next: Grid = rotated.map((row) => {
    const tiles = row.filter((v) => v !== 0);
    const merged: number[] = [];
    let i = 0;
    while (i < tiles.length) {
      if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
        const val = tiles[i] * 2;
        merged.push(val);
        gained += val;
        i += 2;
      } else {
        merged.push(tiles[i]);
        i++;
      }
    }
    while (merged.length < 4) merged.push(0);
    return merged;
  });

  const moved = JSON.stringify(next) !== JSON.stringify(rotated);
  return { grid: rotBack(next, dir), gained, moved };
}

export function hasWon(grid: Grid): boolean {
  return grid.some((row) => row.some((v) => v >= 2048));
}

export function isGameOver(grid: Grid): boolean {
  // Any empty cell?
  if (grid.some((row) => row.some((v) => v === 0))) return false;
  // Any adjacent equal cells?
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
    }
  return true;
}

// ── Rotation helpers ─────────────────────────────────────────────────────────

function transpose(g: Grid): Grid {
  return g[0].map((_, c) => g.map((row) => row[c]));
}

function flipH(g: Grid): Grid {
  return g.map((row) => [...row].reverse());
}

/** Rotate grid so that `dir` becomes "left" */
function rotFor(g: Grid, dir: Direction): Grid {
  switch (dir) {
    case "left":  return g;
    case "right": return flipH(g);
    case "up":    return transpose(g);
    case "down":  return flipH(transpose(g));
  }
}

/** Rotate back from "left" processing to original orientation */
function rotBack(g: Grid, dir: Direction): Grid {
  switch (dir) {
    case "left":  return g;
    case "right": return flipH(g);
    case "up":    return transpose(g);
    case "down":  return transpose(flipH(g));
  }
}
