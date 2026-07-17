# ADR-0002 — Module Public API

Status: PROPOSED
Date: 2026-07-17
Owners: Architecture

## Context

The documentation previously alternated between `public.ts` and `index.ts`, which created two possible module boundaries and made deep imports difficult to control.

## Decision

The only supported cross-module import surface is the target module root:

```text
src/modules/<module>/index.ts
```

Internal folders are private to the owning module. A module may export commands, queries, read-model types, domain events and stable UI entry points from `index.ts`. It must not export persistence details or implementation-only helpers.

## Import rules

Allowed:

```ts
import { createCampaign } from '@/modules/campaigns';
```

Forbidden:

```ts
import { createCampaign } from '@/modules/campaigns/application/create-campaign';
import { CampaignRow } from '@/modules/campaigns/infrastructure/db';
```

## Consequences

- Consumers depend on stable contracts rather than internal layout.
- Internal refactoring does not cascade across modules.
- Public API growth must be reviewed explicitly.
- Circular module dependencies become easier to detect.

## Validation

- Architecture validator rejects cross-module deep imports.
- Each module must have a root `index.ts`.
- Any new export must be documented in the module `README.md`.
