# Lab 002: Service Container Runtime Ergonomics

## Status

- State: passed
- Learner marked complete: yes
- Instructor evaluated: yes
- Last evaluated by: Codex
- Last evaluated at: 2026-06-08

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

- [x] Inspect the IAM and catalog Dockerfiles and identify which paths exist only
  for workspace dependency resolution and which paths are used at runtime.
  Evidence: record the build-time paths, runtime `WORKDIR`, and `PYTHONPATH` for
  each service.

- [x] Confirm both service images build from the repository root.
  Evidence: record the build command and summarize whether IAM and catalog images
  built successfully.

- [x] Confirm IAM key configuration matches the runtime mount location.
  Evidence: record the Compose volume target, `PRIVATE_KEY_PATH`,
  `PUBLIC_KEY_PATH`, and an `ls -la` command showing the key filenames inside the
  running container. Do not paste key contents.

- [x] Confirm IAM and catalog run from service-local runtime directories.
  Evidence: record commands showing `pwd`, top-level files, and the running
  Uvicorn command for each service container.

- [x] Confirm the services still satisfy the baseline trust flow after the image
  changes.
  Evidence: record an IAM JWKS check and a catalog log line showing JWKS loaded
  from IAM.

- [x] Stop the stack cleanly after collecting evidence.
  Evidence: record the shutdown command and the final `docker compose ps` output.

## Evidence Log

- IAM and catalog Dockerfiles buildtime context, runtime context and PYTHONPATH 
  - Build time context
  ```text
    [iam-service stage-0  3/11] WORKDIR /app
    [catalog-service stage-0  3/11] WORKDIR /app
  ```
  - Runtime context
  ```text
    [iam-service stage-0 11/12] WORKDIR /app/iam-service
    [catalog-service stage-0 11/12] WORKDIR /app/catalog-service
  ```
  - PYTHONPATH
  ```text
    ENV PYTHONPATH=/app/iam-service
    ENV PYTHONPATH=/app/catalog-service
  ```
- Docker Build from the root
  ```text
  docker compose build iam-service catalog-service                                              ✔  cosmos-ecom  
  [+] Building 36.3s (34/34) FINISHED                                                                                                                                     
  => [internal] load local bake definitions                                                                                                                         0.0s
  => => reading from stdin 1.10kB                                                                                                                                   0.0s
  => [catalog-service internal] load build definition from Dockerfile                                                                                               0.0s
  => => transferring dockerfile: 851B                                                                                                                               0.0s
  => [iam-service internal] load build definition from Dockerfile                                                                                                   0.0s
  => => transferring dockerfile: 847B                                                                                                                               0.0s
  => [iam-service internal] load metadata for docker.io/library/python:alpine                                                                                       5.9s
  => [iam-service internal] load metadata for ghcr.io/astral-sh/uv:latest                                                                                           6.6s
  => [auth] library/python:pull token for registry-1.docker.io                                                                                                      0.0s
  => [iam-service internal] load .dockerignore                                                                                                                      0.0s
  => => transferring context: 172B                                                                                                                                  0.0s
  => [catalog-service] FROM ghcr.io/astral-sh/uv:latest@sha256:b46b03ddfcfbf8f547af7e9eaefdf8a39c8cebcba7c98858d3162bd28cf536f6                                     3.8s
  => => resolve ghcr.io/astral-sh/uv:latest@sha256:b46b03ddfcfbf8f547af7e9eaefdf8a39c8cebcba7c98858d3162bd28cf536f6                                                 0.0s
  => => sha256:35ca5f3a598257ae93393cfc4a3ad80568d7c1a32155140a4e10c5c1678af91d 98B / 98B                                                                           0.6s
  => => sha256:c30684830e0628b8b40223f02e3616d008a76555f74b2748549a5a25d75bd787 23.64MB / 23.64MB                                                                   3.4s
  => => extracting sha256:c30684830e0628b8b40223f02e3616d008a76555f74b2748549a5a25d75bd787                                                                          0.3s
  => => extracting sha256:35ca5f3a598257ae93393cfc4a3ad80568d7c1a32155140a4e10c5c1678af91d                                                                          0.0s
  => [catalog-service internal] load build context                                                                                                                  0.0s
  => => transferring context: 298.79kB                                                                                                                              0.0s
  => [catalog-service stage-0  1/11] FROM docker.io/library/python:alpine@sha256:5a824eb82cc75361f98611f3cfc5091ea33f10a6ccea4d4ebdabbc523b9a1614                   0.1s
  => => resolve docker.io/library/python:alpine@sha256:5a824eb82cc75361f98611f3cfc5091ea33f10a6ccea4d4ebdabbc523b9a1614                                             0.0s
  => [iam-service internal] load build context                                                                                                                      0.0s
  => => transferring context: 328.60kB                                                                                                                              0.0s
  => [catalog-service stage-0  2/11] COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/                                                                         0.1s
  => [catalog-service stage-0  3/11] WORKDIR /app                                                                                                                   0.0s
  => [catalog-service stage-0  4/11] COPY pyproject.toml uv.lock ./                                                                                                 0.0s
  => [iam-service stage-0  5/11] COPY packages/shared packages/shared                                                                                               0.0s
  => CACHED [iam-service stage-0  4/12] COPY pyproject.toml uv.lock ./                                                                                              0.0s
  => CACHED [iam-service stage-0  5/12] COPY packages/shared packages/shared                                                                                        0.0s
  => [iam-service stage-0  6/12] COPY services/iam-service/pyproject.toml services/iam-service/pyproject.toml                                                       0.0s
  => [catalog-service stage-0  6/11] COPY services/catalog-service/pyproject.toml services/catalog-service/pyproject.toml                                           0.0s
  => [catalog-service stage-0  7/11] RUN uv sync --frozen --no-cache --no-dev --no-editable --package catalog-service                                              19.9s
  => [iam-service stage-0  7/12] RUN uv sync --frozen --no-cache --no-dev --no-editable --package iam-service                                                      20.1s
  => [catalog-service stage-0  8/11] COPY services/catalog-service/app catalog-service/app/                                                                         0.0s
  => [catalog-service stage-0  9/11] COPY services/catalog-service/migrations catalog-service/migrations/                                                           0.0s
  => [catalog-service stage-0 10/11] COPY services/catalog-service/alembic.ini catalog-service/alembic.ini                                                          0.0s
  => [catalog-service stage-0 11/11] WORKDIR /app/catalog-service                                                                                                   0.0s
  => [catalog-service] exporting to image                                                                                                                           5.1s
  => => exporting layers                                                                                                                                            4.0s
  => => exporting manifest sha256:13d77d53cfee8128b1d85afb1261c7a7f9d39145195a8a238cfa9684e347b8ab                                                                  0.0s
  => => exporting config sha256:8108eac0f6d699a7dd15a632f9c41bd2f333707bd2cf18b196398eb1ab00081e                                                                    0.0s
  => => exporting attestation manifest sha256:bc066544aeb45e51384f7239bea9e6f058aae4bb68f63e8be882699e9157b146                                                      0.0s
  => => exporting manifest list sha256:8cad070054d7851869bf2e91d412db2b10139305d4f09026b148defbdfe7e591                                                             0.0s
  => => naming to docker.io/library/kosmos-ecommerce-catalog-service:latest                                                                                         0.0s
  => => unpacking to docker.io/library/kosmos-ecommerce-catalog-service:latest                                                                                      1.0s
  => [iam-service stage-0  8/12] COPY services/iam-service/app iam-service/app                                                                                      0.0s
  => [iam-service stage-0  9/12] COPY services/iam-service/migrations iam-service/migrations                                                                        0.0s
  => [iam-service stage-0 10/12] COPY services/iam-service/alembic.ini iam-service/alembic.ini                                                                      0.0s
  => [iam-service stage-0 11/12] WORKDIR /app/iam-service                                                                                                           0.0s
  => [iam-service stage-0 12/12] RUN mkdir -p keys                                                                                                                  0.1s
  => [iam-service] exporting to image                                                                                                                               5.1s
  => => exporting layers                                                                                                                                            4.1s
  => => exporting manifest sha256:0e29c8e381e9450315c496f65a5c721de841fd9e402685ead3d936f25d03868a                                                                  0.0s
  => => exporting config sha256:a6b2c157d00808b7ce65404818086f930145bec09e478c4ea4a389c0b20241cd                                                                    0.0s
  => => exporting attestation manifest sha256:c72001a772b0a482fad88a112a06c6ca99d0e4a9e0e073f6f4563f7efb7ffbd3                                                      0.0s
  => => exporting manifest list sha256:2c3979eb4326f7b149453ef13c03fdf5b9d086e3ab1f918402b980437605d5dd                                                             0.0s
  => => naming to docker.io/library/kosmos-ecommerce-iam-service:latest                                                                                             0.0s
  => => unpacking to docker.io/library/kosmos-ecommerce-iam-service:latest                                                                                          0.9s
  => [catalog-service] resolving provenance for metadata file                                                                                                       0.0s
  => [iam-service] resolving provenance for metadata file                                                                                                           0.0s
  [+] build 2/2
  ✔ Image kosmos-ecommerce-iam-service     Built                                                                                                                    36.4s
  ✔ Image kosmos-ecommerce-catalog-service Built                                                                                                                    36.4s
  ```
- IAM key configuration and the runtime mount location
  - Docker compose volume binding for the keys
    ```text
    volumes:
      - ./services/iam-service/keys:/app/iam-service/keys:ro
    ```
  - Production Env file paths for the keys
    ```text
    PRIVATE_KEY_PATH=keys/private_key.pem
    PUBLIC_KEY_PATH=keys/public_key.pem
    ```
  - Docker runtime keys mount
    ```text
    /app/iam-service/keys # ls -la
    total 12
    drwxr-xr-x    5 root     root           160 Jun  3 21:45 .
    drwxr-xr-x    1 root     root          4096 Jun  8 21:22 ..
    -rw-r--r--    1 root     root             0 Jun  3 21:45 .gitkeep
    -rw-------    1 root     root          1704 Mar 16 21:20 private_key.pem
    -rw-r--r--    1 root     root           451 Mar 16 21:20 public_key.pem
    ```
- IAM and catalog run from service-local runtime directories
  ```text
  /app/iam-service # pwd
  /app/iam-service

  /app/iam-service # ls -la
  total 24
  drwxr-xr-x    1 root     root          4096 Jun  8 21:22 .
  drwxr-xr-x    1 root     root          4096 Jun  8 21:22 ..
  -rw-r--r--    1 root     root          5011 Jun  3 21:45 alembic.ini
  drwxr-xr-x    6 root     root          4096 Jun  3 21:45 app
  drwxr-xr-x    5 root     root           160 Jun  3 21:45 keys
  drwxr-xr-x    3 root     root          4096 Jun  3 21:45 migrations

  /app/iam-service # top
  PID  PPID USER     STAT   VSZ %VSZ CPU %CPU COMMAND
  1     0 root     S     149m   2%   0   0% {uvicorn} /app/.venv/bin/python /app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

  /app/catalog-service # pwd
  /app/catalog-service

  /app/catalog-service # ls -la
  total 20
  drwxr-xr-x    1 root     root          4096 Jun  8 21:22 .
  drwxr-xr-x    1 root     root          4096 Jun  8 21:22 ..
  -rw-r--r--    1 root     root           646 Jun  3 21:45 alembic.ini
  drwxr-xr-x    6 root     root          4096 Jun  3 21:45 app
  drwxr-xr-x    3 root     root          4096 Jun  3 21:45 migrations

  /app/catalog-service # top
  PID  PPID USER     STAT   VSZ %VSZ CPU %CPU COMMAND
  1     0 root     S     187m   2%   9   0% {uvicorn} /app/.venv/bin/python /app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
  ```
- Services still satisfy the baseline trust flow after the image change
  ```text
  Catalog service log
  {"timestamp": "2026-06-08T21:38:07.467218+00:00", "severity": "INFO", "name": "app.main", "message": "JWKS loaded from http://iam-service:8000/.well-known/jwks.json", "filename": "main.py", "lineno": 33, "request_id": "-"}

  IAM service log
  {"timestamp": "2026-06-08T21:38:01.216621+00:00", "severity": "INFO", "name": "app.main", "message": "RSA keys loaded", "filename": "main.py", "lineno": 88, "request_id": "-"}
  ```
- Stopped the stack cleanly
  ```text
  ~/Projects/kosmos-ecommerce# docker compose down
  [+] down 6/6
  ✔ Container kosmos-ecommerce-catalog-service-1 Removed                                                                                                             0.6s
  ✔ Container kosmos-ecommerce-pubsub-emulator-1 Removed                                                                                                             1.2s
  ✔ Container kosmos-ecommerce-iam-service-1     Removed                                                                                                             0.6s
  ✔ Container kosmos-ecommerce-redis-1           Removed                                                                                                             0.3s
  ✔ Container kosmos-ecommerce-postgres-1        Removed                                                                                                             0.2s
  ✔ Network kosmos-ecommerce_default             Removed                                                                                                             0.2s

  ~/Projects/kosmos-ecommerce# docker ps
  CONTAINER ID        IMAGE         COMMAND          CREATED        STATUS         PORTS
  ```

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
  Ans: because we can do multi stage build and so the main build can use the wider context and then later on expose a simpler path for the runtime
2. What does a bind mount do to files that were already present at the target
  path in the image?  
  Ans: It overrides them, the mounted one will be shown. Once we unmount the we can the runtime files if exists
3. Why should IAM key paths be configured with environment variables instead of
  hardcoded in Python?  
  Ans: to run locally the path might differ from the runtime conatiners paths, so therfore it is best to set it in the environment variable
4. What is the difference between an editable workspace install and a
  non-editable package install inside a container image?  
  Ans: an editable workspace links the package source code, while the non-editable package install it in the active environment i.e .venv and we can change the runtime files layout in the conatiner, cant be the case in editable one
5. Why is `docker compose exec` useful when debugging a container that appears
  correct in Docker Desktop?  
  Ans: because we can see inside the conatiner, what is going on?

Instructor result, 2026-06-08:

- Automated checks passed. `docker compose build iam-service catalog-service`
  built both service images from the repository root. `docker compose up -d`
  started Postgres and Redis as healthy, then IAM as healthy, then catalog.
- Runtime checks passed. IAM returned `/app/iam-service`, catalog returned
  `/app/catalog-service`, the IAM `keys` mount contained only the expected key
  filenames, and the in-container JWKS check returned `True 1`.
- Trust-flow check passed. Catalog logs showed `JWKS loaded from
  http://iam-service:8000/.well-known/jwks.json`.
- Evidence review passed for command-based debugging and secret handling. The log
  records key filenames and paths but does not paste private key contents.
- Quiz review passed after revision. The updated answer correctly explains that
  editable installs link Python back to source code, while non-editable installs
  place package artifacts in the active environment. In this lab, that supports
  a cleaner container runtime because installed packages do not depend on
  mutable workspace source paths.

## Completion Log

- 2026-06-08, Codex instructor: Automated runtime verification passed for image
  build, Compose startup order, service-local working directories, mounted IAM
  key paths, IAM JWKS, and catalog JWKS loading. Initially marked
  `needs_revision` for quiz question 4.
- 2026-06-08, Codex instructor: Re-evaluated revised quiz question 4 and accepted
  the answer. Lab marked `passed`.
