# Unified Travelo TMS — Netlify deployment

The public website and admin dashboard now run as **one Next.js app** (`tour-agency-backend`). There is no separate client app or internal HTTP API.

## Netlify setup

1. Connect the repo and set **Base directory** to `tour-agency-backend` (or deploy only that folder).
2. Build command: `npm run build`
3. Plugin: `@netlify/plugin-nextjs` (configured in `netlify.toml`)
4. Environment variables: same as before (`DATABASE_URL`, `DIRECT_URL`, Clerk keys, `EMAIL_USER`, etc.).  
   You can remove `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AGENCY_ID`, and `AGENCY_API_KEY` — they are no longer used.

## Domains

- **Public site:** `yourdomain.com` → `/`, `/tours`, `/contact`, `/custom-tour`
- **Admin:** `admin.yourdomain.com` → `/dashboard` (Clerk protected)

On Netlify, use branch subdomains or `admin-*.netlify.app` as described in `middleware.ts`.

## Performance

Public pages use ISR (`revalidate` 120–600s) and `unstable_cache` for tenant/tour data. Dashboard mutations call `revalidateTours()` / `revalidateDashboard()` so the storefront stays fresh without slow cross-app API calls.
