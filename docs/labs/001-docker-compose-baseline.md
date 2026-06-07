# Lab 001: Docker Compose Baseline

## Status

- State: passed
- Learner marked complete: yes
- Instructor evaluated: yes
- Last evaluated by: Codex
- Last evaluated at: 2026-06-07

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

- Dependency containers:
  - Redis
  - PostgreSQL
  - Google Pub/Sub
- Application services:
  - iam-service
  - catalog-service
- Commands for IAM local RSA keys:
  - `openssl genrsa -out keys/private_key.pem 2048`
  - `openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem`
- Docker Compose startup evidence:
  ```text
  docker compose up -d                                                            [+] up 7/7
   ✔ Network kosmos-ecommerce_default             Created                               0.0s
   ✔ Volume kosmos-ecommerce_postgres_data        Created                               0.0s
   ✔ Container kosmos-ecommerce-pubsub-emulator-1 Started                               0.2s
   ✔ Container kosmos-ecommerce-redis-1           Healthy                               6.4s
   ✔ Container kosmos-ecommerce-postgres-1        Healthy                               6.4s
   ✔ Container kosmos-ecommerce-iam-service-1     Healthy                              11.3s
   ✔ Container kosmos-ecommerce-catalog-service-1 Started                              11.4s
  ```
- IAM can serve its public JWKS endpoint
  ```text
  curl 'http://127.0.0.1:8000/.well-known/jwks.json'
  {"keys":[{"kty":"RSA","use":"sig","kid":"36c008c99da759ae","alg":"RS256","n":"1OBSt2PLCXIMc0b62UzKgbXyVR8q1Ykz9u8Htyf3RIvuyOdKuksUb6jmkesQ-GTDDIPaKyNFYeQvbJPdKmOKohnzB4WW69RlSO1whdpgXIE6DKrhNWS0YFqK5hCZGrf6aWK3WuDrT8P_Mv8RbPYmBetYh2tfkqfZmwQCj4x7cQbmcyMu_-WbkJBekrCb8Tdtn_4EM4MRVe5WWZ-CC4DurOp00BAh-wlJztjw4fol3UU2PldVw5QfjPOc6IbDyrvuwnbDXxV36CnyAjaYnCYen_-5EeBc8AJTaDxC6h_nhe63bPrRX9R-HrwKxUgLHNbWPnE1UM7Vmo_rV8u8dkfk6Q","e":"AQAB"}]}
  ```
- Catalog log line

`{"timestamp": "2026-06-07T17:41:24.590428+00:00", "severity": "INFO", "name": "app.main", "message": "JWKS loaded from http://iam-service:8000/.well-known/jwks.json", "filename": "main.py", "lineno": 33, "request_id": "-"}`

- Containers exited cleanly

```text
docker compose down
[+] down 6/6
 ✔ Container kosmos-ecommerce-pubsub-emulator-1 Removed                                                                                                             1.3s
 ✔ Container kosmos-ecommerce-catalog-service-1 Removed                                                                                                             0.5s
 ✔ Container kosmos-ecommerce-iam-service-1     Removed                                                                                                             0.4s
 ✔ Container kosmos-ecommerce-redis-1           Removed                                                                                                             0.3s
 ✔ Container kosmos-ecommerce-postgres-1        Removed                                                                                                             0.2s
 ✔ Network kosmos-ecommerce_default             Removed                                                                                                             0.2s

docker compose ps
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
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
   Ans: to understand what applications depend on one another and set them up
   correctly later on.
2. What must be true before catalog can safely trust IAM-issued access tokens?  
   Ans: that catalog has the latest public keys served by the IAM service.
3. Which startup failures should prevent a service from accepting traffic?  
   Ans: critical dependency failures, such as missing RSA keys, unavailable
   database connectivity, Redis failures for auth/session flows, or catalog
   failing to load IAM JWKS.
4. Why is the JWKS endpoint public while private key files must never be
   committed?
   Ans: this endpoint serves the public keys corresponding to the private keys
   used to sign access tokens.
5. What is the difference between a container being started and the service being
   ready?
   Ans: container started means the entrypoint triggered successfully, but the
   service may still be unable to serve traffic if a dependency is down. Ready
   means the service passed its startup/readiness checks and can accept traffic.

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
- 2026-06-07 - Instructor evaluation: passed. Evidence now shows platform
  dependencies and application services starting under Docker Compose, IAM
  serving a public JWKS response with no private key material, catalog loading
  IAM JWKS at startup, and the stack shutting down cleanly. `docker compose ps`
  was verified after shutdown and showed no running Compose services.
