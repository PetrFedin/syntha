# Platform Core Archive Integration Rules

Архив не является источником runtime-зависимостей для Platform Core.

Если из архива берется идея, она должна быть переписана, адаптирована и встроена в текущую Platform Core-структуру.

## Главная цепочка

Любое восстановление из архива должно усиливать эту цепочку:

```text
article -> collection -> order -> brand confirmation/control -> production handoff
-> manufacturer production -> supplier materials/procurement -> shipment
-> delivery/acceptance -> closeout/learning
```

Сквозные слои:

```text
chat, calendar, documents, events, exceptions, SLA, audit trail
```

## Обязательная привязка

Перед интеграцией нужно заполнить:

```text
Archive source:
Recovered idea:
Target role:
Target pillar:
Target stage gate:
Target entity:
Action contract:
Event created:
Next owner:
Chat/calendar/document effect:
Visual pattern:
Validation:
Archive dependency removed:
```

Если хотя бы один пункт не заполнен, архивная идея не входит в Platform Core.

## Что нельзя делать

```text
нельзя импортировать файл из legacy-rest;
нельзя оставлять symlink на архив;
нельзя переносить старый UI как есть;
нельзя добавлять новую вкладку без allowed tab type;
нельзя добавлять кнопку без state change/event/owner;
нельзя добавлять длинный explanatory UI copy;
нельзя возвращать admin/academy/client/runway/home/social как core surface;
нельзя добавлять archive code в /platform route.
```

## Как правильно забирать идею

1. Открыть только конкретный архивный файл или зону.
2. Выписать полезную механику: schema, calculation, document rule, RFQ rule, QA rule, import/export contract, acceptance scenario.
3. Проверить, какой роли это помогает:

```text
Brand
Shop
Manufacturer
Supplier
```

4. Проверить, в какой столп это входит:

```text
development
sample_collection
collection_order
order_production
comms
```

5. Проверить stage gate:

```text
G1 Article Ready
G2 Collection Buyer Ready
G3 Order Ready For Brand Review
G4 Production Handoff Ready
G5 Production Start Ready
G6 Supplier Ready
G7 Shipment Ready
G8 Closeout Ready
```

6. Переписать идею в активный runtime:

```text
_ai-share/synth-1-full/src/app/platform
_ai-share/synth-1-full/src/lib/platform-core-*
_ai-share/synth-1-full/src/lib/platform-core-readiness-sections
_ai-share/synth-1-full/src/components/... only if already Platform Core-related
```

7. Подключить к:

```text
PLATFORM_CORE_ACTION_CONTRACTS
PLATFORM_CORE_STAGE_GATES
readiness section
source-links map if runtime file becomes active
acceptance/smoke test when available
```

8. Обновить visual/copy:

```text
короткие названия;
спокойный интерфейс;
без маркетинговых блоков;
без nested cards;
без long descriptions;
one clear primary action;
secondary actions in compact controls;
mobile/iPad/MacBook readable.
```

9. Проверить, что архив больше не нужен:

```text
no import from legacy-rest;
no symlink to archive;
no broad archive folder in source-links;
no archive route in /platform;
archive stays ignored by Cursor.
```

## Что можно брать из архива

Можно брать только идею, схему или acceptance-сценарий:

| Archive idea | Platform Core destination |
| --- | --- |
| BOM/costing logic | Brand development, Manufacturer production, Supplier order_production |
| RFQ/supplier scorecard | Supplier order_production, Manufacturer material request |
| DPP/material passport | Article material evidence, shipment documents, closeout |
| Import/export contracts | Order, article, BOM, RFQ, shipment export |
| Old order workflow tests | Platform Core acceptance scenarios |
| PLM workflow tests | Article -> collection -> handoff gates |
| Invoice/compliance tests | RU operating packet, closeout |
| Attribute/fit schemas | Article development, size grid, sample feedback |
| ETA/risk/compliance ideas | Shipment, exceptions, SLA, calendar |

## Что должно оставаться закрытым

```text
admin UI;
academy;
consumer client tools;
wardrobe;
runway;
home/marketing;
broad AI UI;
social/community;
global distributor UI unless rewritten for supplier/material flow.
```

## Definition of Done

Архивная идея считается встроенной только если:

```text
она работает внутри одной роли/столпа/этапа;
есть clear action;
есть required fields;
есть event/output;
есть next owner;
есть chat/calendar/document side effect if cross-role;
визуал соответствует Platform Core;
нет archive import/link;
есть запись в docs/action log.
```
