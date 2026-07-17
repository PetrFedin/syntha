# Change Workflow

1. Select one `READY` `TASK-*.md` item and confirm dependencies.
2. Build the context capsule from `context-map.json`.
3. Validate Capability, Workflow and Screen IDs, permissions, entities, commands, events and acceptance criteria.
4. Confirm one owning module. Cross-module access uses the target root `index.ts`, a documented contract or an event.
5. Create an ADR before changing durable architecture, module boundaries, persistence, authorization, event delivery or runtime foundation.
6. Implement one vertical business outcome without unrelated refactors or speculative framework code.
7. Run the checks required by the task and `TESTING_STRATEGY.md`.
8. Update task status, completion evidence, module README, traceability and ADRs.
9. Merge only when documentation and code agree, required checks pass, and no deep import, legacy fallback, demo-only success or hidden scope expansion remains.
