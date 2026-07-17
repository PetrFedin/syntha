# Change Workflow

## 1. Select one task

Only a `TASK-*.md` item with status `READY` may enter implementation. Confirm dependencies and source documents first.

## 2. Build the context capsule

Use `context-map.json` and `CURSOR_CONTEXT_STRATEGY.md`. Read only the relevant product, screen, workflow, module and test contracts.

## 3. Validate traceability

Confirm Capability, Workflow and Screen IDs; role and permission rules; owned entities; queries, commands and events; acceptance criteria and required checks.

## 4. Confirm architecture ownership

Each business change has one owning module. Cross-module access uses the target module root `index.ts`, a documented contract or a domain event. Deep imports are forbidden.

Create an ADR before changing module boundaries, persistence strategy, runtime framework, event delivery, authorization model or another durable architectural decision.

## 5. Implement a vertical slice

Implement domain policy, application command/query, infrastructure adapter and UI state only where required by the same business outcome. Do not add speculative framework code or unrelated refactors.

## 6. Test the change

Run the checks specified in the task and `TESTING_STRATEGY.md`. Include negative authorization and failure states where applicable.

## 7. Update evidence

Update task status, completion report, relevant module README, status/traceability files and ADRs. Record exact commands and results.

## 8. Review before merge

A change is mergeable only when documentation and code agree, no forbidden import exists, all required checks pass, and the diff contains no demo-only success, hidden fallback or unapproved scope expansion.
