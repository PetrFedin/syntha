# TASK-0010 completion report

## Outcome

Snapshot-bound buyer access and Shop-private Selection planning are implemented as the next authoritative vertical slice after Showroom publication.

The completed slice includes:

- seller-issued access grant from one Brand organisation to one distinct Shop organisation;
- grant binding to one immutable Showroom publication snapshot;
- `ACTIVE → REVOKED` grant lifecycle with exact actor, audit and optimistic version;
- Shop-private Selection aggregate with `DRAFT → READY → ARCHIVED` lifecycle;
- budget in minor currency units and validated ISO currency code;
- shortlist items with stable product and variant references;
- quantity intent, buyer notes and unique size-curve entries;
- replay-safe access and Selection creation;
- PostgreSQL grant, Selection, audit and outbox persistence;
- seller grant APIs and buyer-private Selection APIs;
- authoritative `/selections` workspace with seller and buyer projections separated;
- controlled no-credential state;
- unit, real PostgreSQL and authenticated browser coverage.

## Acceptance evidence

- Access is granted only for a published Showroom with an existing immutable snapshot.
- Seller and buyer organisations must differ.
- One active grant is enforced for a Showroom and buyer pair.
- Revocation blocks new Selection creation and further Selection mutations.
- Selection reads and writes require buyer organisation scope.
- Seller-scoped reads cannot retrieve buyer budget, notes, shortlist or size curves.
- Budget, quantities and size-curve values reject negative or unsafe integers.
- Product/variant duplicates and normalized duplicate size labels are rejected.
- Every mutable command rejects stale expected versions.
- Grant and Selection persistence is atomic with audit, outbox and idempotency facts.
- PostgreSQL tests cover replay, rollback and cross-tenant foreign-key isolation.
- The browser flow proves seller grant, buyer Selection creation, budget display, shortlist, size curve and READY transition.
- The browser flow explicitly verifies that seller credentials receive HTTP 404 for the buyer-private Selection.

## Verification

Verified code head: `feea6517c1f912e32bf8b675112d269614e4db6c`.

`Syntha V2 Foundation` run `30480855159` passed:

- governance and architecture validation;
- TypeScript typecheck;
- ESLint;
- unit tests;
- real PostgreSQL integration tests;
- production build;
- all 108 Playwright browser checks.

## Status

TASK-0010 is ready for QA review. Merge into `main` remains outside this task and requires an explicit decision.
