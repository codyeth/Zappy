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
import type { LeaderboardEntry, Profile, Game, RecentScoreEntry, ProfileStats } from "@/lib/types";
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

export async function getProfileByUsername(
  supabase: AnySupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    const lower = username.toLowerCase();
    if (lower === username) return null;
    const r2 = await supabase.from("profiles").select("*").eq("username", lower).single();
    if (r2.error || !r2.data) return null;
    const d = r2.data;
    return {
      id: d.id,
      username: d.username,
      displayName: d.display_name,
      avatarUrl: d.avatar_url,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }
  const d = data;
  return {
    id: d.id,
    username: d.username,
    displayName: d.display_name,
    avatarUrl: d.avatar_url,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
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

// ─── Resolve game slug → DB uuid (scores table uses games.id) ─────────────────

export async function getGameUuidBySlug(
  supabase: AnySupabaseClient,
  slug: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("games")
    .select("id")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return data.id;
}

// ─── Scores ───────────────────────────────────────────────────────────────────
// gameSlug: app game slug (e.g. "gold-miner"). Resolved to DB uuid for insert.

export async function submitScore(
  supabase: AnySupabaseClient,
  gameSlug: string,
  userId: string,
  score: number
): Promise<{ error: string | null }> {
  const gameUuid = await getGameUuidBySlug(supabase, gameSlug);
  if (!gameUuid) return { error: "Game not found" };
  const { error } = await supabase.from("scores").insert({
    game_id: gameUuid,
    user_id: userId,
    score,
  });
  return { error: error?.message ?? null };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
// gameSlug: app game slug. Resolved to DB uuid for query.

export async function getLeaderboard(
  supabase: AnySupabaseClient,
  gameSlug: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const gameUuid = await getGameUuidBySlug(supabase, gameSlug);
  if (!gameUuid) return [];
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("game_id", gameUuid)
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

// ─── Profile: recent scores & stats ───────────────────────────────────────────

export async function getRecentScores(
  supabase: AnySupabaseClient,
  userId: string,
  limit = 10
): Promise<RecentScoreEntry[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("game_id, score, created_at, games(slug, title, category)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row: any) => {
    const g = row.games;
    return {
      gameId: row.game_id,
      gameSlug: g?.slug ?? "",
      gameTitle: g?.title ?? "Game",
      thumbnailGradient: g?.category ? (CATEGORY_GRADIENTS[g.category as keyof typeof CATEGORY_GRADIENTS] ?? "linear-gradient(135deg, #6B7280, #4B5563)") : "linear-gradient(135deg, #6B7280, #4B5563)",
      score: row.score,
      createdAt: row.created_at,
    };
  });
}

export async function getProfileStats(
  supabase: AnySupabaseClient,
  userId: string
): Promise<ProfileStats> {
  const [scoresRes, sessionsRes, favRes] = await Promise.all([
    supabase.from("scores").select("game_id").eq("user_id", userId),
    supabase.from("game_sessions").select("started_at, ended_at").eq("user_id", userId).not("ended_at", "is", null),
    supabase.from("leaderboard").select("game_id").eq("user_id", userId).order("best_score", { ascending: false }).limit(1).single(),
  ]);

  const gamesPlayed = new Set((scoresRes.data ?? []).map((r: { game_id: string }) => r.game_id)).size;
  let totalTimeSeconds = 0;
  for (const s of sessionsRes.data ?? []) {
    if (s.ended_at && s.started_at) {
      totalTimeSeconds += (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000;
    }
  }
  let favoriteGameTitle: string | null = null;
  if (favRes.data?.game_id) {
    const { data: game } = await supabase.from("games").select("title").eq("id", favRes.data.game_id).single();
    favoriteGameTitle = game?.title ?? null;
  }
  return { gamesPlayed, totalTimeSeconds, favoriteGameTitle };
}
