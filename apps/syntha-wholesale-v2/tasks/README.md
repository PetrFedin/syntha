# Cursor Task Queue

Эта папка содержит атомарные задачи реализации Syntha Wholesale V2.

## Правила

- Один файл — одна задача.
- Имя: `TASK-001-short-name.md`.
- Формат: `../docs/12_CURSOR_TASK_TEMPLATE.md`.
- Cursor выполняет только задачи со статусом `READY`.
- Одновременно в статусе `IN_PROGRESS` может находиться одна задача на один независимый кодовый контур.
- Задача не может перейти в `DONE`, пока не выполнены acceptance criteria, тесты и документация.
- Любая новая продуктовая возможность сначала добавляется в Product Canon / Functional Map / Screen Bible.

## Рекомендуемые первые задачи

```text
TASK-001-project-foundation.md
TASK-002-design-tokens.md
TASK-003-app-shell.md
TASK-004-auth-session.md
TASK-005-organization-context.md
TASK-006-campaign-domain.md
TASK-007-campaign-registry-screen.md
TASK-008-campaign-overview-screen.md
TASK-009-collection-domain.md
TASK-010-collection-registry-screen.md
TASK-011-collection-overview-screen.md
TASK-012-product-domain.md
TASK-013-collection-product-table.md
TASK-014-presentation-editor-foundation.md
TASK-015-buyer-preview.md
TASK-016-publish-readiness.md
TASK-017-collection-release-command.md
TASK-018-shop-showroom.md
TASK-019-selection-domain.md
TASK-020-selection-workspace.md
TASK-021-order-domain.md
TASK-022-order-builder-shell.md
TASK-023-size-color-matrix.md
TASK-024-order-validation.md
TASK-025-order-submit.md
TASK-026-brand-order-inbox.md
TASK-027-brand-order-detail.md
TASK-028-order-revision.md
TASK-029-dealspace-foundation.md
TASK-030-order-dealspace.md
```

Файлы задач создаются только после утверждения соответствующих screen/domain/API specs.
