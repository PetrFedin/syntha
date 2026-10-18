# Syntha Wholesale V2 Architecture

## Граница проекта

Syntha V2 является автономным приложением в `apps/syntha-wholesale-v2`. Оно не импортирует код замороженных приложений монорепозитория и не зависит от внешнего identity provider. Изоляция контролируется `validate-isolation.mjs` в CI.

## Исполняемые маршруты

Основной коммерческий маршрут:

`Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace`.

Product-development маршрут:

`Published Size Grid → Draft Style → Approved Style snapshot → Style/Color/Size SKU → Published SKU → Selection → reserved Order → DealSpace`.

Product-specification маршрут:

`Material master → Draft material revision → Approved material revision → Draft BOM → deterministic costing → Submitted BOM → Approved BOM → revision without loss of prior snapshots`.

## Слои

- `src/core` — ошибки и immutable event envelope;
- `src/auth` — парольная криптография;
- `src/modules/*/public.mjs` — публичные доменные контракты;
- `src/application` — use cases и транзакционные границы;
- `src/infrastructure` — memory/PostgreSQL adapters, readiness и migration engine;
- `src/http` — Node и Fetch transport adapters;
- `src/runtime` — composition root и фоновые operational workers;
- `src/web` и `public` — standalone same-origin workspace;
- `db/migrations` — последовательные PostgreSQL migrations;
- `scripts` — migration CLI, bootstrap и gates;
- `tests` — domain/application/transport/UI/real PostgreSQL integration.

## Аутентификация и авторизация

Пользователи и сессии хранятся в PostgreSQL. Пароли хешируются `scrypt` с уникальной солью. Клиент получает случайный непрозрачный Bearer token; в базе хранится только SHA-256 token hash. Сессии имеют TTL и могут быть отозваны через logout. Ответ при неверном email и неверном пароле одинаковый; оба пути выполняют `scrypt`.

После аутентификации действия разрешаются только через активное membership организации и explicit capabilities. `actorId` берётся исключительно из серверной сессии. Product-development и product-specification mutations разделены: `product-specification.manage` есть у owner/admin/product; sales и finance могут читать costing через `product-specification.read`, но не менять его; viewer и shop-роли не получают внутренние материалы, закупочные цены и BOM-costing.

## Транзакционные гарантии

Каждая бизнес-мутация требует `commandId`, выполняется в одной транзакции и атомарно сохраняет aggregate changes, durable command result и outbox events. Versioned aggregates используют optimistic concurrency. Сервер сам генерирует aggregate id и не доверяет идентификаторам из тела запроса. PostgreSQL partial unique indexes дублируют lifecycle invariants для конкурентных запросов.

## Style, каталог и товарная идентичность

Size Grid публикуется до создания Style. Style хранит immutable snapshot опубликованной размерной сетки и после утверждения становится источником идентичности товарного варианта. Style-linked SKU фиксирует Style/version, Size Grid/version, color code и size label. PostgreSQL tenant FK и уникальность `(style_id, color_code, size_label)` не позволяют создать дубликат варианта или связать данные разных брендов.

## Material Library и BOM

Material master имеет стабильный brand-scoped code. Изменяемые характеристики хранятся в отдельных ревизиях. Одновременно допускается только одна draft и одна approved revision; при утверждении новой ревизии предыдущая переводится в `superseded`, но остаётся доступной для старых BOM snapshots.

BOM создаётся только для approved Style. Каждая строка фиксирует immutable material-revision snapshot, UOM, consumption в миллионных долях единицы, waste в basis points и unit cost в minor currency units. Стоимость строки и BOM рассчитывается целочисленно через `BigInt` с округлением вверх; floating-point money в доменном расчёте не используется. После submit строки неизменяемы. Новая BOM revision клонирует предыдущую approved revision, а её утверждение supersede-ит старую в той же транзакции.

Workspace выдаёт материалы, material revisions и BOM только brand-membership с `product-specification.read`; shop и viewer не получают закупочную себестоимость через общий workspace endpoint.

## Outbox и уведомления

Notification projection имеет отдельный durable ledger `notification_projections`, поэтому не присваивает себе глобальный статус публикации основного outbox. `notification-projector.mjs` запускается сервером сразу после открытия listener, затем выполняется с настраиваемым интервалом без перекрывающихся прогонов. Ошибка одного цикла логируется, не завершает процесс и повторяется на следующем цикле. Graceful shutdown прекращает планирование и ждёт активную проекцию.

Перед проекцией сервис отбрасывает уже обработанные event id по ledger. Отложенная обработка повторно проверяет актуальное состояние showroom, invitation и relationship, чтобы не отправлять уведомления по отозванному или истёкшему доступу.

## PostgreSQL и миграции

`postgres-migrator.mjs`:

1. ждёт готовности PostgreSQL только через безопасный `SELECT 1` probe;
2. сериализует конкурирующие процессы advisory lock;
3. хранит версию, SHA-256 checksum и дату применения в `schema_migrations`;
4. применяет каждый новый файл в отдельной транзакции;
5. пропускает неизменённые миграции и блокирует изменённую историю.

`007_product_development.sql` вводит Size Grid и Style с tenant-boundary constraints. `008_style_catalog_variants.sql` связывает каталог с immutable Style/size-grid snapshots. `009_materials_bom.sql` вводит material masters, immutable revisions и versioned BOM с tenant FK и partial unique lifecycle indexes. Применённые миграции не редактируются.

Сервер, CLI миграций и bootstrap владельца используют один migration engine. CI поднимает PostgreSQL 17 и проверяет параллельный запуск migrator, повторяемость, checksum-конфликт, реальные product-to-order и material-to-approved-BOM маршруты, RBAC и rollback.

## Следующая граница

После закрытия Material/BOM следующий вертикальный срез: `Measurement Chart revision → sample fit evaluation → approved measurement snapshot → Tech Pack generation`. После него — sourcing/RFQ, production, QC и logistics.
