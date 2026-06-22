# Lab 003: Raw Kubernetes Workloads

## Status

- State: passed
- Learner marked complete: yes
- Instructor evaluated: yes
- Last evaluated by: Codex
- Last evaluated at: 2026-06-22

## Objective

Deploy IAM and catalog as raw Kubernetes workloads in a local cluster while
keeping Postgres, Redis, and Pub/Sub on the proven Docker Compose baseline.

## Learning Outcomes

- Explain the role of `Namespace`, `Deployment`, `Service`, `ConfigMap`, and
  `Secret` in a Kubernetes application workload.
- Configure IAM and catalog with environment-specific values without committing
  real secrets.
- Mount IAM RSA key material from a Kubernetes `Secret` and verify that the
  mounted paths match the service configuration.
- Use Kubernetes service discovery so catalog loads JWKS from the in-cluster IAM
  service name instead of a localhost URL.
- Distinguish readiness probes from liveness probes and explain which failures
  should remove a pod from service traffic.
- Capture useful `kubectl` evidence for pod health, logs, service endpoints,
  and a deliberate broken-configuration drill.

## Learner Tasks

- [x] Choose or create a local Kubernetes cluster using `kind`, `k3d`, Docker
  Desktop Kubernetes, or another local cluster.
  Evidence: record the cluster tool, cluster name, and
  `kubectl config current-context`.

- [x] Start the Docker Compose dependencies needed by IAM and catalog:
  Postgres, Redis, and the Pub/Sub emulator.
  Evidence: record the command and `docker compose ps` output showing the three
  dependency containers running or healthy.

- [x] Create a raw manifest directory for this lab, such as
  `infra/k8s/local/`, and add Kubernetes YAML for the shared namespace.
  Evidence: list the manifest file paths and show `kubectl get namespace
  kosmos`.

- [x] Add IAM raw manifests for a `Deployment`, `Service`, `ConfigMap`, and
  `Secret`.
  Evidence: record the manifest file paths and summarize which values went into
  the `ConfigMap` versus the `Secret`. Do not paste private key contents,
  database passwords, tokens, or full encoded secret values.

- [x] Add catalog raw manifests for a `Deployment`, `Service`, and `ConfigMap`.
  Evidence: record the manifest file paths and the configured
  `IAM_JWKS_URL`, which should point at the in-cluster IAM service.

- [x] Configure both deployments with readiness probes, liveness probes, and
  resource requests and limits.
  Evidence: record the probe paths or commands and the CPU/memory requests and
  limits for each service.

- [x] Apply the manifests and wait for IAM and catalog pods to become ready.
  Evidence: record the apply command, `kubectl get pods -n kosmos`, and
  `kubectl describe pod` output for any pod that does not become ready.

- [x] Verify IAM serves JWKS through Kubernetes networking.
  Evidence: record either a `kubectl port-forward` command with a JWKS request
  result or an in-cluster request from a temporary debug pod. The response must
  show a `keys` array without exposing private key material.

- [x] Verify catalog starts after loading JWKS from IAM through Kubernetes
  service discovery.
  Evidence: record a catalog log line showing JWKS loaded from the in-cluster
  IAM service URL.

- [x] Run one broken-configuration drill by temporarily pointing catalog at an
  invalid IAM JWKS URL, then restore the correct value.
  Evidence: record the failing pod/log signal, the fix applied, and the final
  healthy pod state.

- [x] Clean up only the lab Kubernetes resources when finished.
  Evidence: record the cleanup command and `kubectl get all -n kosmos` output
  showing the expected result.

## Evidence Log

Record concise command summaries, file paths, logs, and verification output
here. Redact local secrets, private key contents, tokens, and full encoded
Kubernetes secret values.

- Local cluster: `kind`, cluster `kosmos-lab`, context `kind-kosmos-lab`.
  Node `kosmos-lab-control-plane` reported `Ready` on Kubernetes v1.36.1.
- Compose boundary: `docker compose ps postgres redis pubsub-emulator` showed
  Postgres and Redis healthy and the Pub/Sub emulator running. Pods reached the
  host services through `host.docker.internal`; moving these dependencies into
  Kubernetes is intentionally deferred to the next lab.
- Raw manifests created:
  - `infra/k8s/local/namespace.yaml`
  - `infra/k8s/local/iam.yaml`
  - `infra/k8s/local/catalog.yaml`
  - local-only, Git-ignored IAM and catalog Secret manifests matching
    `infra/k8s/local/*-secret.local.yaml`
- Configuration split: ConfigMaps contain application names, environment,
  logging, local project/topic identifiers, key paths, emulator address, and
  IAM JWKS URL. Secrets contain database/Redis connection values and IAM RSA
  key files. No secret values or private key material were recorded.
- IAM deployment: rollout completed with `1/1 Running`. Startup logs confirmed
  `RSA keys loaded`, `Database connection established`, and
  `Redis connection established`. RSA files were mounted read-only at
  `/run/secrets/iam` from Secret `iam-service`.
- Catalog deployment: rollout completed with `1/1 Running`. Startup logs
  confirmed JWKS loading from
  `http://iam-service:8000/.well-known/jwks.json`, database connectivity, and
  creation of `projects/local-kosmos/topics/catalog-events` in the emulator.
- Probes and resources:
  - IAM readiness: `GET /.well-known/jwks.json`; liveness: TCP port `8000`.
  - Catalog readiness: `GET /api/v1/catalog/products`; liveness: TCP port
    `8001`.
  - Both request `100m` CPU and `128Mi` memory and limit `500m` CPU and `512Mi`
    memory.
- Kubernetes networking: Service `iam-service` exposed port `8000` and its
  EndpointSlice targeted pod IP `10.244.0.8`. An in-cluster request from the
  catalog deployment reported `keys_array: True key_count: 1` without printing
  key material.
- Debugging trail: an initial IAM pod stayed in `ContainerCreating` with
  `FailedMount` because its volume referenced a mismatched Secret name. Updating
  `secretName` to `iam-service` produced a successful replacement rollout.
- Broken JWKS drill: overriding catalog with
  `http://missing-iam:8000/.well-known/jwks.json` created a replacement pod in
  `0/1 Error`; logs showed `Name does not resolve`, `Failed to load JWKS`, and
  application startup failure. The previous ready pod remained available.
  Removing the override restored the ConfigMap-backed URL and returned catalog
  to `1/1 Running`.
- Cleanup: `kubectl delete -f infra/k8s/local/namespace.yaml --wait=true`
  deleted only namespace `kosmos`. Subsequent checks showed the namespace absent
  and no lab resources, while all three Compose dependencies remained running.

## Instructor Evaluation

Automated checks:

- `kubectl get namespace kosmos`
  Expected signal: the `kosmos` namespace exists while the lab is submitted for
  evaluation.
- `kubectl get deploy,svc,configmap,secret -n kosmos`
  Expected signal: IAM and catalog workloads exist, each service has a
  `Service`, and app configuration is separated into `ConfigMap` and `Secret`
  resources.
- `kubectl get pods -n kosmos`
  Expected signal: IAM and catalog pods are running and ready, or failures are
  clearly documented in the evidence log.
- `kubectl logs -n kosmos deploy/iam-service --tail=80`
  Expected signal: IAM loaded RSA keys and established its required startup
  dependencies.
- `kubectl logs -n kosmos deploy/catalog-service --tail=80`
  Expected signal: catalog loaded JWKS from the in-cluster IAM service URL.
- `kubectl port-forward -n kosmos svc/iam-service 8000:8000`
  followed by
  `curl http://127.0.0.1:8000/.well-known/jwks.json`
  Expected signal: the response contains a `keys` array and no private key
  material.
- `kubectl describe deploy -n kosmos iam-service catalog-service`
  Expected signal: both deployments define readiness probes, liveness probes,
  resource requests, and resource limits.

Evidence review:

- Confirm all manifests are raw Kubernetes YAML, not Kustomize or Helm output.
- Confirm the learner separated non-sensitive configuration from local fake
  secrets.
- Confirm IAM key material is mounted from a Kubernetes `Secret` and that only
  filenames or redacted values appear in the evidence.
- Confirm catalog uses Kubernetes service discovery for IAM JWKS, not
  `localhost`.
- Confirm external Compose dependency hostnames are clearly documented as a
  temporary Phase 3 boundary that will be removed in the next lab.
- Confirm the broken JWKS drill includes the observed failure signal and the
  recovery signal.

Quiz:

1. Why does catalog need a Kubernetes `Service` for IAM instead of pointing at an
   IAM pod IP directly?
2. What is the difference between a readiness probe and a liveness probe?
3. Which IAM and catalog values belong in a `ConfigMap`, and which belong in a
   `Secret`?
4. Why are Postgres, Redis, and Pub/Sub still outside the cluster in this lab?
5. What failure signal would you expect if catalog's `IAM_JWKS_URL` points at the
   wrong Kubernetes service name?

## Completion Log

- 2026-06-22 — Passed. The learner built and loaded local service images,
  deployed IAM and catalog with raw Kubernetes resources, separated config from
  local fake secrets, verified Service-based JWKS discovery, diagnosed a Secret
  mount failure, completed and recovered from a broken-DNS rollout drill, and
  cleaned up only the lab namespace. Quiz understanding was confirmed after
  clarifying that readiness controls traffic eligibility, liveness triggers
  container restarts, and the Compose dependency boundary reduces simultaneous
  variables rather than reflecting a Kubernetes inability to run stateful
  workloads.
