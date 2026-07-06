# Platform Core Production Depth Spec

Production depth нужен, чтобы Platform Core не был только статусными бейджами.

## Required Concepts

```text
MPS/MRP planning;
BOM and material requirements;
make/buy/subcontract decision;
work centers;
capacity planning;
routing;
operation tickets;
time recording;
quality checkpoints;
waste/defect capture;
batch/serial/lot traceability;
barcode/QR/GS1 readiness;
photo proof;
offline/tablet field mode;
variance report.
```

## Role Ownership

| Role | Ownership |
| --- | --- |
| Brand | sees handoff, PO, MRP summary, blockers, deadlines, shipment/doc readiness |
| Manufacturer | owns routing, capacity, operation tickets, QC, photo proof, production variance |
| Supplier | owns RFQ, material reserve, certificate, dispatch, delay reason |
| Shop | sees buyer-safe ETA, shipment, receiving, claims, documents |

## Minimum P1 Build

1. Add production gate state to order/PO.
2. Add material shortage state.
3. Add operation plan summary.
4. Add QC pass/fail/exception.
5. Add shipment readiness.
6. Add variance on closeout.

## Not Allowed

```text
generic "in production" with no owner;
production dashboard with no PO;
QC badge without checklist;
supplier state without material request;
ETA without source/confidence.
```
