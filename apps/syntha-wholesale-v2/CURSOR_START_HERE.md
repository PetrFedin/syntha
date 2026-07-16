# Cursor Start Here — Syntha Wholesale V2

Открывай в Cursor именно папку `apps/syntha-wholesale-v2`, а не весь монорепозиторий.

## 1. Главный принцип

Cursor не должен читать весь проект перед каждой задачей.

Используется минимальная context capsule:

```text
Task file
→ relevant screen spec
→ relevant capability domain
→ relevant workflow
→ module README/public API
→ changed source files
```

## 2. Обязательное чтение для любой задачи

1. `AGENTS.md`.
2. `CURSOR_MASTER_RULES.md`.
3. конкретный файл задачи из `tasks/`.
4. документы, прямо перечисленные в поле `source_documents` задачи.
5. `README.md` изменяемого модуля.

Не открывай все Product Bible-файлы автоматически.

## 3. Когда читать глобальные документы

- Product scope или новая роль: `docs/00_PRODUCT_CANON.md`.
- Новая сущность/статус: `docs/03_DOMAIN_MODEL.md`.
- Новый экран: `docs/08_SCREEN_BIBLE_INDEX.md` и его screen-spec.
- UI/layout: `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md` и design tokens.
- Permission/security: `docs/11_SECURITY_AND_DATA.md`.
- API/event/integration: соответствующий Blueprint-файл.

## 4. Context budget

Обычно в активном контексте должны находиться:

- одна задача;
- один screen-spec;
- один capability-файл;
- один workflow-файл;
- один module README;
- только изменяемые исходники и ближайшие тесты.

Если требуется больше, сначала сузь задачу или создай ADR.

## 5. Правила изменения кода

- Не сканируй весь репозиторий без необходимости.
- Не импортируй legacy UI.
- Используй public API модуля, а не внутренние пути.
- Не создавай второй источник правды.
- Не добавляй capability без документации и task mapping.
- Не расширяй scope задачи скрытыми улучшениями.

## 6. Размеры файлов

Целевые пределы:

```text
Markdown narrative: до 150 строк
React component: до 200 строк
TypeScript module: до 250 строк
Machine-readable JSON: до 200 строк на логический файл
```

Превышение не является автоматической ошибкой, но требует явного обоснования или разделения по ответственности.

## 7. Перед началом

Cursor должен вывести кратко:

```text
Task
Capabilities
Workflow
Screens
Modules to change
Permissions
Commands/events
Tests
```

Если связь отсутствует или документы противоречат друг другу — остановить реализацию.

## 8. После завершения

Обновить task status и приложить completion report по `docs/implementation-blueprint/09_CURSOR_IMPLEMENTATION_CONTRACT.md`.

Никаких demo-only CTA, скрытых fallback в