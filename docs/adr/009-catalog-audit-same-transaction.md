# ADR-009 — Catalog Audit in Same Transaction (Deviation from ADR-003)

**Status:** Accepted
**Date:** 2026-05

## Context

Catalog needs a forensic audit trail of mutations (`ProductCreated`, `VariantAttributesChanged`, `ProductActivated`, inventory adjustments, etc.). The established pattern in `iam-service` (ADR-003) is to commit the business change first and then dispatch domain events to the audit logger in a second commit on the same session — explicitly accepting that a failure in the audit commit leaves the business change persisted with no audit row.

For RBAC that trade-off was tolerable: the actions are rare, the actor is always a superuser, and the audit table is mostly a "nice to have" record of administrative intent. Catalog's audit purpose is different: it is the **primary forensic channel** for "who changed what product / variant / inventory and when", and lost rows directly defeat the goal.

## Decision

Catalog audit rows are written in the **same SQLAlchemy transaction** as the business change. The `AuditLogger` port writes via the same `AsyncSession` as the repositories; `SqlAlchemyCatalogUnitOfWork.commit()` drains audit events into ORM inserts, then issues a **single commit** for both business and audit rows. If the audit insert raises, the entire transaction rolls back — the caller sees a 5xx and may retry, and the business change does not land without its audit row.

Pub/Sub publication remains post-commit and best-effort (broadcast semantics — different criticality). This deliberately creates an asymmetry: audit is guaranteed atomic with the business write; Pub/Sub is fire-and-forget for downstream consumers.

## Consequences

- **Stricter guarantee than ADR-003.** Catalog audit cannot be lost while business write succeeds. Future readers comparing `iam-service` and `catalog-service` will find different UoW commit shapes — this ADR is the reason.
- **Coupling.** A broken `audit_log` table (e.g. constraint violation, missing migration) blocks all catalog mutations. Accepted because mutations are low-frequency admin operations, not request-path hot loops.
- **No retry UX for the audit half.** The "business succeeded but audit failed, surface 500 anyway" mode from ADR-003 does not exist here — either both succeed or both fail.
- **Outbox is the future fix.** When Pub/Sub durability also becomes important (first lost-message incident, or an external integration that requires guaranteed delivery), migrate both audit and Pub/Sub to a transactional outbox. At that point this ADR is superseded.
- **Reassessment trigger:** revisit if catalog mutation rate grows past ~10 writes/sec, if audit-table contention shows up in pg_stat, or when the outbox pattern is adopted.
