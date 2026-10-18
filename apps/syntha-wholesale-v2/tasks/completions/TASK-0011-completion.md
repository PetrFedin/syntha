# TASK-0011 Completion Report

Task: `TASK-0011`
Current status: `QA`
Prepared on: 2026-07-29

## Delivered

- One buyer-private Draft Order per READY Selection.
- Exact seller, buyer, Selection, access-grant and immutable Showroom snapshot lineage.
- Order lines seeded only from Selection product, variant and size-curve intent.
- Editable quantities without permitting product, variant or size identity replacement.
- Integer-only unit price, discount basis points, tax basis points and commercial totals.
- Deterministic half-up calculations for gross, discount, net, tax and total minor units.
- Optimistic concurrency for every mutable Draft Order command.
- Replay-safe Draft creation and Order submission with changed-payload conflict detection.
- Immutable submitted-order snapshot with exact actor, source version and timestamp.
- Buyer-only Draft projections and seller-only submitted commercial-contract projections.
- Atomic PostgreSQL persistence for Order, snapshot, audit, outbox and idempotency facts.
- Authoritative `/order-builder` and `/orders` workspaces.
- Canonical `@/modules/orders` public boundary without temporary export or probe files.
- Unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria evidence

| Criterion | Evidence | Result |
|---|---|---|
| Draft creation requires a buyer-owned READY Selection | workflow, PostgreSQL and browser tests | PASS |
| Access grant must remain ACTIVE for creation, mutation and submission | workflow tests | PASS |
| Only one Order exists per Selection | domain/repository uniqueness and replay tests | PASS |
| Product, variant and allowed size identity originate from Selection | domain and browser tests | PASS |
| Initial quantities reproduce Selection size intent | workflow and browser assertions | PASS |
| Quantities and prices use validated safe integers | domain, API and unit tests | PASS |
| Discount and tax inputs remain within 0–10,000 basis points | domain and API validation | PASS |
| Totals use deterministic integer-only half-up calculations | domain tests and exact E2E totals | PASS |
| Every mutable command rejects stale expected versions | workflow and PostgreSQL tests | PASS |
| Submitted Orders are immutable | domain, workflow and browser UI tests | PASS |
| Seller cannot read buyer Draft Orders | scoped repository and HTTP 404 browser assertion | PASS |
| Seller can read only the submitted immutable snapshot | API and browser seller projection tests | PASS |
| Exact create and submit replay returns the original entity | in-memory, PostgreSQL and browser tests | PASS |
| Changed-payload idempotency reuse conflicts | workflow tests | PASS |
| Order, snapshot, audit, outbox and idempotency writes are atomic | real PostgreSQL duplicate-outbox rollback test | PASS |
| Cross-organisation references and reads are rejected | composite tenant FK and scoped-read tests | PASS |
| Full V2 workflow passes | GitHub Actions run `30495432689` at `83a0c361bf9bdac6758cd6d228a7aafcb13175b1` | PASS |
| Browser suite passes | 95 passed, 16 skipped, 1 retried flaky test accepted by Playwright | PASS |

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

- Product references remain stable external identifiers until Catalog becomes authoritative.
- Seller acceptance, rejection and change-request negotiation are intentionally deferred to the next commercial-response slice.
- The Showroom publication test passed after one retry; its intermittent first-attempt behavior remains visible in CI evidence and should be removed in the next reliability pass.
- Merge into `main` is intentionally excluded and requires an explicit review decision.

## Verification record

Code head: `83a0c361bf9bdac6758cd6d228a7aafcb13175b1`
Syntha V2 Foundation run: `30495432689`
Result: `PASS`

## Review record

Reviewer: pending
Reviewed on: pending
Decision: pending
