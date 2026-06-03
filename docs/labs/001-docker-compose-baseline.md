# Lab 001: Docker Compose Baseline

## Status

- State: not_started
- Learner marked complete: no
- Instructor evaluated: no
- Last evaluated by: none
- Last evaluated at: none

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

- [ ] Inspect `docker-compose.yml` and identify which containers are platform
  dependencies and which are application services.
  Evidence: list the dependency containers and app containers in the evidence log.

- [ ] Prepare IAM local RSA keys if they are missing.
  Evidence: record the commands run, but do not paste private key material.

- [ ] Start the Compose stack from the repository root.
  Evidence: record the command and summarize which containers reached a running
  or healthy state.

- [ ] Confirm IAM can serve its public JWKS endpoint.
  Evidence: record the command and whether the response contained a `keys` array.

- [ ] Confirm catalog can start with its configured IAM JWKS URL.
  Evidence: record the relevant catalog log line or health signal.

- [ ] Stop the stack cleanly after collecting evidence.
  Evidence: record the shutdown command and whether containers exited cleanly.

## Evidence Log

Add learner evidence here. Keep entries concise and redact secrets.

- No entries yet.

## Instructor Evaluation

Automated checks:

- `docker-compose ps`
  Expected signal: platform dependencies and app services are running or have an
  understandable failure state captured in the evidence log.

- `curl -I http://localhost:8000/.well-known/jwks.json`
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

- No entries yet.
