# Syntha Wholesale V2 — current status

Date: 2026-07-30
Branch: `agent/v2-commercial-core`
Draft PR: `#8`

## Verified foundation

TASK-0001 through TASK-0006 are complete. TASK-0007 through TASK-0012 are implemented and in QA.

The current authoritative commercial lifecycle is:

`Season → Campaign → Collection → Showroom publication snapshot → Buyer access grant → Selection → Draft Order → Submitted Order snapshot → Seller decision → Confirmed Order version`

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

## Verification checkpoint

Verified TASK-0012 code head: `b887f8f203a6c13c773b829f9b28a2b85a62e79b`.

`Syntha V2 Foundation` run `30497410958` passed:

- governance and architecture validation;
- TypeScript typecheck;
- ESLint;
- unit tests;
- real PostgreSQL integration tests;
- production build;
- Playwright browser suite: 97 passed, 22 skipped and one existing Selection flow passed on retry.

Completion evidence is stored in:

- `tasks/completions/TASK-0009-completion.md`;
- `tasks/completions/TASK-0010-completion.md`;
- `tasks/completions/TASK-0011-completion.md`;
- `tasks/completions/TASK-0012-completion.md`.

## Next P0

The next vertical slice is controlled buyer response to a seller amendment request and production handoff from a confirmed contract:

`Amendment request → buyer accept/counter/reject → revised immutable submission → seller approval → Confirmed Order → Production Commitment`

Priority rules for the next slice:

- amendment responses must never rewrite the original submitted snapshot or seller request;
- each revision must become a new immutable commercial version with explicit lineage;
- production commitment may start only from one confirmed immutable Order version;
- every command requires organisation scope, expected version, exact actor audit, outbox and idempotency;
- no synthetic confirmation, production or legacy fallback records are permitted.

## Merge status

PR `#8` remains draft. Nothing is merged into `main` without an explicit decision.
