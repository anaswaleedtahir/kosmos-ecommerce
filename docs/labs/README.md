# Modular Labs

This directory is the source of truth for repo labs. Each lab is designed so a
new coding-agent chat can open the lab file, understand what has been done, and
evaluate the work as an instructor.

## Status Model

Use these states in each lab file:

- `not_started`: The lab exists, but learner work has not begun.
- `in_progress`: The learner has started and may have partial evidence.
- `submitted`: The learner marked the lab ready for instructor evaluation.
- `needs_revision`: The instructor found missing evidence, failed checks, or
  conceptual gaps.
- `passed`: The instructor accepted the lab.

The learner owns task completion. Agents should not check off learner tasks
unless the user explicitly asks them to update progress after doing the work.

## Instructor Protocol

When asked to evaluate a lab:

1. Open the lab file and read the objective, outcomes, tasks, evidence, and
   evaluation rubric.
2. Inspect the learner-marked tasks and evidence log.
3. Run the listed automated checks when feasible.
4. Review files, logs, screenshots, manifests, mock data, or dashboards named by
   the evidence requirements.
5. Ask quiz questions when evidence alone does not prove understanding.
6. Give concise feedback and, if requested, update the lab status and completion
   log.

## Lab Index

| Lab | Status | Focus |
|-----|--------|-------|
| [001 Docker Compose Baseline](001-docker-compose-baseline.md) | passed | Prove the local runtime before changing platform pieces. |
| [002 Service Container Runtime Ergonomics](002-service-container-runtime-ergonomics.md) | passed | Improve service images and verify runtime filesystem paths. |
| [003 Raw Kubernetes Workloads](003-raw-kubernetes-workloads.md) | passed | Deploy IAM and catalog with raw local Kubernetes manifests. |

## Lab Template

Use this shape for new labs:

```md
# Lab NNN: Title

## Status

- State: not_started
- Learner marked complete: no
- Instructor evaluated: no
- Last evaluated by: none
- Last evaluated at: none

## Objective

One sentence describing the working artifact or capability.

## Learning Outcomes

- Outcome naming a backend/platform concept.
- Outcome naming a verification or debugging skill.

## Learner Tasks

- [ ] Task the learner performs.
  Evidence: what proves this task happened.

## Evidence Log

Record concise command summaries, file paths, screenshots, logs, or dashboard
links here.

## Instructor Evaluation

Automated checks:

- Command to run and expected signal.

Evidence review:

- What the instructor should inspect.

Quiz:

1. Question with expected concept.
2. Question with expected concept.

## Completion Log

- No entries yet.
```
