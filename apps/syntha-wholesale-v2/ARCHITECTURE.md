# Syntha Wholesale V2 Architecture

## Граница проекта

Syntha V2 является автономным приложением в `apps/syntha-wholesale-v2`. Оно не импортирует код замороженных приложений монорепозитория и не зависит от внешнего identity provider. Изоляция контролируется `validate-isolation.mjs` в CI.

## Исполняемый маршрут

Основной коммерческий маршрут:

`Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace`.

Product-development маршрут:

`Published Size Grid → Draft Style → Approved Style snapshot → Style/Color/Size SKU → Published SKU → Selection → reserved Order → DealSpace`.

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

## Аутентификация

Пользователи и сессии хранятся в PostgreSQL. Пароли хешируются `scrypt` с уникальной солью. Клиент получает случайный непрозрачный Bearer token; в базе хранится только SHA-256 token hash. Сессии имеют TTL и могут быть отозваны через logout. Ответ при неверном email и неверном пароле одинаковый; оба пути выполняют `scrypt`.

## Авторизация

После аутентификации действия разрешаются только через активное membership организации и explicit capabilities. `actorId` берётся исключительно из серверной сессии. Product-development операции доступны только brand-ролям с `product-development.manage`; shop-пользователи получают только разрешённые опубликованные проекции.

## Транзакционные гарантии

Каждая бизнес-мутация требует `commandId`, выполняется в одной транзакции и атомарно сохраняет aggregate changes, durable command result и outbox events. Versioned aggregates используют optimistic concurrency. Сервер сам генерирует aggregate id и не доверяет идентификаторам из тела запроса.

## Product development и каталог

Size Grid публикуется до создания Style. Style хранит immutable snapshot опубликованной размерной сетки и после утверждения становится источником идентичности товарного варианта. Style-linked SKU фиксирует Style/version, Size Grid/version, color code и size label. PostgreSQL tenant FK и уникальность `(style_id, color_code, size_label)` не позволяют создать дубликат варианта или связать данные разных брендов.

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

`007_product_development.sql` вводит Size Grid и Style с tenant-boundary constraints. `008_style_catalog_variants.sql` связывает каталог с immutable Style/size-grid snapshots. Применённые миграции не редактируются.

Сервер, CLI миграций и bootstrap владельца используют один migration engine. CI поднимает PostgreSQL 17 и проверяет параллельный запуск migrator, повторяемость, checksum-конфликт, реальный product-to-order маршрут и rollback.

## Следующая граница

После Style/size-grid и orderable variants следующий вертикальный срез — Material Library → approved material revision → BOM revision → costing → Tech Pack, затем образцы, Measurement Chart, production, QC и logistics.
