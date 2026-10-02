# Crystaura storefront (Next.js)

Next.js 16 (App Router) port of the `divine-shop` React/Vite storefront, with the same
design, built for SEO: every public page is server-rendered with its own title,
description, canonical URL, Open Graph tags and JSON-LD.

It talks to the existing Express backend (`../backend`); no backend changes are required.

## Run

```bash
npm install
cp .env.example .env.local   # then edit as needed
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

This app needs a **Node.js server** (Vercel, a VPS, or Hostinger's Node.js hosting).
It cannot be deployed as static files like the old Vite build, because pages are rendered
and revalidated on the server.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin used for canonicals, sitemap, JSON-LD. Default `https://crystaura.co.in`. |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API for the browser. Defaults to `http://localhost:8000/api` in dev and the Hostinger backend in production. |
| `API_BASE_URL` | Optional backend URL for server rendering (e.g. an internal address). |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional; defaults to the existing pixel. |

The backend's CORS allowlist (`backend/app.js`) must include the site's origin. It already
allows `https://crystaura.co.in`, `https://www.crystaura.co.in`, `https://shop.crystaura.in`, `https://www.crystaura.in`, `https://crystaura.in` and `http://localhost:3000`.

## How pages are rendered

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | Static + ISR (5 min) | Homepage sections from `/api/homepage`; FAQPage JSON-LD |
| `/shop` | Server-rendered per request | Filters, sort and page live in the URL (`?category=&sub=&purpose=&rashi=&q=&sort=&page=`); ItemList JSON-LD; search results are `noindex` |
| `/product/[slug]` | ISR (5 min) | Product + BreadcrumbList JSON-LD; legacy ObjectId URLs and renamed slugs 308-redirect to the current slug |
| `/blog`, `/blog/[slug]` | Server / ISR | Full article HTML in the page; Article JSON-LD |
| `/cart`, `/checkout`, `/account`, `/orders`, `/addresses`, auth pages | Client | `noindex`; account pages redirect to `/login?redirect=…` when signed out |

- Titles and descriptions come from the admin panel via `GET /api/seo/meta`.
- `sitemap.xml` is generated from live products, categories, purposes, rashis and blog posts, and refreshed hourly.
- `robots.txt` is generated too.
- `proxy.ts` applies admin-managed redirects (`/api/redirects/lookup`) to legacy URLs.
- `proxy.ts` also forwards password-reset email links (`/?token=…`) to `/reset-password`.
- If the backend is unreachable, pages throw instead of caching empty content. ISR keeps
  serving the last good version.

## Layout

```
app/(shop)/      storefront pages (navbar + footer)
app/(auth)/      login, register, forgot/reset password (full-screen)
components/      UI (ported 1:1 from divine-shop/src/components)
lib/server-api   server-side data fetching (cached)
lib/api          browser API client (tokens, cart, orders)
lib/seo          metadata + JSON-LD helpers
```
