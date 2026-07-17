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
- Architecture/JSON/link/task/import-boundary validator added.
- Dedicated GitHub Actions architecture workflow added and passing.
- Foundation tasks `TASK-0001` through `TASK-0004` created.

## Foundation gates

| Gate | Requirement | Status |
|---|---|---|
| G0 | Clean branch based on current `main` | PASS |
| G1 | Canonical documentation and context map | PASS |
| G2 | Initial ADR package accepted | IN REVIEW |
| G3 | Documentation and import-boundary guard | PASS |
| G4 | Runtime package/toolchain selected | NOT STARTED |
| G5 | Test and CI foundation for runtime | NOT STARTED |
| G6 | First business task meets READY contract | BLOCKED |

## Immediate priority

1. Review and accept ADR-0001 through ADR-0003.
2. Complete `TASK-0001` repository/runtime boundary.
3. Complete `TASK-0004` test and CI foundation.
4. Only then prepare the first Design System task for `READY`.

## Stop conditions

Do not implement business modules while G2, G4 or G5 are incomplete. Do not mark a task `READY` when its dependencies, source documents, permissions or test evidence are missing.
