# Syntha Wholesale V2 — Architecture Index

This folder is the canonical architecture entry point for `apps/syntha-wholesale-v2`.

## Read by task type

| Task type | Required documents |
|---|---|
| Any code task | `CODE_STRUCTURE.md`, `DEPENDENCY_RULES.md`, `context-map.json` |
| Cursor task preparation | `CURSOR_CONTEXT_STRATEGY.md` |
| Feature or architecture change | `CHANGE_WORKFLOW.md`, `CHANGE_RECORD_TEMPLATE.md` |
| Tests or QA | `TESTING_STRATEGY.md`, `COMPLETION_REPORT_TEMPLATE.md` |
| Architecture decision | `ADR_PROCESS.md`, `ADR_REVIEW_CHECKLIST.md`, `adr/README.md` |
| Current project state | `../../STATUS.md` |

## Canonical decisions

- Source architecture is vertical by business module.
- A module owns its domain, application, infrastructure, UI and tests.
- Cross-module imports use only the target module root `index.ts`.
- Deep imports across module boundaries are forbidden.
- `shared` contains no business workflow.
- `app` composes routes and modules but contains no business rules.
- Legacy UI and routes are not V2 fallbacks.

## Target source tree

```text
src/
  app/
  modules/
  shared/
  testkit/
  generated/
```

Each business module contains:

```text
README.md
index.ts
domain/
application/
infrastructure/
ui/
tests/
```

## Source-of-truth priority

```text
Product Canon
→ Domain and security rules
→ Screen specification
→ Capability/workflow traceability
→ Accepted ADRs and architecture rules
→ READY task
→ Code
```

A lower-level source must not silently override a higher-level source. Conflicts block implementation until documentation or an ADR resolves them.

## Governance

- ADR index: [`adr/README.md`](adr/README.md)
- ADR review checklist: [`ADR_REVIEW_CHECKLIST.md`](ADR_REVIEW_CHECKLIST.md)
- Change process: [`CHANGE_WORKFLOW.md`](CHANGE_WORKFLOW.md)
- Change record template: [`CHANGE_RECORD_TEMPLATE.md`](CHANGE_RECORD_TEMPLATE.md)
- Completion report template: [`COMPLETION_REPORT_TEMPLATE.md`](COMPLETION_REPORT_TEMPLATE.md)
- Testing strategy: [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md)
- Cursor context strategy: [`CURSOR_CONTEXT_STRATEGY.md`](CURSOR_CONTEXT_STRATEGY.md)
- Machine-readable context map: [`context-map.json`](context-map.json)

## Status transition evidence

A task may move to `QA` only when changed files and checks actually run are recorded. A task may move to `DONE` only when a completion report contains acceptance evidence, reviewer identity, review date and known limitations.

An ADR may move to `ACCEPTED` only when the named reviewer and acceptance date are written into the ADR and the ADR index, dependent tasks, task manifest and `STATUS.md` are updated in the same change.

## Runtime gate

Runtime business implementation remains blocked until the initial ADR package is accepted and foundation tasks `TASK-0001` through `TASK-0004` satisfy their ready and completion conditions.