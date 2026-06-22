# Lab 003: Raw Kubernetes Workloads

## Status

- State: not_started
- Learner marked complete: no
- Instructor evaluated: no
- Last evaluated by: none
- Last evaluated at: none

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

- [ ] Choose or create a local Kubernetes cluster using `kind`, `k3d`, Docker
  Desktop Kubernetes, or another local cluster.
  Evidence: record the cluster tool, cluster name, and
  `kubectl config current-context`.

- [ ] Start the Docker Compose dependencies needed by IAM and catalog:
  Postgres, Redis, and the Pub/Sub emulator.
  Evidence: record the command and `docker compose ps` output showing the three
  dependency containers running or healthy.

- [ ] Create a raw manifest directory for this lab, such as
  `infra/k8s/local/`, and add Kubernetes YAML for the shared namespace.
  Evidence: list the manifest file paths and show `kubectl get namespace
  kosmos`.

- [ ] Add IAM raw manifests for a `Deployment`, `Service`, `ConfigMap`, and
  `Secret`.
  Evidence: record the manifest file paths and summarize which values went into
  the `ConfigMap` versus the `Secret`. Do not paste private key contents,
  database passwords, tokens, or full encoded secret values.

- [ ] Add catalog raw manifests for a `Deployment`, `Service`, and `ConfigMap`.
  Evidence: record the manifest file paths and the configured
  `IAM_JWKS_URL`, which should point at the in-cluster IAM service.

- [ ] Configure both deployments with readiness probes, liveness probes, and
  resource requests and limits.
  Evidence: record the probe paths or commands and the CPU/memory requests and
  limits for each service.

- [ ] Apply the manifests and wait for IAM and catalog pods to become ready.
  Evidence: record the apply command, `kubectl get pods -n kosmos`, and
  `kubectl describe pod` output for any pod that does not become ready.

- [ ] Verify IAM serves JWKS through Kubernetes networking.
  Evidence: record either a `kubectl port-forward` command with a JWKS request
  result or an in-cluster request from a temporary debug pod. The response must
  show a `keys` array without exposing private key material.

- [ ] Verify catalog starts after loading JWKS from IAM through Kubernetes
  service discovery.
  Evidence: record a catalog log line showing JWKS loaded from the in-cluster
  IAM service URL.

- [ ] Run one broken-configuration drill by temporarily pointing catalog at an
  invalid IAM JWKS URL, then restore the correct value.
  Evidence: record the failing pod/log signal, the fix applied, and the final
  healthy pod state.

- [ ] Clean up only the lab Kubernetes resources when finished.
  Evidence: record the cleanup command and `kubectl get all -n kosmos` output
  showing the expected result.

## Evidence Log

Record concise command summaries, file paths, logs, and verification output
here. Redact local secrets, private key contents, tokens, and full encoded
Kubernetes secret values.

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

- No entries yet.
