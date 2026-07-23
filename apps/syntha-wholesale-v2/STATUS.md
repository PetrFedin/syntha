# Syntha Wholesale V2 — Status

Updated: 2026-07-23

## Current phase

Workspace architecture normalization: registry-driven routes, typed commercial context and
context-preserving navigation across the wholesale lifecycle.

The independent V2 product lives only in `apps/syntha-wholesale-v2`. Legacy remains separate and is not an implementation source.

## Canonical branch and review

- Working branch: `syntha-v2-architecture-normalization`
- Review vehicle: draft PR #7
- Base: current `main`
- All V2 writes must specify the branch explicitly.

## Completed

- ADR-0001 through ADR-0009 accepted.
- Canonical vertical modular architecture and root `index.ts` module API.
- Strict V2/Legacy isolation boundary.
- Foundation tasks TASK-0001 through TASK-0005 complete.
- Architecture, documentation, task, ledger and import-boundary validation.
- Product Canon with twenty WSC decisions, module ownership and eight core workflows.
- Independent Next.js App Router runtime, health endpoint and foundation screen.
- Complete dependency lock with deterministic `npm ci`.
- TypeScript, ESLint, Vitest, Testing Library and Playwright gates.
- First organisation and identity-access domain contracts.
- One root-owned `WorkspaceShell` and a single validated registry for 15 real workspace routes.
- Eight-stage Campaign → DealSpace lifecycle with reciprocal previous/next transitions.
- Typed Workspace and Commercial Context models with explicit descendant invalidation.
- Typed URL helpers that preserve compatible context and remove stale descendant identifiers.
- Shared page header, context bar, lifecycle navigation, empty, error, loading and entity-link states.
- Context-linked structural models for messages, notifications, calendar and search; demo fixtures are
  isolated and visibly labelled.
- Responsive Desktop, Wide Desktop, Tablet and iPhone Playwright coverage.

## Foundation gates

| Gate | Requirement | Status |
|---|---|---|
| G0 | Clean branch based on current `main` | PASS |
| G1 | Canonical documentation and context map | PASS |
| G2 | ADR-0001 through ADR-0009 accepted | PASS |
| G3 | Documentation, ADR, task, ledger and import-boundary guard | PASS |
| G4 | Runtime package boundary and command contract | PASS |
| G5 | Runtime test, typecheck, lint, build and Playwright toolchain | PASS |
| G6 | Wholesale benchmark converted into accepted Product Canon | PASS |
| G7 | First business implementation task meets traced contract | PASS — TASK-0006 |
| G8 | Coherent adaptive workspace and route lifecycle | IN PROGRESS — TASK-0007 server slices remain |

## Active implementation

TASK-0007 now connects the workspace foundation end to end:

- dashboard and all registered sections are real App Router destinations;
- navigation, lifecycle metadata and section content use one registry;
- route, Workspace Context and Commercial Context use distinct typed identifiers;
- deep links preserve compatible parent context and clear incompatible descendants;
- connected service records always point back to a source entity;
- unit, build and responsive browser gates pass.

## Immediate priority

1. Replace structural fixtures with the first server-backed Campaign → Collection vertical slice.
2. Resolve organisation and season context from the existing identity/organisation application APIs.
3. Add persisted entity ownership, authorization and audit at each server-backed transition.
4. Continue Showroom → Selection only after Campaign and Collection have one authoritative read/write path.

## Stop conditions

Do not import, copy or fall back to Legacy. Do not add persistence or provider SDKs directly to domain code. Do not bypass module-root public APIs, active organisation validation or server-side authorization.
