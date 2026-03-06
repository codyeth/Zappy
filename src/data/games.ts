import type { Game } from "@/lib/types";
import { CATEGORY_GRADIENTS } from "./categories";

// ─── 5 Real Games ────────────────────────────────────────────────────────────

export const REAL_GAMES: Game[] = [
  {
    id: "gold-miner",
    slug: "gold-miner",
    title: "Đào Vàng",
    description: "Điều khiển cần câu để thu thập vàng và đá quý. Đạt điểm mục tiêu trước khi hết thời gian!",
    instructions: "Di chuyển cần câu bằng phím ← →. Thả móc bằng Space hoặc ↓.",
    category: "action",
    tags: ["classic", "arcade", "vietnamese"],
    badge: "hot",
    isPlayable: true,
    isComingSoon: false,
    thumbnailGradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    playCount: 15420,
    rating: 4.5,
  },
  {
    id: "puzzle-2048",
    slug: "puzzle-2048",
    title: "2048",
    description: "Trượt các ô số để ghép đôi chúng. Đạt được ô 2048 để chiến thắng!",
    instructions: "Dùng phím ← → ↑ ↓ hoặc vuốt để di chuyển tất cả ô. Hai ô cùng số sẽ ghép thành 1.",
    category: "puzzle",
    tags: ["puzzle", "numbers", "strategy"],
    badge: "top",
    isPlayable: true,
    isComingSoon: false,
    thumbnailGradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
    playCount: 28900,
    rating: 4.7,
  },
  {
    id: "tetris",
    slug: "tetris",
    title: "Tetris",
    description: "Game xếp hình kinh điển. Xoay và đặt các khối tetromino để hoàn thành hàng ngang!",
    instructions: "← → di chuyển. ↑ xoay. ↓ rơi nhanh. Space rơi thẳng. P tạm dừng.",
    category: "puzzle",
    tags: ["classic", "puzzle", "tetromino"],
    badge: "top",
    isPlayable: true,
    isComingSoon: false,
    thumbnailGradient: "linear-gradient(135deg, #06B6D4, #0891B2)",
    playCount: 42100,
    rating: 4.8,
  },
  {
    id: "flappy-zap",
    slug: "flappy-zap",
    title: "Flappy Zap",
    description: "Nhấp để bay qua các ống! Giữ nhịp tốt và lập kỷ lục cao nhất.",
    instructions: "Nhấp chuột hoặc Space để vỗ cánh. Tránh các ống xanh.",
    category: "casual",
    tags: ["casual", "flappy", "endless"],
    badge: "new",
    isPlayable: true,
    isComingSoon: false,
    thumbnailGradient: "linear-gradient(135deg, #22C55E, #EF4444)",
    playCount: 9830,
    rating: 4.2,
  },
  {
    id: "minesweeper",
    slug: "minesweeper",
    title: "Dò Mìn",
    description: "Tìm và đánh dấu tất cả các ô mìn mà không kích nổ. Game trí tuệ kinh điển!",
    instructions: "Click trái để mở ô. Click phải để đặt cờ. Số cho biết số mìn xung quanh.",
    category: "puzzle",
    tags: ["classic", "logic", "minesweeper"],
    badge: "updated",
    isPlayable: true,
    isComingSoon: false,
    thumbnailGradient: "linear-gradient(135deg, #6B7280, #374151)",
    playCount: 11250,
    rating: 4.4,
  },
];

// ─── Placeholder Games ────────────────────────────────────────────────────────

// Deterministic hash so server + client always produce the same values
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h);
}

const placeholder = (
  id: string,
  slug: string,
  title: string,
  category: Game["category"],
  badge?: Game["badge"]
): Game => {
  const h = hash(slug);
  return {
    id,
    slug,
    title,
    description: `Sắp ra mắt! ${title} đang được phát triển.`,
    instructions: "",
    category,
    tags: [category],
    badge,
    isPlayable: false,
    isComingSoon: true,
    thumbnailGradient: CATEGORY_GRADIENTS[category] ?? "linear-gradient(135deg, #6B7280, #4B5563)",
    playCount: h % 5000,
    rating: +((3.5 + (h % 140) / 100)).toFixed(1),
  };
};

export const PLACEHOLDER_GAMES: Game[] = [
  // Action
  placeholder("p-space-warrior", "space-warrior", "Space Warrior", "action", "hot"),
  placeholder("p-ninja-rush", "ninja-rush", "Ninja Rush", "action"),
  placeholder("p-robot-rampage", "robot-rampage", "Robot Rampage", "action"),
  placeholder("p-zombie-siege", "zombie-siege", "Zombie Siege", "action", "new"),

  // Adventure
  placeholder("p-lost-kingdom", "lost-kingdom", "Lost Kingdom", "adventure", "new"),
  placeholder("p-jungle-quest", "jungle-quest", "Jungle Quest", "adventure"),
  placeholder("p-pirate-treasure", "pirate-treasure", "Pirate Treasure", "adventure"),

  // Basketball
  placeholder("p-slam-dunk", "slam-dunk", "Slam Dunk", "basketball", "hot"),
  placeholder("p-street-hoops", "street-hoops", "Street Hoops", "basketball"),

  // Bike
  placeholder("p-moto-x3m", "moto-x3m", "Moto X3M", "bike", "top"),
  placeholder("p-bmx-stunts", "bmx-stunts", "BMX Stunts", "bike"),

  // Car
  placeholder("p-traffic-racer", "traffic-racer", "Traffic Racer", "car", "hot"),
  placeholder("p-car-crusher", "car-crusher", "Car Crusher", "car"),

  // Card
  placeholder("p-poker-night", "poker-night", "Poker Night", "card"),
  placeholder("p-solitaire-plus", "solitaire-plus", "Solitaire Plus", "card", "new"),
  placeholder("p-blackjack-pro", "blackjack-pro", "Blackjack Pro", "card"),

  // Casual
  placeholder("p-bubble-pop", "bubble-pop", "Bubble Pop", "casual", "top"),
  placeholder("p-candy-crush-z", "candy-crush-z", "Candy Crush Z", "casual"),
  placeholder("p-cooking-frenzy", "cooking-frenzy", "Cooking Frenzy", "casual", "new"),

  // Clicker
  placeholder("p-cookie-empire", "cookie-empire", "Cookie Empire", "clicker", "hot"),
  placeholder("p-idle-factory", "idle-factory", "Idle Factory", "clicker"),

  // Driving
  placeholder("p-drift-king", "drift-king", "Drift King", "driving", "hot"),
  placeholder("p-highway-patrol", "highway-patrol", "Highway Patrol", "driving"),

  // Escape
  placeholder("p-haunted-house", "haunted-house", "Haunted House", "escape"),
  placeholder("p-prison-break-z", "prison-break-z", "Prison Break Z", "escape", "new"),

  // FPS
  placeholder("p-pixel-shooter", "pixel-shooter", "Pixel Shooter", "fps", "hot"),
  placeholder("p-sniper-elite-z", "sniper-elite-z", "Sniper Elite Z", "fps"),

  // Horror
  placeholder("p-five-nights-z", "five-nights-z", "Five Nights Z", "horror", "hot"),
  placeholder("p-granny-escape", "granny-escape", "Granny Escape", "horror"),

  // .io
  placeholder("p-agar-z", "agar-z", "Agar Z", "io", "top"),
  placeholder("p-slither-z", "slither-z", "Slither Z", "io", "hot"),

  // Mahjong
  placeholder("p-mahjong-classic", "mahjong-classic", "Mahjong Classic", "mahjong"),
  placeholder("p-shanghai-tiles", "shanghai-tiles", "Shanghai Tiles", "mahjong"),

  // Racing
  placeholder("p-speed-racer", "speed-racer", "Speed Racer", "racing", "top"),
  placeholder("p-formula-z", "formula-z", "Formula Z", "racing", "new"),

  // Shooting
  placeholder("p-target-master", "target-master", "Target Master", "shooting"),
  placeholder("p-duck-hunt-z", "duck-hunt-z", "Duck Hunt Z", "shooting"),

  // Soccer
  placeholder("p-world-cup-z", "world-cup-z", "World Cup Z", "soccer", "hot"),
  placeholder("p-penalty-kick", "penalty-kick", "Penalty Kick", "soccer"),

  // Sports
  placeholder("p-tennis-pro", "tennis-pro", "Tennis Pro", "sports"),
  placeholder("p-boxing-champ", "boxing-champ", "Boxing Champ", "sports", "new"),

  // Stickman
  placeholder("p-stickman-fight", "stickman-fight", "Stickman Fight", "stickman", "hot"),
  placeholder("p-stick-archer", "stick-archer", "Stick Archer", "stickman"),

  // Tower Defense
  placeholder("p-kingdom-rush-z", "kingdom-rush-z", "Kingdom Rush Z", "tower-defense", "top"),
  placeholder("p-bloons-z", "bloons-z", "Bloons Z", "tower-defense"),

  // Puzzle (more — need 8+ total for homepage row)
  placeholder("p-word-search", "word-search", "Word Search", "puzzle"),
  placeholder("p-sudoku-pro", "sudoku-pro", "Sudoku Pro", "puzzle", "top"),
  placeholder("p-jigsaw-world", "jigsaw-world", "Jigsaw World", "puzzle", "new"),
  placeholder("p-crossword-z", "crossword-z", "Crossword Z", "puzzle"),
  placeholder("p-block-puzzle", "block-puzzle", "Block Puzzle", "puzzle", "hot"),

  // Action (more — need 8+ total for homepage row)
  placeholder("p-tank-battle", "tank-battle", "Tank Battle", "action"),
  placeholder("p-super-soldier", "super-soldier", "Super Soldier", "action", "top"),
  placeholder("p-boss-fight", "boss-fight", "Boss Fight", "action", "new"),

  // Casual (more — need 8+ total for homepage row)
  placeholder("p-color-switch", "color-switch", "Color Switch", "casual", "hot"),
  placeholder("p-fruit-slice", "fruit-slice", "Fruit Slice", "casual", "new"),
  placeholder("p-stack-tower", "stack-tower", "Stack Tower", "casual"),
  placeholder("p-helix-jump", "helix-jump", "Helix Jump", "casual"),
];

// ─── All Games ────────────────────────────────────────────────────────────────

export const ALL_GAMES: Game[] = [...REAL_GAMES, ...PLACEHOLDER_GAMES];

// ─── Helpers (static — for SSG/ISR, no DB needed) ─────────────────────────────

export function getGameBySlug(slug: string): Game | undefined {
  return ALL_GAMES.find((g) => g.slug === slug);
}

export function getGamesByCategory(category: Game["category"]): Game[] {
  return ALL_GAMES.filter((g) => g.category === category);
}

export function getFeaturedGames(count = 7): Game[] {
  const real = REAL_GAMES.slice(0, count);
  if (real.length >= count) return real;
  const extras = PLACEHOLDER_GAMES
    .filter((g) => g.badge === "hot" || g.badge === "top")
    .slice(0, count - real.length);
  return [...real, ...extras].slice(0, count);
}
