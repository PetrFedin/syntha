# Cursor Start Here — Platform Core (Projects)

Открывать **первым** перед работой с Platform Core.

**Токены:** `PLATFORM-CORE-TOKEN-BUDGET.md` + `PLATFORM-CORE-ISOLATION-MAP.md` — allowlist only; **`DEEP-AUDIT-PROGRESS.md`** (compact); затем этот файл.

## Фокус

```text
4 роли: Brand, Shop, Manufacturer, Supplier
5 столпов: development, sample_collection, collection_order, order_production, comms
Golden path: артикул → коллекция → заказ → производство → поставщик → отгрузка → закрытие
Слой: чат, календарь, документы, события, исключения
```

## Запуск

```bash
# корень Projects (рекомендуется)
npm run core:status
npm run dev:platform-core   # MODE + STRICT (daily)
# → http://127.0.0.1:3001/platform
```

Полный индекс доков: [PLATFORM-CORE-DOC-INDEX.md](./PLATFORM-CORE-DOC-INDEX.md).

## Открывать по умолчанию (канон кода)

Папки `src/features/platform-core/` **нет**. Канон — **не compatibility wrappers**, а рабочий слой:

```text
components/platform/              ← UI (+ peers/, showroom/)
lib/platform-core-*               ← domain, hub-matrix, readiness, native-href
lib/platform-core-ports/          ← единственный мост к legacy lib/server
app/platform/ + api/platform-core/
_ai-share/synth-1-full/src/app/platform/page.tsx
_ai-share/synth-1-full/src/app/platform/layout.tsx
_ai-share/synth-1-full/src/lib/platform-core-hub-matrix.ts          # grep по role/pillar, не целиком
_ai-share/synth-1-full/src/lib/platform-core-demo-context.ts
_ai-share/synth-1-full/src/lib/platform-core-readiness-audit.ts
_ai-share/synth-1-full/src/lib/platform-core-readiness-sections/   # один role-файл за раз
_platform-core-split/platform-core/PLATFORM-CORE-ACTION-CONTRACTS.md   # workflow TS — фаза D roadmap
_ai-share/synth-1-full/src/lib/platform-core-planner-agent.ts
_ai-share/synth-1-full/src/lib/platform-core-ui-surfaces.ts
_ai-share/synth-1-full/src/components/platform/PlatformHubPageClient.tsx
_ai-share/synth-1-full/src/components/platform/showroom/   ← native showroom widgets
_ai-share/synth-1-full/src/app/api/platform-core/
_ai-share/synth-1-full/src/app/api/dev/platform-core/planner/
_ai-share/synth-1-full/src/lib/platform-core-gateways/bom-costing-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/rfq-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/dossier-store.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/material-requisitions.ts
_ai-share/synth-1-full/src/app/api/platform-core/articles/[collectionId]/[articleId]/bom-costing/route.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/qc-defects.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/sample-orders.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/qc-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/documents-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/dpp-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/capacity-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/shipment-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/entity-comms-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-gateways/exception-sla-gateway.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/contextual-messages.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/brand-calendar.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/b2b-orders.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/api-client-headers.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/manufacturer-handoff.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/b2b-order-lifecycle.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/dossier-material-preview.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/brand-linesheet-syndication.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/factory-dossier.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/investor-readiness.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/erp-retry-hint.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/brand-release-gate.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/mfr-dossier-comments.ts
_ai-share/synth-1-full/src/lib/platform-core-ports/tz-client.ts
_ai-share/synth-1-full/src/app/api/platform-core/articles/[collectionId]/[articleId]/qc/route.ts
_ai-share/synth-1-full/src/app/api/platform-core/articles/[collectionId]/[articleId]/documents/route.ts
_ai-share/synth-1-full/src/app/api/platform-core/articles/[collectionId]/[articleId]/dpp/route.ts
_ai-share/synth-1-full/src/app/api/platform-core/orders/[orderId]/capacity/route.ts
_ai-share/synth-1-full/src/app/api/platform-core/orders/[orderId]/shipment/route.ts
_ai-share/synth-1-full/src/app/api/platform-core/articles/[collectionId]/[articleId]/comms/route.ts
_ai-share/synth-1-full/src/app/api/platform-core/orders/[orderId]/comms/route.ts
_ai-share/synth-1-full/src/app/api/platform-core/orders/[orderId]/exceptions/route.ts
_platform-core-split/platform-core/PLATFORM-CORE-NO-WORKSHOP2-UI.md
_platform-core-split/platform-core/PLATFORM-CORE-ACTION-CONTRACTS.md
_platform-core-split/platform-core/PLATFORM-CORE-STAGE-GATES.md
.cursor/rules/platform-core-planner-agents.mdc
```

## Не открывать без запроса (закрыто .cursorignore)

```text
src/components/brand/production/*
src/app/brand/production/*
src/lib/production/data/*
src/lib/production/generated/*
src/lib/routes.ts
src/lib/server/workshop2-*repository.ts
package-lock.json
e2e/ (кроме точного spec по задаче)
docs/ (кроме одного файла по задаче)
DEEP-AUDIT-*.md, PERFORMANCE-UX-*.md
```

Workshop2 repositories — только если меняется `lib/server/platform-core-*` hub; не импортировать в UI напрямую.

## Порядок работы

**Стартовый промпт (новый чат Platform Core):**

```text
Read AGENTS.md + DEEP-AUDIT-PROGRESS.md.
Scope: {role} × {pillar} × {section-id}. Anchor: {one file}.
grep → read ≤150 lines. npm run dev:platform-core. Minimal diff.
```

Компактный трекер: **`DEEP-AUDIT-PROGRESS.md`** (не `DEEP-AUDIT-2026-06-21.md`).

1. Роль + столп задачи → hub matrix / planner item.
2. Action contract → `PLATFORM-CORE-ACTION-CONTRACTS.md`.
3. Stage gate → `PLATFORM-CORE-STAGE-GATES.md`.
4. Поля → `PLATFORM-CORE-ROLE-PILLAR-FIELD-MATRIX.md`.
5. UI dedup → `npm run audit:platform-core-ui` перед PR.
6. Verify → `npm run core:verify` (или smoke затронутой зоны).

## Planner (автономность)

```bash
npm run planner:next
npm run planner:analyze    # +10 задач из audit/TODO (без LLM)
npm run planner:claim
npm run planner:complete -- <task-id> "краткая note"
npm run planner:agent:loop   # нужен CURSOR_API_KEY в .env.local
```

## Gateways (read layer, P5)

| Gateway | API |
|---------|-----|
| BOM/costing | `GET /api/platform-core/articles/{collectionId}/{articleId}/bom-costing` |
| RFQ | `GET /api/platform-core/articles/{collectionId}/{articleId}/rfq` |
| QC/AQL | `GET /api/platform-core/articles/{collectionId}/{articleId}/qc` |
| Documents | `GET /api/platform-core/articles/{collectionId}/{articleId}/documents?stage=handoff&orderId=` |
| DPP | `GET /api/platform-core/articles/{collectionId}/{articleId}/dpp` |
| Capacity | `GET /api/platform-core/orders/{orderId}/capacity?factoryId=&startDate=` |
| Shipment | `GET /api/platform-core/orders/{orderId}/shipment` |
| Entity-comms (article) | `GET /api/platform-core/articles/{collectionId}/{articleId}/comms` |
| Entity-comms (order) | `GET /api/platform-core/orders/{orderId}/comms` |
| Exception/SLA | `GET /api/platform-core/orders/{orderId}/exceptions` |

Код: `src/lib/platform-core-gateways/*`, ports: `src/lib/platform-core-ports/*` (зеркала `b2b/`, `fashion/`, `brand/`, `communications/`, `platform/`, `legacy/` — UI не тянет `@/lib/*` legacy напрямую).

## Нельзя

```text
новый dashboard без action contract;
длинные описания в UI;
таб без allowed type;
новые роли/столпы;
импорт archive в /platform;
читать lib/routes.ts целиком;
читать все readiness-sections сразу;
кнопка без результата / next owner / recovery.
```

## Definition of Done

```text
понятное действие + required fields + success state + next owner;
side effect (chat/calendar/doc/event) если межролевой процесс;
empty/error/loading;
npm run validate:platform-core-boundary — OK для touched core paths.
```
