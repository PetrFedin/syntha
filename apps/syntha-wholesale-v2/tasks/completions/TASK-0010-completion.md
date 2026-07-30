# TASK-0010 Completion Report

Task: `TASK-0010`
Current status: `QA`
Prepared on: 2026-07-29

## Delivered

- Seller-issued access grant from one Brand organisation to one distinct Shop organisation.
- Grant binding to one immutable Showroom publication snapshot.
- `ACTIVE → REVOKED` grant lifecycle with exact actor, audit and optimistic version.
- Shop-private Selection aggregate with `DRAFT → READY → ARCHIVED` lifecycle.
- Budget in minor currency units with validated three-letter currency code.
- Shortlist items with stable product and variant references.
- Quantity intent, buyer notes and normalized unique size-curve entries.
- Replay-safe access-grant and Selection creation.
- PostgreSQL grant, Selection, audit and outbox persistence.
- Seller grant APIs and buyer-private Selection APIs with separate organisation projections.
- Authoritative `/selections` workspace and controlled no-credential state.
- Unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria evidence

| Criterion | Evidence | Result |
|---|---|---|
| Access requires a published Showroom and immutable snapshot | workflow and PostgreSQL tests | PASS |
| Seller and buyer organisations differ | domain invariant and tests | PASS |
| Only one active grant exists per Showroom and buyer | partial unique index and conflict coverage | PASS |
| Revocation blocks Selection creation and mutation | workflow tests | PASS |
| Selection reads and writes are buyer-scoped | repository SQL, API behavior and cross-organisation tests | PASS |
| Seller projections expose no buyer-private planning fields | separate repository projections and seller HTTP 404 browser assertion | PASS |
| Budget and currency are valid | domain tests and database constraints | PASS |
| Duplicate product references are rejected | domain tests | PASS |
| Size labels are unique and quantities are non-negative | domain tests and size-curve browser flow | PASS |
| Mutable commands reject stale expected versions | workflow and repository conflict tests | PASS |
| Grant and Selection writes are atomic with audit and outbox | PostgreSQL rollback tests | PASS |
| Authenticated browser completes Selection to READY | Playwright seller-to-buyer lifecycle test | PASS |
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

- Product references remain stable external identifiers until Catalog becomes an authoritative module.
- Submitted commercial orders are intentionally deferred to the next Order Builder vertical slice.
- Merge into `main` is intentionally excluded and requires an explicit review decision.

## Review record

Reviewer: pending
Reviewed on: pending
Decision: pending
