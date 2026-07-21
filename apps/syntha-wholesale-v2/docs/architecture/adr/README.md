# Syntha Wholesale V2 — ADR Index

ADR statuses: `PROPOSED`, `ACCEPTED`, `SUPERSEDED`, `REJECTED`.

Only `ACCEPTED` ADRs are binding.

| ADR | Decision | Status | Blocks |
|---|---|---|---|
| [ADR-0001](ADR-0001-vertical-modular-monolith.md) | Vertical modular monolith | ACCEPTED | Runtime source layout |
| [ADR-0002](ADR-0002-module-public-api.md) | Root `index.ts` as module API | ACCEPTED | Cross-module imports |
| [ADR-0003](ADR-0003-v2-legacy-boundary.md) | V2/legacy isolation boundary | ACCEPTED | Legacy reuse and adapters |
| [ADR-0004](ADR-0004-runtime-framework.md) | Next.js App Router and TypeScript | ACCEPTED | Runtime creation |
| [ADR-0005](ADR-0005-rendering-boundary.md) | Server-first rendering boundary | ACCEPTED | Route and UI composition |
| [ADR-0006](ADR-0006-persistence-and-repositories.md) | Repository ports and PostgreSQL default | ACCEPTED | Persistence implementation |
| [ADR-0007](ADR-0007-auth-and-active-organisation.md) | Server-side active organisation authorization | ACCEPTED | Identity and permissions |
| [ADR-0008](ADR-0008-command-query-event-model.md) | Explicit command/query/event separation | ACCEPTED | Writes, audit and integrations |
| [ADR-0009](ADR-0009-test-stack-and-ci.md) | Vitest, Testing Library and Playwright | ACCEPTED | Runtime test foundation |

## Acceptance record

The complete ADR package was accepted on 2026-07-22 by product owner Petr Fedin. Any change to these boundaries requires a new ADR or an explicit superseding decision.
