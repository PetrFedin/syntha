# ADR Process

Architecture Decision Records capture durable choices that affect multiple tasks or modules.

Create an ADR before changing module boundaries, public APIs, persistence, event/realtime delivery, authentication/authorization, tenant isolation, immutable versioning, framework/build/testing foundation, shared component ownership or legacy/external integration boundaries.

Store ADRs as `docs/architecture/adr/ADR-####-short-title.md` with:

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

Workflow:

1. Create a `PROPOSED` ADR before implementation.
2. Link affected `TASK-*`, capability, workflow and screen IDs.
3. Review product, security, operational and migration consequences.
4. Mark `ACCEPTED` before dependent tasks become `READY`.
5. Update module READMEs, context map and guards with implementation.
6. Supersede rather than rewrite historical decisions.

Code and task files may not contradict an accepted ADR. A conflict blocks implementation.
