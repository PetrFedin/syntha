# Cursor Start Here — Syntha Wholesale V2

Открывай в Cursor именно папку `apps/syntha-wholesale-v2`, а не весь монорепозиторий.

## 1. Главный принцип

Cursor не должен читать весь проект перед каждой задачей.

Используется минимальный context capsule:

```text
Task file
→ relevant screen spec
→ relevant capability domain
→ relevant workflow
→ module README/public API
→ changed source files
```

## 2. Обязательный порядок

1. Открой задачу из `tasks/`.
2. Проверь `capability_ids`, `workflow_ids`, `screen_ids` и зависимости.
3. Прочитай только связанные compact docs.
4. Прочитай `README.md` изменяемого модуля.
5. Найди существующие public exports и тесты.
6. Измени минимальный набор файлов.
7. Запусти локальные проверки задачи.
8. Обнови task/status/traceability.

## 3. Когда читать большие документы

Большие канонические документы читаются только когда задача меняет:

- границы продукта;
- доменную модель;
- security/tenant model;
- визуальную систему;
- общий API или integration policy.

Обычная feature-задача не должна загружать весь Product Bible.

## 4. Источники контекста по типу задачи

| Задача | Читать |
|---|---|
| UI экрана | task + screen spec + design tokens + module