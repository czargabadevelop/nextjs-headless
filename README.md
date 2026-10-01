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
components/
  PostCard.tsx
  SiteNav.tsx              # header nav built from published WP pages
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

## Navigation

The header menu is **not** hard-coded. `components/SiteNav.tsx` queries top-level
published pages (`/wp/v2/pages?parent=0&orderby=menu_order`) and renders them
next to a `Posts` link. Order comes from WordPress **Page Attributes → Order**;
titles are HTML-entity decoded.

Slugs listed in `HIDDEN_SLUGS` (`home`, `privacy-policy`) are skipped. If
WordPress is unreachable the nav degrades to the `Posts` link only instead of
crashing the layout.

## How the WordPress URL is resolved

`lib/wordpress.ts` builds the API root as:

```
WP_JSON_URL ?? WORDPRESS_URL  →  + "/wp-json"
```

So `WORDPRESS_URL=https://example.com` fetches
`https://example.com/wp-json/wp/v2/posts`.

## WordPress REST API endpoints

All reads go through `wpFetch` (`lib/wordpress.ts`) against
`${WP_JSON_URL ?? WORDPRESS_URL}/wp-json`. They are **public** — no plugin or
auth is required for reads.

| # | Endpoint | Used by | Key params | Revalidate | Cache tags |
| --- | --- | --- | --- | --- | --- |
| 1 | `GET /wp/v2/posts` | `getPosts` (`lib/api.ts`) → post index, static params | `per_page=10`, `orderby=date`, `order=desc`, `_embed=1` | 60s | `wordpress`, `posts` |
| 2 | `GET /wp/v2/posts` | `getPost` → single post page | `slug=<slug>`, `per_page=1`, `_embed=1` | 60s | `wordpress`, `posts`, `post:<slug>` |
| 3 | `GET /wp/v2/posts` | `getPostCount` → total counter (reads `X-WP-Total` header) | `per_page=1` | 60s | `wordpress`, `posts` |
| 4 | `GET /wp/v2/pages` | `getPages` → generic page list | `per_page=20`, `_embed=1` | 300s | `wordpress`, `pages` |
| 5 | `GET /wp/v2/pages` | `getPage` → `/[slug]` route | `slug=<slug>`, `per_page=1`, `_embed=1` | 300s | `wordpress`, `pages`, `page:<slug>` |
| 6 | `GET /wp/v2/pages` | `getNavPages` → `components/SiteNav.tsx` | `parent=0`, `orderby=menu_order`, `order=asc`, `per_page=20`, `_fields=id,slug,title,menu_order` | 300s | `wordpress`, `pages`, `nav` |
| 7 | `GET /wp/v2/categories` | `getCategories` | `per_page=100` | 300s | `wordpress`, `categories` |
| 8 | `GET /wp/v2/users/<id>` | `getAuthor` → post byline | — | 300s | `wordpress`, `author:<id>` |

Requests must return JSON; a non-2xx response throws `WordPressError` with the
HTTP status attached (routes map `404` to `notFound()`).

### App-side endpoint

| Endpoint | Method | Auth | Body | Effect |
| --- | --- | --- | --- | --- |
| `/api/revalidate` | `POST` | `x-wp-webhook-secret: <WP_WEBHOOK_SECRET>` header or `?secret=` query param | `{"tag": "posts"}` (optional, defaults to `posts`) | Calls `revalidateTag(tag, "max")` |

Responds `503` if `WP_WEBHOOK_SECRET` is unset, `401` on bad secret, `200` with
`{"revalidated": true, "tag": "..."}` on success.

### Custom post types

CPT support is **not wired up yet**, but the endpoints WordPress exposes for
them are already compatible with this client. A CPT registered with
`'show_in_rest' => true` is served at:

```
GET /wp/v2/<cpt-slug>            # e.g. /wp/v2/books
GET /wp/v2/<cpt-slug>?slug=<slug>
```

To hook one up later you'd need: a generic fetcher in `lib/api.ts`, a route
that resolves `/<cpt-slug>/<slug>`, and a revalidation tag named after the CPT
(the webhook already accepts arbitrary tags).

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
