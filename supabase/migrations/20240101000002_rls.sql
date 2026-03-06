-- ============================================================
-- Migration: Row Level Security policies
-- ============================================================

-- ─── Enable RLS ──────────────────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.games         enable row level security;
alter table public.scores        enable row level security;
alter table public.game_sessions enable row level security;

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Anyone can read profiles (for leaderboard display names).
-- Users can only update their own profile.

create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profile is created via trigger (service role), not by the user directly.
-- No INSERT policy needed for regular users.

-- ─── games ───────────────────────────────────────────────────────────────────
-- Anyone can read active games.
-- Write operations (insert/update/delete) are admin-only via service role key.

create policy "games_select_public"
  on public.games for select
  using (is_active = true);

-- ─── scores ──────────────────────────────────────────────────────────────────
-- Anyone can read scores (public leaderboard).
-- Only authenticated users can submit scores.
-- Users can only delete their own scores.

create policy "scores_select_public"
  on public.scores for select
  using (true);

create policy "scores_insert_authenticated"
  on public.scores for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "scores_delete_own"
  on public.scores for delete
  using (auth.uid() = user_id);

-- ─── game_sessions ───────────────────────────────────────────────────────────
-- Authenticated users can insert sessions and read their own.
-- Guests (null user_id) are inserted via service role in a server action.

create policy "sessions_insert_authenticated"
  on public.game_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "sessions_select_own"
  on public.game_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.game_sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
