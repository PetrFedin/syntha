# 08 — Screen Bible Index

## 1. Назначение

Этот документ — реестр экранов Syntha Wholesale V2.

Код экрана нельзя начинать, пока не определены:

- user goal;
- route and entry/exit points;
- data/read model contract;
- actions;
- states;
- role and permissions;
- domain entities and commands;
- responsive behavior;
- events/analytics;
- acceptance criteria;
- non-goals.

Статус `DESIGNED` означает, что отдельная screen-spec существует. Он не означает, что код реализован.

## 2. Универсальные шаблоны

### W — Workspace / Registry

AppShell + WorkspaceHeader + filters + table/gallery + optional inspector.

### E — Entity Page

EntityHeader + contextual tabs + main content + optional context rail.

### B — Builder

Source → working canvas/matrix → result/summary + persistent save/validation state.

### S — Split Collaboration

List/context rail → active content/thread → optional inspector.

### F — Focus Mode

Полноэкранный сценарий без лишней навигации: onboarding, preview, live showroom, complex editor.

## 3. First vertical slice package

```text
docs/screens/vertical-slice-01/
├── README.md
├── BR-002_CAMPAIGN_REGISTRY.md
├── BR-003_CAMPAIGN_OVERVIEW.md
├── BR-009_COLLECTION_OVERVIEW.md
├── BR-013_SHOWROOM_COMPOSER.md
├── BR-014_BUYER_PREVIEW.md
├── SH-006_COLLECTION_SHOWROOM.md
├── SH-008_SELECTION.md
├── SH-012_ORDER_BUILDER.md
└── companions/
    ├── README.md
    ├── BR-002A_CAMPAIGN_CREATE_EDIT.md
    ├── BR-004_CAMPAIGN_BUYERS_ACCESS.md
    ├── BR-010_COLLECTION_PRODUCT_MANAGEMENT_IMPORT.md
    ├── BR-015_PUBLISH_REVIEW.md
    ├── SY-003_INVITATION_ACCEPTANCE.md
    └── SH-013_ORDER_VALIDATION.md
```

End-to-end chain:

```text
Campaign Registry
→ Campaign Create/Edit
→ Campaign Overview
→ Collection Product Management/Import
→ Collection Overview
→ Showroom Composer
→ Campaign Buyers & Access
→ Buyer Preview
→ Publish Review
→ Invitation Acceptance
→ Shop Collection Showroom
→ Selection
→ Order Builder
→ Order Validation & Submit
```

Machine mapping:

```text
docs/implementation-blueprint/traceability-first-slice.json
```

## 4. Brand screens

| ID | Экран | Шаблон | Primary action | Приоритет | Статус |
|---|---|---|---|---|---|
| BR-001 | Brand Dashboard | W | Создать кампанию | P0 | SPEC |
| BR-002 | Campaign Registry | W | Создать кампанию | P0 | DESIGNED |
| BR-002A | Campaign Create/Edit | F/E | Создать / сохранить кампанию | P0 | DESIGNED |
| BR-003 | Campaign Overview | E | Продолжить подготовку | P0 | DESIGNED |
| BR-004 | Campaign Buyers & Access Grants | E/W | Пригласить Shops | P0 | DESIGNED |
| BR-005 | Campaign Appointments | E | Назначить встречу | P0 | SPEC |
| BR-006 | Campaign Calendar | E | Создать событие | P0 | SPEC |
| BR-007 | Campaign Analytics | E | Открыть действие/экспорт | P1 | SPEC |
| BR-008 | Collection Registry | W | Создать коллекцию | P0 | SPEC |
| BR-009 | Collection Overview | E | Добавить товары / продолжить readiness | P0 | DESIGNED |
| BR-010 | Collection Product Management & Import | E/W | Добавить товары | P0 | DESIGNED |
| BR-011 | Collection Looks | E | Создать look | P1 | SPEC |
| BR-012 | Collection Chapters/Drops | E | Создать раздел | P1 | SPEC |
| BR-013 | Showroom Composer | B | Сохранить / открыть Preview | P0 | DESIGNED |
| BR-014 | Buyer Preview | F | Вернуться к редактору / Publish Review | P0 | DESIGNED |
| BR-015 | Collection Publish Review | E/F | Опубликовать | P0 | DESIGNED |
| BR-016 | Collection Release History | E | Создать новую версию | P1 | SPEC |
| BR-017 | Product Registry | W | Добавить товар | P0 | SPEC |
| BR-018 | Product Detail | E | Сохранить изменения | P0 | SPEC |
| BR-019 | Price List Registry | W | Создать прайс-лист | P0 | SPEC |
| BR-020 | Price List Detail | E | Назначить покупателям | P0 | SPEC |
| BR-021 | Buyer Registry | W | Добавить Shop | P0 | SPEC |
| BR-022 | Buyer Detail | E | Назначить встречу | P0 | SPEC |
| BR-023 | Appointment Registry | W | Назначить встречу | P0 | SPEC |
| BR-024 | Appointment Preparation | E | Начать презентацию | P1 | SPEC |
| BR-025 | Live Showroom | F | Завершить встречу | P1 | SPEC |
| BR-026 | Appointment Summary | E | Отправить follow-up | P1 | SPEC |
| BR-027 | Incoming Order Registry | W | Открыть заказ | P0 | SPEC |
| BR-028 | Brand Order Detail | E | Подтвердить / предложить revision | P0 | SPEC |
| BR-029 | Brand Order Revision | B | Отправить изменения | P0 | SPEC |
| BR-030 | DealSpace Campaign | S | Написать сообщение | P0 | SPEC |
| BR-031 | DealSpace Collection | S | Написать сообщение | P0 | SPEC |
| BR-032 | DealSpace Order | S | Написать сообщение | P0 | SPEC |
| BR-033 | Brand Calendar | W | Создать событие | P0 | SPEC |
| BR-034 | Documents | W | Загрузить документ | P1 | SPEC |
| BR-035 | Brand Analytics | W | Открыть action queue/report | P1 | SPEC |
| BR-036 | Team & Permissions | W | Пригласить пользователя | P0 | SPEC |
| BR-037 | Brand Settings | W | Сохранить настройки | P0 | SPEC |
| BR-038 | Integrations | W | Подключить источник | P1 | SPEC |

## 5. Shop screens

| ID | Экран | Шаблон | Primary action | Приоритет | Статус |
|---|---|---|---|---|---|
| SH-001 | Shop Dashboard | W | Открыть активную кампанию | P0 | SPEC |
| SH-002 | Brand Directory | W | Открыть бренд | P1 | SPEC |
| SH-003 | Brand Detail | E | Запросить доступ | P1 | SPEC |
| SH-004 | Available Campaigns | W | Открыть кампанию | P0 | SPEC |
| SH-005 | Campaign Detail | E | Открыть коллекцию | P0 | SPEC |
| SH-006 | Collection Showroom | F | Открыть Selection | P0 | DESIGNED |
| SH-007 | Product Quick View | E/F | Добавить в Selection | P0 | SPEC |
| SH-008 | Selection | W | Создать заказ | P0 | DESIGNED |
| SH-009 | Compare Products | B | Добавить выбранное | P1 | SPEC |
| SH-010 | Buying Workspace | B | Перейти к Order Builder | P1 | SPEC |
| SH-011 | Budget Planner | B | Применить бюджет | P1 | SPEC |
| SH-012 | Order Builder | B | Проверить заказ | P0 | DESIGNED |
| SH-013 | Order Validation & Submit | E/F | Отправить заказ | P0 | DESIGNED |
| SH-014 | Shop Order Registry | W | Открыть заказ | P0 | SPEC |
| SH-015 | Shop Order Detail | E | Открыть revision / DealSpace | P0 | SPEC |
| SH-016 | Shop Revision Review | B | Подтвердить изменения | P0 | SPEC |
| SH-017 | DealSpace Campaign | S | Написать сообщение | P0 | SPEC |
| SH-018 | DealSpace Collection | S | Написать сообщение | P0 | SPEC |
| SH-019 | DealSpace Order | S | Написать сообщение | P0 | SPEC |
| SH-020 | Shop Calendar | W | Создать событие | P0 | SPEC |
| SH-021 | Buying Team Approval | E | Утвердить заказ | P1 | SPEC |
| SH-022 | Documents | W | Загрузить документ | P1 | SPEC |
| SH-023 | Shop Analytics | W | Открыть отчёт | P1 | SPEC |
| SH-024 | Team & Permissions | W | Пригласить пользователя | P0 | SPEC |
| SH-025 | Shop Settings | W | Сохранить настройки | P0 | SPEC |
| SH-026 | Integrations | W | Подключить источник | P1 | SPEC |

## 6. Shared system screens

| ID | Экран | Шаблон | Primary action | Приоритет | Статус |
|---|---|---|---|---|---|
| SY-001 | Sign in | F | Войти | P0 | SPEC |
| SY-002 | Organization onboarding | F | Продолжить | P0 | SPEC |
| SY-003 | Invitation Acceptance | F | Принять приглашение | P0 | DESIGNED |
| SY-004 | Notifications Center | W | Открыть событие | P0 | SPEC |
| SY-005 | Global Search | F | Открыть результат | P1 | SPEC |
| SY-006 | Access Request | E | Отправить запрос | P1 | SPEC |
| SY-007 | Error / Recovery | F | Повторить | P0 | SPEC |
| SY-008 | Integration Run Detail | E/W | Повторить / исправить mapping | P1 | SPEC |

## 7. Required screen specification

Each screen file includes:

```text
Identity / Route / Role / Priority
Capability IDs and Workflow IDs
User goal
Entry and exit points
Data/read model contract
Queries and commands
Domain entities and states
Layout and canonical components
Primary and secondary actions
Filters / columns / cards / inspector
Loading / empty / no-results / error / forbidden / saving / conflict / success
Permissions and field visibility
Keyboard and touch behavior
Responsive behavior
Domain / audit / analytics / realtime events
Acceptance criteria
Non-goals
```

## 8. Status lifecycle

- `SPEC` — index entry only.
- `DESIGNED` — full screen-spec exists and traceability is defined.
- `READY` — dependencies/gates reviewed; Cursor task may be created/activated.
- `IMPLEMENTING` — code in progress.
- `QA` — implementation complete, checks/review in progress.
- `DONE` — domain/API/UI/tests/responsive/security review completed.

A screen does not move to `READY` until related domain, permission, API, event and dependency contracts are consistent.
