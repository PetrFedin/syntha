# Seasons module

The `seasons` module owns the commercial season lifecycle used by campaigns and downstream wholesale workspaces.

## Responsibilities

- define the `Season` domain model and lifecycle rules;
- create, retrieve and update seasons through application services;
- expose repository ports without coupling the domain to a persistence provider;
- preserve organisation ownership for every season operation;
- publish only the module root API from `index.ts` to other modules.

## Public boundary

Cross-module consumers must import from:

```ts
import { ... } from '@/modules/seasons';
```

Deep imports into `domain`, `application` or `infrastructure` are not allowed outside this module.

## Current implementation

- `domain/season.ts` — season entity and domain invariants;
- `application/season-repository.ts` — repository port;
- `application/season-workflows.ts` — application workflows;
- `infrastructure/in-memory-season-repository.ts` — deterministic in-memory adapter;
- `tests/season.test.ts` — domain and workflow coverage.

Persistence, provider SDKs and UI concerns must remain outside the domain layer.
