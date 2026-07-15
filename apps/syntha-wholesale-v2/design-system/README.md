# Syntha Wholesale V2 — Design System

Эта папка содержит машинно-читаемую часть визуальной системы нового проекта.

## Source of truth

Human-readable specification:

```text
../docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md
```

Machine-readable contracts:

```text
tokens.json
responsive-contract.json
```

## Файлы

### `tokens.json`

Содержит:

- светлую цветовую палитру;
- typography scale для desktop, iPad и iPhone;
- spacing scale;
- radius и shadows;
- размеры buttons, inputs, tables и icons;
- shell dimensions;
- Order Builder dimensions;
- media ratios;
- обязательные visual rules.

### `responsive-contract.json`

Содержит:

- breakpoints;
- обязательные viewport для проверки;
- grid и page gutters;
- desktop/iPad/iPhone shell rules;
- Registry, Entity, Builder, Showroom и Split Communication templates;
- адаптацию Product Grid;
- адаптацию Showroom;
- адаптацию Order Builder;
- адаптацию DealSpace и Calendar;
- forbidden responsive approaches;
- responsive Definition of Done.

## Порядок реализации

Cursor должен:

1. Прочитать `../docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md`.
2. Проверить `tokens.json` и `responsive-contract.json`.
3. Сгенерировать runtime semantic tokens в отдельной foundation-задаче.
4. Реализовать primitives и canonical components.
5. Только после этого собирать продуктовые экраны.

## Правило расхождения

Если Markdown и JSON расходятся:

- не выбирать вариант самостоятельно;
- не продолжать UI implementation;
- исправить спецификацию отдельным commit;
- синхронно обновить Markdown и JSON.

## Запрещено

- использовать raw hex внутри feature components;
- создавать локальные palettes;
- создавать локальные breakpoint systems;
- использовать arbitrary font sizes;
- создавать новый button/card/table variant без изменения канонической документации;
- импортировать visual tokens из legacy Syntha;
- копировать UI JOOR или NuORDER буквально.

## Визуальная формула

```text
Структурность wholesale workspace
+ editorial presentation коллекций
+ спокойная нейтральная палитра
+ единый адаптивный язык Brand и Shop
+ лучший Showroom и Order Builder
```
