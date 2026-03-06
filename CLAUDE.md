# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (also type-checks)
npm run lint     # ESLint via next lint
npx tsc --noEmit # Type-check without building
```

No test suite is configured. Type-check with `npx tsc --noEmit` before committing.

## Project Overview

**Zappy** is a free-to-play browser game portal (CrazyGames.com clone) built with Next.js 14 App Router, Tailwind CSS, and Supabase. Light theme, accent color `#EF4444` (red-500). No dark mode.

Stack: Next.js 14, TypeScript, Tailwind CSS 3, Supabase (`@supabase/ssr`), Lucide React icons.

## Architecture

### Data Layer

All game data is **static** — no DB queries on the homepage or category pages.

- `src/data/games.ts` — `REAL_GAMES` (5 playable) + `PLACEHOLDER_GAMES` (coming-soon). The `placeholder()` helper uses a deterministic `hash(slug)` for `playCount`/`rating` — **never use `Math.random()` here** (causes SSR hydration mismatch).
- `src/data/categories.ts` — 22 category definitions + gradient map.
- `src/lib/types.ts` — all domain types (`Game`, `Category`, `LeaderboardEntry`, `Database`).
- `src/lib/supabase/helpers.ts` — typed query functions (`getLeaderboard`, `submitScore`, etc.) that accept any Supabase client (browser or server).

### Supabase Clients

- `src/lib/supabase/client.ts` — browser client (`createBrowserClient`), used in Client Components and Realtime subscriptions.
- `src/lib/supabase/server.ts` — server client (`createServerClient` + cookies), used in Server Components and Route Handlers.
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Routing

| Route | Type | Notes |
|-------|------|-------|
| `/` | Client Component | Homepage with banner, hero, and game rows |
| `/game/[slug]` | Server → Client | `generateStaticParams` pre-builds 5 real games; unknown slugs are dynamically rendered. Non-playable slugs show Coming Soon UI (not 404). |
| `/category/[slug]` | Server → Client | Pre-builds all 22 categories via `generateStaticParams` |

### Layout

`AppLayout` (client) wraps all pages with `Header` + `Sidebar` + main content offset. Sidebar widths: mobile = drawer (220px), tablet (`md`) = icon-only (60px), desktop (`lg`) = full (220px). Main content uses `md:pl-[60px] lg:pl-[220px]`.

### Game Engine

Canvas-based games extend `BaseGame` (`src/lib/game-engine/BaseGame.ts`):

- `dt` passed to `onUpdate(dt)` is in **seconds** (capped at 0.05s = 50ms per frame).
- `start()` calls `onInit()` then `callbacks.onGameStart()` — do NOT call `onGameStart()` inside `onInit()` to avoid double-firing.
- For internal restart: call `this.onInit()` then `this.callbacks.onGameStart()` manually.
- `resume()` resets `lastTimestamp = 0` to prevent dt spike after pause.

**React wrapper pattern** for canvas games (`src/games/*/index.tsx`):
- `createGame` via `useCallback([], [])` — stable reference, never recreated.
- Keyboard handling via `window.addEventListener` or `onKeyDown` on a focusable wrapper div with `tabIndex={0}` + `autoFocus` useEffect.
- Wrap `<CanvasGame>` rather than managing canvas lifecycle directly.

**Non-canvas games** (e.g., Minesweeper) are pure React components that implement `GameComponentProps` directly.

### Adding a New Game

1. Add entry to `REAL_GAMES` in `src/data/games.ts` with `isPlayable: true`.
2. Create `src/games/<slug>/` with an engine (extending `BaseGame` or pure React) and `index.tsx` exporting a default component matching `GameComponentType`.
3. Register the loader in `GAME_LOADERS` inside `src/components/game/GamePageClient.tsx`.

### `GameCallbacks` Interface

```ts
onScoreUpdate: (score: number) => void
onGameStart:   () => void           // resets score/level/status in host
onGameOver:    (finalScore: number) => void
onLevelUp?:    (level: number) => void
```

`callbacks` in `GamePageClient` is created with `useMemo(fn, [])` (empty deps) because React state setters are stable. This is intentional — do not add deps.

### Score Persistence

Personal best stored in `localStorage` with key `zappy-best-<slug>`. Confetti fires (`src/components/game/Confetti.tsx`) when `finalScore > localStorage best`. Leaderboard (`src/components/game/Leaderboard.tsx`) uses Supabase Realtime (subscribes to `INSERT` on `scores` table, then refetches the `leaderboard` view).

### UI Conventions

- Accent: `red-500` / `red-600` for hover. Active tab: `border-b-2 border-red-500 text-red-500`.
- Card hover: `hover:shadow-lg hover:scale-[1.03]`.
- No emojis in UI output unless the user explicitly requests them.
- `cn()` from `src/lib/utils.ts` = `clsx` + `tailwind-merge`.
- Toast notifications: `useToast()` from `src/components/ui/Toast.tsx`.
