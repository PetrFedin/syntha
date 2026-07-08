# Phase 22 — Platform Core Product Consolidation Audit
## Brand + Shop Baseline (SS27/FW27)

**Дата:** 2026-07-08  
**Scope:** роли `brand`, `shop` × 5 столпов (`development`, `sample_collection`, `collection_order`, `order_production`, `comms`)  
**Режим:** `NEXT_PUBLIC_PLATFORM_CORE_MODE=1`, demo-коллекции SS27/FW27, контраст EMPTY27  
**Golden path:** `article → collection → order → production → supplier → shipment → closeout`  
**Метод:** code review + readiness sections (`brand-audit.ts`, `shop-audit.ts`) + hub matrix + e2e core-* smoke  
**Статус:** doc-only audit — **без реализации** (Phase 23 backlog)

---

## 1. Executive Answer

**Может ли brand+shop пройти полный цикл без Excel/WhatsApp?**

| Контекст | Ответ |
|----------|-------|
| **SS27 investor demo** | **Частично да** — guided walkthrough на `/platform` + кабинеты `/brand/core`, `/shop/core` закрывают happy-path: артикул → лайншит → publish → showroom → matrix → checkout → order registry → tracking peers |
| **Commercial rollout (оптовый магазин)** | **Нет** — revision вне flow, QC/packing/closeout stub, comms без entity `collection`, documents-gateway не подключён к UI, нет единого DataTable |

### Критические blockers (commercial)

1. **ORDER PRODUCTION (6.9)** — fulfillment chain обрывается на handoff/QC: cut ticket, packing list, closeout — UI peers без PG write-back; shop tracking read-only stub.
2. **Revision вне 12-step CO flow** — shop revision request не встроен в golden path cabinet; brand видит revision через side-panel, не через pillar workspace.
3. **Publish не в hub cabinet** — publish/release живёт в workspace section `brand-sc-publish`, не как primary CTA hub-кабинета sample_collection.
4. **Comms без collection entity** — threads привязаны к `article|order`, нет сквозного чата коллекции SS27.
5. **Documents-gateway** — `getPlatformCoreDocumentsForArticle` экспортирован, UI dossier не wired.
6. **Duplicate actions** — Publish/Approve/Export размазаны по 4+ поверхностям (hub/cabinet/workspace/legacy merch).
7. **Нет canonical DataTable** — 3 разных EmptyState, таблицы на `@tanstack/react-table` без единого контейнера на core-path.

---

## 2. Pillar Summary Matrix

| Столп | Brand readiness | Shop readiness | Cross-link | Avg score | SS27 demo | Commercial |
|-------|-----------------|--------------|------------|-----------|-----------|------------|
| **DEVELOPMENT** | 7.6 | 7.4 (read-only bridge) | brand→shop dossier preview | **7.5** | ✅ | ⚠️ shop read-only |
| **SAMPLE COLLECTION** | 8.0 | 7.6 (post-publish) | publish→showroom | **7.8** | ✅ | ⚠️ publish off-hub |
| **COLLECTION ORDER** | 7.8 | 8.0 | matrix→checkout→registry | **7.6** | ✅ | ⚠️ revision off-flow |
| **ORDER PRODUCTION** | 6.8 | 7.0 | dossier→handoff→tracking | **6.9** | ⚠️ | ❌ |
| **COMMUNICATION** | 7.4 | 7.0 | article\|order threads | **7.2** | ⚠️ | ❌ no collection |
| **Overall product** | — | — | — | **7.4/10** | partial | no |

---

## 3. DEVELOPMENT

**Lifecycle (канон):** `Article → Tech Pack → Materials → BOM → Sample → Approval → Ready`

### Brand (W2 hub)

| Этап | Статус | Evidence |
|------|--------|----------|
| Article create | ✅ PG + wizard | `brand-w2-create-article-btn`, core-37/104 e2e |
| Tech Pack / TZ | ✅ export PDF | core-52, `BrandOpAttachTzPdfPeerStrip` |
| Materials / BOM | ⚠️ peers only | factory materials href, no inline BOM editor on core-path |
| Sample | ✅ SSE status | `brand-w2-sample-status-sse-live` |
| Approval | ⚠️ dossier signatory | `dossier-readiness-engine`, partial TZ bindings |
| Ready → SC | ✅ golden path strip | `brand-sample-lifecycle-golden-path-strip` |

### Shop (read-only bridge)

- `ShopDevelopmentBridge` — dossier preview dialog, wishlist PG, sample request → brand notification (core-31/107/163/185).
- **Осознанно read-only** — shop не создаёт артикулы; monetization peers (matrix/checkout/tracking) через CRM strip.

### Gaps

| ID | Gap | Severity |
|----|-----|----------|
| DEV-G1 | BOM inline edit только через legacy W2, не core workspace | P1 |
| DEV-G2 | Approval TZ signatory — poll, без push notification prod | P1 |
| DEV-G3 | Shop bridge — no write path for tech pack comments | P2 |
| DEV-G4 | Materials procurement peer ведёт на factory cabinet, не shop view | P2 |

**Scores:** brand static 7.2 → live 7.6; shop static 7.2 → live 7.4; **pillar avg 7.5**

---

## 4. SAMPLE COLLECTION

**Flow:** `linesheet → showroom → publish → shop visibility`

### Brand

| Surface | Компонент | Статус |
|---------|-----------|--------|
| Linesheets | `brandLinesheetsHrefForDemo` | ✅ |
| Showroom | `BrandSampleCollectionMini`, showroom peers | ✅ |
| Publish | `BrandScPublishReleasePeerStrip`, `BrandReleasePublishAuditPanel` | ⚠️ workspace-only |
| Release audit | publish count sync badge | ✅ core e2e |

### Shop (post-publish)

- `PlatformCorePublishedShowroom` — hero from dossier, published articles grid.
- Shop SC доступен **только после publish** brand release.

### Gaps

| ID | Gap | Severity |
|----|-----|----------|
| SC-G1 | **Publish не в hub cabinet** — CTA в workspace section, не в `RoleCoreCabinetHub` pillar card | P0 |
| SC-G2 | Published count sync badge — hub noise (wave-yt pass2 suppress partial) | P2 |
| SC-G3 | Shop showroom — no pre-publish teaser/waitlist | P2 |
| SC-G4 | Linesheet export PDF дублирует merch export | P1 |

**Scores:** brand 8.0, shop 7.6; **pillar avg 7.8**

---

## 5. COLLECTION ORDER

**12-step flow (brand CO cabinet):**

1. Assortment matrix  
2. Size run / SKU grid  
3. MOQ validation  
4. Price list attach  
5. Ship window  
6. Shop matrix view  
7. Cart / draft order  
8. Checkout submit  
9. Order registry (brand)  
10. Order registry (shop)  
11. Revision request (shop, **off-flow**)  
12. Production handoff trigger  

### Shop CO score: **8.0**

- `CollectionOrderPillarCard` — cart qty badge, golden path to orders/tracking.
- `shop-co-cabinet-cta-orders` peers wired.

### Gaps

| ID | Gap | Severity |
|----|-----|----------|
| CO-G1 | **Revision outside 12-step** — shop revision не в pillar strip sequential flow | P0 |
| CO-G2 | Credit/limit check — stub YuKassa, no Stripe | P1 |
| CO-G3 | Multi-ship-window per order — single window only | P2 |
| CO-G4 | Brand CO registry ↔ shop cart — eventual consistency badge only | P2 |

**Scores:** brand 7.8, shop 8.0; **pillar avg 7.6**

---

## 6. ORDER PRODUCTION

**Fulfillment chain:** `order → dossier → factory handoff → QC gate → cut ticket → packing → shipment → closeout`

### Brand OP

- `BrandOpDossierProductionPeerStrip` — chain/handoff/QC/cut-ticket/mfr-QC/shop-tracking peers.
- Dossier canonical via W2 `Workshop2DossierPhase1`.

### Shop OP

- `ShopCoCabinetTrackingEmbed` — tracking read-only embed.
- Registry peers to production context.

### Gaps (weakest pillar)

| ID | Gap | Severity |
|----|-----|----------|
| OP-G1 | **QC gate** — peer link only, no PG status write | P0 |
| OP-G2 | **Packing list** — UI placeholder, no BFF | P0 |
| OP-G3 | **Closeout** — absent from shop cabinet | P0 |
| OP-G4 | Cut ticket — factory-side only, brand read | P1 |
| OP-G5 | Shipment tracking — stub poll, no carrier API | P1 |
| OP-G6 | Handoff queue — brand sees registry, factory ack partial | P1 |

**Scores:** brand 6.8, shop 7.0; **pillar avg 6.9** (weakest)

---

## 7. COMMUNICATION

**Entity model:** `article | order` — **нет `collection` entity**

### Brand / Shop comms workspace

- `PlatformCoreCommsWorkspaceExtras` — slim banner, id заказа.
- Messages context: `brandMessagesWorkshop2ArticleContextHref`, `brandMessagesB2bOrderContextHref`, shop mirrors.
- Calendar peers on order/article context.

### Gaps

| ID | Gap | Severity |
|----|-----|----------|
| COM-G1 | **No collection-level thread** — SS27 season chat impossible | P0 |
| COM-G2 | Notes href (`platformCoreCommsNotesHref`) — doc-only peer | P1 |
| COM-G3 | Push notifications — browser Notification API dev-only | P1 |
| COM-G4 | Section groups — matrix defines, UI partial | P2 |

**Scores:** brand 7.4, shop 7.0; **pillar avg 7.2**

---

## 8. Cross-Pillar Links

### Forward links (happy path)

```
development.ready ──→ sample_collection.linesheet
sample_collection.publish ──→ shop.showroom
sample_collection.publish ──→ collection_order.matrix
collection_order.checkout ──→ collection_order.registry
collection_order.registry ──→ order_production.dossier
order_production.handoff ──→ order_production.tracking
* ──→ comms (article|order context)
```

### Reverse links

| From | To | Status |
|------|----|--------|
| shop.tracking | brand OP dossier | ✅ peer strip |
| shop.sample_request | brand DEV notification | ✅ API |
| brand.publish | shop showroom | ✅ PG hydrate |
| order.revision | brand CO | ⚠️ side-panel, not pillar |

### Dead ends

| Node | Problem |
|------|---------|
| `factory.materials` | Peer from brand DEV, shop cannot view |
| `documents-gateway` | Exported, no UI consume |
| `collection` (comms) | Entity undefined |
| `closeout` | No reverse link to shop CO |
| `revision` | No forward link back into 12-step |

---

## 9. Duplicate Actions

| Action | Surfaces | Canonical target | Duplicates |
|--------|----------|------------------|------------|
| **Publish** | hub matrix tooltip, SC workspace, `BrandReleasePublishAuditPanel`, merch legacy | SC workspace `brand-sc-publish` | hub tooltip CTA, merch panel |
| **Approve (sample/TZ)** | W2 dossier, DEV hub SSE, factory peer | dossier signatory engine | hub badge, separate TZ export |
| **Export (PDF)** | TZ PDF, linesheet, investor brief, brief.pdf | pillar workspace primary | 4+ export buttons same collection |
| **Export (matrix)** | CO matrix, shop cart, registry CSV | CO workspace | registry + cart |
| **Create order** | shop matrix CTA, cart checkout, registry «new» | checkout flow | registry orphan CTA |
| **Open chat** | comms workspace, order detail banner, messages legacy | `PlatformCoreCommsWorkspaceExtras` | `BrandMessagesRuWorkspaceBannerWhenNoUrl` (suppressed core) |
| **Track shipment** | shop tracking embed, OP peer, legacy b2b tracking | shop CO tracking section | OP peer duplicate |

**Recommendation Phase 23:** enforce `platform-core-ui-surfaces.ts` — one primary CTA per action per surface tier.

---

## 10. Forms Consolidation Notes

| Form cluster | Locations | Issue | Target |
|--------------|-----------|-------|--------|
| Create article wizard | W2 hub modal | OK canonical | keep |
| Sample request | shop DEV bridge | isolated | link to COM thread |
| Checkout / cart | shop CO workspace | OK | add revision inline |
| TZ signatory | dossier panel | legacy W2 chrome | migrate to core workspace form |
| Publish release | SC publish section + merch audit | **duplicate** | single `PublishReleaseForm` |
| Revision request | shop side drawer | **off-flow** | embed in CO step 11 |
| Order note (v1) | operational panel | OK v1 API | expose on core-path |

**Principle:** один form component на domain action; variants через `compact|full` prop, не copy-paste.

---

## 11. TABLES

**Finding:** нет canonical `DataTable` на Platform Core path.

| Implementation | Path | Used on core |
|----------------|------|--------------|
| `@tanstack/react-table` ad-hoc | various B2B/registry | partial |
| `DataTableContainer` (design-system) | `components/design-system` | **not wired core** |
| Registry tables | brand/shop order registries | custom markup |

### EmptyState components (3)

1. `components/design-system/empty-state.tsx` — design-system canonical  
2. `components/ui/empty-state.tsx` — ui layer duplicate  
3. `components/ui/empty-state-b2b.tsx` — B2B-specific  
4. (+ `components/user/shared/empty-state.tsx` — user cabinet, 4th variant)

**Recommendation:** adopt `DataTableContainer` + single `EmptyState` from design-system on all core workspaces; deprecate b2b/ui duplicates.

---

## 12. FILES

### Dossier (canonical)

- Types: `lib/production/workshop2-dossier-phase1.types.ts`
- Readiness: `lib/production/dossier-readiness-engine.ts`
- UI peers: `BrandOpDossierProductionPeerStrip`, `BrandOpAttachTzPdfPeerStrip`
- Factory context: `factoryProductionDossierHref`, `factoryProductionDossierContextHref`

### Documents-gateway (not wired UI)

- Gateway: `lib/platform-core-gateways/documents-gateway.ts`
- Export: `lib/platform-core-gateways/index.ts` → `getPlatformCoreDocumentsForArticle`
- **Gap:** no consumer in `components/platform/*`; dossier preview uses W2 direct, not gateway.

**Phase 23:** wire gateway into dossier workspace panel; single SoT for article documents on core-path.

---

## 13. DESIGN SYSTEM

### Canonical chrome

| Token | Source | Usage |
|-------|--------|-------|
| `hubCabinet` | `lib/platform-core-cabinet-chrome.ts` | shell, context bar, pillar nav, action rail |
| `hubGadget` | `components/platform/platform-core-hub-gadget-styles.ts` | pillar cards, golden path, meta badges |
| `platformCoreWorkspace` | list chrome extras | comms/calendar workspace |

### Partial: peer strip shell

- Golden path strips (`hubGadget.goldenPath`) — ✅ wired on CO, DEV attach TZ.
- **Peer strip shell incomplete** — `BrandOpDossierProductionPeerStrip` renders links but no unified `PeerStripShell` component; each peer strip custom layout.
- `PillarCabinetActionRail` uses `hubCabinet.shellActionRail` — ✅.

### Hub matrix

- `platform-core-hub-matrix.ts` — 5×4 cells, demo hrefs SS27/FW27.
- Tooltip = summary + link (per ui-dedup rule).

---

## 14. WORKSPACE

| Role | Cabinet (`*/core`) | Workspace (pillar sections) | Post-publish shop |
|------|-------------------|----------------------------|-------------------|
| **Brand** | ✅ mostly yes — 5 pillars in aside, insight cards compact | ✅ W2 hub, SC publish section, CO registry, OP dossier, comms | n/a |
| **Shop** | ✅ yes after publish — DEV bridge read-only until publish | ✅ showroom, matrix, cart, tracking | gated by `PlatformCorePublishedShowroom` |

### Proposed changes (doc-only, Phase 23)

1. Move **Publish** primary CTA into brand SC hub cabinet pillar card (compact → workspace deep link).
2. Embed **revision** as step 11 inside CO workspace sequential strip.
3. Add **collection comms** entity — new thread kind in messages BFF.
4. Wire **documents-gateway** into brand DEV dossier preview + shop bridge dialog.
5. Introduce **`PeerStripShell`** — shared layout for all golden-path peer strips.
6. Consolidate **EmptyState** + **DataTableContainer** on core workspaces.

---

## 15. Product Gaps (P0/P1/P2) — DO NOT IMPLEMENT

### DEVELOPMENT

| Priority | Gap | Owner pillar |
|----------|-----|--------------|
| P1 | BOM inline on core workspace | development |
| P1 | TZ approval push prod | development |
| P2 | Shop tech pack comments | development |
| P2 | Shop materials view | development |

### SAMPLE COLLECTION

| Priority | Gap | Owner pillar |
|----------|-----|--------------|
| P0 | Publish CTA in hub cabinet | sample_collection |
| P1 | Dedupe export PDF | sample_collection |
| P2 | Pre-publish shop teaser | sample_collection |

### COLLECTION ORDER

| Priority | Gap | Owner pillar |
|----------|-----|--------------|
| P0 | Revision inside 12-step flow | collection_order |
| P1 | Payment prod (Stripe/ЮKassa) | collection_order |
| P2 | Multi ship window | collection_order |

### ORDER PRODUCTION

| Priority | Gap | Owner pillar |
|----------|-----|--------------|
| P0 | QC gate PG write | order_production |
| P0 | Packing list BFF + UI | order_production |
| P0 | Closeout shop cabinet | order_production |
| P1 | Carrier tracking API | order_production |
| P1 | Factory handoff ack complete | order_production |

### COMMUNICATION

| Priority | Gap | Owner pillar |
|----------|-----|--------------|
| P0 | Collection entity threads | comms |
| P1 | Notes workspace live | comms |
| P1 | Push notifications prod | comms |
| P2 | Section groups UI complete | comms |

---

## 16. Final Scores

| Pillar | Brand | Shop | Pillar avg |
|--------|-------|------|------------|
| DEVELOPMENT | 7.6 | 7.4 | **7.5** |
| SAMPLE COLLECTION | 8.0 | 7.6 | **7.8** |
| COLLECTION ORDER | 7.8 | 8.0 | **7.6** |
| ORDER PRODUCTION | 6.8 | 7.0 | **6.9** |
| COMMUNICATION | 7.4 | 7.0 | **7.2** |

**Overall product readiness (brand+shop baseline): 7.4 / 10**

Interpretation:
- **≥8.0** — demo-ready with minor polish (shop CO, brand SC)
- **7.0–7.9** — SS27 walkthrough OK, commercial gaps (DEV, CO, COM)
- **<7.0** — blocker territory (brand OP)

---

## 17. Phase 23 Recommendations

1. **P0 sprint (2 weeks):** OP QC/packing/closeout BFF; CO revision in-flow; SC publish hub CTA; COM collection entity.
2. **UI dedup pass:** run `npm run audit:platform-core-ui` + eliminate duplicate Publish/Approve/Export per §9.
3. **Documents-gateway wiring:** single dossier documents panel brand+shop.
4. **DataTable/EmptyState canonicalization:** design-system only on core-path.
5. **PeerStripShell component:** extract from `BrandOpDossierProductionPeerStrip` pattern.
6. **E2E expansion:** core-200+ golden path revision round-trip; core-201 closeout shop; core-202 collection chat.
7. **Manufacturer/supplier baseline audit** — отдельный Phase 23b (out of scope Phase 22).

---

## 18. Evidence Index

### Readiness & scoring

| File | Purpose |
|------|---------|
| `src/lib/platform-core-readiness-sections/brand-audit.ts` | Brand section scores, good/bad/fix |
| `src/lib/platform-core-readiness-sections/shop-audit.ts` | Shop section scores |
| `src/lib/platform-core-readiness-sections/scoring.ts` | Honest live score derivation |
| `src/lib/platform-core-readiness-sections/index.ts` | Aggregator |

### Hub & routes

| File | Purpose |
|------|---------|
| `src/lib/platform-core-hub-matrix.ts` | 5×4 matrix, demo hrefs |
| `src/lib/platform-core-readiness-routes.ts` | Context hrefs brand/shop/factory |
| `src/lib/platform-core-routes.ts` | Core route constants |
| `src/lib/platform-core-strict-routes.ts` | Legacy escape guard |

### Cabinet chrome & UI dedup

| File | Purpose |
|------|---------|
| `src/lib/platform-core-cabinet-chrome.ts` | `hubCabinet` tokens |
| `src/components/platform/platform-core-hub-gadget-styles.ts` | `hubGadget` tokens |
| `src/lib/platform-core-ui-surfaces.ts` | Surface tier SoT |
| `src/components/platform/PillarCabinetActionRail.tsx` | Action rail |
| `src/components/platform/PlatformCoreContextBar.tsx` | Context bar |

### Pillar components (brand+shop)

| File | Pillar |
|------|--------|
| `src/components/platform/BrandSampleCollectionMini.tsx` | sample_collection |
| `src/components/platform/BrandScPublishReleasePeerStrip.tsx` | sample_collection |
| `src/components/platform/CollectionOrderPillarCard.tsx` | collection_order |
| `src/components/platform/PlatformCorePublishedShowroom.tsx` | sample_collection (shop) |
| `src/components/platform/ShopCoCabinetTrackingEmbed.tsx` | order_production (shop) |
| `src/components/platform/BrandOpDossierProductionPeerStrip.tsx` | order_production |
| `src/components/platform/BrandOpAttachTzPdfPeerStrip.tsx` | development |

### Gateways & dossier

| File | Purpose |
|------|---------|
| `src/lib/platform-core-gateways/documents-gateway.ts` | Documents API (unwired UI) |
| `src/lib/platform-core-gateways/index.ts` | Gateway exports |
| `src/lib/production/workshop2-dossier-phase1.types.ts` | Dossier types |
| `src/lib/production/dossier-readiness-engine.ts` | Approval readiness |

### Design system

| File | Purpose |
|------|---------|
| `src/components/design-system/empty-state.tsx` | Canonical EmptyState |
| `src/components/ui/empty-state.tsx` | Duplicate |
| `src/components/ui/empty-state-b2b.tsx` | B2B duplicate |
| `src/components/design-system/index.ts` | DataTableContainer export |

### Docs & rules

| File | Purpose |
|------|---------|
| `_platform-core-split/platform-core/PLATFORM-CORE-DOC-INDEX.md` | Doc index |
| `_platform-core-split/platform-core/PLATFORM-CORE-ACTION-CONTRACTS.md` | Action contracts |
| `.cursor/rules/platform-core-ui-dedup.mdc` | UI dedup rule |
| `.cursor/rules/platform-core-scope.mdc` | Scope guard |
| `docs/B2B_AND_PRODUCTION_CORE_SPEC.md` | Domain spec |

### E2E (representative)

| Spec | Coverage |
|------|----------|
| `e2e/platform-core-smoke.spec.ts` | Hub matrix |
| core-01…core-104 | DEV/SC/CO golden path |
| core-163, core-185 | Shop DEV bridge |
| core-92 | Responsive cabinet |

---

*Phase 22 complete. Implementation deferred to Phase 23 backlog.*
