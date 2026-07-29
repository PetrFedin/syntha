# Syntha Wholesale V2 — Status

Updated: 2026-07-29

## Current phase

Authoritative Season → Campaign → Collection vertical slice on top of the tenant-isolated commercial execution foundation.

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

Implemented on the current branch:

- organisation-scoped Season, Campaign and Collection aggregates;
- validated lifecycle transitions, commercial windows and collection currency;
- exact owner credential and optimistic version on each aggregate;
- create, list, read and lifecycle-update use cases;
- PostgreSQL repositories with an organisation predicate on every query;
- checksum-protected Season and Campaign migration ledgers;
- composite tenant foreign keys from Campaign to Season and Collection to Campaign;
- transactional entity writes and immutable lifecycle audit records;
- exact scoped credential identity on each audit entry;
- App Router APIs protected by `read` and `operate` permissions;
- controlled 400, 401, 403, 404, 409 and 503 outcomes;
- unit coverage for tenant isolation, audit attribution, parent state and stale writes.

TASK-0008 remains `IN_PROGRESS`: its implemented code package is green, while replay-safe create idempotency, real-PostgreSQL integration tests and server-backed lifecycle UI remain open.

## Verification state

Code-equivalent head `b2a9d52cf37221620556cdd8d8fa09358d7b627e` passed workflow `Syntha V2 Foundation`, run `30460658036`, on 2026-07-29. Later commits only update TASK-0008, status and change-ledger evidence and must preserve the same gates.

| Gate | Current package |
|---|---|
| Governance and architecture preflight | PASS — run 30460658036 |
| TypeScript typecheck | PASS — run 30460658036 |
| ESLint | PASS — run 30460658036 |
| Unit tests | PASS — run 30460658036 |
| Next.js production build | PASS — run 30460658036 |
| Playwright | PASS — run 30460658036 |
| PostgreSQL lifecycle integration tests | NOT YET IMPLEMENTED |

## Immediate priority

1. Add replay-safe idempotency for Season, Campaign and Collection create commands.
2. Add PostgreSQL integration coverage for rollback, uniqueness, tenant foreign keys and concurrent optimistic updates.
3. Replace lifecycle workspace fixtures with server-backed read and mutation surfaces.
4. Start Showroom persistence only after the authoritative lifecycle path remains green.

## Known limitations

- Create commands are protected by database uniqueness but do not yet replay the original successful response for the same idempotency key.
- Season, Campaign and Collection APIs are implemented, while their workspace pages still show architectural and empty-state content.
- PostgreSQL schema behavior is not yet exercised by a real-database integration suite in CI.
- Domain events are intentionally deferred until consumers and transactional outbox ownership are explicit.

## Stop conditions

Do not import, copy or fall back to Legacy. Do not add persistence or provider SDKs directly to domain code. Do not bypass module-root public APIs, organisation predicates, scoped authorization, expected-version checks, composite tenant foreign keys or transactional audit evidence.
