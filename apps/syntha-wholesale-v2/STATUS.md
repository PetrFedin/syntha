# Syntha Wholesale V2 — Status

Updated: 2026-07-22

## Current phase

Accepted architecture foundation, Product Canon QA and executable runtime/test foundation preparation.

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
- Independent V2 package, lockfile, Node baseline and environment contract.
- JOOR, NuORDER, Brandboom and Le New Black benchmark converted into a Syntha Product Canon draft.
- Twenty WSC capability decisions, module ownership and eight core workflows documented.

## Foundation gates

| Gate | Requirement | Status |
|---|---|---|
| G0 | Clean branch based on current `main` | PASS |
| G1 | Canonical documentation and context map | PASS |
| G2 | ADR-0001 through ADR-0009 accepted | PASS |
| G3 | Documentation, ADR, task, ledger and import-boundary guard | PASS |
| G4 | Runtime package boundary and command contract | PASS |
| G5 | Runtime test, typecheck and lint toolchain | READY — TASK-0004 |
| G6 | Wholesale benchmark converted into accepted Product Canon | IN REVIEW — TASK-0005 QA |
| G7 | First business implementation task meets READY contract | BLOCKED BY G5/G6 |

## Immediate priority

1. Run CI validation for the accepted ADR and Product Canon package.
2. Review TASK-0005 and move it from QA to DONE after terminology/scope confirmation.
3. Implement TASK-0004: independent Next.js, TypeScript, lint, Vitest and Playwright foundation.
4. Prepare the first business implementation task only after G5 and G6 pass.

## Stop conditions

Runtime and test foundation work may proceed under TASK-0004. Do not create business modules, routes or screens until G5 and G6 pass. Do not import, copy or fall back to Legacy. Do not claim an unrun check as passed.
