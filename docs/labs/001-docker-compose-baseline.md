# Lab 001: Docker Compose Baseline

## Status

- State: needs_revision
- Learner marked complete: yes
- Instructor evaluated: yes
- Last evaluated by: Codex
- Last evaluated at: 2026-06-04

## Objective

Prove the local Docker Compose runtime can start the platform dependencies and
service processes before any Kubernetes or observability changes are introduced.

## Learning Outcomes

- Explain why platform work starts from a known-good baseline.
- Identify the runtime dependencies for IAM and catalog: Postgres, Redis, Pub/Sub
  emulator, RSA keys, and service environment variables.
- Distinguish startup failures from runtime health failures.
- Capture useful evidence without committing secrets or local key material.

## Learner Tasks

- [x] Inspect `docker-compose.yml` and identify which containers are platform
  dependencies and which are application services.
  Evidence: list the dependency containers and app containers in the evidence log.

- [x] Prepare IAM local RSA keys if they are missing.
  Evidence: record the commands run, but do not paste private key material.

- [x] Start the Compose stack from the repository root.
  Evidence: record the command and summarize which containers reached a running
  or healthy state.

- [x] Confirm IAM can serve its public JWKS endpoint.
  Evidence: record the command and whether the response contained a `keys` array.

- [x] Confirm catalog can start with its configured IAM JWKS URL.
  Evidence: record the relevant catalog log line or health signal.

- [x] Stop the stack cleanly after collecting evidence.
  Evidence: record the shutdown command and whether containers exited cleanly.

## Evidence Log

Add learner evidence here. Keep entries concise and redact secrets.

- Dependency Containers:
  - Redis
  - PostgreSQL
  - Google Pub/Sub

- Commands for IAM local RSA keys:
  - `openssl genrsa -out keys/private_key.pem 2048`
  - `openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem`

- Docker Compose startup evidence:

  ```text
  docker compose up -d
  [+] up 6/6
  ✔ Network kosmos-ecommerce_default             Created                                                                                                             0.0s
  ✔ Container kosmos-ecommerce-redis-1           Started                                                                                                             0.3s
  ✔ Container kosmos-ecommerce-pubsub-emulator-1 Started                                                                                                             0.2s
  ✔ Container kosmos-ecommerce-postgres-1        Started                                                                                                             0.3s
  ✔ Container kosmos-ecommerce-iam-service-1     Started                                                                                                             0.3s
  ✔ Container kosmos-ecommerce-catalog-service-1 Started                                                                                                             0.3s

  What's next:
      Filter, search, and stream logs from all your Compose services
      in one place with Docker Desktop's Logs view. docker-desktop://dashboard/logs
  ```

## Instructor Evaluation

Automated checks:

- `docker-compose ps`
  Expected signal: platform dependencies and app services are running or have an
  understandable failure state captured in the evidence log.

- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/.well-known/jwks.json`
  Expected signal: IAM responds with an HTTP success status when the stack is
  running.

- `curl http://localhost:8000/.well-known/jwks.json`
  Expected signal: the JSON response contains a `keys` array and no private key
  material.

Evidence review:

- Confirm the learner did not paste `.env` values, private keys, or tokens.
- Confirm dependency containers are distinguished from application services.
- Confirm failures, if any, include the command used and the observed signal.

Quiz:

1. Why should we prove Docker Compose works before moving IAM and catalog into
   Kubernetes?
2. What must be true before catalog can safely trust IAM-issued access tokens?
3. Which startup failures should prevent a service from accepting traffic?
4. Why is the JWKS endpoint public while private key files must never be
   committed?
5. What is the difference between a container being started and the service being
   ready?

## Completion Log

- 2026-06-04 - Instructor evaluation: needs_revision. Automated checks showed
  `docker-compose ps` has `postgres` and `redis` healthy and `pubsub-emulator`
  running, but the current Compose file only defines infrastructure containers,
  not IAM or catalog application services. `GET /.well-known/jwks.json` on IAM
  returned a JSON response with a `keys` array and no private key material.
  Catalog was not reachable on port 8001 during evaluation. The JWKS status
  check was corrected from HEAD to GET because the endpoint only allows GET.
  Evidence log still needs app/dependency container distinction, Compose startup
  summary, JWKS command result, catalog startup signal, clean shutdown result,
  and quiz answers.
