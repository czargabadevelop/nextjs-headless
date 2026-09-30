# nextjs-headless

Next.js (App Router) boilerplate that renders content from a headless WordPress
site via the `wp-json` REST API.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- WordPress REST API (`/wp-json/wp/v2/...`) — no plugin required

## Getting started

```bash
npm install
cp .env.example .env   # then edit the values
npm run dev
```

Open http://localhost:3000.

## Environment variables

`.env` is **gitignored** (see `.gitignore`). Commit only `.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `WORDPRESS_URL` | yes | Base URL of WordPress, no trailing slash and no `/wp-json` suffix. e.g. `https://blog.example.com` |
| `WP_JSON_URL` | no | Overrides the REST root if it lives somewhere else, e.g. `https://blog.example.com/wp-json` |
| `WP_IMAGE_HOSTS` | no | Comma-separated extra media hosts for `next/image` (CDN/S3), e.g. `cdn.example.com` |
| `NEXT_PUBLIC_SITE_URL` | no | Public origin of this app (canonical URLs) |
| `WP_WEBHOOK_SECRET` | no | Enables `POST /api/revalidate` on-demand cache busting |

`.env.example` is the committed template — copy it to `.env` locally.

## Project structure

```
app/
  (home)/
    page.tsx               # post index (SSR + ISR)
    loading.tsx            # skeleton for the index route only
  posts/[slug]/page.tsx    # single post (SSG + ISR)
  [slug]/page.tsx          # any other WP page (e.g. /about)
  api/revalidate/route.ts  # on-demand revalidation webhook
  not-found.tsx
  global-error.tsx
components/PostCard.tsx
lib/
  api.ts                   # typed WP queries (getPosts, getPost, getPage...)
  types.ts                 # WP REST response types
  utils.ts                 # embedded-media helpers
  wordpress.ts             # fetch client + base URL resolution
```

> **Note on `loading.tsx`:** a `loading.tsx` above a route wraps it in a
> Suspense boundary, which makes Next stream the response with status `200` —
> including when the page calls `notFound()`. The skeleton is therefore scoped
> to `app/(home)/`, which can never 404. Keep `loading.tsx` off detail routes
> (`/posts/[slug]`, `/[slug]`) so missing content returns a real `404`.

## How the WordPress URL is resolved

`lib/wordpress.ts` builds the API root as:

```
WP_JSON_URL ?? WORDPRESS_URL  →  + "/wp-json"
```

So `WORDPRESS_URL=https://example.com` fetches
`https://example.com/wp-json/wp/v2/posts`.

## Caching

Every query in `lib/api.ts` uses the Next.js Data Cache with an explicit
`revalidate` and a `wordpress` tag:

- post list / single post → 60s
- pages, categories, authors → 300s

To purge instantly on publish, call `POST /api/revalidate` with
`x-wp-webhook-secret: <WP_WEBHOOK_SECRET>` and body `{"tag": "posts"}`.
Without `WP_WEBHOOK_SECRET` the route answers `503` and does nothing.

## Scripts

```bash
npm run dev         # start dev server
npm run build       # production build
npm run start       # start production server
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

## Optional: WordPress-side setup

- Install **JWT Authentication for the WP REST API** only if you need write
  access. Public reads need nothing.
- Permalinks must be "Post name" (or any pretty structure) so slugs resolve.
