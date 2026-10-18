# TASK-0013 Completion Report

Task: `TASK-0013`
Current status: `QA`
Prepared on: 2026-07-30

## Delivered

- One buyer-owned response per seller `AMENDMENT_REQUESTED` Order Review.
- Buyer decisions `ACCEPTED`, `COUNTERED` and `REJECTED`.
- Accept applies the seller proposal to a new immutable Revised Order version.
- Counter applies validated buyer-proposed changes to a new immutable Revised Order version.
- Reject records an immutable response without creating a revised version.
- Original Submitted Order snapshot and seller amendment request remain unchanged.
- Product, variant, line and size identities remain constrained to the submitted contract.
- Deterministic integer-only commercial recalculation using Order Builder rules.
- Exact source lineage from Submitted Order through seller review and buyer response.
- One-response uniqueness and replay-safe accept, counter and reject commands.
- Buyer- and seller-scoped response and revised-version projections.
- Atomic PostgreSQL response, revision, audit, outbox and idempotency persistence.
- Composite buyer and seller tenant foreign keys.
- Authoritative amendment-response workflow inside `/confirmation`.
- Scoped response and Revised Order HTTP APIs.
- Unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria evidence

| Criterion | Evidence | Result |
|---|---|---|
| Response can be created only by the buyer named in the review | workflow tenant test, HTTP 404 and PostgreSQL tenant FK | PASS |
| Source review must be `AMENDMENT_REQUESTED` | domain and workflow state validation | PASS |
| One response exists per seller review | repository uniqueness and workflow second-response test | PASS |
| Accept exactly applies seller-proposed values | domain, PostgreSQL and browser assertions | PASS |
| Counter applies only validated buyer-proposed values | domain and workflow tests | PASS |
| Reject creates no Revised Order version | domain, workflow and PostgreSQL tests | PASS |
| Submitted Order and seller review remain unchanged | domain serialization, PostgreSQL equality and browser API equality checks | PASS |
| Line and size identities must originate from the submitted contract | domain unknown-line, unknown-size and duplicate-change tests | PASS |
| Quantities, prices and basis points are safe integers | domain, API and workspace validation | PASS |
| Revised totals use deterministic per-line commercial calculation | domain exact-total assertions | PASS |
| Exact command replay returns the original response | in-memory, PostgreSQL and browser replay tests | PASS |
| Changed-payload idempotency reuse conflicts | workflow idempotency test | PASS |
| Response, revision, audit, outbox and idempotency commit atomically | duplicate-outbox rollback PostgreSQL test | PASS |
| Buyer and seller reads remain organisation-scoped | repository, API and browser perspective tests | PASS |
| Authoritative `/confirmation` workflow exposes actions and history | production build and browser UI assertions | PASS |
| Full V2 workflow passes | GitHub Actions run `30532143257` at `f244a79839689d86ec54759a4b5e8671deb9f5a0` | PASS |

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

- Seller re-review and approval of a Revised Order are intentionally deferred to the next controlled negotiation slice.
- A Revised Order cannot yet create a Confirmed Order directly; confirmation still requires the existing immutable approval path.
- Production commitment, shipment and receiving remain unavailable until one immutable Confirmed Order is selected as source.
- Product references remain stable external identifiers until Catalog becomes authoritative.
- Merge into `main` remains excluded and requires explicit approval.

## Verification record

Code head: `f244a79839689d86ec54759a4b5e8671deb9f5a0`
Syntha V2 Foundation run: `30532143257`
Result: `PASS`

## Review record

Reviewer: pending
Reviewed on: pending
Decision: pending
