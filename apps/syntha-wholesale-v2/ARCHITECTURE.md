# Syntha Wholesale V2 Architecture

## Граница проекта

Syntha V2 является автономным приложением в `apps/syntha-wholesale-v2`. Оно не импортирует код замороженных приложений монорепозитория и не зависит от внешнего identity provider. Изоляция контролируется `validate-isolation.mjs` в CI.

## Исполняемый маршрут

`Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace`.

## Слои

- `src/core` — ошибки и immutable event envelope;
- `src/auth` — парольная криптография;
- `src/modules/*/public.mjs` — публичные доменные контракты;
- `src/application` — use cases и транзакционные границы;
- `src/infrastructure` — memory/PostgreSQL adapters, readiness и migration engine;
- `src/http` — Node и Fetch transport adapters;
- `src/runtime` — composition root;
- `src/web` и `public` — standalone same-origin workspace;
- `db/migrations` — последовательные PostgreSQL migrations;
- `scripts` — migration CLI, bootstrap и gates;
- `tests` — domain/application/transport/UI/real PostgreSQL integration.

## Аутентификация

Пользователи и сессии хранятся в PostgreSQL. Пароли хешируются `scrypt` с уникальной солью. Клиент получает случайный непрозрачный Bearer token; в базе хранится только SHA-256 token hash. Сессии имеют TTL и могут быть отозваны через logout. Ответ при неверном email и неверном пароле одинаковый; оба пути выполняют `scrypt`.

## Авторизация

После аутентификации действия разрешаются только через активное membership организации и explicit capabilities. `actorId` берётся исключительно из серверной сессии.

## Транзакционные гарантии

Каждая бизнес-мутация требует `commandId`, выполняется в одной транзакции и атомарно сохраняет aggregate changes, durable command result и outbox events. Versioned aggregates используют optimistic concurrency.

## PostgreSQL и миграции

`001_wholesale_v2.sql` содержит коммерческий write model, outbox и notification projection. `002_auth.sql` содержит пользователей и отзываемые сессии.

`postgres-migrator.mjs`:

1. ждёт готовности PostgreSQL только через безопасный `SELECT 1` probe;
2. сериализует конкурирующие процессы advisory lock;
3. хранит версию, SHA-256 checksum и дату применения в `schema_migrations`;
4. применяет каждый новый файл в отдельной транзакции;
5. пропускает неизменённые миграции и блокирует изменённую историю.

Сервер, CLI миграций и bootstrap владельца используют один migration engine. CI поднимает PostgreSQL 17 и проверяет параллельный запуск migrator, повторяемость и checksum-конфликт.

## Следующая граница

После устойчивого самостоятельного runtime, auth, UI и migration lifecycle следующий приоритет — operational health/readiness, session abuse protection и затем PLM/BOM/production/QC/logistics/landed cost поверх подтверждённых заказов и коммерческих условий.
