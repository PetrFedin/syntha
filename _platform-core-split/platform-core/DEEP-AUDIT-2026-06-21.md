# Platform Core Deep Audit - 2026-06-21

Аудит сделан по текущему клону проекта, с фокусом на Platform Core: 4 роли × 5 столпов. Живую страницу `/platform` в этом клоне найти не удалось, поэтому оценка основана на исходниках, audit-слое, маршрутах, документах и уже собранной папке `_platform-core-split`.

## 0. Честный общий вердикт

Platform Core как идея - самая сильная часть проекта. Это правильный фокус: не "вся SYNTHA сразу", а операционное ядро, где бренд, магазин, производство и поставщик проходят один заказный контур.

Но текущая реализация еще не на 10. Сейчас это сильный demo/product-core слой примерно на 7.2 по внутренним audit-оценкам, с хорошими связями, но с большим количеством навигационного шума, demo-зависимостей, дублей, read-only алиасов, poll-only мест и не до конца доказанных cross-role сценариев.

Главная проблема не в отсутствии функций. Главная проблема в том, что функций уже слишком много, а "железная линия ценности" еще не достаточно жесткая:

`Shop order -> Brand confirm -> Production PO -> Factory execution -> Supplier materials -> Shop tracking -> Comms/calendar evidence`.

Пока этот путь не стал одним очевидным и проверяемым продуктовым позвоночником, 10 баллов невозможны.

## 1. Оценка по измерениям

| Измерение | Сейчас | Почему не 10 | Что нужно до 10 |
| --- | ---: | --- | --- |
| Концепт 4×5 | 8.5 | Отличный фокус, но старые матрицы и distributor-контекст все еще шумят рядом. | Зафиксировать 4×5 как единственный core-contract, старое оставить как archive/expanded. |
| Связность ролей | 6.5 | Много ссылок и context strips, но не везде есть доказанное событие A -> видимость B. | Один сквозной E2E через все роли с одним `orderId`, `poId`, `threadId`. |
| Навигация | 5.5 | Слишком много соседних страниц. `shop/b2b` имеет 76 page routes, Brand Production огромен. | Core path 6-8 экранов на роль, остальное в Advanced/Archive. |
| Данные | 6.0 | PG есть, но много file-store, seed, localStorage, demo/fallback. | Core-only PG-first режим без silent fallback, demo явно маркировать. |
| UX ядра | 6.5 | Много полезных блоков, но есть дубли mini/full, context strip повторяется, много "переходов". | Role cockpit на каждый столп, меньше ссылочного лабиринта. |
| Comms/calendar | 6.5 | Хорошая база section threads, но polling, memory-only calendar tasks, нет notification center. | Единый inbox, PG calendar, push/SSE, notification center. |
| Тестируемость | 6.0 | Есть e2e вокруг B2B/API/hubs, но не хватает двухакторного сквозняка. | "Cross-role truth test": один сценарий через 4 роли, с проверкой видимости у второго актора. |
| Сборочная дисциплина | 4.0 | `ignoreBuildErrors: true`, `ignoreDuringBuilds: true`, отсутствуют некоторые Platform Core файлы. | Восстановить missing files/routes, включить strict gate хотя бы на Platform Core. |

## 2. Самые важные блокеры

### 2.1. Нет найденной страницы `/platform`

В клоне не найден `src/app/platform/page.tsx`. Значит, текущий `SYNTHA · Platform Core` либо не закоммичен, либо в другой ветке, либо строится не как Next route.

До 10: восстановить настоящую страницу `/platform` как главный entrance.

### 2.2. Missing core files

Audit-слой импортирует:

- `@/lib/platform-core-hub-matrix`
- `@/lib/platform-core-readiness-audit`

Но эти файлы в текущем клоне не найдены.

До 10: вернуть эти файлы или перенести их в `src/features/platform-core` с re-export compatibility layer.

### 2.3. Core cabinet route constants не найдены явно

Audit-файлы используют:

- `ROUTES.brand.coreCabinet`
- `ROUTES.shop.coreCabinet`
- `ROUTES.factory.productionCoreCabinet`
- `ROUTES.factory.supplierCoreCabinet`

В текущем `routes.ts` они не найдены как явные ключи.

До 10: создать официальный route contract для core cabinets.

### 2.4. Type/build gate ослаблен

В `next.config.ts` включены:

- `typescript.ignoreBuildErrors: true`
- `eslint.ignoreDuringBuilds: true`

До 10: для всего проекта это можно включать не сразу, но для Platform Core нужен отдельный строгий check.

## 3. Cross-cutting проблемы

### 3.1. Навигационный шум

Shop B2B сейчас имеет 76 page routes на глубине двух уровней. Для core это слишком много. Brand Production тоже огромен: 461 component files и 211 app files в related зоне. Это богатство, но для Platform Core оно превращается в шум.

Что делать:

- В core оставить только golden path.
- Все остальное назвать Advanced, Archive, Labs или Extensions.
- На `/platform` показывать только 4×5 и drill-down по ячейке.

### 3.2. Дубли mini/full и registry/detail/status

Повторы встречаются во многих местах:

- `mini vs full page`
- `registry vs order detail`
- `chain card vs order facts`
- `collection_order registry vs order_production registry`
- `calendar order layer vs logistics layer`
- `supplier development comms alias vs comms article`

Что делать:

- Одна canonical card на сущность.
- Одна canonical registry на заказ.
- Разные столпы могут ссылаться на один экран, но score должен объяснять, что это alias, а не новый функционал.

### 3.3. Demo/fallback/local state

Найдены явные зоны:

- `file-store`
- `memory fallback`
- `localStorage`
- `seed`
- `B2B-DEMO`
- `EMPTY27`
- `demo-режим`
- `placeholder-data`

Что делать:

- В core нельзя молча подставлять demo.
- Каждый demo блок должен иметь badge: demo, seed, file-store, PG-off.
- Для инвестора можно оставлять demo, для продукта нужен PG-first режим.

### 3.4. Ссылки вместо действий

Много context strips и peer links. Это хорошо для навигации, но не заменяет действие.

До 10 каждая ключевая связка должна иметь:

- actor
- action
- persisted event
- visible result in another role
- e2e assertion

### 3.5. Poll-only вместо live

Во многих местах audit сам признает poll-only:

- W2 drawer unread
- article workspace unread
- supplier push
- materials supplied
- handoff queue
- Redis registry bump

До 10:

- SSE/WebSocket для core status updates.
- Poll оставить fallback, но UI должен знать, когда он в fallback.

## 4. Brand audit

### 4.1. Brand - development

Что хорошо:

- W2 hub, dossier, range planner и PG sync уже образуют сильный контур разработки.
- Есть dossier API, BOM/composition wizard, tech-pack export hints, sample queue.
- Есть EMPTY27 onboarding, что полезно для пустых состояний.

Что плохо:

- PDF/SVG export не закрыт e2e.
- Investor-summary живет отдельно как read-only, что создает второй источник смысла.
- Нет drag-reorder между tier.
- Нет push при смене статуса образца.
- Quick-create не закрыт e2e до tier assign.

Что делать до 10:

1. Сделать один article lifecycle: create -> tier -> dossier -> BOM -> sample -> publish.
2. Закрыть PDF/ZIP/TZ export e2e.
3. Добавить SSE sample queue для бренда.
4. Убрать investor-summary как отдельный смысл, встроить его в dossier overview.
5. Добавить drag-reorder SKU между tier.
6. У каждого article показать readiness: data completeness, BOM, sample, publish, handoff.

### 4.2. Brand - sample_collection

Что хорошо:

- Linesheets, showroom, publish и audit log уже есть.
- Есть unified audit path и cross-role путь к shop matrix.

Что плохо:

- Linesheets и showroom частично дублируют смысл.
- Нет inline preview matrix.
- Empty PDF edge cases не закрыты.
- Audit log не на W2 hub.
- Mini vs full page дублируются.

Что делать до 10:

1. Сделать единый publishing cockpit: draft -> linesheet -> showroom -> shop matrix.
2. Добавить matrix peek modal для бренда.
3. Закрыть UAT linesheet -> showroom diff.
4. Синхронизировать counts mini/full.
5. Audit log показывать там, где действие произошло: W2 hub и linesheets.

### 4.3. Brand - collection_order

Что хорошо:

- Реестр B2B из PG, dynamic collection filter, export CSV/JSON.
- Карточка заказа богата: facts, chain, disclosure, chat, handoff.
- Retailers уже получают tier и multi-buyer discovery.

Что плохо:

- Pre-orders отдельным маршрутом вне golden chain.
- Display names частично preset для `shop1`.
- Полная цепочка спрятана за отдельной ссылкой.
- Multi-buyer filter слабый в hub.

Что делать до 10:

1. Один B2B order cockpit вместо набора registry/detail/preorder.
2. Multi-buyer picker в hub.
3. Partner names из PG CRM metadata.
4. Полная цепочка заказа на карточке без необходимости "искать ссылку".
5. Prebook/preorder встроить как status/phase заказа, не отдельный мир.

### 4.4. Brand - order_production

Что хорошо:

- Handoff, ERP retry, chain-status, PO id, factory links уже выглядят как настоящий core.
- Есть bulk handoff и production registry focus.

Что плохо:

- Нет auto-retry ERP после bulk handoff.
- Дублируются chain card и order facts.
- Дублируется dossier CTA/context strip.
- Дублируется аудит с brand-co-registry.
- BOM preview дублирует order detail/registry.

Что делать до 10:

1. Единая production timeline на заказ: confirm -> handoff -> PO -> materials -> production -> shipment.
2. ERP retry backoff после bulk handoff.
3. Один chain card как source of truth.
4. Handoff registry и order registry объединить через фильтр, а не отдельные смыслы.
5. Factory queue status должен быть visible прямо в Brand order cockpit.

### 4.5. Brand - comms

Что хорошо:

- Есть contextual thread по B2B order и workshop article.
- Есть section groups, read state, unread, deep links.
- Это один из самых зрелых коммс-слоев.

Что плохо:

- Нет пользовательских шаблонов.
- W2 drawer unread poll-only.
- Нет drag слотов календаря.
- Calendar tasks memory-only when PG URL unset.
- Poll fallback при недоступном SSE.

Что делать до 10:

1. Единый Brand inbox по order/article/PO.
2. User templates + team templates.
3. Calendar slot create -> automatic thread.
4. PG calendar task store mandatory for core.
5. Redis/SSE registry bump for production mode.

## 5. Shop audit

### 5.1. Shop - sample_collection

Что хорошо:

- Showroom, partners, matrix entry и cabinet mini уже связаны.
- Витрина ведет в матрицу, это правильный buyer journey.

Что плохо:

- Не все партнеры имеют live collections в PG.
- Нет inline qty edit на карточке витрины.
- Mini vs full showroom дублируются.
- Cover hero vs partner PG может рассинхрониться.

Что делать до 10:

1. Partner onboarding до live collection.
2. Inline size/qty picker прямо на showroom card.
3. One showroom source of truth для mini/full.
4. Показать "ready for order" status по каждой коллекции.
5. Shop должен видеть не просто витрину, а buy readiness.

### 5.2. Shop - collection_order

Что хорошо:

- Это самый сильный столп Shop.
- Matrix -> checkout -> B2B order является monetization moment.
- Buyer tracking имеет высокий live score 8.1.
- Visibility policy для buyerView - зрелое решение.

Что плохо:

- Matrix зависит от seed.
- Нет multi-collection matrix.
- Резерв на checkout фейковый до handoff.
- Новый buyer без заказов получает только onboarding CTA.
- Есть дубли audit с production registry/status.
- Нет batch acknowledge delivery.

Что делать до 10:

1. Multi-collection seasonal matrix.
2. Real inventory reserve только после handoff/WMS signal.
3. Buyer CRM/invite flow для новых партнеров.
4. Delivery acknowledge batch.
5. Order edit/amend policy со статусами: до confirm, после confirm, после production.
6. Checkout должен создавать не только order, но и системный comms/event trace.

### 5.3. Shop - order_production

Что хорошо:

- Tracking read-only и visibility redaction сделаны правильно.
- Магазин не должен видеть все factory детали по умолчанию.

Что плохо:

- Нет batch acknowledge.
- Дубли shop-co-detail и shop-op-order-status.
- Один URL с shop-co-registry.
- ETA есть на карточке заказа, но не в hub.
- Push при materials слабый.

Что делать до 10:

1. Единый buyer tracking cockpit.
2. Batch acknowledge delivery.
3. ETA, shipment, materials и PO milestone в hub.
4. Push/SSE при `materials_supplied`, `inventory_reserved`, shipment.
5. Убрать дубли registry/detail, оставить разные views одного заказа.

### 5.4. Shop - comms

Что хорошо:

- Order chat, calendar, logistics layer и comms cabinet есть.
- Есть PG unread и registry SSE bump.

Что плохо:

- Нет notification center.
- Нет preview thread в calendar.
- Calendar logistics layer дублирует order layer.

Что делать до 10:

1. Notification center.
2. Calendar event dialog с preview thread.
3. Объединить scoring order/logistics calendar или сделать logistics popover.
4. Buyer SLA: "brand ответит до", "ship window confirmed".

## 6. Manufacturer audit

### 6.1. Manufacturer - development

Что хорошо:

- Dossier read-only и sample queue дают производству правильный ранний контекст.
- Manufacturer не редактирует состав, и это корректная роль.

Что плохо:

- Нет comment-only annotations.
- Нет e2e export meta.
- Factory dossier duplicate queue slot.
- Brand development шумит на карточке.
- Нет factory-scoped filter.
- Дубль nav.

Что делать до 10:

1. Read-only dossier + annotations, без редактирования состава.
2. Factory-scoped article filter.
3. Export TZ e2e.
4. Collapse duplicate sample queue.
5. Compact nav.

### 6.2. Manufacturer - order_production

Что хорошо:

- Handoff queue, production orders, dossier, materials и cabinet уже составляют рабочий заводской контур.
- Есть PO, ERP alert, MES strip, shop-floor bundle, chain context.

Что плохо:

- Bulk-ack дублируется с registry `/orders`.
- Нет MES e2e на EMPTY27.
- PDF bundle пока plain-text.
- WMS reserve live push слабый.
- Один article per procurement view.
- Queue snippet max 3.

Что делать до 10:

1. Один bulk-ack flow: panel быстро, registry подробно, но действие одно.
2. MES/ERP retry для all attention rows.
3. Настоящий PDF shop-floor bundle.
4. Multi-article procurement wizard.
5. WMS/materials SSE.
6. Factory order cockpit: incoming PO -> accepted -> in production -> materials -> QC -> ready.

### 6.3. Manufacturer - comms

Что хорошо:

- Order chat, article chat, calendar и cabinet есть.
- Calendar с tasks/orders/production - правильный слой.

Что плохо:

- Нет единого inbox по всем PO.
- Нет attach TZ из dossier.
- Нет Gantt.
- Нет strict e2e dedupe.

Что делать до 10:

1. Unified PO inbox.
2. Attach TZ from dossier.
3. Milestone Gantt.
4. E2E dedupe assert.
5. Reply templates для "уточнение состава", "сроки", "замена материала".

## 7. Supplier audit

### 7.1. Supplier - development

Что хорошо:

- BOM preview и materials development workspace уже есть.
- Supplier видит основу RFQ-free core.

Что плохо:

- Legacy suppliers hub вне core.
- Нет каталога материалов в nav.
- Price journal пуст без PG price events.
- Comms peer это alias к столпу 5.
- Нет SLA ответа.
- Fill-rate без критичности строк.

Что делать до 10:

1. Core material catalog.
2. Redirect legacy supplier hub into core.
3. Seed/PG events для price journal.
4. SLA timer на уточнение цены.
5. Weighted BOM completeness.
6. Alt material approval flow.

### 7.2. Supplier - order_production

Что хорошо:

- Procurement PATCH, BOM×PO progress, chain steps и handoff read есть.
- SupplierProcurementPillarCard уже агрегирует столп.

Что плохо:

- Нет WMS reserve на checkout.
- Multi-article wizard только demo article.
- Нет push notification бренду.
- Нет dedicated handoff-queue SSE.
- Три nav столпа order_production.

Что делать до 10:

1. Inventory reserve post-handoff.
2. Multi-article PO bundle.
3. Brand push/SSE при materials supplied.
4. Dedicated handoff queue subscription.
5. Навигацию order_production сократить до одного Supplier Procurement cockpit.

### 7.3. Supplier - comms

Что хорошо:

- Order chat, article chat, calendar logistics и comms cabinet есть.
- Delivery confirm event уже намечен.

Что плохо:

- Тонкий CRM.
- Нет quote card UI, только template.
- Нет map/logistics.
- Нет push.

Что делать до 10:

1. Quote card UI: price, MOQ, lead time, validity, alternative.
2. Supplier CRM mini-profile: rating, SLA, recent delays, certificates.
3. ETA/map overlay на delivery window.
4. Push notifications.
5. Supplier scorecard linked to procurement outcomes.

## 8. Empty / read-only cells

Read-only insight cells - правильное решение. Они не должны превращаться в пустоту.

Но нужно улучшить подачу:

- Shop development: добавить inline dossier preview.
- Manufacturer sample_collection: оставить статус коллекции и linesheet peer, но явно писать "не зона действия".
- Manufacturer collection_order: показывать expectation of PO, не имитировать B2B ownership.
- Supplier sample_collection: BOM peer context, без витринного шума.
- Supplier collection_order: forecast, но не "создание заказа".

До 10: read-only cells должны иметь свой UX-паттерн: "Context only", "Depends on role X", "Next action when available".

## 9. Что убирать или прятать

### Убрать из core path

- Дублирующие mini/full версии, если они не дают нового действия.
- Pre-orders как отдельный маршрут вне golden chain.
- Дубли registry/detail/status между `collection_order` и `order_production`.
- Supplier aliases, если они выглядят как отдельная функция, но ведут в тот же URL.
- Старые B2B страницы Shop, которые не участвуют в golden path.
- Brand Production demo-страницы, которые не связаны с B2B -> PO -> factory flow.
- Factory auctions/brands/customization/finance/staff как core entrance, если они не в 4×5.

### Оставить, но перенести в Advanced/Archive

- Shop B2B long tail: AI search, gamification, VIP room, whiteboard, social feed, tenders, trade shows.
- Brand production advanced: Gantt, nesting, milestones video, worker skills, QC app, subcontractor.
- Factory production advanced: auctions, customization, IoT monitoring, finance, staff.
- Academy/runway/client tools/admin.

### Объединить

- Linesheets + showroom publish into one publishing cockpit.
- Brand registry + production registry into one order registry with views.
- Shop order detail + production status into one buyer order cockpit.
- Supplier dev comms alias + supplier article chat.
- Calendar order/logistics layers into one calendar with filters, not separate audit scoring.

## 10. Что добавить

### Platform-level additions

1. Настоящая страница `/platform`.
2. Role/pillar drill-down.
3. Cell state: live, demo, read-only, blocked, broken.
4. Source-of-truth badge: PG, file-store, seed, localStorage, mock.
5. Cross-role trace viewer for one order.
6. "Why score is not 10" panel per cell.
7. Action ownership per cell: who can read, write, approve, confirm.

### Data / backend additions

1. PG-first core mode.
2. No silent demo fallback in core mode.
3. Outbox event for each key transition.
4. `orderId`, `poId`, `threadId`, `collectionId`, `articleId` discipline.
5. Delivery acknowledgement API.
6. Supplier quote API.
7. Inventory reserve API after handoff.
8. Calendar task PG store.

### UX additions

1. Core cockpit per role.
2. One timeline per order.
3. One inbox per role.
4. Notification center.
5. Clear empty states: no data, waiting for another role, demo only.
6. Batch actions with audit trail.
7. Context preview modals instead of endless navigation.

## 11. Golden path to build next

This is the path that should become perfect before adding more features:

1. Shop opens showroom.
2. Shop edits size/qty in matrix.
3. Shop checks out and creates B2B order.
4. Brand sees order in registry.
5. Brand confirms order.
6. Brand hands off to production.
7. Manufacturer sees PO in handoff queue.
8. Manufacturer accepts PO.
9. Supplier sees BOM/material request.
10. Supplier confirms materials.
11. Manufacturer sees materials supplied.
12. Shop sees allowed tracking according to visibility policy.
13. All roles see contextual chat/calendar events.
14. `/platform` shows this cell progress and trace.

Success criteria:

- one `orderId`;
- one `poId`;
- one `threadId` per context;
- all state transitions persisted;
- no silent demo fallback;
- e2e verifies all four roles.

## 12. Priority backlog

### P0 - unblock Platform Core integrity

1. Restore `/platform`.
2. Restore `platform-core-hub-matrix`.
3. Restore `platform-core-readiness-audit`.
4. Add explicit core cabinet route constants.
5. Add Platform Core strict typecheck.
6. Create one cross-role e2e for golden path.
7. Add source-of-truth badges to all core cells.

### P1 - remove the biggest product risks

1. Reduce Shop B2B core nav from 76 routes to 6-8 visible core entries.
2. Create Brand order cockpit.
3. Create Shop buyer tracking cockpit.
4. Create Manufacturer PO cockpit.
5. Create Supplier procurement cockpit.
6. Replace fake checkout reserve with post-handoff reserve.
7. Add delivery acknowledge batch.
8. Add notification center.
9. Move poll-only critical updates to SSE.

### P2 - make it feel enterprise-grade

1. Gantt for manufacturer.
2. Supplier quote card and scorecard.
3. Multi-collection seasonal matrix.
4. Multi-article PO bundle.
5. SLA timers and breach penalties.
6. Calendar drag slots.
7. Custom message templates.
8. Map/ETA logistics overlay.

## 13. What "10/10" means here

10/10 is not "more screens". It is:

- fewer, clearer screens;
- no dead ends;
- no fake state without badge;
- every action visible to the right other role;
- every key transition persisted and testable;
- one order timeline across all roles;
- navigation that teaches the user the operating model;
- demo mode honest, production mode strict.

The project should not add another 50 B2B pages. It should turn the existing 4×5 Platform Core into a reliable operating system.

## 14. What blocks Platform Core from being fast and high-quality

This section is about speed, clarity and maintainability. A platform can have many features and still feel slow, noisy or fragile if the boundaries are wrong.

### 14.1. Too many routes around the core path

Observed problem:

- `src/app/shop/b2b` has 76 page routes at shallow depth.
- `src/app/brand/production` and `src/components/brand/production` are very large and contain many advanced, demo, archive and production-experimental screens.
- Factory production also has many pages that are useful, but not all are core.

Why this hurts:

- Next dev/build has to reason about too many pages.
- Users cannot see the golden path.
- Engineers cannot tell what is core and what is archive.
- Audit scores get inflated because "there is a screen", even when the screen is not part of the core workflow.

What to do:

1. Core navigation must expose only the 4×5 matrix and the golden path.
2. All non-core pages must be moved behind `advanced`, `archive`, `labs` or `extensions`.
3. Every visible Platform Core page must answer one question: what role, what pillar, what section, what entity.

Target rule:

```text
/platform
  -> /platform/:role
  -> /platform/:role/:pillar
  -> /platform/:role/:pillar/:section
```

Everything else should be a linked support surface, not the main operating path.

### 14.2. Shared imports create hidden load

Observed problem:

Platform Core currently depends on broad shared layers:

- `@/lib/routes`
- `@/lib/b2b`
- `@/lib/order`
- `@/lib/production`
- `@/components/brand/production`
- `@/components/shop/b2b`
- `@/components/factory`

Why this hurts:

- A small Platform Core change can touch huge shared files.
- A role/pillar cell can accidentally import unrelated modules.
- Bundle boundaries are unclear.
- Typecheck scope becomes too wide.

What to do:

1. Create a dedicated namespace: `src/features/platform-core`.
2. Move only core contracts into it first.
3. Leave old shared modules behind compatibility adapters.
4. Forbid direct imports from archived zones into Platform Core.

Target rule:

```text
Platform Core can import:
- platform-core/*
- shared/ui primitives
- shared/domain primitives
- explicit adapters

Platform Core cannot import:
- academy/*
- runway/*
- client tools/*
- admin/*
- old long-tail shop/b2b pages
- old brand production demo panels
```

### 14.3. Data source ambiguity slows trust

Observed problem:

Core-related code mentions:

- PG
- file-store
- memory fallback
- localStorage
- seed
- B2B-DEMO
- EMPTY27
- placeholder/demo states

Why this hurts:

- Users and engineers cannot tell what is real.
- Product demos can accidentally look like production promises.
- Performance is harder to reason about because state can come from several places.

What to do:

1. Add a required `dataSource` contract for every Platform Core cell.
2. Show data source badges in `/platform`.
3. Block silent fallback in strict core mode.
4. Allow demo fallback only when the cell is marked `demo`.

Target cell state:

```ts
type PlatformCoreDataSource =
  | 'pg'
  | 'api'
  | 'file_store'
  | 'local_storage'
  | 'seed'
  | 'mock'
  | 'missing';

type PlatformCoreCellMode =
  | 'live'
  | 'demo'
  | 'read_only'
  | 'blocked'
  | 'archive_link';
```

### 14.4. Context strips are overused

Observed problem:

Many sections have context strips and peer links. That is useful, but it can become link-noise.

Why this hurts:

- Users click around instead of completing the workflow.
- The same entity appears in many places with slightly different framing.
- It creates repeated UI and repeated audit scoring.

What to do:

1. Each role/pillar/section should have one primary action.
2. Peer links should become preview drawers where possible.
3. Cross-role navigation should preserve entity context.
4. Repeated strips should be replaced by one entity timeline.

Target rule:

```text
One section = one job.
One entity = one timeline.
One action = one owner.
```

### 14.5. Build and type safety are too soft for core

Observed problem:

Next build currently ignores TypeScript and ESLint failures.

Why this hurts:

- Platform Core can break silently.
- Missing files/routes are harder to catch.
- Audit data can reference dead links.

What to do:

1. Keep global soft build if needed, but add strict Platform Core checks.
2. Add route existence validation for every audit `resolveHref`.
3. Add import boundary validation.
4. Add missing-file guard for Platform Core dependencies.

Target scripts:

```json
{
  "typecheck:platform-core": "tsc --noEmit -p tsconfig.platform-core.json",
  "validate:platform-core-routes": "tsx scripts/validate-platform-core-routes.ts",
  "validate:platform-core-boundaries": "tsx scripts/validate-platform-core-boundaries.ts"
}
```

## 15. What was collected into the split folders

The current split is non-destructive. It uses source links, not physical moves.

### 15.1. Collected under `_platform-core-split/platform-core`

These are the things that should become the future Platform Core ownership area.

Audit and readiness:

- `source-links/readiness-sections`
- `source-links/readiness-barrel.ts`
- `source-links/role-hub-matrix.ts`

Core docs:

- `source-links/core-operating-chain.md`
- `source-links/core-product-deep-plan.md`
- `source-links/cross-role-flows.md`
- `source-links/cabinet-interaction-architecture.md`

Core policies:

- `source-links/shop-production-visibility.ts`
- `source-links/shop-production-visibility-repository.ts`
- `source-links/shop-production-visibility-api-route.ts`

Core repositories and routing:

- `source-links/workshop2-b2b-orders-repository.ts`
- `source-links/routes.ts`

Core APIs:

- `source-links/api-b2b`
- `source-links/api-workshop2`
- `source-links/api-processes`
- `source-links/api-ops-domain-events`

Core app surfaces:

- `source-links/app-brand-b2b-orders`
- `source-links/app-brand-production`
- `source-links/app-shop-b2b`
- `source-links/app-factory-production`
- `source-links/app-factory-supplier`
- `source-links/app-factory-calendar`

Core components:

- `source-links/components-b2b`
- `source-links/components-brand-b2b-orders`
- `source-links/components-brand-production`
- `source-links/components-shop-b2b`
- `source-links/components-factory`
- `source-links/components-cabinet`

Core libraries:

- `source-links/lib-b2b`
- `source-links/lib-order`
- `source-links/lib-production`

Core e2e:

- `source-links/e2e-b2b-create-order-platform-export-ui.spec.ts`
- `source-links/e2e-b2b-export-order-api.spec.ts`
- `source-links/e2e-b2b-operational-orders-api.spec.ts`
- `source-links/e2e-cabinet-hubs-smoke.spec.ts`
- `source-links/e2e-domain-events-health-api.spec.ts`
- `source-links/e2e-factory-sidebar-snapshot.spec.ts`
- `source-links/e2e-processes-workflow-api.spec.ts`
- `source-links/e2e-production.spec.ts`

### 15.2. Collected under `_platform-core-split/legacy-rest`

These are not part of the current Platform Core focus. They should be archived, hidden from core navigation or accessed only through explicit adapters.

Root / backend / general:

- `source-links/root-fastapi-app`
- `source-links/root-tests`
- `source-links/root-docs`
- `source-links/root-tools`
- `source-links/root-scripts`
- `source-links/root-static`

Non-core app surfaces:

- `source-links/app-admin`
- `source-links/app-academy`
- `source-links/app-brand-academy`
- `source-links/app-client-tools`

Non-core APIs:

- `source-links/api-ai`
- `source-links/api-runway`
- `source-links/api-client`

Non-core source/components:

- `source-links/src-ai`
- `source-links/lib-platform-client-tools`
- `source-links/components-admin`
- `source-links/components-academy`
- `source-links/components-client`
- `source-links/components-runway`
- `source-links/components-home`
- `source-links/components-distributor`
- `source-links/components-wardrobe`

## 16. How to break links without breaking Platform Core

The goal is not to delete everything. The goal is to remove accidental coupling.

### 16.1. Three categories for every dependency

Every file linked to Platform Core must be classified:

| Category | Meaning | Action |
| --- | --- | --- |
| Core-owned | Needed by 4×5 Platform Core and golden path. | Move into `src/features/platform-core`. |
| Shared primitive | Generic UI/domain utility with no business ownership. | Move into `src/shared` or keep in existing shared layer with strict imports. |
| Archive/legacy | Not needed by 4×5 core. | Move behind archive routes or leave outside Platform Core with no direct import. |

### 16.2. The most important boundary rule

Platform Core must not import pages from archive zones.

Bad:

```ts
import { Something } from '@/components/brand/production/SomeDemoPanel';
import { Something } from '@/components/runway/...';
import { Something } from '@/components/client/...';
```

Good:

```ts
import { BrandOrderCockpit } from '@/features/platform-core/roles/brand/collection-order';
import { Button } from '@/components/ui/button';
import { formatRub } from '@/shared/format/money';
```

### 16.3. Use adapters for old routes

Old routes should stay for compatibility, but become wrappers:

```text
src/app/brand/b2b-orders/page.tsx
  -> imports BrandCollectionOrderPage from platform-core

src/app/shop/b2b/matrix/page.tsx
  -> imports ShopMatrixPage from platform-core

src/app/factory/production/orders/page.tsx
  -> imports ManufacturerProductionOrdersPage from platform-core
```

This lets old URLs work, but the source of truth becomes Platform Core.

### 16.4. Use archive redirects for non-core routes

Old non-core pages should be moved under archive or advanced namespaces:

```text
/shop/b2b/gamification       -> /archive/shop/b2b/gamification
/shop/b2b/social-feed        -> /archive/shop/b2b/social-feed
/shop/b2b/vip-room-booking   -> /archive/shop/b2b/vip-room-booking
/brand/production/milestones-video -> /archive/brand/production/milestones-video
/factory/production/auctions -> /archive/factory/production/auctions
```

They can still exist, but they must not load in Platform Core navigation or Platform Core bundles.

## 17. Target Platform Core folder structure

Future physical structure:

```text
src/features/platform-core/
  index.ts
  platform-page/
    PlatformCorePage.tsx
    PlatformCoreMatrix.tsx
    PlatformCoreCell.tsx
    PlatformCoreTraceDrawer.tsx
  contracts/
    roles.ts
    pillars.ts
    sections.ts
    entities.ts
    scores.ts
    data-source.ts
  routes/
    platform-core-routes.ts
    platform-core-hrefs.ts
    legacy-route-adapters.ts
  audit/
    readiness-audit.ts
    readiness-sections/
      brand.ts
      shop.ts
      manufacturer.ts
      supplier.ts
      empty-cells.ts
  roles/
    brand/
      development/
      sample-collection/
      collection-order/
      order-production/
      comms/
    shop/
      development-readonly/
      sample-collection/
      collection-order/
      order-production/
      comms/
    manufacturer/
      development/
      sample-collection-readonly/
      collection-order-readonly/
      order-production/
      comms/
    supplier/
      development/
      sample-collection-readonly/
      collection-order-readonly/
      order-production/
      comms/
  entities/
    order/
    po/
    article/
    collection/
    thread/
  services/
    b2b-order-service.ts
    production-chain-service.ts
    supplier-procurement-service.ts
    visibility-policy-service.ts
    comms-thread-service.ts
  server/
    repositories/
    events/
    policies/
  tests/
    platform-core-golden-path.spec.ts
```

Target rule:

```text
Role -> Pillar -> Section -> Entity -> Service
```

Nothing should bypass this hierarchy.

## 18. What should move into Platform Core

### 18.1. Must move

Move these into `src/features/platform-core` because they define the core model:

- `platform-core-readiness-sections`
- `platform-core-shop-production-visibility`
- `workshop2-shop-production-visibility-repository`
- core route/href builders
- Platform Core demo context
- Platform Core role/pillar types
- Platform Core readiness audit
- Platform Core hub matrix

### 18.2. Should move as role-owned modules

Brand:

- Brand B2B order registry/detail/handoff pieces.
- Brand W2 article/dossier pieces needed by development and order production.
- Brand comms/calendar context builders for core entities.

Shop:

- Showroom -> matrix -> checkout -> order registry -> tracking.
- Buyer visibility policy UI.
- Buyer order tracking cockpit.

Manufacturer:

- Handoff queue.
- Production orders.
- Factory dossier read-only.
- Materials read view.
- Manufacturer PO inbox and calendar.

Supplier:

- BOM preview.
- Materials/procurement workspace.
- Supplier confirmation flow.
- Supplier comms/quote/logistics.

### 18.3. Should remain shared

These should not be owned by Platform Core unless they become core-specific:

- basic UI primitives;
- money/date formatting;
- generic table primitives;
- generic auth/session;
- generic API client helpers;
- generic toast/dialog components.

### 18.4. Should not move into Platform Core

These should remain outside and be archive/advanced:

- Runway.
- Academy.
- Client tools.
- Admin.
- AI playgrounds.
- Wardrobe.
- Home/marketing surfaces.
- Distributor, until distributor becomes explicit Platform Core role.
- Long-tail Shop B2B experiments.
- Brand Production advanced demo screens not used by golden path.
- Factory advanced pages not used by PO execution.

## 19. What should be archived or disconnected

### 19.1. Shop B2B long tail

Archive or hide from core:

- gamification;
- social-feed;
- vip-room-booking;
- video-consultation;
- whiteboard;
- tenders;
- trade-shows;
- sales-rep-portal;
- supplier-discovery;
- rating;
- AI smart order/search if not connected to core order flow;
- multiple order modes if they do not converge into the same checkout/order entity.

Keep in core:

- showroom;
- partners/discover only if it leads to live collection;
- matrix;
- checkout;
- orders registry/detail;
- tracking;
- calendar;
- messages/comms.

### 19.2. Brand Production long tail

Archive or advanced:

- milestones-video;
- worker-skills;
- ready-made;
- subcontractor;
- nesting if not part of PO execution;
- gold-sample if not connected to article readiness;
- old QC app if it does not feed PO/status;
- advanced cost/finance panels not needed in golden path.

Keep in core:

- W2 hub;
- article dossier;
- BOM/composition;
- range planner if connected to article/order;
- B2B order handoff;
- production chain;
- factory dossier peer link;
- core comms/calendar.

### 19.3. Factory Production long tail

Archive or advanced:

- auctions;
- brands catalog;
- customization;
- finance;
- staff;
- iot-monitoring unless it feeds production status;
- documents if not linked to PO/TZ bundle.

Keep in core:

- handoff queue;
- production orders;
- dossier;
- materials;
- shop-floor;
- calendar;
- messages;
- inventory only if it feeds materials/shipments.

### 19.4. Supplier long tail

Archive or advanced:

- circular-hub as demo unless backed by real procurement/logistics data.

Keep in core:

- supplier cabinet;
- BOM;
- material catalog;
- procurement;
- supplier messages;
- delivery calendar;
- supplier quote card.

## 20. Link-cutting waves

### Wave 0 - document and freeze

Goal: stop adding new noise.

Actions:

1. Mark current `_platform-core-split` as the working boundary.
2. Add a rule: no new Platform Core feature outside Platform Core boundary.
3. No new Shop B2B route unless it maps to a role/pillar/section.
4. No new Brand Production page unless it maps to a role/pillar/section.

Exit criteria:

- Every Platform Core feature has role, pillar, section and entity.

### Wave 1 - restore missing core contracts

Goal: make Platform Core compile conceptually.

Actions:

1. Restore/create `platform-core-hub-matrix`.
2. Restore/create `platform-core-readiness-audit`.
3. Add `ROUTES.brand.coreCabinet`.
4. Add `ROUTES.shop.coreCabinet`.
5. Add `ROUTES.factory.productionCoreCabinet`.
6. Add `ROUTES.factory.supplierCoreCabinet`.
7. Add `/platform`.

Exit criteria:

- `/platform` opens.
- It renders 4 roles × 5 pillars.
- It can drill into section details.

### Wave 2 - create Platform Core namespace

Goal: stop importing from broad old areas.

Actions:

1. Create `src/features/platform-core`.
2. Move pure contracts first.
3. Add re-exports from old paths.
4. Add import boundary check.

Exit criteria:

- Audit/roles/pillars/types live under `src/features/platform-core`.
- Old imports still work through re-export.

### Wave 3 - move role/pillar modules

Goal: make roles and pillars own their UI.

Actions:

1. Move Brand order cockpit.
2. Move Shop order cockpit.
3. Move Manufacturer PO cockpit.
4. Move Supplier procurement cockpit.
5. Keep old pages as wrappers.

Exit criteria:

- Old URLs render Platform Core components.
- New Platform Core route renders same components.

### Wave 4 - archive long tail

Goal: remove load from the core.

Actions:

1. Add archive route group.
2. Redirect or hide non-core pages.
3. Remove non-core routes from core navigation.
4. Add "advanced" links only from relevant section drawers.

Exit criteria:

- Core navigation shows only the 4×5 model.
- Long-tail pages do not appear as Platform Core sections.

### Wave 5 - strict data and event model

Goal: kill demo ambiguity.

Actions:

1. Add `PlatformCoreDataSource`.
2. Add source badges.
3. Add strict core mode.
4. Disable silent fallback in strict mode.
5. Add outbox events for key state changes.

Exit criteria:

- Every cell says whether it is PG/API/file-store/localStorage/seed/mock.
- Golden path has persisted event trace.

### Wave 6 - performance cleanup

Goal: make core fast.

Actions:

1. Lazy-load advanced drawers.
2. Keep `/platform` bundle matrix-first.
3. Do not import heavy Brand Production modules into matrix view.
4. Load section details only when opened.
5. Split role cockpits by route.

Exit criteria:

- `/platform` loads the matrix and scores without loading all role workspaces.
- Opening a cell loads only that role/pillar/section.

## 21. Required boundary checks

Add checks that fail when Platform Core grows wrong links.

### 21.1. Import boundary check

Fail if `src/features/platform-core` imports:

- `src/app/admin`
- `src/app/academy`
- `src/app/client`
- `src/app/api/runway`
- `src/components/runway`
- `src/components/client`
- `src/components/admin`
- `src/components/academy`
- `src/components/wardrobe`
- old long-tail shop routes

### 21.2. Route boundary check

Every Platform Core route must map to:

- role;
- pillar;
- section;
- entity type.

Fail if a core nav item has no mapping.

### 21.3. Data source check

Every cell must declare:

- data source;
- owner role;
- write role;
- read roles;
- demo/live status;
- next action.

### 21.4. Dead link check

Every `resolveHref` in readiness audit must point to:

- existing route;
- explicit archive route;
- or external adapter with reason.

## 22. Final target: no extra load, only role/pillar/section links

The clean Platform Core should feel like this:

```text
Platform
  Brand
    Development
      W2 Hub
      Article Dossier
      Range Planner
    Sample Collection
      Linesheet / Showroom Publishing
    Collection Order
      Brand Order Cockpit
    Order Production
      Handoff / Chain / PO
    Comms
      Brand Entity Inbox

  Shop
    Development Read-only
      Brand Dossier Preview
    Sample Collection
      Showroom / Partners
    Collection Order
      Matrix / Checkout / Orders
    Order Production
      Buyer Tracking
    Comms
      Buyer Inbox / Calendar

  Manufacturer
    Development
      Dossier Read-only / Sample Queue
    Sample Collection Read-only
      Collection Status
    Collection Order Read-only
      PO Expectation
    Order Production
      PO Cockpit / Shop-floor
    Comms
      Manufacturer PO Inbox

  Supplier
    Development
      BOM / Material Catalog
    Sample Collection Read-only
      BOM Context
    Collection Order Read-only
      Forecast
    Order Production
      Procurement Cockpit
    Comms
      Quote / Delivery / Inbox
```

Anything outside this tree must be either:

- shared primitive;
- archive;
- advanced extension;
- external integration adapter.

Nothing else should directly load into Platform Core.

## 23. Performance and UI standard addendum

Detailed performance and UX cleanup is tracked in:

- `PERFORMANCE-UX-CLEANUP-2026-06-21.md`
- `PLATFORM-CORE-UI-STANDARD.md`

The key rule: `/platform` must not load heavy workspaces by default. It must render a light matrix first, then lazy-load role/pillar/section details only after user intent.

The visual rule: Platform Core must look like a conservative operating system, not a marketing page. Calm colors, compact cells, one primary action, short text, no decorative noise.

## 24. Consolidated performance and UX logic

This section is the integrated source of truth. It captures the product logic now required for Platform Core:

Platform Core must be fast for developers, light for Cursor, clear for operators, and convincing for investors. It must not look like a collection of demos. It must look like a calm operating system where every visible block has a job.

The user's core rule:

```text
Only show actions that lead to another action or to a final result.
Everything else is noise, archive, advanced, or debug.
```

This changes the product direction. Platform Core should stop being "all capabilities visible at once" and become:

```text
Role -> Pillar -> Section -> Entity -> Action -> Result
```

Anything outside that chain must not be loaded into `/platform`.

## 25. What makes the project heavy and slow

### 25.1. Heavy zones by actual metrics

| Zone | Files | Lines | Size | Why it hurts Platform Core |
| --- | ---: | ---: | ---: | --- |
| `src/components/brand/production` | 460 | 98,948 | 3.9 MB | The heaviest related zone. It must not be imported as a whole by Platform Core. |
| `src/app/brand/production` | 211 | 18,936 | 718 KB | Too many pages, demo/local state and advanced production tools. |
| `src/app/shop/b2b` | 86 | 16,726 | 669 KB | Too many route pages; the core buyer flow gets buried. |
| `src/lib/platform-core-readiness-sections` | 7 | 2,103 | 90 KB | Acceptable as audit data, but it should not keep growing in one place. |
| `src/app/factory/production` | 20 | 2,979 | 122 KB | Moderate, but long-tail factory pages should be separated. |
| `src/components/factory` | 5 | 1,343 | 53 KB | Acceptable, but dashboards should be smaller. |
| `src/app/factory/supplier` | 4 | 863 | 35 KB | Acceptable, except `circular-hub` is demo unless backed by real data. |

### 25.2. Heavy files that should not constantly enter Cursor context

| File | Lines | Size | Required action |
| --- | ---: | ---: | --- |
| `package-lock.json` | 29,441 | 1.0 MB | Ignore in Cursor; never inspect unless dependency issue. |
| `src/lib/production/data/attribute-catalog.instance.json` | 20,750 | 692 KB | Ignore; load through API/loader. |
| `src/lib/production/generated/category-handbook.snapshot.json` | 11,990 | 418 KB | Ignore; generated snapshot. |
| `src/data/world-topo.json` | 10,685 | 191 KB | Ignore; not Platform Core. |
| `src/lib/product-attributes.ts` | 5,729 | 240 KB | Split/archive from core context. |
| `src/lib/data/category-handbook.ts` | 3,362 | 139 KB | Do not import into `/platform` directly. |
| `src/lib/production/workshop2-live-integration-probes.ts` | 3,119 | 108 KB | Move to lazy/server diagnostics. |
| `public/data/feature-registry.json` | 2,930 | 170 KB | Not core. |
| `src/components/brand/production/Workshop2Phase1DossierPanel.tsx` | 2,930 | 110 KB | Split urgently. |
| `src/components/brand/production/Workshop2ArticleWorkspace.tsx` | 2,598 | 104 KB | Split into shell + lazy tabs. |
| `src/app/brand/production/tech-pack/[id]/page.tsx` | 2,072 | 110 KB | Move to advanced/archive wrapper. |
| `src/components/brand/production/Workshop2TabContent.tsx` | 1,893 | 77 KB | Split by sections/pillars. |
| `src/components/brand/production/CategorySketchAnnotator.tsx` | 1,787 | 67 KB | Lazy-load only inside development section. |
| `src/providers/b2b-state.tsx` | 1,559 | 50 KB | Split state into session/cart/orders/ui slices. |
| `src/app/shop/b2b/orders/[orderId]/page.tsx` | 1,034 | 46 KB | Turn into thin wrapper over buyer order cockpit. |

### 25.3. Cursor load policy

The heavy Platform Core / Workshop2 files were added to `_ai-share/synth-1-full/.cursorignore`.

This does not delete code. It prevents constant indexing of huge files that slow down Cursor and consume context.

If a developer needs a file, open it manually. It should not always be part of the default AI context.

### 25.4. File size rules for future Platform Core work

| File type | Limit | Rule |
| --- | ---: | --- |
| UI component | 250 lines | If bigger, split into panels. |
| Page wrapper | 120 lines | Page should wire data and render a cockpit. |
| Role cockpit | 350 lines | If bigger, split by section. |
| Section panel | 220 lines | One section = one task. |
| Data fixture | 200 lines | Bigger data goes to JSON/loader/seed. |
| Audit data per role | 500 lines | Bigger role audit splits by pillar. |
| Server repository | 450 lines | Bigger repo splits into read/write/policy. |

Files currently violating the spirit of these rules:

- `Workshop2Phase1DossierPanel.tsx`
- `Workshop2ArticleWorkspace.tsx`
- `Workshop2TabContent.tsx`
- `CategorySketchAnnotator.tsx`
- `Workshop2SampleBaseSizeBlock.tsx`
- `SkuProcessDetailPanel.tsx`
- `src/app/brand/production/tech-pack/[id]/page.tsx`
- `src/app/shop/b2b/orders/[orderId]/page.tsx`
- `src/providers/b2b-state.tsx`

## 26. Platform Core must be matrix-first and lazy

### 26.1. First screen rule

`/platform` must render a light matrix first.

Allowed on the first screen:

- role/pillar metadata;
- scores;
- statuses;
- source badges;
- counters;
- short labels;
- primary actions;
- lazy drawers.

Forbidden on the first screen:

- full Workshop2 workspace;
- full B2B order page;
- full production dossier;
- full category handbook;
- generated snapshots;
- charts with huge datasets;
- long descriptions;
- decorative investor blocks;
- advanced tools.

### 26.2. Cell details rule

Cell click should work like this:

```text
open drawer -> load role/pillar/section summary -> show primary action -> action opens workspace only when needed
```

Heavy workspaces must load after user intent, not during initial `/platform` render.

### 26.3. Old pages as wrappers

Old pages should become compatibility wrappers:

```tsx
export default function Page() {
  return <BrandOrderCockpit />;
}
```

The real logic should move to `src/features/platform-core`.

Old URLs can remain, but Platform Core should own the components.

## 27. Unified UI logic for Platform Core

### 27.1. Product identity

Platform Core is not:

- a landing page;
- a feature catalog;
- a demo showcase;
- a dashboard wall;
- a marketing surface.

Platform Core is:

- a calm operating system;
- a role-based action map;
- a compact matrix of work;
- an investor-readable proof of product logic;
- an operator-readable workflow surface.

### 27.2. Visual tone

The required visual tone:

- calm;
- conservative;
- high-quality;
- restrained;
- unified;
- readable on iPhone, iPad and MacBook;
- not flashy;
- not noisy;
- not over-decorated.

### 27.3. Design rules

| Parameter | Rule |
| --- | --- |
| Color | Neutral background, one main accent, quiet statuses. |
| Typography | Compact, readable, no hero-scale type inside working panels. |
| Cards | Only for cells/rows/repeated items. No card-in-card. |
| Radius | Up to 8px. |
| Shadows | Minimal or none. |
| Icons | Only for actions/status, never decoration. |
| Text | Short. 1-2 lines. No explanations unless in drawer. |
| Data | Every important value has a source badge. |
| Actions | One primary action per block. |

### 27.4. What must be removed from UI

Remove from core:

- long feature descriptions;
- hero blocks;
- decorative charts;
- marketing copy;
- repeated context strips;
- "all features" sections;
- inactive demo buttons;
- different card styles per role;
- routes that do not lead to order/PO/materials/tracking/comms;
- charts with no next action;
- investor language without operational meaning.

Keep in core:

- status;
- source;
- action;
- owner;
- next step;
- result;
- short cross-role link;
- timeline evidence.

## 28. Responsive Platform Core rules

### 28.1. iPhone

On iPhone:

- one column;
- role switcher at the top;
- pillars as compact tabs;
- cells as a list, not a wide matrix;
- only status + action + next step visible;
- drawer opens fullscreen;
- no tables wider than screen;
- no long explanations.

### 28.2. iPad

On iPad:

- master-detail layout;
- role/pillar list on the left;
- selected section on the right;
- section actions visible without deep scrolling;
- tables only in compact mode;
- timeline can be horizontal if readable.

### 28.3. MacBook

On MacBook:

- 4×5 matrix can be shown;
- right side detail drawer;
- bottom trace strip or entity timeline;
- no more than 3 visual hierarchy levels;
- no full workspace import until click.

## 29. Required component templates

### 29.1. Platform shell

```text
PlatformShell
  PlatformHeader
  RoleSwitcher
  PillarTabs
  CoreMatrix
  CellDetailDrawer
  EntityTimeline
```

### 29.2. Cell template

Every cell should use one template:

```text
Role + Pillar
Status
Score
Source
Primary action
Next event
```

Maximum two lines of copy.

If more explanation is needed, it goes into the drawer.

### 29.3. Section drawer template

```text
Title
Short meaning
Current state
Primary action
Secondary action
Last event
Owner
Source
Problem
Next fix
```

If there is no primary action, the section must be marked:

- read-only;
- blocked;
- demo;
- archive;
- or context-only.

It must not pretend to be active.

### 29.4. Action taxonomy

Every visible action must belong to one of these types:

- create;
- confirm;
- handoff;
- acknowledge;
- assign;
- message;
- schedule;
- export;
- view evidence;
- resolve issue.

If an action does not fit this list, it is probably not core.

## 30. Copywriting rules

Write short operational copy.

Good:

- "Заказ ожидает подтверждения"
- "Передать в производство"
- "Материалы подтверждены"
- "Открыть трекинг"
- "Написать по заказу"
- "Назначить поставщика"
- "Подтвердить отгрузку"
- "Посмотреть событие"

Bad:

- long explanations of how Platform Core works;
- investor promises;
- "unique system";
- "revolutionary module";
- "AI-powered transformation";
- any text that does not help the next action.

## 31. Heavy file refactor plan

### 31.1. `Workshop2Phase1DossierPanel.tsx`

Problem: 2930 lines.

Refactor into:

- `DossierPanelShell`
- `DossierPassportSection`
- `DossierBomSection`
- `DossierCompositionSection`
- `DossierConstructionSection`
- `DossierAssignmentSection`
- `DossierExportActions`
- `DossierReadinessSummary`

### 31.2. `Workshop2ArticleWorkspace.tsx`

Problem: 2598 lines.

Refactor into:

- `ArticleWorkspaceShell`
- `ArticleWorkspaceHeader`
- `ArticleWorkspaceTabs`
- `ArticleWorkspacePrimaryAction`
- lazy tabs by section.

### 31.3. `Workshop2TabContent.tsx`

Problem: 1893 lines.

Split by Platform Core pillars:

- development;
- sample collection;
- collection order;
- order production;
- comms.

### 31.4. `CategorySketchAnnotator.tsx`

Problem: heavy interactive tool.

Required behavior:

- do not load in `/platform`;
- show only a small preview in Platform Core;
- lazy-load full tool from development section;
- treat it as advanced workspace, not core matrix content.

### 31.5. `src/app/shop/b2b/orders/[orderId]/page.tsx`

Problem: 1034 lines for a page route.

Refactor:

- page wrapper down to 80-120 lines;
- move logic to `ShopBuyerOrderCockpit`;
- lazy-load status/tracking/comms panels.

### 31.6. `src/providers/b2b-state.tsx`

Problem: 1559 lines of broad state.

Split into:

- `b2b-cart-state`;
- `b2b-order-state`;
- `b2b-buyer-session-state`;
- `b2b-ui-state`;
- Platform Core imports only the needed slice.

## 32. Archive and advanced separation by product logic

### 32.1. Keep in core

Keep only what supports the golden path:

- Brand W2 hub;
- Brand article dossier;
- Brand B2B order cockpit;
- Brand handoff/PO chain;
- Shop showroom;
- Shop matrix;
- Shop checkout;
- Shop order/tracking cockpit;
- Manufacturer handoff queue;
- Manufacturer PO cockpit;
- Manufacturer shop-floor;
- Supplier BOM;
- Supplier procurement;
- Supplier quote/delivery;
- entity comms;
- entity calendar.

### 32.2. Move to archive or advanced

Move out of core:

- Shop gamification;
- Shop social feed;
- Shop VIP room;
- Shop whiteboard;
- Shop tenders;
- Shop trade shows unless tied to order;
- Shop sales rep portal unless tied to order;
- Brand milestones video;
- Brand worker skills;
- Brand ready-made;
- Brand subcontractor;
- Brand nesting if not tied to PO;
- Factory auctions;
- Factory customization;
- Factory finance;
- Factory staff;
- Supplier circular hub unless real data-backed.

### 32.3. Rule for deciding

Ask:

```text
Does this screen move an entity toward order, PO, materials, shipment, tracking or comms?
```

If no, it is not Platform Core.

## 33. Final UX acceptance criteria

Platform Core is acceptable only when:

- `/platform` on iPhone has no horizontal scroll;
- `/platform` on iPad has clear master-detail;
- `/platform` on MacBook shows the 4×5 model without visual noise;
- every visible cell has one primary next action;
- heavy workspaces are lazy-loaded;
- no archive/advanced routes appear as core;
- demo/fallback is always badged;
- all roles use the same visual system;
- all long descriptions are removed from the main surface;
- every block either leads to next action or is removed.

The strongest product decision is subtraction:

```text
If it does not lead to the next action, it leaves Platform Core.
```

## 34. Strategic development layer: what to add next

This section adds the next product layer on top of the audit above. The goal is not to add "more screens". The goal is to turn Platform Core into a calm, connected operating system where each role, pillar, section and process moves one shared business chain forward.

The current 4 roles and 5 pillars are the right frame:

- roles: Brand, Shop, Manufacturer, Supplier;
- pillars: development, sample_collection, collection_order, order_production, comms.

But the system will reach 10/10 only when these 20 cells stop feeling like separate dashboards and start behaving like one process.

The target behavior:

```text
Article -> Dossier -> Sample -> Published Collection -> Shop Matrix -> B2B Order
-> Brand Confirmation -> Production Handoff -> Factory PO -> Supplier Materials
-> Production/QC -> Shipment -> Shop Tracking -> Closeout
```

Every role sees only the part it owns, but every role sees enough context to understand what happened before and what must happen next.

### 34.1. The main product law

Every Platform Core block must pass this test:

```text
Input -> Owner -> Action -> Output -> Next owner -> Evidence
```

If a block has no input, it is decoration.

If it has no owner, it is vague.

If it has no action, it is a report, not an operating system.

If it has no output, it is a dead end.

If it has no next owner, it breaks the cross-role chain.

If it has no evidence, it is a demo.

### 34.2. What should be added carefully

Add only features that strengthen one of these five capabilities:

- readiness: can the next role safely act?
- commitment: did someone confirm a decision?
- handoff: did ownership move to the next party?
- trace: can we prove who did what and when?
- exception handling: what happens when the normal path breaks?

Anything outside these five capabilities should stay out of Platform Core until the operating chain is stable.

### 34.3. What should not be added yet

Do not add broad "AI assistant", "social", "feed", "marketplace", "analytics universe", "community", "gamification", "academy" or "advanced discovery" layers into Platform Core until the golden path is reliable.

These can be valuable later, but right now they would weaken the product by hiding the real operating story.

The investor and user should understand Platform Core in 30 seconds:

```text
This is where a collection becomes an order, an order becomes production,
production gets materials, and every role sees its next action.
```

## 35. Canonical business process map

Platform Core needs one canonical business map. The current project has many strong fragments, but the next step is to make the sequence explicit and enforce it through states, routes, events and UI.

### 35.1. Process stages

| Stage | Main owner | Supporting roles | Required entity | Output |
|---|---|---|---|---|
| 1. Collection planning | Brand | Shop as future buyer context | `collectionId` | Collection draft with season, channel and target |
| 2. Article/SKU creation | Brand | Manufacturer/Supplier as preview context | `articleId`, `skuId` | Article exists with variants and basic commercial data |
| 3. Dossier/TZ/BOM readiness | Brand | Manufacturer, Supplier | `dossierId`, `bomId` | Production-ready package or clear missing fields |
| 4. Sample request/review | Brand | Manufacturer, Supplier | `sampleId` | Sample status and approval decision |
| 5. Publishing to showroom | Brand | Shop | `collectionId`, `articleId` | Collection visible to buyers |
| 6. Shop assortment matrix | Shop | Brand | `matrixId` | Quantities, sizes, store/channel allocation |
| 7. Checkout/B2B order | Shop | Brand | `orderId` | Submitted buyer order |
| 8. Brand review/confirmation | Brand | Shop | `orderId` | Confirmed order or amendment request |
| 9. Production handoff | Brand | Manufacturer | `handoffId`, `poId` | Factory receives executable PO |
| 10. Factory acceptance | Manufacturer | Brand | `poId` | Factory accepts, rejects or requests clarification |
| 11. Supplier procurement | Supplier | Manufacturer, Brand | `bomId`, `rfqId`, `materialReservationId` | Material quote/reserve/delivery plan |
| 12. Production execution | Manufacturer | Supplier, Brand | `productionRunId`, `poId` | Cutting/sewing/QC/packing status |
| 13. Logistics/shipment | Manufacturer or Brand | Shop | `shipmentId` | ETA, tracking and shipment evidence |
| 14. Delivery acknowledgement | Shop | Brand | `deliveryId`, `orderId` | Buyer confirms receipt or opens issue |
| 15. Closeout/learning | Brand | all roles | `orderId` | Margin, delays, claims, lessons, next cycle |

This is the correct spine. All Platform Core cells should attach to this spine.

### 35.2. Required entity discipline

The system must stop relying on "screen context" and start relying on shared entity IDs.

Required IDs:

- `collectionId`: the seasonal/commercial container;
- `articleId`: the product model;
- `skuId`: sellable variant;
- `dossierId`: technical package;
- `bomId`: material structure;
- `sampleId`: sample and approval cycle;
- `matrixId`: buyer assortment matrix;
- `orderId`: B2B order;
- `handoffId`: brand-to-production transfer;
- `poId`: factory production order;
- `rfqId`: supplier quote request;
- `materialReservationId`: reserved/ordered materials;
- `productionRunId`: shop-floor execution;
- `shipmentId`: delivery chain;
- `threadId`: entity-based communication;
- `calendarEventId`: time-based commitment.

Every event, message, task and calendar item must include at least one of these IDs.

### 35.3. Required event model

Platform Core should have a small event contract:

```ts
type PlatformCoreEvent = {
  id: string;
  entityType:
    | 'collection'
    | 'article'
    | 'dossier'
    | 'sample'
    | 'matrix'
    | 'order'
    | 'handoff'
    | 'po'
    | 'rfq'
    | 'material'
    | 'productionRun'
    | 'shipment'
    | 'thread';
  entityId: string;
  actorRole: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  action: string;
  previousStatus?: string;
  nextStatus?: string;
  nextOwnerRole?: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  createdAt: string;
  evidenceHref?: string;
};
```

This gives Platform Core the missing proof layer. A user should be able to open one order trace and see the whole chain.

## 36. State machines that should control the logic

Without state machines, the product will keep creating duplicate pages and unclear buttons. Each role can have its own UI, but the underlying statuses must be shared.

### 36.1. Collection/article readiness states

```text
planned
-> article_created
-> dossier_in_progress
-> dossier_ready
-> sample_requested
-> sample_approved
-> published
-> orderable
```

Rules:

- Shop cannot order an article before `orderable`.
- Brand cannot publish as `orderable` without minimum dossier and commercial fields.
- Manufacturer can preview `dossier_in_progress`, but must not accept PO until `dossier_ready`.
- Supplier can preview BOM needs, but must not reserve final materials until BOM is locked or marked as provisional.

### 36.2. B2B order states

```text
draft
-> submitted
-> brand_review
-> amendment_requested
-> confirmed
-> handoff_ready
-> handed_off
-> in_production
-> materials_pending
-> materials_supplied
-> qc_ready
-> shipped
-> delivered
-> acknowledged
-> closed
```

Rules:

- `submitted` creates a thread and an event trace.
- `brand_review` belongs to Brand.
- `amendment_requested` returns action to Shop.
- `confirmed` creates readiness for handoff.
- `handed_off` creates or links `poId`.
- `in_production` must be visible to Shop only as buyer-safe status, not factory-internal noise.
- `closed` requires delivery acknowledgement or explicit exception.

### 36.3. Production/PO states

```text
created
-> accepted_by_factory
-> clarification_needed
-> materials_requested
-> materials_confirmed
-> cutting
-> sewing
-> finishing
-> qc
-> packed
-> ready_to_ship
-> shipped
```

Rules:

- Manufacturer owns PO execution after acceptance.
- Brand sees business-level status and exceptions.
- Shop sees promise/ETA/tracking, not internal MES detail by default.
- Supplier sees only material obligations and linked delivery requirements.

### 36.4. Supplier/material states

```text
bom_received
-> quote_needed
-> quote_sent
-> quote_approved
-> reserved
-> dispatched
-> received_by_factory
-> issue_reported
-> closed
```

Rules:

- Supplier work starts from BOM/PO context, not from a standalone supplier page.
- Quotes and reserves must be linked to `bomId` and `poId`.
- Late material risk must create a visible exception for Manufacturer and Brand.

### 36.5. Communication states

```text
thread_created
-> message_sent
-> decision_requested
-> decision_made
-> task_created
-> task_done
-> archived_with_entity
```

Rules:

- No important business decision should live only as text.
- A decision in chat must become a status, task, amendment, approval or exception.
- Every role inbox should group by entity, not by random channel.

## 37. Role and pillar roadmap to 10/10

The key point: not every role should do the same thing in every pillar. A 10/10 cell is not "full of features". A 10/10 cell has the right ownership level for that role.

### 37.1. Brand roadmap

| Pillar | What is good now | What blocks 10/10 | What to add next |
|---|---|---|---|
| `development` | Strong Workshop2/article/dossier world, deep product logic, rich production context. | Too heavy, too many fragments, some advanced tools load as core, readiness not strict enough. | Article creation wizard, dossier readiness gate, BOM lock/provisional mode, sample queue, compact article cockpit, exportable production package. |
| `sample_collection` | Publishing/showroom direction is correct. | Publishing, sample approval and shop matrix preview are not one cockpit. | Publishing cockpit: `draft -> sample approved -> linesheet -> showroom -> matrix-ready`; show buyer readiness and missing fields. |
| `collection_order` | B2B registry/order logic exists and has real commercial value. | Registry/detail/preorder/handoff can feel like separate worlds. | One Brand Order Cockpit with buyer, order lines, amendments, terms, confirmation, event trace and next action. |
| `order_production` | Handoff, PO, ERP retry, factory links are the strongest operational layer. | Duplicates between order facts, chain cards and registry; supplier/materials not always visible as one timeline. | One production timeline per order: confirmation -> handoff -> PO -> materials -> production -> QC -> shipment. |
| `comms` | Entity threads exist conceptually. | Threads, tasks, calendar and decisions are not yet one evidence layer. | Brand entity inbox by `articleId/orderId/poId`, decision templates, task conversion, calendar commitments. |

Brand should be the command center, but not the only owner. The Brand UI must show control without pretending to execute factory or supplier work itself.

### 37.2. Shop roadmap

| Pillar | What is good now | What blocks 10/10 | What to add next |
|---|---|---|---|
| `development` | Shop can be used as buyer-readiness context. | It should not become a second product-development system. | Read-only product readiness preview: what will be orderable, what is blocked, what commercial data is missing. |
| `sample_collection` | Showroom and matrix entry are strong. | The buyer does not always see why an article is or is not ready. | Buyer showroom with readiness badges, sample/linesheet context, collection filters and "request clarification". |
| `collection_order` | Matrix -> checkout -> B2B order is the monetization moment. | Too many B2B pages and experiments dilute the order path. | Seasonal matrix, size/qty editing, reserve policy, terms visibility, checkout that creates `orderId/threadId/event`. |
| `order_production` | Tracking exists as a direction. | Shop can see either too little context or too much factory detail. | Buyer Order Cockpit: confirmed quantities, ETA, shipment, delay reasons, acknowledgements and issue opening. |
| `comms` | Order-related comms exist. | Calendar/order/logistics layers can duplicate each other. | Shop inbox grouped by order, buyer-safe notifications, amendment decisions, delivery acknowledgement tasks. |

Shop should feel simple: choose, order, track, confirm. It should not see the whole production backend unless an exception needs explanation.

### 37.3. Manufacturer roadmap

| Pillar | What is good now | What blocks 10/10 | What to add next |
|---|---|---|---|
| `development` | Manufacturer can connect to dossier/sample logic. | It is not always clear what it owns before PO. | Factory feasibility annotations, sample capacity view, dossier clarification requests, factory-scoped filters. |
| `sample_collection` | Useful as supporting role. | Should not duplicate Brand sample ownership. | Read-only sample execution context with clear "needs clarification" action. |
| `collection_order` | Manufacturer can see future demand expectation. | It should not behave like a B2B order owner. | PO forecast panel: expected load, capacity warning, no buyer-order controls. |
| `order_production` | PO, handoff queue, dossier, materials, MES/shop-floor are strong. | Bulk ack/registry/shop-floor can feel scattered. | Factory PO Cockpit: incoming PO -> accept/clarify -> materials -> production -> QC -> ready to ship. |
| `comms` | Calendar/tasks/orders/production direction is right. | No single PO inbox and decisions may stay in chat. | Unified PO inbox, clarification workflow, Gantt/calendar commitments, issue escalation to Brand/Supplier. |

Manufacturer should be the execution cockpit. Its 10/10 is not more pages; it is faster acceptance, fewer unclear handoffs and stronger exception handling.

### 37.4. Supplier roadmap

| Pillar | What is good now | What blocks 10/10 | What to add next |
|---|---|---|---|
| `development` | Supplier can connect to materials/BOM. | Legacy supplier hub can feel outside the core chain. | Material catalog tied to BOM, price/MOQ/lead-time, provisional quote from article/dossier context. |
| `sample_collection` | Supplier context can support samples. | It should not become a separate sample platform. | Sample-material readiness: swatch/material availability, small-batch lead time, substitution suggestions. |
| `collection_order` | Forecast context is useful. | Supplier should not own buyer order creation. | Demand forecast from confirmed/likely order quantities, capacity and material risk preview. |
| `order_production` | Procurement PATCH, BOM×PO progress and chain steps are real core. | Multiple supplier nav entries and legacy routes dilute the cockpit. | Supplier Procurement Cockpit: RFQ, quote, reserve, dispatch, ETA, proof of delivery to factory. |
| `comms` | Quote card and supplier messages are useful. | Messages must become quotes, reserves, ETA updates or exceptions. | Supplier inbox by `bomId/poId/rfqId`, quote decision card, delay alerts, document/certificate upload. |

Supplier should feel like a precise procurement partner, not a separate marketplace. The core question is always: will materials arrive in time for this PO?

## 38. What each of the 20 cells needs to become 10/10

This table is the compact improvement map. It should be used as the working checklist for future phases.

| Role | Pillar | Target 10/10 behavior | Minimum missing work |
|---|---|---|---|
| Brand | development | Creates an article that can become orderable without rework. | Wizard, readiness gate, BOM/dossier lock, sample status, export package. |
| Brand | sample_collection | Publishes only what is ready and shows buyer readiness. | Publishing cockpit, matrix preview, missing-field prevention. |
| Brand | collection_order | Reviews, amends and confirms buyer orders from one cockpit. | Unified order cockpit, amendment flow, terms, event trace. |
| Brand | order_production | Sees every confirmed order through PO/materials/production/shipment. | One timeline, PO linkage, supplier/material visibility, exception cards. |
| Brand | comms | Converts discussions into decisions, tasks and status changes. | Entity inbox, decision templates, task/calendar coupling. |
| Shop | development | Understands upcoming product readiness without editing brand data. | Buyer-safe readiness preview and clarification request. |
| Shop | sample_collection | Browses collections and knows what can be bought. | Readiness badges, linesheet context, clear "orderable" state. |
| Shop | collection_order | Builds assortment matrix and submits real order. | Seasonal matrix, checkout, reserve policy, order trace. |
| Shop | order_production | Tracks order without factory noise. | Buyer order cockpit, ETA, shipment, issue/acknowledgement flow. |
| Shop | comms | Handles amendments, delays and delivery actions from order context. | Order inbox, notifications, delivery task, issue thread. |
| Manufacturer | development | Validates feasibility before production commitment. | Dossier comments, sample/capacity check, clarification request. |
| Manufacturer | sample_collection | Executes or comments on samples without owning brand publishing. | Sample task view and sample exception flow. |
| Manufacturer | collection_order | Sees expected demand and capacity impact. | Forecast/expected PO view, no direct B2B order controls. |
| Manufacturer | order_production | Accepts and executes PO through production. | PO cockpit, materials gate, shop-floor steps, QC, ready-to-ship. |
| Manufacturer | comms | Resolves PO clarifications and production exceptions. | PO inbox, Gantt/calendar, escalation to Brand/Supplier. |
| Supplier | development | Provides material feasibility and lead-time early. | Material catalog, MOQ/price/lead time, provisional quote. |
| Supplier | sample_collection | Supports sample materials and substitutions. | Swatch/sample-material status and substitution proposal. |
| Supplier | collection_order | Sees demand forecast without owning sales order. | Forecast from matrix/orders and material risk preview. |
| Supplier | order_production | Quotes, reserves and delivers materials for PO. | Procurement cockpit, RFQ, reserve, dispatch, delivery proof. |
| Supplier | comms | Turns messages into quotes, ETA updates or exceptions. | Supplier inbox, quote cards, delay alerts, document upload. |

## 39. Missing business processes that should be added

These are not decorative enterprise features. They are business processes that naturally belong to the chain and will eventually be expected by serious users and investors.

### 39.1. Organization and role permissions

Required:

- workspace/org model;
- user role inside organization;
- permissions per entity and action;
- audit log for approvals and changes;
- ability to invite partner to one order/PO/thread without exposing everything.

Why it matters:

Without RBAC, cross-role collaboration looks like a demo. Real companies need controlled visibility.

### 39.2. Partner onboarding

Required:

- Brand invites Shop/Manufacturer/Supplier;
- partner profile with capabilities, lead times, certificates and contacts;
- approval status: invited, active, suspended, archived;
- per-partner terms and document requirements.

Why it matters:

The current chain assumes partners exist. A 10/10 system shows how they enter the operating network.

### 39.3. Commercial terms and pricing

Required:

- price list by collection/article/shop tier;
- MOQ and pack size;
- delivery terms;
- payment terms;
- discount/markup rules;
- currency and tax assumptions.

Why it matters:

Shop checkout and Brand confirmation cannot be credible without terms.

### 39.4. Order amendments

Required:

- Shop requests quantity/date/article change;
- Brand approves/rejects/counters;
- accepted amendment updates order lines;
- amendment creates event and thread decision;
- downstream PO impact is shown.

Why it matters:

Real B2B orders change. If amendment is missing, users will leave the system and resolve changes in chat.

### 39.5. Cancellation and backorder

Required:

- cancellation request;
- partial cancellation;
- backorder creation;
- substitution proposal;
- impact on PO/material reservation.

Why it matters:

The chain must handle failure without becoming manual.

### 39.6. QC rejection and claims

Required:

- Manufacturer QC issue;
- Brand approval or rejection;
- Shop claim after delivery;
- photo/document evidence;
- resolution: rework, discount, replacement, cancel.

Why it matters:

Production systems become real when they handle defects, not only ideal flow.

### 39.7. Compliance and documents

Required:

- certificates per material/article/shipment;
- label/marking checklist;
- customs/export documents;
- document request and upload;
- document readiness badge before shipment.

Why it matters:

Supplier and Manufacturer need document workflows if Platform Core is meant to operate beyond mock orders.

### 39.8. Invoicing and payment status

Do not make full accounting now, but add lightweight status:

- invoice expected;
- invoice issued;
- payment due;
- payment received;
- payment blocked;
- payment dispute.

Why it matters:

Production and shipment decisions often depend on payment and terms. Even a lightweight status makes the system more credible.

### 39.9. SLA and exception management

Required:

- promised date per stage;
- current owner;
- risk status: on track, at risk, late, blocked;
- reason code;
- escalation owner;
- next recovery action.

Why it matters:

Without SLA, the matrix shows many statuses but no urgency.

### 39.10. Source-of-truth and data provenance

Required:

- every section shows whether data is live, persisted, calculated, imported or demo;
- demo data is visibly marked;
- user actions must not silently update demo-only state;
- API errors must create visible degraded state, not fake success.

Why it matters:

This is critical for trust. A beautiful demo with unclear data provenance will not pass investor or enterprise scrutiny.

## 40. Cross-role connection plan

The biggest upgrade is not visual. It is connection discipline.

### 40.1. One trace per business object

Every important object should have a trace:

- article trace;
- order trace;
- PO trace;
- material trace;
- shipment trace.

Each trace should show:

- current status;
- current owner;
- next action;
- previous owner/action;
- linked thread;
- linked calendar commitments;
- evidence documents;
- exception status.

### 40.2. Event visibility by role

The same event can be visible differently:

| Event | Brand sees | Shop sees | Manufacturer sees | Supplier sees |
|---|---|---|---|---|
| Order submitted | Full order and buyer context | Confirmation that order was submitted | Future demand only if relevant | Forecast only if relevant |
| Order confirmed | Confirmation and handoff readiness | Confirmed quantities and terms | Expected PO signal | Material forecast signal |
| PO created | PO chain and factory owner | Buyer-safe production status | Executable PO | BOM/material obligation |
| Material delayed | Business risk and recovery owner | ETA risk if impacts order | Production blocker | Supplier action required |
| Shipment dispatched | Shipment proof and status | Tracking and ETA | Dispatch completion | Usually hidden unless supplier shipment |

This prevents overexposure and keeps the UI clean.

### 40.3. Required cross-role handoffs

Platform Core should implement these handoffs as first-class actions:

- Brand publishes article -> Shop can add to matrix.
- Shop submits order -> Brand receives review task.
- Brand requests amendment -> Shop receives action.
- Brand confirms order -> handoff becomes available.
- Brand sends handoff -> Manufacturer receives PO task.
- Manufacturer requests clarification -> Brand receives action.
- Manufacturer requests materials -> Supplier receives RFQ/procurement task.
- Supplier confirms materials -> Manufacturer production gate opens.
- Manufacturer ships -> Shop receives tracking.
- Shop acknowledges delivery -> Brand order can close.

Each handoff must create:

- status change;
- event;
- notification;
- thread link;
- next-owner task.

### 40.4. Dead-end detector

Add a validator that fails a Platform Core section when:

- it has a primary button without a target action;
- action does not create status/event/task;
- action creates data that no other role can see;
- route points to an archived page;
- section has no entity ID;
- section text explains a process but does not let the user act.

This would directly prevent demo тупики.

## 41. Logic and sequence checks

These checks should become product rules and automated tests.

### 41.1. Article-to-order sequence

Required logic:

1. Brand creates article.
2. Brand completes minimum dossier.
3. Brand approves sample or marks sample not required.
4. Brand publishes to showroom.
5. Shop can add only orderable articles to matrix.
6. Shop submits order.

Invalid states to block:

- Shop orders article with missing price.
- Shop orders article with missing size grid.
- Brand publishes article with no commercial terms.
- Brand marks article orderable without visible readiness status.

### 41.2. Order-to-production sequence

Required logic:

1. Shop submits order.
2. Brand reviews order.
3. Brand confirms or requests amendment.
4. Confirmed order becomes handoff-ready.
5. Brand sends handoff.
6. Manufacturer receives PO.
7. Manufacturer accepts or requests clarification.

Invalid states to block:

- PO created before Brand confirmation.
- Manufacturer accepts PO without dossier link.
- Shop sees `in_production` before Brand confirmation.
- Brand handoff has no `poId` or trace.

### 41.3. Materials-to-production sequence

Required logic:

1. PO references BOM.
2. Manufacturer requests/reserves materials.
3. Supplier receives RFQ/procurement task.
4. Supplier quotes or confirms reserve.
5. Manufacturer sees material gate status.
6. Production starts only when material gate is satisfied or explicitly overridden.

Invalid states to block:

- Production starts with missing material status and no override reason.
- Supplier quote not linked to `bomId/poId`.
- Supplier delay does not create a Brand/Manufacturer risk event.

### 41.4. Shipment-to-close sequence

Required logic:

1. Manufacturer marks ready to ship.
2. Shipment is created.
3. Shop sees tracking.
4. Shop acknowledges delivery or opens issue.
5. Brand closes order or manages claim.

Invalid states to block:

- Order closes before delivery acknowledgement.
- Shipment exists without carrier/ETA/proof.
- Shop claim exists only as chat text and does not change order status.

## 42. Optimization and cleanup roadmap

The project needs two simultaneous tracks: product improvement and weight reduction. If only product is added, the project will get slower and noisier. If only cleanup is done, the product will not become more valuable.

### 42.1. Freeze before adding

Before adding new Platform Core features:

1. Freeze the 4 roles and 5 pillars as the only core navigation.
2. Freeze canonical entity IDs.
3. Freeze state machines.
4. Freeze route ownership.
5. Freeze file-size rules.

This prevents the project from expanding sideways again.

### 42.2. Move into `src/features/platform-core`

Move only core-owned logic:

- role/pillar types;
- matrix model;
- readiness audit;
- core route registry;
- entity trace model;
- state machines;
- Brand/Shop/Manufacturer/Supplier core cockpits;
- cross-role event contracts;
- Platform Core UI components.

Keep old routes as wrappers that import from Platform Core.

### 42.3. Archive or disconnect

Move or disconnect:

- long-tail Shop B2B experiments;
- Brand Production advanced workspaces not required for golden path;
- Factory advanced modules not tied to PO execution;
- Supplier circular/legacy pages not tied to BOM/PO/material delivery;
- pages that have no role/pillar/entity mapping.

The archive can exist, but it must not be imported by Platform Core.

### 42.4. File-size rules

Hard rules for future work:

- route page: max 120 lines;
- core component: max 250 lines;
- cockpit container: max 350 lines;
- data fixture file: max 500 lines unless generated and ignored;
- no giant all-purpose provider;
- no direct import of huge JSON into `/platform`;
- heavy tools lazy-load only after click.

If a file exceeds the limit, split by:

- shell;
- header;
- filters;
- summary;
- action panel;
- timeline;
- table/list;
- empty/error/loading state.

### 42.5. Cursor/token health rules

The repo should stay pleasant to work with:

- generated snapshots must be ignored where possible;
- old experiments should be under archive;
- docs should be concise and indexed;
- tests should target golden path, not every old route;
- `node_modules`, build output, generated catalogs and visual snapshots must stay outside active Cursor context;
- Platform Core should have its own small typecheck and validation commands.

## 43. UI and investor-readiness roadmap

The user experience should be conservative, calm and operational.

### 43.1. UI principles

Required:

- one visual language across roles;
- compact typography;
- short labels;
- status chips with consistent colors;
- no loud gradients;
- no marketing hero inside the working app;
- no long explanatory text inside main screens;
- no cards inside cards;
- no decorative noise;
- visible next action in every active cell;
- mobile-first list, tablet master-detail, desktop 4×5 matrix.

### 43.2. Main `/platform` screen

The first screen should contain:

- compact header with product name and current workspace;
- role switcher;
- 4×5 matrix on desktop;
- list grouped by role on iPhone;
- each cell: score, status, current owner, next action, data source badge;
- right-side detail panel on iPad/MacBook;
- no heavy workspace import until a user opens a section.

### 43.3. Cell detail screen

Every cell detail should use the same template:

```text
Header: Role / Pillar / Current status
Primary action
Readiness checklist
Active entities
Timeline
Open exceptions
Linked thread
Linked calendar tasks
Evidence / documents
Secondary actions
```

This gives consistency without flattening the business complexity.

### 43.4. Copywriting standard

Use action language:

- "Confirm order";
- "Request amendment";
- "Send handoff";
- "Accept PO";
- "Request materials";
- "Confirm reserve";
- "Mark ready to ship";
- "Acknowledge delivery".

Avoid vague language:

- "Explore";
- "Discover";
- "View possibilities";
- "AI insights";
- "Smart workspace";
- "Innovation hub";
- "Experience".

Platform Core should sound like operations, not advertising.

## 44. Feature roadmap by waves

### Wave 0 - decision freeze

Goal: stop lateral growth.

Do:

1. Confirm 4 roles and 5 pillars as Platform Core boundary.
2. Confirm canonical process stages.
3. Confirm entity IDs and state machines.
4. Mark all non-core routes as archive/advanced.
5. Add a rule: no new core route without role/pillar/entity/state.

Done when:

- every core section has role, pillar, owner and entity;
- every non-core section has archive/advanced status.

### Wave 1 - restore the missing core

Goal: make Platform Core real and openable.

Do:

1. Restore `/platform`.
2. Restore/create `platform-core-hub-matrix`.
3. Restore/create `platform-core-readiness-audit`.
4. Add missing route constants.
5. Add thin compatibility exports if old imports still exist.

Done when:

- `/platform` opens;
- all 20 cells render;
- missing dependencies are gone;
- core route validation passes.

### Wave 2 - create the light matrix shell

Goal: make the main experience fast and understandable.

Do:

1. Build matrix-first shell.
2. Add mobile list layout.
3. Add tablet master-detail.
4. Add desktop 4×5 matrix.
5. Add data source badges.
6. Add lazy detail loading.

Done when:

- `/platform` does not load heavy Workshop2/B2B/factory workspaces on first render;
- user can reach every core cell;
- UI is consistent across devices.

### Wave 3 - entity and event contract

Goal: create proof that actions connect roles.

Do:

1. Add `PlatformCoreEvent`.
2. Add entity trace helpers.
3. Add status machines for article/order/PO/material/shipment.
4. Add event creation to checkout, confirmation, handoff, PO accept, material reserve and shipment.
5. Add trace viewer.

Done when:

- one `orderId` can show its full event chain;
- every main action creates an event.

### Wave 4 - four core cockpits

Goal: replace scattered pages with role-owned cockpits.

Do:

1. Brand Order Cockpit.
2. Shop Buyer Order Cockpit.
3. Manufacturer PO Cockpit.
4. Supplier Procurement Cockpit.
5. Shared timeline and exception components.

Done when:

- old routes wrap these cockpits;
- duplicate registry/detail/status pages are no longer core sources of truth.

### Wave 5 - golden path E2E

Goal: prove the product.

Build one test scenario:

```text
Brand creates/publishes article
Shop adds to matrix and submits order
Brand confirms order
Brand sends handoff
Manufacturer accepts PO
Supplier confirms materials
Manufacturer ships
Shop acknowledges delivery
Platform trace shows all events
```

Done when:

- same `orderId`, `poId`, `threadId` appear across roles;
- second actor sees first actor's action;
- every step has event evidence.

### Wave 6 - cleanup and archive

Goal: reduce weight and noise.

Do:

1. Archive long-tail Shop B2B experiments.
2. Split heavy Brand Workshop2 files.
3. Split B2B provider into slices.
4. Remove direct imports from archived zones into core.
5. Add boundary validation.
6. Update `.cursorignore` for generated/heavy files.

Done when:

- Platform Core files are small;
- `/platform` bundle is matrix-first;
- Cursor context is not pulled into huge unrelated files.

### Wave 7 - enterprise depth

Goal: add business maturity after the core is stable.

Add:

- RBAC/org model;
- partner onboarding;
- terms/pricing/MOQ;
- amendments;
- cancellation/backorder;
- QC claims;
- compliance docs;
- lightweight invoice/payment statuses;
- SLA and exception management.

Done when:

- the system handles normal flow and common failure flow.

## 45. Tests and acceptance evidence

Platform Core needs tests that prove business logic, not just page rendering.

### 45.1. Required E2E tests

Add:

- `/platform` renders all roles/pillars without loading heavy workspaces;
- Shop matrix checkout creates `orderId`, `threadId`, event;
- Brand sees submitted order;
- Brand confirmation updates Shop view;
- Brand handoff creates/links `poId`;
- Manufacturer sees PO and accepts it;
- Supplier sees material task and confirms reserve;
- Manufacturer shipment updates Shop tracking;
- Shop acknowledgement closes or advances order;
- trace viewer shows all events in order.

### 45.2. Required validation tests

Add:

- no Platform Core import from archive zones;
- no route without role/pillar/entity;
- no primary action without event output;
- no `demo` data shown as live;
- no heavy file imported by `/platform`;
- all `resolveHref` values point to existing routes or approved wrappers;
- all missing route constants are detected.

### 45.3. Required UX checks

Check on:

- iPhone width;
- iPad width;
- MacBook width.

Acceptance:

- no horizontal scroll on mobile;
- no overlapping text;
- all primary buttons fit;
- same visual system across roles;
- each cell has one next action;
- long descriptions are absent from main surface;
- demo/fallback state is visibly badged.

## 46. Scoring rubric for honest 10/10 evaluation

Use the same rubric for every role/pillar cell.

| Dimension | 0-3 | 4-6 | 7-8 | 9-10 |
|---|---|---|---|---|
| Purpose | unclear | understandable but broad | clear owner and goal | instantly clear next business action |
| Data | static/demo | mixed live/demo | mostly real with badges | persisted, traceable, source-labeled |
| Action | view-only | action exists but isolated | action changes status | action creates event, task and next owner |
| Cross-role link | none | link by navigation only | another role can see status | second actor sees and can continue process |
| UX | noisy | usable but inconsistent | clear and compact | calm, consistent, device-ready |
| Performance | heavy | acceptable but risky | lazy detail loading | matrix-first, small files, validated boundaries |
| Test evidence | none | unit/snapshot only | focused E2E | cross-role E2E with shared IDs |

To call a cell 10/10, it must score 9-10 in all dimensions. A beautiful UI with no event trace is not 10. A deep feature with bad mobile UX is not 10. A strong demo with unclear data source is not 10.

## 47. Anti-roadmap: what to stop doing

Stop adding:

- new standalone B2B pages that do not converge into the same order entity;
- separate dashboards for the same order facts;
- pages whose main value is explanation rather than action;
- isolated demo routes that look like core;
- long marketing descriptions inside the working UI;
- direct imports from huge production/workshop modules into the matrix;
- duplicate calendars for order/logistics when one filtered calendar is enough;
- chat features that do not convert into tasks, decisions or status changes;
- supplier pages that are not linked to BOM/PO/material obligations;
- manufacturer pages that are not linked to PO execution;
- shop pages that are not linked to matrix/order/tracking.

This is the discipline that will make Platform Core feel premium.

## 48. Final next-action list

If the team wants the fastest path to quality, do this in order:

1. Restore `/platform` as the main light matrix.
2. Recreate missing Platform Core matrix/audit files and route constants.
3. Define state machines for article, order, PO, material and shipment.
4. Add one shared `PlatformCoreEvent` contract.
5. Build trace viewer for one `orderId`.
6. Collapse Brand order pages into Brand Order Cockpit.
7. Collapse Shop order pages into Buyer Order Cockpit.
8. Build Manufacturer PO Cockpit.
9. Build Supplier Procurement Cockpit.
10. Add cross-role golden path E2E with shared `orderId`, `poId`, `threadId`.
11. Split heavy Workshop2/B2B files.
12. Archive or disconnect non-core long-tail routes.
13. Add Platform Core boundary validator.
14. Apply the unified UI standard to all core cells.
15. Only after this, add enterprise depth: RBAC, terms, amendments, claims, documents, SLA.

The honest product conclusion:

```text
Platform Core is already the strongest idea in the project.
But the next value will not come from adding more pages.
It will come from making fewer pages carry a complete, provable business process.
```

## 49. Cursor repeatability runbook

This section exists so a future Cursor session can repeat the work without forgetting the logic, the files, the risks or the intended order.

The main rule:

```text
DEEP-AUDIT is the master plan.
All other documents are support maps.
Code changes must keep these documents synchronized.
```

If a future session starts from zero, it should not try to understand the whole repository first. It should understand Platform Core first, then touch the wider repository only through approved links.

### 49.1. How to start a future Cursor session

Open these documents in this exact order:

1. `DEEP-AUDIT-2026-06-21.md`
2. `README.md`
3. `ROLE-PILLAR-MATRIX.md`
4. `SOURCE-LINKS.md`
5. `CONNECTIONS.md`
6. `MISSING-OR-EXTERNAL-LINKS.md`
7. `PERFORMANCE-UX-CLEANUP-2026-06-21.md`
8. `PLATFORM-CORE-UI-STANDARD.md`

Why this order:

- first understand the strategy and the honest audit;
- then understand what the current folder contains;
- then understand the 4 roles x 5 pillars;
- then understand where the real source files live;
- then understand which links are still intentionally alive;
- then close missing files/routes;
- then avoid performance mistakes;
- then make the UI consistent.

### 49.2. What not to do at session start

Do not start by searching the whole repo randomly.

Do not start by adding new pages.

Do not start by redesigning UI.

Do not start by moving files before confirming the source links.

Do not trust a screen just because it renders. Check whether it has entity, state, action, next owner and evidence.

## 50. Document responsibility map

These are the documents and what each one is responsible for.

| Document | Purpose | Use when | Must update when |
|---|---|---|---|
| `DEEP-AUDIT-2026-06-21.md` | Master audit, product strategy, role/pillar roadmap, cleanup plan, next actions. | Starting any Platform Core work, deciding priority, checking 10/10 target. | Any product direction, priority, process, route, role/pillar meaning or acceptance criteria changes. |
| `README.md` | Short map of what the Platform Core split folder contains. | Onboarding a new session/person quickly. | New docs/source links are added or the folder purpose changes. |
| `ROLE-PILLAR-MATRIX.md` | Compact current state of 4 roles x 5 pillars. | Checking which cells are active, read-only or support-only. | Any cell changes ownership, status, score, route or maturity. |
| `SOURCE-LINKS.md` | Map from collected Platform Core links to original repo files. | Before moving/editing code; before deciding what belongs to core. | Any source file is moved, renamed, archived, wrapped or newly added. |
| `CONNECTIONS.md` | List of live dependencies that were not safely broken yet. | Before cutting imports or moving shared modules. | Any dependency is removed, replaced, converted to adapter or intentionally kept. |
| `MISSING-OR-EXTERNAL-LINKS.md` | Known missing files, missing route constants and external assumptions. | Before restoring `/platform` or fixing build/runtime issues. | Missing file is created/found, route constant is added, or assumption is disproved. |
| `PERFORMANCE-UX-CLEANUP-2026-06-21.md` | Heavy files, Cursor/token risks, performance cleanup, UI simplification. | Before importing large components or adding new sections. | Heavy file is split, ignored, archived, lazy-loaded or newly discovered. |
| `PLATFORM-CORE-UI-STANDARD.md` | Visual and copywriting standard for Platform Core. | Before building any Platform Core UI. | UI tokens, layout rules, copy style, responsive behavior or component templates change. |
| `_platform-core-split/legacy-rest` docs | What was moved out of the active core focus. | Before deleting, archiving or reconnecting old features. | Any legacy feature becomes core again or is permanently disconnected. |
| `_ai-share/synth-1-full/.cursorignore` | Keeps huge/generated/noisy files out of Cursor context. | When heavy files slow work or pollute context. | Generated files, snapshots, big catalogs or archive zones change. |

### 50.1. Source of truth hierarchy

Use this priority order when documents conflict:

1. Current code behavior.
2. `DEEP-AUDIT-2026-06-21.md`.
3. `SOURCE-LINKS.md` and `CONNECTIONS.md`.
4. `ROLE-PILLAR-MATRIX.md`.
5. `PERFORMANCE-UX-CLEANUP-2026-06-21.md`.
6. `PLATFORM-CORE-UI-STANDARD.md`.
7. Older docs and comments.

If conflict is found, update the stale document immediately.

## 51. Future implementation protocol

Every Platform Core task should follow the same protocol.

### 51.1. Step 1 - classify the task

Before writing code, classify the task:

- role: `brand`, `shop`, `manufacturer`, `supplier`;
- pillar: `development`, `sample_collection`, `collection_order`, `order_production`, `comms`;
- entity: `collectionId`, `articleId`, `orderId`, `poId`, `bomId`, `rfqId`, `shipmentId`, `threadId`;
- process stage: one of the canonical stages in section 35;
- owner: who can act now;
- next owner: who must see the result;
- output: status, event, task, document, route or timeline update.

If this cannot be answered, the task is not ready.

### 51.2. Step 2 - check existing links

Before moving or editing a file:

1. Check `SOURCE-LINKS.md`.
2. Check `CONNECTIONS.md`.
3. Check `MISSING-OR-EXTERNAL-LINKS.md`.
4. Search only the relevant source zones, not the whole project first.

Use the current split folder as the map. The goal is not to rediscover the project every time.

### 51.3. Step 3 - decide ownership

Every file touched should become one of:

- core-owned: belongs inside `src/features/platform-core`;
- wrapper: old route that renders a Platform Core component;
- adapter: shared/legacy logic exposed safely to Platform Core;
- archive: not visible/imported from Platform Core;
- external/shared: kept outside core but documented in `CONNECTIONS.md`.

Do not leave a file in an unclear state.

### 51.4. Step 4 - implement small and verify

Implement in small vertical slices:

1. type/model;
2. data/service;
3. component;
4. route/wrapper;
5. event/trace;
6. test;
7. docs update.

Do not build a large UI before the entity and state model are clear.

### 51.5. Step 5 - update the docs immediately

After each meaningful change:

- update `SOURCE-LINKS.md` if files moved or new sources appeared;
- update `CONNECTIONS.md` if a dependency was cut or kept;
- update `ROLE-PILLAR-MATRIX.md` if a cell changed maturity;
- update `MISSING-OR-EXTERNAL-LINKS.md` if a missing item was solved;
- update `PERFORMANCE-UX-CLEANUP-2026-06-21.md` if a heavy file was split or discovered;
- update `PLATFORM-CORE-UI-STANDARD.md` if visual rules changed;
- update this audit if strategy, priority or acceptance changed.

Documentation is not after-work here. It is how the project stays understandable.

## 52. What to do per document during future phases

### 52.1. When restoring `/platform`

Update:

- `MISSING-OR-EXTERNAL-LINKS.md`: mark `/platform` as restored;
- `SOURCE-LINKS.md`: add the new route and shell components;
- `README.md`: add the live entry point;
- `DEEP-AUDIT-2026-06-21.md`: update blocker status;
- `ROLE-PILLAR-MATRIX.md`: confirm all 20 cells render.

Must verify:

- `/platform` opens;
- mobile layout has no horizontal scroll;
- matrix does not load heavy workspaces by default;
- every cell has role, pillar, score, status and next action.

### 52.2. When recreating missing matrix/audit files

Update:

- `MISSING-OR-EXTERNAL-LINKS.md`: mark missing files solved;
- `SOURCE-LINKS.md`: add new file locations;
- `CONNECTIONS.md`: remove or revise old missing dependency notes;
- `DEEP-AUDIT-2026-06-21.md`: update P0 status.

Must verify:

- all imports resolve;
- readiness sections can read the matrix/audit;
- route constants are valid;
- no new direct archive imports appear.

### 52.3. When moving code into `src/features/platform-core`

Update:

- `SOURCE-LINKS.md`: old path -> new ownership;
- `CONNECTIONS.md`: whether the old import remains, becomes wrapper or is removed;
- `PERFORMANCE-UX-CLEANUP-2026-06-21.md`: file-size impact;
- `README.md`: new source area.

Must verify:

- old routes still open through wrappers;
- Platform Core does not import archived routes;
- moved files remain under file-size limits;
- shared code is exposed through adapter, not random deep import.

### 52.4. When archiving or disconnecting old features

Update:

- `SOURCE-LINKS.md`: mark feature as archived/disconnected;
- `CONNECTIONS.md`: remove live dependency if cut;
- `DEEP-AUDIT-2026-06-21.md`: update archive reasoning if important;
- `_platform-core-split/legacy-rest` docs if archive content changes.

Must verify:

- no Platform Core route points to the archived feature;
- no Platform Core import pulls archived code into bundle;
- user-facing navigation does not show non-core noise.

### 52.5. When adding a new feature

Update:

- `ROLE-PILLAR-MATRIX.md`: cell maturity and status;
- `DEEP-AUDIT-2026-06-21.md`: if this changes roadmap or acceptance;
- `SOURCE-LINKS.md`: source files;
- `PLATFORM-CORE-UI-STANDARD.md`: only if UI pattern changes.

Must verify:

- feature has an entity;
- feature has a state;
- feature has a primary action;
- action creates event/evidence;
- another role can see the result when required;
- no long text or decorative UI is added.

### 52.6. When improving UI

Update:

- `PLATFORM-CORE-UI-STANDARD.md` if rules changed;
- `PERFORMANCE-UX-CLEANUP-2026-06-21.md` if layout affects performance or noise;
- `DEEP-AUDIT-2026-06-21.md` only if the standard/strategy changes.

Must verify:

- iPhone, iPad and MacBook layouts;
- text does not overlap;
- primary buttons fit;
- no cards inside cards;
- no marketing hero;
- no long descriptions in main work surface.

### 52.7. When adding tests

Update:

- `SOURCE-LINKS.md`: new E2E/unit tests;
- `DEEP-AUDIT-2026-06-21.md`: if a major acceptance gap is closed;
- `ROLE-PILLAR-MATRIX.md`: score can improve only when test evidence exists.

Must verify:

- at least one cross-role scenario uses same `orderId`, `poId`, `threadId`;
- tests prove second actor visibility;
- tests include demo/live data source expectations.

## 53. No-miss master checklist

Use this checklist before considering any Platform Core phase complete.

### 53.1. Product logic

- role is clear;
- pillar is clear;
- section is clear;
- entity ID is clear;
- owner is clear;
- next owner is clear;
- state before action is clear;
- state after action is clear;
- output is persisted or explicitly demo-badged;
- user has one obvious next action.

### 53.2. Cross-role logic

- action by one role is visible to the next role;
- event is created;
- thread is linked;
- calendar/task is linked when time commitment exists;
- order/PO/material/shipment timeline updates;
- permission level is respected;
- buyer-safe view hides internal noise;
- production/supplier views show only what they own.

### 53.3. UI logic

- same visual language as Platform Core standard;
- short labels;
- no long explanatory text;
- no decorative sections;
- no nested cards;
- clear empty/loading/error states;
- mobile works first;
- iPad master-detail works;
- desktop 4x5 matrix stays readable.

### 53.4. Performance logic

- `/platform` stays matrix-first;
- heavy components lazy-load;
- giant JSON files are not imported into the shell;
- route page is thin;
- component files stay small;
- no all-purpose provider grows again;
- generated/heavy files are ignored where appropriate.

### 53.5. Data logic

- data source is visible;
- demo/fallback is badged;
- failed API does not fake success;
- local-only state is not presented as persistent;
- IDs are stable across roles;
- status transitions are not only UI labels.

### 53.6. Test logic

- core route opens;
- role/pillar cell renders;
- primary action works;
- event is created;
- next role can see the result;
- no archive import enters core;
- no missing route constant;
- mobile visual check passes.

### 53.7. Documentation logic

- `README.md` still describes the folder correctly;
- `SOURCE-LINKS.md` paths are current;
- `CONNECTIONS.md` live dependencies are current;
- `MISSING-OR-EXTERNAL-LINKS.md` has no solved item left as missing;
- `ROLE-PILLAR-MATRIX.md` scores match reality;
- `PERFORMANCE-UX-CLEANUP-2026-06-21.md` reflects heavy-file reality;
- `PLATFORM-CORE-UI-STANDARD.md` matches the implemented UI.

## 54. Cursor task templates

Use these templates later in Cursor so the project is developed in the same logic.

### 54.1. Phase template

```text
Goal:
Improve Platform Core [wave/phase name] without expanding outside 4 roles x 5 pillars.

Read first:
- Projects/_platform-core-split/platform-core/DEEP-AUDIT-2026-06-21.md
- Projects/_platform-core-split/platform-core/SOURCE-LINKS.md
- Projects/_platform-core-split/platform-core/CONNECTIONS.md
- Projects/_platform-core-split/platform-core/MISSING-OR-EXTERNAL-LINKS.md
- Projects/_platform-core-split/platform-core/PLATFORM-CORE-UI-STANDARD.md

Scope:
- role:
- pillar:
- entity:
- current owner:
- next owner:
- state before:
- state after:
- event/evidence:

Rules:
- do not add new non-core routes;
- do not import archive/advanced features into Platform Core;
- keep /platform matrix-first and lazy;
- update docs after code changes;
- verify iPhone/iPad/MacBook layouts if UI changes.

Done when:
- feature works;
- next role can see the result;
- event trace exists;
- docs are synchronized;
- tests or validation prove the main path.
```

### 54.2. Feature template

```text
Build one Platform Core feature.

Feature:
Role:
Pillar:
Business process stage:
Entity IDs:
Primary action:
Output:
Next role visibility:
Event:
Thread/task/calendar link:
Data source:
Demo/live status:
Validation:
Docs to update:
```

If any line is empty, the feature is not ready to implement.

### 54.3. Cleanup template

```text
Clean up Platform Core without breaking existing behavior.

Target:
Why it is heavy/noisy:
Core-owned, wrapper, adapter, archive or external/shared:
Files to move/split:
Imports to cut:
Routes to keep as wrappers:
Docs to update:
Validation:
Rollback risk:
```

### 54.4. Review template

```text
Review this Platform Core change honestly.

Check:
- Does it belong to one of 4 roles x 5 pillars?
- Does it move article/order/PO/material/shipment/comms forward?
- Does the action create event/evidence?
- Can the next role see the result?
- Is demo/fallback data clearly marked?
- Does it keep /platform light?
- Does it follow UI standard?
- Are docs updated?
- What should be removed, simplified or archived?
```

## 55. Additional gaps not fully covered yet

These were not developed deeply enough in earlier sections and should be considered before serious production use.

### 55.1. Security and access control

Add a security review before enterprise use:

- role permissions;
- partner-level visibility;
- order/PO document access;
- supplier quote privacy;
- audit log immutability;
- sensitive document download rules;
- invitation and offboarding flows.

### 55.2. Data migration and compatibility

If old routes become wrappers, define:

- old URL compatibility;
- redirects;
- data shape adapters;
- migration for old demo/local data;
- deprecation plan for archived routes.

Without this, cleanup can accidentally break existing user paths.

### 55.3. Observability

Add minimal operational monitoring:

- failed checkout;
- failed confirmation;
- failed handoff;
- failed PO accept;
- failed supplier reserve;
- failed shipment update;
- slow `/platform` shell load;
- missing data-source badge.

This is not investor decoration. It is how the team knows the operating chain is healthy.

### 55.4. Accessibility

Add checks for:

- keyboard navigation;
- focus states;
- contrast;
- readable status colors without relying only on color;
- button labels;
- table/list semantics;
- mobile touch targets.

A calm conservative UI still fails if it is not accessible.

### 55.5. Localization and business formats

Future Platform Core should support:

- currency;
- units;
- time zones;
- date formats;
- language strings;
- size systems;
- tax/VAT display;
- delivery terms by region.

Do not solve all at once, but avoid hardcoding formats inside core components.

### 55.6. Import/export discipline

Serious users will need:

- export order summary;
- export production package;
- export BOM/material list;
- export shipment documents;
- import partner catalog;
- import supplier price list.

Every import/export must be tied to entity IDs and events.

### 55.7. Error and empty states

For every core cell, define:

- no data;
- loading;
- failed to load;
- permission denied;
- demo data only;
- action blocked;
- action succeeded;
- next owner pending.

Do not let empty states become long explanations. They should show the next action or the reason action is blocked.

### 55.8. Decision records

If the project keeps growing, add a lightweight future document:

```text
PLATFORM-CORE-DECISIONS.md
```

It should record:

- decision;
- date;
- why;
- rejected alternatives;
- affected roles/pillars;
- files/routes touched.

This is optional now, but will become useful once multiple implementation phases begin.

## 56. Final repeatable improvement loop

Use this loop until Platform Core reaches 10/10:

```text
Pick one role/pillar cell
-> define entity/state/action/evidence
-> remove noise and duplicates
-> implement or connect the missing action
-> make next role visibility real
-> add event trace
-> verify device UI
-> run/import boundary checks
-> update docs
-> rescore the cell honestly
```

The project improves fastest when each loop makes one cell more real and the whole chain more connected.

The target is not a bigger project.

The target is a sharper project:

```text
less noise,
fewer dead ends,
clearer ownership,
real cross-role evidence,
faster /platform,
one conservative visual system,
and a business process that can be repeated without explanation.
```

## 57. Archive re-entry audit: what must come back from legacy

The archive is not trash. Some parts are valuable and should return to Platform Core, but almost never as whole old pages.

The correct rule:

```text
Recover the contract, logic, data shape, test or small adapter.
Do not recover the old noisy screen unless it already fits the 4 roles x 5 pillars.
```

If an archive item helps article readiness, buyer ordering, production handoff, supplier materials, shipment, compliance, comms, evidence, tests or performance gates, it should be considered for Platform Core.

If it is social, marketing, broad academy, public home, general admin, consumer wardrobe, runway or discovery without order/PO/material/shipment linkage, it stays archived.

### 57.1. Re-entry levels

Use these levels for anything in `_platform-core-split/legacy-rest`.

| Level | Meaning | Action |
|---|---|---|
| `recover_now` | Directly strengthens current Platform Core and is small enough. | Extract into `src/features/platform-core` or shared adapter. |
| `recover_as_adapter` | Valuable, but old implementation is broad/heavy/noisy. | Extract contract/pure logic, wrap behind Platform Core adapter. |
| `advanced_extension` | Useful after golden path works, but not first-screen core. | Link from section drawer only; lazy-load; badge as advanced. |
| `keep_archive` | May matter later, but not tied to current 4x5 core. | Leave in archive; document why. |
| `reject_noise` | Demo/noisy/duplicate/marketing-only. | Do not bring back. |

### 57.2. Re-entry acceptance test

An archive feature can return only if it answers all questions:

- Which role owns it?
- Which pillar does it improve?
- Which entity ID does it attach to?
- Which state transition does it support?
- Which next role sees the result?
- Which event/evidence does it create?
- Can it be loaded lazily?
- Can it fit the Platform Core UI standard?

If any answer is missing, it stays archive or advanced.

## 58. Archive items that are important for Platform Core

This is the current triage of `_platform-core-split/legacy-rest`.

| Archive source | Value | Re-entry level | Where it belongs in Platform Core | How to integrate |
|---|---|---|---|---|
| `root-docs/B2B_AND_PRODUCTION_CORE_SPEC.md` | Very important old product canon: B2B order, production, chat/calendar as overlay, deep links by `orderId`. | `recover_now` | All roles; especially Brand/Shop `collection_order`, Brand/Manufacturer `order_production`, `comms`. | Merge its rules into Platform Core contract. Use it to validate order -> comms -> calendar links. Do not keep it as isolated old doc. |
| `root-docs/MVP_CONTRACT.md` | Core/demo contract and fallback discipline. | `recover_now` | Platform Core quality gates. | Convert into `PLATFORM-CORE-MVP-CONTRACT` or add to validation section. Every new endpoint/action needs demo fallback and test. |
| `root-docs/DOD_CHECKLIST.md` | Simple Definition of Done for core changes. | `recover_now` | All implementation phases. | Turn into Platform Core DoD: docs updated, smoke/e2e exists, demo mode no 500, no MVP expansion without decision. |
| `root-docs/RUNBOOK.md` | Useful operational runbook: roots, CI, demo/API modes, brand comms notes. | `recover_as_adapter` | Developer workflow and verification. | Extract only relevant Platform Core commands and demo/live mode rules. Avoid copying old broad runbook noise. |
| `root-tests/test_wholesale_workflow.py` | Old draft order and linesheet API intent. | `recover_as_adapter` | Shop `collection_order`, Brand `collection_order`. | Rewrite as real Platform Core test: showroom/matrix -> draft/submitted order -> Brand visibility. Current weak `200 or 500` assertions are not enough. |
| `root-tests/test_wholesale_block.py` | Old showroom and draft order route coverage. | `recover_as_adapter` | Brand `sample_collection`, Shop `collection_order`. | Convert into strict smoke tests for showroom/order route existence, permissions and fallback. |
| `root-tests/test_production_plm.py` | Very important PLM intent: tech pack, BOM, snapshot, messages, RFQ, certs, payment milestones, MRP. | `recover_as_adapter` | Brand `development`, Manufacturer `order_production`, Supplier `order_production`, `comms`, compliance. | Unskip only after schema alignment. Split into Platform Core tests for `articleId`, `bomId`, `poId`, `rfqId`, certs and payment milestones. |
| `components-client/platform-data-banner.tsx` | Clean data-mode badge: local/demo vs API. | `recover_now` | `/platform` shell and every cell/detail. | Rename/adapt as `PlatformCoreDataSourceBadge`; use for live/demo/imported/fallback status. |
| `lib-platform-client-tools/config.ts` | Transport mode helper. | `recover_as_adapter` | Data source badges and demo/API behavior. | Adapt into Platform Core config. Must not hardcode unrelated client-tool naming. |
| `lib-platform-client-tools/json-io.ts` | Small JSON import/export utility. | `recover_now` | Export/import of orders, BOM, DPP, production package. | Move pure helper to Platform Core import/export adapter. Add schema validation before import. |
| `lib-platform-client-tools/types.ts` | Versioned JSON export contracts; DPP types; partner matrix shapes. | `recover_as_adapter` | Import/export, DPP, partner matrix, compliance. | Keep versioning idea. Extract only relevant types; avoid consumer visual-search/capsule types in core. |
| `lib-platform-client-tools/dpp-calculator.ts` | Useful DPP/BOM sustainability calculation seed. | `recover_as_adapter` | Brand `development`, Supplier `development/order_production`, Shop `order_production` buyer-safe passport. | Replace random passport ID with deterministic `articleId/bomId` ID. Mark as estimated/demo until real factors exist. |
| `lib-platform-client-tools/dpp-payload.ts` | DPP payload shape with materials, supply chain and certificates. | `recover_as_adapter` | Dossier/BOM/compliance/shipment evidence. | Remove hardcoded demo claims. Build from article, BOM, supplier certs and shipment events. |
| `components-admin/B2BControlCenter.tsx` | Important enterprise feature map: EDI, escrow, docs, pricing, landed cost, contracts, claims, logistics, ATS, production pulse. | `recover_as_adapter` | Later enterprise depth across Brand/Shop/Manufacturer/Supplier. | Do not import this component. Extract the feature taxonomy and build small Platform Core modules one by one. |
| `components-admin/attribute-manager-dialog.tsx` | Useful attribute editing logic and attribute taxonomy. | `recover_as_adapter` | Brand `development`, Shop `collection_order`, Manufacturer tech pack readiness. | Extract attribute schema and readiness checks. Do not reuse giant admin dialog UI as core. |
| `components-admin/fit-guide-*` | Size/fit guidance can help size matrix and article readiness. | `advanced_extension` | Brand `development`, Shop `collection_order`, Manufacturer size-dependent BOM. | Extract fit guide data/rules only. Advanced drawer, not default matrix. |
| `components-distributor/real-route-ai.tsx` | Shipment ETA/risk concept. | `advanced_extension` | Brand/Manufacturer `order_production`, Shop tracking. | Do not use mock map UI. Extract ETA/risk fields into shipment exception model. |
| `components-distributor/global-trade-ai.tsx` | Customs, HS code, export docs, duty calculator concept. | `advanced_extension` | Compliance/docs under Brand/Manufacturer/Supplier order production. | Extract document readiness model; no "AI engine" UI until real API/evidence exists. |
| `src-ai/token-guard.ts` | AI quota/abuse-control idea. | `recover_as_adapter` | Any future AI helper in Platform Core. | Use only as infra contract; no AI action may change status without user confirmation. |
| `src-ai/llm-cache.ts` | AI cache idea. | `recover_as_adapter` | Future AI suggestions: landed cost, HS, allocation, risk. | Replace localStorage-only cache with server-safe adapter later. Badge AI output as suggestion. |
| `components-client/SewingPatternWorkspace.tsx` and related sewing pattern files | Advanced product-development tool. | `advanced_extension` | Brand `development`; possibly Manufacturer feasibility. | Link only from article/dossier advanced drawer. Never load in `/platform` shell. |
| `lib-platform-client-tools/visual-search.ts`, `for-you.ts`, `capsule-store.ts` | Useful buyer/discovery ideas, but not current operating chain. | `keep_archive` | Possible future Shop `sample_collection` extension. | Do not bring back until showroom/matrix/order is stable. |
| `components-academy`, `app-academy`, `app-brand-academy` | Learning/help content. | `keep_archive` | Future help center outside core. | Do not import into Platform Core. If needed, create tiny contextual help links outside main workflow. |
| `components-home`, `components-runway`, `components-wardrobe` | Public/consumer/marketing surfaces. | `reject_noise` | None for current core. | Keep archived. They do not improve B2B -> PO -> production -> supplier chain. |
| `components-admin/recent-signups`, sales/followers/promotion dialogs | Admin/marketing analytics. | `keep_archive` | Possible platform admin later, not 4-role core. | Keep out of Platform Core unless admin becomes explicit role. |

## 59. How recovered archive items should fit the 4 roles x 5 pillars

### 59.1. Brand

Recover for Brand:

- `B2B_AND_PRODUCTION_CORE_SPEC.md` rules for order, comms and production links;
- PLM test intent: tech pack, BOM, snapshot, messages, RFQ, certificates, payment milestones;
- DPP payload/calculator as article/BOM evidence;
- attribute taxonomy as article readiness;
- contracts/pricing/financial terms from the B2B control taxonomy;
- document/compliance concepts from Global Trade.

Map:

| Pillar | Archive value to recover | Target behavior |
|---|---|---|
| `development` | attribute schema, DPP, tech pack/BOM tests, sewing pattern as advanced | article becomes production-ready with proof |
| `sample_collection` | showroom/linesheet test intent, DPP preview | publish only orderable, documented products |
| `collection_order` | B2B order spec, pricing/terms/contracts | Brand can confirm/amend order with commercial terms |
| `order_production` | PLM snapshot, payment milestones, customs/docs, landed cost | Brand sees production/compliance/payment readiness |
| `comms` | old order deep-link spec | chat/calendar/tasks always linked to `orderId`/`poId` |

### 59.2. Shop

Recover for Shop:

- draft order/wholesale workflow tests;
- data source badge;
- JSON import/export for matrix/order;
- DPP buyer-safe passport;
- fit/size feedback rules;
- shipment ETA/risk fields from distributor logistics.

Map:

| Pillar | Archive value to recover | Target behavior |
|---|---|---|
| `development` | buyer-safe readiness, fit notes | Shop understands what will be orderable |
| `sample_collection` | showroom/linesheet intent | Shop sees documented collection, not random catalog |
| `collection_order` | draft order tests, JSON import/export | matrix -> order is traceable and portable |
| `order_production` | DPP, ETA/risk, delivery docs | Shop tracks delivery with proof, not factory noise |
| `comms` | order context deep links | amendments/delays are handled in entity thread |

### 59.3. Manufacturer

Recover for Manufacturer:

- PLM production snapshot;
- tech pack and BOM tests;
- MRP/size-dependent batch intent;
- material gate logic from supplier/RFQ tests;
- shipment ETA/risk model;
- compliance docs where they affect shipment.

Map:

| Pillar | Archive value to recover | Target behavior |
|---|---|---|
| `development` | tech pack feasibility, attribute/fit rules | Manufacturer can request clarification before PO |
| `sample_collection` | sample/material readiness | sample work is task-based, not free-form |
| `collection_order` | forecast/demand from old wholesale flow | Manufacturer sees capacity signal, not buyer controls |
| `order_production` | PLM snapshot, MRP, shipment risk | PO cockpit controls materials, production, QC, shipment |
| `comms` | PLM messages | clarifications become status/task changes |

### 59.4. Supplier

Recover for Supplier:

- RFQ intent from PLM tests;
- DPP materials/certificates;
- Global Trade compliance document model;
- material quote/reserve linkage;
- AI quota/cache only if supplier suggestions are introduced.

Map:

| Pillar | Archive value to recover | Target behavior |
|---|---|---|
| `development` | material specs, DPP material fields | Supplier can validate material feasibility early |
| `sample_collection` | sample material availability | sample material readiness is visible |
| `collection_order` | demand/forecast from order matrix | Supplier sees likely material demand |
| `order_production` | RFQ, certificates, dispatch docs | supplier quote/reserve/delivery is tied to `poId/bomId` |
| `comms` | quote/decision cards | messages become quote, ETA or exception events |

## 60. Target folder structure for recovered archive logic

Do not import from `_platform-core-split/legacy-rest` in product code. That folder is an analysis boundary, not a runtime dependency.

Recovered logic should be extracted into a clean Platform Core shape:

```text
src/features/platform-core/
  adapters/
    legacy-reviewed/
      b2b-core-contract.ts
      data-source-mode.ts
      import-export-json.ts
      dpp/
        dpp-types.ts
        dpp-builder.ts
        dpp-estimator.ts
      enterprise-capability-map.ts
      compliance-document-model.ts
      shipment-risk-model.ts
      ai-safety-contract.ts
  contracts/
    platform-core-mvp-contract.ts
    platform-core-dod.ts
    platform-core-state-machines.ts
  tests/
    platform-core-wholesale-flow.spec.ts
    platform-core-plm-flow.spec.ts
    platform-core-data-source.spec.ts
```

Old routes can stay as wrappers only if needed. Platform Core must own the clean extracted logic.

### 60.1. Adapter rules

Every recovered adapter must include:

- source file reference;
- reason for recovery;
- owning role/pillar;
- entity IDs;
- data source badge;
- demo/live behavior;
- test or validation plan;
- whether it is core, advanced or hidden.

### 60.2. No direct UI recovery rule

Do not bring back:

- `B2BControlCenter` as a full screen;
- distributor mock map UI;
- academy routes;
- public home sections;
- wardrobe/consumer UI;
- giant fit-guide dialogs;
- admin panels as core pages.

Extract logic and data contracts. Rebuild UI with Platform Core templates.

## 61. How to configure links for recovered archive features

Every recovered archive feature needs a link contract.

### 61.1. Required link fields

```ts
type PlatformCoreRecoveredLink = {
  sourceArchivePath: string;
  targetFeaturePath: string;
  role: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  pillar:
    | 'development'
    | 'sample_collection'
    | 'collection_order'
    | 'order_production'
    | 'comms';
  entityType:
    | 'collection'
    | 'article'
    | 'dossier'
    | 'bom'
    | 'order'
    | 'po'
    | 'rfq'
    | 'shipment'
    | 'thread'
    | 'document';
  entityIdField: string;
  loadMode: 'core' | 'lazy_detail' | 'advanced_drawer' | 'hidden_adapter';
  dataSource: 'live' | 'demo' | 'fallback' | 'estimated' | 'imported';
  eventRequired: boolean;
};
```

### 61.2. Documentation updates when a legacy item returns

When anything returns from archive:

- update `SOURCE-LINKS.md` with source and target;
- update `CONNECTIONS.md` if a live dependency remains;
- update `ROLE-PILLAR-MATRIX.md` if a cell maturity changes;
- update `PERFORMANCE-UX-CLEANUP-2026-06-21.md` if file weight changes;
- update `PLATFORM-CORE-UI-STANDARD.md` if a new UI pattern is needed;
- update `MISSING-OR-EXTERNAL-LINKS.md` if it solves a missing capability;
- update this section with the decision and level.

### 61.3. Runtime link rules

Recovered archive logic may be linked in three ways:

1. Core model import: small pure types/functions only.
2. Lazy detail: user opens a role/pillar section and the detail loads.
3. Advanced drawer: clearly marked advanced tool, not default core.

Never link archive through:

- global navigation;
- `/platform` first render;
- hidden import from an old admin/distributor/client page;
- unbadged demo data;
- AI action with no human confirmation.

## 62. Archive capabilities to convert into Platform Core backlog

These backlog items are worth adding after P0/P1 stability.

### 62.1. Data provenance

Source:

- `components-client/platform-data-banner.tsx`;
- `lib-platform-client-tools/config.ts`;
- old runbook demo/API notes.

Build:

- `PlatformCoreDataSourceBadge`;
- data source per cell;
- source label per action result;
- fallback/error states.

Improves:

- all roles;
- all pillars;
- investor trust.

### 62.2. DPP and compliance passport

Source:

- `dpp-calculator.ts`;
- `dpp-payload.ts`;
- DPP types;
- PLM compliance cert test;
- Global Trade document model.

Build:

- article DPP tab;
- BOM sustainability estimate;
- supplier certificate checklist;
- shipment/compliance document readiness;
- buyer-safe DPP view.

Improves:

- Brand development;
- Supplier order production;
- Manufacturer shipment;
- Shop tracking.

### 62.3. Import/export discipline

Source:

- `json-io.ts`;
- versioned export types.

Build:

- export order summary;
- export BOM;
- export production package;
- import matrix;
- import supplier price list;
- versioned schema validation.

Improves:

- Brand collection/order production;
- Shop collection order;
- Supplier materials;
- Manufacturer production package.

### 62.4. Enterprise order controls

Source:

- `B2BControlCenter.tsx` enterprise taxonomy;
- old B2B spec.

Build as small modules:

- contracts;
- pricing tiers;
- financial terms;
- payment milestones;
- claims/returns;
- EDI sync;
- document management;
- landed cost;
- customs docs;
- production pulse;
- allocation.

Do not build them as one enterprise page. Each must attach to an entity and role/pillar.

### 62.5. PLM/API contract tests

Source:

- `test_production_plm.py`;
- wholesale tests;
- MVP contract and DoD.

Build:

- strict Platform Core API/route tests;
- cross-role tests with `orderId`, `poId`, `threadId`;
- tests for tech pack, BOM, RFQ, certificate, payment milestone and MRP.

Improves:

- build confidence;
- real operating logic;
- future refactor safety.

### 62.6. Shipment and trade risk

Source:

- `RealRouteAi`;
- `GlobalTradeAi`.

Build:

- shipment ETA/risk model;
- customs document readiness;
- duty/tax estimate placeholder;
- delay exception event;
- buyer-safe tracking view.

Improves:

- Brand order production;
- Manufacturer order production;
- Supplier dispatch;
- Shop order tracking.

### 62.7. Fit, attributes and size readiness

Source:

- `attribute-manager-dialog.tsx`;
- `fit-guide-*`;
- `FitFeedbackAggregateDto`;
- PLM size/MRP test.

Build:

- article attribute completeness;
- size grid readiness;
- fit warning for Shop matrix;
- size-dependent BOM/MRP warning for Manufacturer.

Improves:

- Brand development;
- Shop collection order;
- Manufacturer order production.

## 63. Archive items to keep out of Platform Core

Keep these out until a future product decision changes the 4-role core.

| Archive item | Why it stays out |
|---|---|
| Academy/Brand Academy | Useful learning content, but not an operating action. Add contextual help later outside main flow. |
| Home/public marketing components | They sell the product; they do not execute order/PO/material/shipment. |
| Runway | Not tied to current B2B operating chain. |
| Wardrobe/consumer assistant | Consumer-facing, outside 4 Platform Core roles. |
| Visual search / For You / Capsule | Buyer discovery layer; can wait until matrix/order path is stable. |
| Distributor networking hub | Distributor is not a current role. Do not sneak in a fifth role. |
| Generic admin signups/followers/promotion analytics | Admin is not part of current 4-role Platform Core. |
| Full `B2BControlCenter` page | Too broad and heavy. Extract taxonomy only. |
| Full `RealRouteAi`/`GlobalTradeAi` UI | Mock-heavy AI presentation. Extract shipment/compliance models only. |
| Full fit-guide dialogs | Too many modal screens. Extract fit/size rules only. |

This protects Platform Core from becoming wide again.

## 64. Practical re-entry sequence

Use this sequence when bringing archive value back.

### 64.1. First re-entry wave

Do now or soon:

1. Extract `PlatformCoreDataSourceBadge` from `platform-data-banner`.
2. Extract JSON import/export helper with schema validation.
3. Convert `B2B_AND_PRODUCTION_CORE_SPEC.md` into Platform Core route/action/link contract.
4. Convert `DOD_CHECKLIST.md` into Platform Core DoD.
5. Rewrite old wholesale tests as strict Platform Core order flow tests.

These are small and directly improve clarity.

### 64.2. Second re-entry wave

Do after `/platform` and basic trace work:

1. Add DPP/BOM/compliance passport adapter.
2. Add attribute/size readiness adapter.
3. Rewrite PLM tests for tech pack, BOM, RFQ, certs and payment milestones.
4. Add import/export for order summary and BOM.

These deepen the core without changing the main navigation.

### 64.3. Third re-entry wave

Do after golden path E2E passes:

1. Add contracts/pricing/financial terms.
2. Add claims/returns.
3. Add shipment risk and customs document readiness.
4. Add EDI/payment/landed-cost as advanced drawers.

These are enterprise depth. They should not arrive before the basic operating chain is proven.

### 64.4. Re-entry done criteria

An archive item is successfully recovered only when:

- it lives under clean Platform Core ownership or adapter;
- it is mapped to role/pillar/entity;
- it does not load in `/platform` shell unless tiny;
- it has data source badge;
- it has test or validation;
- it creates/uses event evidence when action-based;
- old archive dependency is documented or removed;
- UI follows the Platform Core standard.

The archive should become a mined source of good parts, not a second product living beside Platform Core.

## 65. Platform Core internal garbage audit

This section is about garbage inside Platform Core itself. Not archive garbage. Not legacy-rest. This is the noise that can still remain inside the supposedly focused 4 roles x 5 pillars layer.

The honest problem:

```text
Platform Core has the right idea, but it still sometimes behaves like a catalogue
of capabilities instead of a compact operating chain.
```

The target:

```text
Every visible thing must help a fashion business move from product idea
to sellable collection, buyer order, production, materials, shipment,
payment/claim/compliance and evidence.
```

### 65.1. Garbage classes

| Garbage class | How it looks | Why it hurts | Required treatment |
|---|---|---|---|
| Link noise | Many context strips, peer links, "go to full page", repeated CTAs. | User feels they are navigating a maze, not doing work. | Keep one primary action and one secondary trace link. Move the rest into "More". |
| Demo ambiguity | Seed, localStorage, mock, file-store, memory fallback shown like real data. | Investor/user trust drops. | Add source badge or block action in strict mode. |
| Duplicate surfaces | Mini/full page, registry/detail/status, cabinet/full workspace, order/logistics calendar. | Same entity appears in too many places with different wording. | One cockpit owns entity. Other screens are wrappers or read-only previews. |
| Read-only pretending to be work | Context-only cells look like active product sections. | Roles feel useless or confused. | Label as "Context only" and show when the role can act. |
| Advanced tools in core | Gantt, nesting, video, whiteboard, AI, maps, finance, runway-style modules in default path. | Core becomes heavy and unfocused. | Advanced drawer only after golden path is stable. |
| Investor-only blocks | Investor PDF, investor summary, marketing copy inside operations. | Operators lose clarity; investors see demo smoke. | Move to evidence/export, not main work surface. |
| Unowned actions | Button changes UI but not state/event/task. | Dead end. | Action must create event, status, task, document or next-owner visibility. |
| Role leakage | Shop sees factory-internal details; supplier sees buyer flow; manufacturer sees brand-only steps. | Wrong mental model and privacy risk. | Buyer-safe / factory-safe / supplier-safe view models. |
| Poll-only truth | UI "updates" by polling without saying whether it is live or fallback. | Users cannot trust freshness. | Show freshness: live, polling, stale, failed. |
| Old matrix vocabulary | Old profile/distributor/admin concepts leak into new 4x5 model. | Product story becomes blurry. | Keep 4 roles only. Other profiles are archive or future expansion. |

### 65.2. Decision rule for every questionable block

Ask:

```text
Does this block move article/order/PO/material/shipment/thread/document
to a clearer state for one of the four roles?
```

If no, remove it from core.

If yes but only sometimes, move it to detail or advanced drawer.

If yes and daily-important, keep it in the cockpit.

### 65.3. What "remove" means

Remove does not always mean delete.

Use five outcomes:

- delete from Platform Core UI;
- hide under advanced;
- merge into an existing cockpit;
- convert into data/evidence only;
- keep in archive with no core import.

## 66. What the audit already covered and what still needed this section

The document already covered many large themes:

- 4 roles x 5 pillars as core contract;
- `/platform` missing/restoration;
- missing matrix/audit files;
- route constants;
- performance and Cursor weight;
- UI standard;
- archive re-entry;
- state machines;
- canonical business process;
- role/pillar roadmap;
- tests and acceptance;
- future Cursor runbook.

What was not yet explicit enough:

- a direct taxonomy of internal Platform Core garbage;
- exact merge/remove decisions for duplicate surfaces;
- a role-by-role cleanup map;
- how to reduce user/investor confusion without losing valuable functionality;
- what "read-only" cells must become;
- how to treat context strips and peer links;
- how to prevent Platform Core from becoming wide again after archive re-entry;
- how to make each role feel useful in a fashion workflow, not just present in a matrix.

This section closes that gap.

## 67. Concrete cleanup map by role and pillar

This is the practical map for reducing noise and improving usefulness.

### 67.1. Brand cleanup

| Pillar | Current noise | What to remove/hide | What to merge | Target state |
|---|---|---|---|---|
| `development` | W2 hub, dossier, range, PG sync, cabinet and cross links can feel like six separate products. Investor PDF/summary is not daily work. | Hide investor summary from main operator flow. Move PDF export into evidence/export menu. Hide advanced drafting tools unless article is open. | Merge W2 hub + dossier + range + PG sync + sample queue into `Brand Article Development Cockpit`. | Brand sees one article/readiness cockpit: data, BOM, sample, tier, publish readiness, next action. |
| `sample_collection` | Linesheets, showroom, publish and cabinet duplicate "make collection visible". | Remove separate visual weight for "showroom vs linesheet" on the main surface. | Merge into `Brand Publishing Cockpit`: sample approved -> linesheet -> showroom -> shop matrix-ready. | Brand controls publication once, sees buyer readiness and audit trail. |
| `collection_order` | Registry, detail, retailers, chain and cabinet repeat order facts. Pre-orders are outside the golden chain. | Remove separate pre-order route from core nav. Keep retailers as partner context, not order cockpit. | Merge into `Brand Order Cockpit`. | Brand receives, amends, confirms and hands off orders from one place. |
| `order_production` | Handoff, chain, dossier, registry and cabinet repeat PO/order facts. Chain card and order facts duplicate status. | Hide second status strip. Do not show full dossier unless needed. | Merge into `Brand Production Timeline`: confirmed -> handoff -> PO -> materials -> production -> QC -> shipment. | Brand sees one operational timeline per order, with exceptions and next owner. |
| `comms` | Chat/calendar can become separate app. | Remove generic comms links not tied to entity. | Merge chat, task and calendar by `orderId/articleId/poId`. | Brand inbox is entity-first and decision-first. |

Brand should not feel like a command room with every possible module. It should feel like a controlled operating cockpit.

### 67.2. Shop cleanup

| Pillar | Current noise | What to remove/hide | What to merge | Target state |
|---|---|---|---|---|
| `development` | Read-only development context can look like an editable area. | Remove any edit-looking controls. Hide brand-only development steps. | Merge into a buyer-safe readiness preview. | Shop understands what will become orderable and what is blocked. |
| `sample_collection` | Showroom, partners, matrix entry and mini cabinet can duplicate discovery. | Hide partners without live collections. Remove hero/cover noise if it does not affect orderability. | Merge into `Shop Buying Discovery`: collections, brands, readiness, add to matrix. | Shop moves from collection view to matrix with no side quest. |
| `collection_order` | Matrix, checkout, registry, detail and tracking cross-link can become a route maze. Fake reserve at checkout is risky. | Remove fake reserve wording until actual reserve exists. Collapse registry/detail/status. | Merge into `Shop Assortment and Order Cockpit`. | Shop edits quantities, submits order, sees confirmation/amendment status. |
| `order_production` | Tracking/status/read-only panels duplicate collection_order detail. | Hide internal PO/factory noise. | Merge into `Shop Buyer Tracking Cockpit`. | Shop sees ETA, shipment, delay reason, delivery acknowledgement and issue action. |
| `comms` | Calendar order layer and logistics layer duplicate each other. Notification center missing. | Remove separate scoring for logistics calendar if it is same screen. | Merge into one order calendar with logistics filters and notification center. | Shop handles amendments, delays and delivery tasks from order context. |

Shop should be the easiest role: select, order, track, acknowledge.

### 67.3. Manufacturer cleanup

| Pillar | Current noise | What to remove/hide | What to merge | Target state |
|---|---|---|---|---|
| `development` | Brand development steps appear in manufacturer view. Dossier and sample queue duplicate. | Hide brand-only steps. Remove edit affordances for composition. | Merge read-only dossier, feasibility annotations and sample queue. | Manufacturer can comment, request clarification and prepare capacity. |
| `sample_collection` | Read-only peer context can look empty. | Do not create fake sample ownership. | Keep as "Sample execution context" only when factory action exists. | Manufacturer sees sample tasks or waits clearly. |
| `collection_order` | Manufacturer does not own B2B order, but can see demand. | Remove buyer-order controls. | Merge into expected PO/capacity signal. | Manufacturer sees forecast and expected workload. |
| `order_production` | Handoff queue, production orders, dossier, materials and cabinet are strong but scattered. Bulk ack appears twice. | Pick one bulk-ack owner; other surface links to it. Hide sample queue from production unless it blocks PO. | Merge into `Manufacturer PO Cockpit`. | Manufacturer accepts/clarifies PO, manages materials, production, QC and ready-to-ship. |
| `comms` | No single PO inbox, article/order threads may duplicate. | Remove generic chat entry if not tied to PO/article. | Merge into `Manufacturer PO Inbox`. | Every clarification becomes task/status/event. |

Manufacturer should not browse the platform. Manufacturer should execute PO.

### 67.4. Supplier cleanup

| Pillar | Current noise | What to remove/hide | What to merge | Target state |
|---|---|---|---|---|
| `development` | BOM, materials, price chat and cabinet are related but split. Legacy supplier hub remains outside core. | Remove legacy hub from core nav. Do not show empty RFQ if BOM is not ready. | Merge into `Supplier Material Readiness Cockpit`. | Supplier sees BOM, price, availability, alternatives and quote action. |
| `sample_collection` | Peer BOM context can look like a fake section. | Keep context-only label. | Merge with sample material availability. | Supplier supports samples only through material readiness. |
| `collection_order` | Supplier does not create B2B orders. Forecast cells can be vague. | Remove sales/order wording. | Merge into material demand forecast. | Supplier sees likely demand and risk. |
| `order_production` | Procurement, BOM x PO, chain, handoff read and cabinet create too many nav entries. Multi-article wizard demo-only. | Remove three separate nav entries. Mark demo-only wizard until real multi-article PO bundle exists. | Merge into `Supplier Procurement Cockpit`. | Supplier quotes, reserves, dispatches and proves delivery for `poId/bomId`. |
| `comms` | Development price chat aliases comms article chat. Quote templates are not enough. | Do not show alias as separate nav destination. | Merge into quote inbox with SLA and quote card. | Supplier messages become quote, ETA, reserve or exception. |

Supplier should feel commercially useful, not like a read-only BOM viewer.

## 68. Cross-cutting merge plan

These are the biggest consolidation moves. They reduce noise while increasing clarity.

### 68.1. Replace many pages with four cockpits

Build these as first-class core surfaces:

| Cockpit | Replaces / wraps | Main entity | Roles served |
|---|---|---|---|
| `Brand Article Development Cockpit` | W2 hub, dossier, range, PG sync, development cabinet, cross links | `articleId`, `dossierId`, `bomId` | Brand, Manufacturer, Supplier as context |
| `Brand Publishing Cockpit` | linesheets, showroom, publish, sample_collection cabinet | `collectionId`, `articleId` | Brand, Shop |
| `Brand Order Cockpit` | brand registry, detail, retailer context, chain, collection_order cabinet | `orderId` | Brand, Shop |
| `Production Timeline Cockpit` | handoff, chain, production registry, dossier view, materials, shipment | `orderId`, `poId` | Brand, Manufacturer, Supplier, Shop as safe view |
| `Shop Assortment and Order Cockpit` | showroom entry, matrix, checkout, registry/detail | `matrixId`, `orderId` | Shop, Brand |
| `Shop Buyer Tracking Cockpit` | tracking, order_production status, delivery calendar | `orderId`, `shipmentId` | Shop, Brand |
| `Manufacturer PO Cockpit` | handoff queue, production orders, dossier, materials, production cabinet | `poId` | Manufacturer, Brand, Supplier |
| `Supplier Procurement Cockpit` | BOM, materials, procurement, BOM x PO, handoff read, supplier cabinet | `bomId`, `poId`, `rfqId` | Supplier, Manufacturer, Brand |
| `Entity Inbox` | role messages, article chat, order chat, calendar links | `threadId` plus entity ID | all roles |

Old routes stay as wrappers until deleted or archived.

### 68.2. Collapse duplicate UI patterns

| Duplicate pattern | New rule |
|---|---|
| mini card vs full page | Mini card is a summary only. Full page is the cockpit. Same data source. |
| registry vs detail | Registry lists entities. Detail owns actions. No duplicated status logic. |
| status strip vs chain card vs order facts | One timeline component. Other places show one-line summary. |
| order calendar vs logistics calendar | One entity calendar with filters. |
| article chat vs price chat alias | One entity thread with topic/template. |
| context strip repeated everywhere | One `ContextActionsBar`, max 3 visible actions, rest in menu. |
| read-only cell vs active cell | Two different templates. Never make context-only look actionable. |

### 68.3. Define what belongs in main cockpit

Main cockpit can show:

- current status;
- current owner;
- one primary action;
- blocking issue;
- next milestone;
- timeline summary;
- source badge;
- linked thread/task;
- exception badge.

Main cockpit should not show:

- full marketing copy;
- broad feature lists;
- advanced analytics;
- generic AI cards;
- unrelated routes;
- duplicate export buttons;
- old demo panels;
- full document previews unless user opens them.

## 69. Noise removal backlog by severity

### P0 - remove trust-breaking noise

Do first:

1. No silent demo/fallback in Platform Core.
2. No button that does not create state/event/task/document/visibility.
3. No archive/advanced route visible as core.
4. No duplicate status source for same `orderId/poId`.
5. No fake reserve wording at checkout.
6. No old broad profile/distributor/admin vocabulary inside 4-role core.
7. No heavy Workshop2/B2B/factory workspace imported by `/platform` shell.
8. No read-only cell styled like active workflow.

### P1 - remove workflow noise

Do after P0:

1. Collapse Brand registry/detail/chain into Brand Order Cockpit.
2. Collapse Shop registry/detail/status into Buyer Order Cockpit.
3. Collapse Manufacturer handoff/orders/materials into PO Cockpit.
4. Collapse Supplier procurement/BOM/chain/handoff into Procurement Cockpit.
5. Merge calendar order/logistics layers.
6. Convert all context strips to one capped action bar.
7. Add entity-first inbox for all roles.
8. Convert pre-order/prebook into order status, not a separate route.

### P2 - remove polish and scale noise

Do later:

1. Move advanced AI/maps/finance/EDI/landed-cost into lazy advanced drawers.
2. Replace investor-specific blocks with evidence exports.
3. Add configurable role dashboards only after default cockpits are stable.
4. Add feature flags for enterprise modules.
5. Add per-role onboarding that uses real next action, not explanation text.

## 70. What each role must feel after cleanup

### 70.1. Brand user

Brand should think:

```text
I know what products are ready, what buyers ordered,
what I must confirm, what is in production,
what is blocked, and who needs my decision.
```

If Brand sees twenty links before one decision, Platform Core failed.

### 70.2. Shop user

Shop should think:

```text
I can find a collection, build my size/quantity matrix,
send an order, handle amendments, track delivery,
and confirm receipt without learning the factory backend.
```

If Shop sees internal MES, supplier BOM complexity or unrelated discovery widgets, Platform Core failed.

### 70.3. Manufacturer user

Manufacturer should think:

```text
I know which PO arrived, whether I can accept it,
what dossier/materials are blocking it,
what is in production, and what must ship next.
```

If Manufacturer sees B2B buyer controls or brand marketing widgets, Platform Core failed.

### 70.4. Supplier user

Supplier should think:

```text
I know what materials are requested, for which PO,
what price/lead time/certificate is needed,
what I confirmed, and what delivery is at risk.
```

If Supplier sees generic marketplace, circular demo or unrelated sales pages as core, Platform Core failed.

## 71. Fashion-specific completeness checklist

Platform Core is for fashion, so the workflow must cover fashion-specific reality, not generic project management.

### 71.1. Product and collection

Must exist or be planned:

- collection/season;
- article/style;
- SKU and variants;
- colorways;
- size grid;
- assortment tiers;
- price and currency;
- MOQ and pack size;
- commercial terms;
- publish readiness;
- linesheet/showroom output.

Garbage to remove:

- product descriptions without readiness;
- beautiful catalog cards without orderability;
- collection pages that do not lead to matrix/order.

### 71.2. Development and production package

Must exist or be planned:

- tech pack/dossier;
- BOM;
- composition;
- construction details;
- trims/hardware;
- sample status;
- fit/size comments;
- factory feasibility notes;
- locked/provisional package state;
- exportable production package.

Garbage to remove:

- investor-only export not tied to dossier evidence;
- separate read-only summaries that duplicate dossier;
- advanced drafting tools loaded before the article cockpit.

### 71.3. B2B buying

Must exist or be planned:

- buyer account;
- partner relationship;
- seasonal matrix;
- size/quantity editing;
- reserve policy;
- checkout;
- amendment;
- confirmation;
- terms;
- order event trace.

Garbage to remove:

- social/gamification/VIP/trade-show features before order flow is stable;
- fake reserve;
- old pre-order route outside order status;
- registry/detail/status duplicates.

### 71.4. Manufacturing

Must exist or be planned:

- handoff;
- PO;
- acceptance/clarification;
- material gate;
- production stages;
- QC;
- packing;
- ready-to-ship;
- ERP/MES retry or failure state;
- shop-floor bundle.

Garbage to remove:

- factory screens not linked to `poId`;
- bulk ack in two places without one source of truth;
- brand-only steps in manufacturer view;
- sample queue hidden in the wrong pillar without context.

### 71.5. Supplier and materials

Must exist or be planned:

- material catalog;
- BOM line ownership;
- quote/RFQ;
- MOQ/price/lead time;
- reserve;
- substitute material proposal;
- certificates;
- dispatch;
- delivery proof to factory;
- late material exception.

Garbage to remove:

- supplier circular demo without data;
- supplier sales pages not tied to BOM/PO;
- chat alias as separate nav;
- demo-only multi-article wizard shown like production.

### 71.6. Logistics, documents and compliance

Must exist or be planned:

- shipment;
- ETA;
- carrier/tracking;
- packing list;
- invoice status;
- certificate of origin;
- EAC/label/marking where relevant;
- customs/duty estimate if cross-border;
- delivery acknowledgement;
- claim/return.

Garbage to remove:

- map/AI/logistics visualizations without real shipment ID;
- compliance cards without document status;
- calendar layers that duplicate same shipment task.

### 71.7. Communication and decisions

Must exist or be planned:

- entity thread;
- decision card;
- task;
- calendar commitment;
- SLA;
- escalation;
- read receipt or acknowledgement;
- event trace.

Garbage to remove:

- chat as a generic messenger;
- decisions buried in free text;
- threads without `orderId/articleId/poId/bomId`;
- duplicate article/order chat aliases with no dedupe.

## 72. Investor and user clarity layer

Platform Core must be understandable to two audiences at once:

- real operators who use it daily;
- investors who need to see why it can become a valuable SaaS/product ecosystem.

These audiences need different surfaces.

### 72.1. For operators

Operators need:

- one cockpit per daily job;
- one primary action;
- short labels;
- no marketing copy;
- no fake metrics;
- exact owner and next owner;
- clear block reason;
- fast mobile/tablet access;
- trust that status is real or clearly demo.

### 72.2. For investors

Investors need:

- one golden-path demo script;
- visible 4 roles x 5 pillars;
- proof that one order crosses roles;
- event trace;
- market-specific fashion depth: tech pack, BOM, B2B order, PO, materials, shipment, compliance;
- evidence exports;
- honest demo/live badges;
- performance and architecture discipline.

### 72.3. Separation rule

Do not put investor narrative inside operator workflow.

Instead:

- operator cockpit stays compact;
- investor demo mode can show guided overlay;
- evidence/export area can generate summaries;
- `/platform` can show readiness scores;
- detailed explanation lives in docs or demo overlay, not in working cells.

## 73. Audit gap closure: what must be added to the project plan

After reviewing the whole audit, these items should be explicitly tracked as future plan items.

### 73.1. Platform Core garbage register

Create a living register:

```text
PLATFORM-CORE-GARBAGE-REGISTER.md
```

Columns:

- item;
- current path;
- role;
- pillar;
- garbage class;
- decision: remove, merge, hide, adapter, keep;
- target cockpit;
- owner;
- verification.

This prevents "temporary" noise from becoming permanent.

### 73.2. Platform Core source-of-truth map

Create a concise map:

```text
entity -> source -> UI owner -> event owner -> test
```

Required entities:

- article;
- dossier;
- BOM;
- sample;
- collection;
- matrix;
- order;
- PO;
- RFQ;
- material reserve;
- production run;
- shipment;
- invoice/payment status;
- claim;
- thread;
- calendar event;
- document.

### 73.3. Demo/live inventory

Create an inventory of all Platform Core visible data:

- PG/API;
- file store;
- seed;
- localStorage;
- memory;
- mock;
- estimated;
- imported.

Each row must say:

- visible to user?
- badge exists?
- strict mode behavior?
- replacement plan?

### 73.4. Cockpit consolidation epic

Track each cockpit:

- Brand Article Development Cockpit;
- Brand Publishing Cockpit;
- Brand Order Cockpit;
- Brand Production Timeline;
- Shop Assortment and Order Cockpit;
- Shop Buyer Tracking Cockpit;
- Manufacturer PO Cockpit;
- Supplier Procurement Cockpit;
- Entity Inbox.

Each cockpit must list:

- routes it replaces;
- old routes that remain wrappers;
- advanced drawers;
- event outputs;
- E2E proof.

### 73.5. Role usefulness score

Add a score per role:

| Role | Must answer daily | Failure sign |
|---|---|---|
| Brand | What must I create, publish, confirm, hand off or unblock? | Too many dashboards, no decision. |
| Shop | What can I buy, what did I order, where is it, what must I approve? | Too many discovery pages, weak tracking. |
| Manufacturer | What PO must I accept/produce/ship? | Too much brand/buyer noise. |
| Supplier | What material must I quote/reserve/deliver? | BOM viewer without commercial action. |

### 73.6. Investor proof pack

Build a proof pack only after the core path works:

- one order story;
- screenshots of 4 roles;
- event trace;
- data source labels;
- performance numbers;
- architecture boundary;
- tests passed;
- roadmap with remaining enterprise modules.

This avoids pitching a collection of demos as a finished operating system.

## 74. Final cleanup doctrine

The best Platform Core will not be the one with the most features.

It will be the one where:

- Brand can move product and orders forward;
- Shop can buy and track confidently;
- Manufacturer can execute PO without ambiguity;
- Supplier can quote/reserve/deliver materials with proof;
- every action creates evidence;
- every visible block has a job;
- every demo is honest;
- every old feature is either integrated, hidden or archived;
- every role has fewer screens but more useful actions.

The hardest product work now is subtraction with care.

```text
Keep the chain.
Remove the maze.
Turn links into actions.
Turn demo into evidence.
Turn role presence into role usefulness.
```

## 75. Benchmark-functional standard: JOOR, NuORDER, Centric, МойСклад

This section defines what Platform Core should cover functionally by learning from major analogs, but not copying them blindly.

The target positioning:

```text
Platform Core = Centric-like product/PLM depth
+ JOOR/NuORDER-like wholesale buying and ordering
+ МойСклад/1C-like Russian accounting, warehouse, documents and integrations
+ Syntha-specific cross-role operating chain for fashion.
```

### 75.1. What to learn from JOOR

JOOR's public positioning is B2B wholesale for fashion: brands and retailers, virtual showrooms, digital linesheets, order management, payments, reporting and ERP/PLM/POS integrations.

What Platform Core should take:

- Brand can build a wholesale-ready collection.
- Shop can discover, select, order and pay.
- Linesheets and showrooms are shoppable, not decorative.
- Orders are central operating objects.
- Payments/terms are connected to wholesale flow.
- Reporting shows wholesale performance.
- Integrations are not optional enterprise decoration; they are needed for trust.

What not to copy directly:

- broad global trade-show marketplace as first priority;
- marketing-heavy buyer discovery before the order/production chain works;
- "network size" positioning before real local value is proven.

### 75.2. What to learn from NuORDER

NuORDER emphasizes wholesale ecommerce, advanced sales tools, order management, configurations, payments, insights and assortments. It also highlights account-specific pricing, discounts, product selections, duplicate-buy prevention, localized size curves, real-time assortment collaboration and ERP/PLM/POS integrations.

What Platform Core should take:

- Shop assortment matrix must become a serious buying tool, not a cart.
- Account-specific pricing and availability are required.
- Size curves and store/channel allocation are required for fashion buying.
- Buyer teams need shared editable assortments.
- Duplicate buys, overbuying and markdown risk should be visible.
- Order and fulfillment tracking should live in the same buyer cockpit.

What not to copy directly:

- marketplace-first logic before trusted partner/order flow;
- too many discovery surfaces;
- generic "advanced sales tools" without Russian documents, marking and production connection.

### 75.3. What to learn from Centric

Centric PLM covers concept-to-commercialization: design, sourcing, prototyping, testing, certification, launch, costing, BOM accuracy, sustainability, compliance, visual boards, planning/pricing, PXM and product data control.

What Platform Core should take:

- Article development must become PLM-grade.
- Dossier/tech pack/BOM must be versioned and approved.
- Materials, suppliers, samples and certificates belong to product development, not late production chaos.
- Collection planning and visual boards should support assortment decisions.
- Costing and margin must be visible before order confirmation.
- Sustainability/compliance should attach to article/BOM/shipment evidence.

What not to copy directly:

- enterprise PLM breadth before the Syntha golden path is proven;
- AI inspiration as a core promise before source data is reliable;
- broad PXM/content syndication before articles/orders/production are stable.

### 75.4. What to learn from МойСклад and Russian business systems

МойСклад's public product direction is Russian cloud ERP for trade and production: sales, purchases, inventory, finance, clients, suppliers, product accounting, prices, purchase planning, stock control, reserves, modifications, inventory counts, documents, labels, invoices, waybills, EDI integrations, marketplaces, API and production support.

What Platform Core should take:

- Russian users expect documents, not only statuses.
- Stock/reserve must be concrete.
- Product cards must support variants, barcodes, prices and accounting fields.
- Purchase and supplier flows must create real operational documents.
- Production needs orders, tech operations, material write-off/reserve and shipments.
- Integration with 1C/МойСклад/ЭДО/marketplaces/banks/logistics is a credibility requirement.
- UI must remain simple and practical: fast for daily operators, not only impressive for demos.

What not to copy directly:

- generic ERP accounting as the first Platform Core surface;
- POS/retail cashier features unless a role needs retail sell-out;
- broad finance ledgers before order/production/material flows work.

## 76. Full pillar functionality target

The five pillars should be understood as a full fashion business process.

### 76.1. `development`: article and product development

Must include:

- collection/season context;
- article/style creation;
- SKU/variant/colorway/size grid;
- category, attributes and fit profile;
- product images/assets;
- dossier/tech pack;
- BOM and composition;
- trims, hardware and packaging;
- construction and production notes;
- sample request/status/approval;
- material supplier candidates;
- cost estimate and target margin;
- certificate/compliance requirements;
- marking category/rules where relevant;
- versioning and approval history;
- exportable production package;
- factory feasibility comments;
- supplier material feasibility comments.

Current direction is strong, but the gap is PLM discipline:

- versioned article states;
- locked/provisional BOM;
- cost/margin from BOM;
- certificate/document checklist;
- Russian marking readiness;
- clear approval path.

### 76.2. `sample_collection`: collection formation and publishing

Must include:

- collection line plan;
- assortment tiers;
- visual board or compact line board;
- sample status per article;
- readiness gate before publishing;
- digital linesheet;
- buyer showroom;
- wholesale prices and terms;
- available order window;
- media quality checklist;
- buyer groups/visibility;
- published/unpublished audit;
- buyer-safe DPP/compliance preview;
- shop matrix entry.

Current direction is good, but the gap is:

- linesheet/showroom/publish are still too separate;
- buyer readiness is not strict enough;
- visual collection planning should be useful, not decorative;
- published collection must carry commercial and document readiness.

### 76.3. `collection_order`: forming and confirming wholesale order

Must include:

- partner/customer account;
- buyer permissions;
- assortment matrix;
- size/quantity editing;
- store/channel allocation;
- localized size curves;
- account-specific prices;
- discounts;
- MOQ, pack size and order minimums;
- reserve/ATS policy;
- order draft;
- checkout/submission;
- amendment workflow;
- brand confirmation/rejection/counteroffer;
- terms and payment status;
- order documents;
- export to accounting/ERP;
- event trace and thread.

Current direction is commercially strong, but the gap is:

- fake reserve must be replaced with real reserve logic or honest badge;
- account-specific terms/prices are not mature enough;
- order amendments need full lifecycle;
- payment/document layer is too light;
- registry/detail/status duplicates must collapse into cockpits.

### 76.4. `order_production`: producing the order

Must include:

- confirmed order handoff;
- PO creation;
- factory acceptance/clarification;
- production package;
- BOM/MRP/material demand;
- supplier RFQ/reserve/dispatch;
- production batch/run;
- tech operations;
- labor/equipment/capacity if available;
- QC checkpoints;
- packing;
- marking/label generation;
- shipment;
- delivery proof;
- claim/return;
- payment milestone;
- final closeout.

Current direction is the most important operational differentiator, but the gap is:

- one PO timeline is needed across all roles;
- supplier/material state must be tied to PO/BOM;
- QC and claims need first-class state;
- marking and documents must become real Russian workflow;
- production should not be a set of separate factory pages.

### 76.5. `comms`: chat and calendar as operating layer

Must include:

- entity thread by `articleId/orderId/poId/bomId/rfqId/shipmentId`;
- role-aware inbox;
- decision cards;
- task creation;
- calendar commitments;
- SLA timers;
- reminders;
- file attachments;
- document requests;
- approvals;
- escalation;
- read/ack status;
- event trace.

Chat/calendar should never be "messenger plus calendar". They must be an operating layer over product, order, production and supplier decisions.

## 77. Role completeness target

### 77.1. Brand

Brand needs the broadest cockpit set.

Required complete functionality:

- create and manage collections;
- create articles/styles/SKUs;
- manage size grids, colorways and attributes;
- build tech pack/dossier;
- build BOM and costing;
- request/approve samples;
- publish linesheets/showroom;
- manage wholesale buyer visibility;
- receive and confirm orders;
- request/approve amendments;
- set prices, discounts, MOQ, terms;
- create production handoff/PO;
- monitor material and factory risk;
- approve QC/claims decisions;
- manage documents, certificates, marking readiness;
- communicate by article/order/PO thread;
- see calendar deadlines and next actions;
- export/import to 1C/МойСклад/ERP where needed.

What exists now:

- strong article/dossier/Workshop2 base;
- strong B2B order and handoff direction;
- good cross-links to shop/factory/supplier;
- useful comms/calendar pieces.

What is still missing:

- strict PLM versioning;
- BOM cost/margin maturity;
- full commercial terms;
- real reserve/payment/documents;
- Russian marking and EDI layer;
- one order/production timeline;
- fewer duplicate screens.

### 77.2. Shop

Shop needs to buy, control assortment and track delivery.

Required complete functionality:

- browse partner brands and collections;
- see article readiness and buyer-safe product data;
- compare linesheets/showrooms;
- build seasonal assortment matrix;
- plan by store/channel;
- use size curves;
- avoid duplicates/overbuying;
- track budget/open-to-buy;
- submit order;
- approve amendments/counteroffers;
- see terms/payment;
- track production/shipment;
- receive goods;
- verify marking/documents;
- open claim/return;
- communicate by order/shipment thread;
- sync order/receipts to МойСклад/1C.

What exists now:

- strong showroom -> matrix -> checkout path;
- tracking/read-only visibility is directionally correct;
- B2B order registry/detail exists.

What is still missing:

- real assortment planning depth like NuORDER;
- store/channel allocation;
- size curves;
- open-to-buy/budget;
- delivery acknowledgement batch;
- claims/returns;
- Russian document receipt and marking acceptance;
- one buyer order cockpit.

### 77.3. Manufacturer

Manufacturer needs to execute PO, not browse B2B.

Required complete functionality:

- view tech pack/dossier;
- comment/clarify before acceptance;
- estimate feasibility/capacity;
- accept/reject/clarify PO;
- create production batch;
- plan tech operations;
- reserve/write off materials;
- request supplier materials;
- track production stages;
- perform QC;
- generate packing/labels;
- manage shipment readiness;
- report delays;
- attach production evidence;
- communicate by PO/article thread;
- calendar production milestones;
- sync production/order docs to accounting/ERP.

What exists now:

- handoff queue;
- production orders;
- dossier read-only;
- materials procurement;
- PO/factory links;
- factory messages/calendar.

What is still missing:

- one Manufacturer PO Cockpit;
- comment-only annotations in dossier;
- capacity/MRP depth;
- QC states;
- marking/packing documents;
- material write-off/reserve;
- production evidence and closeout;
- fewer duplicate handoff/order surfaces.

### 77.4. Supplier

Supplier needs to quote, reserve and deliver materials.

Required complete functionality:

- maintain material catalog;
- expose MOQ, price, lead time, certificates;
- receive BOM/RFQ context;
- quote/counterquote;
- reserve materials;
- propose substitutes;
- dispatch materials;
- attach certificates and delivery proof;
- notify delays;
- track SLA;
- manage payment/invoice status;
- communicate by BOM/PO/RFQ thread;
- sync supplier docs to ERP/accounting.

What exists now:

- BOM preview;
- materials workspace;
- procurement PATCH;
- BOM x PO progress;
- supplier comms;
- supplier cabinet.

What is still missing:

- real material catalog;
- weighted BOM criticality;
- quote card lifecycle;
- SLA timer;
- substitute approval;
- certificate/document upload;
- dispatch/delivery proof;
- one Supplier Procurement Cockpit.

## 78. Russian market layer

For Russian users, Platform Core must feel local and operationally credible. This means not only translating UI, but supporting local business artifacts.

### 78.1. Legal and counterparty data

Required:

- organization card;
- legal entity name;
- INN/KPP/OGRN where applicable;
- bank details;
- contract number;
- contract terms;
- responsible persons;
- buyer/supplier/manufacturer role in documents;
- legal address and shipment address;
- document signer/authority.

### 78.2. Prices, tax and money

Required:

- RUB-first pricing;
- multi-currency only where needed;
- VAT mode configurable;
- price with/without VAT;
- discounts;
- payment terms;
- prepayment/final payment;
- payment milestone;
- payment status;
- debtor/overdue indicator;
- no hardcoded tax rate in UI.

### 78.3. Documents

Required document types:

- commercial offer;
- invoice/payment request;
- contract/specification;
- order confirmation;
- production order/PO;
- УПД or equivalent transfer document;
- товарная накладная where needed;
- счет-фактура where needed;
- packing list;
- act/claim document;
- certificate/declaration document;
- document export package.

Platform Core should not become full accounting, but every order/PO/shipment must know which documents are required, ready, missing or sent.

### 78.4. ЭДО and accounting integrations

Required integration targets to design for:

- 1C;
- МойСклад;
- Диадок or similar EDI;
- СБИС or similar EDI;
- bank statement/payment status import;
- marketplace exchange where relevant;
- API import/export with versioned schema.

Minimum first version:

- export JSON/CSV/XLSX packages;
- import order/matrix/material price list;
- status "exported/sent/accepted/error";
- integration error queue.

### 78.5. Marking and traceability

For fashion categories affected by Russian marking rules, Platform Core must support:

- GTIN/barcode field;
- DataMatrix/marking code status;
- Честный ЗНАК readiness;
- code order/print/apply/transfer status;
- packaging/label template;
- acceptance/transfer of marked goods;
- return/claim handling for marked goods;
- role ownership: Brand/Manufacturer creates or applies, Shop accepts, Supplier may provide material certificates.

Do not build full marking integration first, but add the data model early. Otherwise later it will break article, production and shipment flows.

### 78.6. Marketplaces and channels

Russian fashion brands and shops often need:

- WB/Ozon/Yandex Market channel flags;
- marketplace barcode/label fields;
- content requirements;
- stock allocation by channel;
- price by channel;
- shipment scheme awareness;
- returns/claims from marketplaces.

This should be an advanced/channel layer, not the first Platform Core screen.

### 78.7. Logistics

Required:

- Russian address format;
- carrier/service field;
- pickup/warehouse/shipment points;
- delivery window;
- tracking number;
- delivery status;
- delay reason;
- proof of delivery;
- discrepancy/shortage claim.

## 79. Benchmark parity matrix

| Functional area | JOOR/NuORDER lesson | Centric lesson | МойСклад/RU lesson | Platform Core target |
|---|---|---|---|---|
| Product/article | Product must be sellable and visual. | PLM controls concept, BOM, sourcing, testing, certification. | Product card needs accounting fields, variants, barcodes. | Article cockpit with SKU, attributes, BOM, tech pack, cost, barcode, marking readiness. |
| Collection | Linesheet/showroom must be shoppable. | Line planning and visual boards guide decisions. | Price lists and documents matter. | Publishing cockpit with line plan, prices, terms, readiness and buyer visibility. |
| Buying | Buyer orders should be fast and visual. | Assortment decisions need data. | Reserves and stock are operational. | Shop matrix with quantities, size curves, budget, reserve policy and order submission. |
| Order | Central B2B object with edit/pay/report. | Order must connect to product data. | Order needs documents, status, payment and export. | One order cockpit with amendments, confirmation, documents, payment and trace. |
| Production | JOOR/NuORDER usually stop before deep production. | PLM connects sourcing and manufacturing. | Production orders and tech operations are expected. | PO cockpit with handoff, materials, production, QC, marking, shipment. |
| Supplier | Network/partner relationship matters. | Supplier collaboration and sourcing matter. | Purchase docs and supplier terms matter. | Supplier procurement cockpit with RFQ, quote, reserve, docs, SLA and dispatch. |
| Comms | Buyer/brand collaboration supports order. | Approvals and workflows reduce email chaos. | Operators need tasks and documents. | Entity inbox with decision cards, task/calendar, files and event trace. |
| Integrations | ERP/PLM/POS integrations are key. | Data control across systems is key. | 1C/МойСклад/ЭДО/marketplaces are key. | Integration queue and versioned import/export from day one. |

## 80. Missing action inventory

These actions should exist eventually. If an action does not exist, the corresponding role is not yet complete.

### 80.1. Article and collection actions

- create article;
- duplicate article;
- assign to collection;
- add SKU/variant;
- add size grid;
- add colorway;
- add attributes;
- add BOM;
- set target cost;
- request sample;
- approve/reject sample;
- lock dossier;
- mark as ready for publishing;
- publish/unpublish;
- create linesheet;
- assign buyer visibility;
- export product package.

### 80.2. Order actions

- add to matrix;
- edit size/quantity;
- allocate by store/channel;
- validate MOQ/pack/minimum;
- reserve or request reserve;
- submit order;
- request amendment;
- approve/reject amendment;
- confirm order;
- reject order with reason;
- generate documents;
- set payment terms;
- record payment status;
- export to accounting/ERP.

### 80.3. Production actions

- create handoff;
- create PO;
- accept PO;
- request clarification;
- create production run;
- request materials;
- confirm materials;
- start stage;
- complete stage;
- record QC pass/fail;
- create rework;
- pack;
- generate labels/marking package;
- mark ready to ship;
- ship;
- close production.

### 80.4. Supplier actions

- receive RFQ;
- send quote;
- counterquote;
- confirm MOQ/lead time;
- reserve material;
- propose substitute;
- upload certificate;
- dispatch materials;
- confirm delivery to factory;
- report delay;
- close supplier obligation.

### 80.5. Comms/calendar actions

- create entity thread;
- request decision;
- make decision;
- create task;
- assign owner;
- set due date;
- attach document;
- convert message to amendment;
- convert message to claim;
- create calendar milestone;
- escalate delay;
- close thread with outcome.

## 81. What Platform Core should not copy from analogs

Do not copy:

- JOOR-style global marketplace as the first product surface;
- NuORDER-style broad sales-tool suite before the Russian order/doc/production chain works;
- Centric-scale PLM breadth before one article-to-order-to-production path is clean;
- МойСклад-style full ERP/accounting as a main navigation pillar;
- marketplace integrations as default visible core before B2B order stability;
- AI recommendations as decision-makers;
- trade-show/event layers before sample_collection and collection_order are strong.

Copy the useful mechanics, not the entire product shape.

## 82. Russian Platform Core development waves

### Wave R0 - benchmark and Russian requirements contract

Create a short contract:

- what we take from JOOR;
- what we take from NuORDER;
- what we take from Centric;
- what we take from МойСклад/Russian accounting;
- what we intentionally do not build yet.

Done when:

- every feature has role/pillar/entity mapping;
- no analog feature is added only because "competitor has it".

### Wave R1 - PLM-grade article foundation

Build:

- article/SKU/variant model;
- size grid;
- attributes;
- tech pack versioning;
- BOM;
- sample state;
- costing;
- certificate/marking requirements;
- export package.

### Wave R2 - wholesale collection and buyer matrix

Build:

- publishing cockpit;
- line board;
- linesheet;
- showroom;
- buyer visibility;
- account-specific price/terms;
- Shop assortment matrix;
- size curves and channel allocation.

### Wave R3 - order and Russian documents

Build:

- order cockpit;
- amendment lifecycle;
- terms/payment status;
- document checklist;
- export package for accounting/ERP;
- reserve policy;
- integration queue.

### Wave R4 - production and supplier operating chain

Build:

- PO cockpit;
- manufacturer acceptance;
- supplier RFQ/reserve;
- production run;
- material gate;
- QC;
- shipment readiness;
- supplier delivery proof.

### Wave R5 - Russian compliance and integrations

Build:

- marking data model;
- document statuses;
- EDI/export statuses;
- 1C/МойСклад adapter contract;
- marketplace/channel advanced layer;
- bank/payment import.

### Wave R6 - advanced intelligence and analytics

Only after R1-R5:

- sell-through insights;
- duplicate-buy prevention;
- markdown risk;
- demand forecast;
- landed cost;
- AI suggestions;
- visual boards;
- strategic planning.

## 83. Investor-ready positioning after this gap closes

The investor story should be:

```text
Syntha is not just another wholesale showroom.
It connects fashion product development, wholesale buying,
production, materials, Russian documents, marking, logistics
and entity-based communication in one operating chain.
```

This is stronger than copying JOOR/NuORDER because it includes production and suppliers.

It is stronger than copying Centric because it reaches buyer order and Russian operations.

It is stronger than copying МойСклад because it understands fashion product development and B2B wholesale context.

But this story is only credible when:

- one order crosses all four roles;
- data sources are labeled;
- documents and Russian workflow are not fake;
- role cockpits are compact;
- E2E tests prove second-role visibility;
- mobile/tablet/desktop UI is calm and usable.

## 84. Benchmark source notes checked on 2026-06-21

The benchmark above was based on public official pages checked on 2026-06-21:

- JOOR official site: wholesale platform, virtual showrooms, digital linesheets, order management, payments, reporting and integrations.
- NuORDER official site: wholesale ecommerce, advanced sales tools, order management, configurations, payments, insights, assortments, localized size curves, duplicate buy prevention and integrations.
- Centric official site: PLM, planning/pricing, PXM, visual boards, concept-to-commercialization, BOM, sourcing, testing, certification, sustainability and compliance.
- МойСклад official site: Russian cloud ERP for sales, purchases, accounting, finance, customers/suppliers, product accounting, prices, purchase planning, reserves, documents, EDI, marketplaces, API and production.

These are not copy targets. They are reference points for completeness.

## 85. Execution contract for Cursor: every audit item must become a concrete Platform Core action

This section converts the whole audit into an execution contract.

The goal is not to add more abstract opinion. The goal is to make every useful finding in this document executable inside Platform Core without breaking the current project.

From this point forward, Cursor must treat every improvement as an action card with this shape:

```text
Action ID:
Problem:
Business reason:
User role affected:
Pillar affected:
Current files:
Target files:
Exact change:
What must not be changed:
Compatibility rule:
Validation:
Documentation update:
Rollback note:
Status:
```

If a recommendation cannot be written in this form, it is not ready to implement.

The Platform Core work must follow this principle:

```text
One visible product improvement = one clear code path = one preserved compatibility path = one validation step.
```

Do not start by rewriting the whole project. Start by restoring a stable Platform Core nucleus, then move duplicated or scattered behavior into that nucleus, then replace noisy/demo-only flows with real role/pillar actions.

The expected result is:

- `/platform` works as the central Platform Core view;
- 4 roles are visible and useful: Brand, Shop, Manufacturer, Supplier;
- 5 pillars are visible and actionable: development, sample/collection, collection/order, order/production, communication/calendar;
- each role/pillar cell has owner, data source, next action, output and next connected role;
- archived code is not imported directly into the live platform;
- old routes continue to work through wrappers, redirects or compatibility exports;
- heavy modules are lazy-loaded and do not slow the first Platform Core screen;
- demo/mock/fallback data is clearly labeled;
- no user or investor sees noise, broken links, duplicate surfaces or unfinished fake workflows.

## 86. Mandatory safety protocol before any Platform Core change

Cursor must do these steps before editing Platform Core files.

### 86.1 Read current state first

Action:

```text
Run a local status check.
Read the files that will be touched.
Check whether the same files already contain user changes.
Do not overwrite user work.
```

Concrete files to check before most Platform Core work:

- `Projects/_ai-share/synth-1-full/package.json`;
- `Projects/_ai-share/synth-1-full/src/lib/routes.ts` or the current route constant file if route constants live elsewhere;
- `Projects/_ai-share/synth-1-full/src/lib/platform-core-readiness-sections`;
- `Projects/_ai-share/synth-1-full/src/app/platform/page.tsx`, if it exists;
- `Projects/_ai-share/synth-1-full/src/features/platform-core`, if it exists;
- `Projects/_platform-core-split/platform-core/CONNECTIONS.md`;
- `Projects/_platform-core-split/platform-core/SOURCE-LINKS.md`;
- `Projects/_platform-core-split/platform-core/MISSING-OR-EXTERNAL-LINKS.md`;
- `Projects/_platform-core-split/platform-core/ROLE-PILLAR-MATRIX.md`;
- this audit file.

Validation:

```text
No file is edited before its current state is understood.
No unrelated dirty file is reverted.
No archived code is copied blindly into the live app.
```

### 86.2 Never delete first

Action:

```text
When replacing a route, component, model or data helper, first create the new target.
Then point the old file to the new target through a compatibility export, wrapper, redirect or adapter.
Only after validation can old dead code be moved to archive or removed.
```

This applies especially to:

- route constants;
- cabinet routes;
- B2B order pages;
- workshop/article workspaces;
- supplier and factory pages;
- readiness sections;
- mock/fallback data helpers;
- archive imports.

Forbidden:

```text
Delete old route -> hope all links still work.
Move shared file -> leave old imports broken.
Replace data model -> silently change screen behavior.
Hide broken route by removing navigation.
```

### 86.3 Platform Core must be isolated, but not disconnected

Action:

```text
Create or use a dedicated Platform Core feature area.
Keep Platform Core logic there.
Keep old external areas connected through adapters.
Do not let Platform Core depend on large old workspaces directly on first render.
```

Target structure:

```text
src/features/platform-core/
  adapters/
  cockpits/
  events/
  matrix/
  model/
  readiness/
  routes/
  state/
  tests/
  ui/
```

Compatibility files may remain in `src/lib`, but only as thin exports.

Example:

```text
src/lib/platform-core-hub-matrix.ts
  exports from src/features/platform-core/matrix

src/lib/platform-core-readiness-audit.ts
  exports from src/features/platform-core/readiness
```

Validation:

```text
Old imports compile.
New Platform Core imports are centralized.
No archived folder becomes a runtime dependency.
```

### 86.4 Every visible action must produce an event or output

Action:

```text
For every button, menu item, CTA, tab or role action, define:
input -> owner -> action -> output -> next owner -> evidence.
```

If a button does not produce an output, it should be one of:

- removed;
- disabled with clear reason;
- converted to a read-only status;
- moved behind a future flag;
- connected to a real event stub with visible data source label.

Forbidden:

```text
Buttons that look active but do nothing.
Tabs that repeat the same content.
Cards that explain instead of advancing the workflow.
Demo paths that pretend to be production.
```

### 86.5 Validation must move from narrow to broad

Use this order after each change batch:

```text
1. Route/navigation validation.
2. Platform Core contract validation.
3. Type validation for touched area.
4. Lint errors.
5. Light E2E.
6. Role/cabinet E2E.
7. API/E2E if data contracts changed.
8. Bundle analysis if performance or imports changed.
```

Do not run the largest validation first if a small route/type check would catch the same mistake faster.

## 87. P0 actions: restore Platform Core integrity before adding new features

P0 is required before visual polish, advanced features, AI suggestions or investor demo refinement.

The project cannot be considered stable while the central Platform Core route, matrix model, readiness audit and route constants are incomplete.

### P0-A1 Restore the `/platform` route as the central Platform Core screen

Problem:

```text
The user refers to SYNTHA Platform Core at /platform.
The project must have a stable first screen for this idea.
If /platform is missing, broken or indirectly dependent on scattered workspaces, the core product story is weak.
```

Business reason:

```text
Investors and users need one clear place that explains the operating system through action, not through text.
```

Target files:

- `src/app/platform/page.tsx`;
- `src/features/platform-core/ui/PlatformCoreShell.tsx`;
- `src/features/platform-core/matrix/platform-core-matrix.ts`;
- `src/features/platform-core/routes/platform-core-routes.ts`.

Exact change:

```text
Create or repair /platform/page.tsx.
Make it render a lightweight PlatformCoreShell.
The first render must show the role x pillar matrix.
The first render must not import heavy Workshop2, B2B order, factory or supplier workspaces.
Each matrix cell must show status, owner, data source and next action.
Each matrix cell must link to the correct role/pillar detail.
```

What must not be changed:

```text
Do not remove existing role cabinet routes.
Do not rename old routes without wrappers.
Do not copy archive pages into /platform.
Do not load all role screens at once.
```

Validation:

```text
/platform opens locally.
Desktop, iPad and iPhone widths have no horizontal overflow.
Primary matrix is visible without scrolling through a long hero or marketing block.
Every visible link either works or is visibly marked as planned/disabled.
npm run validate:cabinet-nav
npm run validate:cabinet-nav-routes
npm run test:e2e:light
```

Documentation update:

```text
Update SOURCE-LINKS.md with the /platform page.
Update CONNECTIONS.md with /platform -> role/pillar links.
Update MISSING-OR-EXTERNAL-LINKS.md if any cell still points to a planned route.
```

### P0-A2 Create the dedicated `src/features/platform-core` nucleus

Problem:

```text
Platform Core logic is currently conceptually central but structurally scattered.
This makes it hard for Cursor to improve the product without touching unrelated areas.
```

Business reason:

```text
The core investor/user experience must have one maintainable home.
```

Target files:

- `src/features/platform-core/index.ts`;
- `src/features/platform-core/model/index.ts`;
- `src/features/platform-core/matrix/index.ts`;
- `src/features/platform-core/readiness/index.ts`;
- `src/features/platform-core/routes/index.ts`;
- `src/features/platform-core/ui/index.ts`;
- `src/features/platform-core/adapters/index.ts`;
- `src/features/platform-core/events/index.ts`.

Exact change:

```text
Create the feature folder.
Move only Platform Core-owned logic into it.
Keep compatibility exports in old src/lib files.
Do not move unrelated role workspaces yet.
Define the public API of Platform Core through index files.
```

Compatibility rule:

```text
Existing imports from src/lib/platform-core-* must keep working.
Old files should become thin re-export files.
```

Validation:

```text
Typecheck still resolves old imports.
New /platform imports from src/features/platform-core.
No circular import from role workspace back into platform-core UI.
```

Documentation update:

```text
Add the feature folder to SOURCE-LINKS.md.
Add ownership rule to CONNECTIONS.md.
```

### P0-A3 Restore `platform-core-hub-matrix`

Problem:

```text
The readiness sections reference platform-core-hub-matrix, but the source is missing or not available in the Platform Core split.
Without this model, the role/pillar hub cannot be reliable.
```

Target files:

- `src/features/platform-core/matrix/platform-core-hub-matrix.ts`;
- `src/lib/platform-core-hub-matrix.ts`.

Exact change:

```text
Define the canonical matrix model:
RoleId = brand | shop | manufacturer | supplier.
PillarId = development | sample_collection | collection_order | order_production | comms.
Cell status = live | partial | demo | planned | blocked.
Cell must include label, owner, href, dataSource, primaryAction, output, nextOwner and dependencies.
```

Required behavior:

```text
Brand development links to article/dossier work.
Brand sample_collection links to sample and collection readiness.
Brand collection_order links to publishing and B2B orders.
Brand order_production links to production handoff and PO timeline.
Brand comms links to entity chat/calendar.

Shop development is read-only market input unless the shop collaborates on private requests.
Shop sample_collection focuses on assortment review and line sheet decisions.
Shop collection_order focuses on cart, order, terms and documents.
Shop order_production focuses on delivery tracking and acceptance.
Shop comms focuses on order questions, approvals and calendar.

Manufacturer development is read-only context from brand article/dossier.
Manufacturer sample_collection focuses on sample feasibility and production comments.
Manufacturer collection_order is read-only demand/order context.
Manufacturer order_production owns PO acceptance, production stages, QC and shipment readiness.
Manufacturer comms focuses on PO chat, issues and calendar.

Supplier development is read-only material context unless a material is requested.
Supplier sample_collection focuses on material samples/swatches if relevant.
Supplier collection_order is read-only demand forecast/reserve context.
Supplier order_production owns RFQ, reserve, delivery and material proof.
Supplier comms focuses on material chat, delivery questions and calendar.
```

Compatibility rule:

```text
src/lib/platform-core-hub-matrix.ts must re-export from the new feature model.
Do not make old consumers import from archived folders.
```

Validation:

```text
Readiness sections compile.
Matrix renders all 20 role/pillar cells.
No cell has an empty href unless explicitly marked planned.
No cell has an active action without output.
```

### P0-A4 Restore `platform-core-readiness-audit`

Problem:

```text
Readiness sections depend on a readiness audit source.
If the audit model is missing, the UI may become hardcoded, duplicated or fake.
```

Target files:

- `src/features/platform-core/readiness/platform-core-readiness-audit.ts`;
- `src/lib/platform-core-readiness-audit.ts`;
- existing `src/lib/platform-core-readiness-sections/*`.

Exact change:

```text
Create a canonical readiness audit model.
Each section must include id, title, role, pillar, score, state, evidence, blockers, nextAction and targetFiles.
Expose helpers that group readiness by role and by pillar.
```

Required scoring:

```text
10 = live, connected, validated, fast, useful.
8-9 = mostly live, minor gaps.
6-7 = useful but partial or missing validation.
4-5 = demo-heavy or disconnected.
1-3 = placeholder/no real workflow.
0 = missing.
```

Compatibility rule:

```text
Existing readiness section imports must continue to work.
Do not duplicate readiness data in multiple files.
```

Validation:

```text
Readiness UI renders from one data source.
Every blocker has a nextAction.
Every nextAction maps to this audit or to a route/file.
```

### P0-A5 Add or repair missing Platform Core route constants

Problem:

```text
Several Platform Core connections reference route constants that are missing or not stable:
ROUTES.brand.coreCabinet
ROUTES.shop.coreCabinet
ROUTES.factory.productionCoreCabinet
ROUTES.factory.supplierCoreCabinet
```

Target files:

- main route constants file, usually `src/lib/routes.ts`;
- matching route pages under `src/app/...`;
- cabinet navigation validators.

Exact change:

```text
Add stable route constants for all four role core cabinets.
If the final page does not exist yet, create a thin wrapper page that points to the closest existing role cabinet.
Do not point a constant to a non-existing path.
Do not create constants that bypass validators.
```

Recommended route meaning:

```text
ROUTES.brand.coreCabinet = Brand Platform Core cockpit.
ROUTES.shop.coreCabinet = Shop Platform Core cockpit.
ROUTES.factory.productionCoreCabinet = Manufacturer Platform Core cockpit.
ROUTES.factory.supplierCoreCabinet = Supplier Platform Core cockpit.
```

Validation:

```text
npm run validate:cabinet-nav
npm run validate:cabinet-nav-routes
Search for every new constant and confirm it is used consistently.
Open each route locally or through E2E.
```

Documentation update:

```text
Update CONNECTIONS.md route map.
Update MISSING-OR-EXTERNAL-LINKS.md if any wrapper is temporary.
```

### P0-A6 Add Platform Core boundary validation

Problem:

```text
Without a boundary check, future work can accidentally re-connect archive, heavy workspaces or duplicate data into /platform.
```

Target files:

- `scripts/validate-platform-core-boundaries.ts`;
- `package.json`.

Exact change:

```text
Create a validation script that checks:
/platform does not import archived folders.
/platform does not import heavy role workspaces directly.
src/features/platform-core does not import from old pages.
compatibility files in src/lib/platform-core-* are thin exports only.
every matrix cell has role, pillar, href, status and primaryAction.
no active cell points to a missing route.
```

Add package script:

```json
"validate:platform-core-boundaries": "tsx scripts/validate-platform-core-boundaries.ts"
```

Implementation rule:

```text
Start as report-only if the current codebase is too noisy.
Then make it strict after P0 route and model restoration.
```

Validation:

```text
npm run validate:platform-core-boundaries
npm run check:contracts:ci
```

## 88. P1 actions: make Platform Core fast, clean and understandable on iPhone, iPad and MacBook

P1 is about usability, speed and trust.

The Platform Core screen must feel like a calm operating panel, not a marketing page, not a documentation page, and not a pile of demo cards.

### P1-A1 Build a matrix-first Platform Core shell

Target files:

- `src/features/platform-core/ui/PlatformCoreShell.tsx`;
- `src/features/platform-core/ui/PlatformCoreMatrix.tsx`;
- `src/features/platform-core/ui/PlatformCoreCell.tsx`;
- `src/features/platform-core/ui/PlatformCoreDetailPanel.tsx`;
- `src/features/platform-core/ui/PlatformCoreRoleTabs.tsx`;
- `src/features/platform-core/ui/PlatformCorePillarTabs.tsx`.

Exact change:

```text
First screen:
compact header;
role filter;
pillar filter;
20-cell matrix or mobile stacked equivalent;
right-side or bottom detail panel;
no long explanatory text;
no oversized hero;
no duplicate decorative cards.
```

Cell content:

```text
role;
pillar;
status;
owner;
data source;
primary next action;
output;
next connected role.
```

Mobile rule:

```text
iPhone: show one role at a time, pillars as compact tabs or segmented control.
iPad: show 2 columns or role grouped rows.
MacBook: show full matrix with detail panel.
```

Validation:

```text
No horizontal scroll.
No text overlaps inside cells.
Primary action is visible without long scroll.
The same visual language is used across all roles.
```

### P1-A2 Add data source labels everywhere Platform Core shows operational data

Problem:

```text
Users and investors cannot trust the system if demo, mock, local, seed and live data look the same.
```

Target files:

- `src/features/platform-core/ui/PlatformCoreDataSourceBadge.tsx`;
- `src/features/platform-core/model/data-source.ts`;
- all Platform Core cells and cockpits.

Exact change:

```text
Create a reusable data source badge.
Use it in every role/pillar cell and detail cockpit.
```

Allowed source types:

```text
live = real backend data;
database = persistent project database;
file_store = imported file data;
seed = seeded starter data;
local_storage = browser-only local data;
mock = mock/demo data;
estimated = calculated approximation;
imported = imported from external source;
fallback = shown because primary source failed.
```

Behavior:

```text
live/database/imported may look neutral.
seed/local_storage/estimated must be clearly labeled.
mock/fallback must be clearly labeled and never look production-ready.
```

Validation:

```text
Search for Platform Core numeric/status displays.
Every display has a source label or inherits one from its panel.
No mock/fallback text is hidden.
```

### P1-A3 Replace long explanations with action chains

Problem:

```text
The interface should not explain the platform in long text.
It should show what action is available, what it creates and who receives it next.
```

Target files:

- Platform Core cell components;
- detail panels;
- role cockpit headers.

Exact change:

```text
Replace long descriptions with:
Current state.
Next action.
Expected output.
Next owner.
Evidence/document/event.
```

Example:

```text
Bad:
"This section helps the brand manage article development and coordinate with future production partners..."

Good:
State: Dossier incomplete.
Next: Add size grid.
Output: Article dossier v3.
Next owner: Manufacturer.
Evidence: tech pack readiness 72%.
```

Validation:

```text
No Platform Core panel opens with more than 2 short explanatory sentences.
At least one concrete next action is visible in every active panel.
```

### P1-A4 Lazy-load heavy role details

Problem:

```text
The central /platform page should be fast.
It must not load full article workspace, order detail, factory timeline or supplier workspace before the user asks for that detail.
```

Target files:

- `src/app/platform/page.tsx`;
- `src/features/platform-core/ui/PlatformCoreDetailPanel.tsx`;
- adapters to existing role workspaces.

Exact change:

```text
Use dynamic imports for heavy detail modules.
On first render, load only matrix data and lightweight summaries.
Load role-specific cockpit only after user selects a cell or opens a route.
```

Validation:

```text
npm run analyze:bundle
Confirm /platform first bundle does not include full Workshop2 or full B2B order workspace unless selected.
```

### P1-A5 Standardize Platform Core visual language

Problem:

```text
Different parts of the project may use different tones, spacing, visual density and card styles.
This makes the platform look less serious to investors and harder for users.
```

Target files:

- `src/features/platform-core/ui/*`;
- shared design tokens if they already exist;
- `PLATFORM-CORE-UI-STANDARD.md`.

Exact change:

```text
Use one calm conservative UI style:
neutral background;
limited accent color;
clear typographic hierarchy;
compact controls;
small radius;
stable cell dimensions;
no decorative gradients/orbs;
no oversized marketing hero;
no nested cards;
no repeated explanatory banners.
```

Required controls:

```text
tabs for roles/pillars;
segmented controls for mode/filter;
icons for compact actions;
menus for secondary actions;
status badges for state/source;
drawer or panel for details;
calendar/chat entry points as utilities, not giant blocks.
```

Validation:

```text
Compare iPhone, iPad and MacBook screenshots.
No text overflow.
No button label wrapping into ugly blocks.
No repeated card-in-card patterns.
Primary action remains visually clear.
```

## 89. P2 actions: turn scattered role functionality into focused cockpits

P2 is about reducing duplicates and making each role useful.

Do not create more pages just because something is missing. First decide whether the missing thing belongs inside an existing cockpit.

### P2-A1 Brand Article Development Cockpit

Purpose:

```text
One place for creating and improving an article before it becomes part of a collection or production request.
```

Must include:

- article identity;
- photos/media;
- category;
- materials;
- size grid;
- colors;
- price target;
- tech pack readiness;
- sample status;
- production feasibility comments;
- version history;
- next action.

Target files:

- `src/features/platform-core/cockpits/brand/BrandArticleDevelopmentCockpit.tsx`;
- adapters to existing Workshop2 article/dossier modules;
- event model for article updates.

Exact change:

```text
Keep existing detailed article tools, but expose a compact cockpit summary in Platform Core.
Do not load the full article workspace on /platform first render.
Create a deep link from cockpit to full article workspace.
```

Validation:

```text
Brand can see article readiness.
Manufacturer can receive only the needed production context.
Shop does not see internal unfinished production notes unless explicitly published.
```

### P2-A2 Brand Collection Publishing Cockpit

Purpose:

```text
Turn ready articles into a shop-facing collection with line sheet, prices, terms and availability.
```

Must include:

- collection name/season/drop;
- article selection;
- wholesale price;
- MOQ;
- delivery window;
- size availability;
- sell-in status;
- line sheet status;
- publish/unpublish;
- shop visibility;
- change log.

Target files:

- `src/features/platform-core/cockpits/brand/BrandCollectionPublishingCockpit.tsx`;
- adapter to B2B catalog/line sheet modules;
- event `collection.published`.

Exact change:

```text
Collapse duplicate collection/listing/publishing surfaces into this cockpit.
Old pages should route into this cockpit or deep-link to the exact subsection.
```

Validation:

```text
Published collection is visible to Shop.
Unpublished/internal article is not visible to Shop.
Every published item has price, availability and terms status.
```

### P2-A3 Brand Order Cockpit

Purpose:

```text
Brand receives, confirms, amends and hands off shop orders to production.
```

Must include:

- incoming orders;
- buyer/shop;
- order lines;
- terms;
- payment state;
- document checklist;
- reserve state;
- confirmation;
- amendment flow;
- production handoff;
- communication thread.

Target files:

- `src/features/platform-core/cockpits/brand/BrandOrderCockpit.tsx`;
- adapter to existing B2B order detail pages;
- event `order.confirmed`;
- event `order.production_handoff_created`.

Exact change:

```text
Replace registry/detail duplication with one cockpit pattern.
Old order list and order detail may remain, but they should share the same order model and action handlers.
```

Validation:

```text
Shop order creates Brand-visible order.
Brand confirmation changes Shop status.
Brand production handoff creates Manufacturer-visible PO context.
```

### P2-A4 Shop Assortment and Order Cockpit

Purpose:

```text
Shop reviews collections, builds assortment, places order and tracks brand confirmation.
```

Must include:

- collection view;
- assortment board;
- size curve;
- duplicates/overlap warning if available;
- cart;
- terms;
- order submission;
- order status;
- documents;
- delivery calendar;
- brand chat.

Target files:

- `src/features/platform-core/cockpits/shop/ShopAssortmentOrderCockpit.tsx`;
- adapters to shop B2B catalog/order modules;
- event `shop.order_submitted`.

Exact change:

```text
Shop must not see internal brand development noise.
Shop sees only published collection data, order actions, documents, statuses and communication.
```

Validation:

```text
Shop can move from collection to order without dead ends.
Shop order appears for Brand.
Shop sees production/delivery status only after Brand/Manufacturer updates it.
```

### P2-A5 Manufacturer Production Cockpit

Purpose:

```text
Manufacturer accepts production order, manages stages, QC and shipment readiness.
```

Must include:

- PO intake;
- article tech pack snapshot;
- quantities;
- sizes/colors;
- delivery date;
- material readiness;
- stage plan;
- stage status;
- issue reporting;
- QC checklist;
- shipment readiness;
- communication with Brand and Supplier where allowed.

Target files:

- `src/features/platform-core/cockpits/manufacturer/ManufacturerProductionCockpit.tsx`;
- adapters to factory production pages;
- event `po.accepted`;
- event `production.stage_updated`;
- event `production.qc_completed`;
- event `production.shipment_ready`.

Exact change:

```text
Manufacturer owns production execution, not buyer order negotiation.
Show order context only as needed for production.
Do not expose Shop commercial terms unless explicitly needed.
```

Validation:

```text
Brand handoff creates Manufacturer-visible PO.
Manufacturer stage update appears for Brand.
Shop sees delivery-facing status, not internal factory details.
```

### P2-A6 Supplier Procurement Cockpit

Purpose:

```text
Supplier manages material requests, quotes, reserves and delivery proof.
```

Must include:

- RFQ;
- material identity;
- quantity;
- color/spec;
- certification;
- price;
- lead time;
- reserve confirmation;
- delivery status;
- documents;
- issue reporting;
- communication with Brand/Manufacturer.

Target files:

- `src/features/platform-core/cockpits/supplier/SupplierProcurementCockpit.tsx`;
- adapters to existing supplier pages;
- event `supplier.rfq_created`;
- event `supplier.reserve_confirmed`;
- event `supplier.delivery_confirmed`.

Exact change:

```text
Supplier should not own the full production order.
Supplier owns material commitments and evidence.
```

Validation:

```text
Manufacturer or Brand can create material request.
Supplier response updates material readiness.
Material readiness influences production status.
```

### P2-A7 Entity Inbox and Calendar

Purpose:

```text
Communication must be tied to entities, not scattered generic chat.
```

Target files:

- `src/features/platform-core/cockpits/shared/EntityInbox.tsx`;
- `src/features/platform-core/cockpits/shared/EntityCalendar.tsx`;
- `src/features/platform-core/events/entity-links.ts`.

Exact change:

```text
Every chat thread and calendar item must connect to an entity:
articleId;
collectionId;
orderId;
poId;
materialRequestId;
shipmentId.
```

Required behavior:

```text
No generic chat floating outside a workflow.
No calendar item without owner, date, entity and next action.
```

Validation:

```text
Open one order.
See its chat.
See its calendar events.
Move to Brand, Shop and Manufacturer views and confirm the same entity link is preserved with role-appropriate visibility.
```

## 90. P3 actions: build the event and state backbone

P3 makes the platform powerful instead of just visually organized.

### P3-A1 Create Platform Core entity IDs

Target files:

- `src/features/platform-core/events/entity-ids.ts`;
- `src/features/platform-core/model/entities.ts`.

Exact change:

```text
Define stable entity ids:
articleId;
dossierId;
sampleId;
collectionId;
lineSheetId;
shopOrderId;
brandOrderId;
productionOrderId;
purchaseOrderId;
materialRequestId;
supplierQuoteId;
shipmentId;
documentId;
threadId;
calendarEventId.
```

Rule:

```text
Do not pass anonymous objects between roles.
Every cross-role workflow must carry stable IDs.
```

Validation:

```text
One order can be traced from Shop submission to Brand confirmation to Manufacturer PO to Supplier material request.
```

### P3-A2 Create Platform Core event model

Target files:

- `src/features/platform-core/events/platform-core-event.ts`;
- `src/features/platform-core/events/event-log.ts`;
- `src/features/platform-core/events/event-handlers.ts`.

Exact change:

```text
Define event fields:
eventId;
eventType;
entityType;
entityId;
actorRole;
actorId;
createdAt;
source;
payload;
visibility;
nextActions.
```

Required event types:

```text
article.created;
article.updated;
article.ready_for_sample;
sample.requested;
sample.approved;
collection.created;
collection.published;
shop.order_submitted;
brand.order_confirmed;
brand.order_amended;
brand.production_handoff_created;
manufacturer.po_accepted;
manufacturer.stage_updated;
manufacturer.qc_completed;
supplier.rfq_created;
supplier.quote_sent;
supplier.reserve_confirmed;
supplier.delivery_confirmed;
shipment.ready;
shipment.sent;
document.created;
document.signed;
message.created;
calendar.event_created.
```

Validation:

```text
Each primary action in Platform Core creates or references an event.
Events are visible only to allowed roles.
Event source is labeled.
```

### P3-A3 Create state machines for core entities

Target files:

- `src/features/platform-core/state/article-state.ts`;
- `src/features/platform-core/state/collection-state.ts`;
- `src/features/platform-core/state/order-state.ts`;
- `src/features/platform-core/state/production-state.ts`;
- `src/features/platform-core/state/material-state.ts`;
- `src/features/platform-core/state/document-state.ts`.

Exact change:

```text
Define allowed statuses and transitions.
Block impossible transitions.
Expose next allowed actions by role.
```

Required status examples:

```text
Article:
draft -> dossier_in_progress -> sample_requested -> sample_approved -> ready_for_collection -> published -> archived.

Shop order:
cart -> submitted -> brand_review -> confirmed -> amended -> production_handoff -> in_production -> shipment_ready -> shipped -> received -> closed.

Production:
not_started -> accepted -> materials_pending -> cutting -> sewing -> finishing -> qc -> ready_to_ship -> shipped -> closed.

Material:
requested -> quoted -> reserved -> ordered -> in_delivery -> delivered -> issue -> closed.

Document:
missing -> draft -> issued -> sent -> signed -> exported -> archived.
```

Validation:

```text
UI buttons are generated from allowed next actions.
No role can jump to a forbidden state.
Status labels are consistent across all role views.
```

### P3-A4 Add trace view for one order across all roles

Target files:

- `src/features/platform-core/cockpits/shared/EntityTrace.tsx`;
- `src/features/platform-core/events/trace.ts`.

Exact change:

```text
Create a compact trace panel that shows:
entity;
current state;
events;
owner changes;
documents;
messages;
calendar milestones;
next action.
```

Validation:

```text
Pick one Shop order.
Trace must show Shop -> Brand -> Manufacturer -> Supplier if material request exists.
No step appears without timestamp/source.
```

## 91. P4 actions: add Russian business layer without turning Platform Core into accounting software

P4 is essential for Russian users.

The platform must understand Russian operational reality, but it should not become a full replacement for accounting, warehouse or ERP on day one.

### P4-A1 Add Russian document checklist to order and production cockpits

Target files:

- `src/features/platform-core/model/russian-documents.ts`;
- `src/features/platform-core/cockpits/shared/RussianDocumentChecklist.tsx`;
- Brand Order Cockpit;
- Manufacturer Production Cockpit;
- Supplier Procurement Cockpit;
- Shop Order Cockpit.

Exact change:

```text
Create a reusable checklist for documents:
commercial offer;
invoice;
contract/specification;
UPD;
waybill;
invoice-factura where needed;
act where needed;
certificate/declaration;
marking report where needed;
payment proof;
delivery proof.
```

Russian labels may be shown in UI where appropriate:

```text
счет;
договор;
спецификация;
УПД;
накладная;
счет-фактура;
акт;
сертификат;
декларация;
подтверждение оплаты;
подтверждение отгрузки.
```

Validation:

```text
Every order/PO has document status.
Missing documents are visible.
Documents are not faked as signed/exported.
```

### P4-A2 Add counterparty and terms model

Target files:

- `src/features/platform-core/model/counterparty.ts`;
- `src/features/platform-core/model/terms.ts`;
- order and PO cockpits.

Exact change:

```text
Track:
legal entity name;
INN;
KPP if relevant;
OGRN/OGRNIP if relevant;
legal address;
bank details readiness;
contract status;
payment terms;
delivery terms;
VAT mode;
currency;
responsible contact.
```

Rule:

```text
Do not hardcode one VAT or tax scenario.
Do not require all legal fields for every prototype user.
Show readiness and missing fields.
```

Validation:

```text
Brand and Shop order cannot look fully ready if counterparty/terms are missing.
Manufacturer/Supplier PO cannot look fully ready if terms and legal entity are missing.
```

### P4-A3 Add marking readiness for fashion goods

Target files:

- `src/features/platform-core/model/marking.ts`;
- `src/features/platform-core/cockpits/shared/MarkingStatus.tsx`.

Exact change:

```text
Track:
category marking requirement;
GTIN status;
DataMatrix status;
label template status;
aggregation if needed;
shipment marking readiness;
document/export status.
```

Rule:

```text
If marking is not needed for a product category, show not required.
If unknown, show requires review.
Never silently mark it ready.
```

Validation:

```text
Order and shipment readiness includes marking status.
Shop sees delivery-facing readiness.
Brand/Manufacturer see operational blockers.
```

### P4-A4 Add integration queue instead of fake integrations

Target files:

- `src/features/platform-core/model/integrations.ts`;
- `src/features/platform-core/cockpits/shared/IntegrationQueue.tsx`.

Exact change:

```text
Create integration status objects for:
1C;
МойСклад;
EDI;
marketplace/channel export;
bank/payment import;
file export;
API sync.
```

Allowed statuses:

```text
not_connected;
planned;
manual_export;
queued;
synced;
failed;
needs_review.
```

Rule:

```text
Do not show integration as live unless it really works.
Manual export is acceptable if clearly labeled.
```

Validation:

```text
Investor demo can explain what is live, what is manual and what is planned.
No fake connected badge.
```

## 92. P5 actions: reduce weight, token load and runtime slowness

P5 protects performance and Cursor usability.

The project must become easier to read, easier to edit and faster to open.

### P5-A1 Split large files into feature sections

Problem:

```text
Very large files slow Cursor, make AI edits risky and increase the chance of accidental regressions.
```

Action:

```text
Find files over roughly 600 lines.
Classify them as:
route wrapper;
state/model;
UI shell;
section component;
helper;
test.
Split only when the split creates clear ownership.
```

Known candidates to review:

- `Workshop2Phase1DossierPanel.tsx`;
- `Workshop2ArticleWorkspace.tsx`;
- `Workshop2TabContent.tsx`;
- `CategorySketchAnnotator.tsx`;
- `src/app/shop/b2b/orders/[orderId]/page.tsx`;
- `src/providers/b2b-state.tsx`;
- any Platform Core page that grows beyond a readable cockpit shell.

Exact change:

```text
Large route files become thin wrappers.
Large UI components become shell + sections.
State providers become domain slices.
Heavy visual/editor tools load only when opened.
```

Validation:

```text
The route still opens.
The main user path still works.
Typecheck for touched area passes.
No duplicated state source is created.
```

### P5-A2 Keep archive physically separate and runtime-disconnected

Problem:

```text
Archived code is useful as reference, but dangerous as a runtime dependency.
It can pull heavy or outdated patterns back into Platform Core.
```

Action:

```text
Archive stays outside live runtime.
Recover only specific useful ideas as new Platform Core code or adapters.
Document every recovered piece.
```

Allowed:

```text
Read archive for ideas.
Copy a small proven UI pattern manually into new Platform Core component.
Extract a data label concept.
Create a clean adapter if source is still live and maintained.
```

Forbidden:

```text
Import archive component directly into /platform.
Point a live route to archive.
Use archive data as production source.
Let archive files appear in first bundle.
```

Validation:

```text
Boundary validator checks no live Platform Core imports from archive.
SOURCE-LINKS.md records any idea recovered from archive.
```

### P5-A3 Maintain `.cursorignore` and project reading boundaries

Problem:

```text
Cursor slows down when it has to read archives, generated files, build output and irrelevant heavy assets.
```

Action:

```text
Keep ignored:
node_modules;
.next;
dist/build output;
coverage;
large archives;
screenshots/videos;
generated reports;
old experiments not needed for Platform Core.
```

Rule:

```text
Do not ignore live Platform Core source.
Do not ignore docs that define current architecture.
Do not ignore validation scripts.
```

Validation:

```text
Cursor can search Platform Core quickly.
Live imports still resolve.
Ignored files are not needed at runtime.
```

### P5-A4 Prevent first-screen bundle growth

Action:

```text
For /platform first screen, allow:
matrix model;
route links;
status summaries;
small UI controls;
source labels.

Do not allow:
full image annotator;
full article editor;
full order detail;
full factory timeline;
supplier workspace;
large mock datasets;
charts not visible on first screen.
```

Validation:

```text
npm run analyze:bundle
Compare before/after first bundle.
If bundle grows, identify exact import that caused growth.
```

## 93. Required validation ladder for safe development

Use this after each Platform Core change batch.

If a command cannot run because dependencies are missing or the environment is not ready, record it in the implementation notes. Do not pretend it passed.

### 93.1 Navigation and contracts

```text
npm run validate:cabinet-nav
npm run validate:cabinet-nav-routes
npm run validate:role-hub-matrix
npm run check:contracts:ci
npm run check:mock-fallback-contract
```

Purpose:

```text
Catch broken route constants, missing hub cells, invalid nav links and fake data fallbacks early.
```

### 93.2 Type and lint

```text
npm run typecheck
npm run typecheck:w2
npm run typecheck:order-subset
npm run lint:errors
```

Purpose:

```text
Catch broken imports, bad models, wrong role/pillar data and obvious code errors.
```

### 93.3 E2E

```text
npm run test:e2e:light
npm run test:e2e:cabinet-hubs
npm run test:e2e:api
npm run test:e2e:ru-signoff
```

Purpose:

```text
Prove that users can move through the important flows:
Platform Core opens;
role hubs open;
Shop order reaches Brand;
Brand handoff reaches Manufacturer;
Russian signoff/document layer does not lie.
```

### 93.4 Performance

```text
npm run analyze:bundle
```

Purpose:

```text
Confirm /platform stays light and heavy modules are lazy-loaded.
```

### 93.5 Manual visual checks

Required viewports:

```text
iPhone width;
iPad width;
MacBook width.
```

Check:

```text
no horizontal scroll;
no overlapping text;
no nested noisy cards;
no giant hero;
no long descriptions;
primary action visible;
source labels visible;
role/pillar navigation clear;
calendar/chat available where useful but not dominating.
```

## 94. Non-negotiable "do not break" rules

These rules are more important than speed.

```text
Never delete a live route before creating wrapper/redirect coverage.
Never move a shared file without leaving compatibility export.
Never change ROUTES without running route validation.
Never import archived modules into /platform runtime.
Never let demo/mock/fallback data look live.
Never add a primary button without output/event/state transition.
Never make Shop see internal factory-only details.
Never make Manufacturer own buyer negotiation.
Never make Supplier own the full buyer order.
Never load full Workshop2 workspace on /platform first render.
Never create a second source of truth for the same order/article/PO.
Never hide a broken link by deleting the navigation item.
Never use long text where a state/action/output chain is needed.
Never edit unrelated dirty files.
Never make UI louder when the goal is investor/user trust.
```

If Cursor finds a conflict between these rules and an implementation idea, stop that action and rewrite the action plan.

## 95. Concrete action card examples for Cursor

These examples show the level of specificity expected for all future work.

### PC-A001 Restore `/platform`

Problem:

```text
Central Platform Core route must exist and show the operating matrix.
```

Files:

```text
src/app/platform/page.tsx
src/features/platform-core/ui/PlatformCoreShell.tsx
src/features/platform-core/ui/PlatformCoreMatrix.tsx
src/features/platform-core/matrix/platform-core-hub-matrix.ts
src/features/platform-core/routes/platform-core-routes.ts
```

Steps:

```text
1. Create Platform Core feature folder if missing.
2. Create matrix model with 4 roles x 5 pillars.
3. Create lightweight shell.
4. Create /platform page that renders shell.
5. Ensure cells link to existing or wrapper routes.
6. Mark missing links as planned instead of active.
7. Add source/status labels.
```

Validation:

```text
npm run validate:cabinet-nav
npm run validate:cabinet-nav-routes
npm run test:e2e:light
Manual check on mobile/tablet/desktop.
```

Docs:

```text
Update SOURCE-LINKS.md.
Update CONNECTIONS.md.
Update MISSING-OR-EXTERNAL-LINKS.md.
```

Rollback:

```text
Remove /platform wrapper and feature files only if they are not referenced.
Do not touch old role routes.
```

### PC-A002 Add Platform Core data source badges

Problem:

```text
Users cannot distinguish live data from mock/demo/fallback data.
```

Files:

```text
src/features/platform-core/model/data-source.ts
src/features/platform-core/ui/PlatformCoreDataSourceBadge.tsx
Platform Core matrix and cockpit components.
```

Steps:

```text
1. Define data source types.
2. Add badge component.
3. Add badge to matrix cells.
4. Add badge to detail panels and cockpits.
5. Review every metric/status shown in Platform Core.
6. Mark mock/fallback visibly.
```

Validation:

```text
Search for displayed Platform Core metrics.
Every metric inherits or shows source.
Mock/fallback never appears as live.
```

Docs:

```text
Update PLATFORM-CORE-UI-STANDARD.md.
Update this audit status if implemented.
```

### PC-A003 Collapse Brand order list/detail duplication into Brand Order Cockpit

Problem:

```text
Order functionality is likely split between registry, detail, B2B order pages and status components.
This creates repeated UI and weak cross-role flow.
```

Files:

```text
src/features/platform-core/cockpits/brand/BrandOrderCockpit.tsx
existing shop/brand B2B order pages
order model/state/event files
route wrappers
```

Steps:

```text
1. Identify all Brand-facing order pages.
2. Identify shared order model.
3. Create cockpit shell with summary, lines, terms, documents, actions and trace.
4. Reuse existing order detail sections through adapters only if clean.
5. Point old Brand order route to cockpit or deep-link subsection.
6. Preserve old route URLs.
7. Add events for confirm, amend and production handoff.
```

Validation:

```text
Shop submits order.
Brand sees order.
Brand confirms.
Shop sees confirmed status.
Brand creates production handoff.
Manufacturer sees PO context.
```

Docs:

```text
Update CONNECTIONS.md order flow.
Update ROLE-PILLAR-MATRIX.md Brand and Shop cells.
```

### PC-A004 Add cross-role event trace

Problem:

```text
The platform needs proof that roles are connected by real workflow, not separate demos.
```

Files:

```text
src/features/platform-core/events/platform-core-event.ts
src/features/platform-core/events/trace.ts
src/features/platform-core/cockpits/shared/EntityTrace.tsx
order/article/production action handlers
```

Steps:

```text
1. Define event model.
2. Add event logging helper.
3. Add trace query by entity id.
4. Add trace panel to order and production cockpits.
5. Connect at least one full flow: Shop order -> Brand confirmation -> Manufacturer PO.
6. Add Supplier step when material request exists.
```

Validation:

```text
One entity trace shows role sequence, timestamps, states and source labels.
No event is visible to an unauthorized role.
```

Docs:

```text
Update CONNECTIONS.md with event chain.
Update SOURCE-LINKS.md with event files.
```

### PC-A005 Add Russian document readiness to order/production

Problem:

```text
Russian brands, shops, manufacturers and suppliers need document readiness, terms and export/integration status.
```

Files:

```text
src/features/platform-core/model/russian-documents.ts
src/features/platform-core/cockpits/shared/RussianDocumentChecklist.tsx
BrandOrderCockpit
ShopAssortmentOrderCockpit
ManufacturerProductionCockpit
SupplierProcurementCockpit
```

Steps:

```text
1. Define document types and statuses.
2. Add reusable checklist.
3. Add checklist to Brand/Shop order views.
4. Add checklist to Manufacturer/Supplier operational views.
5. Add missing document blockers to readiness score.
6. Add manual export/integration status.
```

Validation:

```text
Order cannot show fully ready with missing required document.
Document status is role-appropriate.
No fake signed/exported status.
```

Docs:

```text
Update ROLE-PILLAR-MATRIX.md.
Update PLATFORM-CORE-UI-STANDARD.md if new badges/statuses are added.
```

## 96. How Cursor must continue from this document

Cursor should not try to implement every section at once.

Use this exact order:

```text
1. P0-A1 Restore /platform.
2. P0-A2 Create src/features/platform-core nucleus.
3. P0-A3 Restore matrix model.
4. P0-A4 Restore readiness audit.
5. P0-A5 Repair route constants and wrappers.
6. P0-A6 Add Platform Core boundary validation.
7. P1-A1 to P1-A5 clean first-screen UX and speed.
8. P2-A1 to P2-A7 create role cockpits and reduce duplicates.
9. P3-A1 to P3-A4 add event/state backbone.
10. P4-A1 to P4-A4 add Russian business layer.
11. P5-A1 to P5-A4 reduce weight and protect Cursor/project performance.
```

Each implementation batch must end with:

```text
What changed.
What files changed.
What compatibility was preserved.
What validation was run.
What validation was not run and why.
What docs were updated.
What remains planned.
```

The minimum acceptable first implementation batch is:

```text
/platform opens.
Platform Core feature folder exists.
Matrix model exists.
20 role/pillar cells render.
Missing route constants are repaired or safely wrapped.
No archive runtime imports exist.
Docs reflect the new source links and remaining missing links.
```

The project is moving toward 10/10 only when the following is true:

```text
Every role has a useful cockpit.
Every pillar has real actions.
Every action creates output.
Every output connects to another role or final result.
Every important status has source/evidence.
Every demo/fallback is labeled.
Every route works or is clearly planned.
Every heavy module is lazy-loaded.
Every duplicate surface has an owner and merge plan.
Every Russian business requirement is represented as readiness, document, term, integration or marking status.
```

This is the core instruction for future Cursor work:

```text
Do not make Platform Core bigger by adding noise.
Make it stronger by turning scattered screens into connected role actions.
Make it faster by loading only what the user needs now.
Make it safer by preserving wrappers and compatibility exports.
Make it clearer by replacing descriptions with state, action, output and next owner.
Make it more credible by labeling data sources and Russian operational readiness.
```

## 97. Highest priority: Platform Core must not consume unnecessary Cursor context, tokens or runtime weight

This is the most important operational rule for the next stage.

Platform Core must not be developed as "the whole project". It must be developed as a clearly bounded product nucleus with a small active file set.

The archive must exist as reference, not as default working context.

The live platform must be small, readable, connected and validated.

The project is not healthy if Cursor needs to load half the repository to understand one role/pillar action.

### 97.1 Token economy is an architecture requirement

Treat token usage as part of product quality.

Bad state:

```text
Cursor has to read many unrelated pages.
Archive files appear in normal search results.
Platform Core depends on broad folders instead of narrow files.
One feature lives across many huge files.
Route pages contain business logic, UI, data mapping and mock data together.
Old demo code stays connected because nobody knows whether it is safe to remove.
```

Target state:

```text
Cursor can work on one Platform Core action with 5-12 relevant files.
Archive is ignored unless a task explicitly says "recover this archived item".
Every live Platform Core file has a clear owner and purpose.
Large files are split before they become monsters.
Old routes remain as wrappers, not as duplicated product surfaces.
Search, edit and validation are scoped to Platform Core first.
```

This means the cleanup is not cosmetic. It is required for speed, correctness and future development.

### 97.2 Platform Core must have a strict active file scope

Create and maintain a scope manifest.

Target document:

```text
Projects/_platform-core-split/platform-core/PLATFORM-SCOPE-MANIFEST.md
```

The manifest must divide files into these groups:

```text
LIVE_PLATFORM_CORE
  Files that are part of the current Platform Core product.
  Cursor may read/edit these by default for Platform Core work.

COMPATIBILITY_LAYER
  Thin wrappers, route wrappers and re-exports that preserve old imports/routes.
  Cursor may edit these only to keep connections safe.

ROLE_SOURCE_ADAPTERS
  Narrow adapters from old role areas into Platform Core.
  Cursor may edit these only for the specific role/pillar being worked on.

VALIDATION_AND_TESTS
  Scripts and tests that protect Platform Core boundaries.
  Cursor may edit these when behavior changes.

DOCUMENTATION
  Architecture, source links, connections, missing links, audit, UI standard.
  Cursor must update these after meaningful changes.

ARCHIVE_REFERENCE_ONLY
  Archived or legacy files.
  Cursor must not read/edit/import these by default.
```

Minimum manifest fields for every file:

```text
path:
group:
owner:
role:
pillar:
purpose:
allowed_actions:
can_import_from:
can_be_imported_by:
max_lines:
status:
notes:
```

Required statuses:

```text
live;
compatibility;
adapter;
planned;
archive_reference;
candidate_for_recovery;
deprecated;
delete_after_replacement;
```

Implementation action:

```text
Before adding new Platform Core code, create PLATFORM-SCOPE-MANIFEST.md.
Add current known platform documents and source links.
Mark broad source-link folders as investigation/reference, not active default context.
After src/features/platform-core exists, make it the primary live source area.
```

Validation:

```text
Every Platform Core task must name its scope group.
No task may say "work in the project generally".
No archived file may be touched without being listed as candidate_for_recovery first.
```

### 97.3 Default active Platform Core file set

Until the real `src/features/platform-core` folder is created, the active set is documentation plus the narrow source links already identified.

After P0 is implemented, the default active set should be:

```text
src/app/platform/page.tsx
src/features/platform-core/**
src/lib/platform-core-*.ts
src/lib/platform-core-readiness-sections/**
src/lib/routes.ts
scripts/validate-platform-*.ts
e2e/*platform*.spec.ts
e2e/*cabinet-hubs*.spec.ts
Projects/_platform-core-split/platform-core/*.md
Projects/_platform-core-split/MANIFEST.json
Projects/_platform-core-split/PHYSICAL-MOVE-PLAN.md
```

These are not default active context:

```text
_platform-core-split/legacy-rest/**
_platform-core-split/**/source-links/** as broad folders
_ai-share/synth-1-full/src/app/shop/b2b/** as a whole folder
_ai-share/synth-1-full/src/app/brand/** as a whole folder
_ai-share/synth-1-full/src/app/factory/** as a whole folder
_ai-share/synth-1-full/src/components/** as a whole folder
_ai-share/synth-1-full/e2e/** as a whole folder
old experiments
generated reports
screenshots/videos
build artifacts
```

Rule:

```text
Open broad folders only for audit.
For implementation, open only the exact files required by the selected action card.
```

### 97.4 Cursor context packs for safe work

Every future implementation task must declare a context pack.

#### Context pack P0: Platform Core nucleus

Use for:

```text
/platform route;
matrix;
readiness;
route constants;
boundary validation.
```

Files:

```text
src/app/platform/page.tsx
src/features/platform-core/**
src/lib/platform-core-hub-matrix.ts
src/lib/platform-core-readiness-audit.ts
src/lib/platform-core-readiness-sections/**
src/lib/routes.ts
scripts/validate-platform-core-boundaries.ts
Projects/_platform-core-split/platform-core/*.md
```

Do not load:

```text
full shop app;
full brand app;
full factory app;
full components folder;
legacy-rest.
```

#### Context pack Brand development

Use for:

```text
article;
dossier;
sample readiness;
collection readiness.
```

Allowed files:

```text
src/features/platform-core/cockpits/brand/**
src/features/platform-core/model/article*
src/features/platform-core/model/collection*
src/features/platform-core/events/**
narrow adapter files to existing Workshop2 article/dossier modules
```

Do not load:

```text
entire Workshop2 workspace;
image annotator unless the task is specifically visual annotation;
old unrelated brand pages.
```

#### Context pack Shop order

Use for:

```text
published collection view;
assortment;
cart;
order submission;
order status;
documents.
```

Allowed files:

```text
src/features/platform-core/cockpits/shop/**
src/features/platform-core/model/order*
src/features/platform-core/events/**
narrow adapter files to existing B2B order modules
```

Do not load:

```text
full src/app/shop/b2b folder;
all B2B components;
factory internals;
legacy checkout experiments.
```

#### Context pack Manufacturer production

Use for:

```text
PO acceptance;
production stages;
QC;
shipment readiness.
```

Allowed files:

```text
src/features/platform-core/cockpits/manufacturer/**
src/features/platform-core/model/production*
src/features/platform-core/model/material*
src/features/platform-core/events/**
narrow adapter files to existing factory production modules
```

Do not load:

```text
full factory app;
supplier full workspace unless material request is part of the task;
shop commercial order pages.
```

#### Context pack Supplier procurement

Use for:

```text
RFQ;
material reserve;
quote;
delivery;
certificates.
```

Allowed files:

```text
src/features/platform-core/cockpits/supplier/**
src/features/platform-core/model/material*
src/features/platform-core/model/russian-documents*
src/features/platform-core/events/**
narrow adapter files to existing supplier modules
```

Do not load:

```text
full supplier app;
full production app;
buyer-facing shop screens.
```

#### Context pack Communication and calendar

Use for:

```text
entity chat;
calendar;
event trace;
task reminders.
```

Allowed files:

```text
src/features/platform-core/cockpits/shared/EntityInbox.tsx
src/features/platform-core/cockpits/shared/EntityCalendar.tsx
src/features/platform-core/cockpits/shared/EntityTrace.tsx
src/features/platform-core/events/**
src/features/platform-core/model/calendar*
```

Do not load:

```text
generic chat experiments;
old calendar demos;
unconnected notification prototypes.
```

### 97.5 File size budgets

Platform Core must avoid monster files.

These budgets should be enforced by convention first, then by validation script.

```text
App route page:
  target: 40-120 lines;
  hard review threshold: 180 lines.
  Must only compose shell/provider/metadata.

Feature shell component:
  target: 120-250 lines;
  hard review threshold: 350 lines.

Section component:
  target: 80-220 lines;
  hard review threshold: 300 lines.

Model/type file:
  target: 80-250 lines;
  hard review threshold: 350 lines.

State machine file:
  target: 120-300 lines;
  hard review threshold: 450 lines.

Adapter file:
  target: 60-180 lines;
  hard review threshold: 250 lines.

Event handler file:
  target: 80-250 lines;
  hard review threshold: 350 lines.

Test file:
  target: 120-450 lines;
  hard review threshold: 600 lines.

Documentation file:
  may be long when it is an audit or plan;
  operational docs should be split by topic when they become hard to navigate.
```

Rule:

```text
If a live Platform Core file crosses the hard review threshold, do not add more feature code to it.
First split it by responsibility.
```

Split pattern:

```text
Bad:
One file contains route, data mapping, state, UI, actions, validation and mock data.

Good:
page.tsx = route wrapper.
PlatformCoreShell.tsx = layout and orchestration.
PlatformCoreMatrix.tsx = matrix UI.
platform-core-hub-matrix.ts = matrix data/model.
platform-core-event.ts = event types.
event-handlers.ts = action/event logic.
adapter.ts = old source mapping.
```

Validation action:

```text
Add scripts/report-platform-file-sizes.ts.
Add package script: report:platform-file-sizes.
The report must list Platform Core files above target and above hard threshold.
```

### 97.6 Archive quarantine protocol

The archive is not a source folder for the live product.

Archive statuses:

```text
archive_reference:
  kept only for learning or future comparison.

candidate_for_recovery:
  may contain a useful idea, but not yet approved for live use.

recovered_into_platform:
  useful behavior was rebuilt or adapted into src/features/platform-core.

rejected:
  reviewed and intentionally not used.

delete_after_confidence:
  safe to remove after validation and backup decision.
```

Rules:

```text
No runtime import from legacy-rest.
No route points to legacy-rest.
No Platform Core component imports archive UI directly.
No archive mock data becomes production data.
No Cursor task reads archive by default.
```

Recovery process:

```text
1. Name the archive file or folder.
2. Explain why it is valuable for a role/pillar.
3. Mark it candidate_for_recovery in PLATFORM-SCOPE-MANIFEST.md.
4. Extract only the needed behavior or idea.
5. Rebuild it inside src/features/platform-core or a narrow live adapter.
6. Add source note to SOURCE-LINKS.md.
7. Validate imports, route and UI.
8. Mark archive item recovered_into_platform or rejected.
```

Forbidden recovery:

```text
Copy a whole old page because one button is useful.
Import a whole archived component because its layout looks acceptable.
Bring back old demo state together with useful UI.
Add archive folder to normal Cursor context.
```

### 97.7 Boundary validation for archive and context safety

Add validation scripts:

```text
scripts/validate-platform-import-boundaries.ts
scripts/report-platform-file-sizes.ts
scripts/report-platform-context-scope.ts
```

Package scripts:

```json
"validate:platform-import-boundaries": "tsx scripts/validate-platform-import-boundaries.ts",
"report:platform-file-sizes": "tsx scripts/report-platform-file-sizes.ts",
"report:platform-context-scope": "tsx scripts/report-platform-context-scope.ts"
```

`validate-platform-import-boundaries.ts` must check:

```text
src/app/platform does not import archive.
src/features/platform-core does not import archive.
src/features/platform-core does not import from app routes.
src/features/platform-core does not import full role workspaces directly.
compatibility files only re-export or adapt.
archive folders are not imported by live code.
broad source-link folders are not used as runtime imports.
```

`report-platform-file-sizes.ts` must check:

```text
line count;
file category;
target budget;
hard threshold;
recommendation: keep, split soon, split before new work.
```

`report-platform-context-scope.ts` must check:

```text
current Platform Core file manifest;
files missing from manifest;
archive files accidentally referenced;
very broad source folders still treated as active;
docs not updated after changed source files.
```

These checks protect the project from becoming heavy again.

### 97.8 `.cursorignore` policy

The current `.cursorignore` already excludes many artifacts. It should become stricter after Platform Core has a stable live folder.

Recommended future policy:

```text
Keep ignored:
node_modules;
.next;
build output;
coverage;
logs;
screenshots/videos;
large generated reports;
binary databases;
old one-time scripts;
legacy-rest by default;
archive/source-link broad folders by default.
```

Do not ignore:

```text
src/features/platform-core/**
src/app/platform/page.tsx
src/lib/platform-core-*.ts
src/lib/platform-core-readiness-sections/**
src/lib/routes.ts
scripts/validate-platform-*.ts
scripts/report-platform-*.ts
Platform Core docs
```

Important rule:

```text
.cursorignore is for Cursor context hygiene.
It must not be used to hide broken live code.
If something is live, it must remain searchable enough for maintenance and validation.
If something is archive, it should be out of default context.
```

Implementation action:

```text
After src/features/platform-core is created and wrappers are stable, update .cursorignore with an explicit Platform Core section.
Document every ignored archive/source-link area in PLATFORM-SCOPE-MANIFEST.md.
```

### 97.9 How to remove unnecessary usage safely

Use this exact process for anything suspected to be unnecessary:

```text
1. Identify the file/component/route/helper.
2. Search only for direct imports and route references.
3. Classify it:
   live;
   compatibility;
   duplicate;
   demo-only;
   archive;
   generated/artifact;
   unknown.
4. If unknown, do not delete.
5. If duplicate, choose the owner cockpit and create merge plan.
6. If demo-only, remove from active UI or mark as demo/fallback.
7. If archive, disconnect from runtime and move/reference in archive docs.
8. If generated/artifact, ignore through .cursorignore or cleanup script.
9. Validate route, type and boundary checks.
10. Update docs.
```

Do not remove by feeling. Remove by connection proof.

Connection proof requires:

```text
import search;
route search;
test reference search;
docs/source-links update;
validation result.
```

### 97.10 Platform Core should become smaller as it becomes stronger

A mature Platform Core is not the one with the most files.

It is the one where:

```text
each role has a clear cockpit;
each pillar has a clear action chain;
each file has one responsibility;
each old route has a wrapper or clear replacement;
each archive item is disconnected unless intentionally recovered;
each large file is split before it becomes risky;
each validation script prevents accidental regressions;
each Cursor task reads only the necessary context.
```

This is the priority above all other work:

```text
First isolate.
Then shrink active context.
Then restore missing Platform Core foundations.
Then split monster files.
Then connect role actions.
Then improve UI.
Then add advanced features.
```

If a proposed feature increases context size, creates a monster file or reconnects archive without clear value, it should be rejected or redesigned.

## 98. Consolidated master priority index after full audit review

This section is the execution index for the whole document.

The audit is now intentionally deep, but it is too large to be loaded in full during every Cursor implementation session. Cursor should use this section as the first priority map, then open only the referenced detailed section when needed.

This section overrides scattered partial backlogs when there is a conflict in execution order.

### 98.1 What the document already organized

The audit now covers these layers:

```text
Sections 0-2:
  honest verdict, current score and the biggest blockers.

Sections 3-13:
  cross-cutting product problems, role audit, what to remove, what to add,
  golden path, priority backlog and 10/10 definition.

Sections 14-24:
  performance, speed, quality, folder split, link breaking,
  target Platform Core structure and boundary checks.

Sections 25-33:
  heavy file audit, Cursor token load, matrix-first /platform,
  unified UI, responsive rules, component templates and UX acceptance.

Sections 34-48:
  strategic product development, canonical business process,
  states, events, role roadmap, 20-cell target, cross-role handoffs,
  cleanup roadmap, feature waves, tests, scoring and anti-roadmap.

Sections 49-56:
  repeatability runbook, document responsibility, implementation protocol,
  per-document update rules, no-miss checklist and task templates.

Sections 57-64:
  archive re-entry: what can return, what must stay archived,
  how to recover useful archive ideas without reconnecting old noise.

Sections 65-74:
  internal garbage audit, cleanup by role/pillar, cockpit consolidation,
  noise removal, role usefulness and investor/user clarity.

Sections 75-84:
  benchmark logic from JOOR, NuORDER, Centric, МойСклад,
  Russian market requirements, full pillar/role completeness,
  missing action inventory and Russian development waves.

Sections 85-96:
  concrete Cursor execution contract, safety protocol,
  P0-P5 implementation actions, validation ladder, do-not-break rules
  and action card examples.

Section 97:
  highest-priority token/context/file-scope policy:
  active Platform Core only, archive quarantine, file size budgets,
  context packs, .cursorignore policy and boundary validation.
```

Conclusion:

```text
The project plan is broad enough.
The missing part was not another feature idea.
The missing part was a single operational priority index and a rule that the audit itself must not become daily context noise.
This section fixes that.
```

### 98.2 Final priority order from most important to less important

#### Priority 0 - Stop context/token waste before adding features

Why first:

```text
If Cursor keeps reading archive, huge files and unrelated folders,
every future implementation becomes slower, riskier and more expensive.
```

Actions:

```text
1. Create PLATFORM-SCOPE-MANIFEST.md.
2. Mark every known Platform Core file as live, compatibility, adapter, validation, docs or archive reference.
3. Add context packs from section 97.
4. Update .cursorignore only after the live Platform Core file set is clear.
5. Add import boundary, context scope and file-size reports.
6. Make archive opt-in, not default context.
```

Done when:

```text
Cursor can start a Platform Core task from a small file set.
Archive is not read or imported unless explicitly selected.
Large/generated/noisy files do not pollute daily work.
Every live Platform Core file has an owner and purpose.
```

Detailed sections:

```text
97, 92, 21, 25, 42, 49, 52
```

#### Priority 1 - Restore the missing Platform Core foundation

Why second:

```text
The product cannot be stabilized while /platform, matrix, readiness audit
and route constants are missing or unclear.
```

Actions:

```text
1. Restore /platform as the central matrix-first screen.
2. Create src/features/platform-core.
3. Restore platform-core-hub-matrix.
4. Restore platform-core-readiness-audit.
5. Add missing core cabinet route constants.
6. Keep old imports working through compatibility exports.
7. Add boundary validation.
```

Done when:

```text
/platform opens.
20 role/pillar cells render.
Every active cell has href, owner, status, data source and next action.
Old imports still compile.
No archive runtime import exists.
Route validation passes or failures are documented.
```

Detailed sections:

```text
2, 11, 12, 17, 20, 21, 26, 44, 87, 93, 95, 96
```

#### Priority 2 - Make Platform Core small, fast and readable

Why third:

```text
The first usable Platform Core must feel fast and calm before deeper features are added.
```

Actions:

```text
1. Build matrix-first PlatformCoreShell.
2. Lazy-load heavy role details.
3. Split monster files before adding to them.
4. Keep route pages thin.
5. Add data source badges.
6. Replace long descriptions with state/action/output/next owner.
7. Check iPhone, iPad and MacBook layouts.
```

Done when:

```text
/platform first screen does not load full Workshop2/B2B/factory/supplier workspaces.
No giant route/page/component grows unchecked.
UI has one calm visual language.
No long explanatory blocks replace real actions.
No visible data looks live if it is demo/mock/fallback.
```

Detailed sections:

```text
14, 23-33, 42, 88, 92, 97
```

#### Priority 3 - Consolidate duplicates into four role cockpits plus shared comms/calendar

Why fourth:

```text
The platform becomes understandable only when each role has one main operating surface,
not many duplicate mini/full/registry/detail/status pages.
```

Actions:

```text
1. Brand Article Development Cockpit.
2. Brand Collection Publishing Cockpit.
3. Brand Order Cockpit.
4. Shop Assortment and Order Cockpit.
5. Manufacturer Production Cockpit.
6. Supplier Procurement Cockpit.
7. Shared Entity Inbox.
8. Shared Entity Calendar.
9. Shared Entity Trace.
```

Done when:

```text
Each role knows where to work.
Old pages become wrappers, deep links or archive.
No duplicated surface owns the same action.
Every cockpit shows current state, next action, output and next connected role.
```

Detailed sections:

```text
4-8, 32, 37, 38, 67-70, 89
```

#### Priority 4 - Build the entity, event and state backbone

Why fifth:

```text
Without events and states, the platform is a collection of screens.
With events and states, it becomes an operating system.
```

Actions:

```text
1. Define stable entity IDs.
2. Define Platform Core event model.
3. Add state machines for article, collection, order, production, material and document.
4. Add role-based event visibility.
5. Add one trace per business object.
6. Generate UI next actions from allowed state transitions.
```

Done when:

```text
One Shop order can be traced to Brand confirmation,
Manufacturer PO, Supplier material request and shipment/closeout where applicable.
No primary action exists without event or output.
No role can jump to impossible states.
```

Detailed sections:

```text
35, 36, 40, 41, 76, 80, 90
```

#### Priority 5 - Build the golden business path end to end

Why sixth:

```text
Investors and users need proof that the platform connects real work,
not just role pages.
```

Golden path:

```text
Article -> dossier -> sample -> collection -> shop order
-> brand confirmation -> production handoff -> manufacturer PO
-> supplier material readiness -> production/QC -> shipment
-> shop delivery/acceptance -> closeout.
```

Actions:

```text
1. Select one representative product/article.
2. Make it move through all required roles.
3. Keep each role's visibility correct.
4. Attach chat/calendar/document/status to the same entity chain.
5. Add E2E proof for the chain.
```

Done when:

```text
The same business object is visible through role-appropriate views.
Every handoff has owner, status, timestamp and next action.
No step is only a dead demo screen.
```

Detailed sections:

```text
11, 35, 39-45, 71, 76-80, 82, 93
```

#### Priority 6 - Add the Russian business layer

Why seventh:

```text
The product is for Russian users.
It must understand documents, counterparties, terms, marking and integrations.
```

Actions:

```text
1. Add Russian document checklist.
2. Add legal/counterparty readiness.
3. Add payment, price, tax and terms readiness.
4. Add marking readiness.
5. Add integration queue for 1C, МойСклад, EDI, API/file export and bank/payment import.
6. Keep manual/export/planned statuses honest.
```

Done when:

```text
Order/production cannot look fully ready when documents or terms are missing.
No fake integration appears as live.
Russian operational blockers are visible but not noisy.
```

Detailed sections:

```text
39, 71, 75, 78, 82, 91
```

#### Priority 7 - Recover only valuable archive pieces

Why eighth:

```text
Archive can contain useful ideas, but direct recovery can reintroduce noise and heavy context.
```

Actions:

```text
1. Review archive only through an explicit recovery task.
2. Mark candidate_for_recovery in PLATFORM-SCOPE-MANIFEST.md.
3. Recover behavior, not whole pages.
4. Rebuild inside src/features/platform-core or a narrow adapter.
5. Reject marketing/social/consumer/admin noise from current core.
```

Done when:

```text
No live Platform Core import points to archive.
Recovered ideas are documented.
Archive remains outside default context.
```

Detailed sections:

```text
57-64, 73, 97
```

#### Priority 8 - Strengthen validation and quality gates

Why ninth:

```text
Without automated checks, the project will quietly become heavy and disconnected again.
```

Actions:

```text
1. Run route/nav validators.
2. Run contract validators.
3. Run type and lint checks for touched areas.
4. Add Platform Core boundary validation.
5. Add file-size report.
6. Add context-scope report.
7. Add E2E for the golden path.
8. Add visual/manual checks for iPhone, iPad and MacBook.
```

Done when:

```text
Broken links, missing route constants, archive imports,
oversized files and fake data sources are caught before product work ships.
```

Detailed sections:

```text
21, 45, 53, 86, 93, 97
```

#### Priority 9 - Make investor/user clarity visible

Why tenth:

```text
The product must be understandable in minutes:
what it does, who uses it, what moves, what is real and what is planned.
```

Actions:

```text
1. Show role/pillar matrix first.
2. Show data source and readiness status.
3. Show one golden path trace.
4. Show no fake live integrations.
5. Prepare an investor proof pack from real platform states.
6. Keep copy short and action-oriented.
```

Done when:

```text
An investor can understand the operating chain without reading documentation.
A user can understand what to do next without long explanations.
```

Detailed sections:

```text
27-30, 43, 72, 73.6, 83, 88
```

#### Priority 10 - Add enterprise depth only after the core is stable

Why later:

```text
Advanced analytics, AI, forecasts, visual boards and strategy tools are valuable,
but dangerous before the core chain works.
```

Actions:

```text
1. Add permissions and access control.
2. Add observability and error tracking.
3. Add import/export discipline.
4. Add advanced analytics.
5. Add AI suggestions only with confirmation and audit trail.
6. Add planning/forecast features only after order/production data is reliable.
```

Done when:

```text
Advanced features improve an already-working chain instead of hiding missing basics.
```

Detailed sections:

```text
34, 39, 55, 62, 82 Wave R6
```

### 98.3 Additional items added after reviewing the whole file

The audit is comprehensive, but the following items should be explicitly added to the future work plan.

#### Add compact daily action index

Problem:

```text
This audit is useful, but large.
If Cursor reads it fully every session, the audit itself becomes token load.
```

Action:

```text
Create Projects/_platform-core-split/platform-core/PLATFORM-CORE-ACTION-INDEX.md.
Keep it under 250-400 lines.
It should contain only:
current priority;
active context pack;
current action cards;
files allowed for this phase;
validation commands;
open blockers;
links to exact audit sections.
```

Rule:

```text
Use DEEP-AUDIT as reference.
Use PLATFORM-CORE-ACTION-INDEX.md as daily working document.
```

#### Add change impact map

Problem:

```text
Many future changes will touch routes, role visibility, events and docs.
Without impact mapping, small changes may break hidden links.
```

Action:

```text
For every implementation batch, record:
changed files;
affected routes;
affected roles;
affected pillars;
affected entities/events;
affected tests;
docs updated;
validation run.
```

Target file:

```text
Projects/_platform-core-split/platform-core/CHANGE-IMPACT-LOG.md
```

#### Add stale-doc prevention

Problem:

```text
The documentation set is now powerful, but it can drift from code.
```

Action:

```text
Every operational doc should have:
last reviewed date;
owner;
source files it reflects;
when to update;
current status.
```

Priority:

```text
Add this first to:
PLATFORM-SCOPE-MANIFEST.md;
SOURCE-LINKS.md;
CONNECTIONS.md;
MISSING-OR-EXTERNAL-LINKS.md;
ROLE-PILLAR-MATRIX.md;
PLATFORM-CORE-ACTION-INDEX.md.
```

#### Add role permission matrix before deep sharing

Problem:

```text
Cross-role visibility is central.
If visibility is not explicit, Shop may see factory internals,
Supplier may see buyer terms, or Manufacturer may see commercial details.
```

Action:

```text
Create Platform Core role permission matrix:
entity;
field group;
Brand access;
Shop access;
Manufacturer access;
Supplier access;
reason;
masking/redaction rule;
event visibility.
```

Target file:

```text
src/features/platform-core/visibility/platform-core-permissions.ts
```

Documentation:

```text
Projects/_platform-core-split/platform-core/ROLE-PERMISSION-MATRIX.md
```

#### Add design QA checklist as a required gate

Problem:

```text
The audit says UI must be calm and responsive, but every implementation batch needs a practical visual gate.
```

Action:

```text
Create a checklist for:
iPhone;
iPad;
MacBook;
no horizontal scroll;
no overlapping text;
no giant hero;
no nested cards;
primary action visible;
data source visible;
empty/error/loading states present.
```

Target file:

```text
Projects/_platform-core-split/platform-core/PLATFORM-CORE-DESIGN-QA.md
```

#### Add empty, loading and error state standard

Problem:

```text
Fast and beautiful UI can still feel broken if loading/error/empty states are generic.
```

Action:

```text
For every cockpit and matrix cell define:
loading state;
empty state;
blocked state;
error state;
no permission state;
planned state;
demo/fallback state.
```

Rule:

```text
Every state must still show next useful action or reason why action is blocked.
```

### 98.4 Final implementation sequence

Use this order for the next real transformation work:

```text
1. Create PLATFORM-SCOPE-MANIFEST.md.
2. Create PLATFORM-CORE-ACTION-INDEX.md.
3. Add archive/context/file-size validation scripts.
4. Restore /platform.
5. Create src/features/platform-core.
6. Restore matrix/readiness/route constants with compatibility exports.
7. Build matrix-first shell with data source badges.
8. Split heavy files that block safe work.
9. Build four role cockpits and shared inbox/calendar/trace.
10. Add entity/event/state backbone.
11. Prove golden path with E2E.
12. Add Russian document/legal/marking/integration readiness.
13. Recover only selected archive value.
14. Polish UI with design QA.
15. Add enterprise/AI/analytics only after the chain is stable.
```

### 98.5 Final answer to whether anything important is missing

The audit already covers the right transformation areas:

```text
scope;
archive separation;
token economy;
performance;
routes;
matrix;
readiness;
roles;
pillars;
cockpits;
events;
states;
Russian operations;
benchmark completeness;
UI standard;
validation;
repeatability;
archive recovery.
```

The important extra additions are:

```text
compact daily action index;
scope manifest as mandatory first file;
change impact log;
stale-doc prevention;
role permission matrix;
design QA checklist;
empty/loading/error state standard.
```

If these are added and followed, the project has a clear path to become:

```text
cleaner;
faster;
less token-heavy;
more logical;
more beautiful;
more understandable for users;
more credible for investors;
safer for Cursor to modify.
```

## 99. Final verification: duplicates, demo dead ends, broken links and role/pillar upgrade ladder

This section answers the direct question: did we definitely account for duplicates, demo dead ends, repeated sections, broken links, missing links and the development path of every existing role/pillar section?

Short answer:

```text
Yes, the audit already covers the problem conceptually.
But the implementation needs a sharper code-level register before refactoring starts.
This section adds that register logic and the exact upgrade ladder.
```

### 99.1 What the quick code check confirmed

The document findings are not theoretical. The current code shape confirms the risks.

Observed facts from the current workspace:

```text
src/app/platform/page.tsx is not present.
src/features/platform-core is not present.
src/lib/platform-core-hub-matrix.ts is not present.
src/lib/platform-core-readiness-audit.ts is not present.
```

Platform Core readiness files reference route constants that are not found in `src/lib/routes.ts`:

```text
ROUTES.brand.coreCabinet
ROUTES.shop.coreCabinet
ROUTES.factory.productionCoreCabinet
ROUTES.factory.supplierCoreCabinet
```

The readiness sections use these constants in many places, so this is a real broken/missing connection risk, not just a documentation concern.

The checked core-related zones still contain many demo/mock/fallback/localStorage references:

```text
83 files in the checked Platform Core-adjacent zones contain demo/mock/placeholder/stub/fallback/localStorage signals.
```

The route/page surface is very wide:

```text
src/app/shop/b2b has 76 page.tsx files.
src/app/brand/production has 12 page.tsx files.
src/app/factory has 34 page.tsx files.
```

Interpretation:

```text
The risk is not that the project has too little functionality.
The risk is that useful functionality is spread across too many routes, demos and local states.
Platform Core must consolidate and govern this, not add another layer of routes.
```

### 99.2 What must be removed, hidden, merged or rebuilt

Every suspicious section must be classified before editing.

Use this exact decision table:

| Problem class | What it looks like in the project | Decision | Target state |
| --- | --- | --- | --- |
| Duplicate page | two routes show the same order/status/calendar/job | merge | one cockpit owns the action; old route wraps or deep-links |
| Duplicate status | same `orderId`, `poId`, `articleId` has different labels in different places | merge | one state machine/status source |
| Demo-only route | impressive screen but no event/output/persistence | archive or advanced | hidden from core unless demo-badged |
| Read-only fake cell | a role/pillar cell exists but role has no useful action or insight | convert | clear `context only`, `waiting for role`, or useful request/clarification |
| Broken link | href points to missing route/constant/file | fix or mark planned | no active broken links |
| Missing link | action creates output but next role cannot see it | add event/trace | output appears in next role cockpit |
| Local-only core state | core action writes only to localStorage/memory/file fallback | block or badge | persisted or explicitly demo/fallback |
| Archive dependency | live Platform Core imports old archive/legacy UI | remove | rebuilt inside Platform Core or narrow adapter |
| Repeated navigation | many nav items lead to similar registry/detail/status screens | collapse | role cockpit + filters/tabs |
| Long explanation block | page explains instead of enabling action | rewrite | state/action/output/next owner |
| Generic chat/calendar | communication is not tied to an entity | merge | EntityInbox/EntityCalendar linked to article/order/PO/material |
| Heavy first-render import | /platform loads full workspaces before user asks | lazy-load | matrix shell first, details after intent |

Implementation rule:

```text
Do not delete first.
Classify -> create target cockpit/wrapper -> preserve link -> validate -> then archive/remove old duplicate.
```

### 99.3 Required cleanup registers before code refactor

Before changing many files, create these operational registers.

#### Register 1: Platform Core Cleanup Register

Target file:

```text
Projects/_platform-core-split/platform-core/PLATFORM-CORE-CLEANUP-REGISTER.md
```

Columns:

```text
id;
file_or_route;
role;
pillar;
problem_class;
current_behavior;
why_it_is_bad;
decision: keep | merge | wrapper | archive | remove | rebuild | advanced;
target_owner_cockpit;
compatibility_needed;
validation;
status.
```

Minimum first entries:

```text
shop/b2b broad route set -> classify into Shop Assortment/Order Cockpit, advanced, archive.
brand/production broad route set -> classify into Brand Article/Production context, advanced, archive.
factory production routes -> classify into Manufacturer Production Cockpit, advanced, archive.
factory supplier routes -> classify into Supplier Procurement Cockpit, advanced, archive.
readiness sections route constants -> fix missing constants/wrappers.
demo/mock/localStorage files -> badge, block, persist or archive.
```

#### Register 2: Platform Core Link Integrity Matrix

Target file:

```text
Projects/_platform-core-split/platform-core/PLATFORM-CORE-LINK-INTEGRITY-MATRIX.md
```

Columns:

```text
source_role;
source_pillar;
source_action;
output_entity;
event;
target_role;
target_pillar;
target_route;
target_cockpit;
status;
missing_piece;
test_or_validation.
```

Required first checks:

```text
Brand article readiness -> Manufacturer development context.
Brand collection publish -> Shop sample_collection/collection_order.
Shop order submitted -> Brand collection_order.
Brand order confirmed -> Shop order status.
Brand production handoff -> Manufacturer order_production.
Manufacturer material request -> Supplier order_production.
Supplier reserve/delivery -> Manufacturer material readiness.
Manufacturer shipment ready -> Brand and Shop order_production.
Entity message/calendar -> same entity trace for all allowed roles.
```

#### Register 3: Platform Core Cell Upgrade Ladder

Target file:

```text
Projects/_platform-core-split/platform-core/PLATFORM-CORE-CELL-UPGRADE-LADDER.md
```

Columns:

```text
role;
pillar;
current_level;
current_problem;
remove_or_merge;
missing_connection;
next_feature;
advanced_feature;
10_of_10_definition;
source_files;
validation.
```

This can start as a copy of section 99.7 below and become the daily working table.

### 99.4 Dead-end detector rule

Every visible user action must pass this test:

```text
Does it have an input?
Does it have a role owner?
Does it create or update an entity?
Does it create an event or state transition?
Does another role see the result if needed?
Does the UI show evidence/source?
Does the user know the next step?
Does the route still work after refresh?
Does it avoid silent demo/local-only behavior?
```

If any answer is no, the action is one of:

```text
dead_end;
demo_only;
read_only_context;
planned;
broken;
needs_adapter;
needs_state_machine;
needs_event_trace.
```

Required script:

```text
scripts/report-platform-dead-ends.ts
```

The script should inspect the Platform Core matrix/action model after P0 and report:

```text
active actions without href;
active actions without entity/output;
active actions without next owner;
active actions without data source;
planned actions shown as active;
demo actions shown without demo badge.
```

### 99.5 Duplicate detector rule

Duplicates are not only repeated files. They are repeated ownership.

Treat these as duplicates:

```text
two screens own confirmation for the same order;
two screens show different status for same production order;
two calendars show same delivery milestone;
two chats discuss same order but are not linked to same thread/entity;
mini card and full page use different data source;
registry and detail each implement their own action handler;
Brand and Manufacturer both edit the same field without ownership rule;
Shop sees a separate tracking page that disagrees with order detail.
```

Required script:

```text
scripts/report-platform-duplicates.ts
```

The script should start simple:

```text
scan routes and labels for repeated order/status/calendar/production/supplier concepts;
scan Platform Core matrix for repeated actions with same entity type;
scan imports for repeated data helpers;
report candidates, not auto-delete.
```

### 99.6 Broken and missing connection detector

Broken links and missing links must be treated differently.

Broken connection:

```text
The UI or model points to something that does not exist.
Example: readiness section references ROUTES.shop.coreCabinet but the route constant is missing.
```

Missing connection:

```text
One role creates a business output, but the next role has no route, cockpit, event or visibility for it.
Example: Brand confirms an order but Manufacturer does not receive a production handoff.
```

Required script:

```text
scripts/validate-platform-link-integrity.ts
```

Checks:

```text
all matrix hrefs resolve to route constants or explicit planned routes;
all route constants used by readiness sections exist;
all active cells have target cockpit or wrapper;
all cross-role handoffs have source event and target visibility;
all old wrappers point to cockpit/deep-link, not archive;
no active route points to dead/demo-only screen without badge.
```

### 99.7 Upgrade ladder for all 20 role/pillar cells

Use this as the direct answer for how to develop every existing section from current level to stronger logic/functionality.

#### Brand × development

Current risk:

```text
Strong article/workshop/dossier logic exists, but it is heavy and fragmented.
Some advanced tools can enter core too early.
Readiness is not strict enough.
```

Remove/merge:

```text
Merge scattered article, tech pack, sample readiness and dossier summaries into Brand Article Development Cockpit.
Hide advanced sketch/annotation/pattern tools behind advanced drawer.
Remove duplicate article status widgets.
```

Add:

```text
article readiness gate;
BOM/TZ/dossier completeness;
sample request state;
production feasibility comments;
version history;
exportable production package;
data source badge.
```

10/10:

```text
Brand can create an article that is ready for sample, collection and production without re-entering data.
Manufacturer receives only the clean production-ready context.
```

#### Brand × sample_collection

Current risk:

```text
Linesheet, showroom, sample approval and collection readiness can duplicate each other.
```

Remove/merge:

```text
Merge linesheet/showroom/publishing/sample approval into Brand Collection Publishing Cockpit.
Archive marketing-only showroom/demo blocks until core publishing works.
```

Add:

```text
draft -> sample approved -> publish-ready -> visible to shops;
buyer readiness preview;
missing price/size/photo/terms blockers;
publish/unpublish event;
shop visibility rules.
```

10/10:

```text
Brand publishes only commercially ready articles, and Shop sees a clear shoppable collection.
```

#### Brand × collection_order

Current risk:

```text
Registry/detail/preorder/order status may duplicate order ownership.
```

Remove/merge:

```text
One Brand Order Cockpit owns incoming orders, amendments, confirmation, terms and documents.
Old order pages become wrappers or deep links.
```

Add:

```text
order review;
amendment flow;
terms/payment/document readiness;
reserve policy;
confirmation event;
production handoff readiness.
```

10/10:

```text
Brand can review, amend, confirm and hand off a shop order without leaving one cockpit.
```

#### Brand × order_production

Current risk:

```text
Brand production pages are rich but wide, with demo/local/advanced screens mixed with core.
```

Remove/merge:

```text
Keep Brand production as order/PO monitoring context, not a second factory workspace.
Move advanced production planning, videos, gold sample demos and unrelated floor tools to advanced/archive.
```

Add:

```text
production handoff trace;
Manufacturer PO status;
material readiness;
QC/shipment milestones;
exception decisions;
Russian document/marking readiness.
```

10/10:

```text
Brand sees whether confirmed orders are producible, blocked, in production, ready to ship or shipped.
```

#### Brand × comms

Current risk:

```text
Messages/calendar/context strips can duplicate order, production and logistics communication.
```

Remove/merge:

```text
Remove generic chat as a core destination.
Merge messages into EntityInbox by article, collection, order, PO or material request.
Merge calendars into entity milestones.
```

Add:

```text
decision requests;
clarification tasks;
calendar milestones;
role-visible threads;
event trace.
```

10/10:

```text
Every conversation is attached to a business object and can change status or resolve a blocker.
```

#### Shop × development

Current risk:

```text
Shop should not edit Brand product development, but it needs buyer-safe readiness context.
```

Remove/merge:

```text
Remove any Shop-facing product-development editing.
Merge read-only previews into buyer-safe readiness panel.
```

Add:

```text
upcoming product readiness;
missing commercial fields;
clarification request;
fit/size notes where buyer-safe;
expected availability.
```

10/10:

```text
Shop understands what will become orderable and can request clarification without touching Brand source data.
```

#### Shop × sample_collection

Current risk:

```text
Showroom, discover, partners, lookbooks and collection pages can become many discovery side quests.
```

Remove/merge:

```text
Merge collection discovery into Shop Assortment and Order Cockpit.
Archive social/gamification/academy/marketing discovery from core.
```

Add:

```text
published collection view;
readiness badges;
size/color availability;
filters;
line sheet;
add to assortment/matrix;
clarification request.
```

10/10:

```text
Shop moves from collection review to assortment decision without dead ends.
```

#### Shop × collection_order

Current risk:

```text
Cart, quick order, reorder, preorder, templates, working order and checkout may duplicate ordering.
```

Remove/merge:

```text
One order creation flow.
Keep templates/reorder/quick order as modes inside the same Shop Order Cockpit, not separate core destinations.
```

Add:

```text
assortment matrix;
size curves;
duplicate-buy warning;
budget/terms check;
cart;
submit order;
document/payment readiness.
```

10/10:

```text
Shop can form a clean wholesale order with terms, quantities, sizes and documents ready for Brand review.
```

#### Shop × order_production

Current risk:

```text
Shop tracking/status/logistics pages can duplicate order detail and expose factory noise.
```

Remove/merge:

```text
Merge tracking into Shop Buyer Tracking Cockpit.
Hide internal PO/factory operations from Shop unless converted to buyer-safe status.
```

Add:

```text
Brand confirmation status;
production-facing summary;
ETA;
shipment status;
delivery documents;
delay reason;
issue/claim;
delivery acknowledgement.
```

10/10:

```text
Shop sees what matters: confirmed, in production, delayed, shipped, delivered, issue/closeout.
```

#### Shop × comms

Current risk:

```text
Order chat, logistics calendar and notifications can be separate and repeated.
```

Remove/merge:

```text
One buyer inbox grouped by order/collection.
One buyer calendar with delivery and decision milestones.
```

Add:

```text
amendment decisions;
delivery questions;
document requests;
notifications;
acknowledgement tasks.
```

10/10:

```text
Shop communication always advances an order, document, delivery or claim.
```

#### Manufacturer × development

Current risk:

```text
Manufacturer may see Brand development fragments without clear ownership.
```

Remove/merge:

```text
No Manufacturer editing of Brand article source.
Merge dossier, feasibility comments and sample/tech-pack context into Manufacturer read-only development context.
```

Add:

```text
production feasibility;
missing tech-pack fields;
sample execution feedback;
capacity warning;
clarification request.
```

10/10:

```text
Manufacturer can say whether an article is producible and what is missing before order production starts.
```

#### Manufacturer × sample_collection

Current risk:

```text
Sample queues can duplicate Brand sample ownership.
```

Remove/merge:

```text
Manufacturer sample context is execution/feedback only.
Brand owns sample approval.
```

Add:

```text
sample task;
sample issue;
fit/quality note;
material feasibility;
ready for Brand review.
```

10/10:

```text
Manufacturer helps samples become producible without becoming a second sample management system.
```

#### Manufacturer × collection_order

Current risk:

```text
Manufacturer can receive order context too early or too commercially.
```

Remove/merge:

```text
Do not show buyer negotiation or full commercial terms unless needed for production.
Show demand/quantity context only after Brand confirmation or planned forecast.
```

Add:

```text
production forecast;
capacity preview;
confirmed quantity summary;
handoff readiness.
```

10/10:

```text
Manufacturer sees enough order context to plan production, not enough to confuse ownership.
```

#### Manufacturer × order_production

Current risk:

```text
Factory routes may be wide: registry, status, production, QC, calendar and shipment can be separate.
```

Remove/merge:

```text
One Manufacturer Production Cockpit owns PO acceptance, stage updates, material gate, QC and shipment readiness.
Old factory routes become wrappers/deep links.
```

Add:

```text
PO acceptance;
stage state machine;
materials gate;
QC checklist;
issue reporting;
shipment readiness;
proof for Brand/Shop.
```

10/10:

```text
Manufacturer can execute a PO from acceptance to shipment with traceable states and exceptions.
```

#### Manufacturer × comms

Current risk:

```text
Generic chat can duplicate article/order/PO clarification.
```

Remove/merge:

```text
One Manufacturer PO Inbox, linked to PO/article/material issue.
```

Add:

```text
clarification request;
issue escalation;
calendar milestone;
supplier material thread;
Brand decision thread.
```

10/10:

```text
Every Manufacturer message is tied to PO progress or a production blocker.
```

#### Supplier × development

Current risk:

```text
Supplier can become a generic marketplace or material catalog instead of supporting product readiness.
```

Remove/merge:

```text
No generic supplier marketplace in core.
Show only material/certification context linked to article/BOM.
```

Add:

```text
material availability;
certification;
lead time;
substitution suggestion;
sample material readiness.
```

10/10:

```text
Supplier improves product readiness through material proof, not through unrelated catalog browsing.
```

#### Supplier × sample_collection

Current risk:

```text
Sample material availability may look like a fake separate section.
```

Remove/merge:

```text
Merge sample material tasks into Supplier Procurement Cockpit or material readiness panel.
```

Add:

```text
swatch/sample material request;
small-batch availability;
lead time;
certificate status;
substitution.
```

10/10:

```text
Supplier helps sample creation with real material commitments and evidence.
```

#### Supplier × collection_order

Current risk:

```text
Supplier should not own buyer order or collection publishing.
```

Remove/merge:

```text
Keep Supplier collection/order view as demand/reserve context only.
No buyer-facing order negotiation.
```

Add:

```text
demand forecast;
reserve request;
material planning;
price/lead-time context.
```

10/10:

```text
Supplier understands expected material demand without seeing unrelated buyer/commercial noise.
```

#### Supplier × order_production

Current risk:

```text
Procurement, BOM x PO, chain, circular demo and multi-article wizard may create too many nav entries.
```

Remove/merge:

```text
One Supplier Procurement Cockpit.
Archive circular/demo flows unless connected to material request, PO, delivery or certificate.
Mark multi-article wizard demo-only until real bundled PO exists.
```

Add:

```text
RFQ;
quote;
reserve;
order confirmation;
dispatch;
ETA;
delivery proof;
certificate/document status;
issue handling.
```

10/10:

```text
Supplier quotes, reserves and delivers materials that directly update Manufacturer production readiness.
```

#### Supplier × comms

Current risk:

```text
Supplier communication can be disconnected from RFQ/material/PO.
```

Remove/merge:

```text
No generic supplier chat in core.
One Supplier Material Inbox tied to RFQ, material request, PO or delivery.
```

Add:

```text
quote clarification;
delivery delay;
substitution approval;
certificate request;
calendar milestones.
```

10/10:

```text
Supplier communication resolves material blockers and updates production readiness.
```

### 99.8 Code-level implementation order for cleanup and upgrade

Do this in order:

```text
1. Create PLATFORM-CORE-CLEANUP-REGISTER.md.
2. Create PLATFORM-CORE-LINK-INTEGRITY-MATRIX.md.
3. Create PLATFORM-CORE-CELL-UPGRADE-LADDER.md.
4. Restore missing /platform, matrix, readiness audit and route constants.
5. Create src/features/platform-core.
6. Add scripts:
   report-platform-dead-ends.ts;
   report-platform-duplicates.ts;
   validate-platform-link-integrity.ts;
   validate-platform-import-boundaries.ts;
   report-platform-file-sizes.ts.
7. Build Platform Core matrix from one source.
8. Classify every old route into cockpit, wrapper, advanced or archive.
9. Build four cockpits plus shared EntityInbox/EntityCalendar/EntityTrace.
10. Replace demo/local/fallback core actions with persisted/event-based actions or visible demo badges.
11. Add state machines and role visibility.
12. Validate golden path end to end.
```

### 99.9 What is definitely not enough

These actions alone are not enough:

```text
Making the UI prettier without reducing route/page duplication.
Adding more tabs to existing broad pages.
Creating new pages for missing features before assigning cockpit ownership.
Hiding broken links from navigation without fixing or marking them.
Leaving demo/localStorage behavior visible as production.
Adding AI/analytics before entity trace and state machines.
Moving files physically without compatibility wrappers.
Putting everything into src/features/platform-core without splitting by role/pillar.
```

### 99.10 Final assurance

The audit now accounts for:

```text
duplicates;
demo dead ends;
repeated UI surfaces;
broken route constants;
missing core files;
missing cross-role handoffs;
missing state/event backbone;
archive quarantine;
token/context bloat;
file-size monsters;
role/pillar upgrade path;
Russian business requirements;
UI/investor clarity;
validation and repeatability.
```

The next real work should not be more analysis.

The next real work should be:

```text
create the three registers;
restore the missing core foundation;
then execute cleanup by role/pillar cell with validation after each batch.
```

## 100. Ten highest-impact additions still worth adding to the project plan

The audit already covers structure, archive, cleanup, performance, roles, pillars, cockpits, states, events, Russian documents and validation.

The ten ideas below are not random feature expansion. They are high-leverage operating layers that can make Platform Core more useful for real users and more credible for investors.

### 100.1 Canonical business dictionary and data contract

What is missing or underweighted:

```text
The audit defines entities and states, but the project also needs one canonical language:
what exactly is article, SKU, collection, linesheet, order, PO, RFQ, material request, shipment, document, counterparty, event, readiness, source and trace.
```

Why it matters:

```text
Without a dictionary, developers create duplicate meanings.
Users see different words for the same thing.
Investors feel that the product is a collection of screens rather than a controlled operating system.
```

Action:

```text
Create PLATFORM-CORE-DATA-DICTIONARY.md.
Create src/features/platform-core/model/platform-core-terms.ts.
Every role/pillar cell and cockpit must use the same entity names.
Every field that crosses roles must have owner, type, source and visibility.
```

Minimum dictionary entries:

```text
Article;
SKU;
Variant;
Material;
BOM;
Tech pack;
Sample;
Collection;
Linesheet;
Assortment;
Shop order;
Brand order;
Production order;
Purchase order;
RFQ;
Supplier quote;
Shipment;
Document;
Counterparty;
Event;
Trace;
Readiness;
Data source.
```

Effect:

```text
Less duplication.
Fewer broken cross-role links.
Cleaner investor narrative.
Safer future code generation in Cursor.
```

### 100.2 Role-level value metrics and ROI layer

What is missing or underweighted:

```text
The audit says the product must be useful, but it should measure usefulness per role.
```

Why it matters:

```text
Investors do not only need to see features.
They need to see why users would pay, stay and move work from Excel/WhatsApp/Telegram/1C-side files into Platform Core.
```

Action:

```text
Create PLATFORM-CORE-VALUE-METRICS.md.
Add role-level metrics to cockpit summaries.
Do not show fake metrics as live.
Metrics can start as calculated/estimated if clearly labeled.
```

Metrics by role:

```text
Brand:
time from article draft to publish-ready;
orders confirmed without manual clarification;
production handoffs with complete package;
document readiness before shipment.

Shop:
time from collection review to order;
order lines with complete price/size/availability;
late delivery visibility;
fewer duplicate buys or unclear substitutions.

Manufacturer:
POs accepted without missing tech-pack data;
material blockers detected before production;
stage delays resolved;
QC issues closed.

Supplier:
RFQ response time;
reserve reliability;
delivery proof completeness;
certificate/document readiness.
```

Effect:

```text
Turns Platform Core from "nice product" into measurable business value.
Makes investor proof pack stronger.
Helps prioritize features by real impact.
```

### 100.3 Migration bridge from current Russian workflows

What is missing or underweighted:

```text
The audit mentions import/export and integrations, but needs a practical bridge from how Russian fashion businesses work today:
Excel, WhatsApp, Telegram, email, PDF invoices, 1C/МойСклад exports, photos and manual documents.
```

Why it matters:

```text
Users rarely start with clean data.
If onboarding requires perfect data first, adoption will be slow.
```

Action:

```text
Create PLATFORM-CORE-MIGRATION-BRIDGE.md.
Add import templates for article, collection, order, counterparty, material and document status.
Add "import confidence" and "needs review" states.
Never let imported uncertain data look fully trusted.
```

Minimum import paths:

```text
Excel/CSV article list;
Excel/CSV price list;
Excel/CSV order;
PDF/document upload with manual metadata;
1C/МойСклад export file;
supplier price sheet;
production status sheet;
manual WhatsApp/Telegram note converted into entity comment/task.
```

Effect:

```text
Faster real customer pilots.
Less empty-state friction.
More credible Russian market fit.
```

### 100.4 Pilot package for first real customers

What is missing or underweighted:

```text
The audit has a product plan, but it should also define how to pilot this with real brands, shops, manufacturers and suppliers.
```

Why it matters:

```text
Investors trust real pilot evidence more than feature volume.
Users need a small, guided starting scenario.
```

Action:

```text
Create PLATFORM-CORE-PILOT-PACK.md.
Define 3 pilot archetypes and what each must prove.
```

Pilot archetypes:

```text
Pilot A: small brand + one shop + one manufacturer.
Goal: article -> collection -> order -> production handoff.

Pilot B: brand with existing B2B orders.
Goal: import orders -> confirm -> documents -> production tracking.

Pilot C: manufacturer/supplier-heavy chain.
Goal: PO -> material request -> reserve -> production -> shipment proof.
```

Each pilot must define:

```text
input data;
roles invited;
golden path;
success metric;
manual workaround allowed;
what must be real;
what may remain demo-badged;
investor proof screenshot/export.
```

Effect:

```text
Keeps the product grounded.
Creates real adoption proof.
Prevents building features nobody uses.
```

### 100.5 Decision ledger and approval memory

What is missing or underweighted:

```text
Events and states are covered, but decisions need their own ledger:
who approved, rejected, amended, accepted risk, changed terms or overrode a blocker.
```

Why it matters:

```text
Fashion B2B and production work breaks when decisions live only in chat.
Users need accountability.
Investors need to see that the system captures business control, not just messages.
```

Action:

```text
Create src/features/platform-core/events/decision-ledger.ts.
Create shared DecisionLedger panel.
Every approval/amendment/override/exception must write a decision record.
```

Decision fields:

```text
decisionId;
entityType;
entityId;
decisionType;
actorRole;
actorId;
previousState;
nextState;
reason;
attachments;
visibility;
createdAt;
reversalPolicy.
```

Effect:

```text
Turns chat into accountable workflow.
Reduces disputes.
Makes order/production/document history investor-grade.
```

### 100.6 Configuration layer per company and workflow

What is missing or underweighted:

```text
The audit defines many rules, but real companies will need different terms, document requirements, roles, approval steps and production stages.
```

Why it matters:

```text
Hardcoded workflows become fragile.
Configurable workflows make Platform Core feel enterprise-ready without adding many custom pages.
```

Action:

```text
Create src/features/platform-core/config/platform-core-workflow-config.ts.
Create PLATFORM-CORE-CONFIGURATION-MODEL.md.
```

Configurable items:

```text
required document set by order type;
approval steps by role/company;
payment terms;
delivery terms;
production stages;
supplier document requirements;
marking requirements;
visibility rules;
SLA timers;
allowed manual override reasons.
```

Rule:

```text
Do not build a huge settings UI first.
Start with typed config and one compact admin/debug editor only if needed.
```

Effect:

```text
Less hardcoding.
More realistic enterprise adoption.
Safer Russian market adaptation.
```

### 100.7 Scenario library for tests, demos and investor proof

What is missing or underweighted:

```text
The audit has a golden path, but needs a library of standard business scenarios.
```

Why it matters:

```text
One happy path is not enough.
Real users and investors will ask what happens when data is missing, terms change, production is late or supplier fails.
```

Action:

```text
Create PLATFORM-CORE-SCENARIO-LIBRARY.md.
Create test fixtures under src/features/platform-core/tests/scenarios.
```

Minimum scenarios:

```text
happy path;
missing tech pack;
shop order amendment;
brand rejects/amends order;
manufacturer requests clarification;
supplier late delivery;
missing certificate;
marking not ready;
partial shipment;
claim after delivery;
integration manual export;
permission denied.
```

Effect:

```text
Improves QA.
Improves investor demo.
Makes edge cases visible before users hit them.
Prevents fake "everything is green" dashboards.
```

### 100.8 Trust and confidence scoring for every core entity

What is missing or underweighted:

```text
Data source badges are covered, but not enough.
The platform should also show confidence/readiness of entity data.
```

Why it matters:

```text
A live source can still be incomplete.
An imported source can be useful but uncertain.
Users need to know whether they can act safely.
```

Action:

```text
Create src/features/platform-core/readiness/entity-confidence.ts.
Add confidence score to Article, Collection, Order, PO, Material Request, Shipment and Document.
```

Confidence inputs:

```text
source type;
required fields completeness;
last updated time;
owner confirmation;
document evidence;
cross-role agreement;
validation errors;
manual override;
import confidence.
```

Effect:

```text
Better action safety.
Better user trust.
More honest investor demo.
Fewer accidental production/order mistakes.
```

### 100.9 Mobile-first field mode for production and supplier work

What is missing or underweighted:

```text
The audit covers responsive UI, but production and supplier users often work from phones in noisy, low-context environments.
```

Why it matters:

```text
Manufacturer and Supplier value depends on fast status updates, photo proof, document upload and issue reporting.
If mobile field work is hard, statuses become stale.
```

Action:

```text
Create PLATFORM-CORE-FIELD-MODE.md.
Add field-mode patterns for Manufacturer and Supplier cockpits.
```

Field mode must support:

```text
one-tap stage update;
photo proof;
document/certificate upload;
delay reason;
voice/text note as entity comment;
offline draft if possible;
large touch targets;
minimal text;
clear "what is next" card.
```

Effect:

```text
Fresher production data.
More useful supplier collaboration.
Stronger real-world adoption.
Better mobile UX proof.
```

### 100.10 Commercial packaging and investor monetization map

What is missing or underweighted:

```text
The audit explains product value, but should also map what becomes paid product value.
```

Why it matters:

```text
Investors need to understand not only that the product is useful,
but how it can become a business.
This also prevents building expensive features with unclear commercial value.
```

Action:

```text
Create PLATFORM-CORE-COMMERCIAL-MAP.md.
Map roles, workflows and advanced features to monetization logic.
```

Possible packaging:

```text
Brand Core:
article, collection, order, production handoff.

Shop Core:
collection buying, order, tracking, documents.

Manufacturer Core:
PO, production, QC, shipment proof.

Supplier Core:
RFQ, reserve, delivery, certificates.

Advanced:
analytics, AI suggestions, integrations, scenario automation, field mode, compliance exports.

Network value:
partner onboarding, trusted supplier profiles, repeated cross-company workflows.
```

Rules:

```text
Do not put pricing UI into the operator cockpit now.
Use this as product/investor planning, not as user-facing noise.
```

Effect:

```text
Clearer investor story.
Better feature prioritization.
Less risk of building attractive but non-monetizable demos.
```

### 100.11 Priority among these ten ideas

Implementation order:

```text
1. Canonical business dictionary and data contract.
2. Trust/confidence scoring.
3. Migration bridge from current workflows.
4. Scenario library.
5. Decision ledger.
6. Configuration layer.
7. Role-level value metrics and ROI.
8. Pilot package.
9. Mobile-first field mode.
10. Commercial packaging and monetization map.
```

Reason:

```text
First stabilize meaning and data trust.
Then make adoption and testing realistic.
Then add accountability and configuration.
Then prove value and commercial story.
```

These ten additions should not delay P0 restoration.

They should be added as planning documents and then connected gradually to the P0-P5 execution plan.

## 101. Competitor-grade and differentiating feature layer: 25 strongest missing or underdeveloped ideas

This section adds the next competitive layer after sections 98-100.

It is based on official competitor/product references checked on 2026-06-22:

```text
JOOR:
end-to-end wholesale, virtual showrooms, digital linesheets, order management,
payments, reporting, visual assortments, buyer network, integrations and ROI proof.

NuORDER:
B2B ecommerce, advanced sales tools, order management, flexible configurations,
payments, actionable insights, assortments, duplicate-buy prevention,
size curves, collaborative buying and integrations.

Centric Software:
PLM, planning, pricing, market intelligence, visual boards, PXM/PIM/DAM,
content syndication, digital shelf analytics, sustainability/compliance,
concept-to-commercialization and AI-assisted decisioning.

Onfinity:
ERP/CRM/DMS/BI, textile and apparel ERP, MRP, BOM, work orders,
procurement, document management, workflow/custom forms, field service,
mobile execution, ticketing and open/low-code platform logic.

МойСклад:
Russian ERP for inventory, orders, production, documents, marking,
marketplaces, integrations, finance, roles/access, mobile work and practical SME adoption.
```

These are not copy targets.

The goal is to identify what Platform Core must absorb, adapt or intentionally reject so that it becomes stronger than a B2B showroom, more practical than a generic ERP and more connected than a PLM-only system.

### 101.1 How these 25 ideas relate to the previous 10

The previous 10 ideas in section 100 remain the foundation:

```text
100.1 Canonical business dictionary.
100.2 Role-level value metrics.
100.3 Migration bridge.
100.4 Pilot package.
100.5 Decision ledger.
100.6 Configuration layer.
100.7 Scenario library.
100.8 Trust/confidence scoring.
100.9 Mobile-first field mode.
100.10 Commercial packaging map.
```

The 25 ideas below are the competitive and product-functionality layer.

Rule:

```text
Do not add these as 25 separate pages.
Each idea must be integrated into an existing role cockpit, shared component, state machine, event model or integration queue.
```

### 101.2 The 25 strongest feature ideas to add or strengthen

#### C101-01 Visual assortment board with gaps, overlaps and duplicate-buy prevention

Competitive signal:

```text
JOOR and NuORDER both strongly emphasize visual assortment planning,
duplicate prevention and better buying decisions.
Centric also uses visual boards as a cross-team decision workspace.
```

What we already have:

```text
Shop collection/order logic and matrix ideas exist, but not yet as one serious visual assortment cockpit.
```

What to add:

```text
Visual board for Shop and Brand:
collection;
category;
color;
size curve;
delivery window;
price band;
existing bought styles;
duplicate/overlap warnings;
gap suggestions;
budget/OTB summary;
order impact.
```

Where it lives:

```text
Shop sample_collection;
Shop collection_order;
Brand sample_collection;
Brand collection_order.
```

Integration moment:

```text
After P2 Shop Assortment and Order Cockpit exists.
Before advanced analytics.
```

Why it matters:

```text
This is one of the clearest buyer-value features.
It makes Shop users faster and gives investors a visible "aha" moment.
```

#### C101-02 Account-specific wholesale portal: pricing, visibility, terms and curated assortment

Competitive signal:

```text
JOOR and NuORDER both support account-specific wholesale experiences,
pricing, assortments and buyer-facing catalogs.
```

What we already have:

```text
Publishing and B2B ordering exist in fragments.
Account-specific visibility is not yet a strict product rule.
```

What to add:

```text
For each buyer account:
visible collections;
visible articles;
price list;
discount;
MOQ;
payment terms;
delivery terms;
document requirements;
allowed order modes;
Brand contact owner.
```

Where it lives:

```text
Brand sample_collection;
Brand collection_order;
Shop sample_collection;
Shop collection_order.
```

Integration moment:

```text
After route constants and role permissions are restored.
Before Shop order flow is considered 10/10.
```

Why it matters:

```text
This makes the product feel like a real B2B wholesale system, not a public catalog.
```

#### C101-03 Always-on shoppable linesheet/showroom with hotspot media

Competitive signal:

```text
JOOR highlights virtual showrooms and digital linesheets.
NuORDER highlights shoppable ecommerce pages, rich product listings, video,
3D, 360 imagery and product hotspots.
```

What we already have:

```text
Linesheets/showroom concepts exist but are at risk of becoming duplicate surfaces.
```

What to add:

```text
One shoppable publishing layer:
product media;
look/story;
line sheet;
hotspot buy points;
availability;
price/terms;
add-to-order;
buyer-specific visibility.
```

Where it lives:

```text
Brand sample_collection;
Shop sample_collection;
Shop collection_order.
```

Integration moment:

```text
After Brand Collection Publishing Cockpit.
Do not load heavy media tools on /platform first render.
```

Why it matters:

```text
It improves buyer conversion while keeping the core operator flow simple.
```

#### C101-04 Suggested orders and replenishment recommendations

Competitive signal:

```text
NuORDER has suggested orders and buying recommendations based on order history,
bestsellers and reports.
Onfinity textile ERP highlights season planning and replenishment control.
```

What we already have:

```text
Order flow exists, but recommendation logic is not core.
```

What to add:

```text
Suggested order draft:
previous order;
best sellers;
size curve;
available stock;
delivery window;
buyer budget;
missing core sizes;
slow-moving stock if Brand wants closeout.
```

Where it lives:

```text
Shop collection_order;
Brand collection_order.
```

Integration moment:

```text
After one real Shop order flow works.
Before advanced AI.
Start rule-based, not black-box AI.
```

Why it matters:

```text
It directly increases order value and makes the buyer workflow smarter.
```

#### C101-05 Bulk order import/export and multi-door orders

Competitive signal:

```text
NuORDER supports order imports/exports, bulk and multi-door ordering.
МойСклад emphasizes practical import/export, documents and integrations.
```

What we already have:

```text
Migration bridge is planned, but multi-door/multi-store order handling needs explicit treatment.
```

What to add:

```text
Excel/CSV order template;
multi-store delivery split;
store/location allocation;
POS/ERP export;
validation errors;
import confidence;
order preview before commit.
```

Where it lives:

```text
Shop collection_order;
Brand collection_order;
integration layer.
```

Integration moment:

```text
After order entity and state machine.
Before broad integrations.
```

Why it matters:

```text
This bridges real buyer workflows and reduces adoption friction.
```

#### C101-06 Localized size curves and store allocation

Competitive signal:

```text
NuORDER emphasizes localized size curves and bulk distribution for allocation.
```

What we already have:

```text
Size grids and order quantities exist in parts, but store/region size logic is not a first-class object.
```

What to add:

```text
Size curve model:
store;
region;
category;
brand;
season;
historical sell-through;
recommended size ratio;
manual override;
allocation output.
```

Where it lives:

```text
Shop collection_order;
Brand collection_order;
Brand planning context.
```

Integration moment:

```text
After Shop order cockpit.
Before advanced demand forecasting.
```

Why it matters:

```text
Fashion buyers care deeply about sizes.
This is high-value and practical.
```

#### C101-07 Real-time ATS/pre-book inventory and reserve engine

Competitive signal:

```text
NuORDER uses live ATS and pre-book visibility.
МойСклад emphasizes reserves, stock control and order processing.
```

What we already have:

```text
Order and availability concepts exist, but reserve logic is not strict enough.
```

What to add:

```text
Availability model:
ATS;
pre-book;
reserved;
confirmed;
producing;
backorder;
cancelled;
expires_at;
reservation owner.
```

Where it lives:

```text
Brand collection_order;
Shop collection_order;
Brand order_production;
Manufacturer order_production.
```

Integration moment:

```text
Before order confirmation is considered production-ready.
```

Why it matters:

```text
This prevents overselling and turns orders into operational commitments.
```

#### C101-08 Targeted wholesale campaigns and shoppable order forms

Competitive signal:

```text
NuORDER has campaigns, targeted accounts and shoppable EZ Orders.
JOOR also emphasizes buyer network and outreach.
```

What we already have:

```text
Marketing and campaign fragments exist, but they are not tied cleanly to order creation.
```

What to add:

```text
Campaign as order-driving object:
target buyer group;
collection;
selected items;
recommended quantities;
terms;
expiry date;
resulting orders;
open/click/order metrics.
```

Where it lives:

```text
Brand sample_collection;
Brand collection_order;
Shop collection_order.
```

Integration moment:

```text
After buyer-specific visibility and order draft.
Keep out of /platform first screen.
```

Why it matters:

```text
It connects selling motion to measurable orders.
```

#### C101-09 Wholesale payments, invoices, net terms, partial payments and debt control

Competitive signal:

```text
JOOR Pay and NuORDER payments show that wholesale platforms treat payment as part of the flow.
МойСклад covers invoices, finance, bank statements and settlements.
```

What we already have:

```text
Documents and payment readiness are planned, but payment lifecycle needs clearer states.
```

What to add:

```text
Payment model:
invoice issued;
due date;
net terms;
partial payment;
overdue;
payment proof;
bank import;
credit/debt blocker;
cashflow impact.
```

Where it lives:

```text
Brand collection_order;
Shop collection_order;
Brand order_production;
Russian document layer.
```

Integration moment:

```text
After order confirmation and document checklist.
Before investor proof pack.
```

Why it matters:

```text
Money status is one of the fastest ways to make the product feel real.
```

#### C101-10 Claims, returns and quality dispute workflow

Competitive signal:

```text
Competitors cover order tracking and documents, but Platform Core can differentiate by connecting claims to production evidence.
```

What we already have:

```text
QC and issue logic are mentioned, but claims after delivery are not strong enough.
```

What to add:

```text
Claim entity:
delivery issue;
quality issue;
quantity mismatch;
wrong marking/document;
photo proof;
responsible role;
resolution;
credit note/replacement/repair;
decision ledger.
```

Where it lives:

```text
Shop order_production;
Brand order_production;
Manufacturer order_production;
Supplier order_production if material-related.
```

Integration moment:

```text
After shipment/delivery acknowledgement.
```

Why it matters:

```text
It closes the business loop and improves trust after delivery.
```

#### C101-11 PLM visual decision boards from concept to commercialization

Competitive signal:

```text
Centric Visual Boards connect real-time data and imagery across planning,
concept, design, merchandising, buying and development.
```

What we already have:

```text
Article and collection logic exist, but visual decision boards are not a governed layer.
```

What to add:

```text
Decision board:
article cards;
collection board;
BOM/readiness;
sample status;
buyer feedback;
margin;
production risk;
decision status.
```

Where it lives:

```text
Brand development;
Brand sample_collection;
Shop sample_collection;
shared decision ledger.
```

Integration moment:

```text
After article/collection cockpits.
Before broad advanced planning.
```

Why it matters:

```text
It makes PLM decisions visual without becoming a separate design tool.
```

#### C101-12 Digital sample reduction and sample-round control

Competitive signal:

```text
Centric PLM emphasizes reducing physical samples and managing design/prototype cycles.
```

What we already have:

```text
Sample concepts exist but need a strict sample-round state machine.
```

What to add:

```text
Sample round:
request;
digital review;
physical sample needed or skipped;
fit/comment;
approval/rejection;
cost/time impact;
next sample action.
```

Where it lives:

```text
Brand development;
Brand sample_collection;
Manufacturer sample_collection.
```

Integration moment:

```text
After article readiness and before publishing.
```

Why it matters:

```text
It reduces time/cost and gives the product a true PLM-grade layer.
```

#### C101-13 BOM, costing and margin guard before publishing and production

Competitive signal:

```text
Centric focuses on costing and margin protection.
МойСклад and Onfinity both emphasize production cost and BOM/BOQ logic.
```

What we already have:

```text
BOM and production package ideas exist, but margin guard is not yet strict.
```

What to add:

```text
BOM costing:
material cost;
labor/operation cost;
supplier quote;
waste allowance;
target wholesale price;
margin;
confidence;
approval state.
```

Where it lives:

```text
Brand development;
Brand collection_order;
Manufacturer order_production;
Supplier order_production.
```

Integration moment:

```text
Before article becomes publish-ready or production-ready.
```

Why it matters:

```text
It prevents commercially weak products from entering order/production blindly.
```

#### C101-14 Material Requirement Planning tied to orders and forecasts

Competitive signal:

```text
МойСклад and Onfinity both emphasize material requirements and production planning.
```

What we already have:

```text
Supplier/material readiness exists as a concept, but MRP should be explicit.
```

What to add:

```text
MRP:
confirmed order demand;
forecast demand;
BOM explosion;
available material;
reserved material;
shortage;
RFQ trigger;
substitution;
delivery risk.
```

Where it lives:

```text
Manufacturer order_production;
Supplier order_production;
Brand order_production.
```

Integration moment:

```text
After production handoff and before production stages.
```

Why it matters:

```text
This is one of the strongest differentiators versus pure B2B wholesale tools.
```

#### C101-15 Tech cards, routing and operation-level production execution

Competitive signal:

```text
МойСклад production uses tech cards, production tasks, stages, time, materials and cost.
Onfinity manufacturing includes routing, work orders and production execution.
```

What we already have:

```text
Production stages exist, but operation-level route/cards should become structured.
```

What to add:

```text
Operation route:
stage;
instruction;
required materials;
worker/team;
planned time;
actual time;
labor cost;
defect/waste;
attachment/photo;
next stage.
```

Where it lives:

```text
Manufacturer order_production.
Brand sees summary only.
Shop does not see internal operations.
```

Integration moment:

```text
After Manufacturer Production Cockpit basic PO flow.
```

Why it matters:

```text
This makes production real, measurable and mobile-ready.
```

#### C101-16 Supplier portal with RFQ, tenders, scorecard, blacklist and certificates

Competitive signal:

```text
Onfinity procurement includes RFQ, vendor management, tenders, approvals,
vendor portal, blacklist and BI.
```

What we already have:

```text
Supplier procurement cockpit is planned, but supplier quality governance needs sharper structure.
```

What to add:

```text
Supplier profile:
capabilities;
materials;
MOQ;
lead time;
certificates;
RFQ history;
quote reliability;
delivery reliability;
quality issues;
blacklist/risk status;
approved for categories.
```

Where it lives:

```text
Supplier order_production;
Manufacturer order_production;
Brand development/order_production.
```

Integration moment:

```text
After RFQ/reserve/delivery flow.
```

Why it matters:

```text
It turns supplier work into a trusted network asset.
```

#### C101-17 Document management with OCR, versioning, signature and audit

Competitive signal:

```text
Onfinity DMS covers secure storage, OCR/content search, workflows,
digital signatures, versioning, audit and auto-import.
МойСклад focuses on practical document printing, templates and ЭДО.
```

What we already have:

```text
Russian document checklist exists as a plan, but not a full evidence/document lifecycle.
```

What to add:

```text
Document object:
type;
entity link;
version;
status;
OCR metadata;
signature status;
ЭДО/export status;
access control;
audit log;
expiry/renewal if certificate.
```

Where it lives:

```text
All roles;
shared document panel;
Russian business layer.
```

Integration moment:

```text
After document checklist.
Before advanced integrations.
```

Why it matters:

```text
Documents are the backbone of Russian operating trust.
```

#### C101-18 Marking, GS1, serial/batch and DataMatrix readiness

Competitive signal:

```text
МойСклад strongly covers Честный знак marking for clothing and footwear,
including codes, acceptance/shipment and ЭДО.
Onfinity inventory includes barcode/QR, GS1 compatibility, serial and batch numbers.
```

What we already have:

```text
Marking readiness is planned, but should become a shipment blocker where legally required.
```

What to add:

```text
Marking model:
category requirement;
GTIN;
DataMatrix;
batch/serial;
label print;
code application;
acceptance/shipment check;
ЭДО/УПД relation;
exception reason.
```

Where it lives:

```text
Brand order_production;
Manufacturer order_production;
Supplier order_production if material/label related;
Shop order_production as buyer-safe status.
```

Integration moment:

```text
After document and shipment readiness.
```

Why it matters:

```text
This is critical for Russian fashion categories and makes the product locally credible.
```

#### C101-19 Integration marketplace and sync health dashboard

Competitive signal:

```text
JOOR and NuORDER emphasize many ERP/PLM/POS integrations.
МойСклад has an integration catalog and API.
Onfinity emphasizes ERP integrations and open/low-code extensibility.
```

What we already have:

```text
Integration queue is planned, but should become a visible health object.
```

What to add:

```text
Integration health:
system;
direction;
last sync;
records synced;
records failed;
field mapping;
manual export needed;
retry;
owner;
business impact.
```

Where it lives:

```text
Shared integration layer;
Brand and Shop order/document panels;
Manufacturer/Supplier operations where relevant.
```

Integration moment:

```text
After import/export contracts and data dictionary.
Before scaling pilots.
```

Why it matters:

```text
It makes integrations honest and prevents fake "connected" promises.
```

#### C101-20 Low-code workflow and custom fields layer

Competitive signal:

```text
Onfinity Canvas supports low-code data-centric applications.
МойСклад allows custom fields, templates and process customization.
NuORDER emphasizes flexible configurations.
```

What we already have:

```text
Configuration layer is planned, but low-code/custom fields need explicit boundaries.
```

What to add:

```text
Controlled customization:
custom fields;
custom document templates;
company-specific workflow config;
approval steps;
required fields;
role visibility;
no-code rules with validation.
```

Where it lives:

```text
Platform Core configuration;
not in daily operator cockpit unless needed.
```

Integration moment:

```text
After canonical models and permissions.
Before enterprise pilots.
```

Why it matters:

```text
It makes the product adaptable without exploding code/routes.
```

#### C101-21 Bounded AI assistant for workflow acceleration, not autonomous control

Competitive signal:

```text
Centric, Onfinity and NuORDER all position AI/insights in different ways.
```

What we already have:

```text
AI is mentioned, but should be bounded by trust, decisions and event audit.
```

What to add:

```text
AI may suggest:
missing fields;
order recommendations;
duplicate risks;
late material risk;
content enrichment;
document classification;
next best action.

AI must not:
confirm orders;
change production status;
approve payments;
mark documents signed;
hide uncertainty.
```

Where it lives:

```text
All cockpits as suggestion layer.
Decision ledger records accepted suggestions.
```

Integration moment:

```text
After event/state/decision ledger and confidence scoring.
```

Why it matters:

```text
It gives modern investor appeal without risking fake automation.
```

#### C101-22 Market intelligence, competitor pricing and markdown risk

Competitive signal:

```text
Centric Market Intelligence and Planning/Pricing focus on market signals,
pricing, demand and markdown/inventory risk.
NuORDER insights surface order trends and bestsellers.
```

What we already have:

```text
Analytics are planned later, but market/pricing signals should be tied to decisions.
```

What to add:

```text
Market signal:
competitor price band;
trend tag;
category demand;
sell-through signal;
markdown risk;
recommended price guard;
assortment impact.
```

Where it lives:

```text
Brand development;
Brand sample_collection;
Shop sample_collection;
Shop collection_order.
```

Integration moment:

```text
After basic order/product data is reliable.
Before broad analytics universe.
```

Why it matters:

```text
It helps the platform guide decisions, not just record them.
```

#### C101-23 PIM/DAM/PXM content readiness and channel syndication

Competitive signal:

```text
Centric PXM combines PIM, DAM, content syndication and digital shelf analytics.
JOOR also emphasizes high-quality assets and linesheet-ready content.
```

What we already have:

```text
Product media exists in fragments, but content readiness is not strict across channels.
```

What to add:

```text
Content readiness:
images;
video;
360/3D if available;
description;
attributes;
care/composition;
certificates;
channel format;
translation/localization;
buyer-facing quality score.
```

Where it lives:

```text
Brand development;
Brand sample_collection;
Shop sample_collection.
```

Integration moment:

```text
Before publishing and buyer showroom.
```

Why it matters:

```text
Good content drives buying confidence and reduces clarification loops.
```

#### C101-24 Exception ticketing with SLA, escalation and owner queues

Competitive signal:

```text
Onfinity ticketing and field service include SLA, auto-escalation,
notifications, scheduling and mobile work patterns.
```

What we already have:

```text
SLA and exception management are mentioned, but need a concrete ticket object.
```

What to add:

```text
Exception ticket:
entity;
issue type;
owner;
severity;
SLA;
next action;
escalation;
decision required;
resolution;
evidence;
impact on order/PO/shipment.
```

Where it lives:

```text
All roles;
EntityInbox;
EntityTrace;
calendar.
```

Integration moment:

```text
After EntityInbox and state machines.
```

Why it matters:

```text
It prevents the platform from becoming a passive dashboard.
```

#### C101-25 Customer success, onboarding and investor proof system

Competitive signal:

```text
JOOR and NuORDER both show ROI/case-study proof and onboarding/support signals.
МойСклад emphasizes simple start, support, knowledge base and practical adoption.
Onfinity has training/community resources.
```

What we already have:

```text
Pilot pack and investor proof pack are planned, but onboarding/proof should be productized.
```

What to add:

```text
Proof system:
role onboarding progress;
first successful article/order/PO/material request;
time saved;
manual steps removed;
documents completed;
integration status;
pilot result export;
investor proof snapshot.
```

Where it lives:

```text
Platform Core action index;
pilot pack;
investor proof pack;
non-operator evidence/export area.
```

Integration moment:

```text
After golden path works with at least one scenario.
```

Why it matters:

```text
It turns product progress into adoption proof and investment narrative.
```

### 101.3 Combined order: previous 10 ideas plus new 25 ideas

Cursor should integrate the previous 10 and these 25 in this order.

This is not the order for building every UI screen. It is the order for adding structural capability safely.

#### Phase A - meaning, scope and trust before feature growth

Do first:

```text
100.1 Canonical business dictionary.
100.8 Trust/confidence scoring.
101.19 Integration marketplace and sync health dashboard.
101.20 Low-code workflow and custom fields layer.
100.6 Configuration layer.
```

Why:

```text
The project must know what its entities mean, how trusted data is,
which systems are connected and what can be configured before adding more visible features.
```

#### Phase B - migration and pilot readiness

Do second:

```text
100.3 Migration bridge.
101.05 Bulk order import/export and multi-door orders.
100.7 Scenario library.
100.4 Pilot package.
101.25 Customer success, onboarding and investor proof system.
```

Why:

```text
Real users need a bridge from existing workflows and investors need proof from pilots.
```

#### Phase C - buyer and selling strength

Do third:

```text
101.01 Visual assortment board.
101.02 Account-specific wholesale portal.
101.03 Always-on shoppable linesheet/showroom.
101.04 Suggested orders and replenishment recommendations.
101.06 Localized size curves and store allocation.
101.08 Targeted wholesale campaigns and shoppable order forms.
101.09 Wholesale payments, invoices and debt control.
```

Why:

```text
These make Brand and Shop workflows commercially strong,
closer to JOOR/NuORDER-level wholesale usefulness.
```

#### Phase D - PLM and production strength

Do fourth:

```text
101.11 PLM visual decision boards.
101.12 Digital sample reduction and sample-round control.
101.13 BOM, costing and margin guard.
101.14 Material Requirement Planning.
101.15 Tech cards, routing and operation-level production execution.
101.16 Supplier portal with RFQ, scorecard and certificates.
```

Why:

```text
These make Platform Core stronger than wholesale-only tools by connecting product development,
production and suppliers.
```

#### Phase E - Russian operating reality and documents

Do fifth:

```text
101.17 Document management with OCR, versioning, signature and audit.
101.18 Marking, GS1, serial/batch and DataMatrix readiness.
101.10 Claims, returns and quality dispute workflow.
100.5 Decision ledger.
101.24 Exception ticketing with SLA, escalation and owner queues.
```

Why:

```text
Russian users need documents, marking, disputes and accountable decisions.
```

#### Phase F - intelligence, field mode and monetization

Do sixth:

```text
100.9 Mobile-first field mode.
101.21 Bounded AI assistant.
101.22 Market intelligence, competitor pricing and markdown risk.
101.23 PIM/DAM/PXM content readiness and channel syndication.
100.2 Role-level value metrics and ROI.
100.10 Commercial packaging and monetization map.
```

Why:

```text
These make the product smarter, more differentiated and more investable after the core chain works.
```

### 101.4 What not to do with competitor ideas

Do not copy competitor surfaces directly.

Avoid:

```text
global marketplace as first screen;
generic ERP menus;
full accounting as a pillar;
AI assistant that can silently change business state;
visual boards disconnected from order/production decisions;
campaign tools not tied to order creation;
document archive with no entity link;
integration badges without sync health;
mobile app promises without field-mode tasks;
analytics without reliable source data.
```

Platform Core should win by combining:

```text
JOOR/NuORDER wholesale ordering and assortment strength;
Centric product development, visual decision and content strength;
Onfinity workflow, document, procurement and execution strength;
МойСклад Russian operational, document, marking and SME practicality;
Syntha's own 4-role x 5-pillar connected operating chain.
```

### 101.5 New documents to create from this section

Create these only after P0 foundation and action index exist:

```text
PLATFORM-CORE-COMPETITIVE-FEATURE-MATRIX.md
PLATFORM-CORE-ASSORTMENT-BOARD-SPEC.md
PLATFORM-CORE-WHOLESALE-PORTAL-SPEC.md
PLATFORM-CORE-MRP-PRODUCTION-SPEC.md
PLATFORM-CORE-DOCUMENT-MARKING-SPEC.md
PLATFORM-CORE-INTEGRATION-HEALTH-SPEC.md
PLATFORM-CORE-AI-GUARDRAILS.md
PLATFORM-CORE-CUSTOMER-SUCCESS-PROOF.md
```

Each document must stay compact and point back to this audit section instead of duplicating the whole strategy.

## 102. Russia-first and adaptive-fit gate: what Cursor must check before adding any feature

This section adds the missing product filter.

The project should not copy competitor features blindly.

Every feature, route, cockpit, data model, integration and UI pattern must pass a Russia-first and adaptive-fit gate.

If something does not fit Russian fashion business reality, current 4 roles, current 5 pillars, mobile/tablet/desktop usage and the Platform Core golden path, it should not enter Platform Core.

### 102.1 The main rule

```text
Not every strong competitor feature is a Syntha Platform Core feature.
```

Accept a feature only if it satisfies all five questions:

```text
1. Does it help Brand, Shop, Manufacturer or Supplier do real work?
2. Does it belong to one of the 5 pillars?
3. Does it move article, collection, order, production, supplier, document or communication forward?
4. Does it fit Russian business workflows, documents, integrations and operational habits?
5. Can it work cleanly on iPhone, iPad and MacBook without noise?
```

If any answer is no:

```text
reject;
archive;
make advanced extension;
or redesign as a smaller Platform Core action.
```

### 102.2 Russia-fit gate for competitor ideas

Every competitor-inspired idea must be classified:

| Decision | Meaning | Example |
| --- | --- | --- |
| `build_core` | Directly strengthens 4 roles x 5 pillars. | order cockpit, document readiness, supplier RFQ, marking readiness |
| `adapt_core` | Good idea, but must be localized and simplified. | NuORDER-style order recommendations adapted to Russian wholesale and size curves |
| `advanced_extension` | Useful later, not in first Platform Core. | advanced visual boards, AI forecasting, broad market intelligence |
| `integration_layer` | Should appear as sync/export/queue, not giant UI. | 1C, МойСклад, ЭДО, marketplace exchange |
| `archive_reference` | Useful as reference, not current product. | global marketplace/social/community features |
| `reject_for_core` | Attractive but wrong for current core. | generic global trade show network as first screen |

Required fields in future competitive feature matrix:

```text
feature;
source_reference;
role;
pillar;
russian_fit;
mobile_fit;
data_source;
required_documents;
required_integrations;
operator_value;
investor_value;
decision;
when_to_build;
what_to_cut_if_too_large.
```

### 102.3 Russian business reality checklist

A Platform Core feature is Russia-ready only if it considers:

```text
legal entity and counterparty data;
INN/KPP/OGRN/OGRNIP where relevant;
contract/specification terms;
invoice/payment status;
UPD/waybill/invoice-factura/act/certificate/declaration where relevant;
ЭДО/manual document fallback;
1C/МойСклад/file export/import realities;
Честный знак/marking readiness where category requires it;
barcode/GTIN/DataMatrix/label workflow where relevant;
marketplace-related fields only when they affect order/production/channel export;
Russian currency, VAT/tax mode and payment terms without hardcoding one scenario;
warehouse/reserve/shipment realities;
small-team manual workarounds;
mobile-first proof for factory/supplier status updates.
```

Important:

```text
Cursor must not hardcode legal requirements, dates or marking category rules from memory.
Before implementing compliance/marking/tax-specific logic, check current official sources and write the source/date into the implementation note.
```

Official sources to verify before implementation:

```text
Честный знак official site for marking/category/process updates;
ФНС official site for tax/legal entity/e-signature/service references;
operator/ЭДО documentation for document exchange;
МойСклад/1C/API docs for integration behavior;
marketplace official docs only when marketplace export becomes part of a workflow.
```

### 102.4 Adaptive UI gate

Every Platform Core feature must work in three modes:

```text
iPhone:
  one role task at a time;
  no wide tables;
  large tap targets;
  short labels;
  bottom sheets or single-column panels;
  field-mode actions for production/supplier.

iPad:
  master-detail layout;
  compact matrix/filter left, detail right;
  good for showroom/order review and production status.

MacBook:
  full role x pillar matrix;
  cockpit + detail panel;
  table/grid only when useful;
  no giant hero or marketing layout.
```

Feature is not accepted if:

```text
it requires wide desktop table to be usable;
it hides primary action below long text;
it has buttons with unclear result;
it creates horizontal scroll on iPhone;
it uses different visual language from Platform Core;
it makes operator UI look like investor presentation;
it loads heavy advanced modules before user intent.
```

### 102.5 Russian small-business adoption gate

Many Russian brands, shops, productions and suppliers will not have clean enterprise data.

A feature must allow one of these adoption paths:

```text
manual entry;
CSV/Excel import;
document upload with metadata;
file export;
integration queue;
manual confirmation;
demo/seed mode clearly labeled;
progressive data completeness.
```

Feature is not accepted if:

```text
it requires perfect ERP integration before it is useful;
it requires every partner to be onboarded before first order;
it requires advanced BI data before first action;
it assumes large enterprise staff;
it cannot show "missing/needs review" states.
```

### 102.6 Russian communication reality gate

Real work often starts in chat, calls, email and files.

Platform Core should not try to replace all communication at once.

It should capture the business result of communication:

```text
decision;
clarification;
approval;
amendment;
issue;
delay;
document request;
certificate request;
delivery proof;
payment proof.
```

Action:

```text
Add "Convert to Platform Core action" pattern:
message/file/note -> entity-linked task/event/decision/document.
```

Where:

```text
EntityInbox;
DecisionLedger;
DocumentChecklist;
ExceptionTicket;
EntityTrace.
```

Do not build:

```text
generic social chat;
global feed;
community layer;
unconnected comments;
AI chat that changes status without confirmation.
```

### 102.7 Russian integration reality gate

Integrations should be honest and staged.

Allowed stages:

```text
not_connected;
manual_export;
manual_import;
file_template;
queued;
synced;
failed;
needs_review;
live_api;
disabled_by_policy.
```

For each integration, define:

```text
system;
direction;
entity;
fields;
owner;
failure behavior;
manual fallback;
last sync;
source confidence;
user-visible status.
```

Priority integrations:

```text
1C;
МойСклад;
ЭДО;
Честный знак;
bank/payment import;
marketplace exports only when they support an order/channel workflow;
logistics carrier tracking only after shipment flow exists.
```

Reject:

```text
fake connected badges;
integration marketplace as first screen;
sync status hidden from users;
silent fallback from live API to demo data.
```

### 102.8 What still needs to be added as Cursor tasks

Add these documents after `PLATFORM-CORE-ACTION-INDEX.md` and `PLATFORM-SCOPE-MANIFEST.md`:

```text
PLATFORM-CORE-RUSSIA-FIT-GATE.md
PLATFORM-CORE-RESPONSIVE-QA-MATRIX.md
PLATFORM-CORE-RU-DOCUMENT-AND-MARKING-CHECKLIST.md
PLATFORM-CORE-RU-INTEGRATION-READINESS.md
PLATFORM-CORE-COMPETITOR-FEATURE-FIT-MATRIX.md
PLATFORM-CORE-DO-NOT-BUILD-LIST.md
```

Each document must be compact.

Do not duplicate the full audit.

Each document should contain:

```text
purpose;
decision rules;
accepted examples;
rejected examples;
where it connects in code;
validation;
last reviewed date;
official source links if legal/compliance-related.
```

### 102.9 When Cursor should apply this gate

Apply this gate:

```text
before adding any competitor-inspired feature;
before recovering anything from archive;
before adding new route/navigation;
before adding integration;
before adding document/marking/tax/payment behavior;
before adding AI/analytics;
before calling a feature "investor-ready".
```

Do not let this gate block P0 foundation:

```text
/platform;
src/features/platform-core;
matrix;
readiness audit;
route constants;
compatibility wrappers;
boundary checks.
```

But every feature after P0 must pass this gate.

### 102.10 Strongest missing instruction for Cursor

Add this instruction to the top of future daily task files:

```text
Build only what fits Russian fashion business reality.
Every feature must be adaptive on iPhone, iPad and MacBook.
Every feature must belong to one of 4 roles and 5 pillars.
Every feature must move a real entity or decision forward.
Every legal/marking/tax/document assumption must be checked against current official sources.
If a competitor feature does not pass this filter, reject it, archive it or redesign it.
```

This is the strongest missing rule because it prevents the project from becoming:

```text
too global;
too enterprise-heavy;
too demo-like;
too desktop-only;
too legally vague;
too noisy;
too expensive for Cursor to maintain;
too disconnected from Russian users.
```

## 103. Default working boundary: Platform Core only, archive opt-in only

This section makes the archive/context rule explicit and non-negotiable.

For all future Cursor work:

```text
The main working environment is Platform Core.
Everything outside the Platform Core chain is archive by default.
Archive is not analyzed by default.
Archive is not searched by default.
Archive is not imported by default.
Archive is opened only when the task explicitly asks for archive recovery or names a concrete archived item.
```

This rule exists to protect:

```text
token budget;
Cursor speed;
developer focus;
project performance;
route clarity;
investor/user product story;
safe refactoring.
```

### 103.1 What counts as Platform Core

A file, route, component, model, API or feature belongs to Platform Core only if it directly supports at least one part of this chain:

```text
article
-> collection
-> order
-> brand confirmation/control
-> production handoff
-> manufacturer production
-> supplier materials/procurement
-> shipment
-> delivery/acceptance
-> closeout/learning
```

And/or directly supports the operating layer around that chain:

```text
entity chat;
entity calendar;
decision ledger;
document readiness;
marking readiness;
integration/export queue;
role permissions;
state/event trace;
data source/confidence;
Russian business requirements.
```

If it does not support that chain or operating layer, it is not Platform Core.

### 103.2 Four roles and five pillars are the only default scope

Default roles:

```text
Brand;
Shop;
Manufacturer;
Supplier.
```

Default pillars:

```text
development;
sample_collection;
collection_order;
order_production;
comms.
```

Everything else is outside default scope unless it is a narrow adapter into one of these roles/pillars.

Examples outside default scope:

```text
admin;
academy;
consumer/client tools;
runway;
wardrobe;
global distributor role;
generic marketplace;
social feed;
gamification;
public marketing pages;
generic AI playground;
unconnected analytics universe;
unconnected visual experiments;
unconnected partner discovery;
unconnected trade show/network pages.
```

These can exist in archive or future advanced extensions, but they must not enter Platform Core context by default.

### 103.3 Archive decision rule

Every non-core item must receive one of these statuses:

```text
archive_reference:
  keep for reference only; do not analyze by default.

candidate_for_recovery:
  may contain something valuable for 4 roles x 5 pillars; analyze only by explicit recovery task.

recovered_into_platform:
  useful behavior was rebuilt or adapted into Platform Core; archive source remains disconnected.

advanced_extension:
  useful later, but not part of current core chain.

reject_for_core:
  not useful for Platform Core; keep out.

delete_after_confidence:
  safe to remove after validation/backups/decision.
```

Cursor must not treat `archive_reference`, `advanced_extension` or `reject_for_core` as active working context.

### 103.4 Recovery from archive is allowed only through a narrow gate

Archive can be used only if all answers are yes:

```text
1. Does the archived item directly improve one role/pillar?
2. Does it support article, collection, order, production, supplier, shipment, closeout, chat or calendar?
3. Can it be extracted as a small behavior/model/component instead of a whole old page?
4. Can it be rebuilt inside src/features/platform-core or a narrow adapter?
5. Can it be validated without importing archive runtime code?
6. Does it reduce noise or create a real action/output?
```

If any answer is no:

```text
leave it in archive;
do not analyze it further;
do not import it;
do not mention it in daily action context.
```

Recovery process:

```text
1. Name exact archived file/folder.
2. Name target role.
3. Name target pillar.
4. Name target cockpit/section.
5. Name exact behavior to recover.
6. Mark candidate_for_recovery in PLATFORM-SCOPE-MANIFEST.md.
7. Rebuild or adapt narrowly into Platform Core.
8. Validate import boundaries.
9. Mark recovered_into_platform or rejected.
```

### 103.5 Default query behavior for Cursor

When user asks:

```text
improve Platform Core;
fix Platform Core;
analyze Platform Core;
continue project;
work on roles/pillars;
optimize project;
make project faster;
reduce token load;
clean connections;
```

Cursor must assume:

```text
Use Platform Core files only.
Do not open archive.
Do not search legacy-rest.
Do not search broad source-links folders.
Do not analyze consumer/admin/academy/runway/social/marketing areas.
Use context packs and active manifest.
```

Cursor may open archive only when user says something like:

```text
check archive for this exact feature;
recover useful archive item for Brand development;
look in legacy-rest for data source badge;
compare this archived file with Platform Core;
move this archived logic into Platform Core;
```

Even then:

```text
Open only the named archive item or the narrow folder required.
Do not scan the whole archive.
Do not bring back whole old pages.
```

### 103.6 Default file/context allowlist

Default Platform Core context after P0 should be:

```text
src/app/platform/page.tsx
src/features/platform-core/**
src/lib/platform-core-*.ts
src/lib/platform-core-readiness-sections/**
src/lib/routes.ts
scripts/validate-platform-*.ts
scripts/report-platform-*.ts
e2e/*platform*.spec.ts
e2e/*cabinet-hubs*.spec.ts
Projects/_platform-core-split/platform-core/*.md
Projects/_platform-core-split/MANIFEST.json
Projects/_platform-core-split/PHYSICAL-MOVE-PLAN.md
```

Default archive/context denylist:

```text
Projects/_platform-core-split/legacy-rest/**
Projects/_platform-core-split/**/source-links/** as broad folders
Projects/_ai-share/synth-1-full/src/app/admin/**
Projects/_ai-share/synth-1-full/src/app/academy/**
Projects/_ai-share/synth-1-full/src/app/client/**
Projects/_ai-share/synth-1-full/src/app/runway/**
Projects/_ai-share/synth-1-full/src/components/admin/**
Projects/_ai-share/synth-1-full/src/components/academy/**
Projects/_ai-share/synth-1-full/src/components/client/**
Projects/_ai-share/synth-1-full/src/components/runway/**
Projects/_ai-share/synth-1-full/src/components/wardrobe/**
generated reports
screenshots/videos
build artifacts
old experiments
```

Broad role folders are also not default context:

```text
src/app/shop/b2b/**
src/app/brand/production/**
src/app/factory/**
src/components/**
```

They may be opened only through a named role/pillar adapter task.

### 103.7 Golden path filter for every route

Every route must answer:

```text
Does this route move article -> collection -> order -> brand -> production -> supplier -> shipment -> closeout?
Does this route support entity chat/calendar/document/decision around that chain?
```

If yes:

```text
keep in Platform Core or wrap into Platform Core cockpit.
```

If partially:

```text
move behind adapter, advanced extension or candidate_for_recovery.
```

If no:

```text
archive, hide from core nav and ignore by default.
```

Examples:

```text
Shop B2B order detail -> Platform Core, but as Shop Buyer Tracking/Order Cockpit.
Brand production advanced video -> archive/advanced unless tied to PO evidence.
Supplier circular hub -> archive unless tied to material request/reserve/proof.
Academy content -> archive/help center, not core.
Consumer visual tools -> archive/advanced unless they directly improve article readiness.
Generic marketplace discovery -> archive unless it leads to live collection/order.
Generic analytics -> archive/advanced until source data and decisions are reliable.
```

### 103.8 Archive must not consume token budget

Concrete Cursor rules:

```text
Do not include archive in "read project" tasks.
Do not use rg over archive unless the task explicitly asks.
Do not use broad source-links as active code.
Do not include archive files in action context.
Do not summarize archive in implementation notes unless archive was explicitly opened.
Do not let archive files appear in daily action index.
Do not let archive imports pass boundary validation.
```

Required validation:

```text
report-platform-context-scope must fail or warn if archive appears in active Platform Core context.
validate-platform-import-boundaries must fail if Platform Core imports archive runtime code.
PLATFORM-SCOPE-MANIFEST.md must list every archive recovery candidate before it is opened for implementation.
```

### 103.9 What to do with useful archive logic

If archive contains something useful:

```text
extract principle, not page;
extract data model, not old navigation;
extract small component, not old screen;
extract validator/test, not old app mode;
extract idea, not demo state.
```

Then place it into:

```text
src/features/platform-core/model
src/features/platform-core/events
src/features/platform-core/state
src/features/platform-core/cockpits
src/features/platform-core/adapters
src/features/platform-core/readiness
src/features/platform-core/validation
```

Never place recovered archive logic directly into:

```text
src/app/platform/page.tsx as business logic;
old role route pages as new source of truth;
archive folders;
generic shared components without owner;
unscoped src/lib files without Platform Core prefix.
```

### 103.10 Final directive

This is the exact instruction Cursor should follow:

```text
Platform Core is the product.
Archive is reference.
Archive is closed by default.
Open archive only by explicit narrow request.
Recover only what strengthens 4 roles x 5 pillars and the golden path.
Everything else stays archived and out of token context.
```

If Cursor is unsure whether something belongs to Platform Core, it must ask:

```text
Does this help article, collection, order, brand confirmation, production,
supplier procurement, shipment, closeout, entity chat or entity calendar?
```

If no:

```text
do not analyze it;
do not build it;
do not import it;
do not spend tokens on it by default.
```

## 104. Archive recovery shortlist for the golden path and entity chat/calendar

This section answers the explicit archive question.

Archive was checked narrowly for items that can strengthen:

```text
article -> collection -> order -> brand -> production -> supplier -> shipment -> closeout
```

and the operating layer:

```text
entity chat;
entity calendar;
documents;
decisions;
integration/export;
role evidence.
```

Result:

```text
Yes, there are useful archive items.
They should be recovered as ideas, contracts, models, tests or tiny components.
They should not be imported as old pages or broad archive folders.
```

### 104.1 Archive items to recover now or soon

| Archive item | Decision | Why it matters | Target in Platform Core |
| --- | --- | --- | --- |
| `components-client/platform-data-banner.tsx` | `recover_now` | Clean idea for showing API vs local/demo mode. | `PlatformCoreDataSourceBadge`, every matrix cell and cockpit. |
| `root-docs/B2B_AND_PRODUCTION_CORE_SPEC.md` | `recover_now_as_contract` | Contains strong order/chat/calendar/deep-link model and says chat/calendar are operating layer, not foundation. | `PLATFORM-CORE-LINK-INTEGRITY-MATRIX.md`, `CONNECTIONS.md`, EntityInbox/EntityCalendar contracts. |
| `root-docs/MVP_CONTRACT.md` | `recover_now_as_quality_gate` | Core endpoints/features must have test and demo fallback rule. | `PLATFORM-CORE-MVP-CONTRACT.md`, validation ladder. |
| `root-docs/DOD_CHECKLIST.md` | `recover_now_as_dod` | Simple Definition of Done: docs, smoke/integration test, no unhandled demo 500, no scope creep. | `PLATFORM-CORE-DOD.md`, action-card completion rule. |
| `root-docs/RUNBOOK.md` | `recover_as_adapter` | Contains useful notes about demo/API modes, routes, messages/calendar and CI. | Compact Platform Core runbook only; do not copy broad old runbook. |
| `lib-platform-client-tools/json-io.ts` | `recover_now_as_utility` | Small import/export utility. Useful for migration bridge and manual file workflows. | `src/features/platform-core/import-export/json-io.ts`, versioned import/export. |
| `lib-platform-client-tools/types.ts` | `recover_as_schema_seed` | Has versioned export contract ideas, DPP types, partner assortment shapes, fit feedback source. | Extract only relevant Platform Core types: import/export versions, DPP, partner matrix, fit/size evidence. |
| `lib-platform-client-tools/dpp-payload.ts` | `recover_as_evidence_model` | Good digital product passport shape: supply chain, materials, certificates. | Article/BOM/material/certificate evidence layer. Rewrite data source and IDs. |
| `lib-platform-client-tools/dpp-calculator.ts` | `recover_as_estimated_model` | Has material-factor idea for eco score. Useful only if clearly marked estimated/demo. | `entity-confidence`, DPP/readiness estimate. Replace random IDs and hardcoded claims. |
| `root-fastapi-app/services/production/bom_costing_service.py` | `recover_as_model_contract` | BOM, material cost, raw material requirement, SMV/labor, variance report. | Brand development, Manufacturer production, Supplier material planning. |
| `root-fastapi-app/services/production/sourcing_rfq_service.py` | `recover_as_model_contract` | RFQ, material orders, supplier offers, contracts, scorecard, certificates. | Supplier Procurement Cockpit, Manufacturer material gate, Brand supplier visibility. |
| `root-tests/smoke/test_order_workflow.py` | `recover_as_acceptance_test` | Draft -> validate -> submit -> no double submit. | Order state machine tests. |
| `root-tests/smoke/test_plm_workflow.py` | `recover_as_acceptance_test` | Supplier/material order, tech pack/BOM, sample, production message. | Article -> BOM -> sample -> manufacturer message scenario. |
| `root-tests/integration/test_supply_chain_rfq.py` | `recover_as_acceptance_test` | RFQ -> quotes -> compare vendor offers. | Supplier procurement scenario tests. |
| `root-tests/integration/test_fintech_invoices.py` | `recover_as_acceptance_test` | Invoice lifecycle. | Russian document/payment readiness tests. |
| `root-tests/integration/test_global_trade_p7.py` | `recover_as_document_scenario` | Customs/certificates/compliance log idea. | Adapt to Russian docs, EAC/certificates/marking readiness; no global AI UI by default. |
| `components-admin/attribute-manager-dialog.tsx` | `recover_as_schema_seed` | Attribute taxonomy and editing logic can strengthen article readiness. | Extract schema/readiness rules only; do not reuse admin dialog UI. |
| `components-admin/fit-guide-*` | `recover_as_advanced_schema` | Fit/size rules can improve SKU/size readiness and buyer confidence. | Article size grid, Shop size curve, Manufacturer grading context. |
| `components-distributor/real-route-ai.tsx` | `recover_as_shipment_risk_idea` | ETA/risk/delay concept is relevant to shipment. | Shipment exception model and buyer-safe ETA; no animated global map, no fake AI. |
| `components-distributor/global-trade-ai.tsx` | `recover_as_compliance_idea` | Document/compliance/duty concepts are useful, but global UI is too broad. | Russian document/marking/compliance readiness; verify official sources before implementation. |

### 104.2 Archive items to keep as reference only

Keep these out of Platform Core by default:

```text
app-admin as full admin area;
app-academy and app-brand-academy;
app-client-tools as consumer tools;
api-ai as broad AI routes;
api-runway;
components-home;
components-runway;
components-wardrobe;
generic social/community/marketing surfaces;
global distributor UI as a fifth role;
consumer outfit/wardrobe/stylist flows;
generic visual search/capsule/for-you flows.
```

Reason:

```text
They do not directly move article -> collection -> order -> production -> supplier -> shipment -> closeout.
Some contain useful ideas, but the full surfaces would add token load, route noise and product confusion.
```

Possible later extraction only:

```text
AI infer-tags/product-description -> bounded AI suggestions for article content readiness.
AI support-reply/chat-response -> draft-only message helper, never status-changing.
suggest-size/fit-feedback -> Shop size confidence and Brand size grid readiness.
market intelligence/order anomaly/inventory optimizer -> later advanced analytics after source data is reliable.
```

### 104.3 What to preserve as links, not runtime dependencies

The following archive links should be preserved in docs as source references only:

```text
legacy-rest/source-links/components-client/platform-data-banner.tsx
legacy-rest/source-links/lib-platform-client-tools/json-io.ts
legacy-rest/source-links/lib-platform-client-tools/types.ts
legacy-rest/source-links/lib-platform-client-tools/dpp-payload.ts
legacy-rest/source-links/lib-platform-client-tools/dpp-calculator.ts
legacy-rest/source-links/root-fastapi-app/services/production/bom_costing_service.py
legacy-rest/source-links/root-fastapi-app/services/production/sourcing_rfq_service.py
legacy-rest/source-links/root-docs/B2B_AND_PRODUCTION_CORE_SPEC.md
legacy-rest/source-links/root-docs/MVP_CONTRACT.md
legacy-rest/source-links/root-docs/DOD_CHECKLIST.md
legacy-rest/source-links/root-docs/RUNBOOK.md
legacy-rest/source-links/root-tests/smoke/test_order_workflow.py
legacy-rest/source-links/root-tests/smoke/test_plm_workflow.py
legacy-rest/source-links/root-tests/integration/test_supply_chain_rfq.py
legacy-rest/source-links/root-tests/integration/test_fintech_invoices.py
legacy-rest/source-links/root-tests/integration/test_global_trade_p7.py
legacy-rest/source-links/components-admin/attribute-manager-dialog.tsx
legacy-rest/source-links/components-admin/fit-guide-*.tsx
legacy-rest/source-links/components-distributor/real-route-ai.tsx
legacy-rest/source-links/components-distributor/global-trade-ai.tsx
```

Rules:

```text
Preserve link in SOURCE-LINKS.md or recovery register.
Do not import from these paths.
Do not add these folders to active Cursor context.
Do not recover whole UI.
Recover only the small model/test/behavior that strengthens Platform Core.
```

### 104.4 How each recovered idea maps to golden path

| Golden path step | Useful archive recovery |
| --- | --- |
| Article | attribute schema, fit/size rules, DPP material/certificate payload, BOM costing seed |
| Collection | partner assortment matrix shape, content/readiness source labels, export contract |
| Order | old order workflow test, B2B core spec, versioned import/export, invoice/payment test |
| Brand confirmation | DOD/MVP contract, order validation state, decision ledger pattern |
| Production handoff | PLM workflow test, tech pack/BOM calculation, operational notes context |
| Manufacturer production | BOM costing, SMV/labor, material requirements, variance report |
| Supplier procurement | RFQ service, supplier offers, contracts, scorecard, certificates |
| Shipment | route ETA/risk idea, compliance/certificate scenario, shipment exception model |
| Closeout | variance report, supplier scorecard, claim/invoice/compliance evidence |
| Chat/calendar | B2B core spec deep links, operational notes, entity message/test patterns |

### 104.5 Immediate archive recovery actions for Cursor

Do these only after P0 foundation and `PLATFORM-SCOPE-MANIFEST.md` exist:

```text
1. Add archive candidates above to PLATFORM-SCOPE-MANIFEST.md as candidate_for_recovery.
2. Add them to PLATFORM-CORE-CLEANUP-REGISTER.md with target cockpit/role/pillar.
3. Create PLATFORM-CORE-ARCHIVE-RECOVERY-SHORTLIST.md from this section.
4. Recover PlatformCoreDataSourceBadge first.
5. Recover import/export versioning and json utility second.
6. Recover B2B/order/chat/calendar link contract third.
7. Recover acceptance scenarios fourth:
   order workflow;
   PLM/BOM/sample/message;
   RFQ/quotes;
   invoice/payment;
   document/certificate/compliance.
8. Recover BOM/RFQ model contracts only after feature folder and state/event backbone exist.
9. Keep consumer/admin/academy/runway/social surfaces archived.
10. Validate no runtime import from legacy-rest.
```

### 104.6 Strongest answer

The archive does contain valuable pieces for Platform Core.

The strongest ones are:

```text
data source badge;
B2B order/chat/calendar linking contract;
MVP/DOD quality gates;
JSON import/export versioning;
DPP/material/certificate evidence model;
BOM costing and raw material requirements;
supplier RFQ/offers/contracts/scorecards/certificates;
order, PLM, RFQ, invoice and compliance acceptance tests;
attribute/fit taxonomy;
shipment ETA/risk and document/compliance concepts.
```

But the archive must stay closed by default.

Recover these only as narrow Platform Core assets.

Do not recover old pages, old navigation or broad archive folders.

## 105. Detailed archive recovery integration plan for the current Platform Core product

This section specifies exactly what to take from archive, what not to take, where it goes, when it starts working and how it connects to the 4 roles x 5 pillars product.

Current product scope:

```text
No marketplace now.
No consumer/private-client flows now.
No academy/social/community/gamification now.
No broad marketing activity layer now.

Current product is:
Brand creates articles and collections.
Shop sees collections and places orders.
Brand reviews/confirms orders and starts production.
Manufacturer develops/validates/produces articles and orders.
Supplier provides materials, accessories, certificates and delivery.
Shipment closes the order.
Chat and calendar control every entity, deadline, question, document and exception.
```

The archive recovery must strengthen only this operating system.

### 105.1 Recovery principles

For every archive item:

```text
Take the useful contract, model, small component, test idea or process.
Do not take old navigation.
Do not take old page structure.
Do not take consumer/admin/academy/runway UI.
Do not take fake AI screens.
Do not take demo claims as production truth.
Do not create duplicate routes.
Do not connect archive as runtime dependency.
```

Recovered logic must land in:

```text
src/features/platform-core/model
src/features/platform-core/events
src/features/platform-core/state
src/features/platform-core/cockpits
src/features/platform-core/ui
src/features/platform-core/adapters
src/features/platform-core/import-export
src/features/platform-core/validation
src/features/platform-core/scenarios
```

Recovered logic must be documented in:

```text
PLATFORM-SCOPE-MANIFEST.md
PLATFORM-CORE-ARCHIVE-RECOVERY-SHORTLIST.md
SOURCE-LINKS.md
CONNECTIONS.md
```

### 105.2 `platform-data-banner.tsx` -> PlatformCoreDataSourceBadge

What to take:

```text
The idea that every data panel must say where data comes from:
API;
local;
demo;
file;
imported;
fallback;
estimated.
```

What not to take:

```text
Do not keep the old client-tool naming.
Do not show "localStorage + catalog" as acceptable production truth.
Do not import the old component.
```

Target files:

```text
src/features/platform-core/model/data-source.ts
src/features/platform-core/ui/PlatformCoreDataSourceBadge.tsx
src/features/platform-core/ui/PlatformCoreDataSourceLegend.tsx
```

Where it appears:

```text
/platform matrix cells;
Brand Article Development Cockpit;
Brand Collection Publishing Cockpit;
Brand Order Cockpit;
Shop Assortment and Order Cockpit;
Shop Buyer Tracking Cockpit;
Manufacturer Production Cockpit;
Supplier Procurement Cockpit;
EntityTrace;
DocumentChecklist;
IntegrationQueue.
```

When it starts working:

```text
P1, immediately after /platform and matrix model exist.
```

Role/pillar impact:

```text
All roles.
All pillars.
```

Connection:

```text
Every action and status uses source label.
Demo/fallback can exist only if badge says so.
Investor and user trust improves immediately.
```

Upgrade target:

```text
Competitor level: source clarity stronger than ordinary demo dashboards.
Above competitor: every cross-role event carries data source/confidence.
```

### 105.3 `B2B_AND_PRODUCTION_CORE_SPEC.md` -> order/chat/calendar link contract

What to take:

```text
The core idea:
chat and calendar are not separate products.
They are an operating layer attached to order, line, article, PO, material, shipment and document.

Also take:
deep-link idea;
order context banner idea;
chat/calendar/order query context;
one operational strip explaining what is controlled where.
```

What not to take:

```text
Do not recover old route names as source of truth.
Do not recreate many related-module panels.
Do not keep broad old "three cores" navigation.
```

Target files:

```text
src/features/platform-core/events/entity-links.ts
src/features/platform-core/events/entity-trace.ts
src/features/platform-core/cockpits/shared/EntityInbox.tsx
src/features/platform-core/cockpits/shared/EntityCalendar.tsx
src/features/platform-core/cockpits/shared/EntityContextBanner.tsx
src/features/platform-core/routes/platform-core-routes.ts
```

Where it appears:

```text
Every order detail;
every PO;
every article readiness panel;
every material request;
every shipment;
every document checklist.
```

When it starts working:

```text
P2 for cockpit UI.
P3 for event/state trace.
```

Role/pillar impact:

```text
Brand comms;
Shop comms;
Manufacturer comms;
Supplier comms;
and every other pillar through entity links.
```

Connection:

```text
Shop order -> Brand order chat/calendar.
Brand confirmation -> Manufacturer PO chat/calendar.
Manufacturer material request -> Supplier RFQ chat/calendar.
Supplier delay -> Manufacturer/Brand exception calendar.
Shipment -> Shop delivery task/calendar.
```

Upgrade target:

```text
Competitor level: B2B order collaboration.
Above competitor: every chat/calendar item becomes a traceable business event.
```

### 105.4 `MVP_CONTRACT.md`, `DOD_CHECKLIST.md`, `RUNBOOK.md` -> Platform Core quality gates

What to take:

```text
Every core change needs:
documented contract;
test or smoke scenario;
demo/fallback behavior that does not crash;
no MVP expansion without decision;
clear run command or validation note.
```

What not to take:

```text
Do not copy old backend/frontend root complexity.
Do not keep broad old API contract as Platform Core truth.
Do not accept demo fallback as production readiness.
```

Target files:

```text
Projects/_platform-core-split/platform-core/PLATFORM-CORE-MVP-CONTRACT.md
Projects/_platform-core-split/platform-core/PLATFORM-CORE-DOD.md
Projects/_platform-core-split/platform-core/PLATFORM-CORE-RUNBOOK.md
src/features/platform-core/validation/*
```

When it starts working:

```text
Before implementation batches.
This is a process gate, not a UI feature.
```

Role/pillar impact:

```text
All roles.
All pillars.
```

Connection:

```text
Every new recovered feature must add or update:
contract;
test;
source link;
validation result;
demo/live rule.
```

Upgrade target:

```text
Competitor level: enterprise delivery discipline.
Above competitor: Cursor-safe action completion rules.
```

### 105.5 `json-io.ts`, `types.ts` -> versioned import/export contracts

What to take:

```text
Small browser JSON read/download utility.
Versioned export contract idea.
Shape examples for partner assortment, DPP, fit feedback and source-tagged payloads.
```

What not to take:

```text
Do not take visual search/capsule/for-you consumer concepts into core.
Do not keep old consumer type names.
Do not allow unvalidated JSON to become trusted data.
```

Target files:

```text
src/features/platform-core/import-export/versioned-json.ts
src/features/platform-core/import-export/platform-core-import-contracts.ts
src/features/platform-core/import-export/platform-core-export-contracts.ts
src/features/platform-core/model/import-confidence.ts
```

Where it appears:

```text
Article import;
collection import;
order import/export;
supplier price sheet import;
material/certificate import;
document metadata import;
manual export to accounting/ERP.
```

When it starts working:

```text
After Platform Core data dictionary and before migration bridge.
```

Role/pillar impact:

```text
Brand development, sample_collection, collection_order.
Shop collection_order.
Manufacturer order_production.
Supplier order_production.
```

Connection:

```text
Excel/CSV/JSON import -> confidence score -> review -> entity creation/update -> event trace.
```

Upgrade target:

```text
Competitor level: import/export like practical ERP tools.
Above competitor: every import carries confidence and role visibility.
```

### 105.6 `dpp-payload.ts`, `dpp-calculator.ts` -> article/material/certificate evidence passport

What to take:

```text
Digital product passport shape:
materials;
certificates;
supply chain steps;
batch labels;
dye batch;
fabric certificate;
estimated sustainability metrics.
```

What not to take:

```text
Do not keep random passport IDs.
Do not keep hardcoded sustainability claims.
Do not show GOTS/Fair Trade/certificates unless backed by actual certificate data.
Do not show eco score as live unless source is real.
```

Target files:

```text
src/features/platform-core/model/article-passport.ts
src/features/platform-core/model/material-certificate.ts
src/features/platform-core/model/supply-chain-evidence.ts
src/features/platform-core/cockpits/shared/ArticleEvidencePassport.tsx
src/features/platform-core/readiness/article-evidence-readiness.ts
```

Where it appears:

```text
Brand Article Development Cockpit;
Manufacturer production context;
Supplier Procurement Cockpit;
Shop buyer-safe product/document view;
shipment document readiness.
```

When it starts working:

```text
After article/BOM/material models exist.
Before advanced compliance/ESG claims.
```

Role/pillar impact:

```text
Brand development;
Brand order_production;
Supplier development/order_production;
Manufacturer order_production;
Shop order_production as buyer-safe evidence.
```

Connection:

```text
Supplier certificate -> article passport -> production readiness -> shipment document readiness -> Shop delivery confidence.
```

Upgrade target:

```text
Competitor level: PXM/DPP/compliance evidence.
Above competitor: passport is connected to supplier/material/order/shipment events, not a static marketing card.
```

### 105.7 `bom_costing_service.py` -> BOM, costing, MRP and variance model

What to take:

```text
BOM item list;
material cost;
raw material requirements by quantity;
SMV/labor cost idea;
finance-to-sourcing link;
planned vs actual variance report.
```

What not to take:

```text
Do not copy Python service into Next feature.
Do not reuse old DB models blindly.
Do not expose internal costing to Shop unless buyer-safe.
Do not make Brand and Manufacturer edit same BOM field without ownership.
```

Target files:

```text
src/features/platform-core/model/bom.ts
src/features/platform-core/model/costing.ts
src/features/platform-core/model/mrp.ts
src/features/platform-core/model/variance.ts
src/features/platform-core/state/bom-state.ts
src/features/platform-core/cockpits/brand/BrandArticleDevelopmentCockpit.tsx
src/features/platform-core/cockpits/manufacturer/ManufacturerProductionCockpit.tsx
```

Where it appears:

```text
Brand creates provisional BOM in development.
Manufacturer validates production BOM and SMV/labor.
Supplier receives material demand/RFQ.
Brand sees margin/variance.
Shop sees only buyer-safe availability/delay, not internal cost.
```

When it starts working:

```text
After article model and before production handoff.
```

Role/pillar impact:

```text
Brand development;
Brand order_production;
Manufacturer development;
Manufacturer order_production;
Supplier order_production.
```

Connection:

```text
Article -> BOM -> order quantity -> raw material requirements -> supplier RFQ -> material readiness -> production stage -> variance/closeout.
```

Upgrade target:

```text
Competitor level: Centric/ERP-grade costing and MRP.
Above competitor: costing directly drives supplier RFQ and production readiness.
```

### 105.8 `sourcing_rfq_service.py` -> supplier RFQ, offers, contracts, scorecards and certificates

What to take:

```text
Supplier list;
material order;
RFQ and RFQ items;
supplier offer;
contract usage;
supplier scorecard;
delay/defect/compliance scoring;
certificates.
```

What not to take:

```text
Do not copy old Python service or DB structure.
Do not create generic supplier marketplace.
Do not show supplier score as live if based on demo/empty data.
Do not let Supplier own buyer order.
```

Target files:

```text
src/features/platform-core/model/rfq.ts
src/features/platform-core/model/supplier-offer.ts
src/features/platform-core/model/supplier-contract.ts
src/features/platform-core/model/supplier-scorecard.ts
src/features/platform-core/model/material-request.ts
src/features/platform-core/cockpits/supplier/SupplierProcurementCockpit.tsx
src/features/platform-core/cockpits/manufacturer/ManufacturerProductionCockpit.tsx
```

Where it appears:

```text
Manufacturer material gate;
Supplier Procurement Cockpit;
Brand supplier/material visibility;
EntityInbox for RFQ clarification;
EntityCalendar for RFQ deadline and delivery date.
```

When it starts working:

```text
After BOM/MRP creates material demand.
```

Role/pillar impact:

```text
Supplier development;
Supplier order_production;
Manufacturer order_production;
Brand order_production.
```

Connection:

```text
BOM shortage -> RFQ -> supplier quote -> reserve -> material order -> dispatch -> certificate -> production readiness.
```

Upgrade target:

```text
Competitor level: procurement/RFQ/vendor scorecard.
Above competitor: RFQ is tied to article, BOM, PO, production stage and chat/calendar.
```

### 105.9 Old tests -> Platform Core acceptance scenarios

What to take:

```text
test_order_workflow:
draft -> validate -> submit -> cannot submit twice.

test_plm_workflow:
supplier/material order;
tech pack details;
BOM calculation;
sample order;
production message.

test_supply_chain_rfq:
RFQ -> two quotes -> quote list.

test_fintech_invoices:
invoice create/get/list.

test_global_trade_p7:
customs/certificate/compliance log concept.
```

What not to take:

```text
Do not copy old endpoints.
Do not keep old auth assumptions.
Do not preserve non-Russian/global compliance as default.
Do not run old backend tests as Platform Core truth.
```

Target files:

```text
src/features/platform-core/scenarios/order-workflow.scenario.ts
src/features/platform-core/scenarios/plm-bom-sample-message.scenario.ts
src/features/platform-core/scenarios/supplier-rfq.scenario.ts
src/features/platform-core/scenarios/invoice-payment.scenario.ts
src/features/platform-core/scenarios/document-certificate-compliance.scenario.ts
e2e/platform-core-golden-path.spec.ts
```

When it starts working:

```text
After state machines and minimal cockpits.
```

Role/pillar impact:

```text
All roles.
All pillars through golden path validation.
```

Connection:

```text
These become tests that prove the chain works rather than old backend behavior.
```

Upgrade target:

```text
Competitor level: serious workflow coverage.
Above competitor: every visible investor/user path is backed by scenario tests.
```

### 105.10 `attribute-manager-dialog.tsx`, `fit-guide-*` -> attribute, fit and size readiness schema

What to take:

```text
Attribute taxonomy idea.
Category-specific fit/size guide logic.
Validation that product data is complete enough for buyer and production.
```

What not to take:

```text
Do not recover admin dialog UI.
Do not create admin section in Platform Core.
Do not bring all fit guides into first render.
Do not expose internal grading controls to Shop.
```

Target files:

```text
src/features/platform-core/model/article-attributes.ts
src/features/platform-core/model/fit-size-readiness.ts
src/features/platform-core/readiness/article-attribute-readiness.ts
src/features/platform-core/readiness/size-grid-readiness.ts
```

Where it appears:

```text
Brand Article Development Cockpit;
Brand Collection Publishing Cockpit;
Shop buyer-safe size/fit confidence;
Manufacturer tech pack/grading context.
```

When it starts working:

```text
Before article becomes publish-ready.
```

Role/pillar impact:

```text
Brand development;
Brand sample_collection;
Shop sample_collection;
Shop collection_order;
Manufacturer development.
```

Connection:

```text
Attributes/fit readiness -> article readiness -> collection publish -> Shop order confidence -> Manufacturer production context.
```

Upgrade target:

```text
Competitor level: PIM/PLM-grade product completeness.
Above competitor: size/fit readiness connects to Shop size curves and production grading.
```

### 105.11 `real-route-ai.tsx`, `global-trade-ai.tsx` -> shipment risk and document/compliance readiness

What to take:

```text
ETA;
delay risk;
route status;
document status;
certificate status;
compliance health;
duty/tax estimate concept;
shipment exception.
```

What not to take:

```text
Do not recover old AI-branded UI.
Do not recover animated global map.
Do not show fake accuracy percentages.
Do not hardcode customs/compliance assumptions.
Do not make global trade a main pillar.
```

Target files:

```text
src/features/platform-core/model/shipment-risk.ts
src/features/platform-core/model/document-compliance.ts
src/features/platform-core/model/ru-marking-readiness.ts
src/features/platform-core/cockpits/shared/ShipmentReadinessPanel.tsx
src/features/platform-core/cockpits/shared/DocumentCompliancePanel.tsx
src/features/platform-core/events/exception-ticket.ts
```

Where it appears:

```text
Brand order_production;
Manufacturer order_production;
Supplier order_production if material shipment;
Shop buyer-safe tracking.
```

When it starts working:

```text
After shipment state and document checklist exist.
```

Role/pillar impact:

```text
Brand order_production;
Shop order_production;
Manufacturer order_production;
Supplier order_production;
comms through exception ticket/calendar.
```

Connection:

```text
Production ready -> shipment readiness -> document/marking check -> ETA/risk -> Shop delivery/acceptance -> closeout.
```

Upgrade target:

```text
Competitor level: logistics/compliance visibility.
Above competitor: shipment risk is connected to production, documents, marking, chat and calendar.
```

### 105.12 Role-by-role integration map

#### Brand

Receives:

```text
DataSourceBadge;
ArticleEvidencePassport;
BOM/costing;
attribute/fit readiness;
collection/order import/export;
order/chat/calendar link contract;
decision ledger;
document/payment/compliance readiness;
supplier scorecard summary;
shipment risk summary.
```

Uses it to:

```text
create articles;
make articles publish-ready;
publish collections;
review/confirm orders;
handoff to production;
monitor production/materials/shipment;
close order with evidence.
```

Does not receive:

```text
old admin UI;
consumer tools;
global distributor UI;
generic AI screens;
academy/social/marketing surfaces.
```

#### Shop

Receives:

```text
buyer-safe product readiness;
collection/assortment import/export where relevant;
order validation and status;
invoice/payment/document state;
shipment ETA/risk;
delivery acknowledgement;
entity chat/calendar.
```

Uses it to:

```text
see collections;
build order;
submit order;
track confirmation/production/shipment;
resolve issues and claims.
```

Does not receive:

```text
internal BOM cost;
supplier negotiation internals;
factory operation details;
Brand internal notes.
```

#### Manufacturer

Receives:

```text
tech pack/BOM;
sample/fit context;
production order;
raw material requirements;
supplier RFQ/reserve visibility;
SMV/labor/operation context;
QC/document/shipment readiness;
PO chat/calendar.
```

Uses it to:

```text
validate producibility;
accept PO;
plan materials;
execute production;
raise exceptions;
complete QC;
prepare shipment.
```

Does not receive:

```text
buyer commercial negotiation unless needed;
Shop private notes;
generic marketplace/distributor screens.
```

#### Supplier

Receives:

```text
material request;
RFQ;
BOM context;
target quantity/unit/spec;
delivery deadline;
certificate requirement;
scorecard inputs;
material chat/calendar.
```

Uses it to:

```text
quote;
reserve;
confirm contract/terms;
dispatch materials;
upload certificates;
report delay;
provide delivery proof.
```

Does not receive:

```text
full buyer order ownership;
Brand private margin;
Shop commercial strategy;
generic supplier marketplace UI.
```

### 105.13 Pillar-by-pillar integration map

| Pillar | Archive recovery to integrate | What it improves |
| --- | --- | --- |
| `development` | attributes, fit guides, DPP/passport, BOM costing | article completeness, producibility, material evidence |
| `sample_collection` | article evidence, fit/size readiness, B2B core spec, import/export | publish readiness, buyer-safe collection view |
| `collection_order` | order workflow tests, import/export, invoice/payment, order link contract | order creation, validation, confirmation, documents |
| `order_production` | BOM/MRP, RFQ, supplier scorecard, shipment risk, compliance/certificates | production control, material readiness, shipment/closeout |
| `comms` | B2B chat/calendar contract, operational notes, decision/DOD gates | entity-linked decisions, tasks, deadlines, evidence |

### 105.14 Avoiding duplicates

Recovered archive ideas must not create:

```text
second order page;
second chat;
second calendar;
second supplier route;
second document center;
second production status;
second product passport;
second import/export system;
second admin editor.
```

Every recovered capability must attach to one owner:

```text
Data source badge -> shared UI.
Chat/calendar link -> EntityInbox/EntityCalendar.
Import/export -> shared import-export layer.
DPP/passport -> ArticleEvidencePassport.
BOM/costing -> BOM/MRP model.
RFQ/supplier -> SupplierProcurementCockpit.
Invoice/payment -> Order document/payment readiness.
Attributes/fit -> Article readiness model.
Shipment risk -> ShipmentReadinessPanel.
Tests -> Platform Core scenarios.
```

### 105.15 Implementation order

Use this order:

```text
1. Register archive candidates in PLATFORM-SCOPE-MANIFEST.md.
2. Build PlatformCoreDataSourceBadge.
3. Add Platform Core quality gates from MVP/DOD/RUNBOOK.
4. Add B2B order/chat/calendar link contract.
5. Add versioned import/export contracts.
6. Add article attributes and fit/size readiness.
7. Add ArticleEvidencePassport from DPP model.
8. Add BOM/costing/MRP model.
9. Add Supplier RFQ/offer/scorecard/certificate model.
10. Add acceptance scenarios from old tests.
11. Add shipment risk/document/compliance panels.
12. Validate that archive is not imported at runtime.
```

### 105.16 Final recovery rule

What we take from archive:

```text
contracts;
schemas;
small utilities;
quality gates;
acceptance scenarios;
model ideas;
source labels;
readiness checks;
workflow links;
evidence patterns.
```

What we do not take:

```text
old pages;
old navigation;
admin UI;
consumer tools;
marketplace/social/activity surfaces;
broad AI UI;
global distributor role;
demo claims;
runtime archive imports.
```

The archive helps Platform Core only when it makes the current operating chain stronger:

```text
article -> collection -> order -> brand -> production -> supplier -> shipment -> closeout
plus entity chat and calendar.
```

## 106. Final gap audit after additional competitor and operations review

This section answers what is still not detailed enough in the document after reviewing additional competitor patterns and the full Platform Core chain again.

The audit is already broad. The remaining gap is not "more big features".

The remaining gap is operational precision:

```text
For every action, role, pillar and tab:
what data is required;
who owns it;
what can block it;
what output is created;
who receives that output next;
what chat/calendar/document/event is created;
what happens if the action fails;
how the user sees progress on iPhone, iPad and MacBook.
```

### 106.1 Additional competitor signals reviewed on 2026-06-22

These references add useful patterns:

```text
WFX:
fashion PLM, virtual showroom, traceability, apparel ERP, textile ERP, MES/smart factory,
real-time data, product development, sourcing, production and factory tools.

BlueCherry:
ERP, warehouse management, EDI, BI, collaborative supply chain, ESG,
PLM, MES, shop floor control, statistical quality control, AI planning,
B2B wholesale, quality audit management, concept/design, sourcing/procurement,
manufacturing/production, quality/compliance, inventory/logistics.

Onfinity:
ERP, DMS, field service, low-code Canvas, inventory with barcode/QR/GS1/serial/batch,
procurement PR-to-PO, RFQ, approval workflow, vendor portal/blacklist,
manufacturing with multi-level BOQ, routing, make-to-order, MRP, QC,
resource time tickets, comprehensive costing, DMS OCR/signature/versioning/audit,
ticketing with SLA and auto-escalation.

Odoo Manufacturing:
MPS, BOM, raw materials, MES, capacity planning, component availability,
cost control, make/buy/subcontract decisions, Gantt, shop floor tablet,
offline work, quality tests, traceability by lots/serials and by-products.

Katana:
real-time inventory, production, purchasing, order management,
batch/serial traceability, outsourced production, supplier costs, tariffs,
warehouse receiving/packing, API/integrations and SMB adoption.

1C:Управление торговлей:
sales, wholesale, stock, warehouse, purchasing, cost, cash, VAT,
documents, planning, marking integration, marketplace integration,
mobile app, flexible options for small businesses.

Диадок/ЭДО:
UPD, invoices, acts, waybills, contracts, logistics documents,
marking codes in documents, transport EDI, statuses and shared document version.

Честный знак:
light industry marking must be treated as current official compliance territory,
not as hardcoded memory.
```

Important conclusion:

```text
Competitors are strong where every workflow has required data, stage gates, documents, traceability,
exceptions and integrations.
Platform Core should not add more navigation. It should add more certainty to every action.
```

### 106.2 What is still under-specified, honestly

The document already mentions these themes, but they need to become concrete Cursor tasks:

| Gap | Why it matters | What to add |
| --- | --- | --- |
| Action success contracts | Buttons and actions can still be vague. | For every primary action define preconditions, required fields, output, event, next owner, failure state. |
| Stage gates | The golden path can be shown, but not enforced. | Article gate, collection gate, order gate, production gate, supplier gate, shipment gate, closeout gate. |
| Master data governance | Duplicates happen when entities are not governed. | Entity owner, version, lock, clone, archive, merge and change request rules. |
| Capacity and MRP | Production is weak without capacity/material planning. | MPS/MRP, work centers, capacity, routing, operation tickets, material shortages. |
| Warehouse/receiving | Shipment is not complete without receiving and stock state. | Pick/pack/ship/receive, batch/serial/marking, discrepancy, delivery acknowledgement. |
| Quality and claims | QC is not enough unless claims close the loop. | Inspection, nonconformance, claim, replacement/credit, supplier/manufacturer responsibility. |
| Document packet templates | Russian operations need scenario-based document packs. | Required docs by order type, shipment type, supplier/material type, marking requirement. |
| EDI/integration failure handling | Integrations fail; users need visible state. | Sync health, field mapping, retry, manual fallback, owner, business impact. |
| Chat/calendar as task engine | Chat/calendar can stay passive. | Convert message/date into task, decision, exception, document request or event. |
| Mobile shop-floor/supplier mode | Factory/supplier updates often happen from phone/tablet. | One-tap stage update, photo proof, document upload, delay reason, offline draft. |
| Configurable workflow | Companies differ; hardcoded process will break. | Typed workflow config, document requirements, SLA, stages, permissions, required fields. |
| Value proof | Investors need proof that this saves time/money. | Role metrics, before/after pilot proof, adoption milestones, manual steps removed. |

### 106.3 The missing action contract template

Every primary user action in Platform Core must be rewritten into this contract:

```text
Action name:
Role:
Pillar:
Entity:
User intent:
Preconditions:
Required fields:
Optional fields:
Blocking conditions:
Allowed states before action:
State after success:
Event created:
Document/chat/calendar side effect:
Next owner:
Next route/cockpit:
Data source:
Confidence:
Failure states:
Recovery action:
Validation:
Mobile behavior:
Desktop behavior:
```

Examples:

```text
Brand publishes collection:
requires article readiness, media, price, size grid, terms, buyer visibility.
creates collection.published event.
Shop sees collection in buyer-safe view.
If price missing, action is blocked.

Shop submits order:
requires collection visibility, quantities, terms acknowledgement, counterparty readiness.
creates shop.order_submitted event and orderId.
Brand receives order.
If reserve unavailable, order becomes needs_review or backorder candidate.

Brand creates production handoff:
requires confirmed order, article package, BOM/material readiness or override reason.
creates production_handoff_created event and poDraft/poId.
Manufacturer receives PO context.

Manufacturer requests material:
requires PO, BOM item, quantity, due date, spec.
creates material_request and supplier RFQ.
Supplier receives RFQ and calendar deadline.

Supplier confirms reserve:
requires RFQ, quantity, price/lead time, certificate status.
updates material readiness.
Manufacturer sees production gate unblock or delay.
```

Target document:

```text
Projects/_platform-core-split/platform-core/PLATFORM-CORE-ACTION-CONTRACTS.md
```

Target code later:

```text
src/features/platform-core/actions/*
```

### 106.4 Missing gate checklists by golden path stage

#### Gate 1 - Article ready for development handoff

Required information:

```text
articleId;
owner Brand;
category;
SKU/variant/color/size grid;
materials;
BOM provisional;
tech pack fields;
fit/size notes;
target cost/wholesale price;
sample requirement;
certificates/material evidence needed;
data source/confidence.
```

Blocked if:

```text
no category;
no size grid for sized product;
no material spec;
no owner;
no next action.
```

#### Gate 2 - Collection ready for buyer visibility

Required information:

```text
collectionId;
season/drop;
published articles;
media/content readiness;
wholesale price;
MOQ;
terms;
delivery window;
buyer visibility;
orderability status;
document/marking warnings.
```

Blocked if:

```text
article not orderable;
price missing;
visibility not set;
delivery window missing;
buyer-facing data incomplete.
```

#### Gate 3 - Order ready for Brand review

Required information:

```text
orderId;
Shop account/counterparty;
lines and quantities;
prices and discounts;
size curve;
terms;
reserve/prebook state;
delivery target;
documents needed;
payment/net terms;
buyer notes/chat thread.
```

Blocked if:

```text
no buyer;
no lines;
invalid quantity;
unavailable stock/prebook without backorder flag;
terms not accepted.
```

#### Gate 4 - Order ready for production handoff

Required information:

```text
confirmed order;
Brand decision;
final quantities;
article package;
BOM;
material requirements;
production deadline;
manufacturer assignment;
document/payment blockers;
override reasons if incomplete.
```

Blocked if:

```text
order not confirmed;
article package incomplete;
no manufacturer;
no production due date;
material gaps not acknowledged.
```

#### Gate 5 - Production ready to start

Required information:

```text
poId;
routing;
work centers;
capacity;
operation plan;
materials reserved or delivery ETA;
QC checklist;
responsible manager;
calendar milestones.
```

Blocked if:

```text
missing materials;
no operation plan;
capacity conflict;
no QC checklist;
no accountable owner.
```

#### Gate 6 - Supplier ready to support production

Required information:

```text
materialRequestId/RFQ;
supplier;
material spec;
quantity;
price;
lead time;
reserve/contract;
certificate;
delivery proof plan;
chat thread;
deadline.
```

Blocked if:

```text
no supplier;
no confirmed quantity;
no lead time;
certificate required but missing;
delivery date conflicts with production.
```

#### Gate 7 - Shipment ready

Required information:

```text
production complete;
QC passed or exception approved;
documents ready;
marking ready where required;
packing list;
delivery route/carrier;
ETA;
Shop notification;
shipment calendar event.
```

Blocked if:

```text
QC failed;
documents missing;
marking unknown when required;
no ETA;
no delivery owner.
```

#### Gate 8 - Closeout ready

Required information:

```text
delivery acknowledged;
quantity accepted;
claims resolved or open;
documents archived/exported;
payment state;
production variance;
supplier score update;
lessons/next cycle.
```

Blocked if:

```text
delivery not acknowledged;
claim unresolved;
documents incomplete;
payment status unknown;
no closeout owner.
```

Target document:

```text
Projects/_platform-core-split/platform-core/PLATFORM-CORE-STAGE-GATES.md
```

### 106.5 Missing information by role and pillar

This table is the field-level correction to the current audit.

| Role | Pillar | Missing detail to add |
| --- | --- | --- |
| Brand | development | exact article required fields, versioning, BOM ownership, sample rounds, tech-pack lock, readiness gate. |
| Brand | sample_collection | publish gate, buyer-specific visibility, content readiness, line sheet/showroom state, terms and delivery window. |
| Brand | collection_order | order review contract, amendment states, reserve/backorder handling, payment/doc readiness, confirmation decision. |
| Brand | order_production | handoff package, PO link, MRP summary, manufacturer assignment, material blockers, shipment/document readiness. |
| Brand | comms | decision templates, order/article/PO thread rules, calendar commitments, escalation owner. |
| Shop | development | buyer-safe article readiness, not editing; request clarification; missing commercial data view. |
| Shop | sample_collection | collection discovery without side quests, assortment board, readiness badges, add-to-order action. |
| Shop | collection_order | size curve, multi-door allocation, budget/terms check, order validation, reserve/backorder visibility. |
| Shop | order_production | buyer-safe status, ETA, shipment, receiving, claims, documents, no internal factory noise. |
| Shop | comms | order inbox, amendment decisions, delivery tasks, document requests, claim thread. |
| Manufacturer | development | producibility review, missing tech-pack fields, sample feedback, capacity preview. |
| Manufacturer | sample_collection | sample task, fit/quality feedback, material feasibility, ready-for-brand-review event. |
| Manufacturer | collection_order | demand/confirmed quantity context only; no buyer negotiation ownership. |
| Manufacturer | order_production | routing, operation tickets, capacity, materials gate, QC, photo proof, shipment readiness. |
| Manufacturer | comms | PO inbox, issue escalation, supplier material thread, Brand decision request. |
| Supplier | development | material/certification readiness, alternatives, lead time, sample material support. |
| Supplier | sample_collection | swatch/sample material request, small batch readiness, certificate status. |
| Supplier | collection_order | demand forecast/reserve context only; no buyer order ownership. |
| Supplier | order_production | RFQ, quote, reserve, contract, dispatch, delivery proof, certificate, delay reason. |
| Supplier | comms | RFQ/material inbox, quote clarification, substitution approval, certificate request, delivery exception. |

### 106.6 Missing tab/section rule

Every cockpit tab must fit one of these allowed tab types:

```text
Overview:
  current state, next action, blockers, owner.

Data:
  fields, source, confidence, completeness.

Actions:
  allowed role actions generated from state machine.

Documents:
  required, missing, issued, signed, exported.

Timeline:
  events, stage changes, decisions, shipment and deadlines.

Chat:
  entity-linked threads only.

Calendar:
  entity-linked tasks/deadlines only.

Exceptions:
  blockers, SLA, escalation, owner.

Audit:
  decision ledger, source changes, integration sync history.
```

Forbidden tabs:

```text
marketing explanation;
generic dashboard;
duplicate registry;
investor summary inside operator flow;
unconnected AI;
unconnected analytics;
generic chat;
generic calendar;
archive/demo page.
```

### 106.7 Missing production depth from competitors

Competitor review shows that production must be deeper than status labels.

Add:

```text
MPS/MRP planning;
make/buy/subcontract decision;
work centers;
capacity planning;
routing;
operation tickets;
time recording;
quality checkpoints;
waste/defect capture;
batch/serial/lot traceability;
barcode/QR/GS1 readiness;
photo proof;
offline/tablet field mode;
variance report.
```

Where:

```text
Manufacturer order_production;
Supplier order_production;
Brand order_production summary;
Shop buyer-safe tracking only.
```

Why:

```text
WFX, BlueCherry, Onfinity, Odoo and Katana all show that serious production systems control materials, operations, quality and traceability.
Platform Core must not stop at "in production" badges.
```

### 106.8 Missing Russian operations depth

Add a specific Russian operating packet per order/PO/shipment:

```text
counterparty;
contract/specification;
invoice;
UPD;
waybill;
act if needed;
invoice-factura if needed;
certificate/declaration;
marking requirement;
DataMatrix/GTIN/label state;
ЭДО status;
1C/МойСклад export status;
payment/bank import status;
document owner;
official source/date for compliance assumptions.
```

Where:

```text
Brand collection_order/order_production;
Shop collection_order/order_production;
Manufacturer order_production;
Supplier order_production.
```

Why:

```text
1C, Диадок and Честный знак patterns show that Russian reality is document, stock, marking and integration-heavy.
This must be operational, not a footer note.
```

### 106.9 Missing exception and SLA operating system

Every stage must have exception types:

```text
missing data;
missing document;
price conflict;
terms conflict;
reserve conflict;
capacity conflict;
material shortage;
supplier late;
QC fail;
marking issue;
shipment delay;
delivery discrepancy;
payment overdue;
integration failed;
permission denied.
```

Each exception must create:

```text
ticketId;
owner;
severity;
SLA;
calendar due date;
chat thread;
allowed resolution;
business impact;
event trace.
```

Why:

```text
Onfinity-style ticketing/SLA and BlueCherry-style quality/compliance become useful only when exceptions have owners and deadlines.
```

### 106.10 Missing UX/detail required for maximum usefulness

For every screen:

```text
top line: entity, state, owner, next action;
second line: source/confidence and blocker;
primary action: one clear next step;
secondary actions: menu;
details: tabs by allowed tab types only;
right/bottom panel: chat/calendar/trace;
empty state: why empty and what to do;
error state: what failed and who owns fix;
loading state: stable skeleton;
mobile: one action per screen;
iPad: master-detail;
MacBook: matrix + cockpit.
```

Do not use:

```text
long descriptions;
decorative cards;
marketing hero;
different UI styles per role;
wide tables on mobile;
buttons without output;
unlabeled demo data.
```

### 106.11 New compact documents Cursor should create

Create these after the P0 foundation and action index:

```text
PLATFORM-CORE-ACTION-CONTRACTS.md
PLATFORM-CORE-STAGE-GATES.md
PLATFORM-CORE-ROLE-PILLAR-FIELD-MATRIX.md
PLATFORM-CORE-TAB-RULES.md
PLATFORM-CORE-PRODUCTION-DEPTH-SPEC.md
PLATFORM-CORE-RU-OPERATING-PACKET.md
PLATFORM-CORE-EXCEPTION-SLA-SPEC.md
PLATFORM-CORE-UX-DETAIL-SPEC.md
```

Each document must be compact and actionable.

Do not duplicate the whole audit.

### 106.12 Updated implementation order

Add these before expanding advanced features:

```text
1. Restore P0 foundation.
2. Create action contracts.
3. Create stage gates.
4. Create role/pillar field matrix.
5. Build matrix-first /platform.
6. Build cockpits.
7. Add state/event backbone.
8. Add production depth: MRP, routing, capacity, QC, traceability.
9. Add Russian operating packet.
10. Add exception/SLA system.
11. Add scenario tests.
12. Add competitor-grade enhancements only where they fit the gates.
```

### 106.13 Final honest answer

What was still not fully accounted for:

```text
The audit had the right strategy.
It did not yet force every action to prove success.
It did not yet give every stage a strict gate.
It did not yet describe production depth at MES/MRP level enough.
It did not yet make Russian document/marking/integration packet mandatory per order/PO/shipment.
It did not yet define enough exception/SLA mechanics.
It did not yet define strict tab rules to prevent new duplicate dashboards.
```

After this section, Cursor has enough to proceed without guessing:

```text
what to build;
what not to build;
what data each action needs;
how roles connect;
how stages close;
how exceptions escalate;
how Russian reality is handled;
how UI stays clean and adaptive;
how competitor-grade depth enters without noise.
```
