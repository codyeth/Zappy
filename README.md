# Zappy — Play Free Games Online

Game portal (CrazyGames-style) built with Next.js 14, Tailwind, and Supabase. Light theme, red accent.

## Environment

Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required for **auth, leaderboard, profile**. Without these, the app builds and runs but login/profile/leaderboard will not work.
- `SUPABASE_SERVICE_ROLE_KEY` — optional, only for **Delete account** in profile settings.

In Supabase Dashboard: create a storage bucket **avatars** (public) for profile avatar uploads.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) (Inter) for optimized font loading.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on GitHub Pages

On every push to `main`, the [workflow](.github/workflows/deploy-pages.yml) builds a static export and deploys to GitHub Pages.

**Nếu trang vẫn hiện README:** Vào repo **Settings → Pages → Build and deployment → Source** chọn **GitHub Actions** (không dùng "Deploy from a branch"). Chi tiết: [docs/GITHUB_PAGES_SETUP.md](docs/GITHUB_PAGES_SETUP.md).

Site: `https://<username>.github.io/Zappy/`

## Testing

Manual QA checklist: [docs/TESTING.md](docs/TESTING.md) (responsive, 5 games, auth, leaderboard, SEO, polish, theme, accessibility).
