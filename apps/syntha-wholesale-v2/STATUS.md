# Syntha Wholesale V2 — Status

Updated: 2026-07-29

## Current phase

Server-backed Season → Campaign → Collection workspace integration on top of a green authoritative PostgreSQL lifecycle path.

The independent V2 product lives only in `apps/syntha-wholesale-v2`. Legacy remains separate and is not an implementation source.

## Canonical branch and review

- Working branch: `agent/v2-commercial-core`
- Review vehicle: draft PR #8
- Base: `main`
- All V2 writes must specify the branch explicitly.

## Completed foundation

- ADR-0001 through ADR-0009 accepted.
- Canonical vertical modular architecture and root `index.ts` module API.
- Strict V2/Legacy isolation boundary.
- Foundation tasks TASK-0001 through TASK-0006 complete.
- Architecture, documentation, task, ledger and import-boundary validation.
- Product Canon with twenty WSC decisions, module ownership and eight core workflows.
- Independent Next.js App Router runtime and responsive adaptive workspace.
- Organisation and identity-access domain contracts.
- Tenant-isolated commercial intelligence, durable execution, scheduler, integrations, reconciliation and tamper-evident operational audit in PR #8.

## Active P0 delivery

### TASK-0007 — adaptive workspace

- one root-owned `WorkspaceShell`;
- one validated registry for 15 workspace routes;
- eight-stage Campaign → DealSpace lifecycle;
- typed Workspace and Commercial Context;
- context-preserving links, shared page states and responsive browser coverage;
- remains `IN_PROGRESS` until lifecycle pages use authoritative server projections.

### TASK-0008 — Season, Campaign and Collection vertical slice

Implemented and verified on the current branch:

- organisation-scoped Season, Campaign and Collection aggregates;
- validated lifecycle transitions, commercial windows and collection currency;
- exact owner credential and optimistic version on each aggregate;
- create, list, read and lifecycle-update use cases;
- PostgreSQL repositories with an organisation predicate on every query;
- checksum-protected Season, Campaign and idempotency migration ledgers;
- composite tenant foreign keys from Campaign to Season and Collection to Campaign;
- replay-safe `Idempotency-Key` contract with canonical payload fingerprints;
- same-key replay of the original entity without duplicate facts or audits;
- deterministic conflict for changed payload or actor;
- transactional entity, immutable audit and idempotency completion writes;
- exact scoped credential identity on each audit entry;
- App Router APIs protected by `read` and `operate` permissions;
- controlled 400, 401, 403, 404, 409 and 503 outcomes;
- unit coverage for tenant isolation, replay, audit attribution, parent state and stale writes;
- real PostgreSQL coverage for rollback, uniqueness, tenant foreign keys and concurrent optimistic updates;
- exact `pg@8.22.0` runtime dependency and mandatory PostgreSQL 16 CI service gate.

TASK-0008 remains `IN_PROGRESS` only because the workspace still needs authoritative server-backed read and mutation surfaces and domain events remain intentionally deferred.

## Verification state

Code head `e8a2f666eaf51aa6f1c945df4bd0961b4334f68d` passed workflow `Syntha V2 Foundation`, run `30472074274`, on 2026-07-29.

| Gate | Current package |
|---|---|
| Locked dependency install | PASS — run 30472074274 |
| Governance and architecture preflight | PASS — run 30472074274 |
| TypeScript typecheck | PASS — run 30472074274 |
| ESLint | PASS — run 30472074274 |
| Unit tests | PASS — run 30472074274 |
| PostgreSQL lifecycle integration tests | PASS — run 30472074274 |
| Next.js production build | PASS — run 30472074274 |
| Playwright | PASS — run 30472074274 |

## Immediate priority

1. Replace Season, Campaign and Collection workspace fixtures with server-backed read projections.
2. Add create and lifecycle mutation surfaces with required idempotency keys and expected versions.
3. Cover loading, empty, unauthorized, conflict and service-unavailable states in unit and browser tests.
4. Start Showroom persistence only after the authoritative lifecycle workspace remains green.

## Known limitations

- Season, Campaign and Collection APIs are authoritative, while their workspace pages still show architectural and empty-state content.
- Domain events are intentionally deferred until consumers and transactional outbox ownership are explicit.
- PR #8 remains draft and is not merged into `main` without a separate decision.

## Stop conditions

Do not import, copy or fall back to Legacy. Do not add persistence or provider SDKs directly to domain code. Do not bypass module-root public APIs, organisation predicates, scoped authorization, idempotency fingerprints, expected-version checks, composite tenant foreign keys, real-PostgreSQL coverage or transactional audit evidence.
