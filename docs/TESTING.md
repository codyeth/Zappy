# Zappy — Testing Checklist

Use this checklist for manual QA before release. No automated test suite is configured (see CLAUDE.md).

## Responsive

- [ ] **iPhone SE** (375×667): Home, category, game page, sidebar drawer, header, toasts, 404, scroll-to-top
- [ ] **Tablet** (768px): Icon-only sidebar, grid columns
- [ ] **Desktop** (1920px): Full sidebar, max-width content, no overflow

## Games

- [ ] **Desktop**: All 5 playable games load and run (Gold Miner, 2048, Tetris, Flappy Zap, Minesweeper)
- [ ] **Mobile**: Same 5 games work with touch (no keyboard required where possible)
- [ ] **Coming Soon**: Non-playable slugs show "Coming Soon" UI and related games, not 404

## Auth & Leaderboard

- [ ] **Auth**: Login/Register modal, logout, profile dropdown
- [ ] **Profile**: `/profile/[username]` shows stats, recent scores, settings (username/avatar/delete)
- [ ] **Leaderboard**: Realtime updates when a new score is submitted (same game)
- [ ] **Submit score**: Guest sees "Login to save your score!" when game over with score > 0

## SEO & Meta

- [ ] **Home**: Title, description, OG, Twitter card
- [ ] **Category**: Dynamic title/description, canonical, OG, breadcrumb
- [ ] **Game**: Dynamic meta, canonical, JSON-LD VideoGame + BreadcrumbList, OG/Twitter
- [ ] **Sitemap**: `/sitemap.xml` exists and lists /, /game/*, /category/*
- [ ] **Robots**: `/robots.txt` allows /, disallows /profile/, /auth/, references sitemap

## Polish

- [ ] **Toasts**: White background, shadow-lg, border-l-4 (red/green/blue/amber by variant)
- [ ] **404**: "Oops! This level doesn't exist" + "Back to lobby" (red rounded-full button)
- [ ] **Category**: Breadcrumb "Home > Category Name"
- [ ] **Scroll-to-top**: Red rounded-full button appears after scroll, smooth scroll to top
- [ ] **Empty states**: Leaderboard "No scores yet", category "No games found" when filter removes all
- [ ] **Skeletons**: Leaderboard loading shows gray pulse rows

## Theme & Accessibility

- [ ] **Light theme**: Consistent bg-gray-50, no dark mode
- [ ] **Accent**: Red (#EF4444) for primary actions, hover red-600
- [ ] **Contrast**: Red on white meets WCAG for focus/buttons
- [ ] **Focus**: Visible focus ring on buttons and links (keyboard nav)

## Performance

- [ ] **Lighthouse** (mobile + desktop): Performance, Accessibility, Best Practices, SEO ≥ 90 where feasible
- [ ] **Images**: next/image used for any real thumbnails; placeholders are CSS gradients (0 weight)
- [ ] **Games**: Dynamically imported (code splitting) per game slug
