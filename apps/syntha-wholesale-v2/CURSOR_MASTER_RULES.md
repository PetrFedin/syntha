# Cursor Master Rules — Syntha Wholesale V2

Этот файл обязателен для любой работы Cursor в `apps/syntha-wholesale-v2`.

## 1. Product Canon

- Пользовательские стороны: только `Brand` и `Shop`.
- Ядро: `Campaign → Collection → Showroom → Selection → Order Builder → Order → DealSpace`.
- Главная ценность: лучший показ fashion-коллекции и лучший процесс написания оптового заказа.
- Calendar, Appointments and DealSpace — часть ядра, а не отдельные несвязанные приложения.
- Production, PLM, BOM, tech packs, sourcing, costing, QC, MES, factory execution и accounting не входят в wholesale MVP.
- Интеграции с внешними системами не передают им владение Syntha presentation, access, selection, collaboration или negotiated order state.

## 2. Изоляция

- Новый код существует только внутри `apps/syntha-wholesale-v2` и утверждённых shared packages.
- Прямые импорты legacy UI запрещены.
- Legacy routes не являются fallback.
- Повторное использование domain/infrastructure возможно только через локальный adapter с тестами.
- B2C storefront, manufacturer/supplier roles и production navigation запрещены без изменения Product Canon.

## 3. Источники правды

Cursor читает перед кодом:

1. `README.md`.
2. `CURSOR_MASTER_RULES.md`.
3. `docs/00_PRODUCT_CANON.md`.
4. `docs/13_PRODUCT_PRINCIPLES.md`.
5. `docs/01_INFORMATION_ARCHITECTURE.md`.
6. `docs/02_FUNCTIONAL_MAP.md`.
7. `docs/03_DOMAIN_MODEL.md`.
8. `docs/11_SECURITY_AND_DATA.md`.
9. `docs/04_UX_CONSTITUTION.md`.
10. `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md`.
11. `design-system/tokens.json`.
12. `design-system/responsive-contract.json`.
13. `docs/08_SCREEN_BIBLE_INDEX.md`.
14. relevant `docs/screens/**`.
15. `docs/implementation-blueprint/01_MASTER_CAPABILITY_MAP.md`.
16. relevant Role, Entity, Workflow, Screen/API, Event and Integration documents.
17. `docs/implementation-blueprint/09_CURSOR_IMPLEMENTATION_CONTRACT.md`.
18. relevant `tasks/TASK-*.md`.
19. `STATUS.md`.

При конфликте действует приоритет:

```text
Product Canon
→ Domain/Security
→ Visual System
→ Screen Bible
→ Implementation Blueprint
→ Task
→ Code
```

Cursor не выбирает удобный вариант самостоятельно. Работа блокируется до исправления документации или ADR.

## 4. Traceability contract

Каждая task обязана содержать:

```yaml
task_id: TASK-...
capability_ids: [CAP-...]
workflow_ids: [WF-...]
screen_ids: [BR-..., SH-..., SY-...]
roles: []
permissions: []
entities: []
queries: []
commands: []
domain_events: []
notifications: []
integrations: []
dependencies: []
```

Для первого среза используется:

```text
docs/implementation-blueprint/traceability-first-slice.json
```

Функция без Capability ID не реализуется.

Экран без статуса `DESIGNED` или выше не реализуется.

## 5. Screen Bible contract

Для каждого экрана обязательны:

- role and route;
- user goal;
- entry/exit points;
- exact read model/data contract;
- layout template;
- primary and secondary actions;
- filters/table/cards/inspector where applicable;
- loading, empty, no-results, error, forbidden, saving, success and conflict states;
- permissions and field visibility;
- keyboard/touch path;
- iPhone/iPad/MacBook behavior;
- analytics/audit events;
- acceptance criteria;
- non-goals.

Scope экрана нельзя расширять в коде.

## 6. Domain rules

- Domain не зависит от React, Next.js, database SDK или vendor integrations.
- UI работает с read models and application commands, не с database tables.
- Entity states задаются enum/policy, не произвольными строками.
- Money uses minor units + ISO currency.
- Dates use UTC + source timezone.
- Published CollectionVersion/ShowroomRelease immutable.
- Submitted and Confirmed OrderVersion immutable.
- Brand revision creates suggestion/new version, never overwrites Shop version.
- Buyer Preview and Shop Showroom use the same access/pricing/visibility resolver.
- Showroom → Selection → Order preserves stable source lineage IDs.
- Order totals are calculated by domain/application service.
- Archive preferred to deletion; audit history preserved.

Before schema creation Cursor must classify object as:

```text
aggregate | entity | value object | snapshot | read model | integration mapping
```

## 7. Architecture rules

Recommended layers:

```text
src/
  app/              routes and composition
  components/       canonical UI
  features/         bounded feature modules
  domain/           entities/value objects/policies
  application/      use cases, queries, commands, ports
  infrastructure/   persistence, API, event bus, integrations
  adapters/         controlled legacy/external adapters
  lib/              narrow utilities
```

- UI never accesses DB, ERP, PIM or PLM directly.
- All writes pass application use cases.
- Infrastructure implements ports.
- Retryable writes are idempotent.
- Concurrent aggregates use expected version.
- Important changes create domain and audit events.
- Sensitive read models are server-redacted.

## 8. Permissions

Authorization combines:

```text
user
+ active organisation membership
+ organisation type
+ permission set
+ assignment scope
+ entity relationship
+ entity state
+ field visibility
```

For each action task must define:

- permission;
- scope;
- state rule;
- relationship/access grant rule;
- redacted fields;
- audit event;
- UI state;
- positive and negative authorization tests.

Hiding a button is not authorization.

Private Shop notes never enter Brand API projections. Brand internal notes never enter shared DealSpace payloads.

## 9. API rules

- Version prefix: `/api/v2`.
- Active organisation validated server-side.
- Stable input schema and error codes.
- Idempotency key for retryable commands.
- Expected version for concurrent writes.
- Cursor pagination for large registries.
- Response contains request/correlation ID.
- No secret/raw token/vendor credential in client/logs.
- API command emits required events through outbox/event mechanism.
- No fake successful mutation without persistence.

## 10. Event, notification and realtime rules

Separate:

```text
Domain Event
Audit Event
Analytics Event
Realtime Event
```

Every write task specifies all applicable event classes, notification recipients/channels and dedupe key.

Notifications are produced by application/event consumers, not directly by React components.

Realtime subscriptions are authorized server-side; topic name does not grant access.

General analytics must not contain private notes, message bodies, secrets or raw buyer-specific price lists.

## 11. Integration rules

- Every connector uses port/adapter.
- External IDs map to internal IDs; they are never internal primary keys.
- Source of truth is documented by field/domain.
- Manual imports use Upload → Map → Preview → Validate → Execute → Report.
- Sync is idempotent, observable and retry-bounded.
- External price/inventory changes do not rewrite historical release/order snapshots.
- ERP fulfilment status is a projection, not mutation of confirmed commercial version.
- Secrets live in secret storage.

## 12. UI rules

Allowed layout families:

```text
Registry
Entity
Builder
Showroom
Split Communication
Focus
```

Canonical components only. Cursor searches existing implementation and `docs/09_COMPONENT_LIBRARY.md` before adding a component.

- One Primary CTA per screen/focus region.
- Destructive actions separated and confirmed.
- No arbitrary colours, fonts, spacing, shadows or radii.
- Feature code contains no raw hex or ad-hoc Tailwind pixel values.
- Runtime tokens come from `design-system/tokens.json`.
- Responsive behavior follows `design-system/responsive-contract.json`.
- Lucide is the only icon family unless specification changes.
- Critical action cannot depend on hover.

## 13. Visual canon

- Light theme in MVP.
- Warm neutral canvas and white operational surfaces.
- Restrained dark green accent.
- Inter for operational UI.
- Source Serif 4 only for buyer-facing editorial hero.
- Operational radius 6–12 px; editorial maximum 16 px.
- Minimal shadows.
- WCAG 2.2 AA.
- Prices, quantities, budgets and totals use tabular numerals.
- Minimum touch target 44×44 px.
- iPhone input font minimum 16 px.

## 14. Responsive contract

Mandatory P0 viewports:

```text
390 × 844
768 × 1024
1024 × 768
1440 × 900
1728 × 1117
```

Adaptation order:

1. hide low-priority metadata;
2. move secondary actions to overflow;
3. move inspector/context rail to drawer/sheet;
4. transform registry table to mobile list;
5. transform complex builder to sequential steps.

Mobile is not a squeezed desktop.

Order Builder:

- desktop: source + matrix + summary;
- iPad landscape: matrix-primary with drawers;
- iPhone: Products → Quantities → Delivery → Review.

## 15. Autosave and conflicts

Showroom Composer and Order Builder use:

```text
local command
→ optimistic projection where safe
→ queued command with clientCommandId
→ expectedVersion validation
→ applied/rejected result
→ newVersion
→ event/cache update
```

Visible states:

```text
Saved | Saving | Failed/Retry | Conflict/Compare/Refresh/Reapply
```

Never show `Saved` before server acknowledgement unless explicitly labelled local-only.

## 16. Testing

Every task includes as applicable:

- unit tests for value objects/policies/calculations;
- permission and state transition tests;
- repository/API integration tests;
- idempotency/concurrency tests;
- tenant isolation and negative authorization tests;
- component states and accessibility;
- keyboard and touch paths;
- e2e happy path and failure/denial path;
- responsive screenshots at mandatory viewports;
- event/notification consumer tests;
- integration mapping/retry tests.

Critical E2E:

```text
Create Campaign
→ Configure Products and Terms
→ Compose Showroom
→ Configure Buyer Access
→ Preview
→ Publish
→ Accept Invitation
→ Browse and Select
→ Create Order
→ Enter Quantities
→ Validate and Submit
→ Brand Review / Revise / Confirm
```

## 17. Definition of Done

Task is `DONE` only when:

- business outcome works end-to-end;
- all capability/workflow/screen mappings are satisfied;
- no TODO, stub, dead end or demo-only success;
- domain/state/permission rules implemented;
- real API read/write path exists;
- events/audit/notifications implemented;
- all universal UI states implemented;
- responsive/accessibility reviewed;
- tests pass;
- documentation/status/task completion report updated;
- no legacy UI import;
- no unapproved scope expansion.

## 18. Stop conditions

Cursor must stop and report when:

- Capability ID missing;
- screen spec missing or status below DESIGNED;
- ownership/state/permission ambiguous;
- API and Screen Bible conflict;
- visual/token contract conflicts;
- integration source of truth unclear;
- migration/destructive effect unapproved;
- competitor function expands scope beyond Product Canon.

## 19. Prohibited

- adding a feature only because a competitor has it;
- creating a second source of truth;
- creating module-specific visual system;
- direct database/vendor API calls from UI;
- silent fallback to fixtures/sample data;
- generic `status: string` when policy exists;
- in-place mutation of published/submitted/confirmed snapshots;
- manual rematching by style code in normal lineage flow;
- full production/PLM/ERP modules before wholesale core completion.
