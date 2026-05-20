# ADR-011 — Storefront Fields: Slug First-Class, Presentation Data in JSONB

**Status:** Accepted
**Date:** 2026-05

## Context

`catalog-service` was designed as a generic catalog with open-ended `attributes: dict` (JSONB) on `ProductVariant` and no storefront-specific fields on `Product`. The storefront (`apps/web`) needs additional presentation data per product: a URL slug, product number (`no`), tagline, up to three image URLs, family label, composer credit, variant selector label, shade flag, and ingredient/tasting notes. Per variant: a display label, an optional swatch colour, and a default flag.

Three options were considered:

**A — All first-class columns.** Add typed columns for each storefront field directly to the `Product` and `ProductVariant` tables.

**B — Slug first-class, remaining fields in a JSONB blob.** Add `slug` as a typed, unique, indexed column and a single `storefront_metadata: dict` column for all other presentation fields. Variant presentation fields (label, swatch, is_default) go into the existing `attributes` JSONB.

**C — BFF enrichment map.** Keep the backend schema untouched. The Next.js BFF holds a hardcoded UUID → presentation-data map that enriches catalog responses before rendering.

## Decision

**Option B.** `slug` as a first-class column; all remaining storefront fields in `storefront_metadata: JSONB` on `Product`; variant presentation fields in the existing `attributes` JSONB on `ProductVariant`.

`slug` is first-class because:
- It is a true domain identifier (unique, indexed, queried directly via `GET /catalog/products/by-slug/{slug}`).
- It is validated at the boundary (`^[a-z0-9-]+$`), checked for uniqueness in the use case (`ProductSlugAlreadyExistsError → 409`), and immutable after creation.
- Putting it in a blob would make it un-indexable and un-constrainable at the DB level.

`storefront_metadata` holds all other presentation fields: `no`, `tagline`, `image_url`, `image_url_2`, `image_url_3`, `family`, `composer`, `variant_label`, `variants_are_shades`, `notes`, `cat` (category slug), and `italic`. The BFF (`catalog-api.ts`) reads these with typed accessors and falls back to safe defaults — the type contract lives at the BFF layer, not the DB schema.

Variant presentation fields (`label`, `swatch`, `is_default`) are written into and read from the existing `attributes` JSONB, leaving `ProductVariant` ORM and domain entity unchanged.

## Consequences

- The `slug` column is a first-class DB invariant: `UNIQUE` constraint, `INDEX`, and `NOT NULL`. Slug immutability is enforced by the use case layer.
- All other storefront fields are schema-free at the DB level. Adding or renaming a presentation field (e.g., adding `campaign_badge`) requires no migration — only a BFF mapper update.
- The BFF mapper (`toProduct` in `catalog-api.ts`) is the single authoritative type boundary for storefront presentation data. String-keyed reads happen in one place only, not scattered across components.
- Variant fields (`label`, `swatch`, `is_default`) reuse the existing `attributes` JSONB without schema changes to `ProductVariant`.
- Option A was rejected: typed columns for all storefront fields would couple the catalog DB schema tightly to the current storefront's vocabulary (e.g., `variant_label`, `variants_are_shades`). Any future storefront or admin surface would inherit columns that mean nothing to it.
- Option C was rejected: splitting product identity across two systems (catalog owns UUID, BFF owns slug and presentation data) creates a synchronisation hazard if catalog data is seeded or modified outside the BFF.
