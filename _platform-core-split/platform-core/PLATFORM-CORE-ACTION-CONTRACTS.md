# Platform Core Action Contracts

Каждая кнопка или primary action в Platform Core должна иметь контракт.

## Template

```text
Action:
Role:
Pillar:
Entity:
Intent:
Required fields:
Preconditions:
Blocking conditions:
Allowed states before:
State after success:
Event created:
Chat/calendar/document side effect:
Next owner:
Next route:
Failure states:
Recovery action:
Mobile behavior:
Desktop behavior:
```

## P0 Actions

| Action | Role | Pillar | Required output |
| --- | --- | --- | --- |
| Создать артикул | Brand | development | `article.created`, owner Brand, articleId, next gate Article ready |
| Заполнить ТЗ | Brand | development | article package, BOM draft, tech-pack state, source/confidence |
| Запросить уточнение по артикулу | Shop | development | entity chat thread, clarification task, Brand owner |
| Проверить производимость | Manufacturer | development | producibility verdict, blockers, sample/material request |
| Предложить материал | Supplier | development | material option, price/lead time/certificate status |
| Опубликовать коллекцию | Brand | sample_collection | `collection.published`, buyer visibility, linesheet/showroom state |
| Открыть коллекцию | Shop | sample_collection | buyer-safe collection view, add-to-order action |
| Передать sample feedback | Manufacturer | sample_collection | sample feedback event, Brand review task |
| Подтвердить material sample | Supplier | sample_collection | material sample readiness, certificate state |
| Собрать матрицу заказа | Shop | collection_order | working order draft, quantities, size curve, budget check |
| Отправить заказ бренду | Shop | collection_order | `order.submitted`, orderId, Brand inbox item |
| Подтвердить заказ | Brand | collection_order | `order.confirmed`, production handoff candidate |
| Запросить изменение заказа | Shop | collection_order | amendment request, Brand decision task |
| Передать в производство | Brand | order_production | production handoff, poId/poDraft, Manufacturer owner |
| Принять PO в работу | Manufacturer | order_production | production order state, routing/capacity/material gates |
| Запросить материал | Manufacturer | order_production | material request/RFQ, Supplier owner, due date |
| Подтвердить резерв | Supplier | order_production | material reserve, lead time, certificate/document status |
| Отметить QC | Manufacturer | order_production | QC result, exception or shipment readiness |
| Подтвердить отгрузку | Manufacturer/Supplier | order_production | shipment event, document packet, ETA |
| Принять поставку | Shop | order_production | receiving result, discrepancy/claim or closeout |
| Открыть чат по сущности | All | comms | entity-linked thread, not generic chat |
| Создать календарное событие | All | comms | entity-linked deadline/task, owner, reminder |
| Зафиксировать решение | All | comms | decision ledger event, author, timestamp, next owner |

## Required rule

Если действие не может заполнить `State after success`, `Event created` и `Next owner`, его нельзя делать primary action.
