# Syntha Wholesale V2 — Status

Updated: 2026-07-29

## Current phase

Authoritative Showroom publication on top of the verified Season → Campaign → Collection lifecycle and adaptive workspace.

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
- Tenant-isolated commercial intelligence, durable execution, scheduler, integrations, reconciliation and tamper-evident operational audit in PR #8.

## QA-ready P0 delivery

### TASK-0007 — adaptive workspace

- one root-owned responsive `WorkspaceShell`;
- one validated registry for 15 workspace routes and eight lifecycle stages;
- typed Workspace and Commercial Context with context-preserving links;
- desktop, wide desktop, iPad and iPhone navigation modes;
- single page `main` landmark during loading;
- real network-boundary 404 for unknown workspace slugs;
- authoritative Campaign and Collection workspaces with controlled access states;
- completion report: `tasks/completions/TASK-0007-completion.md`;
- status: `QA`.

### TASK-0008 — Season, Campaign and Collection vertical slice

- organisation-scoped aggregates, repositories, APIs and server actions;
- PostgreSQL migrations and composite tenant foreign keys;
- optimistic concurrency and exact actor audit evidence;
- replay-safe create commands and atomic idempotency completion;
- real PostgreSQL rollback, uniqueness, tenant-FK and concurrency tests;
- authenticated browser creation and status advancement for the full path;
- API readback confirms parent links and resulting versions;
- completion report: `tasks/completions/TASK-0008-completion.md`;
- status: `QA`.

## Active P0 delivery

### TASK-0009 — authoritative Showroom publication

- Showroom belongs to one Collection and organisation;
- draft editing uses optimistic versioning;
- publication creates an immutable snapshot;
- publish behavior is replay-safe and transactionally audited;
- PostgreSQL, API, workspace and browser coverage are required before QA.

## Verification state

Code head `c0e0bbead0a6c1f359199037d7f7a577e0fa2768` passed workflow `Syntha V2 Foundation`, run `30474774287`, on 2026-07-29.

| Gate | Current lifecycle package |
|---|---|
| Locked dependency install | PASS — run 30474774287 |
| Governance and architecture preflight | PASS — run 30474774287 |
| TypeScript typecheck | PASS — run 30474774287 |
| ESLint | PASS — run 30474774287 |
| Unit tests | PASS — run 30474774287 |
| PostgreSQL integration tests | PASS — run 30474774287 |
| Next.js production build | PASS — run 30474774287 |
| Controlled-state Playwright | PASS — run 30474774287 |
| Authenticated lifecycle Playwright | PASS — run 30474774287 |

## Immediate priority

1. Implement the Showroom aggregate and immutable publication snapshot contract.
2. Add PostgreSQL schema, tenant foreign key to Collection and transactional publication evidence.
3. Add replay-safe create and publish application commands.
4. Replace the Showroom empty state with authoritative projections and mutations.
5. Add authenticated Showroom publication browser coverage before QA.

## Known limitations

- TASK-0007 and TASK-0008 await explicit review before transition from QA to DONE.
- Domain events for the completed lifecycle remain deferred until named consumers and outbox ownership are explicit.
- Showroom, buyer access and Selection are not yet authoritative.
- PR #8 remains draft and is not merged into `main` without a separate decision.

## Stop conditions

Do not import, copy or fall back to Legacy. Do not add persistence or provider SDKs directly to domain code. Do not bypass module-root public APIs, organisation predicates, idempotency fingerprints, expected-version checks, immutable publication snapshots, composite tenant foreign keys, real-PostgreSQL coverage or transactional audit evidence.
