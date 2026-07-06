# Platform Core Cursor Run

> **Индекс документов:** [PLATFORM-CORE-DOC-INDEX.md](./PLATFORM-CORE-DOC-INDEX.md)  
> **Projects runtime:** `lib/platform-core-*` + `components/platform/` (не `features/platform-core/`).

Этот файл открывать, когда пользователь просит Cursor запустить Platform Core.

## Короткий ответ

Platform Core не является отдельным физически вынесенным mini-app.

Живой runtime остается в:

```text
_ai-share/synth-1-full
```

Запускается Next-приложение, а рабочий вход Platform Core находится здесь:

```text
http://127.0.0.1:3001/platform
```

Архив не нужен для запуска `/platform` и не должен открываться по умолчанию.

`_platform-core-split/legacy-rest` является offline-архивом. В нем не должно быть живых `source-links`, и Platform Core не должен импортировать из него код.

## Команда запуска

Рабочая директория:

```text
_ai-share/synth-1-full
```

Команда:

```text
npm run dev:core
```

После запуска открыть:

```text
http://127.0.0.1:3001/platform
```

Если порт занят:

```text
PORT=3002 npm run dev:core
```

## Перед запуском

Если нет `node_modules`, сначала нужны зависимости:

```text
npm install
```

Без `node_modules` проект не запустится, потому что нет `next`, `react`, `typescript` и остальных runtime-пакетов.

## Что Cursor должен открыть

```text
_platform-core-split/platform-core/PLATFORM-CORE-DOC-INDEX.md
_platform-core-split/platform-core/CURSOR-START-HERE.md
_platform-core-split/platform-core/PLATFORM-CORE-CURSOR-RUN.md
_ai-share/synth-1-full/src/app/platform/page.tsx
_ai-share/synth-1-full/src/components/platform/PlatformHubPageClient.tsx
_ai-share/synth-1-full/src/lib/platform-core-ports/
_ai-share/synth-1-full/src/app/api/platform-core
```

## Что Cursor не должен открывать

```text
_platform-core-split/legacy-rest
_platform-core-split/platform-core/DEEP-AUDIT-2026-06-21.md
_platform-core-split/platform-core/PERFORMANCE-UX-CLEANUP-2026-06-21.md
app
docs
tests
scripts
static
tools
.planning
_ai-share/synth-1-full/src/app/admin
_ai-share/synth-1-full/src/app/academy
_ai-share/synth-1-full/src/app/client
_ai-share/synth-1-full/src/app/runway
_ai-share/synth-1-full/src/app/wardrobe
_ai-share/synth-1-full/src/components/ai
_ai-share/synth-1-full/src/components/home
_ai-share/synth-1-full/src/lib/server/workshop2-*repository.ts
_ai-share/synth-1-full/src/lib/server/workshop2-phase1-dossier-server-store.ts
_ai-share/synth-1-full/src/lib/server/workshop2-route-auth.ts
_ai-share/synth-1-full/src/lib/server/workshop2-api-context.ts
```

Эти зоны открывать только при точном запросе пользователя.

Platform Core обращается к старым server repositories только через `src/features/platform-core/server/ports/*`. Gateway, API routes и UI не должны импортировать `src/lib/server/*` напрямую.

## Что уже должно работать

```text
/platform route
роль x столп matrix
collection switch SS27/FW27
stage gate strip
следующее действие выбранной ячейки
owner, output, event, side effect
required fields и blockers
links в существующие Brand/Shop/Manufacturer/Supplier рабочие экраны
compact Cursor start pack
archive ignore rules
```

## Что еще не означает "полностью готово"

Platform Core уже можно запускать как рабочий hub, но это еще не финальная 10/10 операционная система.

Следующие слои еще нужно довести:

```text
primary actions должны создавать реальные domain events;
чат должен быть entity-linked для каждого заказа, артикула, RFQ и поставки;
календарь должен создавать дедлайны из action contracts;
документы РФ-пакета должны быть привязаны к order/shipment/closeout;
exceptions/SLA должны блокировать gates и иметь владельца;
производство должно получить полный BOM/MRP/QC/capacity loop;
старые рабочие экраны остаются серой зоной и не открываются без точного запроса.
```

## Главное правило

Запуск Platform Core = запуск `_ai-share/synth-1-full` и открытие `/platform`.

Анализ Platform Core = работа через `_platform-core-split/platform-core`.

Архив не участвует ни в запуске, ни в анализе по умолчанию.

Если из архива нужна идея, сначала открыть `PLATFORM-CORE-ARCHIVE-INTEGRATION-RULES.md`, затем переписать идею в активную Platform Core-структуру без symlink/import связи.
