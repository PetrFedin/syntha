# Syntha Wholesale V2 — Source Architecture

All new product code lives in this directory. Legacy Syntha is not an implementation source. No Legacy UI, route, service or runtime-state import is permitted.

## Canonical structure

```text
src/
  app/                 routes, layouts, providers and composition
  modules/             vertical business modules created only by READY tasks
  shared/              small business-neutral technical and UI building blocks
  testkit/             reusable deterministic test builders and harnesses
  generated/           generated code; never edited manually
```

Each future business module owns its complete vertical slice:

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
- No Legacy adapter exists in the current runtime.

## Runtime foundation

The package now owns an independent Next.js App Router runtime, strict TypeScript configuration, ESLint, Vitest, Testing Library, Playwright configuration, a health endpoint and the foundation landing screen.

## Required checks

Run `npm run verify` for documentation validation, typecheck, lint, unit tests and production build. Run `npm run test:e2e` after Playwright Chromium is installed.

Business modules remain blocked until TASK-0004 and TASK-0005 are complete.
