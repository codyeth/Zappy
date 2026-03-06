-- ============================================================
-- Migration: Initial schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically via trigger on auth.users insert.

create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  username      varchar(30) unique not null,
  display_name  varchar(50) not null,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── games ───────────────────────────────────────────────────────────────────

create table if not exists public.games (
  id              uuid        primary key default uuid_generate_v4(),
  slug            text        unique not null,
  title           text        not null,
  description     text        not null default '',
  instructions    text        not null default '',
  category        text        not null,
  thumbnail_url   text,
  is_active       boolean     not null default true,
  is_coming_soon  boolean     not null default false,
  play_count      integer     not null default 0 check (play_count >= 0),
  created_at      timestamptz not null default now()
);

-- Index for common query patterns
create index if not exists games_category_idx    on public.games (category);
create index if not exists games_slug_idx        on public.games (slug);
create index if not exists games_active_idx      on public.games (is_active, is_coming_soon);

-- ─── scores ──────────────────────────────────────────────────────────────────
-- All scores kept — leaderboard uses max(score) per user per game.

create table if not exists public.scores (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  game_id     uuid        not null references public.games(id)    on delete cascade,
  score       integer     not null check (score >= 0),
  created_at  timestamptz not null default now()
);

create index if not exists scores_game_user_idx on public.scores (game_id, user_id);
create index if not exists scores_user_idx      on public.scores (user_id);

-- ─── game_sessions ───────────────────────────────────────────────────────────
-- Tracks individual play sessions (user nullable for guests).

create table if not exists public.game_sessions (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references public.profiles(id) on delete set null,
  game_id     uuid        not null references public.games(id) on delete cascade,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  score       integer     check (score >= 0),
  -- Derived: seconds between start and end
  constraint  valid_session_times check (ended_at is null or ended_at >= started_at)
);

create index if not exists sessions_game_idx on public.game_sessions (game_id);
create index if not exists sessions_user_idx on public.game_sessions (user_id);
