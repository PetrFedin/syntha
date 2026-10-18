# TASK-0012 Completion Report

Task: `TASK-0012`
Current status: `QA`
Prepared on: 2026-07-30

## Delivered

- One seller-owned Order Review per immutable Submitted Order snapshot.
- Seller decisions `PENDING → APPROVED | AMENDMENT_REQUESTED`.
- Structured amendment requests with mandatory reason and submitted line/size identity validation.
- Seller approval with exact actor and timestamp attribution.
- Confirmation only from `APPROVED`, creating one immutable Confirmed Order version.
- Original Submitted Order snapshots remain unchanged after approval, amendment and confirmation.
- Buyer- and seller-scoped review and confirmed-version projections.
- Optimistic review version control.
- Replay-safe approval, amendment and confirmation commands with changed-payload conflict detection.
- Atomic PostgreSQL review, confirmed version, audit, outbox and idempotency persistence.
- Composite tenant foreign keys and negative cross-organisation coverage.
- Authoritative `/confirmation` workspace replacing the former generic route surface.
- Scoped review and confirmed-order HTTP APIs.
- Unit, real PostgreSQL and authenticated browser coverage.

## Acceptance criteria evidence

| Criterion | Evidence | Result |
|---|---|---|
| Review source must be a seller-owned submitted snapshot | workflow, PostgreSQL and browser negative-scope tests | PASS |
| One review exists per submitted snapshot | repository uniqueness and workflow tests | PASS |
| Submitted snapshot remains unchanged | domain deep-copy test, PostgreSQL equality check and browser API equality check | PASS |
| Amendment reason is mandatory | domain and API validation | PASS |
| Proposed lines and sizes must exist in the submitted contract | domain tests | PASS |
| Proposed quantities, prices and basis points are validated integers | domain, API and workspace validation | PASS |
| Approval and amendment are mutually exclusive | workflow uniqueness and state-transition tests | PASS |
| Confirmation requires APPROVED | domain and workflow tests | PASS |
| Every mutation uses expected version | workflow and repository optimistic update tests | PASS |
| Exact replay returns the original decision/version | in-memory, PostgreSQL and browser tests | PASS |
| Changed-payload idempotency reuse conflicts | workflow tests | PASS |
| Confirmed version is immutable and visible to buyer and seller | PostgreSQL, API and browser tests | PASS |
| Review, confirmation, audit, outbox and idempotency commit atomically | duplicate-outbox rollback PostgreSQL test | PASS |
| Cross-organisation references and reads are rejected | tenant FK, scoped repository and HTTP 404 tests | PASS |
| Authoritative confirmation workspace replaces generic placeholder | production build and browser assertions | PASS |
| Full V2 workflow passes | GitHub Actions run `30497410958` at `b887f8f203a6c13c773b829f9b28a2b85a62e79b` | PASS |
| Browser suite passes | 97 passed, 22 skipped, 1 existing Selection test flaky but passed on retry | PASS |

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

- Buyer acceptance or counter-response to an amendment request is intentionally deferred to the next negotiation slice.
- Confirmed Orders do not yet create production commitments, shipment plans or receiving records.
- Product references remain stable external identifiers until Catalog becomes authoritative.
- The existing heavy Selection browser flow passed after retry; it remains a reliability item rather than a TASK-0012 functional defect.
- Merge into `main` remains excluded and requires explicit approval.

## Verification record

Code head: `b887f8f203a6c13c773b829f9b28a2b85a62e79b`
Syntha V2 Foundation run: `30497410958`
Result: `PASS`

## Review record

Reviewer: pending
Reviewed on: pending
Decision: pending
