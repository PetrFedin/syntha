# Syntha Wholesale V2 — current status

Date: 2026-07-29
Branch: `agent/v2-commercial-core`
Draft PR: `#8`

## Verified foundation

TASK-0001 through TASK-0006 are complete. TASK-0007 through TASK-0011 are implemented and in QA.

The current authoritative commercial lifecycle is:

`Season → Campaign → Collection → Showroom publication snapshot → Buyer access grant → Selection → Draft Order → Submitted Order snapshot`

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

## Verification checkpoint

Verified code head: `83a0c361bf9bdac6758cd6d228a7aafcb13175b1`.

`Syntha V2 Foundation` run `30495432689` passed:

- governance and architecture validation;
- TypeScript typecheck;
- ESLint;
- unit tests;
- real PostgreSQL integration tests;
- production build;
- Playwright browser suite: 95 passed, 16 skipped and one Showroom test passed on retry.

Completion evidence is stored in:

- `tasks/completions/TASK-0009-completion.md`;
- `tasks/completions/TASK-0010-completion.md`;
- `tasks/completions/TASK-0011-completion.md`.

## Next P0

The next vertical slice is the seller commercial response to one immutable submitted Order:

`Submitted Order snapshot → seller review → accept or request changes → immutable response version`

Priority rules for the next slice:

- seller responses must reference one immutable submitted-order snapshot;
- acceptance and change requests must never mutate the buyer's submitted contract;
- every response requires organisation scope, expected version, actor audit, outbox and replay-safe commands;
- buyer and seller projections must expose only their permitted negotiation fields;
- no synthetic confirmation records or legacy fallback are permitted.

## Merge status

PR `#8` remains draft. Nothing is merged into `main` without an explicit decision.
