# Syntha Wholesale V2 — Implementation Blueprint

## 1. Назначение

Этот каталог связывает Product Bible, Screen Bible и реализацию Cursor.

Он фиксирует для каждой возможности:

- user problem and business outcome;
- Capability ID;
- product owner side: Brand / Shop / Shared / System;
- role and permission;
- assignment scope and field visibility;
- screen and route;
- domain entity and lifecycle state;
- read model/query;
- command/API mutation;
- domain, audit, analytics and realtime events;
- notification recipients/channels;
- integration/source-of-truth effects;
- priority, dependencies and phase;
- competitor reference and Syntha decision;
- acceptance and negative tests.

Cursor не реализует функцию, пока traceability chain не определена.

## 2. Каноническая цепочка

```text
Capability
→ Role / Permission / Scope
→ Entity / State / Ownership
→ Workflow
→ Screen / Route / Read Model
→ Query / Command / API
→ Domain / Audit / Analytics / Realtime Event
→ Notification
→ Integration / Source of Truth
→ Cursor Task
→ Tests / Definition of Done
```

## 3. Документы

```text
01_MASTER_CAPABILITY_MAP.md
02_ROLE_PERMISSION_MATRIX.md
03_ENTITY_RELATIONSHIP_STATE_MAP.md
04_WORKFLOW_CATALOG.md
05_SCREEN_FUNCTION_API_MATRIX.md
06_EVENT_NOTIFICATION_CATALOG.md
07_INTEGRATION_SYNC_BLUEPRINT.md
08_COMPETITOR_REFERENCE_CARDS.md
09_CURSOR_IMPLEMENTATION_CONTRACT.md
traceability-first-slice.json
```

### 01 — Master Capability Map

Каталог функций с постоянными `CAP-*` IDs, ролями, screens, entities, permissions, priorities, dependencies and references.

### 02 — Role & Permission Matrix

Brand/Shop role presets, assignment scopes, action/state/field restrictions and negative authorization requirements.

### 03 — Entity Relationship & State Map

Ownership, cardinality, state machines, immutable snapshots, archive/delete rules and Showroom→Selection→Order lineage.

### 04 — Workflow Catalog

End-to-end processes `WF-*`: initiator, preconditions, steps, commands, events, notifications, errors and outcome.

### 05 — Screen / Function / API Matrix

Screen ID to capability, read model, query, command, permission, event, realtime and canonical component mapping.

### 06 — Event & Notification Catalog

Separation of Domain/Audit/Analytics/Realtime events, notification rules, dedupe, topics and privacy-safe telemetry.

### 07 — Integration Blueprint

Source-of-truth matrix, ports/adapters, mapping, sync modes, retries, conflicts, webhooks, security and observability.

### 08 — Competitor Reference Cards

JOOR, NuORDER, WFX, Brandboom, RepSpark, Le New Black and Faire: verified capabilities and ADOPT/IMPROVE/LATER/EXCLUDE decisions.

### 09 — Cursor Implementation Contract

Mandatory task inputs, implementation layers, stop conditions, tests and Definition of Done.

### Machine traceability

`traceability-first-slice.json` connects the first 14 screen/companion specs to capabilities, workflows, roles, permissions, entities, commands and events.

## 4. Иерархия источников правды

При конфликте:

1. `docs/00_PRODUCT_CANON.md` — product boundary.
2. `docs/03_DOMAIN_MODEL.md` — entity and business invariants.
3. `docs/11_SECURITY_AND_DATA.md` — security and access.
4. `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` + design-system JSON — visual/responsive contract.
5. `docs/screens/**` — concrete screen behavior.
6. `docs/implementation-blueprint/**` — cross-layer traceability.
7. `tasks/**` — atomic execution plan.
8. code.

Если Blueprint противоречит более высокому документу, Cursor останавливает работу и создаёт ADR/исправление документации.

## 5. Как использовать Blueprint при создании задачи

Для новой task:

1. Найти существующий Capability ID.
2. Проверить Role/Permission/Scope.
3. Найти Entity/State ownership.
4. Привязать Workflow ID.
5. Проверить Screen status и screen-spec.
6. Указать exact queries/commands.
7. Указать events/notifications.
8. Указать integration effect/source of truth.
9. Добавить dependencies and gates.
10. Сформировать acceptance + negative tests.

Если Capability ID отсутствует, сначала обновляется Product/Functional/Capability documentation.

## 6. Как использовать Blueprint при разработке экрана

Cursor не начинает с JSX.

Порядок:

```text
Read model type
→ Query contract
→ Permission/redaction policy
→ Domain/application commands
→ Events and cache invalidation
→ Canonical layout/components
→ Universal states
→ Responsive transformation
→ Tests
```

## 7. Как использовать Blueprint при разработке write-path

Каждая mutation должна иметь:

- authenticated active organisation;
- permission and scope;
- entity state check;
- input validation;
- idempotency where retryable;
- expected version where concurrent;
- transaction/atomicity policy;
- domain event;
- audit event;
- notification/realtime behavior;
- stable error codes;
- positive and negative tests.

## 8. Feature admission rule

Competitor feature не попадает в scope только потому, что существует у JOOR/NuORDER/WFX/другой платформы.

Требуется:

```text
verified source
+ defined Brand/Shop job
+ Syntha decision ADOPT/IMPROVE/LATER/EXCLUDE
+ Capability ID
+ priority/dependencies
+ role/permission
+ entity/workflow
+ screen/API/event contract
```

## 9. First-slice coverage

Covered screens:

```text
BR-002  Campaign Registry
BR-002A Campaign Create/Edit
BR-003  Campaign Overview
BR-004  Campaign Buyers & Access
BR-009  Collection Overview
BR-010  Product Management & Import
BR-013  Showroom Composer
BR-014  Buyer Preview
BR-015  Publish Review
SY-003  Invitation Acceptance
SH-006  Shop Showroom
SH-008  Selection
SH-012  Order Builder
SH-013  Order Validation & Submit
```

Traceability file:

```text
traceability-first-slice.json
```

## 10. Completion rule

Blueprint area is considered implementation-ready only when:

- Capability definitions are stable;
- Role/Permission decisions are approved;
- Entity state and ownership are unambiguous;
- workflow has happy/error/compensation paths;
- screen specification is DESIGNED;
- read/write/event contracts agree;
- integration source of truth is known;
- task dependencies and ADRs are approved;
- acceptance criteria are testable.

Until then status remains `DRAFT` or `BLOCKED`, not `READY`.
