# Syntha Wholesale V2 — Status

Updated: 2026-07-17

## Current phase

Architecture normalization and repository foundation.

Runtime business implementation has not started. No business task may move to `READY` until the foundation gates below are complete.

## Canonical branch and review

- Working branch: `syntha-v2-architecture-normalization`
- Review vehicle: draft PR #7
- Base: current `main`
- All V2 writes must specify the branch explicitly.

## Completed

- Canonical vertical architecture: `src/modules/<module>`.
- Module public API standardized on root `index.ts`.
- Cursor context and change workflow documented.
- Architecture, link, JSON, task and import-boundary validator added.
- Dedicated GitHub Actions architecture workflow added and passing.
- Foundation tasks `TASK-0001` through `TASK-0004` created.
- Isolated V2 package, lockfile, Node baseline and environment contract created.
- Clean `npm ci` plus `npm run verify` confirmed in GitHub Actions.
- Runtime commands explicitly block until runtime ADR acceptance.
- Complete proposed ADR package ADR-0001 through ADR-0009 created and indexed.
- ADR index/file/status consistency added to automated validation.

## Foundation gates

| Gate | Requirement | Status |
|---|---|---|
| G0 | Clean branch based on current `main` | PASS |
| G1 | Canonical documentation and context map | PASS |
| G2 | ADR-0001 through ADR-0009 accepted | BLOCKED — REVIEWER REQUIRED |
| G3 | Documentation, ADR and import-boundary guard | PASS |
| G4 | Runtime package boundary and command contract | IN REVIEW |
| G5 | Runtime test, typecheck and lint toolchain | BLOCKED BY ADR-0004/0009 |
| G6 | First business task meets READY contract | BLOCKED |

## Immediate priority

1. Assign a reviewer for ADR-0001 through ADR-0009.
2. Resolve amendments and accept the ADR package as one controlled change.
3. Complete `TASK-0001` review and move it from `QA` to `DONE`.
4. Implement the accepted runtime and test toolchain through `TASK-0004`.
5. Only then prepare the first Design System task for `READY`.

## Stop conditions

Do not install a framework, create business modules or mark business work `READY` while G2, G4 or G5 are incomplete. Do not claim an unrun check as passed.
