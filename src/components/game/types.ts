import type { GameCallbacks } from "@/lib/game-engine/types";

export interface GameComponentProps {
  callbacks: GameCallbacks;
  soundEnabled: boolean;
  paused: boolean;
}

export type GameComponentType = React.ComponentType<GameComponentProps>;
