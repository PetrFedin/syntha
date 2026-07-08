# Platform Core Contract — Phase 20 (Final)

**Status:** Active constitution for all new work  
**Version:** 1.0 — 2026-07-08  
**Supersedes:** ad-hoc Workshop2 UI paths, `lib/routes` in PC components

---

## 1. Единственная архитектура

```
                    ┌─────────────────┐
                    │  /platform hub  │
                    └────────┬────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   /brand/core         /shop/core      /factory/*/core (extended)
   ?pillar=×5          ?pillar=×5       ?pillar=×5
         │                   │                   │
         └─────────┬─────────┴───────────────────┘
                   ▼
         Golden path (G1–G8): article → closeout
                   ▼
    PG 5433 (workshop2_*) + BFF /api/platform-core/*
```

**Extended products** (B2C, academy, wardrobe, marketing) = archive — never import into Ring A.

---

## 2. Две baseline-роли × пять столпов

| Role | Pillars |
|------|---------|
| **brand** | development, sample_collection, collection_order, order_production, comms |
| **shop** | same five (shop-specific peers) |

Extended (not baseline bundle): **manufacturer**, **supplier** — `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`

---

## 3. Главные сущности

| Entity | ID / table | Owner pillar |
|--------|------------|--------------|
| Article | workshop2_articles | development |
| Sample | workshop2_sample_orders | development → sample_collection |
| Collection | workshop2_collections | sample_collection |
| Wholesale order | workshop2_b2b_orders | collection_order |
| Production order | W2 lifecycle / handoff | order_production |
| Message thread | workshop2_contextual_messages | comms |
| Calendar task | platform_core_user_calendar_tasks | comms |

**Article — центральная сущность** (ADR-002). All pillars reference collectionId + articleId/orderId.

---

## 4. Главные события (chain)

- Article created / dossier updated
- Sample dispatched / factory ack
- Linesheet / showroom publish
- B2B order placed / imported
- Handoff to production / PO created
- Materials supplied / inventory reserved
- Shipment / closeout

Each event → optional side effects: **chat thread**, **calendar entry**, **notification**, **document vault**.

---

## 5. Главные связи (horizontal)

| Layer | Mechanism |
|-------|-----------|
| Chat | contextual messages + section groups |
| Calendar | platform_core_user_calendar_tasks |
| Documents | vault + dossier versions |
| Notifications | platform_core_notification_events |
| Registry SSE | b2b registry-stream |

---

## 6. Главные API

| Tier | Surface |
|------|---------|
| Core BFF | `/api/workshop2/platform-core/*`, `/api/platform-core/*` |
| Core FastAPI | baseline_router (`PLATFORM_CORE_BASELINE=true`) |
| Extended | extended_router + factory BFF |
| Archive | denylist + `/platform?archived=1` |

---

## 7. Главные компоненты

| Layer | Path |
|-------|------|
| Hub | `RoleCoreCabinetHub`, `PlatformHubPageClient` |
| Pillar insight | `RoleCorePillarInsightCards` → `pillars/*` |
| Workspaces | `workspaces/*CabinetWorkspace` |
| Primitives | `PillarInsightPrimitives`, `PillarCabinet*` shell |

---

## 8. Главные документы

| Doc | Purpose |
|-----|---------|
| This contract | Constitution |
| `PLATFORM_CORE_MANIFEST.md` | Inventory |
| `docs/adr/*` | Decision records |
| `_platform-core-split/platform-core/CURSOR-START-HERE.md` | Agent entry |
| `PLATFORM-CORE-STAGE-GATES.md` | G1–G8 |
| `PLATFORM-CORE-ACTION-CONTRACTS.md` | Button semantics |

---

## 9. Rules for new features

1. Must map to role × pillar × section-id
2. Must use ports — no direct `lib/b2b|production|factory` in Ring A
3. Must add action contract before UI button
4. Must not expand ROUTES in baseline without ADR
5. Extended-only features → extended routes + dynamic import only

---

## 10. Quality score (Phase 20)

| Area | Score | Excellent | Improve | Do not touch |
|------|------:|-----------|---------|--------------|
| Architecture | 8 | 3-layer routes, ports, baseline flag | split-brain PG, hub-matrix size | golden path model |
| Frontend | 7 | pillar lazy chunks, cabinet shell | 60 PeerStrips, top-3 giants | `/platform` hub UX |
| Backend | 7 | baseline router flag | FastAPI/W2 order dup | JWT auth module |
| API | 7 | BFF gateways | duplicate template paths | workshop2 BFF spine |
| Navigation | 8 | native-href coercion | `/shop/b2b-orders` gap | strict allowlist |
| State | 7 | minimal context | dual snapshot pipelines | demo-context isolation |
| Performance | 8 | Phase 19 pillar split | hub-matrix in baseline | dynamic workspaces |
| Types | 6 | pillar snapshot union | 3 snapshot shapes | CoreChainRoleId enum |
| Testing | 7 | boundaries test | e2e golden full matrix | strict-routes unit tests |
| Scalability | 7 | ports pattern | monolithic hub-matrix | PG as SoT |
| Maintainability | 7 | docs + ADR start | archive imports in platform | planner dev API |
| Technical debt | 6 | legacy isolated | lib/b2b collapse, 12 archive imports | — |

**Overall Platform Core readiness: 7.2/10** — architecture foundation solid; debt is transitional layers, not wrong direction.

См. `docs/TECHNICAL_ROADMAP.md` для Phase 21+.
