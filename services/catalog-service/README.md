# Catalog Service

Product catalog and inventory management for the Kosmos platform. Runs on **port 8001**.

## What it does

- Manages products, variants, and category taxonomy
- Tracks stock levels and checkout reservations per variant
- Publishes domain events (product published, price changed, stock depleted/restocked) to GCP Pub/Sub
- Verifies JWTs from the IAM service — reads are public, writes require `catalog:write`

## Key concepts

- A **Product** is never directly purchasable. Its **ProductVariant** is — each variant has its own SKU, price, and attributes (e.g. size, color).
- **Inventory** tracks `quantity_on_hand` and `quantity_reserved` per variant. Available stock = `on_hand − reserved`.
- A **Reservation** is a soft hold placed during checkout. It is either committed (stock decremented) or released (hold removed) — never silently dropped.

## Quick start

```bash
# Copy and fill in env vars
cp .env.example .env

# Run migrations and start
just migrate
just runserver          # http://localhost:8001
```

The IAM service must be reachable at startup — the catalog service fetches the JWKS public key on boot.

Interactive docs: `http://localhost:8001/docs`

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | asyncpg PostgreSQL DSN |
| `IAM_JWKS_URL` | e.g. `http://iam-service:8000/.well-known/jwks.json` |
| `GCP_PROJECT_ID` | GCP project for Pub/Sub |
| `PUBSUB_TOPIC_ID` | Pub/Sub topic for domain events |

## API

Reads are public. All write endpoints require `Authorization: Bearer <token>` with the `catalog:write` permission.

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/catalog/products` | — | List active products |
| `GET` | `/api/v1/catalog/products/{id}` | — | Get product with variants |
| `POST` | `/api/v1/catalog/products` | required | Create product |
| `PATCH` | `/api/v1/catalog/products/{id}` | required | Update product metadata |
| `PATCH` | `/api/v1/catalog/products/{id}/status` | required | Activate or deactivate |

### Variants

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/catalog/products/{id}/variants` | required | Add variant to product |
| `PATCH` | `/api/v1/catalog/variants/{id}` | required | Update price or attributes |
| `DELETE` | `/api/v1/catalog/variants/{id}` | required | Soft-delete variant |

### Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/catalog/categories` | — | List all categories |
| `POST` | `/api/v1/catalog/categories` | required | Create category |

### Inventory

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/inventory/variants/{id}` | — | Get stock levels |
| `POST` | `/api/v1/inventory/variants/{id}/restock` | required | Add stock |
| `POST` | `/api/v1/inventory/variants/{id}/reserve` | required | Reserve stock for checkout |
| `POST` | `/api/v1/inventory/variants/{id}/release` | required | Release a reservation |

## Running tests

```bash
uv run pytest tests/unit/ -v                   # no database needed
uv run pytest tests/integration/ -v            # needs TEST_DATABASE_URL set
uv run pytest --cov=app --cov-report=term-missing
```
