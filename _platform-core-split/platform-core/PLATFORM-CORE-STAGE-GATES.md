# Platform Core Stage Gates

Gate - это обязательная проверка перед переходом к следующему этапу.

## Gate 1 - Article Ready

Required:

```text
articleId, owner, category, SKU/variant/color/size grid,
materials, BOM draft, tech-pack fields, target cost/price,
sample requirement, certificates/material evidence, source/confidence.
```

Blocked by:

```text
missing category, size grid, material spec, owner, next action.
```

## Gate 2 - Collection Buyer Ready

Required:

```text
collectionId, season/drop, published articles, media/content readiness,
wholesale price, MOQ, terms, delivery window, buyer visibility,
orderability status, document/marking warnings.
```

Blocked by:

```text
not orderable article, missing price, missing visibility, missing delivery window.
```

## Gate 3 - Order Ready For Brand Review

Required:

```text
orderId, Shop account, counterparty, lines, quantities, prices,
discounts, size curve, terms, reserve/prebook state, delivery target,
documents needed, payment/net terms, buyer notes/chat thread.
```

Blocked by:

```text
no buyer, no lines, invalid quantity, unavailable reserve without backorder flag, terms not accepted.
```

## Gate 4 - Production Handoff Ready

Required:

```text
confirmed order, Brand decision, final quantities, article package,
BOM, material requirements, production deadline, manufacturer assignment,
document/payment blockers, override reasons.
```

Blocked by:

```text
order not confirmed, article package incomplete, no manufacturer, no due date.
```

## Gate 5 - Production Start Ready

Required:

```text
poId, routing, work centers, capacity, operation plan,
materials reserved or ETA, QC checklist, responsible manager,
calendar milestones.
```

Blocked by:

```text
missing materials, no operation plan, capacity conflict, no QC owner.
```

## Gate 6 - Supplier Ready

Required:

```text
materialRequestId/RFQ, supplier, material spec, quantity, price,
lead time, reserve/contract, certificate, delivery proof plan,
chat thread, deadline.
```

Blocked by:

```text
no supplier, no confirmed quantity, no lead time, missing certificate, date conflict.
```

## Gate 7 - Shipment Ready

Required:

```text
production complete, QC passed or approved exception, documents ready,
marking ready where required, packing list, route/carrier, ETA,
Shop notification, shipment calendar event.
```

Blocked by:

```text
QC failed, missing docs, unknown marking, no ETA, no delivery owner.
```

## Gate 8 - Closeout Ready

Required:

```text
delivery acknowledged, quantity accepted, claims resolved or open,
documents archived/exported, payment state, production variance,
supplier score update, lessons/next cycle.
```

Blocked by:

```text
delivery not acknowledged, unresolved claim, incomplete docs, unknown payment state.
```
