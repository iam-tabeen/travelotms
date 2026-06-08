# Unified Travelo TMS — Netlify deployment

The public website and admin dashboard run as **one Next.js app**.

## Netlify setup

1. Import repo: https://github.com/iam-tabeen/travelotms
2. Build command: `npm run build` (from `netlify.toml`)
3. Add all env vars from your local `.env` (never commit `.env`)

## URLs on Netlify

Netlify gives **one** site URL, e.g. `https://travelotms.netlify.app`.

| Area | URL |
|------|-----|
| Public site | `https://travelotms.netlify.app/` |
| Tours | `https://travelotms.netlify.app/tours` |
| **Dashboard** | `https://travelotms.netlify.app/dashboard` |
| Sign in | `https://travelotms.netlify.app/sign-in` |

Do **not** use `admin-travelotms.netlify.app` — that is a separate Netlify site name and will show "Site not found".

When you add a custom domain later:

- Public: `yourdomain.com`
- Admin: `admin.yourdomain.com` (add as domain alias in Netlify → Domain management)

## Clerk on Netlify

In the [Clerk Dashboard](https://dashboard.clerk.com) → your app → **Paths / Domains**, add:

- `https://travelotms.netlify.app`
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in URL: `/dashboard`

Required env vars:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Performance

Public pages use ISR and `unstable_cache`. Dashboard saves call `revalidateTours()` / `revalidateDashboard()` so the storefront stays fresh.
