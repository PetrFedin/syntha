# Syntha Wholesale V2 — Status

Updated: 2026-07-22

## Current phase

First production vertical slice: organisation identity, membership lifecycle, active organisation context, RBAC and persistence boundaries.

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
| G7 | First business implementation task meets traced contract | IN PROGRESS — TASK-0006 CI checkpoint |

## Active implementation

TASK-0006 now connects both first business modules end to end:

- `organisations`: validated identity, lifecycle, duplicate-safe registration and repository port;
- `identity-access`: membership lifecycle, roles, de-duplicated grants, active organisation validation, invitation, permission change and repository port;
- deterministic in-memory adapters support unit and application integration tests without coupling domain code to a provider.

## Immediate priority

1. Confirm this TASK-0006 checkpoint through the complete V2 CI workflow.
2. Close TASK-0006 only after all acceptance criteria pass.
3. Add access and organisation chooser routes against the approved application contracts.
4. Prepare Commercial Policy and Catalog tasks after Identity/Organisation reaches DONE.

## Stop conditions

Do not import, copy or fall back to Legacy. Do not add persistence or provider SDKs directly to domain code. Do not bypass module-root public APIs, active organisation validation or server-side authorization.
