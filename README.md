# Clarevix

Pakistan's Clean Luxury Skincare — storefront and admin panel.

A static-first e-commerce site built with **Astro 5**, **TypeScript**, and **Tailwind CSS v4**, backed by **Supabase** for data and authentication. Free to host on **Cloudflare Pages**; ~$10/year for the domain is the only cost until you grow past free tiers.

## Stack

- **[Astro 5](https://astro.build)** — static site framework, fast builds, zero JS by default
- **TypeScript** (strict) — type safety end to end
- **Tailwind CSS v4** — utility-first styling with `@theme` design tokens
- **[Supabase](https://supabase.com)** — Postgres database, auth, and storage
- **[nanostores](https://github.com/nanostores/nanostores)** — tiny reactive state for the cart
- **ESLint + Prettier** — code quality
- **GitHub Actions** — CI runs format + build on every PR

## Project structure

```
clarevix-store/
├── public/                     # Static assets served as-is
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── BottleSvg.astro     # Category-based product SVGs (image fallback)
│   │   ├── Cart.astro          # Cart sidebar
│   │   ├── CheckoutModal.astro # Multi-step checkout
│   │   ├── Footer.astro
│   │   ├── MobileNav.astro
│   │   ├── Nav.astro
│   │   └── ProductCard.astro
│   ├── layouts/
│   │   └── BaseLayout.astro    # Wraps every page; cart + checkout JS lives here
│   ├── lib/
│   │   ├── cart.ts             # Reactive cart store (nanostores)
│   │   ├── seed-products.ts    # Fallback data for demo mode
│   │   ├── supabase.ts         # Supabase client + helpers
│   │   ├── types.ts            # Database + UI types
│   │   └── utils.ts            # Shared helpers
│   ├── pages/
│   │   ├── index.astro         # Home
│   │   ├── products.astro      # Catalog with filter
│   │   ├── certificates.astro
│   │   ├── contact.astro
│   │   └── admin/
│   │       ├── login.astro
│   │       └── index.astro     # Dashboard: products + orders
│   ├── styles/
│   │   └── global.css          # Tailwind + Clarevix design system
│   └── env.d.ts                # Astro env types
├── supabase/
│   └── schema.sql              # One-shot setup for tables + RLS + storage
├── .github/workflows/ci.yml    # Lint + build on push/PR
├── .env.example                # Copy to .env and fill in
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## Quick start (local development)

**Prerequisites:** Node.js 20+, npm.

```bash
# 1. Install dependencies
npm install

# 2. Copy env template (optional — runs in demo mode without real Supabase)
cp .env.example .env

# 3. Run the dev server
npm run dev
```

Open `http://localhost:4321`. The site runs in **demo mode** with seed products until you configure Supabase.

## Demo vs. production mode

- **Demo mode** (no `.env` or placeholder values): products come from `src/lib/seed-products.ts`, orders save to browser `localStorage`. Useful for local preview, design reviews, and Storybook-style work.
- **Production mode** (real Supabase keys in `.env`): products come from the database, orders save to the database, admin login authenticates against Supabase Auth.

The codebase detects which mode it's in automatically — see `isSupabaseConfigured` in `src/lib/supabase.ts`.

## Setting up Supabase

1. Create a new project at [supabase.com](https://supabase.com) (free tier is fine)
2. Once provisioned, open **SQL Editor** and run the contents of `supabase/schema.sql` — this creates the `products` and `orders` tables, sets Row Level Security, creates the `product-images` storage bucket, and seeds 13 starter products
3. Create an admin user: **Authentication → Users → Add user**. Toggle "Auto Confirm User" on so they can log in without email verification
4. Copy your **Project URL** and **anon public key** from **Project Settings → API**
5. Paste into `.env`:

   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   PUBLIC_SITE_URL=https://clarevix.com
   ```

6. Restart `npm run dev`. The admin login at `/admin/login` should now work.

## Deploying to Cloudflare Pages

1. Push this repo to GitHub
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Pick the repo. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20`
4. Under **Environment variables**, add the same three `PUBLIC_*` keys from your `.env`
5. Deploy. Add your custom domain (clarevix.com) in the **Custom domains** tab

CI runs the same build on every PR via GitHub Actions, so you'll catch broken pushes before they reach production.

## Available scripts

```bash
npm run dev          # Start dev server with HMR
npm run build        # Type-check + production build → dist/
npm run preview      # Preview the production build locally
npm run lint         # ESLint
npm run format       # Prettier write
npm run format:check # Prettier check (used in CI)
```

## How the admin panel works

- Customers never see anything admin-related. The `/admin` routes are linked nowhere on the public site
- `/admin/login` authenticates against Supabase Auth (email + password)
- `/admin` (the dashboard) checks the Supabase session on mount; redirects to login if absent
- Products tab: full CRUD with image upload to Supabase Storage
- Orders tab: live view of customer orders, click any row to expand

To brief your store manager: send them `clarevix.com/admin/login` plus their credentials. That's it.

## Adding online payments (later)

Right now the checkout supports COD, EasyPaisa, JazzCash, card, and bank transfer — but the non-COD options just display your account info and ask the customer to send a screenshot. When you're ready to accept real online payments, integrate **[SafePay](https://getsafepay.com)** (Pakistan's Stripe equivalent — cards + EasyPaisa + JazzCash + bank all in one). It's about half a day of work to add a real payment flow on top of this codebase.

## License

Private — © Clarevix. All rights reserved.
