# Kosmos
Luxury cosmetics ecommerce platform. A monorepo of Python microservices with a Next.js storefront, built to explore microservices architecture, event-driven communication, and cloud-native patterns.
This is a learning project. Decisions are documented as ADRs in `docs/adr/` — see them for tradeoff reasoning.

## Architecture
```
[ Browser ] → [ Next.js (BFF) ] → [ FastAPI services ]
                                   ├── iam-service        :8000   Auth, RBAC, JWKS
                                   ├── catalog-service    :8001   Products, search
                                   ├── order-service      :8002   Cart, orders, payments
                                   └── notification-service :8003  Async event consumers
                                         ↑
                                   [ GCP Pub/Sub ]
```
Each service owns its own database. Services authenticate requests independently via JWT signature verification against `iam-service's` JWKS endpoint. Cross-service communication is event-driven via Pub/Sub where eventual consistency is acceptable, synchronous HTTP where command semantics are required.

## What's in the box

| Service | Port | Responsibility |
|---------|------|----------------|
| `iam-service` | 8000 | Auth, RBAC, audit log |
| `catalog-service` | 8001 | Product catalog |
| `order-service` | 8002 | Order lifecycle |
| `notification-service` | 8003 | Event-driven notifications via Pub/Sub |

Shared packages live in `packages/`. Frontend apps (web, mobile) are placeholders in `apps/`.

## Bootstrap

**Prerequisites:** Docker, `uv`

```bash
# 1. Install all workspace dependencies
uv sync

# 2. Copy and fill env files for each service
cp services/iam-service/.env.example services/iam-service/.env
# repeat for other services

# 3. Start infrastructure + all services
docker-compose up
```

To run a single service locally instead:

```bash
cd services/iam-service

# Generate RSA keys (one-time)
openssl genrsa -out keys/private_key.pem 2048
openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem

uv run alembic upgrade head
just runserver          # → http://localhost:8000/docs
```

## Stack

Python 3.13 · FastAPI · SQLAlchemy 2 (async) · Alembic · PostgreSQL 17 · Redis 7 · GCP Pub/Sub · Pydantic v2 · uv workspaces

## Where to go next

- **Services deep dive** → [`services/**/CONTEXT.md`](services/**/CONTEXT.md)
- **API contracts** → [`services/**/openapi/openapi.yaml`](services/**/openapi/openapi.yaml)
- **Architecture docs** → [`docs/architecture`](docs/architecture/)
