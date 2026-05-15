# Shop-Monorepo

Ecommerce platform. Four Python microservices sharing infrastructure, managed as a `uv` workspace and a PWA (Progressive Web Application) in Next.js.

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
mkdir -p keys
openssl genrsa -out keys/private_key.pem 2048
openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem

uv run alembic upgrade head
just runserver          # → http://localhost:8000/docs
```

## Stack

Python 3.13 · FastAPI · SQLAlchemy 2 (async) · Alembic · PostgreSQL 17 · Redis 7 · GCP Pub/Sub · Pydantic v2 · uv workspaces

## Where to go next

- **IAM service deep dive** → [`services/iam-service/CLAUDE.md`](services/iam-service/CLAUDE.md)
- **API contracts** → [`services/iam-service/openapi/openapi.yaml`](services/iam-service/openapi/openapi.yaml)
- **Architecture docs** → [`services/iam-service/docs/`](services/iam-service/docs/)
