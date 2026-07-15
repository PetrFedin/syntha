# 06 — Controlled Reuse from Current Syntha

## 1. Цель

Текущая Syntha является источником знаний и отдельных проверенных модулей, но не архитектурным основанием V2.

V2 нельзя строить путём копирования старого приложения. Reuse допускается только тогда, когда он:

- ускоряет реализацию;
- не переносит legacy navigation/chrome;
- не создаёт второй источник правды;
- не связывает V2 с production/PLM scope;
- соответствует Domain Model и UX Constitution V2.

Legacy source root для аудита:

```text
_ai-share/synth-1-full
```

Новый product root:

```text
apps/syntha-wholesale-v2
```

---

# 2. Главное правило

**Reuse logic, not legacy experience.**

Можно переиспользовать чистую логику, форматы данных, схемы, инфраструктуру и проверенные алгоритмы.

Нельзя переиспользовать старый UI-flow, shell, маршруты и связки read-native/write-legacy.

---

# 3. Разрешённые категории reuse

## 3.1 Чистые типы и схемы

Можно рассматривать:

- product identifiers;
- colour/size representations;
- money/currency types;
- order-line quantity structures;
- document metadata;
- API response schemas;
- validation result shapes.

Условия:

- тип не содержит legacy route/UI dependency;
- naming соответствует V2;
- ownership/source of truth задокументирован;
- импорт идёт через локальный adapter/re-export.

## 3.2 Чистые domain-функции

Кандидаты:

- order totals;
- size/colour matrix calculations;
- MOQ/pack validation;
- currency-safe arithmetic;
- version comparison;
- idempotency helpers;
- audit event formatting;
- date/time-zone utilities.

Перед reuse обязательны:

- unit tests;
- dependency audit;
- licence/security review для стороннего кода;
- rename/refactor под V2 domain language.

## 3.3 Infrastructure

Кандидаты:

- PostgreSQL pool/configuration;
- file storage adapter;
- email transport;
- authentication adapter;
- audit/event persistence;
- document export infrastructure;
- observability utilities;
- test containers/fixtures.

Условия:

- V2 получает собственный port/interface;
- infrastructure не раскрывает legacy tables напрямую UI;
- migrations для V2 имеют отдельный namespace;
- runtime/configuration не делит опасно build cache с legacy режимами.

## 3.4 Import/export utilities

Кандидаты:

- CSV/XLSX parsing;
- column mapping;
- export generation;
- PDF rendering pipeline;
- image/media processing.

Условия:

- V2 templates и schemas отдельные;
- ошибки импорта выводятся по V2 UX contract;
- generated documents привязаны к immutable entity version.

## 3.5 Test knowledge

Можно переиспользовать:

- realistic sample datasets;
- edge cases;
- known regression scenarios;
- browser/device test configuration;
- accessibility tooling;
- domain invariants.

Нельзя копировать тесты, которые утверждают legacy navigation или устаревшую структуру продукта.

---

# 4. Запрещённые категории reuse

## 4.1 Legacy UI components

Нельзя напрямую импортировать:

- cabinet shells;
- old sidebars/headers;
- ad-hoc tables;
- old pillar cards;
- legacy empty states;
- old action strips;
- Workshop2 UI;
- B2C components.

Причина: они несут разный chrome, density, navigation и продуктовую модель.

## 4.2 Legacy routes

Нельзя использовать как обязательный шаг:

- `/brand/...`;
- `/shop/...`;
- `?pc=1` bridges;
- old B2B order detail routes;
- old message/calendar routes;
- Workshop2 editor routes.

Временный migration bridge допускается только после ADR с датой удаления и fallback UX.

## 4.3 Legacy demo context

Запрещено копировать:

- несколько наборов demo IDs;
- hardcoded SS27 entities в feature code;
- fallback на фиктивный order/article при отсутствии данных;
- runtime flags, смешивающие несколько demo modes.

V2 имеет один fixture source of truth.

## 4.4 Production-specific domain in MVP

Не переносить в wholesale ядро:

- tech pack editor;
- BOM;
- sample production queue;
- factory/supplier roles;
- QC workflow;
- manufacturing order;
- warehouse operations;
- shipment execution engine.

В Order MVP возможны только информационные delivery terms/windows, не production execution.

## 4.5 Old design tokens as uncontrolled mix

Нельзя смешивать:

- raw `slate-*`;
- old cabinet tokens;
- arbitrary Tailwind values;
- multiple button/table systems.

V2 создаёт единый semantic token layer. Внешний вид может вдохновляться лучшими частями Platform Core, но контракт новый и изолированный.

---

# 5. Adapter pattern

Любой reuse оформляется так:

```text
apps/syntha-wholesale-v2/src/
  application/ports/
    product-import.port.ts
  infrastructure/
    product-import.adapter.ts
  adapters/legacy-syntha/
    legacy-product-source.ts
```

Feature/UI импортирует только application port/use case.

Запрещено:

```ts
import { LegacyComponent } from '../../../../_ai-share/synth-1-full/...';
```

Допустимо:

```ts
import { importProducts } from '@/application/use-cases/import-products';
```

где infrastructure adapter может временно читать совместимый legacy source.

---

# 6. Reuse assessment template

Для каждого кандидата создать запись:

```text
Candidate ID:
Legacy path:
Capability:
Proposed V2 use:
Dependencies:
UI dependency: yes/no
Legacy route dependency: yes/no
Data source:
Security/privacy risks:
Tests available:
Decision: reuse / adapt / rewrite / reject
Owner:
Removal/migration plan:
```

---

# 7. Предварительная карта кандидатов

## Strong candidates — audit first

- Money/currency arithmetic.
- Size and colour data structures.
- Order totals and line calculations.
- CSV/XLSX import utilities.
- PDF/XLSX export infrastructure.
- PostgreSQL/runtime utilities.
- File/document storage.
- Audit/idempotency patterns.
- Date/time-zone utilities.
- Playwright configuration and realistic browser coverage.

## Possible candidates — likely adapt

- Product fixtures.
- Existing product/order API schemas.
- Calendar integration groundwork.
- Contextual messaging backend concepts.
- Notification delivery infrastructure.
- Authentication and organisation primitives.

## Rewrite for V2

- App shell.
- Navigation.
- Campaign UI.
- Collection UI.
- Showroom.
- Buying Workspace.
- Order Builder.
- Orders UI.
- DealSpace UI.
- Calendar UI.
- Analytics UI.
- Design system.

## Reject from V2 MVP

- Manufacturer and Supplier cabinets.
- Workshop2 UI.
- Platform pillar matrix as main navigation.
- Read-native/write-legacy flow.
- Legacy demo fallbacks.
- B2C storefront chrome.

---

# 8. Data migration principles

## 8.1 No shared accidental schema

V2 tables/collections use explicit namespace, for example:

```text
wholesale_v2_organisations
wholesale_v2_campaigns
wholesale_v2_collections
wholesale_v2_products
wholesale_v2_orders
wholesale_v2_dealspaces
```

Exact naming is decided in ADR, but collision with legacy tables is forbidden.

## 8.2 Import, not implicit coupling

Legacy entities enter V2 through controlled import/sync:

- map;
- validate;
- report errors;
- persist V2 entity;
- store source reference;
- remain usable if legacy source is unavailable.

## 8.3 Source references

Optional fields:

- `sourceSystem`;
- `sourceEntityType`;
- `sourceEntityId`;
- `sourceUpdatedAt`;
- `lastSyncedAt`.

These are integration metadata, not V2 business identifiers.

---

# 9. Production extension later

После commercial MVP можно создать отдельный product boundary:

```text
apps/syntha-production-v2
```

Связь с Wholesale V2 идёт через подтверждённый Order contract, а не через прямые внутренние imports.

Пример будущего handoff:

```text
Confirmed Wholesale Order
→ Production Request
→ external/internal production module
→ status summary back to Wholesale Order
```

Wholesale пользователь видит только согласованный status summary и документы, пока отдельный production product не утверждён.

---

# 10. Exit criteria для legacy зависимости

Wholesale V2 готов к самостоятельному запуску, когда:

- Brand создаёт Campaign/Collection без legacy UI;
- Showroom публикуется без legacy API;
- Shop создаёт Selection и Order без legacy pages;
- Brand подтверждает Order без legacy pages;
- Chat/Calendar/DealSpace работают внутри V2;
- документы генерируются из V2 versions;
- critical path e2e не посещает legacy route;
- V2 работает при недоступности legacy application, кроме явно подключённых optional integrations.