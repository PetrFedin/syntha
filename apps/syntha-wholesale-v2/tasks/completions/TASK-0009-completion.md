# TASK-0009 Completion Report

Task: `TASK-0009`
Current status: `QA`
Prepared on: 2026-07-29

## Delivered

- Organisation-scoped Showroom aggregate under one Collection.
- `DRAFT → PUBLISHED → ARCHIVED` lifecycle with optimistic concurrency.
- Draft revision for title, description and presentation window.
- Publication restricted to a `PUBLISHED` parent Collection.
- Immutable `ShowroomPublicationSnapshot` with exact actor, aggregate version and timestamp.
- Replay-safe create and publish commands with changed-payload conflict behavior.
- PostgreSQL aggregate, publication snapshot, audit and outbox persistence.
- Atomic publication transaction for aggregate status, snapshot, audit, outbox and idempotency completion.
- Organisation-aware APIs and authoritative `/showroom` workspace.
- Controlled no-credential state without authoritative records or mutation controls.
- Unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria evidence

| Criterion | Evidence | Result |
|---|---|---|
| Every Showroom query includes organisation scope | repository SQL and cross-organisation tests | PASS |
| Parent Collection must belong to the same organisation | application validation and composite tenant foreign key | PASS |
| Code is unique within a Collection | domain/repository conflict coverage and database constraint | PASS |
| Presentation start precedes presentation end | domain tests | PASS |
| Draft changes require expected version | workflow and repository conflict tests | PASS |
| Publication requires an eligible published Collection | workflow tests and authenticated browser setup | PASS |
| Publication snapshot is immutable and actor-attributed | snapshot table, domain contract and API/browser assertions | PASS |
| Exact publish replay returns the original snapshot | unit and PostgreSQL replay tests | PASS |
| Changed idempotent payload conflicts | idempotency workflow tests | PASS |
| Aggregate, snapshot, audit, outbox and idempotency are atomic | duplicate-outbox rollback PostgreSQL test | PASS |
| Unauthenticated workspace exposes no records or mutations | Playwright controlled-state test | PASS |
| Full V2 workflow passes | GitHub Actions run `30480855159` | PASS |

## Commands verified

```text
npm run preflight
npm run typecheck
npm run lint
npm run test
npm run test:postgres
npm run build
npm run test:e2e
```

## Known limitations

- Buyer-specific access is owned by TASK-0010 rather than the Showroom aggregate.
- Product assortment content inside a Showroom still references downstream Catalog capabilities that are not yet authoritative.
- Merge into `main` is intentionally excluded and requires an explicit review decision.

## Review record

Reviewer: pending
Reviewed on: pending
Decision: pending
