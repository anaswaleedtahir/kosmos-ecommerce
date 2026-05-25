# apps/web — Storefront Context

Customer-facing Next.js storefront. App Router, React Server Components, Turbopack. This app is also the **BFF** (per [ADR-007](../../docs/adr/007-bff-via-nextjs.md)) for the web surface — backend microservices are never called directly from browser JS.

## Vocabulary

| Term | Meaning |
|---|---|
| **Storefront** | The customer-facing web surface (`apps/web`). Distinct from `apps/mobile` (placeholder) and any future admin app. |
| **BFF** | Backend-For-Frontend. Route Handlers (`app/api/**`) and Server Actions proxy `iam-service`, `catalog-service`, `order-service`. The browser only talks to this app. |
| **Proxy** (Next.js 16 file convention) | What earlier Next versions called `middleware.ts`. The file is `apps/web/src/proxy.ts`, exporting a `proxy` function. Node runtime only. |
| **Design kit** | The `@kosmos/design` workspace package at `packages/kosmos-design/`. Exports design tokens (`tokens.css`) and a React component library (`Nav`, `Footer`, `Editorial`, `Btn`, `CapsLink`, `SizePill`). Brand bible lives in `packages/kosmos-design/README.md`. |
| **Access token** | Short-lived RS256 JWT from `iam-service`. Fetched server-side per request. **Never** sent to client JS. |
| **Refresh token** | Long-lived opaque token from `iam-service`. Stored in `HttpOnly; Secure; SameSite=Lax` cookie set by this BFF. Renewed via `POST /api/auth/refresh`. |
| **BFF mutation guard** | Shared request guard for state-mutating BFF routes. Validates the double-submit CSRF token before auth, checkout, order, or future mutation modules talk to backend services. Not owned by auth because checkout/order BFF routes are expected soon. |
| **Auth Session** | BFF module that owns the Storefront browser-session protocol for `iam-service`: login, signup-and-login, refresh, logout, upstream auth errors, and refresh-cookie forwarding/clearing. Its interface returns ready-made `NextResponse` objects so cookie and error response shaping stays local to the module. For login/signup failures, it forwards upstream IAM error bodies mostly as-is; for network failures and missing/invalid refresh tokens, it returns stable Storefront BFF responses. |
| **Order intake** | Storefront module that turns Bag lines plus checkout form state into an Order result. It is shaped as an async BFF-facing interface because `/api/orders` is expected soon; during the local MVP it uses a sessionStorage adapter. Owns pricing and shipping total calculation so Checkout UI does not duplicate commercial rules. |
| **Storefront schema** | Zod schemas in `src/lib/schemas/catalog.ts` that validate `BackendProduct` / `BackendVariant` responses before they cross into the typed `Product` / `Variant` model. The realisation of [ADR-011](../../docs/adr/011-storefront-fields-first-class-columns.md)'s "type boundary at the BFF layer". Critical fields (`slug`, `name`, `image_url`) are strict — missing → row dropped (list) or `null` (detail) + `logSchemaFailure()`. Cosmetic fields (`composer`, `italic`, `image_url_2/3`) are optional. Parse entry point: `parseStorefrontProduct(raw)`. |

## Layout

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← async root layout; fetches products, wraps tree in ProductsProvider
│   │   ├── page.tsx                ← async homepage hero + arrivals
│   │   ├── globals.css             ← Tailwind v4 + @kosmos/design/tokens.css
│   │   ├── collection/[cat]/
│   │   │   ├── page.tsx            ← async server; passes initialProducts to CollectionBody
│   │   │   └── CollectionBody.tsx  ← client; filters/sorts from initialProducts prop
│   │   ├── products/[slug]/
│   │   │   ├── page.tsx            ← async server PDP
│   │   │   └── PDPClient.tsx       ← client-only interactivity
│   │   ├── checkout/
│   │   │   ├── page.tsx            ← async server; passes products to CheckoutClient
│   │   │   └── CheckoutClient.tsx  ← client checkout flow
│   │   ├── signin/
│   │   │   └── SignInForm.tsx      ← client; calls /api/auth/login or /api/auth/signup
│   │   └── api/auth/
│   │       ├── login/route.ts      ← proxies to iam-service; validates CSRF
│   │       ├── signup/route.ts     ← proxies to iam-service; auto-login after signup
│   │       ├── refresh/route.ts    ← proxies refresh token; clears cookie on failure
│   │       └── logout/route.ts     ← proxies to iam-service; deletes refresh cookie
│   ├── components/
│   │   └── providers/
│   │       └── ProductsProvider.tsx ← client context; seeded server-side in layout
│   └── proxy.ts                    ← Next 16 middleware-equivalent; auth guard + CSRF cookie
├── next.config.ts                  ← transpilePackages: ["@kosmos/design"]
├── postcss.config.mjs              ← @tailwindcss/postcss
└── .env.local.example              ← backend service URLs (server-side only)
```

## Conventions

- **Server Components by default.** Use `"use client"` only when a component needs hooks, event handlers, or browser APIs (see `ProductDetailClient.tsx`).
- **No `NEXT_PUBLIC_*` for service URLs.** All backend URLs are server-side env vars consumed inside Route Handlers / Server Components.
- **Brand rules are non-negotiable.** Read `packages/kosmos-design/README.md` before adding any UI: monochrome, `border-radius: 0`, no shadows, no gradients, Bodoni Moda + Inter, words over icons.
- **Reuse the design kit.** When you reach for a button, nav, footer, editorial block, or size-pill, import it from `@kosmos/design`. Add new shared primitives to the kit, not to `apps/web/`.

## Integration decisions (sprint 1)

- **Catalog data** — `lib/catalog.ts` hardcoded product data is replaced by server-only calls in `lib/catalog-api.ts` (guarded by `import "server-only"`). Server Components call `getProducts()` / `getProduct(slug)`, which hit `catalog-service` (`GET /api/v1/catalog/products`, `GET /api/v1/catalog/products/by-slug/{slug}`) with ISR (`next: { revalidate: 60 }`). `lib/catalog.ts` retains only static config: `CATEGORIES`, `FAMILIES`, `getCategory`, `getDefaultVariant`.
- **Storefront fields on the catalog schema** — `Product` gained a first-class `slug` column (unique, indexed) and a `storefront_metadata: JSONB` blob for all other presentation fields (`no`, `tagline`, image URLs, `family`, `variant_label`, `cat`, etc.). Variant presentation fields (`label`, `swatch`, `is_default`) live in the existing `attributes` JSONB on `ProductVariant`. The **Storefront schema** (`lib/schemas/catalog.ts`) is the single validating boundary — `catalog-api.ts` calls `parseStorefrontProduct(raw)` and never reads JSONB keys inline. See [ADR-011](../../docs/adr/011-storefront-fields-first-class-columns.md).
- **Product data on the client** — `app/layout.tsx` is async. It fetches all products once via `getProducts()` and wraps the tree in `ProductsProvider` (a client context). Client components (`BagDrawer`, `SearchOverlay`, `useAddToBag`) call `useProducts()` instead of the removed synchronous catalog functions. Checkout receives products as a prop from its async server page.
- **Inventory** — BFF calls `GET /api/v1/inventory/variants?variant_ids=a,b,c` batch endpoint (added in this sprint). One catalog call + one inventory batch call per page — no N+1.
- **Auth** — `src/app/api/auth/login`, `logout`, `refresh`, `signup` route handlers are fully wired to `iam-service`. Refresh token lives in `HttpOnly; Secure; SameSite=Lax` cookie. Access token is held server-side only — never in client JS.
- **`/checkout` is auth-protected** — `proxy.ts` checks for the refresh cookie and redirects unauthenticated visitors to `/signin?next=/checkout`. CSRF double-submit token (`csrfToken` cookie, not HttpOnly) is validated on all state-mutating BFF routes (`/api/auth/*`).
- **Order service** — out of scope for sprint 1. Checkout `placeOrder()` remains a local stub (random order no, sessionStorage). Order service design happens in a separate session.

## Open work

- Fonts: currently loaded via `@import url(...)` from Google in `globals.css`. Hybrid `next/font/local` against kit-hosted `.woff2` would eliminate CLS and remove the runtime CDN dependency.
- TypeScript pinned at `^5` resolves to 5.0.2 in the lockfile; Next 16 recommends ≥5.1.0. Bump.
- Product images: Unsplash URLs stored in `catalog-service`. Replace with a real object store (S3/GCS) and `next/image` loader config in a later sprint.
