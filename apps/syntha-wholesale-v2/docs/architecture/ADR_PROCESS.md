# ADR Process

## Purpose

Architecture Decision Records capture durable choices that affect multiple tasks or modules. They prevent implementation convenience from silently becoming architecture.

## ADR required when changing

- module boundaries or ownership;
- public module APIs or cross-module dependency direction;
- persistence, API, event or realtime strategy;
- authentication, authorization or tenant-isolation model;
- immutable versioning or concurrency model;
- framework, build, testing or deployment foundation;
- shared component or design-system ownership;
- legacy/external integration boundary.

## ADR not required for

Local implementation details that stay inside an approved module boundary and do not alter a public contract, product behaviour or cross-cutting policy.

## File format

Store ADRs as `docs/architecture/adr/ADR-####-short-title.md`.

Required sections:

```text
Status: PROPOSED | ACCEPTED | SUPERSEDED | REJECTED
Date
Decision owners
Context
Decision
Alternatives considered
Consequences
Migration/rollback
Affected modules and tasks
Validation
```

## Workflow

1. Create a `PROPOSED` ADR before implementation.
2. Link affected `TASK-*`, capability, workflow and screen IDs.
3. Review product, security, operational and migration consequences.
4. Mark `ACCEPTED` before dependent tasks become `READY`.
5. Update module READMEs, context map and guards together with implementation.
6. Supersede rather than rewrite historical decisions.

Code and task files may not contradict an accepted ADR. A conflict blocks implementation until documentation is resolved.
