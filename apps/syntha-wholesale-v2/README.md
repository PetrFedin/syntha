# Syntha Wholesale V2

Новый изолированный B2B wholesale-продукт внутри репозитория Syntha.

## 1. Цель

Создать лучшую платформу для:

1. подготовки и продажи fashion-коллекций Brand;
2. персонализированного показа коллекций Shop;
3. профессионального отбора ассортимента;
4. быстрого написания оптового заказа;
5. совместной работы Brand и Shop до подтверждения заказа.

Основной продуктовый поток:

```text
Sales Campaign
→ Collection
→ Product Commercial Catalogue
→ Showroom Composer
→ Buyer Preview
→ Publish Release
→ Buyer Invitation / Appointment
→ Shop Showroom
→ Selection
→ Order Builder
→ Validation / Approval
→ Submit
→ Brand Review / Revision
→ Confirmation
→ DealSpace continuation
```

## 2. Границы первой версии

Пользовательские стороны только две:

- `Brand`;
- `Shop`.

Производство, PLM, BOM, tech packs, sourcing, costing, QC, MES, factory execution, accounting и supply-chain execution не входят в wholesale MVP.

Они могут подключаться позднее через integration adapters или отдельные модули, но не меняют навигацию и доменную модель первого продукта.

## 3. Функциональные референсы

Syntha использует лучшие подтверждённые принципы:

- JOOR — wholesale network, digital linesheets, ordering, integrations;
- NuORDER — account-specific commerce, visual assortment planning and team buying;
- World Fashion Exchange — personalised virtual showroom, secure access, rich media and showroom analytics;
- Brandboom — fast linesheets, activity signals and seller usability;
- RepSpark — always-on ordering, custom assortments, size-run flows and retailer adoption;
- Le New Black — fashion-native visual presentation;
- Faire — discovery and contextual Brand↔Retailer communication.

Функции не копируются автоматически. Для каждой возможности принимается решение:

```text
ADOPT | IMPROVE | LATER | EXCLUDE
```

Подробные карточки находятся в:

```text
docs/implementation-blueprint/08_COMPETITOR_REFERENCE_CARDS.md
docs/15_WFX_REFERENCE_AND_ADAPTATION.md
```

## 4. Структура проекта

```text
apps/syntha-wholesale-v2/
├── README.md
├── STATUS.md
├── CURSOR_MASTER_RULES.md
├── docs/
│   ├── 00_PRODUCT_CANON.md
│   ├── 01_INFORMATION_ARCHITECTURE.md
│   ├── 02_FUNCTIONAL_MAP.md
│   ├── 03_DOMAIN_MODEL.md
│   ├── 04_UX_CONSTITUTION.md
│   ├── 05_IMPLEMENTATION_ROADMAP.md
│   ├── 06_REUSE_FROM_SYNTHA.md
│   ├── 07_COMPETITIVE_MATRIX.md
│   ├── 08_SCREEN_BIBLE_INDEX.md
│   ├── 09_COMPONENT_LIBRARY.md
│   ├── 10_API_BIBLE.md
│   ├── 11_SECURITY_AND_DATA.md
│   ├── 12_CURSOR_TASK_TEMPLATE.md
│   ├── 13_PRODUCT_PRINCIPLES.md
│   ├── 14_ADAPTIVE_UI_VISUAL_SYSTEM.md
│   ├── 15_WFX_REFERENCE_AND_ADAPTATION.md
│   ├── implementation-blueprint/
│   │   ├── README.md
│   │   ├── 01_MASTER_CAPABILITY_MAP.md
│   │   ├── 02_ROLE_PERMISSION_MATRIX.md
│   │   ├── 03_ENTITY_RELATIONSHIP_STATE_MAP.md
│   │   ├── 04_WORKFLOW_CATALOG.md
│   │   ├── 05_SCREEN_FUNCTION_API_MATRIX.md
│   │   ├── 06_EVENT_NOTIFICATION_CATALOG.md
│   │   ├── 07_INTEGRATION_SYNC_BLUEPRINT.md
│   │   ├── 08_COMPETITOR_REFERENCE_CARDS.md
│   │   ├── 09_CURSOR_IMPLEMENTATION_CONTRACT.md
│   │   └── traceability-first-slice.json
│   └── screens/
│       └── vertical-slice-01/
│           ├── README.md
│           ├── BR-002_CAMPAIGN_REGISTRY.md
│           ├── BR-003_CAMPAIGN_OVERVIEW.md
│           ├── BR-009_COLLECTION_OVERVIEW.md
│           ├── BR-013_SHOWROOM_COMPOSER.md
│           ├── BR-014_BUYER_PREVIEW.md
│           ├── SH-006_COLLECTION_SHOWROOM.md
│           ├── SH-008_SELECTION.md
│           ├── SH-012_ORDER_BUILDER.md
│           └── companions/
│               ├── README.md
│               ├── BR-002A_CAMPAIGN_CREATE_EDIT.md
│               ├── BR-004_CAMPAIGN_BUYERS_ACCESS.md
│               ├── BR-010_COLLECTION_PRODUCT_MANAGEMENT_IMPORT.md
│               ├── BR-015_PUBLISH_REVIEW.md
│               ├── SY-003_INVITATION_ACCEPTANCE.md
│               └── SH-013_ORDER_VALIDATION.md
├── design-system/
│   ├── README.md
│   ├── tokens.json
│   └── responsive-contract.json
├── tasks/
│   └── README.md
└── src/
    └── README.md
```

## 5. Слои документации

### Product Bible

Определяет:

- что строим;
- границы продукта;
- модули;
- сущности;
- UX;
- visual system;
- API;
- security;
- roadmap.

### Screen Bible

Определяет конкретный экран:

- user goal;
- route;
- data contract;
- layout;
- actions;
- states;
- permissions;
- responsive behavior;
- analytics;
- acceptance criteria.

### Implementation Blueprint

Связывает Product Bible и код:

```text
Capability
→ Role / Permission
→ Entity / State
→ Workflow
→ Screen
→ Query / Command / API
→ Domain / Audit / Analytics / Realtime Event
→ Notification
→ Integration
→ Cursor Task
```

### Cursor Tasks

Содержат только атомарную реализацию уже утверждённых capabilities и screens.

## 6. Обязательный порядок чтения Cursor

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
14. соответствующая screen-spec из `docs/screens/`.
15. `docs/implementation-blueprint/01_MASTER_CAPABILITY_MAP.md`.
16. соответствующие Role, Entity, Workflow, Screen/API, Event и Integration sections.
17. `docs/implementation-blueprint/09_CURSOR_IMPLEMENTATION_CONTRACT.md`.
18. соответствующая задача из `tasks/`.
19. `STATUS.md`.

Если документы расходятся, код не изменяется до исправления спецификации или принятия ADR.

## 7. Первый полностью описанный vertical slice

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

Основные восемь экранов и шесть companion screens имеют отдельные спецификации.

Machine-readable mapping:

```text
docs/implementation-blueprint/traceability-first-slice.json
```

## 8. Канонические модули

### Brand

- Dashboard;
- Sales Campaigns;
- Collections;
- Product Catalogue;
- Showrooms;
- Buyers;
- Appointments;
- Orders;
- DealSpace;
- Calendar;
- Documents;
- Analytics;
- Team & Permissions;
- Integrations;
- Settings.

### Shop

- Dashboard;
- Brands;
- Campaigns;
- Showrooms;
- Selection / Buying Workspace;
- Orders;
- DealSpace;
- Calendar;
- Documents;
- Analytics;
- Team & Permissions;
- Integrations;
- Settings.

Общение не является отдельным бессвязным мессенджером: оно открывается через DealSpace и contextual threads кампании, коллекции, продукта, appointment, order и order line.

## 9. Главные domain-связи

```text
Brand Organisation
→ SalesCampaign
→ Collection
→ CollectionVersion
→ ShowroomRelease
→ CampaignAccessGrant
→ Shop Organisation
→ ShowroomSession
→ ProductInteraction
→ SelectionItem
→ OrderLine
→ OrderVersion
```

Пара Brand↔Shop также связана через:

```text
TradingRelationship
→ DealSpace
→ Context Threads
→ Messages / Files / Tasks / Activity
```

Buyer Preview и реальный Shop Showroom используют один access/pricing/visibility resolver.

Published Collection/Showroom release, Submitted OrderVersion и Confirmed OrderVersion неизменяемы.

## 10. Канонический визуальный язык

Операционный UI использует:

- warm neutral surfaces;
- graphite text;
- один restrained dark green accent;
- Inter;
- optional Source Serif 4 только в buyer-facing editorial hero;
- минимальные тени;
- рабочие радиусы 6–12 px;
- один AppShell и component system для Brand/Shop;
- адаптацию workflow, а не уменьшенный desktop на iPhone.

Showroom может быть editorial, но pricing, selection, order controls, permissions и statuses остаются системными.

## 11. Правило реализации

Новая функция не реализуется, пока не определены:

```text
Capability ID
Workflow ID
Screen ID
Role and Permission
Entity and State
Read Model
Query and Command
Events and Notifications
Integration effect
Acceptance tests
Priority and dependencies
```

Cursor обязан:

- брать задачи только из `tasks/`;
- выполнять только задачи `READY`;
- использовать canonical components и tokens;
- не обращаться из UI напрямую к базе/ERP;
- не импортировать legacy UI;
- не открывать legacy routes;
- не создавать fake success/dead ends;
- не добавлять функцию только потому, что она есть у конкурента;
- сохранять source lineage от Showroom до OrderVersion;
- реализовывать server-side permissions и negative tests.

## 12. Текущий статус

- Product scope and principles: draft complete;
- Information architecture and Functional Map: draft complete;
- Domain/API/Security foundations: draft complete;
- Visual and responsive system: draft complete;
- WFX adaptation and competitor reference cards: verified/in-progress by source;
- Master Capability Map: draft complete;
- Role & Permission Matrix: draft complete;
- Entity/State Map: draft complete;
- Workflow Catalog: draft complete;
- Screen/Function/API Matrix: draft complete;
- Event/Notification Catalog: draft complete;
- Integration Blueprint: draft complete;
- First vertical slice: 14 screen/companion specifications designed;
- Machine traceability for first slice: created;
- Runtime code: not started.

Точные gates, blockers и последовательность следующей работы находятся в `STATUS.md`.
