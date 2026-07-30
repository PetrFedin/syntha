# Cursor Start Here — Syntha Wholesale V2

Workspace: `apps/syntha-wholesale-v2`.

Read in order:
1. `AGENTS.md`.
2. The exact `tasks/TASK-*.md` file and its acceptance criteria.
3. `docs/architecture/context-map.json`.
4. Only the architecture, product and screen documents referenced by that task.
5. The affected module `README.md`, root `index.ts`, changed source files and nearest tests.

Before coding, summarise: task, capabilities, workflows, screens, modules, permissions, commands/events and tests.

Implement one vertical slice. Import another module only through its root `index.ts`. Do not use deep imports, legacy UI fallbacks or unapproved scope expansion. Stop when specifications conflict or required traceability is missing.

Run the checks required by the task and `docs/architecture/TESTING_STRATEGY.md`. Never report an unrun check as passed. Update task status and completion evidence after implementation.
