# TASK-0009 completion report

## Outcome

Authoritative Showroom publication is implemented as the first buyer-facing publication source of truth after Collection.

The completed slice includes:

- organisation-scoped Showroom aggregate under one Collection;
- `DRAFT → PUBLISHED → ARCHIVED` lifecycle with optimistic concurrency;
- draft revision for title, description and presentation window;
- publication restricted to a `PUBLISHED` parent Collection;
- immutable `ShowroomPublicationSnapshot` with exact actor, version and timestamp;
- replay-safe create and publish commands;
- PostgreSQL aggregate, snapshot, audit and outbox tables;
- atomic publication transaction for status, snapshot, audit, outbox and idempotency completion;
- organisation-aware APIs and authoritative `/showroom` workspace;
- controlled no-credential state without records or mutation controls;
- unit, real PostgreSQL and authenticated browser coverage.

## Acceptance evidence

- Showroom reads and writes always carry active organisation scope.
- Cross-organisation Collection ownership is rejected by application and tenant-aware foreign keys.
- Code uniqueness is enforced within Collection.
- Invalid presentation windows and stale versions are rejected.
- Publication writes one immutable snapshot and one `SHOWROOM_PUBLISHED` outbox fact.
- Changed-payload reuse of an idempotency key conflicts; exact replay returns the original entity or snapshot.
- Duplicate outbox failure rolls back aggregate, snapshot, audit and idempotency state.
- The browser flow creates and publishes a Showroom, then verifies the immutable snapshot through UI and API.
- The no-credential browser test proves that authoritative records and mutation controls are absent.

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

TASK-0009 is ready for QA review. Merge into `main` remains outside this task and requires an explicit decision.
