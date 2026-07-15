# Syntha Wholesale V2 — Implementation Blueprint

## 1. Назначение

Этот каталог связывает Product Bible с реализацией Cursor.

Он отвечает не только на вопрос «какие функции нужны», но и фиксирует для каждой возможности:

- пользовательскую задачу;
- владельца функции;
- роль и permission;
- экран и route;
- доменную сущность;
- query/command/API;
- создаваемые события;
- уведомления;
- интеграции;
- приоритет и фазу;
- конкурентный источник;
- критерии готовности.

Cursor не должен реализовывать новую функцию, пока она не связана с этими слоями.

## 2. Документы

```text
01_MASTER_CAPABILITY_MAP.md
02_ROLE_PERMISSION_MATRIX.md
03_ENTITY_RELATIONSHIP_STATE_MAP.md
04_WORKFLOW_CATALOG.md
05_SCREEN_FUNCTION_API_MATRIX.md
06_EVENT_NOTIFICATION_CATALOG.md
07_INTEGRATION_SYNC_BLUEPRINT.md
08_COMPETITOR_REFERENCE_CARDS.md
09_CURSOR_IMPLEMENTATION_CONTRACT.md
```

## 3. Иерархия источников правды

При конфликте применяется порядок:

1. `docs/00_PRODUCT_CANON.md` — границы продукта.
2. `docs/03_DOMAIN_MODEL.md` — сущности и бизнес-инварианты.
3. `docs/11_SECURITY_AND_DATA.md` — безопасность и доступ.
4. `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` — UI и responsive.
5. `docs/screens/**` — поведение конкретного экрана.
6. `docs/implementation-blueprint/**` — связи между функцией, экраном, ролью, API и событием.
7. `tasks/**` — атомарная реализация.
8. код.

Если Blueprint противоречит более высокому документу, Cursor останавливает работу и создаёт ADR/исправление документации.

## 4. С