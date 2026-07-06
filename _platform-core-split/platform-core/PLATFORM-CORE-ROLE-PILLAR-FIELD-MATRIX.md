# Platform Core Role Pillar Field Matrix

Минимальные поля, без которых роль/столп не должны считаться готовыми.

| Role | Pillar | Required field groups |
| --- | --- | --- |
| Brand | development | article identity, category, variants, size grid, materials, BOM draft, tech pack, cost target, sample plan, owner, version |
| Brand | sample_collection | collection identity, publish state, article readiness, media, wholesale price, MOQ, delivery window, buyer visibility, terms |
| Brand | collection_order | order review, buyer/counterparty, line quantities, amendments, reserve/backorder, terms, payment/doc readiness |
| Brand | order_production | confirmed order, handoff package, poId, manufacturer, BOM/material gaps, shipment/doc readiness, MRP summary |
| Brand | comms | order/article/PO threads, decision templates, calendar commitments, escalation owner |
| Shop | development | buyer-safe article view, missing commercial data, clarification request, Brand owner |
| Shop | sample_collection | collection discovery, assortment board, readiness badges, add-to-order, terms view |
| Shop | collection_order | size curve, multi-door allocation, budget, validation, reserve/backorder, order submit |
| Shop | order_production | buyer-safe status, ETA, shipment, receiving, claims, documents |
| Shop | comms | order inbox, amendment decisions, delivery tasks, document requests, claim thread |
| Manufacturer | development | producibility, tech-pack gaps, sample feedback, capacity preview, material feasibility |
| Manufacturer | sample_collection | sample task, fit/quality feedback, material feasibility, brand review event |
| Manufacturer | collection_order | confirmed demand context, PO wait state, no buyer negotiation ownership |
| Manufacturer | order_production | routing, operation tickets, capacity, materials gate, QC, photo proof, shipment readiness |
| Manufacturer | comms | PO inbox, issue escalation, supplier material thread, Brand decision request |
| Supplier | development | material options, certification, lead time, alternatives, sample material support |
| Supplier | sample_collection | swatch/sample material request, small batch readiness, certificate status |
| Supplier | collection_order | forecast/reserve context, no buyer order ownership |
| Supplier | order_production | RFQ, quote, reserve, contract, dispatch, delivery proof, certificate, delay reason |
| Supplier | comms | RFQ inbox, quote clarification, substitution approval, certificate request, delivery exception |

## Rule

Если новое поле не относится к этой матрице, оно должно быть либо доказано как required для gate, либо оставлено в archive/advanced.
