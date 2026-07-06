# Platform Core UI Standard

Короткий стандарт оформления Platform Core.

## Основной принцип

Platform Core - это рабочая операционная система, не landing page и не демонстрация всех возможностей.

На экране должны оставаться только:

- состояние;
- источник данных;
- следующий шаг;
- ответственная роль;
- действие;
- результат.

## Запрещено

- Длинные описания.
- Разные стили карточек в разных ролях.
- Большие hero-блоки.
- Декоративные графики.
- Больше одной primary action на блок.
- Вложенные карточки.
- Повторяющиеся context strips.
- Demo-блоки без badge.
- Маршруты, которые не ведут к действию или результату.

## Разрешено

- Compact matrix 4×5.
- Master-detail layout.
- Drawer для section details.
- Short status badges.
- One primary action.
- One secondary action.
- Timeline.
- Source badge.
- Owner badge.

## Цвет и визуальный тон

- Фон: нейтральный.
- Акцент: один спокойный цвет.
- Статусы: muted green / amber / red / gray.
- Карточки: radius до 8px.
- Тени: минимальные.
- Типографика: компактная, без крупного hero-scale внутри app.
- Иконки: только для действий и статусов.

## Компонентная структура

```text
PlatformShell
  PlatformHeader
  RoleSwitcher
  PillarTabs
  CoreMatrix
  CellDetailDrawer
  EntityTimeline
```

## Ячейка

```text
Role + Pillar
Status
Score
Source
Primary action
Next event
```

Максимум 2 строки описания. Если требуется больше - это drawer, а не cell.

## Section drawer

```text
Title
Short meaning
Current state
Primary action
Secondary action
Last event
Owner
Source
Problem
Next fix
```

## Responsive

### iPhone

- Один столбец.
- Role switcher сверху.
- Pillars as tabs.
- Cell list вместо большой таблицы.
- Drawer fullscreen.

### iPad

- Master-detail.
- Слева role/pillar list.
- Справа selected section.

### MacBook

- 4×5 matrix.
- Right side detail drawer.
- Bottom trace strip.

## Copywriting

Писать коротко:

- "Заказ ожидает подтверждения"
- "Передать в производство"
- "Материалы подтверждены"
- "Открыть трекинг"
- "Написать по заказу"

Не писать:

- длинные объяснения платформы;
- инвесторские обещания;
- "уникальная система";
- "революционный модуль";
- любые тексты без действия.
