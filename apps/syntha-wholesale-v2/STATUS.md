# Syntha Wholesale V2 — Status

Updated: 2026-07-17

## Current phase

Architecture normalization, repository foundation and wholesale product-canon audit.

Runtime business implementation has not started. No business task may move to `READY` until the foundation and product-canon gates below are complete.

## Canonical branch and review

- Working branch: `syntha-v2-architecture-normalization`
- Review vehicle: draft PR #7
- Base: current `main`
- All V2 writes must specify the branch explicitly.

## Completed

- Canonical vertical architecture: `src/modules/<module>`.
- Module public API standardized on root `index.ts`.
- Cursor context and change workflow documented.
- Architecture, link, JSON, ADR, task, change-ledger and import-boundary validation added.
- Machine-readable `tasks/task-manifest.json` and dependency-cycle guard added.
- Completion reports required for `QA` and `DONE` tasks.
- Machine-readable `change-ledger.json` and validation added.
- Dedicated GitHub Actions architecture workflow added and passing.
- Foundation tasks `TASK-0001` through `TASK-0004` created.
- `TASK-0001` and `TASK-0003` moved to `QA` with recorded evidence.
- Isolated V2 package, lockfile, Node baseline and environment contract created.
- Clean `npm ci` plus `npm run verify` confirmed in GitHub Actions.
- Runtime commands explicitly block until runtime ADR acceptance.
- Complete proposed ADR package ADR-0001 through ADR-0009 created and indexed.
- JOOR, NuORDER and adjacent wholesale patterns audited into 20 controlled `WSC-*` capabilities.
- `TASK-0005` created to convert the benchmark into the canonical Syntha product scope.

## Product benchmark result

The core lifecycle, digital showroom, calendar and DealSpace are represented. The following areas remain partial or missing and must be resolved through `TASK-0005` before business implementation:

- account-specific assortments, price lists, terms and regional commercial policy;
- visual assortment planning, budgets and size curves;
- ATS, inventory visibility, delivery windows and reorders;
- order amendment, approval, confirmation and audit rules;
- payments, deposits, invoices and credit terms;
- account CRM, sales-rep operations and marketplace boundaries;
- ERP, PIM, PLM, accounting and ecommerce integration contracts;
- wholesale analytics and performance dashboards;
- multi-currency, tax, locale and field-level permission rules.

## Foundation gates

| Gate | Requirement | Status |
|---|---|---|
| G0 | Clean branch based on current `main` | PASS |
| G1 | Canonical documentation and context map | PASS |
| G2 | ADR-0001 through ADR-0009 accepted | BLOCKED — REVIEWER REQUIRED |
| G3 | Documentation, ADR, task, ledger and import-boundary guard | IN REVIEW — TASK-0003 QA |
| G4 | Runtime package boundary and command contract | IN REVIEW — TASK-0001 QA |
| G5 | Runtime test, typecheck and lint toolchain | BLOCKED BY ADR-0004/0009 |
| G6 | Wholesale benchmark converted into accepted product canon | BLOCKED — TASK-0005 DRAFT |
| G7 | First business implementation task meets READY contract | BLOCKED |

## Immediate priority

1. Assign a reviewer for ADR-0001 through ADR-0009.
2. Resolve amendments and accept the ADR package as one controlled change.
3. Review and close `TASK-0001` and `TASK-0003` from `QA` to `DONE`.
4. Complete `TASK-0005`: decide each `WSC-*` item and map MVP items to modules, workflows, permissions, commands, events and screens.
5. Implement the accepted runtime and test toolchain through `TASK-0004`.
6. Only then prepare the first business implementation task for `READY`.

## Stop conditions

Do not install a framework, create business modules or mark business work `READY` while G2, G4, G5 or G6 are incomplete. Do not claim an unrun check as passed.
