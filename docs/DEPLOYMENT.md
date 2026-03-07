# Zappy — Production Deployment

## Overview

- **Frontend**: Vercel (Next.js)
- **Backend**: Supabase (Auth, DB, Storage, Realtime)
- **Env**: Set in Vercel Project Settings and Supabase Dashboard

---

## 1. Vercel

### Create project

1. Push repo to GitHub and import in [Vercel](https://vercel.com).
2. Framework: **Next.js** (auto-detected). Root directory: `.` (or your monorepo root).
3. Build command: `npm run build`. Output: default (no static export for Vercel).

### Environment variables (Vercel → Project → Settings → Environment Variables)

Set for **Production** (and optionally Preview):

| Name | Description | Example |
|------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only; for Delete account) | `eyJ...` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (for OG, sitemap, canonical) | `https://zappy.games` |
| `NEXT_PUBLIC_BASE_PATH` | Leave empty on Vercel; use e.g. `/Zappy` only for GitHub Pages | *(empty)* |

**Important:** Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It is only used in server actions (e.g. delete account).

### Domain

- Vercel → Project → **Settings → Domains**: add your production domain (e.g. `zappy.games`).
- Set `NEXT_PUBLIC_SITE_URL` to that URL (no trailing slash).

### Preview deployments

- Every push to a branch gets a **Preview URL** (e.g. `zappy-xxx- team.vercel.app`).
- For Preview, you can use the same Supabase project or a separate one; set the same env vars in **Preview** in Vercel if you want auth/leaderboard on preview.

---

## 2. Supabase

### Create production project

1. [Supabase Dashboard](https://supabase.com/dashboard) → New project.
2. Note **Project URL** and **anon key** (Settings → API). Use them as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Settings → API → service_role**: copy for `SUPABASE_SERVICE_ROLE_KEY` (server-only).

### Migrations

**Cách 1 — Script trong project (khuyến nghị):**

1. Lấy connection string: Supabase Dashboard → **Settings** → **Database** → **Connection string** → chọn **URI**.
2. Copy, thay `[YOUR-PASSWORD]` bằng Database password của project.
3. Thêm vào `.env.local`:
   ```bash
   SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. Chạy:
   ```bash
   npm run migrate
   ```
   Script sẽ chạy lần lượt 4 file: `20240101000001_init_schema.sql` → `20240101000002_rls.sql` → `20240101000003_functions.sql` → `20240101000004_seed.sql`.

**Cách 2 — Supabase Dashboard:** SQL Editor, chạy từng file theo thứ tự trên.

**Cách 3 — Supabase CLI:** `npx supabase link --project-ref <ref>` rồi `npx supabase db push`.

### RLS

Already defined in `20240101000002_rls.sql`:

- **profiles**: public read; users update own row.
- **games**: public read (active only).
- **scores**: public read; authenticated insert (own user_id); users delete own.
- **game_sessions**: authenticated insert/select/update own.

No extra steps if migrations were run.

### Realtime (leaderboard live updates)

1. Supabase Dashboard → **Database → Replication**.
2. Enable **Realtime** for table `scores` (so `INSERT` events are broadcast).
3. The app subscribes via `supabase.channel().on('postgres_changes', { event: 'INSERT', table: 'scores' }, ...)` and refetches the leaderboard view.

### Chữ "Sign in to continue to ... supabase.co" → đổi thành Zappy Games / Vercel URL

Để màn hình đăng nhập hiển thị **Zappy Games** hoặc **https://zappy-smoky.vercel.app** thay vì domain Supabase:

**1. Supabase — URL của site**

1. [Supabase Dashboard](https://supabase.com/dashboard) → project → **Authentication** → **URL Configuration**.
2. **Site URL**: đặt `https://zappy-smoky.vercel.app` (hoặc domain production của bạn).
3. **Redirect URLs**: thêm:
   - `https://zappy-smoky.vercel.app/**`
   - `https://zappy-smoky.vercel.app/auth/callback`
4. Lưu.

**2. Google — tên ứng dụng**

1. [Google Cloud Console](https://console.cloud.google.com/) → project OAuth → **APIs & Services** → **OAuth consent screen**.
2. **App name**: đặt **Zappy Games** (chỗ này quyết định chữ "to continue to **Zappy Games**").
3. Lưu.

Sau khi lưu cả hai, đăng xuất rồi đăng nhập lại (hoặc mở tab ẩn danh) để xem thay đổi.

### Auth báo "Unsupported provider: provider is not enabled"

Lỗi này do **provider đăng nhập chưa bật** trong Supabase:

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) → chọn project.
2. **Authentication** → **Providers**.
3. **Email**: bật **Enable Email provider** nếu dùng đăng nhập email/mật khẩu.
4. **Google**: bật **Enable Sign in with Google**, điền Client ID và Client Secret (tạo tại [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 → Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`).

Sau khi bật, thử đăng nhập lại.

### OAuth (Google)

1. **Authentication → Providers → Google**: enable.
2. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials): Application type **Web application**, add Authorized redirect URIs:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret into Supabase Google provider.
4. In your app, sign in with `signInWithOAuth({ provider: 'google' })` (already used in AuthModal).

### Email auth

- **Authentication → Providers → Email**: enable if you use email/password.
- Configure **Email templates** and **SMTP** (or use Supabase default) under Authentication → Email Templates.

### Storage — avatars

1. **Storage**: create a bucket named **avatars**.
2. Set bucket to **Public** (so profile avatar URLs are viewable).
3. RLS (optional): allow authenticated users to upload/update their own object (path e.g. `{userId}/*`).
4. App stores avatar URL in `profiles.avatar_url` (e.g. from Storage public URL after upload).

---

## 3. Post-deploy checklist

Use this after first production deploy:

- [ ] **Homepage**: layout like CrazyGames, light theme, red accent (#EF4444).
- [ ] **5 games**: Đào Vàng, 2048, Tetris, Flappy Zap, Minesweeper — load and play.
- [ ] **Responsive + touch**: same 5 games on mobile (touch where applicable).
- [ ] **Placeholders**: non-playable slugs show “Coming Soon” (not 404).
- [ ] **Sidebar**: all categories listed and link to `/category/[slug]`.
- [ ] **Auth**: email sign-in and Google OAuth; logout; profile dropdown.
- [ ] **Profile**: `/profile/[username]` shows stats, recent scores; avatar upload works.
- [ ] **Leaderboard**: scores appear after submit; Realtime updates when new score is submitted.
- [ ] **SEO**: meta tags, sitemap at `/sitemap.xml`, robots at `/robots.txt`, JSON-LD on game pages.
- [ ] **Lighthouse**: Performance, Accessibility, Best Practices, SEO ≥ 90 where feasible.
- [ ] **404**: custom page “Oops! This level doesn’t exist” + “Back to lobby”.
- [ ] **Toasts**: white bg, red/green/blue/amber left border by variant.
- [ ] **Skeletons**: e.g. leaderboard loading shows pulse placeholders.
- [ ] **Responsive**: iPhone SE → desktop 1920px.
- [ ] **Analytics + ads**: placeholders in place; wire to your provider.
- [ ] **Favicon + OG image**: Zappy mascot (red) set in `public/` and metadata.
- [ ] **README**: project overview and link to this doc.

---

## 4. Optional: GitHub Pages (static export)

For static export (e.g. GitHub Pages), set in build env:

- `GITHUB_PAGES=1`
- `NEXT_PUBLIC_SITE_URL=https://<user>.github.io`
- `NEXT_PUBLIC_BASE_PATH=/Zappy`

Auth and leaderboard require a Supabase project; callback uses a client-side redirect (see README / auth callback page).
