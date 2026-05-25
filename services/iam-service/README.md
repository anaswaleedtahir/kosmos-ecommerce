# IAM Service

Authentication, authorization, and audit logging for the Kosmos platform. Runs on **port 8000**.

## What it does

- Issues RS256 JWTs for authenticated users
- Enforces role-based access control (RBAC) — roles carry scoped permissions like `catalog:write`
- Exposes a JWKS endpoint so other services can verify tokens without calling back
- Keeps an append-only audit log of every RBAC change

## Quick start

```bash
# Generate RSA keys (one-time)
mkdir keys
openssl genrsa -out keys/private_key.pem 2048
openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem

# Copy and fill in env vars
cp .env.example .env

# Run migrations and start
just migrate
just seed
just runserver          # http://localhost:8000
```

Interactive docs: `http://localhost:8000/docs`

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | asyncpg PostgreSQL DSN |
| `REDIS_URL` | Redis DSN |
| `PRIVATE_KEY_PATH` | Path to RSA private key (default: `keys/private_key.pem`) |
| `PUBLIC_KEY_PATH` | Path to RSA public key (default: `keys/public_key.pem`) |
| `GCP_PROJECT_ID` | GCP project for Pub/Sub |
| `PUBSUB_TOPIC_ID` | Pub/Sub topic for audit events |
| `JWT_ISSUER` | Issuer claim in JWTs (default: `access-control-service`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL (default: 15) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL (default: 7) |

## API

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/signup` | Register a new user |
| `POST` | `/api/v1/auth/login` | Get access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token (httpOnly cookie) |
| `POST` | `/api/v1/auth/logout` | Revoke tokens |
| `GET`  | `/api/v1/auth/me` | Current user info |
| `GET`  | `/.well-known/jwks.json` | Public key — consumed by other services |

### Admin (super user only)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/admin/roles` | Create a role |
| `DELETE` | `/api/v1/admin/roles/{id}` | Delete a role |
| `POST` | `/api/v1/admin/roles/{id}/permissions` | Assign permission to role |
| `DELETE` | `/api/v1/admin/roles/{id}/permissions` | Revoke permission from role |
| `POST` | `/api/v1/admin/users/{id}/roles` | Assign role to user |
| `DELETE` | `/api/v1/admin/users/{id}/roles/{role_id}` | Revoke role from user |
| `GET` | `/api/v1/audit/logs` | Paginated audit trail |

## Token flow

1. `POST /login` returns an access token (JWT, 15 min) in the response body and a refresh token in an httpOnly cookie.
2. Include the access token as `Authorization: Bearer <token>` on every protected request.
3. When the access token expires, call `POST /refresh` — a new pair is issued and the old refresh token is revoked.
4. `POST /logout` immediately invalidates both tokens.

## Running tests

```bash
uv run pytest tests/unit/ -v                   # no database needed
uv run pytest tests/integration/ -v            # needs TEST_DATABASE_URL set
uv run pytest --cov=app --cov-report=term-missing
```
