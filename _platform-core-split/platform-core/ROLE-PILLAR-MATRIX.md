# Role × Pillar Matrix

Текущая матрица Platform Core по данным `platform-core-readiness-sections`.

## Активные ячейки

| Роль | Столп | Разделов | Средняя static | Средняя live | Состояние |
| --- | --- | ---: | ---: | ---: | --- |
| Brand | development | 6 | 7.2 | 7.3 | Активно |
| Brand | sample_collection | 5 | 7.1 | 7.2 | Активно |
| Brand | collection_order | 5 | 7.2 | 7.4 | Активно |
| Brand | order_production | 5 | 7.1 | 7.4 | Активно |
| Brand | comms | 6 | 7.2 | 7.4 | Активно |
| Shop | sample_collection | 4 | 7.2 | 7.4 | Активно |
| Shop | collection_order | 6 | 7.5 | 7.5 | Активно |
| Shop | order_production | 4 | 7.2 | 7.3 | Активно |
| Shop | comms | 4 | 7.2 | 7.4 | Активно |
| Manufacturer | development | 4 | 7.2 | 7.3 | Активно |
| Manufacturer | order_production | 5 | 7.2 | 7.5 | Активно |
| Manufacturer | comms | 4 | 7.3 | 7.5 | Активно |
| Supplier | development | 4 | 7.1 | 7.3 | Активно |
| Supplier | order_production | 5 | 7.0 | 7.4 | Активно |
| Supplier | comms | 4 | 7.1 | 7.4 | Активно |

## Read-only insight ячейки

| Роль | Столп | Разделов | Средняя static | Средняя live | Почему не активная |
| --- | --- | ---: | ---: | ---: | --- |
| Shop | development | 4 | 7.3 | 7.4 | Магазин смотрит разработку бренда, но не редактирует ее. |
| Manufacturer | sample_collection | 3 | 7.2 | 7.3 | Производство видит контекст коллекции, но не управляет витриной. |
| Manufacturer | collection_order | 3 | 7.2 | 7.3 | Производство ожидает PO/handoff, но не формирует B2B заказ. |
| Supplier | sample_collection | 2 | 7.3 | 7.3 | Поставщик видит BOM/peer context, но не управляет витриной. |
| Supplier | collection_order | 2 | 7.3 | 7.3 | Поставщик видит forecast/peer context, но не формирует заказ. |

## Практический вывод

Brand и Shop сейчас самые плотные. Manufacturer и Supplier уже встроены в цепочку, но им нужна более жесткая связка через `orderId`, `poId`, materials, WMS/SSE и единый E2E поток.
