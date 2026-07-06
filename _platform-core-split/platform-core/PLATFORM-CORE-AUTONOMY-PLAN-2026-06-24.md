# Platform Core Autonomy Plan — 2026-06-24

> **Обновление 2026-06-26 (Projects):** рабочий код — `lib/platform-core-*` + `components/platform/`, не `features/platform-core/`.  
> Актуальный план фаз: [PLATFORM-CORE-AUTONOMY-ROADMAP.md](./PLATFORM-CORE-AUTONOMY-ROADMAP.md).  
> Индекс доков: [PLATFORM-CORE-DOC-INDEX.md](./PLATFORM-CORE-DOC-INDEX.md).

Этот документ отвечает на вопрос: что сейчас физически лежит в `_ai-share/synth-1-full`, что из этого относится к Platform Core, что не относится, и как безопасно довести Platform Core до автономного проекта без лишней нагрузки на Cursor и без поломки текущего runtime.

## Короткий честный вывод

`_ai-share/synth-1-full` сейчас не является чистым Platform Core. Это общий Next runtime, внутри которого живёт Platform Core и много старых/смежных/архивных зон.

Platform Core уже имеет отдельный вход `/platform`, отдельный feature module, readiness-аудит, action contracts, adapter gateways и правила архива. Широкие старые слои `brand/production`, `components/brand/production`, `lib/production`, `shop/b2b`, `api/workshop2` больше не входят в active source-links и не должны открываться Cursor по умолчанию. Они остаются серой зоной runtime/архива и используются только точечно через `src/features/platform-core/server/ports/*` или carve-out.

Обновление 2026-06-25: прямые source-links на старые server repositories убраны. API routes и gateways Platform Core больше не импортируют `src/lib/server/*` напрямую; единственное разрешенное место такой связи - `src/features/platform-core/server/ports/*`.

Правильная автономизация — не скопировать весь `synth-1-full` в новую папку. Правильная автономизация — вырезать узкий модуль Platform Core: роли, столпы, этапы, действия, контракты, routing, UI-компоненты, server-adapters и acceptance tests. Всё остальное должно остаться в архиве или в legacy runtime и не открываться Cursor по умолчанию.

## Размер runtime сейчас

Снимок по папкам:

| Зона | Размер | Вывод |
| --- | ---: | --- |
| `_ai-share/synth-1-full` | 46M | Общий Next runtime, не чистый Platform Core |
| `src` | 41M | Почти вся нагрузка проекта |
| `src/app` | 10M | Маршруты приложения: core + archive + legacy |
| `src/components` | 14M | Самая тяжёлая UI-зона |
| `src/lib` | 15M | Контракты, данные, production/domain helpers |
| `public` | 772K | Небольшая зона assets |
| `e2e` | 160K | Нужные acceptance-сценарии, но их надо сузить под Platform Core |

Крупные runtime-зоны:

| Зона | Размер | Статус для Platform Core |
| --- | ---: | --- |
| `src/app/brand` | 4.4M | Смешанная: часть core, часть legacy |
| `src/app/api` | 1.5M | Смешанная: active scope теперь только `src/app/api/platform-core` |
| `src/app/shop` | 1.1M | Смешанная: нужен B2B buyer flow, не весь shop |
| `src/app/client` | 572K | Архив, не Platform Core |
| `src/app/admin` | 460K | Архив |
| `src/app/factory` | 396K | Серая зона UI: не открывать целиком, Platform Core читает данные через gateways |
| `src/app/academy` | 196K | Архив |
| `src/components/brand` | 6.8M | Смешанная, главный источник тяжести |
| `src/components/home` | 1.1M | Архив/marketing |
| `src/components/b2b` | 828K | Серая зона UI: не source of truth |
| `src/lib/production` | 6.5M по `du`, около 4.8M исходников | Серый слой: только sourceRefs/server ports, не active imports |
| `src/lib/b2b` | 476K | Серый слой: не active source-link |
| `src/lib/order` | 244K | Серый слой: не active source-link |
| `src/features/platform-core` | около 8K строк | Active Platform Core module |

## Что точно относится к Platform Core

Это нужно оставить, развивать и постепенно собрать в автономный модуль:

| Зона | Что содержит |
| --- | --- |
| `src/app/platform/page.tsx` | Главный живой маршрут `/platform` |
| `src/app/api/platform-core/*` | Узкие Platform Core API routes по adapter/domain контурам |
| `src/features/platform-core/domain/*` | 4 роли, 5 столпов, demo/context, visibility policy |
| `src/features/platform-core/routing/*` | Узкий Platform Core routing, без `src/lib/routes.ts` |
| `src/features/platform-core/workflow/*` | Stage gates и action contracts |
| `src/features/platform-core/readiness/*` | Детальный audit по ролям и столпам |
| `src/features/platform-core/adapters/*` | 10 adapter-контуров, pure implementations и gateways |
| `src/features/platform-core/server/*` | Узкие server read layers |
| `src/features/platform-core/server/ports/*` | Единственная граница к существующим runtime repositories/auth/context до отдельного `platform-core-app` |

Старые `src/lib/platform-core-*` теперь только compatibility wrappers и не являются местом разработки.

## Что не относится к Platform Core

Это не должно открываться по умолчанию и не должно быть runtime-зависимостью `/platform`:

```text
admin
academy
client tools
wardrobe
runway
home / marketing pages
broad AI
social/community
consumer catalog/PDP features
global distributor UI
generic project-info pages
old public landing/demo pages
```

Из этих зон можно брать только маленькие идеи, если они усиливают текущую цепочку:

```text
артикул -> коллекция -> заказ -> производство -> поставщик -> отгрузка -> закрытие
чат + календарь + документы + события + исключения
```

Забирать код напрямую нельзя. Сначала идея описывается как action contract, затем реализуется внутри Platform Core.

## Смешанные зоны, которые нельзя переносить целиком

Эти папки опасно считать “чистым ядром”:

| Зона | Почему опасно переносить целиком | Что делать |
| --- | --- | --- |
| `src/app/brand/production` | 211 файлов, около 718K исходников; есть полезный workshop, но много старых экранов | Выделить только role cockpit и статьи/ТЗ/производственную передачу |
| `src/components/brand/production` | 461 файл, около 3.8M исходников; много монстров 1000-2900 строк | Дробить на Platform Core UI-блоки по stage/action |
| `src/lib/production` | 839 файлов, около 4.8M исходников; много общих production helpers | Вынести только BOM, routing, capacity, QC, DPP, supplier, shipment contracts |
| `src/app/shop/b2b` | 86 файлов, около 669K исходников; B2B + marketplace/showroom идеи смешаны | Оставить buyer order flow, terms, matrix, tracking, documents |
| `src/app/api/workshop2` | 117 файлов, около 331K исходников | Оставить только article/dossier/order-production endpoints |
| `src/components/b2b` | 62 файла, около 708K исходников | Оставить order writing, matrix, terms, handoff, documents |

Ключевое правило: переносить не папку, а функцию цепочки. Например, не “перенести `lib/production`”, а “вынести BOM costing adapter для stage `development -> sample_collection -> order_production`”.

## Главные тяжёлые файлы, которые надо дробить

Эти файлы замедляют понимание проекта и требуют отдельного разрезания:

| Файл | Строк | Что сделать |
| --- | ---: | --- |
| `src/lib/production/workshop2-live-integration-probes.ts` | 3118 | Разделить на probes по этапам: article, sample, order, production, supplier, shipment |
| `src/components/brand/production/Workshop2Phase1DossierPanel.tsx` | 2929 | Разделить на паспорт, материалы/BOM, конструкцию, размеры, документы, gate summary |
| `src/components/brand/production/Workshop2ArticleWorkspace.tsx` | 2597 | Выделить shell + tabs + action panels |
| `src/app/brand/production/tech-pack/[id]/page.tsx` | 2071 | Сделать тонкий route wrapper + feature component |
| `src/components/brand/production/Workshop2TabContent.tsx` | 1892 | Разнести по вкладкам и разрешённым tab types |
| `src/components/brand/production/CategorySketchAnnotator.tsx` | 1786 | Разделить editor, pins, image tools, save adapter |
| `src/lib/production/workshop2-dossier-phase1.types.ts` | 1508 | Разделить типы по доменам: passport, BOM, construction, fit, documents |
| `src/components/brand/production/Workshop2MaterialHubPanel.tsx` | 1008 | Вынести supplier/material/BOM/RFQ panels |

Цель: ни один активный Platform Core файл не должен превращаться в монолит. Ориентир — до 300-500 строк для UI component, до 200-350 строк для domain helper, если нет сильной причины иначе.

## Что уже улучшено для автономности

1. Добавлен узкий routing:
   `src/features/platform-core/routing/platform-core-routes.ts`.

2. Активные Platform Core файлы больше не импортируют широкий:
   `@/lib/routes`.

3. Активные Platform Core audit-файлы больше не импортируют:
   `@/lib/production/workshop2-url`.

4. `source-links/routes.ts` удалён из рабочей карты Platform Core.

5. `live-source/src/lib/routes.ts` удалён как лишняя локальная копия.

6. Boundary check усилен: если активный Platform Core снова импортирует `@/lib/routes` или `@/lib/production/workshop2-url`, проверка должна упасть.

7. Domain ролей/столпов перенесён в:
   `src/features/platform-core/domain/roles-pillars.ts`.

8. Role/pillar href helpers перенесены в:
   `src/features/platform-core/routing/role-pillar-hrefs.ts`.

9. Workflow/action contracts перенесены в:
   `src/features/platform-core/workflow/action-contracts.ts`.

10. Readiness contract и section audit перенесены в:
    `src/features/platform-core/readiness/`.

11. Старые `src/lib/platform-core-*` превращены в compatibility wrappers.

12. `/platform/page.tsx` теперь импортирует Platform Core ядро из `src/features/platform-core/*`, а не из старых `src/lib/platform-core-*`.

13. Создан adapter registry:
    `src/features/platform-core/adapters/`.

14. Stage gates и action contracts получили `adapterIds`, связывающие действия с BOM, costing, RFQ, QC, capacity, DPP, shipment, chat, calendar, documents и exceptions.

15. `/platform/page.tsx` показывает компактный блок связанных контуров для выбранной ячейки.

16. Созданы pure implementations для всех 10 adapter-контуров:
    BOM/costing, RFQ, capacity, QC, DPP, shipment, entity chat, calendar, documents, exceptions.

17. Adapter registry теперь указывает конкретную `implementation` для каждого контура. Runtime status повышается до `core_ready` только после узкого gateway/API; чистая Platform Core логика уже вынесена, но каждый контур подключается к реальным repository/API/DB без прямого импорта legacy-папок.

18. BOM/costing получил первый узкий backend/DB слой:
    `src/features/platform-core/adapters/gateways/bom-costing.ts`,
    `src/features/platform-core/server/bom-costing-dossier-gateway.ts`,
    `src/app/api/platform-core/articles/[collectionId]/[articleId]/bom-costing/route.ts`.
    UI и adapter registry не импортируют старые Workshop2 production-типы; server gateway читает досье и нормализует его в Platform Core snapshot. Это закрывает read path; write-back/sync costing snapshot в досье можно делать следующим отдельным шагом.

19. RFQ получил такой же узкий read layer:
    `src/features/platform-core/adapters/gateways/rfq.ts`,
    `src/features/platform-core/server/rfq-dossier-gateway.ts`,
    `src/app/api/platform-core/articles/[collectionId]/[articleId]/rfq/route.ts`.
    Gateway берёт material requisitions как первичный RFQ source, fallback на BOM material/trim строки досье, а vendor bids использует только как временный offer source с warning, чтобы не смешать material RFQ и CMT bid без пометки.

20. QC/AQL получил узкий read layer для shipment gate:
    `src/features/platform-core/adapters/gateways/qc.ts`,
    `src/features/platform-core/server/qc-dossier-gateway.ts`,
    `src/app/api/platform-core/articles/[collectionId]/[articleId]/qc/route.ts`.
    Gateway сводит `workshop2_qc_defects`, sample-order, `qcPanelMirror`, `qcAqlMirror`, `qcAqlInspectionLog` и `inspectorReportMirror` в один Platform Core QC snapshot. Старые QC panels остаются только источниками записи; Platform Core не импортирует их UI/production-логику напрямую и использует QC gateway как единый источник для `shipment_ready` и `closeout_ready`.

21. Shipment/ASN получил узкий read layer по B2B order:
    `src/features/platform-core/adapters/gateways/shipment.ts`,
    `src/features/platform-core/server/shipment-dossier-gateway.ts`,
    `src/app/api/platform-core/orders/[orderId]/shipment/route.ts`.
    Gateway не дублирует QC, DPP или documents: он использует QC gateway, `document-packet` implementation и `dpp-passport` implementation как supporting adapters, затем собирает единый shipment gate. Старый B2B tracking helper с demo DHL/date не используется как runtime truth; из него оставлена только идея этапов через `sourceRefs`.

22. Documents и DPP вынесены из shipment в собственные gateways:
    `src/features/platform-core/adapters/gateways/document-packet.ts`,
    `src/features/platform-core/server/document-packet-dossier-gateway.ts`,
    `src/app/api/platform-core/articles/[collectionId]/[articleId]/documents/route.ts`,
    `src/features/platform-core/adapters/gateways/dpp-passport.ts`,
    `src/features/platform-core/server/dpp-passport-dossier-gateway.ts`,
    `src/app/api/platform-core/articles/[collectionId]/[articleId]/dpp/route.ts`.
    Это убрало дубль правил из shipment: shipment теперь получает готовые `documentPacket` и `dpp` gateway results и не распознаёт vault/DPP поля самостоятельно.

23. Capacity получил узкий read layer для `production_start_ready`:
    `src/features/platform-core/adapters/gateways/capacity.ts`,
    `src/features/platform-core/server/capacity-dossier-gateway.ts`,
    `src/app/api/platform-core/orders/[orderId]/capacity/route.ts`.
    Старый `src/lib/fashion/factory-capacity.ts` не используется как runtime truth, потому что он генерирует мощность от SKU-seed. Platform Core берёт B2B order quantity, routing/operations minutes, factory/capacity mirror и start date; если реальной доступной мощности нет, gateway возвращает честный blocker, а не демо-слот.

24. Entity chat и calendar deadlines получили единый comms read layer:
    `src/features/platform-core/adapters/gateways/entity-comms.ts`,
    `src/features/platform-core/server/entity-comms-gateway.ts`,
    `src/app/api/platform-core/articles/[collectionId]/[articleId]/comms/route.ts`,
    `src/app/api/platform-core/orders/[orderId]/comms/route.ts`.
    Platform Core читает contextual messages и brand calendar events как entity-linked thread/deadline snapshots. Старые `/brand/messages`, `/factory/calendar` и calendar UI остаются source writers/views, но не становятся частью `/platform` runtime truth и не тянут свои UI-папки в ядро.

25. Exception/SLA получил derived read layer:
    `src/features/platform-core/adapters/gateways/exception-sla.ts`,
    `src/features/platform-core/server/exception-sla-gateway.ts`,
    `src/app/api/platform-core/orders/[orderId]/exceptions/route.ts`.
    Exception не заводит отдельный дубль проблемы: он собирает blockers из Capacity, Shipment и Comms/Calendar gateways, назначает owner/recovery action и связывает SLA с thread/calendar, если они есть.

Это не делает весь проект полностью автономным за один шаг, но убирает ключевые лишние зависимости активного `/platform`, задаёт правильную физическую структуру ядра и фиксирует, какие legacy-источники можно вырезать дальше без переноса целых папок.

## Целевая структура автономного Platform Core

Цель для runtime:

```text
src/features/platform-core/
  domain/
    roles.ts
    pillars.ts
    entities.ts
    golden-path.ts
    permissions.ts
  workflow/
    action-contracts.ts
    stage-gates.ts
    events.ts
    exceptions.ts
  routing/
    platform-core-routes.ts
    role-pillar-hrefs.ts
  readiness/
    readiness-audit.ts
    sections/
  ui/
    shell/
    role-cockpit/
    pillar-tabs/
    action-panels/
    empty-states/
  adapters/
    b2b-orders/
    workshop/
    supplier/
    calendar/
    chat/
    documents/
  server/
    repositories/
    route-handlers/
  tests/
    acceptance-scenarios/
```

Правило импорта:

```text
src/app/platform/page.tsx
  -> imports only from src/features/platform-core and shared UI primitives

src/features/platform-core/*
  -> must not import archive
  -> must not import broad routes.ts
  -> must not import whole lib/production
  -> must not import whole components/brand/production
```

Старые `src/lib/platform-core-*` можно оставить как compatibility wrappers на время миграции, но рабочая логика должна постепенно переехать в `src/features/platform-core`.

## Порядок автономизации

### P0 — удержать границу

Сделать и поддерживать:

```text
_platform-core-split/legacy-rest не имеет symlink-ов
archive не открывается Cursor по умолчанию
.cursorignore закрывает archive и non-core зоны
validate-platform-core-boundary.mjs проходит
```

Нельзя:

```text
добавлять runtime import из archive;
добавлять прямой import из /platform в admin/client/academy/home/runway;
возвращать @/lib/routes в активные Platform Core файлы;
возвращать @/lib/production/workshop2-url в readiness/audit ядро.
```

### P1 — завершить routing carve-out

Уже начато: создан `src/features/platform-core/routing/platform-core-routes.ts`.

Статус 2026-06-24: базовый routing/domain/workflow/readiness carve-out выполнен. Дальше:

1. Не возвращать `@/lib/platform-core-*` в `/platform/page.tsx`.
2. Не возвращать `@/lib/routes` или широкий `@/lib/production` в active core.
3. При добавлении новых role/pillar hrefs делать это в `features/platform-core/routing/*`.

### P2 — вынести domain и workflow

Статус 2026-06-24: выполнено для:

```text
CORE_CHAIN_ROLES
CORE_HUB_PILLARS
CoreChainRoleId
CoreHubPillarId
PlatformCoreDemoContext
workflow stages
action contracts
readiness score model
```

Старые файлы в `src/lib` теперь только re-export wrappers, чтобы не сломать внешние импорты.

### P3 — заменить demo context на selected entity context

Текущие demo identifiers:

```text
SS27
demo-ss27-01
B2B-DEMO-SHOP1-SS27
factory-main
```

Нужно заменить на runtime context:

```text
collectionId
articleId
orderId
factoryId
supplierId
shipmentId
calendarEventId
chatThreadId
documentId
```

Правило: demo может оставаться только как seed/fallback для разработки. В рабочем Platform Core каждое действие должно работать от выбранной сущности.

### P4 — собрать role cockpits вместо старых больших экранов

Не переносить целиком `brand/production` или `shop/b2b`. Создать тонкие role cockpits:

| Роль | Что должно быть в cockpit |
| --- | --- |
| Brand | артикулы, коллекции, заказы, производство, документы, чат, календарь, исключения |
| Shop | витрина коллекции, матрица заказа, условия, заказ, tracking, приёмка, документы, чат, календарь |
| Manufacturer | ТЗ, BOM, capacity, операции, QC, shipment readiness, чат, календарь |
| Supplier | материалы, фурнитура, RFQ/offers, сертификаты, резерв, поставка, чат, календарь |

Каждый cockpit должен быть не “дашбордом”, а рабочим набором действий по этапу.

### P5 — вырезать production adapters

Из `src/lib/production` забрать только то, что нужно цепочке:

```text
BOM
costing
material requirements
supplier offers
capacity/load
routing/operations
QC gates
DPP/passport
documents
shipment/ASN
exceptions/SLA
```

Каждый adapter должен иметь понятный вход/выход:

```text
input entity ids
required fields
side effects
event emitted
next owner
error/recovery state
```

Статус 2026-06-24: adapter registry и первый набор pure implementations созданы. Все 10 adapter-контуров подключены к реальным данным или derived Platform Core state через узкий gateway/API. Дальше нужны acceptance tests, write-back contracts там, где действие реально меняет состояние, и только потом физический `platform-core-app`.

### P6 — очистить UI от шума

Для Platform Core:

```text
нет длинных описаний;
нет декоративных блоков без действия;
нет разных визуальных стилей между ролями;
нет дублей табов;
нет кнопок без результата;
нет карточек внутри карточек;
нет hero/marketing языка;
нет старого AI UI без действия в golden path.
```

Оформление должно быть спокойным: JOOR/NuOrder по заказам и презентации коллекций, но адаптировано под российский B2B, производство, поставщиков, документы и ЭДО.

### P7 — физическая автономная папка

Когда P1-P6 завершены, можно создавать отдельную runtime-папку:

```text
_platform-core-split/platform-core-app/
  package.json
  next.config.ts
  tsconfig.json
  src/app/platform
  src/features/platform-core
  src/components/ui
  src/lib/shared-minimal
```

Переносить туда только:

```text
Platform Core route
Platform Core feature module
минимальные shared UI primitives
минимальные server adapters
минимальные acceptance tests
```

Не переносить:

```text
client
admin
academy
home
runway
global distributor UI
broad AI
marketing pages
old demo dashboards
```

### P8 — выключить legacy из default workflow

После появления автономного app:

```text
Cursor открывает platform-core-app;
legacy-rest остаётся offline archive;
synth-1-full остаётся только historical runtime;
архив анализируется только по точному запросу;
boundary check запрещает archive imports;
acceptance tests запускаются только по Platform Core golden path.
```

## Что должен сделать Cursor следующим шагом

Самый безопасный следующий технический пакет:

1. Начать дробить `components/brand/production` только через конкретные Platform Core action panels.
2. Добавить tests/acceptance scenarios вокруг golden path.
3. Зафиксировать write-back contracts для действий, которые меняют состояние.
4. Только после стабилизации adapters создавать отдельный `platform-core-app`.

## Критерий автономности

Platform Core считается автономным, когда выполняются все условия:

```text
/platform работает без чтения archive;
/platform не импортирует broad routes.ts;
/platform не импортирует broad lib/production;
/platform не импортирует non-core app/components;
все роли/столпы/этапы имеют action contracts;
чат и календарь связаны с entity ids, а не demo строками;
каждый переход ведёт к рабочему действию;
каждый action имеет success/error/empty/recovery state;
Cursor может открыть только platform-core docs + feature module и понять проект без synth-1-full целиком.
```

До этого момента честная формулировка такая: Platform Core уже выделен логически и частично технически, но ещё не полностью физически автономен.
