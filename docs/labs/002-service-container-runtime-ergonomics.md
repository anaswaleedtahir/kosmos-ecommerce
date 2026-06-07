# Lab 002: Service Container Runtime Ergonomics

## Status

- State: not_started
- Learner marked complete: no
- Instructor evaluated: no
- Last evaluated by: none
- Last evaluated at: none

## Objective

Improve IAM and catalog service containers so their runtime filesystem layout is
simple, predictable, and verified without leaking local secrets.

## Learning Outcomes

- Explain the difference between Docker build context, image filesystem layout,
  and runtime bind mounts.
- Use `uv` workspace metadata at build time while keeping service processes in a
  service-local runtime directory.
- Verify that mounted secret files and environment-configured paths point to the
  same container location.
- Capture image and container debugging evidence with production-minded commands
  instead of relying on Docker Desktop screenshots alone.

## Learner Tasks

- [ ] Inspect the IAM and catalog Dockerfiles and identify which paths exist only
  for workspace dependency resolution and which paths are used at runtime.
  Evidence: record the build-time paths, runtime `WORKDIR`, and `PYTHONPATH` for
  each service.

- [ ] Confirm both service images build from the repository root.
  Evidence: record the build command and summarize whether IAM and catalog images
  built successfully.

- [ ] Confirm IAM key configuration matches the runtime mount location.
  Evidence: record the Compose volume target, `PRIVATE_KEY_PATH`,
  `PUBLIC_KEY_PATH`, and an `ls -la` command showing the key filenames inside the
  running container. Do not paste key contents.

- [ ] Confirm IAM and catalog run from service-local runtime directories.
  Evidence: record commands showing `pwd`, top-level files, and the running
  Uvicorn command for each service container.

- [ ] Confirm the services still satisfy the baseline trust flow after the image
  changes.
  Evidence: record an IAM JWKS check and a catalog log line showing JWKS loaded
  from IAM.

- [ ] Stop the stack cleanly after collecting evidence.
  Evidence: record the shutdown command and the final `docker compose ps` output.

## Evidence Log

Add learner evidence here. Keep entries concise and redact secrets.

## Instructor Evaluation

Automated checks:

- `docker compose build iam-service catalog-service`
  Expected signal: both images build successfully from the repository root.

- `docker compose up -d`
  Expected signal: Postgres and Redis become healthy, IAM becomes healthy, and
  catalog starts after IAM.

- `docker compose exec -T iam-service pwd`
  Expected signal: `/app/iam-service`.

- `docker compose exec -T catalog-service pwd`
  Expected signal: `/app/catalog-service`.

- `docker compose exec -T iam-service ls -la keys`
  Expected signal: `private_key.pem` and `public_key.pem` are present, with no
  private key contents printed.

- `docker compose exec -T iam-service python -c "import json, urllib.request; data=json.load(urllib.request.urlopen('http://127.0.0.1:8000/.well-known/jwks.json', timeout=2)); print('keys' in data, len(data.get('keys', [])))"`
  Expected signal: `True 1`.

- `docker compose logs --tail=80 catalog-service`
  Expected signal: a log line showing JWKS loaded from
  `http://iam-service:8000/.well-known/jwks.json`.

Evidence review:

- Confirm the evidence distinguishes build-time workspace paths from runtime
  service paths.
- Confirm bind mount targets and app key paths agree.
- Confirm no `.env` values beyond key path names, private key contents, tokens,
  or other secrets were pasted.
- Confirm the learner used command output, not only Docker Desktop screenshots,
  as evidence.

Quiz:

1. Why can a Docker image use monorepo paths during build but expose a simpler
   runtime path to the process?
2. What does a bind mount do to files that were already present at the target
   path in the image?
3. Why should IAM key paths be configured with environment variables instead of
   hardcoded in Python?
4. What is the difference between an editable workspace install and a
   non-editable package install inside a container image?
5. Why is `docker compose exec` useful when debugging a container that appears
   correct in Docker Desktop?

## Completion Log

- No entries yet.
