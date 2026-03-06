export interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onGameStart: () => void;
  onLevelUp?: (level: number) => void;
}
