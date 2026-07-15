# 08 — Screen Bible Index

## Назначение

Этот документ — реестр всех экранов Syntha Wholesale V2. Код экрана нельзя начинать, пока для него не определены:

- пользовательская задача;
- входные данные;
- основное действие;
- вторичные действия;
- состояния loading / empty / error / permission denied;
- desktop и iPad layout;
- права доступа;
- события аналитики;
- acceptance criteria.

## Универсальные шаблоны

### W — Workspace

Постоянная левая навигация + основная рабочая область + опциональный inspector справа.

### E — Entity Page

Entity header + контекстные вкладки + один primary action + timeline/activity.

### B — Builder

Трёхпанельная структура: источник → рабочая область → результат.

### S — Split Collaboration

Список контекстов/тредов → активное содержимое → детали/вложения/задачи.

### F — Focus Mode

Полноэкранный сценарий без лишней навигации: live showroom, presentation, large matrix.

## Brand screens

| ID | Экран | Шаблон | Primary action | Приоритет | Статус |
|---|---|---|---|---|---|
| BR-001 | Brand Dashboard | W | Создать кампанию | P0 | SPEC |
| BR-002 | Campaign Registry | W | Создать кампанию | P0 | SPEC |
| BR-003 | Campaign Overview | E | Продолжить подготовку | P0 | SPEC |
| BR-004 | Campaign Buyers | E | Пригласить покупателей | P0 | SPEC |
| BR-005 | Campaign Appointments | E | Назначить встречу | P0 | SPEC |
| BR-006 | Campaign Calendar | E | Создать событие | P0 | SPEC |
| BR-007 | Campaign Analytics | E | Экспортировать отчёт | P1 | SPEC |
| BR-008 | Collection Registry | W | Создать коллекцию | P0 | SPEC |
| BR-009 | Collection Overview | E | Добавить товары | P0 | SPEC |
| BR-010 | Collection Product Table | E | Добавить товары | P0 | SPEC |
| BR-011 | Collection Looks | E | Создать look | P1 | SPEC |
| BR-012 | Collection Chapters/Drops | E | Создать раздел | P1 | SPEC |
| BR-013 | Collection Presentation Editor | B | Сохранить презентацию | P0 | SPEC |
| BR-014 | Buyer Preview | F | Вернуться к редактору | P0 | SPEC |
| BR-015 | Collection Publish Review | E | Опубликовать | P0 | SPEC |
| BR-016 | Collection Release History | E | Создать новую версию | P1 | SPEC |
| BR-017 | Product Registry | W | Добавить товар | P0 | SPEC |
| BR-018 | Product Detail | E | Сохранить изменения | P0 | SPEC |
| BR-019 | Price List Registry | W | Создать прайс-лист | P0 | SPEC |
| BR-020 | Price List Detail | E | Назначить покупателям | P0 | SPEC |
| BR-021 | Buyer Registry | W | Добавить покупателя | P0 | SPEC |
| BR-022 | Buyer Detail | E | Назначить встречу | P0 | SPEC |
| BR-023 | Appointment Registry | W | Назначить встречу | P0 | SPEC |
| BR-024 | Appointment Preparation | E | Начать презентацию | P1 | SPEC |
| BR-025 | Live Showroom | F | Завершить встречу | P1 | SPEC |
| BR-026 | Appointment Summary | E | Отправить follow-up | P1 | SPEC |
| BR-027 | Incoming Order Registry | W | Открыть заказ | P0 | SPEC |
| BR-028 | Brand Order Detail | E | Подтвердить заказ | P0 | SPEC |
| BR-029 | Brand Order Revision | B | Отправить изменения | P0 | SPEC |
| BR-030 | DealSpace Campaign | S | Написать сообщение | P0 | SPEC |
| BR-031 | DealSpace Collection | S | Написать сообщение | P0 | SPEC |
| BR-032 | DealSpace Order | S | Написать сообщение | P0 | SPEC |
| BR-033 | Brand Calendar | W | Создать событие | P0 | SPEC |
| BR-034 | Documents | W | Загрузить документ | P1 | SPEC |
| BR-035 | Brand Analytics | W | Открыть кампанию | P1 | SPEC |
| BR-036 | Team & Permissions | W | Пригласить пользователя | P0 | SPEC |
| BR-037 | Brand Settings | W | Сохранить настройки | P0 | SPEC |

## Shop screens

| ID | Экран | Шаблон | Primary action | Приоритет | Статус |
|---|---|---|---|---|---|
| SH-001 | Shop Dashboard | W | Открыть активную кампанию | P0 | SPEC |
| SH-002 | Brand Directory | W | Открыть бренд | P1 | SPEC |
| SH-003 | Brand Detail | E | Запросить доступ | P1 | SPEC |
| SH-004 | Available Campaigns | W | Открыть кампанию | P0 | SPEC |
| SH-005 | Campaign Detail | E | Открыть коллекцию | P0 | SPEC |
| SH-006 | Collection Showroom | F | Открыть Buying Workspace | P0 | SPEC |
| SH-007 | Product Quick View | E | Добавить в selection | P0 | SPEC |
| SH-008 | Favorites / Selection | W | Создать заказ | P0 | SPEC |
| SH-009 | Compare Products | B | Добавить выбранное | P1 | SPEC |
| SH-010 | Buying Workspace | B | Перейти к Order Builder | P0 | SPEC |
| SH-011 | Budget Planner | B | Применить бюджет | P1 | SPEC |
| SH-012 | Order Builder | B | Проверить заказ | P0 | SPEC |
| SH-013 | Order Validation | E | Отправить заказ | P0 | SPEC |
| SH-014 | Shop Order Registry | W | Открыть заказ | P0 | SPEC |
| SH-015 | Shop Order Detail | E | Принять revision | P0 | SPEC |
| SH-016 | Shop Revision Review | B | Подтвердить изменения | P0 | SPEC |
| SH-017 | DealSpace Campaign | S | Написать сообщение | P0 | SPEC |
| SH-018 | DealSpace Collection | S | Написать сообщение | P0 | SPEC |
| SH-019 | DealSpace Order | S | Написать сообщение | P0 | SPEC |
| SH-020 | Shop Calendar | W | Создать событие | P0 | SPEC |
| SH-021 | Buying Team Approval | E | Утвердить заказ | P1 | SPEC |
| SH-022 | Documents | W | Загрузить документ | P1 | SPEC |
| SH-023 | Shop Analytics | W | Открыть отчёт | P1 | SPEC |
| SH-024 | Team & Permissions | W | Пригласить пользователя | P0 | SPEC |
| SH-025 | Shop Settings | W | Сохранить настройки | P0 | SPEC |

## Shared system screens

| ID | Экран | Шаблон | Primary action | Приоритет | Статус |
|---|---|---|---|---|---|
| SY-001 | Sign in | F | Войти | P0 | SPEC |
| SY-002 | Organization onboarding | F | Продолжить | P0 | SPEC |
| SY-003 | User invitation | F | Принять приглашение | P0 | SPEC |
| SY-004 | Notifications Center | W | Открыть событие | P0 | SPEC |
| SY-005 | Global Search | F | Открыть результат | P1 | SPEC |
| SY-006 | Access Request | E | Отправить запрос | P1 | SPEC |
| SY-007 | Error / Recovery | F | Повторить | P0 | SPEC |

## Обязательная спецификация каждого экрана

Для каждой строки должен появиться отдельный файл в `docs/screens/` по шаблону:

```text
# [ID] Screen name

## User goal
## Entry points
## Exit points
## Data contract
## Layout
## Primary action
## Secondary actions
## Filters and search
## Table/card columns
## Inspector/drawer
## Empty state
## Loading state
## Error state
## Permissions
## Keyboard behavior
## Responsive behavior
## Analytics events
## Acceptance criteria
## Non-goals
```

## Правило готовности

Статусы:

- `SPEC` — экран только внесён в реестр;
- `DESIGNED` — готова полная screen-spec;
- `IMPLEMENTING` — Cursor выполняет задачу;
- `QA` — код завершён, идёт проверка;
- `DONE` — прошли unit, integration, e2e, responsive и UX review.
