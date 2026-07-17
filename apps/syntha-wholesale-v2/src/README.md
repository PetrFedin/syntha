# Syntha Wholesale V2 — Source Architecture

All new product code lives in this directory. Legacy Syntha is not an architecture template and may only be accessed through explicit adapters owned by a V2 module.

## Canonical structure

```text
src/
  app/                 routes, layouts, providers and composition
  modules/             vertical business modules
  shared/              small technical and UI building blocks
  testkit/             reusable test builders and harnesses
  generated/           generated code; never edited manually
```

Each business module owns its complete vertical slice:

```text
modules/<module>/
  README.md
  index.ts             only supported cross-module import surface
  domain/
  application/
  infrastructure/
  ui/
  tests/
```

## Dependency rules

```text
app → module index.ts
module ui → module application → module domain
module infrastructure → application ports + domain
module A → module B/index.ts, documented contract or event only
shared → no business module
```

- Domain imports no React, Next.js, database SDK or vendor API.
- UI never queries persistence or external systems directly.
- All writes pass application commands/use cases.
- Infrastructure implements application ports.
- Cross-module deep imports are forbidden.
- `shared` contains no business workflow or module policy.
- Routes compose modules and contain no business logic.
- Published, submitted and confirmed snapshots are immutable.
- Legacy reuse is isolated behind a tested module adapter.

## Naming

Use PascalCase for components/types, kebab-case for files except framework-required names, verb-noun for commands/use cases, singular entity names, `*.port.ts` for ports, `*.adapter.ts` for adapters and `TASK-####-short-name.md` for tasks.

## Required checks

Documentation integrity, typecheck, lint, unit tests, affected integration and end-to-end tests, import-boundary guard, accessibility, keyboard/touch and required responsive evidence.

Start with `TASK-0001` through `TASK-0004` in `tasks/README.md`. Do not implement business modules before the foundation gate is satisfied and their tasks are `READY`.
