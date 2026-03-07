// ─── Domain Types ─────────────────────────────────────────────────────────────

export type CategorySlug =
  | "action"
  | "adventure"
  | "basketball"
  | "bike"
  | "car"
  | "card"
  | "casual"
  | "clicker"
  | "driving"
  | "escape"
  | "fps"
  | "horror"
  | "io"
  | "mahjong"
  | "multiplayer"
  | "puzzle"
  | "racing"
  | "shooting"
  | "soccer"
  | "sports"
  | "stickman"
  | "tower-defense"
  | "originals";

export type BadgeType = "top" | "hot" | "new" | "updated";

/** Unified game shape used across the frontend (DB row + registry data merged). */
export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructions: string;
  category: CategorySlug;
  tags: string[];
  badge?: BadgeType;
  isPlayable: boolean;
  isComingSoon: boolean;
  thumbnailGradient: string; // CSS gradient for placeholder cards
  thumbnailUrl?: string;     // Real image URL if available
  playCount: number;
  rating?: number;
}

export interface Category {
  slug: CategorySlug;
  label: string;
  icon: string;
}

// ─── Auth / User Types ────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  gameId: string;
  userId: string;
  bestScore: number;
  totalAttempts: number;
  lastPlayed: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface GameSession {
  id: string;
  userId: string | null;
  gameId: string;
  startedAt: string;
  endedAt: string | null;
  score: number | null;
}

export interface RecentScoreEntry {
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  thumbnailGradient: string;
  score: number;
  createdAt: string;
}

export interface ProfileStats {
  gamesPlayed: number;
  totalTimeSeconds: number;
  favoriteGameTitle: string | null;
}

// ─── Supabase Database Types ──────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
        };
        Update: {
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
        };
      };
      games: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          instructions: string;
          category: string;
          thumbnail_url: string | null;
          is_active: boolean;
          is_coming_soon: boolean;
          play_count: number;
          created_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          description?: string;
          instructions?: string;
          category: string;
          thumbnail_url?: string | null;
          is_active?: boolean;
          is_coming_soon?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          instructions?: string;
          category?: string;
          thumbnail_url?: string | null;
          is_active?: boolean;
          is_coming_soon?: boolean;
          play_count?: number;
        };
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          score: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          game_id: string;
          score: number;
        };
        Update: never;
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          game_id: string;
          started_at: string;
          ended_at: string | null;
          score: number | null;
        };
        Insert: {
          user_id?: string | null;
          game_id: string;
          started_at?: string;
          ended_at?: string | null;
          score?: number | null;
        };
        Update: {
          ended_at?: string | null;
          score?: number | null;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          game_id: string;
          user_id: string;
          best_score: number;
          total_attempts: number;
          last_played: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
        };
      };
    };
    Functions: {
      increment_play_count: {
        Args: { game_id: string };
        Returns: void;
      };
    };
  };
}

// Convenience type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
