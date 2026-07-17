# Syntha Wholesale V2 — ADR Index

ADR statuses: `PROPOSED`, `ACCEPTED`, `SUPERSEDED`, `REJECTED`.

Only `ACCEPTED` ADRs are binding. Proposed ADRs may guide review but do not unlock dependent runtime work.

| ADR | Decision | Status | Blocks |
|---|---|---|---|
| [ADR-0001](ADR-0001-vertical-modular-monolith.md) | Vertical modular monolith | PROPOSED | Runtime source layout |
| [ADR-0002](ADR-0002-module-public-api.md) | Root `index.ts` as module API | PROPOSED | Cross-module imports |
| [ADR-0003](ADR-0003-v2-legacy-boundary.md) | V2/legacy isolation boundary | PROPOSED | Legacy reuse and adapters |

## Required before runtime foundation closes

The following decisions still require separate ADRs after `TASK-0001` defines the executable workspace:

- application framework and package boundary;
- server/client rendering boundary;
- persistence and repository ports;
- command/query and event delivery model;
- authentication and active organisation context;
- runtime test stack and CI gates.

## Review rule

An ADR is accepted only when its status is changed to `ACCEPTED`, the reviewer/date are recorded, and dependent task documentation is updated in the same change.
