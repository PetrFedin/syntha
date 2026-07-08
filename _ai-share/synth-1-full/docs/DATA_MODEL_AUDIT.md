# Data Model Audit — Platform Core Phase 20

**Дата:** 2026-07-08  
**Canonical SoT:** Workshop2 PostgreSQL (5433) + `src/lib/server/workshop2-*`, `platform-core-*`  
**Secondary:** FastAPI SQLAlchemy (5432) — parallel, не write-path для PC spine

## Единственный canonical implementation

| Entity | Canonical | Дубликаты (archive/extended) | Merge |
|--------|-----------|------------------------------|-------|
| Article | `workshop2_articles` + `workshop2_dossiers` | `lib/production/*`, FastAPI `/product` | W2 only write |
| Sample | `workshop2_sample_orders` | FastAPI SampleOrder, demo seeds | port-only |
| Collection | `workshop2_collections` | CollectionDrop, overlays | collections = master |
| Wholesale Order | `workshop2_b2b_orders` | FastAPI Order, `lib/b2b/*` | W2 only write |
| Fulfillment | W2 handoff/PO lifecycle | factory models | spine PG |
| Communication | `workshop2_contextual_messages` | collaboration, wholesale messages | contextual PG |
| Organization | FastAPI `organizations` | FK on W2 tables | org in auth PG |
| Brand/Shop | role × org + `brand_*`/`shop_*` | `lib/brand`, `lib/b2b` | role overlays |
| Calendar | `platform_core_user_calendar_tasks` | FastAPI tasks, kanban | PC calendar tables |
| Inventory | shop ledger + WMS + brand overlay | FastAPI VMI | document layers |
| BOM | `brand_supplier_bom_lines` | FastAPI BOM, production calc | PG + dossier mirror |
| Materials | `workshop2_ref_materials`, requisitions | MaterialMaster | ref IDs unified |
| Documents | `workshop2_vault_documents` | PLM routes | vault canon |
| Pricing | `brand_pricelist_versions` | `/pricing` calculator | pricelist PG |
| Media | FastAPI DAM | dossier pointers | DAM blobs, dossier refs |

## Target entity graph

```
Organization → role (brand|shop|mfr|supplier)
  → workshop2_collections → workshop2_articles (+ dossiers)
    → sample_orders → b2b_orders → production handoff
  → contextual_messages, calendar_tasks, brand_*/shop_* overlays
```

## P0 issues

1. Split-brain W2 vs FastAPI for Order/Article — Phase 21
2. `lib/b2b/*` parallel logic — collapse via ports Phase 22
3. Dossier JSON vs tables drift — schema validation Phase 23

См. `docs/API_AUDIT.md`, ADR-002.
