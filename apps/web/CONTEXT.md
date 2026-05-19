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

## Layout

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← root layout, imports Nav/Footer from @kosmos/design
│   │   ├── page.tsx            ← homepage hero + Editorial
│   │   ├── globals.css         ← Tailwind v4 + @kosmos/design/tokens.css
│   │   ├── products/[slug]/
│   │   │   ├── page.tsx        ← PDP (server)
│   │   │   └── ProductDetailClient.tsx  ← client-only interactivity
│   │   └── api/auth/
│   │       ├── login/route.ts  ← stub (501) per ADR-007 future work
│   │       ├── refresh/route.ts
│   │       └── logout/route.ts
│   └── proxy.ts                ← Next 16 middleware-equivalent
├── next.config.ts              ← transpilePackages: ["@kosmos/design"]
├── postcss.config.mjs          ← @tailwindcss/postcss
└── .env.local.example          ← backend service URLs (server-side only)
```

## Conventions

- **Server Components by default.** Use `"use client"` only when a component needs hooks, event handlers, or browser APIs (see `ProductDetailClient.tsx`).
- **No `NEXT_PUBLIC_*` for service URLs.** All backend URLs are server-side env vars consumed inside Route Handlers / Server Components.
- **Brand rules are non-negotiable.** Read `packages/kosmos-design/README.md` before adding any UI: monochrome, `border-radius: 0`, no shadows, no gradients, Bodoni Moda + Inter, words over icons.
- **Reuse the design kit.** When you reach for a button, nav, footer, editorial block, or size-pill, import it from `@kosmos/design`. Add new shared primitives to the kit, not to `apps/web/`.

## Open work

- BFF auth proxy: `src/app/api/auth/*` and `src/proxy.ts` are stubs returning 501. Real implementation lands per ADR-007 (HttpOnly refresh cookie, server-side access token, CSRF double-submit on mutations).
- Fonts: currently loaded via `@import url(...)` from Google in `globals.css`. Hybrid `next/font/local` against kit-hosted `.woff2` would eliminate CLS and remove the runtime CDN dependency.
- TypeScript pinned at `^5` resolves to 5.0.2 in the lockfile; Next 16 recommends ≥5.1.0. Bump.
