# Folder Audit 2026-06-24

Цель: проверить всю папку проекта на повторы, дубли, битые связи, архивную изоляцию и риски запуска Platform Core.

## Итог

Platform Core изолирован для Cursor лучше, чем раньше, но это еще не отдельное физическое приложение.

Update: archive live links removed. `_platform-core-split/legacy-rest` теперь offline archive без `source-links` и symlink-ов.

Запуск:

```text
_ai-share/synth-1-full
npm run dev:platform-core
http://127.0.0.1:3001/platform
```

Контекстная работа:

```text
_platform-core-split/platform-core
```

Архив:

```text
_platform-core-split/legacy-rest
```

## Проверено

- Git status: рабочая ветка чистая до текущего аудита, локально впереди GitHub.
- `node_modules`: отсутствует, поэтому проект не запустится без `npm install`.
- `package.json`: JSON валиден, script `dev:platform-core` есть.
- `_platform-core-split/MANIFEST.json`: JSON валиден.
- Symlink-и в `_platform-core-split`: битых ссылок нет.
- Активные Platform Core imports: локальные импорты `/platform`, `platform-core-*`, `platform-core-readiness-sections` существуют.
- Runtime import из `legacy-rest`: не найден.
- Прямые упоминания `legacy-rest` в активных файлах: только docs/rules/runbook/audit, не runtime import.
- Archive live symlink-и: удалены после аудита.

## Что исправлено во время аудита

### 1. Закрыты прямые root-архивы

Проблема: `_platform-core-split/legacy-rest` был закрыт, но старые исходные root-папки оставались видимыми для Cursor напрямую.

Добавлено в `.cursorignore`:

```text
app/
docs/
tests/
scripts/
static/
tools/
.planning/
.cursor/get-shit-done/
.cursor/gsd-local-patches/
```

Эффект: Cursor не должен тратить Platform Core-контекст на старый FastAPI/root-backend, архивные скрипты, старые tests/docs/static/tools и дубли GSD payload.

### 2. Убраны точные runtime-дубли factory routes

Найдены точные дубли:

```text
_ai-share/synth-1-full/src/app/factory/materials/page.tsx
_ai-share/synth-1-full/src/app/factory/production/materials/page.tsx

_ai-share/synth-1-full/src/app/factory/calendar/page.tsx
_ai-share/synth-1-full/src/app/factory/production/calendar/page.tsx
```

Сделано:

```text
/factory/materials -> re-export /factory/production/materials
/factory/calendar -> re-export /factory/production/calendar
```

Эффект: маршруты не сломаны, но фактический код теперь один.

## Архивная изоляция

### Что хорошо

- `_platform-core-split/legacy-rest/` закрыт в `.cursorignore`.
- `_platform-core-split/legacy-rest/` не содержит живых `source-links`.
- `_platform-core-split/legacy-rest/` не содержит symlink-ов.
- `.cursor/rules/platform-core-scope.mdc` запрещает открывать архив без явного запроса.
- `PLATFORM-CORE-CURSOR-RUN.md` говорит Cursor, что архив не нужен для запуска.
- Runtime `/platform` не импортирует `legacy-rest`.
- `platform-core/source-links` ведет в активные runtime-файлы, а не в archive folder.
- Битых symlink-ов нет.

### Что было недостаточно хорошо

До аудита старые root-папки были видимы напрямую:

```text
app/
docs/
tests/
scripts/
static/
tools/
.planning/
```

Это исправлено в `.cursorignore`.

## Тяжелые и шумные зоны

Самые тяжелые/токеноемкие файлы и зоны:

```text
package-lock.json
src/lib/production/data/attribute-catalog.instance.json
src/lib/production/generated/category-handbook.snapshot.json
DEEP-AUDIT-2026-06-21.md
src/lib/product-attributes.ts
src/components/home/_fixtures/b2b-data.ts.bak
src/lib/production/workshop2-live-integration-probes.ts
src/components/brand/production/Workshop2Phase1DossierPanel.tsx
src/app/academy/page.tsx
src/components/brand/production/Workshop2ArticleWorkspace.tsx
```

Что уже закрыто:

- heavy/generated/data в `.cursorignore`;
- deep audit в `.cursorignore`;
- old home/academy/client/runway/wardrobe zones в `.cursorignore`;
- root archive folders после этого аудита.

Что еще нужно сделать:

- вынести heavy production pages в более мелкие feature modules;
- заменить tracked `.bak` файлы на archive/offline или удалить из git после проверки;
- не открывать `DEEP-AUDIT-2026-06-21.md` без точного вопроса;
- для Cursor использовать compact specs вместо большого аудита.

## Tracked мусор и backup-файлы

В git остаются tracked backup/log-like файлы:

```text
_ai-share/synth-1-full/.cursorignore.bak
_ai-share/synth-1-full/src/components/home/_fixtures/b2b-data.ts.bak
_ai-share/synth-1-full/src/lib/data/production-params.ts.bak
dev_server.log
```

Рекомендация:

1. проверить, нужны ли они для восстановления;
2. если нет - удалить из git;
3. если нужны - перенести в явный offline archive, закрытый от Cursor.

## Повторы и дубли

### Исправлено

- factory materials route duplicate;
- factory calendar route duplicate.

### Осталось проверить/разобрать

- `.cursor/skills` и `.cursor/gsd-local-patches` имеют много одинаковых файлов; `gsd-local-patches` закрыт от индексации, но позже можно удалить/перенести, если это не нужно.
- `platform-core/live-source` намеренно дублирует P0-файлы как snapshot. Это не ошибка, но Cursor должен считать runtime source of truth `_ai-share/synth-1-full`.
- похожие компоненты Brand/Shop B2B могут быть не точными дублями, а mirror UI. Их нельзя удалять без функционального сравнения.

## Platform Core, что уже есть

- `/platform` route;
- role x pillar matrix;
- 4 роли;
- 5 столпов;
- stage gate strip;
- action contracts;
- readiness layer;
- source-links map;
- live-source snapshot;
- launch runbook;
- Cursor scope rule;
- archive ignore rules.

## Platform Core, что еще не полноценно

- `demoArticleId`, `demoOrderId`, `B2B-DEMO-*` все еще используются как demo-context.
- Primary actions пока в основном ведут в рабочие экраны, но не все создают реальные domain events.
- Chat/calendar должны стать entity-linked для каждого article/order/RFQ/shipment.
- Documents/RU operating packet еще надо связать с order/shipment/closeout.
- Exceptions/SLA должны блокировать gates и иметь owner/recovery flow.
- Production depth надо довести до BOM/MRP/routing/capacity/QC/traceability.
- Old production/B2B screens еще содержат большие файлы и часть demo/fixture логики.

## Следующие действия

1. Удалить или архивировать tracked `.bak`/`.log` файлы.
2. Добавить Platform Core guard script: проверять, что runtime не импортирует `legacy-rest`.
3. Добавить smoke test `/platform` без запуска archive routes.
4. Постепенно заменить `demoArticleId`/`demoOrderId` на real selected entity context.
5. Привязать action contracts к domain events, chat, calendar и documents.
6. Разбить самые тяжелые production files на smaller modules.
7. Свести mirror-дубли Brand/Shop/Factory только после route-level acceptance tests.
