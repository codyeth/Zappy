/**
 * Supabase query helpers.
 *
 * Accepts a typed client created by createClient() from either
 * ./client (browser) or ./server (Server Components).
 *
 * We use `any` for the client param to avoid fighting Supabase SSR v0.9's
 * internal PostgrestVersion:"12" generic — the returned shapes are still
 * fully typed via our domain interfaces.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LeaderboardEntry, Profile, Game } from "@/lib/types";
import { CATEGORY_GRADIENTS } from "@/data/categories";

type AnySupabaseClient = any;

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getProfile(
  supabase: AnySupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProfile(
  supabase: AnySupabaseClient,
  userId: string,
  updates: { username?: string; displayName?: string; avatarUrl?: string | null }
): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = {};
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.displayName !== undefined) payload.display_name = updates.displayName;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  return { error: error?.message ?? null };
}

// ─── Games ───────────────────────────────────────────────────────────────────

function rowToGame(row: any): Game {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    instructions: row.instructions ?? "",
    category: row.category as Game["category"],
    tags: [row.category],
    isPlayable: !row.is_coming_soon,
    isComingSoon: row.is_coming_soon,
    thumbnailGradient:
      CATEGORY_GRADIENTS[row.category] ??
      "linear-gradient(135deg, #6B7280, #4B5563)",
    thumbnailUrl: row.thumbnail_url ?? undefined,
    playCount: row.play_count ?? 0,
  };
}

export async function getGameBySlugDB(
  supabase: AnySupabaseClient,
  slug: string
): Promise<Game | null> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return rowToGame(data);
}

export async function getGamesByCategory(
  supabase: AnySupabaseClient,
  category: string
): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("play_count", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToGame);
}

export async function getAllGames(supabase: AnySupabaseClient): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("is_active", true)
    .order("play_count", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToGame);
}

// ─── Play count ───────────────────────────────────────────────────────────────

export async function incrementPlayCount(
  supabase: AnySupabaseClient,
  gameId: string
): Promise<void> {
  await supabase.rpc("increment_play_count", { game_id: gameId });
}

// ─── Scores ───────────────────────────────────────────────────────────────────

export async function submitScore(
  supabase: AnySupabaseClient,
  gameId: string,
  userId: string,
  score: number
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("scores").insert({
    game_id: gameId,
    user_id: userId,
    score,
  });
  return { error: error?.message ?? null };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(
  supabase: AnySupabaseClient,
  gameId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("game_id", gameId)
    .order("best_score", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row: any) => ({
    gameId: row.game_id,
    userId: row.user_id,
    bestScore: row.best_score,
    totalAttempts: row.total_attempts,
    lastPlayed: row.last_played,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  }));
}

// ─── Game Sessions ─────────────────────────────────────────────────────────────

export async function startSession(
  supabase: AnySupabaseClient,
  gameId: string,
  userId?: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      game_id: gameId,
      user_id: userId ?? null,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function endSession(
  supabase: AnySupabaseClient,
  sessionId: string,
  score?: number
): Promise<void> {
  await supabase
    .from("game_sessions")
    .update({
      ended_at: new Date().toISOString(),
      score: score ?? null,
    })
    .eq("id", sessionId);
}
