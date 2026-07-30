# Syntha Wholesale V2 — current status

Date: 2026-07-30
Branch: `agent/v2-commercial-core`
Draft PR: `#8`

## Verified foundation

TASK-0001 through TASK-0006 are complete. TASK-0007 through TASK-0013 are implemented and in QA.

The current authoritative commercial lifecycle supports both confirmation and controlled negotiation branches:

`Season → Campaign → Collection → Showroom publication snapshot → Buyer access grant → Selection → Draft Order → Submitted Order snapshot → Seller approval → Confirmed Order version`

or

`Submitted Order snapshot → Seller amendment request → Buyer accept/counter/reject → immutable Revised Order version`

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

### TASK-0011 — Order Builder and submission

- one buyer-private Draft Order per READY Selection;
- product, variant and size identity inherited from Selection;
- deterministic integer-only pricing, discount, tax and total calculations;
- optimistic Order mutations and replay-safe create/submit commands;
- immutable submitted-order snapshot with seller-visible commercial projection;
- atomic PostgreSQL Order, snapshot, audit, outbox and idempotency persistence;
- authoritative `/order-builder` and `/orders` workspaces;
- real PostgreSQL rollback, composite tenant-FK and authenticated browser coverage;
- canonical `@/modules/orders` boundary without temporary shims or probe files.

### TASK-0012 — Seller decision and confirmation

- one seller-owned review per immutable Submitted Order snapshot;
- mutually exclusive approval or structured amendment request;
- line and size proposals restricted to submitted commercial identities;
- original Submitted Order remains unchanged after every decision;
- replay-safe approval, amendment and confirmation commands;
- optimistic review version control;
- immutable Confirmed Order version visible to buyer and seller;
- atomic PostgreSQL review, confirmed version, audit, outbox and idempotency persistence;
- authoritative `/confirmation` workspace and scoped review/confirmed APIs;
- real PostgreSQL replay, rollback, tenant-FK and authenticated browser coverage.

### TASK-0013 — Buyer amendment response and immutable revision

- one buyer response per seller `AMENDMENT_REQUESTED` Order Review;
- buyer decisions `ACCEPTED`, `COUNTERED` or `REJECTED`;
- accept and counter create a new immutable Revised Order version;
- reject records an immutable response without creating a revision;
- revised lines are restricted to submitted line and size identities;
- deterministic integer-only recalculation uses the Order Builder commercial rules;
- original Submitted Order and seller amendment request remain unchanged;
- buyer and seller receive independently organisation-scoped projections;
- atomic PostgreSQL response, revision, audit, outbox and idempotency persistence;
- authoritative buyer-response workflow inside `/confirmation`;
- replay, rollback, tenant-FK and authenticated browser coverage.

## Verification checkpoint

Verified TASK-0013 code head: `f244a79839689d86ec54759a4b5e8671deb9f5a0`.

`Syntha V2 Foundation` run `30532143257` passed:

- governance and architecture validation;
- TypeScript typecheck;
- ESLint;
- unit tests;
- real PostgreSQL integration tests;
- production build;
- authenticated Playwright browser suite.

Completion evidence is stored in:

- `tasks/completions/TASK-0009-completion.md`;
- `tasks/completions/TASK-0010-completion.md`;
- `tasks/completions/TASK-0011-completion.md`;
- `tasks/completions/TASK-0012-completion.md`;
- `tasks/completions/TASK-0013-completion.md`.

## Next P0

The next controlled vertical slice is seller re-review of a Revised Order and convergence back to one confirmed immutable contract:

`Revised Order version → seller approve or request another explicit revision → Confirmed Order version`

After that commercial gate is complete, production handoff may start only from an immutable Confirmed Order version.

Priority rules:

- a Revised Order must never replace or mutate its Submitted Order, seller request or buyer response sources;
- seller re-review must reference exactly one immutable Revised Order version;
- confirmation must create a new immutable Confirmed Order version with complete lineage;
- every command requires organisation scope, expected version, exact actor audit, outbox and idempotency;
- production commitment cannot start from an unconfirmed revision;
- no synthetic confirmation, production or legacy fallback records are permitted.

## Merge status

PR `#8` remains draft. Nothing is merged into `main` without an explicit decision.
