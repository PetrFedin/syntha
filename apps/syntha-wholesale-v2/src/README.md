# Syntha Wholesale V2 — Source Architecture

All new product code lives in this directory. Legacy Syntha is not an architecture template and may only be accessed through explicit adapters owned by a V2 module.

## Canonical structure

```text
src/
  app/                 routes, layouts, providers, composition
  modules/             vertical business modules
  shared/              small technical and UI building blocks
  testkit/             reusable test builders and harnesses
  generated/           generated code; never edited manually
```

A business module owns its complete vertical slice:

```text
modules/<module>/
  README.md
  index.ts             only supported cross-module import surface
  domain/              entities, value objects, policies, events
  application/         commands, queries, use cases and ports
  infrastructure/      persistence, API and external adapters
  ui/                  screens, components and presentation state
  tests/               module-level integration and workflow tests
```

Expected modules include identity, organisations, campaigns, collections, showroom, buying, orders, dealspace, calendar, documents, analytics and integrations. Add a module only through an approved task and, when boundaries change, an ADR.

## Dependency direction

```text
app → module index.ts
module ui → module application → module domain
module infrastructure → module application ports + domain
module A → module B/index.ts, documented contract or event only
shared → no business module
```

Rules:

- Domain code imports no React, Next.js, database SDK or vendor integration.
- UI never queries persistence or external systems directly.
- All writes pass application commands/use cases.
- Infrastructure implements ports owned by the application layer.
- Cross-module deep imports are forbidden.
- `shared` contains no business workflow or module-specific policy.
- Routes compose modules and contain no business logic.
- Published, submitted and confirmed snapshots are immutable.
- Legacy reuse is isolated behind a module infrastructure adapter with tests.

## Public API

Every module exposes only supported cross-module contracts from its root `index.ts`. Internal folders are private even when TypeScript can resolve them.

Allowed:

```ts
import { createCampaign } from '@/modules/campaigns';
```

Forbidden:

```ts
import { createCampaign } from '@/modules/campaigns/application/create-campaign';
```

## Naming

- Components and types: PascalCase.
- Files: kebab-case except framework-required names.
- Commands/use cases: verb-noun.
- Domain entities: singular.
- Ports: `*.port.ts`.
- Adapters: `*.adapter.ts`.
- Policies: explicit business name or `can-*.policy.ts`.
- Tasks: `TASK-####-short-name.md` only.

## State ownership

- Server state belongs to query/read-model infrastructure selected by ADR.
- Draft builder state belongs to the owning module and includes server version.
- Ephemeral UI state remains local.
- Global UI state is limited to shell concerns.
- Business state never exists only in presentation components.

## Required checks before merge

- documentation integrity and JSON validation;
- typecheck and lint;
- unit tests for changed policies/calculations;
- affected integration and write-path tests;
- affected end-to-end workflow;
- import-boundary guard;
- accessibility and keyboard/touch checks;
- responsive evidence at required viewports.

See `docs/architecture/TESTING_STRATEGY.md` for the exact test contract.

## Implementation gate

Start with the approved roadmap sequence in `tasks/README.md`:

```text
TASK-0001 project boundary and commands
TASK-0002 architecture ADR package
TASK-0003 documentation/traceability guard
TASK-0004 test and CI foundation
```

Do not implement business modules before the foundation gate is satisfied and their tasks are `READY`.
