-- ============================================================
-- Migration: Database functions and triggers
-- ============================================================

-- ─── Auto-create profile on signup ───────────────────────────────────────────
-- Triggered when a new row is inserted into auth.users (via Google OAuth or email).
-- Derives username from email or Google metadata, ensures uniqueness with suffix.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username  text;
  final_username text;
  display        text;
  suffix         int := 0;
begin
  -- Prefer full_name from Google OAuth metadata
  display := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Build a URL-safe base username (lowercase, alphanumeric + underscore, max 25 chars)
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'preferred_username', split_part(new.email, '@', 1)),
    '[^a-z0-9_]', '_', 'g'
  ));
  base_username := substring(base_username, 1, 25);
  final_username := base_username;

  -- Resolve conflicts by appending a numeric suffix
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || '_' || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    substring(display, 1, 50),
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$;

-- Drop + recreate trigger to allow re-running migration safely
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Update profiles.updated_at automatically ────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── Increment play_count atomically ─────────────────────────────────────────
-- Called from server-side code via rpc to avoid race conditions.

create or replace function public.increment_play_count(game_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.games
  set play_count = play_count + 1
  where id = game_id;
end;
$$;

-- ─── Leaderboard view: max score per user per game ───────────────────────────
-- This view is what client code queries — no need to do GROUP BY every time.

create or replace view public.leaderboard as
select
  s.game_id,
  s.user_id,
  max(s.score)          as best_score,
  count(*)              as total_attempts,
  max(s.created_at)     as last_played,
  p.username,
  p.display_name,
  p.avatar_url
from public.scores s
join public.profiles p on p.id = s.user_id
group by s.game_id, s.user_id, p.username, p.display_name, p.avatar_url;

-- Grant SELECT on the view to anon + authenticated
grant select on public.leaderboard to anon, authenticated;
