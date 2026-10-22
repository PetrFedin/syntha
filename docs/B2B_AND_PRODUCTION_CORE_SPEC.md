# B2B и производство — ядро продукта (канон)

Документ фиксирует **источник правды по смыслу** для команды: что уже заложено в коде/UI в **`_ai-share/synth-1-full`** и что считается следующим слоем (данные/API). Дублируйте или линкуйте из корневого `Projects/docs/` при необходимости монорепо.

## Три приоритетных направления

1. **ТЗ изделия → задание на отшив** — кабинет бренда, цех, Workshop 2, tech-pack по `styleId` строки заказа.
2. **B2B-заказ «как JOOR / NuOrder и лучше** — реестр, матрица, подборки, working order, RF-документы и условия.
3. **Чаты и календарь — надстройка**, не фундамент: сроки и переговоры в связке с заказом, а не отдельные приложения.

Горизонталь (роли/площадки) и вертикаль (ТЗ → цех → заказ) отражены в UI через **`B2bPriorityWorkflowPanel`** и группы в `src/lib/data/b2b-priority-workflow-groups.ts`.

**Полная матрица трёх ядер** (вертикаль + горизонталь + надстройка + рабочие опции): **`getSynthaThreeCoresFullMatrixGroups()`** — одна панель на **`/brand/b2b-orders`** и **`/shop/b2b/orders`**: цех/Workshop/LIVE Production, реестры и матрица/подборки/Working Order, чаты и календари задач, роли factory и контроль-центр.

**Мост с ядра №1 (Workshop 2):** **`getSynthaProductionHubBridgeGroups()`** — панель на **`/brand/production/workshop2`**: цех, B2B-реестры бренда/ритейла, LIVE, команда/чат/календарь (подзаголовок фиксирует, что переговоры не заменяют ТЗ).

**Экран создания заказа (байер):** в **`B2bOrderFormationSynthaEdgeCard`** — футер с **`getSynthaThreeCoresQuickLinksForBuyer()`** (цех, реестр, сообщения, задачи).

**Коммуникации:** в **`CommunicationsOperationalStrip`** — пояснение, что чат/календарь — надстройка; истина по объёмам — в B2B и производстве.

**Единый импорт:** `src/lib/syntha-priority-cores.ts` — реэкспорт групп **`getSynthaThreeCoresFullMatrixGroups`**, **`getSynthaProductionHubBridgeGroups`**, быстрых ссылок **`getSynthaThreeCoresQuickLinksForBuyer` / `ForBrand`**, **`getB2bOrderVerticalCoreLinks`**, хелперов **`routes.ts`** для контекста заказа, UI: **`B2bPriorityWorkflowPanel`**, **`B2bOrderUrlContextBanner`**, **`B2bOrderCommsContextButtons`**. На **операциях цеха**, **сообщениях (brand/shop)**, **создании заказа**, **`/brand/control-center`** панель использует **полную матрицу**; **RelatedModules** на create-order, brand messages и **`/shop/b2b/catalog`** объединяют хаб и быстрые ядра. **`/shop/b2b/workspace-map`:** верхняя полоса с **`getSynthaThreeCoresQuickLinksForBuyer`**, пояснением про надстройку и **`B2bOrderUrlContextBanner`**.

---

## UI синхронизации операционных заметок (v1)

- **Компонент:** `src/components/b2b/OperationalOrderNotesV1Sync.tsx` (client).
- **API:** `GET /api/b2b/v1/operational-orders/:orderId` с заголовком **`x-syntha-api-actor-role`:** `brand` | `shop` (tenant-фильтр read-model, см. e2e `e2e/helpers/b2b-v1-api-headers.ts`).
- **PATCH:** `patchOperationalOrderNoteV1` (`src/lib/order/v1/patch-operational-order-note-v1.ts`) — обязателен **`actorRole`** (тот же смысл, что у GET), заголовок **`Idempotency-Key`**, ответ — **`parseOperationalOrderV1PatchResponse`** (`operational-order-dto.schema.ts`).
- **Поведение:** shop — только операционная заметка; brand — операционная + внутренняя заметка бренда (отдельные PATCH с разными ключами идемпотентности).
- **Демо-персист:** `data/b2b-operational-notes.json` (отражено в подписи UI).

---

## Legacy Working Order versions API — безопасность и ограничение среды

- `GET|PUT /api/b2b/v1/working-order-versions` — **устаревшая демо-модель** с общим JSON-файлом (`data/b2b-working-order-versions.json`) и полным замещением списка версий через PUT. У этого контракта нет проверяемой изоляции организаций.
- В `NODE_ENV=production` обе операции должны возвращать **HTTP 403** c `error.code=LEGACY_DEMO_STORE_DISABLED`. Клиентские заголовки роли не являются подтверждением полномочий.
- В development/test старый сценарий остаётся доступным только для совместимости демонстрации. Его **нельзя** использовать как источник юридически значимых заказов, подтверждений, контрактов или производственных обязательств.
- Каноническое целевое API для production: идентифицированный участник сессии → авторизация в организации и заказе → адресная запись версии в PostgreSQL → optimistic concurrency / immutable snapshots / idempotency → журнал событий и аудит. Без такой миграции нельзя открывать полный список версий разных партнёров или заменять его одним запросом.
- Контрольный тест: `src/lib/b2b/__tests__/legacy-working-order-versions-policy.test.ts`. Доступность dev-ветки не является результатом production-приёмки.

---

## Связка чат ↔ календарь ↔ заказ ↔ селекции

- **Намерение продукта:** планирование, вопросы, материалы и оформление заказа ведутся в **платформенном** чате и календаре; контекст заказа, коллекций и матрицы — через навигацию.
- **Группы процесса:** `getBrandB2bCollaborationProcessGroups()` / `getShopB2bCollaborationProcessGroups()` — сообщения, календарь (`?layers=tasks|events` где уместно), реестр B2B, матрица, подборки, whiteboard, working order, аналитика заказов, академия.
- **Где в UI:** вторая панель на карточках заказа бренда и shop; `/shop/b2b/create-order`; `/brand/messages`, `/shop/messages`.
- **Критично на следующем этапе (данные):** привязка тредов чата к `orderId` / `lineId`, события календаря из этапов заказа — отдельный контракт и бэкенд; этот спек фиксирует **продуктовую модель** и **точки входа в UI**.

### Deep-link с карточки заказа

- Хелперы в `src/lib/routes.ts`: **`brandMessagesB2bOrderContextHref`**, **`shopMessagesB2bOrderContextHref`**, **`brandCalendarB2bOrderContextHref`**, **`shopCalendarB2bOrderContextHref`** — передают `order`, `orderId`, `q` (и для календаря `layers=tasks`, `order`).
- **Матрица и селекции в том же контуре:** **`brandProductsMatrixB2bOrderContextHref`**, **`shopB2bMatrixOrderContextHref`**, **`shopB2bSelectionBuilderOrderContextHref`**, **`shopB2bWhiteboardOrderContextHref`** — query `order` + `orderId` (под будущую фильтрацию и согласованность с сообщениями).
- Кнопки **«Чат»** / **«Задачи»** и строка **Матрица · Подборки · Доска** (shop) / **Матрица** (brand): **`B2bOrderCommsContextButtons`** (`src/components/b2b/B2bOrderCommsContextButtons.tsx`, `showWorkspaceDeepLinks`).
- **`MessagesPage`** учитывает **`orderId`** в query при предзаполнении поиска чатов (вместе с `order`, `sku`, `stagesStep`).
- **Баннер контекста на рабочих экранах:** `B2bOrderUrlContextBanner` — при `?order=` / `?orderId=` показывает id заказа и ссылки «Карточка · Чат · Задачи» на `/shop/b2b/selection-builder`, `/shop/b2b/whiteboard`, `/brand/products/matrix`, **`/brand/production/operations`**, **`/brand/calendar`**, **`/shop/calendar`**, **`/shop/b2b/catalog`**, **`/brand/messages`**, **`/shop/messages`**, **`/shop/b2b/create-order`** (единый query-контур).
- **`/shop/b2b/create-order`:** при контексте заказа в URL кнопки «Матрица» и «Working Order» ведут на `shopB2bMatrixOrderContextHref` / `shopB2bWorkingOrderOrderContextHref`; быстрые ссылки бренд+сезон в матрицу пробрасывают `order`/`orderId`.
- **`B2bOrderUrlContextBanner`:** id заказа берётся также из **`wholesaleOrderId`** (NuOrder Working Order). Вторая строка — **Матрица · Подборки · Доска** (shop) или **Матрица SKU · Операции цеха** (brand); хелпер **`brandProductionOperationsB2bOrderContextHref`**.
- **`/shop/b2b/working-order`:** сверху тот же баннер — связка Excel-версий с карточкой заказа и селекциями.
- **Календарь (brand):** `contextSearchSeed` учитывает и **`orderId`** (как `order`), чтобы поиск слотов совпадал с deep-link с карточки заказа.
- **Вертикальное ядро ТЗ→цех:** `getB2bOrderVerticalCoreLinks` включает ссылку **«Реестр B2B-заказов»** как мост к оптовому контуру.

### Производство ↔ процесс заказа

- На **`/brand/production/operations`** добавлена панель **`getBrandB2bCollaborationProcessGroups()`** — явная связь цеха с B2B, чатом и материалами.

---

## Российская юрисдикция

Секция **«Россия: юрисдикция»** в панели приоритетов: Net terms / НДС (`/brand/finance/rf-terms`), комплаенс и ЭДО РФ (`/brand/ops/local-compliance`), общий compliance, склад КИЗ/маркировка, документы, калькулятор пошлин/НДС. Для shop — документы B2B, контракты, отчёты, аналитика закупок.

---

## Преимущества платформы (сверх JOOR / NuOrder)

Секции **«Единая ОС»** / **«Преимущества контура»:** контроль-центр, интеграции, B2B Passport, согласование заказа, качество каталога, синдикация; единый контур **заказ ↔ ТЗ ↔ цех ↔ заметки v1** и связка с RF-документами.

Карточка **`B2bOrderFormationSynthaEdgeCard`** на `/shop/b2b/create-order` раскладывает базовый wholesale, РФ и отличия Syntha для байера.

---

## Ключевые файлы

| Область | Путь (от `synth-1-full/`) |
|--------|---------------------------|
| Группы направлений и процесса | `src/lib/data/b2b-priority-workflow-groups.ts`; единый реэкспорт — `src/lib/syntha-priority-cores.ts` |
| Панель UI | `src/components/b2b/B2bPriorityWorkflowPanel.tsx` |
| Заметки v1 | `src/components/b2b/OperationalOrderNotesV1Sync.tsx`, `src/lib/order/v1/patch-operational-order-note-v1.ts`, `src/lib/order/operational-order-dto.schema.ts` |
| Заголовки актёра v1 | `src/lib/auth/b2b-v1-api-client-headers.ts` |
| Хаб сообщений (ссылки) | `getCommLinks()`, `getSynthaThreeCoresQuickLinksForBuyer()` в `src/lib/data/entity-links.ts` |
| Полоса у чата/календаря | `src/components/brand/communications/CommunicationsOperationalStrip.tsx` |
| Чат/календарь с контекстом заказа | `B2bOrderCommsContextButtons.tsx`, хелперы в `routes.ts` |
| Баннер заказа на матрице/подборках/доске | `B2bOrderUrlContextBanner.tsx` |
| Карточка «JOOR+» при создании заказа | `src/components/b2b/B2bOrderFormationSynthaEdgeCard.tsx` |

---

## Сопровождение

При смене маршрутов или контрактов v1 обновляйте этот файл и **`_ai-share/synth-1-full/AGENTS.md`** (раздел B2B v1).
