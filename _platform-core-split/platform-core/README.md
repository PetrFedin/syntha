# Platform Core

Эта папка собирает текущий Platform Core в одном месте.

Текущая рабочая модель:

- 4 роли: `brand`, `shop`, `manufacturer`, `supplier`
- 5 столпов: `development`, `sample_collection`, `collection_order`, `order_production`, `comms`
- 20 ячеек роли × столпы
- 15 активных ячеек
- 5 read-only insight ячеек

## Главные исходники

- `source-links/app-platform` — живой Next route `/platform`.
- `source-links/domain-roles-pillars.ts` — роли, столпы и Platform Core context.
- `source-links/platform-core-routes.ts` — узкий routing Platform Core, чтобы активное ядро не тянуло общий `routes.ts`.
- `source-links/routing-role-pillar-hrefs.ts` — helper-ссылки role × pillar и demo/entity контекста.
- `source-links/workflow-action-contracts.ts` — stage gates и action contracts для `/platform`.
- `source-links/readiness-audit.ts` — контракт readiness-разделов.
- `source-links/readiness-sections` — детальный audit по ролям и столпам.
- `source-links/adapters` — Platform Core adapter registry + pure implementations: BOM, costing, RFQ, QC, capacity, DPP, shipment, chat, calendar, documents, exceptions.
- `source-links/api-platform-core-bom-costing-route.ts` — Platform Core API для чтения BOM/costing из реального досье через узкий gateway.
- `source-links/api-platform-core-article-comms-route.ts` — Platform Core API для чтения article-linked chat/calendar context.
- `source-links/api-platform-core-rfq-route.ts` — Platform Core API для чтения RFQ из заявок на материалы, BOM и vendor bids через узкий gateway.
- `source-links/api-platform-core-capacity-route.ts` — Platform Core API для чтения capacity gate по B2B order, routing/operations и capacity mirror без SKU-seed mock.
- `source-links/api-platform-core-order-comms-route.ts` — Platform Core API для чтения order-linked chat/calendar context.
- `source-links/api-platform-core-exceptions-route.ts` — Platform Core API для чтения derived exception/SLA gate из capacity, shipment и comms blockers.
- `source-links/api-platform-core-shop-visibility-route.ts` — Platform Core API для shop buyer disclosure policy по заказу.
- `source-links/api-platform-core-qc-route.ts` — Platform Core API для чтения QC/AQL из дефектов, sample-order и dossier mirrors через узкий gateway.
- `source-links/api-platform-core-documents-route.ts` — Platform Core API для чтения document packet по article/order/stage без старого documents UI.
- `source-links/api-platform-core-dpp-route.ts` — Platform Core API для чтения DPP/passport readiness из dossier materials, certificates и validation mirror.
- `source-links/api-platform-core-shipment-route.ts` — Platform Core API для чтения shipment/ASN gate по B2B order через QC, documents, DPP и logistics mirrors.
- `source-links/shop-production-visibility.ts` — feature-domain регламент раскрытия производственной цепочки магазину.
- `source-links/server-ports` — единственная тонкая граница к существующим server repositories: auth/context, dossier-store, B2B orders, RFQ, QC, chat/calendar, shop visibility.

`source-links/routes.ts` удалён: Platform Core больше не должен открывать общий runtime routing по умолчанию.

Старые `src/lib/platform-core-*` — основной domain-слой (не закрывать в `.cursorignore`). Новые изменения ядра — в `src/components/platform/` + `src/lib/platform-core-*` + узкие `src/app/api/platform-core/*`.

## Локальный снимок

- `live-source/` — физическая копия P0-файлов на компьютере.

Рабочий runtime остается в `_ai-share/synth-1-full`. `live-source/` нужен для безопасного просмотра и передачи контекста без чтения всего проекта.

## Серые зоны

Широкие live-links на старые рабочие экраны, API, components/libs и e2e удалены из активной папки. Они не должны открываться Cursor по умолчанию. Перенос из серой зоны — в `components/platform/` + `lib/platform-core-*` + `lib/platform-core-ports/` (папки `src/features/platform-core/` **нет**).

## Аудиты и стандарты

- **`PLATFORM-CORE-DOC-INDEX.md`** — индекс всех доков, doc→код, чеклист задачи (**открывать первым**).
- **`PLATFORM-CORE-AUTONOMY-ROADMAP.md`** — фазы автономии A→F, backlog.
- **`PLATFORM-CORE-ISOLATION-MAP.md`** — три кольца A/B/C, allowlist/denylist, волны, экономия токенов.
- **`PLATFORM-CORE-TOKEN-BUDGET.md`** — cheat sheet (−70…90%).
- `CURSOR-START-HERE.md` — короткая точка входа для Cursor перед любой работой с Platform Core.
- `PLATFORM-CORE-CURSOR-RUN.md` — как Cursor должен запускать Platform Core и что честно входит/не входит в запуск.
- `PLATFORM-CORE-ARCHIVE-INTEGRATION-RULES.md` — как брать идеи из архива без runtime-связей и symlink-ов.
- `PLATFORM-CORE-ACTION-CONTRACTS.md` — конкретные action contracts: что делает кнопка/действие, кто участвует, какие данные меняются, какие события создаются.
- `PLATFORM-CORE-STAGE-GATES.md` — stage gates golden path от артикула до закрытия заказа.
- `PLATFORM-CORE-ROLE-PILLAR-FIELD-MATRIX.md` — обязательные поля и данные для каждой роли и каждого столпа.
- `PLATFORM-CORE-TAB-RULES.md` — правила табов, чтобы не плодить дубли, тупики и декоративные разделы.
- `PLATFORM-CORE-PRODUCTION-DEPTH-SPEC.md` — глубина производства: BOM, routing, capacity, QC, traceability, supplier readiness.
- `PLATFORM-CORE-RU-OPERATING-PACKET.md` — российские документы, ЭДО, 1C/МойСклад, маркировка, закрывающие документы.
- `PLATFORM-CORE-EXCEPTION-SLA-SPEC.md` — исключения, SLA, эскалации и правила закрытия проблем.
- `PLATFORM-CORE-UX-DETAIL-SPEC.md` — единый спокойный UX/UI стандарт для iPhone, iPad и MacBook.
- `FOLDER-AUDIT-2026-06-24.md` — проверка папки, архивной изоляции, дублей, тяжелых файлов и оставшихся рисков.
- `DEEP-AUDIT-2026-06-21.md` — широкий аудит Platform Core по ролям, столпам, связям и плану доведения до 10/10.
- `PERFORMANCE-UX-CLEANUP-2026-06-21.md` — тяжелые файлы, Cursor-нагрузка, UX cleanup, правила дробления и архивирования.
- `PLATFORM-CORE-UI-STANDARD.md` — единый спокойный UI-стандарт для iPhone, iPad и MacBook.
- `PLATFORM-CORE-AUTONOMY-PLAN-2026-06-24.md` — честная карта размеров `_ai-share/synth-1-full`, разделение core/mixed/archive и план полной автономизации Platform Core.

## Правило архива

`legacy-rest/` не открывать и не анализировать по умолчанию. Из архива забирать только точечные идеи или контракты, если они усиливают текущие 4 роли, 5 столпов, golden path и чат/календарь.

## Правило Cursor

- `.cursor/rules/platform-core-scope.mdc` — всегда напоминает Cursor, что основная рабочая среда это Platform Core.
- `.cursorignore` — закрывает архив, большие аудиты и не-core зоны от фоновой индексации.
- `_ai-share/synth-1-full/.cursorignore` — делает то же самое, если Cursor открыт прямо в runtime-приложении.
