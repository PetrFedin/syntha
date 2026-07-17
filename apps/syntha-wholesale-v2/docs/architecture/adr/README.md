# Syntha Wholesale V2 — ADR Index

ADR statuses: `PROPOSED`, `ACCEPTED`, `SUPERSEDED`, `REJECTED`.

Only `ACCEPTED` ADRs are binding. Proposed ADRs may guide review but do not unlock dependent runtime work.

| ADR | Decision | Status | Blocks |
|---|---|---|---|
| [ADR-0001](ADR-0001-vertical-modular-monolith.md) | Vertical modular monolith | PROPOSED | Runtime source layout |
| [ADR-0002](ADR-0002-module-public-api.md) | Root `index.ts` as module API | PROPOSED | Cross-module imports |
| [ADR-0003](ADR-0003-v2-legacy-boundary.md) | V2/legacy isolation boundary | PROPOSED | Legacy reuse and adapters |
| [ADR-0004](ADR-0004-runtime-framework.md) | Next.js App Router and TypeScript | PROPOSED | Runtime creation |
| [ADR-0005](ADR-0005-rendering-boundary.md) | Server-first rendering boundary | PROPOSED | Route and UI composition |
| [ADR-0006](ADR-0006-persistence-and-repositories.md) | Repository ports and PostgreSQL default | PROPOSED | Persistence implementation |
| [ADR-0007](ADR-0007-auth-and-active-organisation.md) | Server-side active organisation authorization | PROPOSED | Identity and permissions |
| [ADR-0008](ADR-0008-command-query-event-model.md) | Explicit command/query/event separation | PROPOSED | Writes, audit and integrations |
| [ADR-0009](ADR-0009-test-stack-and-ci.md) | Vitest, Testing Library and Playwright | PROPOSED | Runtime test foundation |

## Review sequence

1. Review ADR-0001 through ADR-0003 as architecture boundaries.
2. Review ADR-0004 and ADR-0005 together as runtime/rendering choices.
3. Review ADR-0006 through ADR-0008 as backend and security contracts.
4. Review ADR-0009 after the preceding runtime ADRs are accepted.

## Review rule

An ADR is accepted only when its status is changed to `ACCEPTED`, reviewer and date are recorded, and dependent task/status documentation is updated in the same change.
