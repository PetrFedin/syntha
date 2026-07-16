# Architecture Index

## Purpose

This folder defines how Syntha Wholesale V2 is organised for safe growth, fast changes and low-context work in Cursor.

It does not repeat product requirements. Product behaviour remains in Product Bible, Screen Bible and Implementation Blueprint.

## Read only what the task needs

| Task type | Required architecture files |
|---|---|
| Any code task | `CODE_STRUCTURE.md`, `DEPENDENCY_RULES.md` |
| New or moved file | `FILE_AND_NAMING_RULES.md` |
| Cursor task preparation | `CURSOR_CONTEXT_STRATEGY.md` |
| Feature change | `CHANGE_WORKFLOW.md` |
| Tests or QA | `TESTING_STRATEGY.md` |
| Architecture decision | `ADR_PROCESS.md` |

## Core decisions

- Architecture is vertical by business module, not split into global feature/domain/application trees.
- Each module owns its domain, use cases, adapters and UI.
- Cross-module access is only through a public module API, contracts or events.
- `shared` remains small and contains no business workflow.
- Route files compose modules; they do not contain business logic.
- Large reference documents are never mandatory context for every task.
- Cursor rules are scoped by file globs and kept short.
- Generated, build and legacy-heavy content is excluded from indexing where safe.

## Target source tree

```text
src/
  app/
  modules/
  shared/
  testkit/
  generated/
```

See `CODE_STRUCTURE.md` for the complete structure.

## Source-of-truth hierarchy

```text
Product Canon
→ Domain and security rules
→ Screen specification
→ Capability/workflow traceability
→ Architecture rules
→ Task file
→ Code
```

An architecture document cannot silently change product behaviour.

## File size policy

Prefer focused files that can be understood without loading an entire subsystem.

- Most source files: under 250 lines.
- Complex UI or policy files: review at 350 lines.
- Documentation: one concern per file; use an index when a topic grows.
- Files are split by responsibility, not mechanically by line count.
- Exceptions require a short note in the module README or ADR.

## Module documentation policy

Every module has a `README.md` of roughly 40–100 lines containing only:

- purpose and boundaries;
- public API;
- owned entities;
- inbound/outbound dependencies;
- key commands/events;
- links to detailed specs.

Do not copy Screen Bible or API Bible into module README files.

## Status

This architecture is the target for new V2 code. Legacy Syntha structure is not a template and may only be accessed through explicit adapters.
