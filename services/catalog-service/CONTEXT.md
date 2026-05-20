# Catalog Service — Domain Context

## Bounded Contexts

| Context | Aggregates / Entities | Responsibility |
|---------|----------------------|----------------|
| `catalog/` | `Product`, `ProductVariant`, `Category` | Product metadata, taxonomy, lifecycle |
| `inventory/` | `Inventory` | Stock levels, reservations |
| `audit/` | `AuditLog` | Immutable record of every catalog and inventory mutation that has a human actor |

---

## Glossary

### Product
A sellable item with metadata. Has a lifecycle status of `active` or `inactive`. Inactive products are hidden from the storefront. Belongs to exactly one `Category`. A `Product` is never directly purchasable — its `ProductVariant`s are.

Storefront-facing fields stored as first-class columns (not JSONB) so the BFF can query them without post-processing: `slug` (globally unique URL-safe identifier, e.g. `"noir-undone"`), `no` (display product number, e.g. `"N° 04"`), `tagline`, `image_url`, `image_url_2`, `image_url_3`, `family` (olfactory/product family label), `composer` (nullable, fragrance composer credit), `variant_label` (label shown above the variant selector, e.g. `"Volume"` or `"Shade"`), `variants_are_shades` (boolean — drives swatch rendering), `notes` (JSONB dict of free-form tasting/ingredient notes). See ADR-011.

### ProductVariant
A specific, purchasable form of a `Product` (e.g. a fragrance in 50 ml). Carries its own `sku`, `price`, `label` (display label shown in the selector, e.g. `"50 ml"` or `"Salon"`), `swatch` (nullable hex colour for shade variants), `is_default` (exactly one variant per product should be `True`), and free-form `attributes` (JSONB) for any remaining open-ended properties. The variant is the unit that appears in a cart or order line item. See ADR-011.

### Category
A node in a single-parent taxonomy tree (`parent_id | None`). Depth is unbounded; recursive CTEs handle descendant queries. Each `Product` has exactly one primary `Category`.

### Inventory
Tracks stock for a single `ProductVariant`. Maintains `quantity_on_hand` and `quantity_reserved`. Available stock = `on_hand − reserved`. Reservations are created during checkout and committed (decremented from `on_hand`) or released on cancellation.

`Inventory` is a **tell-don't-ask aggregate**: all state transitions go through its methods, which enforce invariants and buffer domain events internally. The Unit of Work drains the buffer via `collect_events()` after `commit()`.

### Reservation
A soft hold on `Inventory` placed during checkout. Prevents oversell under concurrent writes. Not a standalone aggregate — lives as a quantity on the `Inventory` record.

**Release and commit are forgiving**: `release(qty)` and `commit_reservation(qty)` silently clamp to `min(qty, quantity_reserved)`. Callers (e.g. order-service retrying a partial commit) need not know the exact reserved quantity. Reserving more than `available`, by contrast, is strict — raises `InsufficientStockError`.

### ProductPublished event
Fired when a `Product` transitions from `inactive → active`. Consumed downstream by order-service and notification-service via Pub/Sub.

### ProductPriceChanged event
Fired when a `ProductVariant.price` is updated while its parent `Product` is `active`. Downstream services may need to re-price in-flight carts.

### InventoryRestocked / InventoryDepleted events
Fired when `Inventory.quantity_on_hand` crosses zero. `InventoryRestocked` fires inside `restock()` when on-hand rises above zero from zero. `InventoryDepleted` fires inside `commit_reservation()` when on-hand reaches zero — **not** during `reserve()` (reserving moves stock from available to reserved but does not change on-hand). Notification-service subscribes.

### ActorContext
A frozen value object carrying `actor_id` (JWT `sub`), `actor_username` (JWT claim), and `request_id` (from `RequestResponseMiddleware`). Built by the `actor_context` FastAPI dependency from the verified JWT, then passed explicitly into every write use case. Domain layer holds the type; infrastructure layer constructs it. Use cases attach it to audit events.

### AuditLog
An immutable append-only record written in the **same transaction** as the business mutation that produced it (see ADR-009 — deliberately stricter than iam's ADR-003). Fields: `actor_id`, `actor_username`, `action`, `entity_type`, `entity_id`, `payload: dict`, `request_id`, `created_at`. Never updated or deleted — no mutation methods exist on the `AuditLogger` port.

### Audit Events (catalog + inventory)
Emitted by use cases via `uow.add_event(...)` to decouple mutation logic from audit persistence. Each implements `to_audit_context() -> AuditContext`. These run **parallel** to the Pub/Sub broadcast events (`ProductPublished`, `ProductPriceChanged`, …) — broadcast and audit have different consumers, retention, and schemas, so they are deliberately separate event taxonomies.

| Event | Trigger |
|-------|---------|
| `ProductCreated` | A new `Product` is persisted |
| `ProductMetadataChanged` | Name, description, or category of a product changes |
| `ProductActivated` | `Product.status` transitions `inactive → active` |
| `ProductDeactivated` | `Product.status` transitions `active → inactive` |
| `CategoryCreated` | A new `Category` is persisted |
| `CategoryRenamed` | Category name or slug changes |
| `VariantCreated` | A new `ProductVariant` is added |
| `VariantPriceChanged` | Variant price changes |
| `VariantAttributesChanged` | Variant `attributes` JSONB changes |
| `VariantSoftDeleted` | `ProductVariant.is_active` set to `False` |
| `InventoryRestocked` | `Inventory.restock()` called by an admin |

**Not audited:** `reserve`, `release`, `commit_reservation` — driven by order-service traffic, no human actor, high volume. Their history is captured in order-service order log and Pub/Sub events.

---

## Authorization

- **Reads (catalog / inventory)** — public, no token required.
- **Mutations** — require a valid RS256 JWT (issued by iam-service) with the `catalog:write` permission claim.
- **Audit reads** — require a valid RS256 JWT with the `catalog:audit:read` permission claim. Distinct from `catalog:write` so support/auditor roles can read history without write power. The permission row is created manually in iam after deploy via `POST /api/v1/admin/permissions`.
- JWT verification uses JWKS fetch from iam-service at startup; public key is cached in-process.

---

## Key Invariants

- A `ProductVariant` SKU is globally unique.
- A `Product` slug is globally unique and URL-safe (`^[a-z0-9-]+$`). It is set on creation and never changed — changing a slug would break existing URLs and bookmarks.
- Exactly one `ProductVariant` per `Product` has `is_default = True`. Use cases enforce this: setting a new default clears the flag on siblings.
- `Inventory.quantity_reserved` never exceeds `quantity_on_hand`.
- `ProductPublished` is emitted only on `inactive → active` transition, not on re-saves of already-active products.
- Hard deletes are forbidden; use `Product.status = inactive` and `Inventory` quantity zeroing instead.
- Every catalog or inventory mutation with a human actor produces exactly one `AuditLog` row in the same transaction. If the audit insert fails, the business change rolls back.
- `AuditLog` rows are never updated or deleted — no path exists on the `AuditLogger` port.
