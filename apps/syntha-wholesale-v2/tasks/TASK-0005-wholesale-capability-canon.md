---
task_id: TASK-0005
status: DRAFT
priority: P0
product_area: product-canon
capability_ids:
  - WSC-001
  - WSC-002
  - WSC-003
  - WSC-004
  - WSC-005
  - WSC-006
  - WSC-007
  - WSC-008
  - WSC-009
  - WSC-010
  - WSC-011
  - WSC-012
  - WSC-013
  - WSC-014
  - WSC-015
  - WSC-016
  - WSC-017
  - WSC-018
  - WSC-019
  - WSC-020
workflow_ids: []
screen_ids: []
permissions: []
commands: []
domain_events: []
dependencies:
  - TASK-0001
  - TASK-0002
  - TASK-0003
source_documents:
  - docs/product/WHOLESALE_PLATFORM_BENCHMARK.md
  - docs/product/wholesale-capability-benchmark.json
  - docs/architecture/context-map.json
  - CURSOR_MASTER_RULES.md
---

# Wholesale capability canon

## Outcome

Convert the competitor benchmark into a controlled Syntha product canon with explicit MVP scope, module ownership, workflows, permissions, commands, events, screens and acceptance criteria.

## Scope

- review all `WSC-*` capabilities and confirm `ADOPT`, `ADAPT`, `DEFER` or `EXCLUDE`;
- define account-specific assortment, pricing, terms, currencies and delivery rules;
- define assortment planning, budget and size-curve workflows;
- define ATS, preorder, immediate delivery and reorder behaviour;
- define order amendments, approvals, confirmations and audit history;
- define account CRM, sales-rep and marketplace boundaries;
- define integration contracts for ERP, PIM, PLM, accounting and ecommerce without importing external system internals into business modules;
- define wholesale analytics and reporting metrics;
- preserve the explicit exclusion of production, BOM, QC and supply-chain execution from MVP.

## Acceptance criteria

- every `WSC-*` item has a final decision and rationale;
- every MVP item has one owning module;
- every MVP item maps to at least one workflow or explicit foundation contract;
- permissions and organisation context are defined for Brand and Shop roles;
- required commands, events and screens are identified before implementation tasks become `READY`;
- no competitor feature is copied without adapting it to Syntha terminology and lifecycle;
- deferred and excluded capabilities are recorded with revisit conditions;
- context map and product documentation agree with the benchmark matrix.

## Ready condition

Move to `READY` only after the initial ADR package is accepted and foundation tasks `TASK-0001` through `TASK-0003` are `DONE`.
