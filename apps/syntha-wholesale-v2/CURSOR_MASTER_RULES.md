# Cursor Master Rules — Syntha Wholesale V2

These rules apply to all work in `apps/syntha-wholesale-v2`.

## 1. Product canon

- User-side organisation types are `Brand` and `Shop`.
- Core lifecycle: `Campaign → Collection → Showroom → Selection → Order Builder → Order → DealSpace`.
- Calendar, appointments and DealSpace are core capabilities.
- Production, PLM, BOM, tech packs, sourcing, QC, MES, factory execution and accounting are outside wholesale MVP.
- External systems do not own Syntha presentation, access, selection, collaboration or negotiated order state.

## 2. Required reading

Start with `CURSOR_START_HERE.md` and use `docs/architecture/context-map.json`.

For each task read only:

1. `AGENTS.md`;
2. the exact `tasks/TASK-*.md` file;
3. source documents referenced by that task;
4. the affected module `README.md` and root `index.ts`;
5. changed files and nearest tests.

Do not load all Product Bible, Screen Bible or Implementation Blueprint files automatically. Use `docs/architecture/CURSOR_CONTEXT_STRATEGY.md`.

Source-of-truth priority:

```text
Product Canon
→ Domain and Security
→ Screen specification
→ Capability/workflow traceability
→ Architecture and accepted ADRs
→ Task
→ Code
```

A conflict blocks implementation.

## 3. Traceability

Every task uses the `TASK-####` format and defines applicable:

```yaml
task_id: TASK-....
status: DRAFT|BLOCKED|READY|IN_PROGRESS|QA|DONE
capability_ids: []
workflow_ids: []
screen_ids: []
roles: []
permissions: []
entities: []
queries: []
commands: []
domain_events: []
notifications: []
integrations: []
dependencies: []
source_documents: []
```

Only `READY` tasks may enter implementation. A function without Capability ID or an unready screen is not implemented.

## 4. Canonical architecture

```text
src/
  app/
  modules/
  shared/
  testkit/
  generated/
```

Each business module owns:

```text
modules/<module>/
  README.md
  index.ts
  domain/
  application/
  infrastructure/
  ui/
  tests/
```

Rules:

- `index.ts` is the only supported cross-module import surface.
- Deep imports across module boundaries are forbidden.
- Domain imports no React, Next.js, database SDK or vendor API.
- UI uses application commands and read models; it never accesses persistence directly.
- Infrastructure implements application ports.
- Routes compose modules and contain no business logic.
- `shared` contains no business workflow.
- Legacy UI imports and legacy route fallback are forbidden.
- Boundary changes require an accepted ADR.

See `docs/architecture/CODE_STRUCTURE.md`, `CHANGE_WORKFLOW.md` and `ADR_PROCESS.md`.

## 5. Domain and data

- Entity state uses enums and policies, not arbitrary strings.
- Money uses minor units plus ISO currency.
- Time uses UTC plus source timezone where required.
- Published CollectionVersion and ShowroomRelease are immutable.
- Submitted and Confirmed OrderVersion are immutable.
- Revisions create a new version; they never overwrite the counterparty version.
- Showroom → Selection → Order preserves stable lineage IDs.
- Totals are calculated by domain/application services.
- Archive is preferred to deletion and audit history is preserved.

## 6. Security and permissions

Authorization combines user, active organisation membership, organisation type, permission set, assignment scope, relationship, entity state and field visibility.

Hiding a button is not authorization. Sensitive read models are redacted server-side. Private Shop notes never enter Brand projections and Brand internal notes never enter shared DealSpace payloads.

Every protected action requires positive and negative authorization tests, tenant-isolation validation and an audit event where applicable.

## 7. API, events and integrations

- API prefix is `/api/v2`.
- Active organisation is validated server-side.
- Retryable commands use idempotency keys.
- Concurrent writes use expected version.
- Large registries use cursor pagination.
- Responses include request/correlation ID.
- Writes persist before success is shown and emit required events through an outbox/event mechanism.
- Domain, audit, analytics and realtime events are distinct.
- Connectors use ports/adapters; external IDs are mappings, never internal primary keys.
- Manual import follows Upload → Map → Preview → Validate → Execute → Report.
- Secrets never reach clients, repositories or logs.

## 8. UI and responsive rules

Allowed layout families: Registry, Entity, Builder, Showroom, Split Communication and Focus.

Use canonical components and design tokens. No raw colours, arbitrary spacing, duplicate primitives or unapproved icon families. One primary CTA per focus region. Destructive actions are separated and confirmed.

Required viewports:

```text
390 × 844
768 × 1024
1024 × 768
1440 × 900
1728 × 1117
```

Critical actions cannot depend on hover. Minimum touch target is 44×44 px. Mobile is a task-appropriate transformation, not a squeezed desktop.

## 9. Autosave and conflicts

Draft builders use client command IDs, expected version and server acknowledgement. Visible states include Saved, Saving, Failed/Retry and Conflict/Compare/Refresh/Reapply. Never show `Saved` before server acknowledgement unless explicitly labelled local-only.

## 10. Testing

Follow `docs/architecture/TESTING_STRATEGY.md`. Run only applicable checks, but never report an unrun check as passed. Required coverage includes business policies, permission denial, write-path integration, idempotency/concurrency, tenant isolation, universal UI states, accessibility, keyboard/touch, responsive evidence and affected end-to-end flows.

## 11. Definition of Done

A task is `DONE` only when:

- the business outcome works end-to-end;
- traceability and acceptance criteria are satisfied;
- real read/write paths exist with no fixture fallback;
- domain, state, permission, event and audit rules are implemented;
- loading, empty, error, forbidden, saving, success and conflict states are handled;
- required tests pass and evidence is recorded;
- documentation, task status and module README are updated;
- no legacy import, deep import or unapproved scope expansion remains.

## 12. Stop conditions

Stop and report when traceability is missing, specifications conflict, ownership or permission is ambiguous, screen readiness is insufficient, integration source of truth is unclear, a destructive migration is unapproved or a durable architecture change lacks an ADR.
