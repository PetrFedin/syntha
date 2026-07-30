# Seasons module

The `seasons` module owns the organisation-scoped commercial season lifecycle used by Campaigns and downstream wholesale workspaces.

## Responsibilities

- define the `Season` domain model and lifecycle rules;
- create, retrieve and update Seasons only inside the active organisation;
- enforce unique codes, date integrity and optimistic versions;
- persist the exact owner credential and immutable lifecycle audit evidence;
- expose repository ports without coupling the domain to PostgreSQL;
- publish only the module-root API from `index.ts`.

## Public boundary

Cross-module consumers must import from:

```ts
import { ... } from '@/modules/seasons';
```

Deep imports into `domain`, `application` or `infrastructure` are not allowed outside this module.

## Current implementation

- `domain/season.ts` — Season entity, ownership and lifecycle invariants;
- `application/season-repository.ts` — organisation-scoped repository and audit ports;
- `application/season-workflows.ts` — create, list, read and status workflows;
- `infrastructure/in-memory-season-repository.ts` — deterministic test adapter;
- `infrastructure/postgres-season-repository.ts` — transactional PostgreSQL adapter;
- `infrastructure/season-migrations.ts` — checksum-protected Season and audit schema;
- `infrastructure/season-runtime.ts` — lazy server runtime;
- `tests/season.test.ts` — domain, tenant-isolation, audit and concurrency coverage.

Campaigns may reference a Season only through the public API and the composite `(organisation_id, season_id)` database constraint.
