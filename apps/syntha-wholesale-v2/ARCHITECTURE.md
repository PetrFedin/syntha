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
- `src/infrastructure` — memory/PostgreSQL adapters;
- `src/http` — Node и Fetch transport adapters;
- `src/runtime` — composition root;
- `db/migrations` — последовательные PostgreSQL migrations;
- `scripts` — миграции, bootstrap и gates;
- `tests` — domain/application/transport/real PostgreSQL integration.

## Аутентификация

Пользователи и сессии хранятся в PostgreSQL. Пароли хешируются `scrypt` с уникальной солью. Клиент получает случайный непрозрачный Bearer token; в базе хранится только SHA-256 token hash. Сессии имеют TTL и могут быть отозваны через logout. Ответ при неверном email и неверном пароле одинаковый; оба пути выполняют `scrypt`.

## Авторизация

После аутентификации действия разрешаются только через активное membership организации и explicit capabilities. `actorId` берётся исключительно из серверной сессии.

## Транзакционные гарантии

Каждая бизнес-мутация требует `commandId`, выполняется в одной транзакции и атомарно сохраняет aggregate changes, durable command result и outbox events. Versioned aggregates используют optimistic concurrency.

## PostgreSQL

`001_wholesale_v2.sql` содержит коммерческий write model, outbox и notification projection. `002_auth.sql` содержит пользователей и отзываемые сессии. CI поднимает PostgreSQL 17 и запускает полный тестовый набор последовательно.

## Следующая граница

Standalone web workspace должен работать поверх `/v2` API внутри этого приложения. PLM, BOM, production, QC, logistics и landed cost добавляются только после устойчивого самостоятельного runtime и UI.
