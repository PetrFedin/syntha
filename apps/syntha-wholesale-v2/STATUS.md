# Syntha Wholesale V2 — Status

Updated: 2026-07-29

## Current phase

Authoritative Campaign → Collection vertical slice on top of the tenant-isolated commercial execution foundation.

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
- remains `IN_PROGRESS` until Campaign and Collection pages use authoritative server projections.

### TASK-0008 — Campaign and Collection vertical slice

Implemented on the current branch:

- organisation-scoped Campaign and Collection aggregates;
- validated lifecycle transitions, selling dates and collection currency;
- create, list, read and optimistic-update use cases;
- PostgreSQL tables, indexes, foreign keys and checksum-protected migration ledger;
- transactional entity writes and immutable lifecycle audit records;
- exact scoped credential identity on each audit entry;
- App Router APIs protected by `read` and `operate` permissions;
- controlled 400, 401, 403, 404, 409 and 503 outcomes;
- unit coverage for tenant isolation, audit attribution, parent state and stale writes.

TASK-0008 remains `IN_PROGRESS` until the final branch head passes all gates and the remaining integrity work is delivered.

## Verification state

The previous PR #8 head passed governance, typecheck, lint, unit tests, production build and Playwright. The Campaign → Collection package added on 2026-07-29 has not yet been certified by the final GitHub Actions run and must not be described as QA-complete before that evidence exists.

| Gate | Current package |
|---|---|
| Governance and architecture preflight | PENDING FINAL CI |
| TypeScript typecheck | PENDING FINAL CI |
| ESLint | PENDING FINAL CI |
| Unit tests | PENDING FINAL CI |
| Next.js production build | PENDING FINAL CI |
| Playwright | PENDING FINAL CI |
| PostgreSQL lifecycle integration tests | NOT YET IMPLEMENTED |

## Immediate priority

1. Resolve every failure from the final PR #8 workflow for the Campaign → Collection package.
2. Validate `seasonId` against an authoritative persisted Season owned by the same organisation.
3. Add replay-safe idempotency for Campaign and Collection create commands.
4. Add PostgreSQL integration coverage for rollback, uniqueness and concurrent optimistic updates.
5. Replace Campaign and Collection workspace fixtures with server-backed read and mutation surfaces.
6. Start Showroom persistence only after Campaign → Collection has one green authoritative path.

## Known limitations

- Campaign currently stores a validated non-empty `seasonId`, but the Season source is not yet persisted and checked transactionally.
- Create commands are protected by database uniqueness but do not yet replay the original successful response for the same idempotency key.
- Campaign and Collection APIs are implemented, while their workspace pages still show architectural and empty-state content.
- Domain events are intentionally deferred until consumers and transactional outbox ownership are explicit.

## Stop conditions

Do not import, copy or fall back to Legacy. Do not add persistence or provider SDKs directly to domain code. Do not bypass module-root public APIs, organisation predicates, scoped authorization, expected-version checks or transactional audit evidence.
