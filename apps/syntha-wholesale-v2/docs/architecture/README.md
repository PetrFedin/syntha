# Syntha Wholesale V2 — Architecture Index

This folder is the canonical architecture entry point for `apps/syntha-wholesale-v2`.

## Read by task type

| Task type | Required documents |
|---|---|
| Any code task | `CODE_STRUCTURE.md`, `DEPENDENCY_RULES.md`, `context-map.json` |
| Cursor task preparation | `CURSOR_CONTEXT_STRATEGY.md` |
| Feature or architecture change | `CHANGE_WORKFLOW.md` |
| Tests or QA | `TESTING_STRATEGY.md` |
| Architecture decision | `ADR_PROCESS.md`, `adr/README.md` |
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
- Change process: [`CHANGE_WORKFLOW.md`](CHANGE_WORKFLOW.md)
- Testing strategy: [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md)
- Cursor context strategy: [`CURSOR_CONTEXT_STRATEGY.md`](CURSOR_CONTEXT_STRATEGY.md)
- Machine-readable context map: [`context-map.json`](context-map.json)

## Runtime gate

Runtime business implementation remains blocked until the initial ADR package is accepted and foundation tasks `TASK-0001` through `TASK-0004` satisfy their ready and completion conditions.
