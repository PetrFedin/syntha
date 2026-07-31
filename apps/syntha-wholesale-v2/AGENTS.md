# Syntha V2 agent rules

- Работать только внутри `apps/syntha-wholesale-v2` и специализированного workflow.
- Не импортировать код из других приложений репозитория.
- Не подключать внешний identity provider: authentication принадлежит V2.
- Все cross-module imports идут через `public.mjs`.
- Все мутации требуют durable command id и транзакционный outbox.
- Перед публикацией выполнять `npm run verify`.
- Приоритет: целостность коммерческого маршрута, PostgreSQL, auth, API, standalone UI, затем новые домены.
