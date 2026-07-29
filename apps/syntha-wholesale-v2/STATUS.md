# Syntha Wholesale V2 — current status

Date: 2026-07-29
Branch: `agent/v2-commercial-core`
Draft PR: `#8`

## Verified foundation

TASK-0001 through TASK-0006 are complete. TASK-0007 through TASK-0010 are implemented and in QA.

The current authoritative commercial lifecycle is:

`Season → Campaign → Collection → Showroom publication snapshot → Buyer access grant → Selection`

## QA slices

### TASK-0007 — Adaptive Workspace

- responsive workspace shell for desktop, wide desktop, tablet and mobile;
- canonical navigation and real route-level 404 behavior;
- controlled access states without fixture business records;
- server-backed lifecycle surfaces.

### TASK-0008 — Season, Campaign and Collection

- organisation-scoped aggregates and APIs;
- PostgreSQL repositories and tenant-aware foreign keys;
- optimistic concurrency, exact actor audit and replay-safe creation;
- authenticated end-to-end lifecycle flow.

### TASK-0009 — Authoritative Showroom publication

- Showroom `DRAFT → PUBLISHED → ARCHIVED` lifecycle;
- publication only from an eligible published Collection;
- immutable publication snapshot;
- atomic aggregate, snapshot, audit, outbox and idempotency transaction;
- authoritative `/showroom` workspace and controlled no-credential state.

### TASK-0010 — Buyer access and Selection planning

- snapshot-bound seller-to-buyer access grants;
- explicit access revocation;
- Shop-private Selection with budget, shortlist, notes and size curves;
- seller projections never expose buyer-private planning fields;
- authoritative `/selections` workspace and buyer-scoped APIs;
- cross-organisation, replay, rollback and optimistic-version coverage.

## Verification checkpoint

Verified code head: `feea6517c1f912e32bf8b675112d269614e4db6c`.

`Syntha V2 Foundation` run `30480855159` passed:

- governance and architecture validation;
- TypeScript typecheck;
- ESLint;
- unit tests;
- real PostgreSQL integration tests;
- production build;
- all 108 Playwright browser checks.

Completion evidence is stored in:

- `tasks/completions/TASK-0009-completion.md`;
- `tasks/completions/TASK-0010-completion.md`.

## Next P0

The next vertical slice is Order Builder and commercial order submission from a READY Selection:

`Selection READY → Draft Order → commercial totals → Submit Order → immutable submitted-order snapshot`

Priority rules for the next slice:

- order data remains scoped to the buyer organisation while seller projections expose only the submitted commercial contract;
- quantities must originate from Selection item and size-curve intent;
- prices, currency, discounts, taxes and totals require deterministic minor-unit calculations;
- submission must be idempotent, optimistic-versioned, audited and transactional;
- no legacy fallback or synthetic order records are permitted.

## Merge status

PR `#8` remains draft. Nothing is merged into `main` without an explicit decision.
