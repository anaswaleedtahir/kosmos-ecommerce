# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository Overview

**Shop-Monorepo** — a `uv` workspace containing four Python microservices, shared packages, and frontend app placeholders.

## Training Ground & Mentorship Contract

Treat this repository as a hands-on training ground for the user, who is learning
to become a strong platform/backend engineer. The user's current learning goals
are:

- Async Python service development with FastAPI, SQLAlchemy asyncio, Redis, and
  event-driven boundaries
- Containerization and production-minded Docker image design
- Kubernetes fundamentals through local-first platform work
- LGTM observability: Loki, Grafana, Tempo, and Mimir/Prometheus-style metrics
- Terraform for platform bootstrap and environment ownership

When working in this repo, act as a senior platform/backend engineer mentoring a
student. Do not only deliver the change; teach through the change.

Expected agent behavior:

- Explain the "why" behind important design choices in concise, practical terms.
- Prefer guided implementation: show the command, the expected result, and what
  signal proves it worked.
- Name the platform concept being practiced, such as readiness probes,
  service discovery, async connection pooling, trace propagation, or Terraform
  state.
- Keep production standards intact. Training exercises must still respect the
  architecture, security, testing, and secret-handling rules in this file.
- When a task has learning value, add a short "Mentor note" in the final response
  describing the concept the user just practiced.
- Ask the user to make a decision only when it changes the learning path or
  carries real architectural risk. Otherwise, choose a conservative default and
  explain it.
- Favor small vertical slices that can be run, observed, broken, and repaired.
  A good exercise leaves the user with a working artifact and a debugging trail.

## Lab Repo Operating Model

Treat this repo as a modular lab environment, not only an application codebase.
Each lab is a self-contained assignment that a future coding-agent chat can open,
teach, inspect, and evaluate as an instructor.

Canonical lab records live in `docs/labs/`:

- `docs/labs/README.md` is the lab index and explains the status model.
- `docs/labs/NNN-topic.md` is the source of truth for one lab.
- Lab progress is tracked inside each lab file. Optional evidence files may be
  added only when logs, screenshots, generated manifests, or mock data are too
  large for the lab file.

Every lab must include:

- A clear objective.
- Learning outcomes that name the platform/backend concepts being practiced.
- Learner tasks written as actions the user performs and marks complete.
- Evidence requirements that show what command output, files, logs, dashboards,
  tests, or screenshots prove the work.
- An instructor evaluation section with at least one objective verification path:
  automated checks where practical, evidence review, and 3-5 quiz questions.
- A completion log where the user records what they finished and the agent records
  instructor feedback.

Agent behavior for labs:

- Do not mark learner tasks complete unless the user explicitly asks you to update
  their progress after they performed the task.
- When asked to evaluate a lab, act as an instructor: inspect the lab file, read
  the evidence, run the listed checks when feasible, ask quiz questions when
  needed, and record concise feedback in the lab completion log if requested.
- If a lab is underspecified, improve the lab spec before evaluating it.
- Keep lab work production-minded. Fake local values are allowed; committed
  secrets, skipped auth, and hidden manual steps are not.
- Prefer small vertical slices that can be resumed by another agent from the lab
  file alone.

Default platform training path:

1. Establish the Docker Compose baseline.
2. Improve service containers and local runtime ergonomics.
3. Run IAM and catalog in local Kubernetes using raw manifests.
4. Move Postgres, Redis, and the Pub/Sub emulator into the cluster.
5. Add shared application observability helpers in `packages/shared`.
6. Build LGTM dashboards, log queries, metrics, and traces.
7. Introduce Terraform for platform bootstrap: namespaces, add-ons, and later
   cloud resources.
8. Add failure drills, runbooks, and interview-style mock platform scenarios.

The first Kubernetes training target is local-first: IAM + catalog only, with
plain Kubernetes Secrets containing fake local values. Use raw Kubernetes YAML
before Kustomize or Helm so the user learns the primitives directly.

| Service | Port | Responsibility |
|---------|------|----------------|
| `services/iam-service` | 8000 | Auth, RBAC, audit log — primary service |
| `services/catalog-service` | 8001 | Product catalog + inventory |
| `services/order-service` | 8002 | Order lifecycle |
| `services/notification-service` | 8003 | Event-driven notifications via Pub/Sub |

`packages/shared` — cross-service shared utilities. `apps/web` and `apps/mobile` are frontend placeholders.

## Commands

### Workspace (run from repo root)
```bash
uv sync                    # install all workspace dependencies
docker-compose up          # start all infra + services
```

### IAM Service (`services/iam-service/`)
```bash
just runserver             # uvicorn app.main:app --reload --port 8000
just makemigrations "msg"  # alembic revision --autogenerate -m "msg"
just migrate               # alembic upgrade head

uv run pytest --cov=app --cov-report=term-missing   # all tests with coverage
uv run pytest tests/unit/ -v                         # unit tests (no DB)
uv run pytest tests/integration/ -v                  # integration tests (needs TEST_DATABASE_URL)
uv run pytest tests/unit/rbac/test_create_role_use_case.py -v  # single file

ruff check app tests && ruff format app tests
```

### Catalog Service (`services/catalog-service/`)
```bash
just runserver             # port 8001
just makemigrations "msg"
just migrate
uv run pytest tests/unit/ -v
uv run pytest tests/integration/ -v
```

### First-time setup (IAM service)
```bash
mkdir -p keys
openssl genrsa -out keys/private_key.pem 2048
openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem
uv run alembic upgrade head
```

## Architecture

### Hexagonal (Ports & Adapters) — Applied to All Services

Every service and bounded context is strictly layered:

```
<context>/
├── domain/         # Pure Python: dataclasses, Protocol ports, exceptions
├── application/    # Use cases + DTOs; import only from domain/
└── infrastructure/ # SQLAlchemy, Redis, FastAPI, JWT, Pub/Sub adapters
```

**The domain layer must never import from FastAPI, SQLAlchemy, Redis, or PyJWT.** Use cases receive concrete implementations injected via `<context>/infrastructure/composition.py` using FastAPI `Depends`.

### IAM Service — Three Bounded Contexts

`app/auth/`, `app/rbac/`, `app/audit/` — each independently layered. Detailed map: `services/iam-service/AGENTS.md`.

**Cross-cutting modules:**
- `app/shared/domain/` — canonical `User`, `Role`, `Permission`, `AuditLog` entities; `Email` and `ScopeKey` value objects; `DomainEvent` base
- `app/shared/infrastructure/` — ORM mixins (`UUIDPrimaryKeyMixin`, `TimestampMixin`, `SoftDeleteMixin`), `RSAKeyPair` singleton, `BcryptPasswordHasher`, JWT issuer/verifier, Redis client, rate limiting
- `app/core/` — `RequestResponseMiddleware` (request-ID injection, structured logging)
- `app/config.py` — `Settings(BaseSettings)`; all config via env vars

**RBAC → Audit decoupling:** RBAC use cases call `uow.add_event(RoleCreated(...))`. After `uow.commit()`, the Unit of Work dispatches collected events to `SqlAlchemyAuditLogger` — the two contexts never import each other.

### Catalog Service — Two Bounded Contexts

`app/catalog/` — `Product`, `ProductVariant`, `Category` aggregates. Products are never directly purchasable; `ProductVariant` is the purchasable unit with its own `sku`, `price`, and JSONB `attributes`.

`app/inventory/` — `Inventory` aggregate tracking `quantity_on_hand` and `quantity_reserved`. Available stock = `on_hand − reserved`. Reservations are soft holds placed during checkout.

**Key invariants:** `ProductVariant` SKU is globally unique. Hard deletes are forbidden — use `Product.status = inactive`. `ProductPublished` fires only on `inactive → active` transition.

**Auth:** Reads are public. Mutations require a valid RS256 JWT (from iam-service) with `catalog:write` claim. JWKS fetched from iam-service at startup and cached in-process.

### Authentication Flow (IAM)

1. `POST /api/v1/auth/login` — verify password, issue RS256 JWT access token + refresh token stored in Redis
2. `POST /api/v1/auth/refresh` — consume httpOnly cookie refresh token, check JTI revocation, issue new pair
3. `POST /api/v1/auth/logout` — revoke JTI, delete from Redis

Password hashing via `passlib` with `bcrypt` + `django_pbkdf2_sha256` schemes — auto-migrates Django hashes on first login.

### Redis Key Patterns

| Key | TTL |
|-----|-----|
| `refresh_token:<token>` | 7 days |
| `revoked_jti:<jti>` | remaining access token lifetime |
| `rate_limit:ip:<ip>:<path>` | 60 s |
| `rate_limit:username:<username>:<path>` | 300 s |

## API Standards

Applies across all services. Full spec: `docs/standards/api.md`.

- URLs: `/api/v{n}/{plural-resource}` — no verbs, nested max one level, admin paths under `/admin/`
- Auth: `Authorization: Bearer <access_token>`; refresh token is an httpOnly cookie only
- Errors: `{ "detail": "..." }` — FastAPI 422 shape preserved for validation errors
- Pagination: `?page=1&page_size=20` — response is a plain array, no envelope
- JWKS endpoint (`GET /.well-known/jwks.json`) is always public

## Code Conventions

- Python 3.13; modern type hints (`list[str]`, `X | None`, no `Optional`); full return type annotations
- Async-first — all route handlers, use cases, and repository methods are `async def`
- Ruff: `line-length = 88`, rules `E, F, I`
- Pydantic v2: separate input/output schemas (`UserCreate` / `UserRead`); response schemas from ORM inherit `OrmSchema` (`model_config = ConfigDict(from_attributes=True)`)
- Google-style docstrings; one-line only; omit when name and signature are self-explanatory
- Use `PyJWT` with `cryptography` — never `python-jose`
- Use `server_default` for DB-generated column defaults, `default` for Python-side defaults
- Routes are thin: validate input → call use case → return response schema; no business logic in routes

## Testing Conventions

- **Unit tests** (`tests/unit/`): mock all ports with `AsyncMock` or stub `Protocol` implementations — no DB or network, must be fast. RBAC unit tests use `FakeRbacUnitOfWork` from `tests/unit/rbac/fakes.py`.
- **Integration tests** (`tests/integration/`): real async PostgreSQL via `TEST_DATABASE_URL`, `httpx.AsyncClient`, Pub/Sub mocked
- **Shared fixtures** (`tests/conftest.py`): `engine` (session-scope, creates all tables), `db` (function-scope, truncates after each test), `mock_redis` (session-scope `AsyncMock`), `mock_jwt` (in-memory 2048-bit RSA pair)

## Constraints

**Require explicit confirmation before:**
- Generating or modifying Alembic migration files
- Changing SQLAlchemy model definitions
- Changing JWT signing algorithm or key loading logic
- Deleting or renaming existing API routes

**Forbidden:**
- Committing `.env` files, `*.pem` keys, or any secrets
- Using `python-jose` — always use `PyJWT` with `cryptography`
- Synchronous SQLAlchemy calls inside async context
- `print()` for debugging — use the structured logger
- Hardcoding config values that belong in `.env`

## Further Reading

- **Platform training handbook**: `docs/platform-engineering-training-handbook.md` — learning plan, labs, acceptance criteria, mock platform engineer drills
- **Modular labs**: `docs/labs/README.md` — lab index, progress model, instructor evaluation protocol
- **IAM service deep dive**: `services/iam-service/CLAUDE.md` — entity tables, full API surface, fixture details, ORM association tables
- **Agent-mode instructions**: `services/iam-service/CLAUDE.md` — PR protocol, boundary constraints
- **Catalog domain glossary**: `services/catalog-service/CONTEXT.md`
- **Architecture docs & ADRs**: `docs/` — service map, auth flow, hexagonal/JWT/domain-events decisions, API + Python standards, runbooks
