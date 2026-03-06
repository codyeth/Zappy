# ZAPPY — Bộ Prompt Hệ Thống cho Claude Code CLI

## Tổng quan

Bộ prompt này được thiết kế để xây dựng dự án Zappy từng bước, mỗi prompt là một giai đoạn rõ ràng. Copy từng prompt vào Claude Code CLI theo thứ tự.

**Key decisions:**
- Layout: Clone y hệt CrazyGames.com
- Theme: LIGHT THEME + Accent đỏ sáng (#EF4444)
- 5 Game MVP: Đào Vàng, 2048, Tetris, Flappy Zap, Minesweeper
- Categories trống: hiện placeholder cards với ảnh minh họa giả
- Stack: Next.js 14 + TypeScript + Tailwind + Supabase + Vercel

---

## PROMPT #1 — Vision & Concept (Đọc hiểu, CHƯA code)

```
Tôi muốn bạn hiểu rõ dự án trước khi bắt đầu bất kỳ dòng code nào. KHÔNG CODE trong bước này. Chỉ đọc, hiểu, và xác nhận lại với tôi.

## Zappy là gì?

Zappy là một web-based game portal — clone layout y hệt CrazyGames.com, nơi người dùng có thể chơi nhiều game HTML5 trực tiếp trên trình duyệt, không cần cài đặt. Games sẽ được phát triển dần dần — ban đầu chỉ có 5 game, các categories chưa có game sẽ hiển thị placeholder cards với ảnh minh họa giả.

KHÁC BIỆT LỚN NHẤT so với CrazyGames: Zappy dùng LIGHT THEME với màu chủ đạo ĐỎ SÁNG, sinh động bắt mắt (thay vì dark theme tím của CrazyGames). Bố cục layout thì giữ nguyên y hệt.

## Mục tiêu kinh doanh

- Sản phẩm thực tế để kiếm tiền qua ads (Google AdSense, video ads giữa các lượt chơi)
- Thu hút traffic qua SEO và game viral
- Mở rộng dần danh mục game theo thời gian (bắt đầu 5 game → hàng trăm game)

## Đối tượng người dùng

- Casual gamers (13-35 tuổi)
- Người muốn chơi game nhanh trên trình duyệt lúc rảnh
- Thị trường chính: Việt Nam, Đông Nam Á, mở rộng global

## ========================================
## UI/LAYOUT — CLONE Y HỆT CRAZYGAMES.COM
## NHƯNG LIGHT THEME + MÀU ĐỎ SÁNG
## ========================================

Đây là phần QUAN TRỌNG NHẤT. Bố cục layout phải clone chính xác CrazyGames.com. Chỉ khác về màu sắc: chuyển từ dark theme tím sang LIGHT THEME ĐỎ.

### COLOR PALETTE (LIGHT THEME + RED ACCENT)
- Background chính: #F9FAFB (gray-50, xám rất nhạt)
- Header/Sidebar background: #FFFFFF (trắng tinh)
- Card background: #FFFFFF
- Card border: #E5E7EB (gray-200)
- Card shadow: shadow-sm default, shadow-md hover
- Primary accent: #EF4444 (đỏ sáng — CTA buttons, active states, logo, highlights)
- Primary hover: #DC2626 (đỏ đậm hơn khi hover)
- Primary light bg: #FEF2F2 (đỏ rất nhạt — active sidebar items bg, selected states)
- Secondary accent: #F97316 (cam — dùng cho gradient banner, "New" badges)
- Text chính: #111827 (gray-900)
- Text phụ: #6B7280 (gray-500)
- Text mờ: #9CA3AF (gray-400)
- Border/Separator: #E5E7EB (gray-200)
- Badge "Top": #F59E0B (yellow/gold)
- Badge "Hot": #EF4444 (red)
- Badge "New": #22C55E (green)
- Badge "Updated": #3B82F6 (blue)
- Welcome banner: gradient from #EF4444 (red) to #F97316 (orange)

### TYPOGRAPHY
- Font: Inter (Google Fonts) hoặc system font stack
- Game title trên card: 14px, font-medium, text-gray-800
- Section title: 18-20px, font-bold, text-gray-900
- Sidebar items: 14px, font-normal, text-gray-600 (active: text-red-500 font-semibold)
- Logo: 24px, font-extrabold, text-red-500 (hoặc gradient đỏ-cam)
- Search placeholder: 14px, text-gray-400

### HEADER BAR (fixed top, full width)
- Height: ~60px
- Background: #FFFFFF (trắng)
- Border bottom: 1px solid #E5E7EB hoặc box-shadow: 0 1px 3px rgba(0,0,0,0.08)
- Z-index: 50

- BÊN TRÁI: 
  - Hamburger menu icon (☰) — chỉ hiện trên mobile (<768px), text-gray-600
  - Logo "Zappy": icon mascot nhỏ + text "Zappy", font-extrabold, text-red-500 hoặc gradient đỏ-cam. Style tương tự logo CrazyGames (có mascot icon bên cạnh chữ) nhưng tông đỏ

- CHÍNH GIỮA: 
  - Search bar lớn, chiếm ~40% width header
  - Input: rounded-full, bg-gray-100, border border-transparent, focus:border-red-300 focus:ring-2 focus:ring-red-200
  - Placeholder: "Search games and categories", text-gray-400
  - Icon kính lúp bên phải input, text-gray-400

- BÊN PHẢI: 
  - 3 icon buttons ngang hàng, mỗi cái 40x40px area:
    - Notification bell: text-gray-500, có red badge nhỏ (bg-red-500, text-white, rounded-full, min-w 18px, font-size 11px) hiện số
    - Heart/favorites: text-gray-500
    - User avatar: text-gray-500 (hoặc avatar image nếu logged in)
  - Nút "Log in": bg-red-500, hover:bg-red-600, text-white, rounded-lg, px-4 py-2, font-semibold, transition

### SIDEBAR TRÁI (fixed left, dưới header)
- Width: ~220px trên desktop
- Background: #FFFFFF (trắng)
- Border-right: 1px solid #E5E7EB
- Scroll riêng (overflow-y: auto, sidebar scroll độc lập với main content)
- Height: calc(100vh - 60px)
- Chia thành 2 NHÓM rõ ràng:

  **NHÓM 1 — Navigation chính (phía trên):**
  - Home (icon nhà): active state = text-red-500, font-semibold, bg-red-50 (#FEF2F2), icon cũng red-500
  - Recently played (icon đồng hồ): text-gray-600, icon gray-400
  - New (icon ngôi sao/sparkle)
  - Popular Games (icon trending/fire)
  - Updated (icon refresh)
  - Originals (icon đặc biệt, có small red badge dot)
  - Multiplayer (icon 2 người)
  
  → Separator line: 1px solid #E5E7EB, margin-y 8px

  **NHÓM 2 — Game Categories (phía dưới, danh sách dài, scroll được):**
  - Action (icon kiếm/sword)
  - Adventure (icon compass)
  - Basketball (icon bóng rổ)
  - Bike (icon xe đạp)
  - Car (icon ô tô)
  - Card (icon lá bài)
  - Casual (icon gamepad)
  - Clicker (icon cursor click)
  - Controller (icon controller)
  - Driving (icon vô lăng)
  - Escape (icon cửa/door)
  - Flash (icon tia chớp)
  - FPS (icon crosshair)
  - Horror (icon ghost)
  - .io (icon globe)
  - Mahjong (icon mahjong tile)
  - Puzzle (icon puzzle piece)
  - Racing (icon flag)
  - Shooting (icon target)
  - Soccer (icon bóng đá)
  - Sports (icon trophy)
  - Stickman (icon stickman)
  - Tower Defense (icon castle)
  → Cuối: link "All Tags" text-red-500 hover:underline

  **Style mỗi sidebar item:**
  - Layout: flex row, gap-3, items-center
  - Icon: 20x20px, text-gray-400
  - Text: 14px, text-gray-600
  - Padding: py-2 px-4
  - Border-radius: rounded-lg, mx-2
  - Hover: bg-gray-50, text-gray-900, icon text-gray-600
  - Active: bg-red-50, text-red-500, font-semibold, icon text-red-500

  **HIỆN TẤT CẢ categories dù chưa có game thật**

### MAIN CONTENT AREA (bên phải sidebar, dưới header)
- Margin-left: 220px (desktop), 0 (mobile)
- Margin-top: 60px (header height)
- Padding: 20px 24px
- Background: #F9FAFB (gray-50)
- Overflow-y: auto (scroll chính)

  **ROW 1 — Welcome Banner:**
  - Full width, rounded-2xl, p-5 px-8
  - Background: linear-gradient(135deg, #EF4444, #F97316)
  - Flex row, items-center, justify-between
  - Trái: Zappy icon 32px white + "Welcome to Zappy" text-xl font-bold text-white
  - Phải: USP items (icon + text 14px text-white/90, gap-6):
    "🎮 XX+ games", "📦 No install needed", "💻 On any device", "👥 Play with friends", "✨ All for free"
  - Mobile: USPs wrap hoặc ẩn bớt

  **ROW 2 — Featured Games (HERO SECTION):**
  - mt-5, phần NỔI BẬT NHẤT
  - Layout giống CrazyGames: 1 game LỚN trái (~40%, h-[280px]) + grid 3×2 phải (~60%, 6 games)
  - Cards: bg-white rounded-xl shadow-sm, hover:shadow-lg hover:scale-[1.03]
  - Badges góc trên trái: pill, text-xs font-bold text-white py-1 px-2
    - "Top" bg-yellow-500 ⭐, "Hot" bg-red-500 🔥, "New" bg-green-500 ✨, "Updated" bg-blue-500 🔄
  - Trộn game thật + placeholder. Hero LUÔN ĐẦY 7 cards.
  - Hover game thật: scale + play overlay (circle đỏ + ▶ trắng)
  - Hover placeholder: "Coming Soon" overlay (bg-black/30, text-white)

  **ROW 3+ — Game Rows (horizontal scroll, lặp lại):**
  - mt-8 mỗi section
  - Header: title text-lg font-bold text-gray-900 + "View more" text-red-500
  - Scroll: flex gap-3, overflow-x-auto, snap-x, scrollbar-hide
  - Cards: w-[180px], bg-white rounded-xl shadow-sm
    - Thumbnail aspect-[16/10], Title px-3 py-2 text-sm truncate
  - Arrow buttons: 40px rounded-full bg-white shadow-lg, chevron gray-600
  - Sections: Featured, New, Popular, Puzzle, Action, Casual
  - Mỗi row ít nhất 8 cards (trộn thật + placeholder)

### GAME CARD COMPONENT
- bg-white, rounded-xl, border gray-100, shadow-sm, overflow-hidden
- Thumbnail 16:10, object-cover. Title 14px gray-800 truncate
- Game thật hover: scale(1.03) + shadow-lg + play overlay đỏ
- Placeholder hover: "Coming Soon" overlay
- Click thật: navigate. Click placeholder: toast "Coming soon! 🎮"
- Skeleton: bg-gray-200 animate-pulse

### PLACEHOLDER STRATEGY
- Sidebar: HIỆN TẤT CẢ categories (dù trống)
- Homepage: placeholder trộn lẫn game thật → đầy đặn
- Placeholder thumbnail: CSS gradient (mỗi category 1 tông pastel) + game title overlay
- Tạo 30-40 placeholder games, tên hợp lý per category

### RESPONSIVE
- Desktop >1280: sidebar 220px, 6 cards/row
- Laptop 1024-1280: 200px, 5 cards
- Tablet 768-1024: icon-only 60px, 4 cards
- Mobile <768: hamburger drawer, 2.5 cards, hero stacks

## Games cho MVP (5 game)
1. Đào Vàng (Gold Miner — classic Vietnamese arcade)
2. 2048 (puzzle)
3. Tetris (classic/puzzle)
4. Flappy Zap (casual — Flappy Bird clone)
5. Minesweeper / Dò Mìn (puzzle/classic)

## Tech Stack: Next.js 14 + TS + Tailwind | Supabase | Vanilla JS Canvas | Vercel

## KHÔNG trong MVP: Multiplayer, IAP, crypto, iframe, chat, achievements, dark mode

---

Xác nhận bằng cách:
1. Tóm tắt 3-5 câu (PHẢI nhắc: light theme, đỏ sáng, clone CrazyGames layout)
2. Thành phần UI chính
3. 5 game MVP
4. Thứ tự triển khai
5. Rủi ro/câu hỏi

KHÔNG CODE.
```

---

## PROMPT #2 — Project Structure & Setup

```
Dựa trên concept Zappy đã thống nhất, giờ hãy khởi tạo project.

## Yêu cầu

1. Khởi tạo Next.js 14 + App Router + TypeScript + Tailwind CSS
2. Cấu trúc thư mục:
   - /app — pages (home, game/[slug], profile/[username], category/[slug], leaderboard)
   - /components — UI (layout, game-card, sidebar, header, banner, scroll-row)
   - /games — mỗi game 1 folder (gold-miner/, puzzle-2048/, tetris/, flappy-zap/, minesweeper/)
   - /lib — utilities, supabase client, types, constants
   - /data — game registry, category definitions, placeholder data
   - /public — static assets, favicon
3. Supabase client config (chưa kết nối thật)
4. GAME REGISTRY (TypeScript):
   - 5 game thật: slug, title, category, description, thumbnailUrl, isPlayable: true
     - gold-miner / "Đào Vàng" / action
     - puzzle-2048 / "2048" / puzzle
     - tetris / "Tetris" / puzzle
     - flappy-zap / "Flappy Zap" / casual
     - minesweeper / "Dò Mìn" / puzzle
   - 30-40 placeholder: isPlayable: false, isComingSoon: true, tên hợp lý per category
     - VD: "Space Warrior" (action), "Kingdom Rush" (tower-defense), "Speed Racer" (racing), "Slam Dunk" (basketball), "Poker Night" (card), "Haunted House" (horror), v.v.
     - Mỗi category ít nhất 2-3 games
5. CATEGORY REGISTRY: full list giống CrazyGames sidebar
6. Tailwind config: primary=#EF4444, dark mode OFF, font Inter
7. Layout shell: Header + Sidebar + Main (light theme)
8. Placeholder thumbnail: CSS gradients per category + title text overlay

Tạo project + giải thích cấu trúc.
```

---

## PROMPT #3 — Database Schema & Auth

```
Tiếp tục Zappy. Thiết kế database Supabase.

## Tables

### profiles
- id (uuid, FK → auth.users), username (unique varchar 30), display_name (varchar 50), avatar_url (text nullable), created_at, updated_at

### games
- id (uuid), slug (unique), title, description, instructions, category (text), thumbnail_url, is_active (bool), is_coming_soon (bool default false), play_count (int default 0), created_at

### scores
- id (uuid), user_id (FK → profiles), game_id (FK → games), score (int), created_at
- Giữ TẤT CẢ scores, leaderboard query lấy max per user

### game_sessions
- id (uuid), user_id (nullable), game_id, started_at, ended_at (nullable), score (nullable)

## RLS
- profiles: SELECT public, UPDATE own (auth.uid() = id)
- scores: SELECT public, INSERT authenticated
- games: SELECT public, write admin only
- game_sessions: INSERT authenticated, SELECT own

## Auth: Google OAuth + email/password
## Types + helpers: getProfile, submitScore, getLeaderboard(gameId, limit=10), getGameBySlug, getGamesByCategory, incrementPlayCount
## Seed: 5 real + 30-40 placeholder games

Tạo migrations + files.
```

---

## PROMPT #4 — Homepage UI (Clone CrazyGames, Light Red Theme)

```
Tiếp tục Zappy. Build trang chủ.

QUAN TRỌNG: Layout clone Y HỆT CrazyGames.com + LIGHT THEME + ACCENT ĐỎ #EF4444.
Tham khảo chi tiết Prompt #1. Nếu cần xem layout → https://www.crazygames.com/

## Build order:

### 1. Layout Shell
- Header: h-[60px] bg-white shadow-sm. Logo text-red-500. Search rounded-full bg-gray-100 focus:ring-red-300. "Log in" bg-red-500
- Sidebar: w-[220px] bg-white border-r. 2 nhóm (nav + categories). Active: text-red-500 bg-red-50
- Main: ml-[220px] mt-[60px] p-5 bg-gray-50

### 2. Welcome Banner
- gradient red-500→orange-500, rounded-2xl. "Welcome to Zappy" white + USPs

### 3. Featured Hero
- 1 big card trái 40% + grid 3×2 phải. Badges, shadows. Mix real + placeholder. LUÔN ĐẦY.

### 4. Horizontal Scroll Rows
- Sections: Featured, New, Popular, Puzzle, Action, Casual
- Cards w-[180px] bg-white rounded-xl shadow-sm. "View more" text-red-500. Arrow buttons
- Mỗi row ≥8 cards (real + placeholder)

### 5. GameCard Component
- Playable: hover scale + red play overlay. Placeholder: "Coming Soon" overlay
- Click real → navigate. Click placeholder → toast. Skeleton state.

### 6. Responsive
- Desktop: sidebar 220px, 6 cards. Tablet: icon-only 60px, 4 cards. Mobile: hamburger drawer, 2.5 cards

## Data: 5 real + 30-40 placeholder. Homepage phải ĐẦY ĐẶN.

Build toàn bộ homepage.
```

---

## PROMPT #5 — Game Engine & Đào Vàng + 2048

```
Tiếp tục Zappy. Build game engine + 2 game đầu: Đào Vàng và 2048.

## Game Engine Framework
- BaseGame abstract: init, start, pause, resume, destroy, resize
- GameCallbacks: onScoreUpdate, onGameOver, onGameStart, onLevelUp
- GameLoader React component: dynamic import, canvas, fullscreen, score→Supabase, responsive
- UI wrapper: light theme, red accent buttons

## Game #1: Đào Vàng (Gold Miner)
- Thợ mỏ trên mặt đất, móc câu auto-swing pendulum
- Click/Tap → thả móc xuống
- Items: Vàng nhỏ 50đ (nhanh), Vàng lớn 200đ (chậm), Đá 10đ (rất chậm), Kim cương 500đ (rare), Bom -100đ
- Level: target score + time limit 30-60s, khó dần
- Giữa levels: power-ups shop
- Visual: sky + underground, rope animation, item glow, colorful
- Controls: Space/Down (desktop), Tap (mobile)

## Game #2: 2048
- Grid 4x4, arrow/swipe, merge tiles, target 2048
- Tile colors tông đỏ-cam (2=gray-100 → 2048=yellow-600 glow)
- Smooth sliding animation 150ms
- Score + Best score + New Game button bg-red-500
- Controls: Arrow keys (desktop), Swipe (mobile)

## Technical: Canvas 60fps, responsive, score submit, sounds toggle

Build engine → Đào Vàng → 2048.
```

---

## PROMPT #6 — Game Page & Leaderboard

```
Tiếp tục Zappy. Build /game/[slug] + leaderboard. Light theme.

## Game Page
- Game canvas: bg-white rounded-xl shadow-sm, max size
- Toolbar: title font-bold, fullscreen/like/share icons (gray-500 hover:red-500)
- Sidebar phải (desktop): Related Games cards + Ad placeholder
- Tabs (active = border-b-2 border-red-500 text-red-500):
  - About: description + instructions
  - Leaderboard: "Your best" box (bg-red-50 border-l-4 red-500), table top 10 (🥇🥈🥉 top 3, highlight current user bg-red-50)
  - Comments: placeholder

## Placeholder games → "Coming Soon" card + "Browse other games" bg-red-500

## Leaderboard: Supabase Realtime, guest view-only, high score → confetti

## SEO: SSR meta, OG tags, JSON-LD VideoGame, breadcrumbs

Build trang game + leaderboard.
```

---

## PROMPT #7 — 3 Games còn lại (Tetris, Flappy Zap, Minesweeper)

```
Tiếp tục Zappy. Build 3 games, follow BaseGame interface.

## Tetris
- 7 tetrominos, grid 10×20, xoay/move/drop
- Score: 1 line=100, 2=300, 3=500, Tetris=800 × level
- Level up mỗi 10 lines
- Vivid piece colors, ghost piece, next preview
- Line clear: flash + collapse. Game over overlay + restart bg-red-500
- Controls: Arrows+Space (desktop), Swipe+Tap (mobile)

## Flappy Zap
- Tap/Space flap, gravity, dodge pipes
- "Zappy bird" mascot đỏ cute, modern flat design
- Sky gradient + clouds parallax + green pipes + grass
- Difficulty: gap nhỏ dần mỗi 10 pipes (150→100px)
- Score centered top, start screen "Tap to Start", game over overlay
- Controls: Space/Click (desktop), Tap (mobile)

## Minesweeper (Dò Mìn)
- 3 levels: Easy 9×9/10, Medium 16×16/40, Hard 30×16/99
- Click mở, right-click/long-press flag
- Flood fill, first click safe
- Number colors classic (1=blue...8=gray)
- Score = speed × difficulty multiplier
- Difficulty buttons: active bg-red-500. Mine counter + timer
- Controls: L-click/Tap reveal, R-click/Long-press flag

## Chung: touch support, leaderboard, responsive, sound toggle

Build: Tetris → Flappy Zap → Minesweeper.
```

---

## PROMPT #8 — Auth & Profile

```
Tiếp tục Zappy. Auth flow + profile. Light theme red accent.

## Login Modal
- bg-white rounded-2xl shadow-2xl p-8
- Email + Password inputs (focus:ring-red-300)
- "Log in" bg-red-500 w-full
- Google OAuth button (bg-white border)
- "Sign up" link text-red-500. "Continue as Guest"

## Register: username + email + password, "Sign up" bg-red-500, auto-create profile

## Smart triggers: header button + high score prompt ("Login to save your score!")

## Profile (/profile/[username])
- Header card: avatar 80px border-4 border-red-100, username, display name, member since
- Edit button: border-red-500 text-red-500 (own profile only)
- Stats: 3 cards (Games Played, Total Time, Favorite Game)
- Recent scores table: game thumbnail + title + score + date
- Achievements placeholder

## Settings: edit username/name, upload avatar, delete account (red confirm)

Build auth + profile.
```

---

## PROMPT #9 — SEO & Polish

```
Tiếp tục Zappy. SEO, performance, polish.

## SEO
- Dynamic meta tags per page. Sitemap.xml auto. robots.txt
- JSON-LD VideoGame schema. Canonical URLs. Breadcrumbs
- OG + Twitter cards

## Performance
- next/image WebP lazy. Dynamic import games. Code splitting
- CSS gradient placeholders (0 weight). Lighthouse 90+. Font preload

## Polish
- Skeletons: bg-gray-200 animate-pulse
- Toasts: bg-white shadow-lg border-l-4 border-red-500 (success/info/warning/error)
- 404: "Oops! This level doesn't exist 🎮" + "Back to lobby" bg-red-500
- Category pages: /category/[slug] grid + breadcrumb
- Scroll-to-top: bg-red-500 rounded-full
- Empty states

## Tests
- Responsive: iPhone SE → Desktop 1920
- 5 games desktop + mobile
- Auth end-to-end. Leaderboard realtime
- Placeholders "Coming Soon" correct
- Light theme consistent. Red contrast check. Accessibility

Build all optimizations.
```

---

## PROMPT #10 — Deploy & Launch

```
Tiếp tục Zappy. Deploy production.

## Vercel: project, env vars (SUPABASE_URL, ANON_KEY, SERVICE_KEY), domain, preview deployments
## Supabase: production project, migrations, seed data, RLS, OAuth, Storage "avatars", Realtime scores

## Checklist
- [ ] Homepage chuẩn CrazyGames (LIGHT THEME ĐỎ)
- [ ] 5 games work: Đào Vàng, 2048, Tetris, Flappy Zap, Minesweeper
- [ ] Games responsive + touch mobile
- [ ] Placeholders "Coming Soon"
- [ ] All categories in sidebar
- [ ] Auth: email + Google OAuth
- [ ] Profile + avatar upload
- [ ] Leaderboard realtime
- [ ] SEO: meta, sitemap, JSON-LD
- [ ] Lighthouse 90+
- [ ] 404, toasts, skeletons
- [ ] Responsive all breakpoints
- [ ] Analytics + Ad placeholders
- [ ] Favicon + OG image (Zappy mascot đỏ)
- [ ] README.md

Deploy config + checklist.
```

---

## Cách sử dụng

1. Mở terminal → `cd project` → `claude`
2. Copy **Prompt #1** → đợi AI xác nhận hiểu
3. Tuần tự đến **Prompt #10**, review mỗi bước
4. Session mới → paste lại Prompt #1 trước

**Quick fixes:**
- Sai theme → "LIGHT THEME, nền trắng/sáng, accent đỏ #EF4444, KHÔNG dark"
- Sai layout → "Layout PHẢI giống CrazyGames.com — xem lại Prompt #1"
- Thêm game → tạo /games/[slug]/, update registry isPlayable: true
