# Phase 23 — Platform Core Product Completion Roadmap

**Date:** 2026-07-08  
**Branch (source of truth):** `platform-core-v1-routes-cleanup`  
**Note:** `main` отстаёт — Phase 21/22 docs и guard tests только на feature-ветке. Merge в `main` — отдельный шаг до Phase 23A.

**Prerequisite audit:** `docs/FIVE_PILLARS_AUDIT.md` (product **7.4/10**)

---

## Executive verdict (validated)

| Dimension | Score |
|-----------|-------|
| Architecture (Phase 21) | **8.5** |
| Product logic | **8.0** |
| Demo readiness (SS27) | **8.0** |
| Commercial rollout | **7.0** |
| Weakest pillar | **order_production (6.9)** |

**Golden question:** полный цикл без Excel/WhatsApp/email?  
→ Demo SS27: **partial yes** · Commercial: **no** (until 23A–23D).

**Roles:** brand + shop only · **5 pillars** · no scope expansion.

---

## Pillar scores (Phase 22 baseline)

| Pillar | Score | Priority |
|--------|-------|----------|
| development | 7.5 | 23F (after P0) |
| sample_collection | 7.8 | **23C** |
| collection_order | 7.6 | **23B** |
| order_production | 6.9 | **23A** ← first |
| comms | 7.2 | **23D** |

Cross-cutting polish: **23E** (DataTable, EmptyState, Action Layer, Files).

---

## Phase 23A — Order Production P0 (FIRST)

**Goal:** OP **6.9 → 7.8+** · коммерчески продаваемый fulfillment tail.

### Tasks

| # | Task | Code anchors | Done when |
|---|------|--------------|-----------|
| A1 | QC gate PG write-back | `platform-core-gateways/qc-gateway.ts`, handoff tabs, `brand-production-qc-*` | Status persists PG; blocks handoff in UI |
| A2 | Packing list BFF + UI | `documents-gateway.ts` (`packing_list`), new `/api/platform-core/.../packing-list` | Brand generates; shop downloads |
| A3 | Shop buyer acceptance / closeout | `documents-gateway` stage `closeout`, `shop-co-buyer-tracking`, delivery batch ack | Shop accepts closeout in CO/OP workspace |
| A4 | Unified status ladder | handoff → in_production → QC → packed → shipped → accepted → closed | Same labels brand + shop tracking |
| A5 | Wire documents gateway to UI | `getPlatformCoreDocumentsForArticle`, tracking panel, brand OP handoff | No exported-but-unused gateway |

### Out of scope (23A)
- New roles · WMS integration · payment prod wiring

---

## Phase 23B — Revision inside Collection Order

**Goal:** CO **7.6 → 8.0+** · revision = step in golden path, not side-panel.

### Tasks

| # | Task | Anchors | Done when |
|---|------|---------|-----------|
| B1 | Add revision to 12-step flow | `platform-core-two-role-sections.ts` `PLATFORM_CORE_TWO_ROLE_WHOLESALE_FLOW` | Steps 11–12 include revision |
| B2 | States machine | `revision_requested`, `revision_submitted`, `revision_approved`, `confirmed` | BFF + registry reflect states |
| B3 | Merge working-order / collaborative into CO | `shop-co-working-order`, `shop-co-collaborative-order`, amend panels | Single CO workspace path |
| B4 | Brand + shop same revision status | registry SSE, chain card | No divergent labels |

### Minimal gate (optional stub)
- Credit / payment terms env-gated — no fintech scope creep

---

## Phase 23C — Publish in Sample Collection Hub

**Goal:** SC **7.8 → 8.2+** · publish = primary CTA pillar.

### Tasks

| # | Task | Anchors | Done when |
|---|------|---------|-----------|
| C1 | Publish CTA on brand SC pillar card / hub | `platform-core-hub-matrix-rows.ts`, `SampleCollectionPillarCard` | Hub action + pillar card CTA |
| C2 | Collection readiness checklist | `brand-sc-publish`, release gate, eligible gate | Photo, price, sizes, MOQ, publish |
| C3 | Retire orphan `launchReadiness` route from SC narrative | `ROUTES.brand.launchReadiness`, readiness audit | Redirect or embed in SC section |
| C4 | Canonical linesheet export | one export toolbar pattern | No duplicate PDF paths |

---

## Phase 23D — Collection-level Comms

**Goal:** comms **7.2 → 7.8+** · season thread, not fragment chats.

### Tasks

| # | Task | Anchors | Done when |
|---|------|---------|-----------|
| D1 | `collection` entity in comms model | `entity-comms-gateway.ts` `PlatformCoreEntityType` | Type + BFF schema |
| D2 | Thread kinds: article, collection, order, production | contextual messages store | Create/list by kind |
| D3 | Links from linesheet / showroom / matrix | peer strips, SC + CO sections | One-click open collection thread |
| D4 | Notes PG (defer push) | `brand-cm-notes` fix from audit | Inbox PG-only in core mode |

---

## Phase 23E — Cross-cutting polish (after 23A–23D)

| Item | Target |
|------|--------|
| `PlatformCoreDataTable` | single list chrome for registries |
| `EmptyState` | merge 3 components → `design-system/EmptyState` |
| Action layer | Publish / Approve / Export / Share shared components |
| File gateway | all PC uploads via dossier presign or platform-core BFF |
| PeerStrip shell | migrate remaining ~60 strips to `PlatformCoreSpinePeerStripShell` |

---

## Phase 23F — Development (after commercial P0)

| Item | Notes |
|------|-------|
| Development Progress API | 7 steps: article → tech pack → materials → BOM → sample → approval → ready |
| Ready gate | BOM + sample + signoff + files + materials — not boolean flag |
| BOM/materials in core workspace | reduce legacy W2 exits |
| Shop bridge | read-only + comms clarification (no separate mechanism) |

---

## Execution order (strict)

```
23A (OP P0) → 23B (CO revision) → 23C (SC publish) → 23D (collection comms) → 23E (polish) → 23F (dev API)
```

**Rule:** no new roles · no pillar expansion · no UX redesign — complete existing five pillars.

---

## Git / release strategy

1. **Merge** `platform-core-v1-routes-cleanup` → `main` (PR) before or in parallel with 23A — so Phase 21/22 docs + guards on main.
2. Phase 23 work continues on branch or `platform-core-v23-*` from merged main.
3. Each sub-phase: implement → `core:verify` + targeted e2e → update `FIVE_PILLARS_AUDIT.md` scores → commit.

---

## Success metrics (Phase 23 exit)

| Metric | Now | Target |
|--------|-----|--------|
| Product readiness | 7.4 | **8.2+** |
| order_production | 6.9 | **7.8+** |
| Commercial cycle w/o Excel/WhatsApp | No | **Yes (SS27 + one pilot shop)** |
| Collection comms | none | collection thread live |
| Revision in 12-step | No | Yes |

---

## References

- `docs/FIVE_PILLARS_AUDIT.md`
- `docs/PHASE_21_REPORT.md`
- `docs/PLATFORM_CORE_CONTRACT.md`
- `docs/FASTAPI_PLATFORM_CORE_WRITE_REGISTRY.md`
- `src/lib/platform-core-two-role-sections.ts`
- `src/lib/platform-core-gateways/documents-gateway.ts`
- `src/lib/platform-core-gateways/qc-gateway.ts`
- `src/lib/platform-core-gateways/entity-comms-gateway.ts`
