# Syntha V2 — запуск в Cursor

Рабочий проект находится только в `apps/syntha-wholesale-v2` и запускается автономно.

## Первый запуск

```bash
cd apps/syntha-wholesale-v2
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
```

Замените `SYNTHA_BOOTSTRAP_PASSWORD` в `.env` на пароль длиной не менее 12 символов, затем создайте первого владельца и организацию:

```bash
npm run bootstrap:owner
```

Запуск API:

```bash
npm run dev
```

Проверка:

```bash
curl http://127.0.0.1:4100/health
curl http://127.0.0.1:4100/openapi.json
```

## Вход

```bash
curl -X POST http://127.0.0.1:4100/v2/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"owner@syntha.local","password":"YOUR_PASSWORD"}'
```

Полученный `accessToken` используется как `Authorization: Bearer ...`. Все бизнес-мутации также требуют уникальный `Idempotency-Key`.

## Cursor

В `.vscode/tasks.json` находятся задачи установки, запуска PostgreSQL, миграций, проверки и dev-сервера. В `.vscode/launch.json` находится конфигурация `Syntha V2 API` для запуска через Run and Debug.

## Обязательная проверка перед коммитом

```bash
npm run verify
```

Она проверяет архитектурные границы, изоляцию V2, PostgreSQL-контракт и все тесты.
