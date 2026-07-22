# Syntha Wholesale V2 — Status

Updated: 2026-07-22

## Current phase

Executable runtime and test-foundation hardening, with Product Canon in QA.

The independent V2 product lives only in `apps/syntha-wholesale-v2`. Legacy remains separate and is not an implementation source.

## Canonical branch and review

- Working branch: `syntha-v2-architecture-normalization`
- Review vehicle: draft PR #7
- Base: current `main`
- All V2 writes must specify the branch explicitly.

## Completed

- ADR-0001 through ADR-0009 accepted by product owner.
- Canonical vertical modular architecture and root `index.ts` module API.
- Strict V2/Legacy isolation boundary.
- Foundation tasks TASK-0001 through TASK-0003 accepted and complete.
- Architecture, documentation, task, ledger and import-boundary validation.
- Product Canon with twenty WSC decisions, module ownership and eight core workflows.
- Independent Next.js App Router foundation screen and health endpoint.
- Strict TypeScript, ESLint, Vitest, Testing Library and Playwright configuration.
- Organisation-isolation and permission-denial testkit fixtures.
- Local typecheck, lint, unit test and production build passed.

## Foundation gates

| Gate | Requirement | Status |
|---|---|---|
| G0 | Clean branch based on current `main` | PASS |
| G1 | Canonical documentation and context map | PASS |
| G2 | ADR-0001 through ADR-0009 accepted | PASS |
| G3 | Documentation, ADR, task, ledger and import-boundary guard | PASS |
| G4 | Runtime package boundary and command contract | PASS |
| G5 | Runtime test, typecheck and lint toolchain | IN PROGRESS — CI validator fix awaiting run |
| G6 | Wholesale benchmark converted into accepted Product Canon | IN REVIEW — TASK-0005 QA |
| G7 | First business implementation task meets READY contract | BLOCKED BY G5/G6 |

## Immediate priority

1. Confirm the corrected GitHub Actions workflow excludes `node_modules` and passes verification.
2. Generate and commit the complete dependency lock.
3. Move TASK-0004 to QA only with CI and Playwright evidence.
4. Review TASK-0005 and move it from QA to DONE after terminology and scope confirmation.
5. Prepare the first identity/organisation implementation task only after G5 and G6 pass.

## Stop conditions

Do not create business modules, routes or screens until G5 and G6 pass. Do not import, copy or fall back to Legacy. Do not claim an unrun browser check as passed.
