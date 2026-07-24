# Syntha Wholesale V2 — Status

Updated: 2026-07-24

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
- Central contextual destination resolver for lifecycle, service and entity-return actions.
- Invalid or obsolete URL entity types are rejected before route resolution.
- Service sections have explicit non-dead-end fallbacks and contextual return routes.
- Unit coverage now protects entity mappings, lifecycle priority, terminal-stage return and damaged URL fallbacks.
- Context-linked structural models for messages, notifications, calendar and search; demo fixtures are
  isolated and visibly labelled.
- Responsive Desktop, Wide Desktop, Tablet and iPhone Playwright coverage.

## Foundation gates

| Gate | Requirement | Status |
|---|---|---|
| G0 | Clean branch based on current `main` | PASS |
| G1 | Canonical documentation and context map | PASS |
| G2 | ADR-0001 through ADR-0009 accepted | PASS |
| G3 | Documentation, ADR, task, ledger and import-boundary guard | FAIL IN CI — investigation active |
| G4 | Runtime package boundary and command contract | PASS |
| G5 | Runtime test, typecheck, lint, build and Playwright toolchain | BLOCKED BY G3 IN LATEST V2 WORKFLOW |
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
- service and empty-state actions use one destination resolver instead of duplicated local logic;
- malformed entity context cannot produce an undefined route;
- unit tests cover the destination resolver and terminal lifecycle behaviour.

## Immediate priority

1. Resolve the current `npm run preflight` failure in the Syntha V2 Foundation workflow.
2. Re-run typecheck, lint, unit tests, production build and Playwright after preflight is green.
3. Replace structural fixtures with the first server-backed Campaign → Collection vertical slice.
4. Resolve organisation and season context from the existing identity/organisation application APIs.
5. Add persisted entity ownership, authorization and audit at each server-backed transition.
6. Continue Showroom → Selection only after Campaign and Collection have one authoritative read/write path.

## Known tooling diagnostics

- The latest draft PR head is mergeable, but workflow run `30108614156` failed during
  `Validate V2 governance and architecture`; downstream V2 checks were skipped.
- The preceding V2 workflow run `30107781753` failed at the same preflight stage, so this is not caused
  solely by the latest destination test file.
- The repository-wide `CI` workflow passed for commit `3dc79c92113a0940d40d3609407974e452a1b0b4`.
- Next.js 16.2.11 canonically generates `next-env.d.ts` with
  `import "./.next/types/routes.d.ts";` when typed routes are enabled.
- A production request for an unknown static section returns the expected 404 page and the server
  remains healthy, but Next.js 16.2.11 emits an internal `NoFallbackError` diagnostic for that
  expected `dynamicParams = false` miss. No runtime workaround is applied.

## Stop conditions

Do not import, copy or fall back to Legacy. Do not add persistence or provider SDKs directly to domain code. Do not bypass module-root public APIs, active organisation validation or server-side authorization.
