# Platform Core Russian Operating Packet

Российский контур должен быть частью order/PO/shipment, а не отдельной справкой.

## Required Per Order / PO / Shipment

```text
counterparty;
contract/specification;
invoice;
UPD;
waybill;
act if needed;
invoice-factura if needed;
certificate/declaration;
marking requirement;
DataMatrix/GTIN/label state;
ЭДО status;
1C/МойСклад export status;
payment/bank import status;
document owner;
official source/date for compliance assumptions.
```

## Where It Appears

| Role | Pillar | Visibility |
| --- | --- | --- |
| Brand | collection_order | terms, counterparty, docs needed, payment readiness |
| Brand | order_production | PO docs, marking, ЭДО, 1C/МойСклад export, shipment docs |
| Shop | collection_order | terms, payment, docs expected |
| Shop | order_production | receiving docs, UPD/waybill, claim docs |
| Manufacturer | order_production | production docs, QC docs, shipment packet |
| Supplier | order_production | certificates, invoice, waybill, delivery proof |

## Rule

Если compliance assumption зависит от закона, маркировки или ЭДО, не хардкодить память. Зафиксировать official source/date и сделать поле editable/verified.
