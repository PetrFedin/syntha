# Cursor Context Strategy

## Goal

Keep every implementation task small, traceable and understandable without loading the whole repository.

## Required context capsule

```text
AGENTS.md
→ exact TASK file
→ context-map.json
→ task source documents
→ affected module README.md and index.ts
→ changed files
→ nearest tests
```

Do not load all Product Bible, Screen Bible or Implementation Blueprint files by default.

## Selection rules

- Product scope or role change: read Product Canon.
- Entity, state or policy change: read Domain Model and Security.
- Screen change: read the exact screen specification.
- UI/layout change: read visual system, tokens and component contract.
- API/event/integration change: read the exact contract and owning module.
- Architecture boundary change: create or update an ADR before code.

## Context budget

Normal task context contains one task, one workflow, one or a few screens, one primary module, its direct contracts and nearest tests. Split the task when more than one independent business outcome is required.

## Before implementation

Record:

```text
Task
Capabilities
Workflows
Screens
Modules
Permissions
Queries and commands
Events and notifications
Tests
```

Stop if any required mapping is missing or contradictory.

## After implementation

Update task status and completion evidence. Record files changed, checks actually run, results, limitations and documentation updates. Never claim a check that was not executed.
