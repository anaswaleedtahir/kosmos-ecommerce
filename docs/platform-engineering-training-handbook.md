# Platform Engineering Training Handbook

This repo is a training ground for becoming a stronger platform/backend engineer.
Use it to practice real engineering loops: build, run, observe, break, diagnose,
repair, and document.

## Learning Goals

- Build async Python services with FastAPI, SQLAlchemy asyncio, Redis, JWT, and
  event-driven boundaries.
- Package services into reliable containers with clear runtime configuration.
- Deploy IAM and catalog to a local Kubernetes cluster using raw manifests first.
- Run local platform dependencies in Kubernetes: Postgres, Redis, and Pub/Sub
  emulator.
- Add LGTM observability: Loki for logs, Grafana for dashboards, Tempo for
  traces, and metrics through Prometheus/Mimir-style workflows.
- Use Terraform for platform bootstrap and add-on ownership.
- Practice senior platform engineer habits: runbooks, failure drills, capacity
  thinking, secrets hygiene, and clear operational handoffs.

## Mentor Contract

Coding agents working in this repo should treat the user as a student and act as
a senior platform/backend mentor.

Good mentoring in this repo means:

- Explain the operational reason behind each change.
- Prefer runnable labs over abstract advice.
- Keep exercises small enough to finish and verify.
- Name the signal that proves the system is healthy.
- Include the debugging path when something fails.
- Preserve production standards even when values are fake and local.

The mentor should not hide complexity too early. Raw Docker, Kubernetes, logs,
metrics, traces, and Terraform files are part of the training surface.

## Target Training Platform

First platform target:

- Local Kubernetes cluster through `kind` or `k3d`
- `iam-service`
- `catalog-service`
- In-cluster Postgres
- In-cluster Redis
- In-cluster Pub/Sub emulator
- Plain Kubernetes `Secret` objects with fake local values
- Raw Kubernetes YAML before Kustomize or Helm
- Shared observability helpers in `packages/shared`
- LGTM stack deployed as platform add-ons
- Terraform owning platform bootstrap, not every app workload

Out of scope for the first pass:

- Production cloud deployment
- Real secrets management
- Order and notification services unless they become mature enough to run
- Helm-first packaging
- GitOps automation

## Training Roadmap

### Phase 1: Baseline Runtime

Goal: prove the existing system runs locally before changing the platform.

Practice:

- Run Postgres, Redis, and Pub/Sub emulator with Docker Compose.
- Run IAM and catalog locally.
- Apply migrations.
- Seed local data where supported.
- Call health-critical endpoints and a small happy path.

Acceptance criteria:

- IAM starts with working RSA keys.
- Catalog starts and loads IAM JWKS.
- Both services can reach their databases.
- Logs include request IDs.

Mentor questions:

- What must be true before catalog can safely accept write traffic?
- Which failures are startup failures, and which should be runtime errors?
- Where does async Python matter in this path?

### Phase 2: Containerization

Goal: make service images predictable and production-minded.

Practice:

- Compare IAM and catalog Dockerfiles.
- Standardize Python version and `uv` installation style.
- Add or verify `.dockerignore`.
- Build images locally.
- Run containers with explicit environment variables.
- Inspect image size and rebuild behavior.

Acceptance criteria:

- IAM and catalog images build from a clean checkout.
- Containers do not require committed `.env` or key files.
- Runtime configuration is explicit.
- Logs go to stdout/stderr.

Mentor questions:

- Which files should be copied before source code for better layer caching?
- What belongs in the image versus the runtime environment?
- How would a bad Dockerfile slow CI?

### Phase 3: Raw Kubernetes Workloads

Goal: learn Kubernetes primitives directly.

Practice:

- Create a local cluster.
- Add a `kosmos` namespace.
- Create raw YAML for IAM and catalog:
  - `Deployment`
  - `Service`
  - `ConfigMap`
  - `Secret`
  - readiness probe
  - liveness probe
  - resource requests and limits
- Mount IAM RSA keys from a Kubernetes Secret.
- Configure catalog `IAM_JWKS_URL` to use the in-cluster IAM service.

Acceptance criteria:

- `kubectl get pods -n kosmos` shows healthy IAM and catalog pods.
- IAM serves `/.well-known/jwks.json`.
- Catalog starts only after it can load JWKS.
- A failing config value causes an understandable pod failure.

Mentor questions:

- Why is a `Service` needed when a pod already has an IP?
- What is the difference between readiness and liveness?
- Which values are safe in a ConfigMap?

### Phase 4: In-Cluster Dependencies

Goal: run the local platform as a small cluster, not split between Compose and
Kubernetes.

Practice:

- Deploy Postgres with an init SQL ConfigMap and a PVC.
- Deploy Redis with a readiness probe.
- Deploy Pub/Sub emulator.
- Update app database URLs and emulator hostnames to in-cluster services.
- Run migrations against in-cluster Postgres.

Acceptance criteria:

- IAM uses the `iam` database.
- Catalog uses the `catalog` database.
- IAM can ping Redis at startup.
- Catalog can initialize or reach the Pub/Sub emulator topic.

Mentor questions:

- When is a local `Deployment` enough, and when would production need a managed
  database?
- What data should survive pod restarts in training?
- What should happen when Redis is temporarily unavailable?

### Phase 5: Application Observability

Goal: instrument the services, not only the cluster.

Practice:

- Add shared observability helpers to `packages/shared`.
- Keep structured JSON logs with request IDs.
- Add a metrics endpoint or middleware suitable for Prometheus scraping.
- Add OpenTelemetry instrumentation for FastAPI and outbound HTTP where useful.
- Propagate trace context between services.

Acceptance criteria:

- A request can be followed by request ID in logs.
- Latency and error metrics exist per service and route pattern.
- A trace shows an inbound request and meaningful child spans.
- Observability code is reusable by IAM and catalog.

Mentor questions:

- What is the difference between a request ID and a trace ID?
- Which labels are useful, and which labels create high cardinality?
- What async boundaries are worth tracing?

### Phase 6: LGTM Stack

Goal: operate a basic observability platform.

Practice:

- Deploy Loki-compatible log collection.
- Deploy Grafana.
- Deploy Tempo.
- Deploy Prometheus or a Mimir-compatible local metrics path.
- Build dashboards for IAM, catalog, and platform overview.
- Write log queries for auth failures, catalog startup failures, and 5xx rates.

Acceptance criteria:

- Grafana shows logs, metrics, and traces for both services.
- Dashboards answer: is it up, is it slow, is it failing, and where?
- A failed login or failed JWKS load can be diagnosed from observability data.

Mentor questions:

- What dashboard would you open first during an incident?
- Which alert would be noisy?
- What is missing from the telemetry?

### Phase 7: Terraform Platform Bootstrap

Goal: use Terraform for platform ownership without hiding Kubernetes basics.

Practice:

- Create Terraform for namespaces and platform add-ons.
- Keep app workloads as raw YAML during the first learning pass.
- Add a local backend/state convention.
- Add `terraform fmt`, `validate`, `plan`, and `apply` workflow.
- Later, add a cloud environment mapping the same ideas to real managed
  resources.

Acceptance criteria:

- Terraform can create platform namespaces repeatably.
- Terraform state is understood and intentionally stored.
- App manifests remain readable and teach Kubernetes primitives.

Mentor questions:

- What should Terraform own here, and what should it leave alone?
- What happens if state is lost?
- How does this change in a real team environment?

### Phase 8: Failure Drills

Goal: practice operating the system when it is broken.

Drills:

- Break IAM RSA key mounting.
- Point catalog at the wrong JWKS URL.
- Kill Postgres and inspect app behavior.
- Saturate Redis or point IAM at the wrong Redis URL.
- Introduce a bad migration URL.
- Create a pod that fails readiness but not liveness.
- Generate 5xx responses and find them in Grafana.

Each drill should include:

- Hypothesis
- Break command or patch
- Expected symptom
- Observability path
- Fix
- Prevention note

## Weekly Practice Plan

Week 1:

- Run the baseline.
- Build both service images.
- Write notes on configuration and startup dependencies.

Week 2:

- Create raw Kubernetes manifests for IAM and catalog.
- Run services in a local cluster.
- Practice probes, services, ConfigMaps, and Secrets.

Week 3:

- Move Postgres, Redis, and Pub/Sub emulator into Kubernetes.
- Run migrations and verify service-to-service behavior.

Week 4:

- Add shared metrics and tracing helpers.
- Verify logs, metrics, and traces from IAM and catalog.

Week 5:

- Deploy the LGTM stack.
- Build dashboards and write debugging queries.

Week 6:

- Add Terraform bootstrap.
- Run failure drills.
- Write or update runbooks from what broke.

## Capstone

Build a local platform demo from a clean checkout:

1. Create the cluster.
2. Bootstrap platform namespaces and observability.
3. Deploy dependencies.
4. Deploy IAM and catalog.
5. Run migrations.
6. Prove service health.
7. Generate traffic.
8. Show logs, metrics, and traces in Grafana.
9. Break one dependency.
10. Diagnose and fix it using the runbook.

Capstone success means another engineer can follow the docs and reach the same
working local platform.
